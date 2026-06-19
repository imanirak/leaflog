-- Add username_changed_at to track cooldown
alter table public.profiles add column if not exists username_changed_at timestamptz;
