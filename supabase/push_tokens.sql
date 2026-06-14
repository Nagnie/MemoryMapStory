-- push_tokens table — Expo push token per user/device (Phase 5D)
create table if not exists public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  token      text not null,
  platform   text not null,
  updated_at timestamptz default now(),
  unique(user_id, token)
);

alter table public.push_tokens enable row level security;

create policy "Users can view own push tokens"
  on push_tokens for select using (auth.uid() = user_id);

create policy "Users can insert own push tokens"
  on push_tokens for insert with check (auth.uid() = user_id);

create policy "Users can update own push tokens"
  on push_tokens for update using (auth.uid() = user_id);

create policy "Users can delete own push tokens"
  on push_tokens for delete using (auth.uid() = user_id);

-- Keep updated_at fresh on upsert
create or replace function public.touch_push_token_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists push_tokens_touch_updated_at on public.push_tokens;
create trigger push_tokens_touch_updated_at
  before update on public.push_tokens
  for each row execute function public.touch_push_token_updated_at();
