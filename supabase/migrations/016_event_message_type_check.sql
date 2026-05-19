-- ============================================================================
-- KuikChat — 016_event_message_type_check.sql
-- Add 'event' to messages.type check constraint
-- ============================================================================

-- Drop existing constraint (safe, not cascade)
alter table if exists public.messages
  drop constraint if exists messages_type_check;

-- Re-add with 'event' included
alter table if exists public.messages
  add constraint messages_type_check
  check (type in (
    'text','image','video','audio','voice','file','sticker','gif',
    'location','contact','poll','event','call_log','system','hermes'
  ));