-- ============================================================================
-- KuikChat — 014_events.sql
-- Event Scheduling & RSVP System
-- ============================================================================

create table if not exists public.events (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid references public.messages(id) on delete cascade,
  chat_id         uuid references public.chats(id) on delete cascade,
  title           text not null,
  description     text,
  location        text,
  start_time      timestamptz,
  end_time        timestamptz,
  meeting_link    text,
  timezone        text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Reconcile the legacy events table created in 003_groups_communities.sql.
alter table public.events
  add column if not exists message_id uuid references public.messages(id) on delete cascade;

alter table public.events
  add column if not exists start_time timestamptz;

alter table public.events
  add column if not exists end_time timestamptz;

alter table public.events
  add column if not exists meeting_link text;

alter table public.events
  add column if not exists timezone text;

alter table public.events
  add column if not exists updated_at timestamptz default now();

update public.events
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'starts_at'
  ) then
    execute 'update public.events set start_time = starts_at where start_time is null and starts_at is not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'ends_at'
  ) then
    execute 'update public.events set end_time = ends_at where end_time is null and ends_at is not null';
  end if;
end;
$$;

-- Indices for performance
create index if not exists events_chat_idx on public.events (chat_id);
create index if not exists events_message_idx on public.events (message_id);

-- RLS
alter table public.events enable row level security;

drop policy if exists "Users can view events in their chats" on public.events;
drop policy if exists "Users can create events in their chats" on public.events;

create policy "Users can view events in their chats"
  on public.events for select
  using (
    exists (
      select 1 from public.chat_members
      where chat_id = events.chat_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create events in their chats"
  on public.events for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.chat_members
      where chat_id = events.chat_id
      and user_id = auth.uid()
    )
  );

-- RSVP Table
create table if not exists public.event_rsvps (
  id              uuid primary key default uuid_generate_v4(),
  event_id        uuid not null references public.events(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          text not null check (status in ('going', 'maybe', 'declined')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(event_id, user_id)
);

alter table public.event_rsvps
  add column if not exists created_at timestamptz default now();

alter table public.event_rsvps
  add column if not exists updated_at timestamptz default now();

update public.event_rsvps
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.event_rsvps
  drop constraint if exists event_rsvps_status_check;

update public.event_rsvps
set status = 'declined'
where status = 'not_going';

update public.event_rsvps
set status = 'going'
where status is null;

alter table public.event_rsvps
  add constraint event_rsvps_status_check
  check (status in ('going', 'maybe', 'declined'));

alter table public.event_rsvps
  alter column status set default 'going';

alter table public.event_rsvps
  alter column status set not null;

create index if not exists event_rsvps_event_idx on public.event_rsvps (event_id);

-- Explicit Data API grants. RLS still controls row-level access.
grant select, insert, update on public.events to authenticated;
grant select, insert, update, delete on public.event_rsvps to authenticated;

-- RLS for RSVPs
alter table public.event_rsvps enable row level security;

drop policy if exists "Users can view RSVPs for accessible events" on public.event_rsvps;
drop policy if exists "Users can insert/update their own RSVPs" on public.event_rsvps;

create policy "Users can view RSVPs for accessible events"
  on public.event_rsvps for select
  using (
    exists (
      select 1 from public.events e
      join public.chat_members m on m.chat_id = e.chat_id
      where e.id = event_rsvps.event_id
      and m.user_id = auth.uid()
    )
  );

create policy "Users can insert/update their own RSVPs"
  on public.event_rsvps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Realtime
do $$
begin
  execute 'alter publication supabase_realtime add table public.events';
exception when others then
  null;
end;
$$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.event_rsvps';
exception when others then
  null;
end;
$$;

-- Trigger to update updated_at
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

drop trigger if exists event_rsvps_updated_at on public.event_rsvps;
create trigger event_rsvps_updated_at
  before update on public.event_rsvps
  for each row execute function public.touch_updated_at();

-- RPC for event creation and rollback
create or replace function public.create_event_with_message(
  p_chat_id uuid,
  p_sender_id uuid,
  p_title text,
  p_description text,
  p_location text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_meeting_link text default null,
  p_timezone text default null
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg public.messages;
begin
  -- Ensure sender is in chat
  if not exists (select 1 from public.chat_members where chat_id = p_chat_id and user_id = p_sender_id) then
    raise exception 'User is not a member of this chat';
  end if;

  -- Insert message
  insert into public.messages (chat_id, sender_id, type, body)
  values (p_chat_id, p_sender_id, 'event', 'Event: ' || p_title)
  returning * into v_msg;

  -- Insert event
  begin
    insert into public.events (message_id, chat_id, title, description, location, start_time, end_time, meeting_link, timezone, created_by)
    values (v_msg.id, p_chat_id, p_title, p_description, p_location, p_start_time, p_end_time, p_meeting_link, p_timezone, p_sender_id);
  exception when others then
    -- Rollback message on failure
    delete from public.messages where id = v_msg.id;
    raise;
  end;

  return v_msg;
end;
$$;

grant execute on function public.create_event_with_message(uuid, uuid, text, text, text, timestamptz, timestamptz, text, text) to authenticated;
