-- ============================================================================
-- KuikChat — 018_event_starts_at_reconcile.sql
-- Reconcile legacy starts_at column with start_time schema
-- ============================================================================

-- Copy legacy starts_at → start_time if table has starts_at column
do $$
begin
  -- Check if legacy starts_at column exists
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'starts_at'
  ) then
    -- Backfill start_time where missing
    update public.events
    set start_time = starts_at
    where start_time is null and starts_at is not null;

    -- Drop NOT NULL on legacy column so RPC (which writes start_time) can INSERT
    alter table public.events alter column starts_at drop not null;
  end if;
end;
$$;

-- Same for legacy ends_at → end_time
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'ends_at'
  ) then
    update public.events
    set end_time = ends_at
    where end_time is null and ends_at is not null;

    alter table public.events alter column ends_at drop not null;
  end if;
end;
$$;

-- Grant
grant all on public.events to authenticated;
grant all on public.event_rsvps to authenticated;