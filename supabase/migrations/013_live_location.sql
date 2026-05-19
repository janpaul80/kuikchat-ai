-- ============================================================================
-- KuikChat — 013_live_location.sql
-- Live Location Sharing Session Management
-- ============================================================================

create table if not exists public.live_location_sessions (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid not null references public.messages(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  chat_id         uuid not null references public.chats(id) on delete cascade,
  latitude        float8 not null,
  longitude       float8 not null,
  is_active       boolean default true,
  expires_at      timestamptz not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Indices for performance
create index if not exists live_location_sessions_chat_idx on public.live_location_sessions (chat_id);
create index if not exists live_location_sessions_active_idx on public.live_location_sessions (is_active, expires_at);

-- Explicit Data API grants. RLS still controls row-level access.
grant select, insert, update on public.live_location_sessions to authenticated;

-- RLS
alter table public.live_location_sessions enable row level security;

drop policy if exists "Users can view live locations in their chats" on public.live_location_sessions;
drop policy if exists "Users can start their own live location" on public.live_location_sessions;
drop policy if exists "Users can update their own live location" on public.live_location_sessions;

create policy "Users can view live locations in their chats"
  on public.live_location_sessions for select
  using (
    exists (
      select 1 from public.chat_members
      where chat_id = live_location_sessions.chat_id
      and user_id = auth.uid()
    )
  );

create policy "Users can start their own live location"
  on public.live_location_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own live location"
  on public.live_location_sessions for update
  using (auth.uid() = user_id);

-- Realtime
do $$
begin
  execute 'alter publication supabase_realtime add table public.live_location_sessions';
exception when others then
  -- handle if already added or publication doesn't exist
  null;
end;
$$;

-- Trigger to update updated_at
drop trigger if exists live_location_sessions_updated_at on public.live_location_sessions;
create trigger live_location_sessions_updated_at
  before update on public.live_location_sessions
  for each row execute function public.touch_updated_at();
