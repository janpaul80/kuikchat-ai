-- KuikChat - message metadata repair
-- Interactive message types store typed payloads here: contact, location, event, media, etc.

alter table public.messages
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.messages.metadata is
  'Structured payload for interactive chat messages such as contact, location, event, media, and future intent-based actions.';

-- Make the new column available to PostgREST/Supabase clients without waiting
-- for the schema cache to refresh on its own.
notify pgrst, 'reload schema';
