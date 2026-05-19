-- ============================================================================
-- KuikChat — 017_event_missing_columns.sql
-- Add missing columns to existing events table idempotently
-- ============================================================================

-- message_id
alter table if exists public.events
  add column if not exists message_id uuid references public.messages(id) on delete cascade;

-- Ensure chat_id exists (needed for RLS queries)
alter table if exists public.events
  add column if not exists chat_id uuid references public.chats(id) on delete cascade;

-- title
alter table if exists public.events
  add column if not exists title text;

-- description
alter table if exists public.events
  add column if not exists description text;

-- location
alter table if exists public.events
  add column if not exists location text;

-- start_time
alter table if exists public.events
  add column if not exists start_time timestamptz;

-- end_time
alter table if exists public.events
  add column if not exists end_time timestamptz;

-- meeting_link
alter table if exists public.events
  add column if not exists meeting_link text;

-- timezone
alter table if exists public.events
  add column if not exists timezone text;

-- created_by
alter table if exists public.events
  add column if not exists created_by uuid references public.profiles(id) on delete cascade;

-- created_at
alter table if exists public.events
  add column if not exists created_at timestamptz default now();

-- updated_at
alter table if exists public.events
  add column if not exists updated_at timestamptz default now();

-- Indices (idempotent via IF NOT EXISTS)
create index if not exists events_chat_idx on public.events (chat_id);
create index if not exists events_message_idx on public.events (message_id);

-- RLS (idempotent via IF NOT EXISTS for policies — PG 14+)
-- Enable RLS (safe to rerun)
alter table if exists public.events enable row level security;

-- Drop existing policies first to avoid duplicate policy errors
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

-- Realtime publication (safe to rerun)
do $$
begin
  execute 'alter publication supabase_realtime add table public.events';
exception when others then
  null;
end;
$$;

-- updated_at trigger (idempotent — DROP IF EXISTS + CREATE)
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

-- Ensure NOT NULL constraints on required fields where safe
-- (only applies if table is empty or all rows have data — skip if risky)
-- Instead of ALTER COLUMN SET NOT NULL which fails on existing nulls,
-- we mark them as required in the RPC; existing rows are grandfathered.

-- Grant permissions for authenticated users
grant all on public.events to authenticated;
grant all on public.event_rsvps to authenticated;
