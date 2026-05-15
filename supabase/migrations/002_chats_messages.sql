-- ============================================================================
-- KuikChat — 002_chats_messages.sql
-- 1:1 + group chats, messages, reactions, attachments, drafts
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Chats (umbrella for direct, group, hermes)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chats (
  id              uuid primary key default uuid_generate_v4(),
  type            text not null check (type in ('direct','group','hermes','self')),
  name            text,            -- group name; null for direct
  description     text,
  avatar_url      text,
  created_by      uuid references public.profiles(id) on delete set null,

  -- Group settings
  is_public       boolean default false,
  invite_link     text unique,
  max_members     int default 1024,
  slow_mode_seconds int default 0,
  announcement_only boolean default false,
  join_approval_required boolean default false,

  -- Disappearing messages
  disappearing_seconds int default 0,  -- 0 = off

  -- Privacy
  is_secret       boolean default false,  -- device-only, no cloud
  chat_lock_enabled boolean default false,

  -- Activity
  last_message_at timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists chats_type_idx on public.chats (type);
create index if not exists chats_last_message_idx on public.chats (last_message_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Chat members
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_members (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            text default 'member' check (role in ('owner','admin','moderator','member','guest')),
  custom_tag      text,            -- e.g. "🎨 Designer"
  is_muted        boolean default false,
  muted_until     timestamptz,
  is_pinned       boolean default false,
  is_archived     boolean default false,
  unread_count    int default 0,
  last_read_at    timestamptz default now(),
  joined_at       timestamptz default now(),
  unique(chat_id, user_id)
);

create index if not exists chat_members_chat_idx on public.chat_members (chat_id);
create index if not exists chat_members_user_idx on public.chat_members (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Messages
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete set null,

  -- Content
  type            text not null default 'text' check (type in (
    'text','image','video','audio','voice','file','sticker','gif',
    'location','contact','poll','call_log','system','hermes'
  )),
  body            text,
  formatted_body  jsonb,           -- rich text / formatting tokens

  -- Threading & references
  reply_to_id     uuid references public.messages(id) on delete set null,
  forward_from_id uuid references public.messages(id) on delete set null,
  thread_id       uuid,            -- for grouped replies

  -- Mentions / hashtags
  mentions        uuid[] default '{}',
  hashtags        text[] default '{}',

  -- Status
  edited_at       timestamptz,
  deleted_at      timestamptz,
  deleted_for_everyone boolean default false,

  -- Disappearing
  expires_at      timestamptz,
  view_once       boolean default false,
  viewed_by       uuid[] default '{}',

  -- Pinning
  is_pinned       boolean default false,
  pinned_at       timestamptz,
  pinned_by       uuid references public.profiles(id) on delete set null,

  -- Encryption metadata
  encryption_version int default 1,

  created_at      timestamptz default now()
);

create index if not exists messages_chat_created_idx on public.messages (chat_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id);
create index if not exists messages_reply_idx on public.messages (reply_to_id);
create index if not exists messages_body_search_idx on public.messages using gin (body gin_trgm_ops);
create index if not exists messages_pinned_idx on public.messages (chat_id, is_pinned) where is_pinned = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- Message attachments (media, files)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.message_attachments (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid not null references public.messages(id) on delete cascade,
  type            text not null check (type in ('image','video','audio','voice','file','sticker','gif')),
  url             text not null,
  thumbnail_url   text,
  filename        text,
  mime_type       text,
  size_bytes      bigint,
  width           int,
  height          int,
  duration_ms     int,             -- for audio/video
  waveform        int[] default '{}',  -- voice message visualization
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);

create index if not exists attachments_message_idx on public.message_attachments (message_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Message reactions
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.message_reactions (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid not null references public.messages(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  emoji           text not null,
  created_at      timestamptz default now(),
  unique(message_id, user_id, emoji)
);

create index if not exists reactions_message_idx on public.message_reactions (message_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Message read receipts
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.message_reads (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid not null references public.messages(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  read_at         timestamptz default now(),
  unique(message_id, user_id)
);

create index if not exists reads_message_idx on public.message_reads (message_id);
create index if not exists reads_user_idx on public.message_reads (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Drafts (auto-save)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.drafts (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  chat_id         uuid not null references public.chats(id) on delete cascade,
  body            text,
  reply_to_id     uuid references public.messages(id) on delete set null,
  updated_at      timestamptz default now(),
  primary key (user_id, chat_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Saved messages (bookmarks)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.saved_messages (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  message_id      uuid not null references public.messages(id) on delete cascade,
  note            text,
  saved_at        timestamptz default now(),
  unique(user_id, message_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Update chat last_message_at trigger
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_chat_last_message()
returns trigger language plpgsql as $$
begin
  update public.chats
  set last_message_at = new.created_at, updated_at = now()
  where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists messages_update_chat on public.messages;
create trigger messages_update_chat
  after insert on public.messages
  for each row execute function public.update_chat_last_message();
