-- KuikChat - QA-only realtime publication diagnostics
-- Lets the service-role QA harness verify which public tables are in supabase_realtime.

create or replace function public.qa_realtime_publication_state()
returns table (
  schemaname name,
  tablename name,
  publicationname name,
  in_supabase_realtime boolean,
  replica_identity text
)
language sql
stable
security invoker
set search_path = public, pg_catalog
as $$
  with target_tables(tablename) as (
    values
      ('messages'),
      ('message_reactions'),
      ('message_reads'),
      ('polls'),
      ('poll_votes'),
      ('events'),
      ('event_rsvps'),
      ('live_location_sessions')
  )
  select
    n.nspname as schemaname,
    c.relname as tablename,
    pt.pubname as publicationname,
    pt.pubname is not null as in_supabase_realtime,
    case c.relreplident
      when 'd' then 'default'
      when 'n' then 'nothing'
      when 'f' then 'full'
      when 'i' then 'index'
      else c.relreplident::text
    end as replica_identity
  from target_tables t
  join pg_catalog.pg_namespace n on n.nspname = 'public'
  join pg_catalog.pg_class c on c.relnamespace = n.oid and c.relname = t.tablename
  left join pg_catalog.pg_publication_tables pt
    on pt.schemaname = n.nspname
   and pt.tablename = c.relname
   and pt.pubname = 'supabase_realtime'
  order by n.nspname, c.relname;
$$;

revoke all on function public.qa_realtime_publication_state() from public;
revoke all on function public.qa_realtime_publication_state() from anon;
revoke all on function public.qa_realtime_publication_state() from authenticated;
grant execute on function public.qa_realtime_publication_state() to service_role;
