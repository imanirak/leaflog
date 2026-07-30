-- Closes a broken-object-level-authorization gap: notes, photos, and
-- care_log_entries only checked `auth.uid() = user_id`, not that plant_id
-- actually belongs to that user. A user could attach a note/photo/care-log
-- entry to a plant they don't own (their own user_id stays correct so the
-- old policy allowed it). RLS SELECT was already filtered by user_id so this
-- never leaked data to the other owner, but it let users write rows that
-- reference plants outside their account. Mirrors the ownership check
-- plant_collections already had via its `exists(...)` clause.

drop policy "notes: own rows" on public.notes;
create policy "notes: own rows" on public.notes
  for all using (
    auth.uid() = user_id
    and exists (select 1 from public.plants where plants.id = notes.plant_id and plants.user_id = auth.uid())
  );

drop policy "photos: own rows" on public.photos;
create policy "photos: own rows" on public.photos
  for all using (
    auth.uid() = user_id
    and exists (select 1 from public.plants where plants.id = photos.plant_id and plants.user_id = auth.uid())
  );

drop policy "care_log_entries: own rows" on public.care_log_entries;
create policy "care_log_entries: own rows" on public.care_log_entries
  for all using (
    auth.uid() = user_id
    and exists (select 1 from public.plants where plants.id = care_log_entries.plant_id and plants.user_id = auth.uid())
  );
