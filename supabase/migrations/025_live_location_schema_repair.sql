-- KuikChat - live location schema repair
-- Restores the table and realtime visibility expected by location messages.

create table if not exists public.live_location_sessions (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  is_active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_location_sessions_chat_idx
  on public.live_location_sessions (chat_id);

create index if not exists live_location_sessions_message_idx
  on public.live_location_sessions (message_id);

create index if not exists live_location_sessions_active_idx
  on public.live_location_sessions (is_active, expires_at);

alter table public.live_location_sessions enable row level security;

grant select, insert, update on public.live_location_sessions to authenticated;

drop policy if exists "Users can view live locations in their chats" on public.live_location_sessions;
drop policy if exists "Users can start their own live location" on public.live_location_sessions;
drop policy if exists "Users can update their own live location" on public.live_location_sessions;

create policy "Users can view live locations in their chats"
  on public.live_location_sessions for select
  using (public.is_chat_member(chat_id));

create policy "Users can start their own live location"
  on public.live_location_sessions for insert
  with check (auth.uid() = user_id and public.is_chat_member(chat_id));

create policy "Users can update their own live location"
  on public.live_location_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and public.is_chat_member(chat_id));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists live_location_sessions_updated_at on public.live_location_sessions;
create trigger live_location_sessions_updated_at
  before update on public.live_location_sessions
  for each row execute function public.set_updated_at();

do $$
begin
  execute 'alter publication supabase_realtime add table public.live_location_sessions';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

alter table public.live_location_sessions replica identity full;

notify pgrst, 'reload schema';
