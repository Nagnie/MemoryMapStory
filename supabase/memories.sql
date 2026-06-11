-- memories table
create table if not exists public.memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  image_url   text not null,
  latitude    float8 not null,
  longitude   float8 not null,
  caption     text,
  mood_tag    text check (mood_tag in ('happy', 'nostalgic', 'excited', 'peaceful', 'sad')),
  is_public   boolean default false,
  created_at  timestamptz default now()
);

alter table public.memories enable row level security;

create policy "Users can view own memories"
  on memories for select using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on memories for insert with check (auth.uid() = user_id);

create policy "Users can update own memories"
  on memories for update using (auth.uid() = user_id);

create policy "Users can delete own memories"
  on memories for delete using (auth.uid() = user_id);

-- Storage bucket for memory images
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict do nothing;

create policy "Anyone can view memory images"
  on storage.objects for select using (bucket_id = 'memories');

create policy "Users can upload own memory images"
  on storage.objects for insert
  with check (bucket_id = 'memories' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own memory images"
  on storage.objects for delete
  using (bucket_id = 'memories' and auth.uid()::text = (storage.foldername(name))[1]);
