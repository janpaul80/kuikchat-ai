-- ============================================================================
-- KuikChat — 005_channels.sql
-- Broadcast channels (Telegram-style + Substack-style + monetization)
-- ============================================================================

create table if not exists public.channels (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null check (slug ~ '^[a-z0-9_-]{3,40}$'),
  name            text not null,
  description     text,
  category        text,
  tags            text[] default '{}',
  avatar_url      text,
  banner_url      text,
  owner_id        uuid not null references public.profiles(id) on delete cascade,

  is_public       boolean default true,
  is_paid         boolean default false,
  price_cents     int default 0,
  stripe_price_id text,
  is_verified     boolean default false,
  is_discoverable boolean default true,

  allow_comments  boolean default true,
  allow_reactions boolean default true,

  subscriber_count int default 0,
  post_count       int default 0,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists channels_slug_idx on public.channels (slug);
create index if not exists channels_category_idx on public.channels (category);
create index if not exists channels_search_idx on public.channels using gin (name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- Channel subscribers
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.channel_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  channel_id      uuid not null references public.channels(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  is_paid         boolean default false,
  stripe_subscription_id text,
  expires_at      timestamptz,
  notifications_enabled boolean default true,
  subscribed_at   timestamptz default now(),
  unique(channel_id, user_id)
);

create index if not exists channel_subs_channel_idx on public.channel_subscribers (channel_id);
create index if not exists channel_subs_user_idx on public.channel_subscribers (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Channel posts
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.channel_posts (
  id              uuid primary key default uuid_generate_v4(),
  channel_id      uuid not null references public.channels(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,

  title           text,
  body            text,
  formatted_body  jsonb,

  media           jsonb default '[]'::jsonb,    -- array of {url, type, ...}
  preview_url     text,

  is_premium      boolean default false,         -- only paid subscribers see
  is_pinned       boolean default false,

  scheduled_for   timestamptz,
  published_at    timestamptz,

  view_count      int default 0,
  reach_count     int default 0,                 -- unique viewers

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists channel_posts_channel_idx on public.channel_posts (channel_id, created_at desc);
create index if not exists channel_posts_published_idx on public.channel_posts (channel_id, published_at desc) where published_at is not null;
create index if not exists channel_posts_scheduled_idx on public.channel_posts (scheduled_for) where scheduled_for is not null and published_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Channel post reactions
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.channel_post_reactions (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references public.channel_posts(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  emoji           text not null,
  created_at      timestamptz default now(),
  unique(post_id, user_id, emoji)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Channel post comments
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.channel_post_comments (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references public.channel_posts(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  parent_id       uuid references public.channel_post_comments(id) on delete cascade,
  body            text not null,
  is_deleted      boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists post_comments_post_idx on public.channel_post_comments (post_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Post views (for analytics)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.channel_post_views (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references public.channel_posts(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete set null,
  viewed_at       timestamptz default now()
);

create index if not exists post_views_post_idx on public.channel_post_views (post_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Maintain subscriber/post counts
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_channel_counts()
returns trigger language plpgsql as $$
begin
  if tg_table_name = 'channel_subscribers' then
    if tg_op = 'INSERT' then
      update public.channels set subscriber_count = subscriber_count + 1 where id = new.channel_id;
    elsif tg_op = 'DELETE' then
      update public.channels set subscriber_count = greatest(0, subscriber_count - 1) where id = old.channel_id;
    end if;
  elsif tg_table_name = 'channel_posts' then
    if tg_op = 'INSERT' then
      update public.channels set post_count = post_count + 1 where id = new.channel_id;
    elsif tg_op = 'DELETE' then
      update public.channels set post_count = greatest(0, post_count - 1) where id = old.channel_id;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists channel_subs_count on public.channel_subscribers;
create trigger channel_subs_count
  after insert or delete on public.channel_subscribers
  for each row execute function public.update_channel_counts();

drop trigger if exists channel_posts_count on public.channel_posts;
create trigger channel_posts_count
  after insert or delete on public.channel_posts
  for each row execute function public.update_channel_counts();
