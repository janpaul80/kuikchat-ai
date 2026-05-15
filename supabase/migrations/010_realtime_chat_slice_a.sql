-- ============================================================================
-- KuikChat — 010_realtime_chat_slice_a.sql
-- Real-time messaging Slice A:
--   - Cursor-based pagination RPC for messages
--   - Open-or-create direct chat RPC
--   - Auto-mark sender's own message as read on insert
--   - Enable realtime publication for messages
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: get_chat_messages_page
--   Returns a page of messages for a chat, older than `before_ts` if provided.
--   Caller must be a member of the chat (RLS already enforces this on
--   underlying tables, but we re-check defensively here).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_chat_messages_page(
  p_chat_id uuid,
  p_before  timestamptz default null,
  p_limit   int default 30
)
returns setof public.messages
language sql
stable
security definer
set search_path = public
as $$
  select m.*
  from public.messages m
  where m.chat_id = p_chat_id
    and (p_before is null or m.created_at < p_before)
    and exists (
      select 1
      from public.chat_members cm
      where cm.chat_id = p_chat_id
        and cm.user_id = auth.uid()
    )
  order by m.created_at desc
  limit greatest(1, least(coalesce(p_limit, 30), 100));
$$;

grant execute on function public.get_chat_messages_page(uuid, timestamptz, int) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: upsert_direct_chat
--   Returns the existing direct chat between auth.uid() and other_user, or
--   creates a new one (and adds both members) if it doesn't exist.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.upsert_direct_chat(p_other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me      uuid := auth.uid();
  v_chat_id uuid;
begin
  if v_me is null then
    raise exception 'Not authenticated';
  end if;

  if p_other is null or p_other = v_me then
    raise exception 'Invalid target user';
  end if;

  -- Find an existing direct chat that contains both users (and only them)
  select c.id
    into v_chat_id
  from public.chats c
  join public.chat_members m1 on m1.chat_id = c.id and m1.user_id = v_me
  join public.chat_members m2 on m2.chat_id = c.id and m2.user_id = p_other
  where c.type = 'direct'
  group by c.id
  having count(*) >= 2
  limit 1;

  if v_chat_id is not null then
    return v_chat_id;
  end if;

  -- Create the chat
  insert into public.chats (type, created_by)
  values ('direct', v_me)
  returning id into v_chat_id;

  -- Add both members
  insert into public.chat_members (chat_id, user_id, role)
  values
    (v_chat_id, v_me,    'member'),
    (v_chat_id, p_other, 'member')
  on conflict (chat_id, user_id) do nothing;

  return v_chat_id;
end;
$$;

grant execute on function public.upsert_direct_chat(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: auto-mark sender as having read their own message
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.mark_sender_message_read()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender_id is not null then
    insert into public.message_reads (message_id, user_id, read_at)
    values (new.id, new.sender_id, new.created_at)
    on conflict (message_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists messages_mark_sender_read on public.messages;
create trigger messages_mark_sender_read
  after insert on public.messages
  for each row execute function public.mark_sender_message_read();

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime: ensure messages and chat_members are in the realtime publication
-- so postgres_changes subscriptions deliver INSERT events.
-- (Safe to re-run; alter is wrapped in a DO block.)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  -- create publication if absent (Supabase normally provides supabase_realtime)
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  -- add messages
  begin
    execute 'alter publication supabase_realtime add table public.messages';
  exception when duplicate_object then
    -- already in publication
    null;
  end;

  -- add chat_members (helps the chat list update when added to a chat)
  begin
    execute 'alter publication supabase_realtime add table public.chat_members';
  exception when duplicate_object then
    null;
  end;

  -- add chats (last_message_at updates)
  begin
    execute 'alter publication supabase_realtime add table public.chats';
  exception when duplicate_object then
    null;
  end;
end $$;
