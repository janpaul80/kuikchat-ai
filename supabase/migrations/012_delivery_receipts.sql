-- ============================================================================
-- KuikChat — 012_delivery_receipts.sql (Slice B)
--
--   Read-receipt helpers:
--     - mark_chat_as_read(p_chat_id)  -- bulk inserts message_reads for every
--                                        unread message in the chat (excluding
--                                        the caller's own messages which are
--                                        auto-marked by the 010 trigger) and
--                                        updates chat_members.last_read_at +
--                                        resets unread_count.
--
--   Safe to re-run.
-- ============================================================================

create or replace function public.mark_chat_as_read(
  p_chat_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_inserted  int  := 0;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not public.is_chat_member(p_chat_id) then
    raise exception 'not_member' using errcode = '42501';
  end if;

  -- Insert a read receipt for every unread message (other people's messages
  -- that this user hasn't yet marked read).
  with to_mark as (
    select m.id
    from public.messages m
    where m.chat_id = p_chat_id
      and m.sender_id is distinct from v_uid
      and coalesce(m.deleted_for_everyone, false) = false
      and not (v_uid = any (coalesce(m.deleted_by_user_ids, '{}'::uuid[])))
      and not exists (
        select 1 from public.message_reads r
        where r.message_id = m.id and r.user_id = v_uid
      )
  ),
  ins as (
    insert into public.message_reads (message_id, user_id, read_at)
    select id, v_uid, now() from to_mark
    on conflict (message_id, user_id) do nothing
    returning 1
  )
  select count(*) into v_inserted from ins;

  -- Reset membership counters
  update public.chat_members
  set unread_count  = 0,
      last_read_at  = now()
  where chat_id = p_chat_id and user_id = v_uid;

  return v_inserted;
end;
$$;

grant execute on function public.mark_chat_as_read(uuid) to authenticated;
