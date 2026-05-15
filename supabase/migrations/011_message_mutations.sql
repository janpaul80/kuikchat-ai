-- ============================================================================
-- KuikChat — 011_message_mutations.sql (Slice B)
--
--   Adds server-authoritative RPCs for:
--     - edit_message          (sender only, 15-minute window)
--     - delete_message_for_me (per-user hide — NOT visible to others)
--     - delete_message_for_everyone (sender or admin — tombstone)
--     - toggle_message_reaction (emoji add/remove, idempotent)
--
--   Also:
--     - Adds messages.deleted_by_user_ids (uuid[]) for per-user soft-hide
--     - Replaces messages SELECT RLS to auto-filter deleted_by_user_ids
--     - Puts message_reactions + message_reads on realtime publication
--       so UIs can live-update.
--
--   Safe to re-run. All CREATE FUNCTION uses CREATE OR REPLACE.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Schema: per-user "delete for me" without a separate table
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.messages
  add column if not exists deleted_by_user_ids uuid[] not null default '{}';

create index if not exists messages_deleted_by_user_ids_idx
  on public.messages using gin (deleted_by_user_ids);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RLS: refresh SELECT policy to hide messages the current user deleted
--    for themselves. Membership check is preserved.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "messages_select_member" on public.messages;
create policy "messages_select_member" on public.messages
  for select using (
    public.is_chat_member(chat_id)
    and not (auth.uid() = any (coalesce(deleted_by_user_ids, '{}'::uuid[])))
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RPC: edit_message
--    Rules: caller is sender, not already deleted_for_everyone, within 15 min
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.edit_message(
  p_message_id uuid,
  p_new_body   text
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.messages;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_row from public.messages where id = p_message_id;

  if not found then
    raise exception 'message_not_found' using errcode = 'P0002';
  end if;

  if v_row.sender_id is distinct from v_uid then
    raise exception 'not_sender' using errcode = '42501';
  end if;

  if coalesce(v_row.deleted_for_everyone, false) then
    raise exception 'deleted' using errcode = '22023';
  end if;

  if v_row.created_at < now() - interval '15 minutes' then
    raise exception 'edit_window_expired' using errcode = '22023';
  end if;

  update public.messages
  set body       = p_new_body,
      edited_at  = now()
  where id = p_message_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.edit_message(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RPC: delete_message_for_me
--    Appends auth.uid() to deleted_by_user_ids (idempotent).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.delete_message_for_me(
  p_message_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_chat_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select chat_id into v_chat_id from public.messages where id = p_message_id;
  if v_chat_id is null then
    raise exception 'message_not_found' using errcode = 'P0002';
  end if;

  if not public.is_chat_member(v_chat_id) then
    raise exception 'not_member' using errcode = '42501';
  end if;

  update public.messages
  set deleted_by_user_ids = (
    select array(
      select distinct unnest(coalesce(deleted_by_user_ids, '{}'::uuid[]) || array[v_uid])
    )
  )
  where id = p_message_id;
end;
$$;

grant execute on function public.delete_message_for_me(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RPC: delete_message_for_everyone
--    Sender OR chat admin; marks deleted_for_everyone + clears body.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.delete_message_for_everyone(
  p_message_id uuid
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.messages;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_row from public.messages where id = p_message_id;
  if not found then
    raise exception 'message_not_found' using errcode = 'P0002';
  end if;

  if v_row.sender_id is distinct from v_uid
     and not public.is_chat_admin(v_row.chat_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  update public.messages
  set deleted_for_everyone = true,
      deleted_at           = now(),
      body                 = null,
      formatted_body       = null
  where id = p_message_id
  returning * into v_row;

  -- Wipe attachments/reactions/reads for this message
  delete from public.message_attachments where message_id = p_message_id;
  delete from public.message_reactions  where message_id = p_message_id;

  return v_row;
end;
$$;

grant execute on function public.delete_message_for_everyone(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RPC: toggle_message_reaction
--    If (message, user, emoji) exists → delete, else → insert.
--    Returns the final state: 'added' or 'removed'.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.toggle_message_reaction(
  p_message_id uuid,
  p_emoji      text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_chat_id uuid;
  v_existing uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_emoji is null or length(p_emoji) = 0 or length(p_emoji) > 16 then
    raise exception 'bad_emoji' using errcode = '22023';
  end if;

  select chat_id into v_chat_id from public.messages where id = p_message_id;
  if v_chat_id is null then
    raise exception 'message_not_found' using errcode = 'P0002';
  end if;
  if not public.is_chat_member(v_chat_id) then
    raise exception 'not_member' using errcode = '42501';
  end if;

  select id into v_existing
  from public.message_reactions
  where message_id = p_message_id
    and user_id    = v_uid
    and emoji      = p_emoji;

  if v_existing is not null then
    delete from public.message_reactions where id = v_existing;
    return 'removed';
  end if;

  insert into public.message_reactions (message_id, user_id, emoji)
  values (p_message_id, v_uid, p_emoji);

  return 'added';
end;
$$;

grant execute on function public.toggle_message_reaction(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Realtime publication — add reactions + reads
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  begin
    execute 'alter publication supabase_realtime add table public.message_reactions';
  exception when duplicate_object then null;
  end;

  begin
    execute 'alter publication supabase_realtime add table public.message_reads';
  exception when duplicate_object then null;
  end;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Realtime: make UPDATE events expose the FULL row (not just PK) for
--    messages — needed so clients can see edited_at / body changes.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.messages replica identity full;
