-- Care log entries: watering, fertilizing, repotting, pruning, misting, etc.
create table public.care_log_entries (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid references public.plants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('watered', 'fertilized', 'repotted', 'pruned', 'misted', 'rotated', 'other')),
  note text,
  logged_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.care_log_entries enable row level security;

create policy "care_log_entries: own rows" on public.care_log_entries for all using (auth.uid() = user_id);

create index care_log_entries_plant_idx on public.care_log_entries(plant_id, logged_at desc);
create index care_log_entries_user_idx on public.care_log_entries(user_id, logged_at desc);
