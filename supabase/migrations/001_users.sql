-- ============================================================================
-- KuikChat — 001_users.sql
-- User profiles, settings, devices, presence
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles (public mirror of auth.users with KuikChat-specific fields)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name    text not null default '',
  bio             text default '',
  avatar_url      text,
  cover_url       text,
  email           text,
  pronouns        text,
  links           jsonb default '[]'::jsonb,
  qr_code_token   text unique default encode(gen_random_bytes(16), 'hex'),

  -- Account mode
  mode            text default 'personal' check (mode in ('personal', 'professional')),

  -- Subscription (Stripe)
  plan                    text default 'free' check (plan in ('free','plus','pro','business')),
  hermes_pro              boolean default false,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  subscription_status     text default 'inactive',
  trial_ends_at           timestamptz,

  -- Privacy settings (defaults)
  last_seen_visibility    text default 'contacts' check (last_seen_visibility in ('everyone','contacts','nobody')),
  online_status_visible   boolean default true,
  profile_photo_visibility text default 'everyone' check (profile_photo_visibility in ('everyone','contacts','nobody')),
  read_receipts_enabled   boolean default true,
  typing_indicator_enabled boolean default true,
  ghost_mode              boolean default false,

  -- Security
  two_factor_enabled      boolean default false,
  app_lock_enabled        boolean default false,
  screenshot_block        boolean default false,
  ip_protection           boolean default false,

  -- Activity
  last_seen_at            timestamptz default now(),
  is_online               boolean default false,

  -- Timestamps
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  deleted_at              timestamptz
);

create index if not exists profiles_username_idx on public.profiles using gin (username gin_trgm_ops);
create index if not exists profiles_display_name_idx on public.profiles using gin (display_name gin_trgm_ops);
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- User devices (multi-device, up to 5)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_devices (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  device_name     text not null,
  device_type     text check (device_type in ('web','ios','android','desktop')),
  os              text,
  browser         text,
  ip_address      inet,
  user_agent      text,
  push_token      text,
  public_key      text,        -- For E2EE
  is_current      boolean default false,
  last_active_at  timestamptz default now(),
  created_at      timestamptz default now()
);

create index if not exists user_devices_user_idx on public.user_devices (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Contacts (friend list)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  contact_id      uuid not null references public.profiles(id) on delete cascade,
  nickname        text,
  is_favorite     boolean default false,
  is_close_friend boolean default false,  -- For status visibility
  created_at      timestamptz default now(),
  unique(user_id, contact_id),
  check (user_id <> contact_id)
);

create index if not exists contacts_user_idx on public.contacts (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Blocked users
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.blocked_users (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  blocked_id      uuid not null references public.profiles(id) on delete cascade,
  reason          text,
  created_at      timestamptz default now(),
  unique(user_id, blocked_id),
  check (user_id <> blocked_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Notification preferences
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.notification_settings (
  user_id                   uuid primary key references public.profiles(id) on delete cascade,
  message_notifications     boolean default true,
  group_notifications       boolean default true,
  call_notifications        boolean default true,
  status_notifications      boolean default true,
  channel_notifications     boolean default true,
  email_notifications       boolean default false,
  message_preview           boolean default true,
  message_sound             text default 'default',
  call_ringtone             text default 'default',
  vibrate                   boolean default true,
  do_not_disturb            boolean default false,
  dnd_start                 time,
  dnd_end                   time,
  priority_user_ids         uuid[] default '{}',
  updated_at                timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Appearance preferences
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.appearance_settings (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  theme           text default 'system' check (theme in ('light','dark','amoled','system')),
  accent_color    text default 'blue',
  font_size       text default 'medium' check (font_size in ('small','medium','large','xlarge')),
  chat_wallpaper  text,
  bubble_style    text default 'rounded',
  language        text default 'en',
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create profile on signup trigger
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  unique_username text;
  counter int := 0;
begin
  -- Generate base username from email
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  unique_username := base_username;

  -- Ensure uniqueness
  while exists (select 1 from public.profiles where username = unique_username) loop
    counter := counter + 1;
    unique_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, email, username, display_name, avatar_url)
  values (
    new.id,
    new.email,
    unique_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', unique_username),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.notification_settings (user_id) values (new.id);
  insert into public.appearance_settings (user_id) values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at trigger helper
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
