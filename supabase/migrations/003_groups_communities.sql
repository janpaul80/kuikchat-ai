-- ============================================================================
-- KuikChat — 003_groups_communities.sql
-- Communities (super groups), topics, polls, events, invites, banned words
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Communities (umbrella for multiple sub-groups, like Discord servers)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.communities (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null check (slug ~ '^[a-z0-9-]{3,40}$'),
  name            text not null,
  description     text,
  category        text,
  tags            text[] default '{}',
  logo_url        text,
  banner_url      text,
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  is_public       boolean default true,
  is_discoverable boolean default true,
  is_verified     boolean default false,
  member_count    int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists communities_slug_idx on public.communities (slug);
create index if not exists communities_category_idx on public.communities (category);
create index if not exists communities_search_idx on public.communities using gin (name gin_trgm_ops);

-- Link sub-groups to a community
alter table public.chats
  add column if not exists community_id uuid references public.communities(id) on delete set null;

create index if not exists chats_community_idx on public.chats (community_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Community members
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.community_members (
  id              uuid primary key default uuid_generate_v4(),
  community_id    uuid not null references public.communities(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            text default 'member' check (role in ('owner','admin','moderator','member')),
  joined_at       timestamptz default now(),
  unique(community_id, user_id)
);

create index if not exists community_members_community_idx on public.community_members (community_id);
create index if not exists community_members_user_idx on public.community_members (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Group/community rules
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_rules (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  position        int default 0,
  title           text not null,
  description     text,
  created_at      timestamptz default now()
);

create index if not exists chat_rules_chat_idx on public.chat_rules (chat_id, position);

-- ─────────────────────────────────────────────────────────────────────────────
-- Banned words filter
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_banned_words (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  word            text not null,
  action          text default 'warn' check (action in ('warn','delete','ban')),
  created_at      timestamptz default now(),
  unique(chat_id, word)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Topics / sub-channels (Discord-style threads inside groups)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_topics (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  name            text not null,
  description     text,
  icon            text,
  position        int default 0,
  is_locked       boolean default false,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now()
);

alter table public.messages
  add column if not exists topic_id uuid references public.chat_topics(id) on delete set null;

create index if not exists messages_topic_idx on public.messages (topic_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Invite links
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_invites (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  community_id    uuid references public.communities(id) on delete cascade,
  code            text unique not null default encode(gen_random_bytes(8), 'hex'),
  created_by      uuid references public.profiles(id) on delete set null,
  max_uses        int,
  uses            int default 0,
  expires_at      timestamptz,
  created_at      timestamptz default now()
);

create index if not exists chat_invites_code_idx on public.chat_invites (code);

-- ─────────────────────────────────────────────────────────────────────────────
-- Join requests (when approval required)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_join_requests (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  message         text,
  status          text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz default now(),
  unique(chat_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Polls
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.polls (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  message_id      uuid references public.messages(id) on delete cascade,
  question        text not null,
  options         jsonb not null,        -- [{id, text}]
  is_multiple     boolean default false,
  is_anonymous    boolean default false,
  closes_at       timestamptz,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now()
);

create table if not exists public.poll_votes (
  id              uuid primary key default uuid_generate_v4(),
  poll_id         uuid not null references public.polls(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  option_id       text not null,
  voted_at        timestamptz default now(),
  unique(poll_id, user_id, option_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Events (scheduled group events with RSVP)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid references public.chats(id) on delete cascade,
  community_id    uuid references public.communities(id) on delete cascade,
  title           text not null,
  description     text,
  location        text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  cover_url       text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now()
);

create table if not exists public.event_rsvps (
  id              uuid primary key default uuid_generate_v4(),
  event_id        uuid not null references public.events(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          text default 'going' check (status in ('going','maybe','not_going')),
  created_at      timestamptz default now(),
  unique(event_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Maintain community member count
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_community_member_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.communities set member_count = member_count + 1 where id = new.community_id;
  elsif tg_op = 'DELETE' then
    update public.communities set member_count = greatest(0, member_count - 1) where id = old.community_id;
  end if;
  return null;
end;
$$;

drop trigger if exists community_members_count_ins on public.community_members;
create trigger community_members_count_ins
  after insert on public.community_members
  for each row execute function public.update_community_member_count();

drop trigger if exists community_members_count_del on public.community_members;
create trigger community_members_count_del
  after delete on public.community_members
  for each row execute function public.update_community_member_count();
