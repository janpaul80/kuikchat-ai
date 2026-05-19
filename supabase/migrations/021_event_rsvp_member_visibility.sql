-- ============================================================================
-- KuikChat: Event RSVP member visibility repair
-- Allows chat members to read RSVP rows for events in their chats.
-- Required for RSVP realtime fanout to other chat members.
-- ============================================================================

drop policy if exists "Users can view RSVPs for accessible events" on public.event_rsvps;
drop policy if exists "event_rsvps_select_member" on public.event_rsvps;

create policy "event_rsvps_select_member"
  on public.event_rsvps for select
  using (
    exists (
      select 1
      from public.events e
      join public.chat_members m on m.chat_id = e.chat_id
      where e.id = event_rsvps.event_id
        and m.user_id = auth.uid()
    )
  );

grant select on public.event_rsvps to authenticated;
