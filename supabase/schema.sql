-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (public-facing)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_storage_path text,
  is_public boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Plants table
create table public.plants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  species text,
  room text,
  date_acquired date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tags per plant (arbitrary user-defined, many per plant)
create table public.plant_tags (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid references public.plants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  tag text not null,
  created_at timestamptz default now() not null,
  unique(plant_id, tag)
);

-- Photos
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid references public.plants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  is_shared boolean default false not null,
  shared_at timestamptz,
  taken_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

-- Notes
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid references public.plants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User-defined collections (groups of plants)
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

-- Many-to-many: plants <-> collections
create table public.plant_collections (
  plant_id uuid references public.plants(id) on delete cascade not null,
  collection_id uuid references public.collections(id) on delete cascade not null,
  primary key (plant_id, collection_id)
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger plants_updated_at before update on public.plants
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.plants enable row level security;
alter table public.plant_tags enable row level security;
alter table public.photos enable row level security;
alter table public.notes enable row level security;
alter table public.collections enable row level security;
alter table public.plant_collections enable row level security;

-- Profiles: own row full access; anyone can read public profiles
create policy "profiles: own full access" on public.profiles for all using (auth.uid() = id);
create policy "profiles: public read" on public.profiles for select using (is_public = true);

-- Private data: users only see their own
create policy "plants: own rows" on public.plants for all using (auth.uid() = user_id);
create policy "plant_tags: own rows" on public.plant_tags for all using (auth.uid() = user_id);
create policy "notes: own rows" on public.notes for all using (auth.uid() = user_id);
create policy "collections: own rows" on public.collections for all using (auth.uid() = user_id);
create policy "plant_collections: own rows" on public.plant_collections
  for all using (
    exists (
      select 1 from public.plants
      where plants.id = plant_collections.plant_id
        and plants.user_id = auth.uid()
    )
  );

-- Photos: own rows always; shared photos readable by anyone if profile is public
create policy "photos: own rows" on public.photos for all using (auth.uid() = user_id);
create policy "photos: public shared read" on public.photos for select using (
  is_shared = true
  and exists (
    select 1 from public.profiles
    where profiles.id = photos.user_id
      and profiles.is_public = true
  )
);

-- Storage bucket for plant photos (private by default)
insert into storage.buckets (id, name, public) values ('plant-photos', 'plant-photos', false);

create policy "photos: upload own" on storage.objects
  for insert with check (bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "photos: read own" on storage.objects
  for select using (bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "photos: delete own" on storage.objects
  for delete using (bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket (public read so profile images load without auth)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "avatars: upload own" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars: update own" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Shared photo public read: signed URL via API route (covered by RLS above)
-- Indexes
create index profiles_username_idx on public.profiles(username);
create index plants_user_id_idx on public.plants(user_id);
create index plants_room_idx on public.plants(user_id, room);
create index photos_plant_id_idx on public.photos(plant_id, taken_at desc);
create index photos_shared_idx on public.photos(user_id, is_shared, shared_at desc);
create index notes_plant_id_idx on public.notes(plant_id, created_at desc);
create index plant_tags_plant_id_idx on public.plant_tags(plant_id);
create index plant_tags_user_tag_idx on public.plant_tags(user_id, tag);
