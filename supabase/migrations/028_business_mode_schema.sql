-- Migration 028_business_mode_schema.sql
-- 1. Alter business_profiles to support multi-select categories (text[])
alter table public.business_profiles
  add column if not exists categories text[] default '{}';

-- Migrate existing category data
update public.business_profiles
  set categories = array[category]
  where category is not null and categories = '{}'::text[];

-- Drop old category column
alter table public.business_profiles
  drop column if exists category;

-- 2. Create customer_labels table
create table if not exists public.customer_labels (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.business_profiles(user_id) on delete cascade,
  contact_id      uuid not null references public.profiles(id) on delete cascade,
  label           text not null,
  created_at      timestamptz default now()
);

-- Enable RLS on customer_labels
alter table public.customer_labels enable row level security;

-- RLS policies for customer_labels
create policy "customer_labels_select_public" on public.customer_labels
  for select using (true);

create policy "customer_labels_owner" on public.customer_labels
  for all using (auth.uid() = business_id) with check (auth.uid() = business_id);
