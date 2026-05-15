-- ============================================================================
-- KuikChat — 004_status_stories.sql
-- 24-hour disappearing status updates with reactions, replies, views
-- ============================================================================

create table if not exists public.statuses (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,

  -- Content
  type            text not null check (type in ('text','image','video','voice','music')),
  body            text,
  media_url       text,
  thumbnail_url   text,
  duration_ms     int,

  -- Text-only styling
  bg_color        text,
  text_color      text,
  font            text,

  -- Music attachment
  music_track     text,
  music_artist    text,
  music_url       text,

  -- Privacy
  visibility      text default 'contacts' check (visibility in ('everyone','contacts','close_friends','custom','only_me')),
  allowed_user_ids uuid[] default '{}',
  excluded_user_ids uuid[] default '{}',

  -- Engagement
  is_boomerang    boolean default false,
  is_archived     boolean default false,

  -- Lifecycle
  expires_at      timestamptz default (now() + interval '24 hours'),
  created_at      timestamptz default now()
);

create index if not exists statuses_user_idx on public.statuses (user_id, created_at desc);
create index if not exists statuses_expires_idx on public.statuses (expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Status views
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.status_views (
  id              uuid primary key default uuid_generate_v4(),
  status_id       uuid not null references public.statuses(id) on delete cascade,
  viewer_id       uuid not null references public.profiles(id) on delete cascade,
  viewed_at       timestamptz default now(),
  unique(status_id, viewer_id)
);

create index if not exists status_views_status_idx on public.status_views (status_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Status reactions
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.status_reactions (
  id              uuid primary key default uuid_generate_v4(),
  status_id       uuid not null references public.statuses(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  emoji           text not null,
  created_at      timestamptz default now(),
  unique(status_id, user_id, emoji)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Status replies (sent privately as messages, but tracked here for analytics)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.status_replies (
  id              uuid primary key default uuid_generate_v4(),
  status_id       uuid not null references public.statuses(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  message_id      uuid references public.messages(id) on delete set null,
  body            text,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Cleanup expired statuses (run via cron / pg_cron)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.cleanup_expired_statuses()
returns void language plpgsql as $$
begin
  -- Move to archive instead of hard delete (so user can re-share)
  update public.statuses
  set is_archived = true
  where expires_at < now() and is_archived = false;
end;
$$;
