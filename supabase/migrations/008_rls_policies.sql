-- ============================================================================
-- KuikChat — 008_rls_policies.sql
-- Row Level Security policies for ALL tables
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Is the current user a member of the chat?
create or replace function public.is_chat_member(p_chat_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.chat_members
    where chat_id = p_chat_id and user_id = auth.uid()
  );
$$;

-- Is the current user an admin/owner of the chat?
create or replace function public.is_chat_admin(p_chat_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.chat_members
    where chat_id = p_chat_id
      and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- Is the current user a member of the community?
create or replace function public.is_community_member(p_community_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.community_members
    where community_id = p_community_id and user_id = auth.uid()
  );
$$;

-- Is the user blocked by another user?
create or replace function public.is_blocked_by(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocked_users
    where user_id = p_user_id and blocked_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS on every table
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles                enable row level security;
alter table public.user_devices            enable row level security;
alter table public.contacts                enable row level security;
alter table public.blocked_users           enable row level security;
alter table public.notification_settings   enable row level security;
alter table public.appearance_settings     enable row level security;

alter table public.chats                   enable row level security;
alter table public.chat_members            enable row level security;
alter table public.messages                enable row level security;
alter table public.message_attachments     enable row level security;
alter table public.message_reactions       enable row level security;
alter table public.message_reads           enable row level security;
alter table public.drafts                  enable row level security;
alter table public.saved_messages          enable row level security;

alter table public.communities             enable row level security;
alter table public.community_members       enable row level security;
alter table public.chat_rules              enable row level security;
alter table public.chat_banned_words       enable row level security;
alter table public.chat_topics             enable row level security;
alter table public.chat_invites            enable row level security;
alter table public.chat_join_requests      enable row level security;
alter table public.polls                   enable row level security;
alter table public.poll_votes              enable row level security;
alter table public.events                  enable row level security;
alter table public.event_rsvps             enable row level security;

alter table public.statuses                enable row level security;
alter table public.status_views            enable row level security;
alter table public.status_reactions        enable row level security;
alter table public.status_replies          enable row level security;

alter table public.channels                enable row level security;
alter table public.channel_subscribers     enable row level security;
alter table public.channel_posts           enable row level security;
alter table public.channel_post_reactions  enable row level security;
alter table public.channel_post_comments   enable row level security;
alter table public.channel_post_views      enable row level security;

alter table public.calls                   enable row level security;
alter table public.call_participants       enable row level security;
alter table public.call_reactions          enable row level security;
alter table public.call_notes              enable row level security;
alter table public.call_polls              enable row level security;

alter table public.business_profiles       enable row level security;
alter table public.catalog_items           enable row level security;
alter table public.quick_replies           enable row level security;
alter table public.chat_labels             enable row level security;
alter table public.chat_label_assignments  enable row level security;
alter table public.broadcast_lists         enable row level security;
alter table public.broadcast_messages      enable row level security;
alter table public.appointments            enable row level security;
alter table public.invoices                enable row level security;
alter table public.team_seats              enable row level security;
alter table public.chat_assignments        enable row level security;
alter table public.business_analytics      enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);    -- everyone can see basic profile data (filter sensitive in app)

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER DEVICES, CONTACTS, BLOCKED, NOTIFICATIONS, APPEARANCE — owner only
-- ─────────────────────────────────────────────────────────────────────────────
create policy "user_devices_owner" on public.user_devices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "contacts_owner" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "blocked_owner" on public.blocked_users
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notif_owner" on public.notification_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "appearance_owner" on public.appearance_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHATS
-- ─────────────────────────────────────────────────────────────────────────────
create policy "chats_select_member" on public.chats
  for select using (is_chat_member(id) or is_public);

create policy "chats_insert_authed" on public.chats
  for insert with check (auth.uid() = created_by);

create policy "chats_update_admin" on public.chats
  for update using (is_chat_admin(id)) with check (is_chat_admin(id));

create policy "chats_delete_owner" on public.chats
  for delete using (
    exists (
      select 1 from public.chat_members
      where chat_id = chats.id and user_id = auth.uid() and role = 'owner'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CHAT MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
create policy "chat_members_select" on public.chat_members
  for select using (is_chat_member(chat_id) or auth.uid() = user_id);

create policy "chat_members_insert_self_or_admin" on public.chat_members
  for insert with check (auth.uid() = user_id or is_chat_admin(chat_id));

create policy "chat_members_update_self_or_admin" on public.chat_members
  for update using (auth.uid() = user_id or is_chat_admin(chat_id));

create policy "chat_members_delete_self_or_admin" on public.chat_members
  for delete using (auth.uid() = user_id or is_chat_admin(chat_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────
create policy "messages_select_member" on public.messages
  for select using (is_chat_member(chat_id));

create policy "messages_insert_member" on public.messages
  for insert with check (
    is_chat_member(chat_id)
    and auth.uid() = sender_id
    and not is_blocked_by(sender_id)
  );

create policy "messages_update_own" on public.messages
  for update using (auth.uid() = sender_id) with check (auth.uid() = sender_id);

create policy "messages_delete_own_or_admin" on public.messages
  for delete using (auth.uid() = sender_id or is_chat_admin(chat_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- ATTACHMENTS, REACTIONS, READS
-- ─────────────────────────────────────────────────────────────────────────────
create policy "attachments_select_member" on public.message_attachments
  for select using (
    exists (select 1 from public.messages m where m.id = message_id and is_chat_member(m.chat_id))
  );

create policy "attachments_insert_sender" on public.message_attachments
  for insert with check (
    exists (select 1 from public.messages m where m.id = message_id and m.sender_id = auth.uid())
  );

create policy "reactions_select_member" on public.message_reactions
  for select using (
    exists (select 1 from public.messages m where m.id = message_id and is_chat_member(m.chat_id))
  );

create policy "reactions_modify_own" on public.message_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reads_select_member" on public.message_reads
  for select using (
    exists (select 1 from public.messages m where m.id = message_id and is_chat_member(m.chat_id))
  );

create policy "reads_insert_self" on public.message_reads
  for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- DRAFTS, SAVED
-- ─────────────────────────────────────────────────────────────────────────────
create policy "drafts_owner" on public.drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_owner" on public.saved_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMUNITIES
-- ─────────────────────────────────────────────────────────────────────────────
create policy "communities_select_public_or_member" on public.communities
  for select using (is_public or is_community_member(id));

create policy "communities_insert_authed" on public.communities
  for insert with check (auth.uid() = owner_id);

create policy "communities_update_owner" on public.communities
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "communities_delete_owner" on public.communities
  for delete using (auth.uid() = owner_id);

create policy "community_members_select" on public.community_members
  for select using (is_community_member(community_id) or auth.uid() = user_id);

create policy "community_members_insert" on public.community_members
  for insert with check (auth.uid() = user_id);

create policy "community_members_delete" on public.community_members
  for delete using (auth.uid() = user_id);

-- Rules / banned words / topics / invites / join requests — chat admins
create policy "chat_rules_select_member" on public.chat_rules
  for select using (is_chat_member(chat_id));
create policy "chat_rules_admin" on public.chat_rules
  for all using (is_chat_admin(chat_id)) with check (is_chat_admin(chat_id));

create policy "banned_words_admin" on public.chat_banned_words
  for all using (is_chat_admin(chat_id)) with check (is_chat_admin(chat_id));

create policy "topics_select_member" on public.chat_topics
  for select using (is_chat_member(chat_id));
create policy "topics_admin" on public.chat_topics
  for all using (is_chat_admin(chat_id)) with check (is_chat_admin(chat_id));

create policy "invites_select_member" on public.chat_invites
  for select using (is_chat_member(chat_id));
create policy "invites_admin" on public.chat_invites
  for all using (is_chat_admin(chat_id)) with check (is_chat_admin(chat_id));

create policy "join_requests_select" on public.chat_join_requests
  for select using (auth.uid() = user_id or is_chat_admin(chat_id));
create policy "join_requests_insert_self" on public.chat_join_requests
  for insert with check (auth.uid() = user_id);
create policy "join_requests_update_admin" on public.chat_join_requests
  for update using (is_chat_admin(chat_id));

-- Polls / votes / events
create policy "polls_select_member" on public.polls
  for select using (is_chat_member(chat_id));
create policy "polls_insert_member" on public.polls
  for insert with check (is_chat_member(chat_id) and auth.uid() = created_by);

create policy "poll_votes_select" on public.poll_votes
  for select using (
    exists (select 1 from public.polls p where p.id = poll_id and is_chat_member(p.chat_id))
  );
create policy "poll_votes_self" on public.poll_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events_select" on public.events
  for select using (
    (chat_id is not null and is_chat_member(chat_id))
    or (community_id is not null and is_community_member(community_id))
  );
create policy "events_insert" on public.events
  for insert with check (auth.uid() = created_by);

create policy "event_rsvps_self" on public.event_rsvps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STATUSES
-- ─────────────────────────────────────────────────────────────────────────────
create policy "statuses_select_visible" on public.statuses
  for select using (
    auth.uid() = user_id
    or visibility = 'everyone'
    or (visibility = 'contacts' and exists (
      select 1 from public.contacts c where c.user_id = statuses.user_id and c.contact_id = auth.uid()
    ))
    or (visibility = 'close_friends' and exists (
      select 1 from public.contacts c
      where c.user_id = statuses.user_id and c.contact_id = auth.uid() and c.is_close_friend = true
    ))
    or (visibility = 'custom' and auth.uid() = any(allowed_user_ids))
  );

create policy "statuses_insert_own" on public.statuses
  for insert with check (auth.uid() = user_id);

create policy "statuses_update_own" on public.statuses
  for update using (auth.uid() = user_id);

create policy "statuses_delete_own" on public.statuses
  for delete using (auth.uid() = user_id);

create policy "status_views_self_insert" on public.status_views
  for insert with check (auth.uid() = viewer_id);
create policy "status_views_select" on public.status_views
  for select using (
    auth.uid() = viewer_id
    or exists (select 1 from public.statuses s where s.id = status_id and s.user_id = auth.uid())
  );

create policy "status_reactions_self" on public.status_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "status_replies_self" on public.status_replies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANNELS
-- ─────────────────────────────────────────────────────────────────────────────
create policy "channels_select_public_or_owner" on public.channels
  for select using (is_public or auth.uid() = owner_id);
create policy "channels_insert_authed" on public.channels
  for insert with check (auth.uid() = owner_id);
create policy "channels_update_owner" on public.channels
  for update using (auth.uid() = owner_id);
create policy "channels_delete_owner" on public.channels
  for delete using (auth.uid() = owner_id);

create policy "channel_subs_self_or_owner" on public.channel_subscribers
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  );
create policy "channel_subs_insert_self" on public.channel_subscribers
  for insert with check (auth.uid() = user_id);
create policy "channel_subs_delete_self" on public.channel_subscribers
  for delete using (auth.uid() = user_id);

create policy "channel_posts_select" on public.channel_posts
  for select using (
    exists (
      select 1 from public.channels c
      where c.id = channel_id
        and (
          c.is_public
          or c.owner_id = auth.uid()
          or exists (select 1 from public.channel_subscribers s where s.channel_id = c.id and s.user_id = auth.uid())
        )
    )
  );
create policy "channel_posts_insert_owner" on public.channel_posts
  for insert with check (
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  );
create policy "channel_posts_update_author" on public.channel_posts
  for update using (auth.uid() = author_id);
create policy "channel_posts_delete_owner" on public.channel_posts
  for delete using (
    auth.uid() = author_id
    or exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  );

create policy "post_reactions_self" on public.channel_post_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "post_comments_select" on public.channel_post_comments
  for select using (
    exists (
      select 1 from public.channel_posts p
      join public.channels c on c.id = p.channel_id
      where p.id = post_id and (c.is_public or exists (
        select 1 from public.channel_subscribers s where s.channel_id = c.id and s.user_id = auth.uid()
      ))
    )
  );
create policy "post_comments_insert_self" on public.channel_post_comments
  for insert with check (auth.uid() = user_id);
create policy "post_comments_update_self" on public.channel_post_comments
  for update using (auth.uid() = user_id);

create policy "post_views_insert_authed" on public.channel_post_views
  for insert with check (auth.uid() is not null);
create policy "post_views_select_owner" on public.channel_post_views
  for select using (
    exists (
      select 1 from public.channel_posts p
      join public.channels c on c.id = p.channel_id
      where p.id = post_id and c.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CALLS
-- ─────────────────────────────────────────────────────────────────────────────
create policy "calls_select_participant" on public.calls
  for select using (
    auth.uid() = initiator_id
    or exists (select 1 from public.call_participants p where p.call_id = calls.id and p.user_id = auth.uid())
    or (chat_id is not null and is_chat_member(chat_id))
    or is_link_open
  );
create policy "calls_insert_initiator" on public.calls
  for insert with check (auth.uid() = initiator_id);
create policy "calls_update_initiator" on public.calls
  for update using (auth.uid() = initiator_id);

create policy "call_participants_self" on public.call_participants
  for all using (
    auth.uid() = user_id
    or exists (select 1 from public.calls c where c.id = call_id and c.initiator_id = auth.uid())
  );

create policy "call_reactions_self" on public.call_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "call_notes_participant" on public.call_notes
  for select using (
    exists (select 1 from public.call_participants p where p.call_id = call_id and p.user_id = auth.uid())
  );

create policy "call_polls_participant" on public.call_polls
  for select using (
    exists (select 1 from public.call_participants p where p.call_id = call_id and p.user_id = auth.uid())
  );
create policy "call_polls_insert" on public.call_polls
  for insert with check (auth.uid() = created_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- BUSINESS / PROFESSIONAL
-- ─────────────────────────────────────────────────────────────────────────────
create policy "business_profiles_select_public" on public.business_profiles
  for select using (true);
create policy "business_profiles_owner" on public.business_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "catalog_select_public" on public.catalog_items
  for select using (true);
create policy "catalog_owner" on public.catalog_items
  for all using (auth.uid() = business_id) with check (auth.uid() = business_id);

create policy "quick_replies_owner" on public.quick_replies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chat_labels_owner" on public.chat_labels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chat_label_assign_owner" on public.chat_label_assignments
  for all using (
    exists (select 1 from public.chat_labels l where l.id = label_id and l.user_id = auth.uid())
  );

create policy "broadcast_lists_owner" on public.broadcast_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "broadcast_messages_owner" on public.broadcast_messages
  for all using (
    exists (select 1 from public.broadcast_lists l where l.id = list_id and l.user_id = auth.uid())
  );

create policy "appointments_owner_or_customer" on public.appointments
  for select using (auth.uid() = business_id or auth.uid() = customer_id);
create policy "appointments_insert" on public.appointments
  for insert with check (auth.uid() is not null);
create policy "appointments_update_owner" on public.appointments
  for update using (auth.uid() = business_id);

create policy "invoices_owner_or_customer" on public.invoices
  for select using (auth.uid() = business_id or auth.uid() = customer_id);
create policy "invoices_owner_modify" on public.invoices
  for all using (auth.uid() = business_id) with check (auth.uid() = business_id);

create policy "team_seats_owner_or_member" on public.team_seats
  for select using (auth.uid() = business_id or auth.uid() = member_id);
create policy "team_seats_owner_modify" on public.team_seats
  for all using (auth.uid() = business_id) with check (auth.uid() = business_id);

create policy "chat_assignments_member" on public.chat_assignments
  for all using (auth.uid() = agent_id or auth.uid() = assigned_by);

create policy "analytics_owner" on public.business_analytics
  for select using (auth.uid() = business_id);
