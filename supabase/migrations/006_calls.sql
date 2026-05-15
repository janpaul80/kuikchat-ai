-- ============================================================================
-- KuikChat — 006_calls.sql
-- Voice + video calls (1:1, group, scheduled, recordings)
-- ============================================================================

create table if not exists public.calls (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid references public.chats(id) on delete set null,

  type            text not null check (type in ('voice','video')),
  scope           text not null default 'direct' check (scope in ('direct','group','meeting')),

  initiator_id    uuid not null references public.profiles(id) on delete cascade,

  -- Lifecycle
  status          text default 'ringing' check (status in (
    'scheduled','ringing','active','ended','missed','declined','failed'
  )),
  started_at      timestamptz,
  ended_at        timestamptz,
  duration_seconds int,

  -- Scheduling
  scheduled_for   timestamptz,
  scheduled_title text,

  -- Link sharing
  call_link_token text unique default encode(gen_random_bytes(12), 'hex'),
  is_link_open    boolean default false,

  -- Recording
  is_recorded     boolean default false,
  recording_url   text,
  recording_consent_required boolean default true,

  -- Quality
  bandwidth_mode  text default 'auto' check (bandwidth_mode in ('auto','low','high')),

  -- Meeting features
  has_whiteboard  boolean default false,
  has_screen_share boolean default false,

  created_at      timestamptz default now()
);

create index if not exists calls_chat_idx on public.calls (chat_id, created_at desc);
create index if not exists calls_initiator_idx on public.calls (initiator_id);
create index if not exists calls_link_token_idx on public.calls (call_link_token);
create index if not exists calls_scheduled_idx on public.calls (scheduled_for) where scheduled_for is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Call participants
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.call_participants (
  id              uuid primary key default uuid_generate_v4(),
  call_id         uuid not null references public.calls(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,

  joined_at       timestamptz,
  left_at         timestamptz,

  -- State
  is_muted        boolean default false,
  is_video_on     boolean default true,
  is_screen_sharing boolean default false,
  has_raised_hand boolean default false,

  -- Quality
  connection_quality text,

  unique(call_id, user_id)
);

create index if not exists call_participants_call_idx on public.call_participants (call_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Call reactions during call (emoji bubbles)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.call_reactions (
  id              uuid primary key default uuid_generate_v4(),
  call_id         uuid not null references public.calls(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  emoji           text not null,
  sent_at         timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Call notes (Hermes can write meeting summaries here)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.call_notes (
  id              uuid primary key default uuid_generate_v4(),
  call_id         uuid not null references public.calls(id) on delete cascade,
  generated_by    text default 'hermes' check (generated_by in ('hermes','user')),
  user_id         uuid references public.profiles(id) on delete set null,
  summary         text,
  action_items    jsonb default '[]'::jsonb,
  transcript      text,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- In-call polls
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.call_polls (
  id              uuid primary key default uuid_generate_v4(),
  call_id         uuid not null references public.calls(id) on delete cascade,
  question        text not null,
  options         jsonb not null,
  votes           jsonb default '{}'::jsonb,
  created_by      uuid references public.profiles(id) on delete set null,
  closed_at       timestamptz,
  created_at      timestamptz default now()
);
