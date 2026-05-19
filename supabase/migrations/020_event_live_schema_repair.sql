-- ============================================================================
-- KuikChat: Live event schema repair
-- Fixes legacy event columns that can block create_event_with_message.
-- ============================================================================

alter table if exists public.events
  add column if not exists message_id uuid references public.messages(id) on delete cascade;

alter table if exists public.events
  add column if not exists start_time timestamptz;

alter table if exists public.events
  add column if not exists end_time timestamptz;

alter table if exists public.events
  add column if not exists meeting_link text;

alter table if exists public.events
  add column if not exists timezone text;

alter table if exists public.events
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'starts_at'
  ) then
    execute 'update public.events set start_time = starts_at where start_time is null and starts_at is not null';
    execute 'alter table public.events alter column starts_at drop not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'ends_at'
  ) then
    execute 'update public.events set end_time = ends_at where end_time is null and ends_at is not null';
    execute 'alter table public.events alter column ends_at drop not null';
  end if;
end;
$$;

update public.events
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table if exists public.event_rsvps
  add column if not exists updated_at timestamptz default now();

update public.event_rsvps
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table if exists public.event_rsvps
  drop constraint if exists event_rsvps_status_check;

update public.event_rsvps
set status = 'declined'
where status = 'not_going';

update public.event_rsvps
set status = 'going'
where status is null;

alter table if exists public.event_rsvps
  add constraint event_rsvps_status_check
  check (status in ('going', 'maybe', 'declined'));

alter table if exists public.event_rsvps
  alter column status set default 'going';

alter table if exists public.event_rsvps
  alter column status set not null;

grant select, insert, update on public.events to authenticated;
grant select, insert, update, delete on public.event_rsvps to authenticated;

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

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

drop trigger if exists event_rsvps_updated_at on public.event_rsvps;
create trigger event_rsvps_updated_at
  before update on public.event_rsvps
  for each row execute function public.touch_updated_at();

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
  v_event_id uuid;
begin
  if not exists (
    select 1 from public.chat_members
    where chat_id = p_chat_id
      and user_id = p_sender_id
  ) then
    raise exception 'User is not a member of this chat';
  end if;

  insert into public.messages (chat_id, sender_id, type, body)
  values (p_chat_id, p_sender_id, 'event', 'Event: ' || p_title)
  returning * into v_msg;

  begin
    insert into public.events (
      message_id,
      chat_id,
      title,
      description,
      location,
      start_time,
      end_time,
      meeting_link,
      timezone,
      created_by
    )
    values (
      v_msg.id,
      p_chat_id,
      p_title,
      p_description,
      p_location,
      p_start_time,
      p_end_time,
      p_meeting_link,
      p_timezone,
      p_sender_id
    )
    returning id into v_event_id;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'events'
        and column_name = 'starts_at'
    ) then
      execute 'update public.events set starts_at = $1, ends_at = $2 where id = $3'
      using p_start_time, p_end_time, v_event_id;
    end if;
  exception when others then
    delete from public.messages where id = v_msg.id;
    raise;
  end;

  return v_msg;
end;
$$;

grant execute on function public.create_event_with_message(
  uuid,
  uuid,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  text,
  text
) to authenticated;
