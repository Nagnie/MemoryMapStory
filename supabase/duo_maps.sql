-- duo_maps: one shared map per pair of users
create table if not exists public.duo_maps (
  id          uuid primary key default gen_random_uuid(),
  invite_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_at  timestamptz default now()
);

-- Each user can only be in one duo map (unique on user_id)
create table if not exists public.duo_map_members (
  id          uuid primary key default gen_random_uuid(),
  duo_map_id  uuid references public.duo_maps(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  joined_at   timestamptz default now(),
  unique(duo_map_id, user_id),
  unique(user_id)
);

-- One emoji reaction per user per memory
create table if not exists public.reactions (
  id          uuid primary key default gen_random_uuid(),
  memory_id   uuid references public.memories(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  emoji       text not null,
  created_at  timestamptz default now(),
  unique(memory_id, user_id)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.duo_maps enable row level security;
alter table public.duo_map_members enable row level security;
alter table public.reactions enable row level security;

-- Helper: current user's duo_map_id
create or replace function public.my_duo_map_id()
returns uuid language sql security definer stable as $$
  select duo_map_id from public.duo_map_members where user_id = auth.uid() limit 1;
$$;

-- duo_maps: members can view their own map
create policy "Members can view their duo map"
  on duo_maps for select
  using (id = my_duo_map_id());

-- duo_map_members: members can view others in their map
create policy "Members can view duo map members"
  on duo_map_members for select
  using (duo_map_id = my_duo_map_id());

create policy "Users can leave their duo map"
  on duo_map_members for delete
  using (auth.uid() = user_id);

-- reactions: duo members can view reactions on memories they can access
create policy "Duo members can view reactions"
  on reactions for select
  using (
    auth.uid() = user_id
    or (
      my_duo_map_id() is not null
      and exists (
        select 1 from public.memories m
        where m.id = reactions.memory_id
          and exists (
            select 1 from public.duo_map_members
            where duo_map_id = my_duo_map_id() and user_id = m.user_id
          )
      )
    )
  );

create policy "Users can insert own reactions"
  on reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reactions"
  on reactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on reactions for delete
  using (auth.uid() = user_id);

-- Allow duo partners to view each other's profiles
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own and partner profiles"
  on profiles for select
  using (
    auth.uid() = id
    or (
      my_duo_map_id() is not null
      and exists (
        select 1 from public.duo_map_members
        where duo_map_id = my_duo_map_id() and user_id = profiles.id
      )
    )
  );

-- Allow duo partners to view each other's memories
drop policy if exists "Users can view own memories" on memories;
create policy "Users can view own and duo partner memories"
  on memories for select
  using (
    auth.uid() = user_id
    or (
      my_duo_map_id() is not null
      and exists (
        select 1 from public.duo_map_members
        where duo_map_id = my_duo_map_id() and user_id = memories.user_id
      )
    )
  );

-- ── RPC functions ─────────────────────────────────────────────────────────────

-- Create a new duo map and add current user as first member
create or replace function public.create_duo_map()
returns json language plpgsql security definer as $$
declare
  v_id          uuid;
  v_invite_code text;
begin
  if exists (select 1 from public.duo_map_members where user_id = auth.uid()) then
    return json_build_object('error', 'already_in_duo_map');
  end if;

  insert into public.duo_maps default values
  returning id, invite_code into v_id, v_invite_code;

  insert into public.duo_map_members (duo_map_id, user_id)
  values (v_id, auth.uid());

  return json_build_object('id', v_id, 'invite_code', v_invite_code);
end;
$$;

-- Join an existing duo map by invite code
create or replace function public.join_duo_map(p_invite_code text)
returns json language plpgsql security definer as $$
declare
  v_duo_map_id  uuid;
  v_member_count int;
begin
  select id into v_duo_map_id
  from public.duo_maps
  where invite_code = upper(trim(p_invite_code));

  if v_duo_map_id is null then
    return json_build_object('error', 'invalid_code');
  end if;

  select count(*) into v_member_count
  from public.duo_map_members
  where duo_map_id = v_duo_map_id;

  if v_member_count >= 2 then
    return json_build_object('error', 'map_full');
  end if;

  if exists (select 1 from public.duo_map_members where user_id = auth.uid()) then
    return json_build_object('error', 'already_in_duo_map');
  end if;

  insert into public.duo_map_members (duo_map_id, user_id)
  values (v_duo_map_id, auth.uid());

  return json_build_object('duo_map_id', v_duo_map_id);
end;
$$;

-- ── Realtime ──────────────────────────────────────────────────────────────────

do $$ begin
  alter publication supabase_realtime add table public.memories;
exception when others then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.reactions;
exception when others then null;
end $$;
