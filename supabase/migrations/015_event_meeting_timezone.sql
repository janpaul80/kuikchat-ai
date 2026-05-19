-- ============================================================================
-- KuikChat: Add meeting_link and timezone to events
-- ============================================================================

alter table if exists public.events
  add column if not exists meeting_link text;

alter table if exists public.events
  add column if not exists timezone text;

-- Update create_event_with_message RPC to accept meeting_link and timezone
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
