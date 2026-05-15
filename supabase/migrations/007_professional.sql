-- ============================================================================
-- KuikChat — 007_professional.sql
-- Professional / Business mode: business profile, catalog, quick replies,
-- broadcasts, labels, appointments, invoices, team inbox, analytics
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Business profile (extends user profile)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.business_profiles (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  company_name    text not null,
  category        text,
  website         text,
  email           text,
  phone           text,
  address         text,
  hours           jsonb default '{}'::jsonb,        -- {mon:[{open,close}], ...}
  description     text,
  logo_url        text,
  cover_url       text,
  is_verified     boolean default false,
  greeting_message text,
  away_message    text,
  away_enabled    boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Catalog items (products / services)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.catalog_items (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.business_profiles(user_id) on delete cascade,
  name            text not null,
  description     text,
  price_cents     int,
  currency        text default 'USD',
  image_urls      text[] default '{}',
  category        text,
  in_stock        boolean default true,
  sku             text,
  position        int default 0,
  created_at      timestamptz default now()
);

create index if not exists catalog_business_idx on public.catalog_items (business_id, position);

-- ─────────────────────────────────────────────────────────────────────────────
-- Quick replies (saved templates)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.quick_replies (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  shortcut        text not null,        -- e.g. "/thanks"
  body            text not null,
  uses            int default 0,
  created_at      timestamptz default now(),
  unique(user_id, shortcut)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Chat labels (CRM-style tagging)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_labels (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  color           text default '#1E5BCB',
  created_at      timestamptz default now(),
  unique(user_id, name)
);

create table if not exists public.chat_label_assignments (
  id              uuid primary key default uuid_generate_v4(),
  label_id        uuid not null references public.chat_labels(id) on delete cascade,
  chat_id         uuid not null references public.chats(id) on delete cascade,
  assigned_by     uuid references public.profiles(id) on delete set null,
  assigned_at     timestamptz default now(),
  unique(label_id, chat_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Broadcast lists
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.broadcast_lists (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  recipient_ids   uuid[] not null default '{}',
  created_at      timestamptz default now()
);

create table if not exists public.broadcast_messages (
  id              uuid primary key default uuid_generate_v4(),
  list_id         uuid not null references public.broadcast_lists(id) on delete cascade,
  body            text,
  attachments     jsonb default '[]'::jsonb,
  sent_count      int default 0,
  read_count      int default 0,
  sent_at         timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Appointments / bookings
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.appointments (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.business_profiles(user_id) on delete cascade,
  customer_id     uuid references public.profiles(id) on delete set null,
  customer_name   text,
  customer_email  text,
  service_name    text not null,
  notes           text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          text default 'pending' check (status in ('pending','confirmed','completed','canceled','no_show')),
  created_at      timestamptz default now()
);

create index if not exists appointments_business_idx on public.appointments (business_id, starts_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Invoices (simple)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.business_profiles(user_id) on delete cascade,
  chat_id         uuid references public.chats(id) on delete set null,
  customer_id     uuid references public.profiles(id) on delete set null,
  invoice_number  text,
  items           jsonb default '[]'::jsonb,
  subtotal_cents  int default 0,
  tax_cents       int default 0,
  total_cents     int default 0,
  currency        text default 'USD',
  status          text default 'draft' check (status in ('draft','sent','paid','overdue','void')),
  due_date        date,
  paid_at         timestamptz,
  pdf_url         text,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Team inbox (multi-agent business accounts)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.team_seats (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.business_profiles(user_id) on delete cascade,
  member_id       uuid not null references public.profiles(id) on delete cascade,
  role            text default 'agent' check (role in ('owner','manager','agent')),
  invited_by      uuid references public.profiles(id) on delete set null,
  joined_at       timestamptz default now(),
  unique(business_id, member_id)
);

-- Chat assignment to agents
create table if not exists public.chat_assignments (
  id              uuid primary key default uuid_generate_v4(),
  chat_id         uuid not null references public.chats(id) on delete cascade,
  agent_id        uuid not null references public.profiles(id) on delete cascade,
  assigned_by     uuid references public.profiles(id) on delete set null,
  assigned_at     timestamptz default now(),
  unique(chat_id, agent_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Analytics snapshots (rolled up daily)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.business_analytics (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.business_profiles(user_id) on delete cascade,
  date            date not null,
  messages_sent   int default 0,
  messages_received int default 0,
  unique_contacts int default 0,
  avg_response_seconds int,
  total_calls     int default 0,
  bookings        int default 0,
  invoices_paid_cents int default 0,
  unique(business_id, date)
);
