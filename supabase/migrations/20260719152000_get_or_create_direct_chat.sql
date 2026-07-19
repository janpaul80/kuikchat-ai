-- Atomic direct-chat resolver for the production chats + chat_members + messages model.
-- Uses profiles.id as the membership identity and never creates parallel conversation tables.

CREATE OR REPLACE FUNCTION public.get_or_create_direct_chat(target_profile_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile_id uuid;
  first_profile_id uuid;
  second_profile_id uuid;
  existing_chat_id uuid;
  new_chat_id uuid;
  lock_key bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  SELECT id
  INTO current_profile_id
  FROM public.profiles
  WHERE id = auth.uid();

  IF current_profile_id IS NULL THEN
    RAISE EXCEPTION 'Current profile not found' USING ERRCODE = 'P0002';
  END IF;

  IF target_profile_id IS NULL THEN
    RAISE EXCEPTION 'Target profile is required' USING ERRCODE = '22004';
  END IF;

  IF target_profile_id = current_profile_id THEN
    RAISE EXCEPTION 'Cannot start a direct chat with yourself' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_profile_id) THEN
    RAISE EXCEPTION 'Target profile not found' USING ERRCODE = 'P0002';
  END IF;

  IF current_profile_id::text < target_profile_id::text THEN
    first_profile_id := current_profile_id;
    second_profile_id := target_profile_id;
  ELSE
    first_profile_id := target_profile_id;
    second_profile_id := current_profile_id;
  END IF;

  -- Prevent duplicate direct chats under repeated clicks/concurrent creation.
  lock_key := hashtextextended(first_profile_id::text || ':' || second_profile_id::text, 0);
  PERFORM pg_advisory_xact_lock(lock_key);

  SELECT cm1.chat_id
  INTO existing_chat_id
  FROM public.chat_members cm1
  JOIN public.chat_members cm2 ON cm2.chat_id = cm1.chat_id
  JOIN public.chats c ON c.id = cm1.chat_id
  WHERE c.type = 'direct'
    AND cm1.user_id = current_profile_id
    AND cm2.user_id = target_profile_id
  ORDER BY c.created_at ASC
  LIMIT 1;

  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;

  INSERT INTO public.chats (type, created_by)
  VALUES ('direct', current_profile_id)
  RETURNING id INTO new_chat_id;

  INSERT INTO public.chat_members (chat_id, user_id, role)
  VALUES
    (new_chat_id, current_profile_id, 'member'),
    (new_chat_id, target_profile_id, 'member')
  ON CONFLICT (chat_id, user_id) DO NOTHING;

  RETURN new_chat_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_direct_chat(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_chat(uuid) TO authenticated;
