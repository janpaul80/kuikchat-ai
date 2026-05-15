-- ============================================================================
-- KuikChat — 009_storage_buckets.sql
-- Supabase Storage buckets + access policies
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Create buckets (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- NOTE: file_size_limit is bigint. We cast the first factor to bigint so
  -- the multiplication happens in 64-bit arithmetic — otherwise literals like
  -- `2048 * 1024 * 1024` overflow Postgres integer (max 2,147,483,647) and
  -- raise "22003: integer out of range". 1 MiB = 1024 * 1024 bytes.
  ('avatars',     'avatars',     true,  10::bigint   * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/gif']),
  ('banners',     'banners',     true,  20::bigint   * 1024 * 1024, array['image/png','image/jpeg','image/webp']),
  ('attachments', 'attachments', false, 2048::bigint * 1024 * 1024, null),  -- 2 GiB per chat blueprint
  ('voice',       'voice',       false, 50::bigint   * 1024 * 1024, array['audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav']),
  ('status',      'status',      false, 100::bigint  * 1024 * 1024, null),
  ('stickers',    'stickers',    true,  5::bigint    * 1024 * 1024, array['image/png','image/webp','application/json']),
  ('wallpapers',  'wallpapers',  false, 20::bigint   * 1024 * 1024, array['image/png','image/jpeg','image/webp']),
  ('channel-media','channel-media', true, 500::bigint * 1024 * 1024, null),
  ('catalog',     'catalog',     true,  20::bigint   * 1024 * 1024, array['image/png','image/jpeg','image/webp']),
  ('invoices',    'invoices',    false, 10::bigint   * 1024 * 1024, array['application/pdf']),
  ('recordings',  'recordings',  false, 5000::bigint * 1024 * 1024, null)  -- ~5 GiB for call recordings
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- AVATARS — public read, owner write
-- File path: {user_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- BANNERS — same pattern
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "banners_public_read" on storage.objects;
create policy "banners_public_read" on storage.objects
  for select using (bucket_id = 'banners');

drop policy if exists "banners_owner_write" on storage.objects;
create policy "banners_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'banners'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "banners_owner_modify" on storage.objects;
create policy "banners_owner_modify" on storage.objects
  for update using (bucket_id = 'banners' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────────────────────────────────────
-- ATTACHMENTS — chat members only
-- File path: {chat_id}/{message_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "attachments_member_read" on storage.objects;
create policy "attachments_member_read" on storage.objects
  for select using (
    bucket_id = 'attachments'
    and public.is_chat_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "attachments_member_write" on storage.objects;
create policy "attachments_member_write" on storage.objects
  for insert with check (
    bucket_id = 'attachments'
    and public.is_chat_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "attachments_owner_delete" on storage.objects;
create policy "attachments_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'attachments'
    and auth.uid() = owner
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- VOICE messages — same pattern as attachments
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "voice_member_read" on storage.objects;
create policy "voice_member_read" on storage.objects
  for select using (
    bucket_id = 'voice'
    and public.is_chat_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "voice_member_write" on storage.objects;
create policy "voice_member_write" on storage.objects
  for insert with check (
    bucket_id = 'voice'
    and public.is_chat_member(((storage.foldername(name))[1])::uuid)
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- STATUS — visible to allowed audience (we trust app-layer to filter)
-- File path: {user_id}/{status_id}.ext
-- Public-ish: signed URLs from server
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "status_authed_read" on storage.objects;
create policy "status_authed_read" on storage.objects
  for select using (bucket_id = 'status' and auth.uid() is not null);

drop policy if exists "status_owner_write" on storage.objects;
create policy "status_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'status'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "status_owner_delete" on storage.objects;
create policy "status_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'status'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- STICKERS — public read, owner write (creator-uploaded)
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "stickers_public_read" on storage.objects;
create policy "stickers_public_read" on storage.objects
  for select using (bucket_id = 'stickers');

drop policy if exists "stickers_owner_write" on storage.objects;
create policy "stickers_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'stickers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- WALLPAPERS — owner only (private)
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "wallpapers_owner_all" on storage.objects;
create policy "wallpapers_owner_all" on storage.objects
  for all using (
    bucket_id = 'wallpapers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANNEL-MEDIA — public read (or premium-gated at app layer), owner write
-- File path: {channel_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "channel_media_public_read" on storage.objects;
create policy "channel_media_public_read" on storage.objects
  for select using (bucket_id = 'channel-media');

drop policy if exists "channel_media_owner_write" on storage.objects;
create policy "channel_media_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'channel-media'
    and exists (
      select 1 from public.channels c
      where c.id = ((storage.foldername(name))[1])::uuid
        and c.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CATALOG — public read, business owner write
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "catalog_public_read" on storage.objects;
create policy "catalog_public_read" on storage.objects
  for select using (bucket_id = 'catalog');

drop policy if exists "catalog_owner_write" on storage.objects;
create policy "catalog_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'catalog'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- INVOICES — only business owner & customer (server-side signed URLs)
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "invoices_owner_all" on storage.objects;
create policy "invoices_owner_all" on storage.objects
  for all using (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- RECORDINGS — call participants only (server-side signed URLs preferred)
-- File path: {call_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "recordings_participant_read" on storage.objects;
create policy "recordings_participant_read" on storage.objects
  for select using (
    bucket_id = 'recordings'
    and exists (
      select 1 from public.call_participants p
      where p.call_id = ((storage.foldername(name))[1])::uuid
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "recordings_initiator_write" on storage.objects;
create policy "recordings_initiator_write" on storage.objects
  for insert with check (
    bucket_id = 'recordings'
    and exists (
      select 1 from public.calls c
      where c.id = ((storage.foldername(name))[1])::uuid
        and c.initiator_id = auth.uid()
    )
  );
