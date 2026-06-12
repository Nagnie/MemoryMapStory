-- Phase 5A: reverse geocoding — human-readable place name for each memory
alter table public.memories add column if not exists place_name text;
