-- KuikChat - poll realtime visibility repair
-- Keeps authenticated poll reads/writes aligned with realtime subscriptions.

alter table if exists public.polls enable row level security;
alter table if exists public.poll_votes enable row level security;

grant select, insert on public.polls to authenticated;
grant select, insert, delete on public.poll_votes to authenticated;

drop policy if exists "polls_select_member" on public.polls;
create policy "polls_select_member"
  on public.polls for select
  using (public.is_chat_member(chat_id));

drop policy if exists "polls_insert_member" on public.polls;
create policy "polls_insert_member"
  on public.polls for insert
  with check (public.is_chat_member(chat_id) and auth.uid() = created_by);

drop policy if exists "poll_votes_select" on public.poll_votes;
drop policy if exists "poll_votes_select_member" on public.poll_votes;
create policy "poll_votes_select_member"
  on public.poll_votes for select
  using (
    exists (
      select 1
      from public.polls p
      where p.id = poll_votes.poll_id
        and public.is_chat_member(p.chat_id)
    )
  );

drop policy if exists "poll_votes_self" on public.poll_votes;
create policy "poll_votes_self"
  on public.poll_votes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  execute 'alter publication supabase_realtime add table public.polls';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.poll_votes';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
