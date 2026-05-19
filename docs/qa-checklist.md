# KuikChat QA Checklist

Run this checklist before feature expansion. Stability wins over new surface area.

## Setup

- Start from a clean dev cache: kill port `3100`, delete `.next`, run `npm run dev`.
- Run `npm run qa:auth:seed`.
- Run `npm run qa:runtime`.
- Run `npx.cmd tsc --noEmit`.
- Run `npm.cmd run build`.
- Open `http://localhost:3100/chats` with an authenticated Alice session.

## Auth And Shell

- Alice and Bob can sign in with persistent sessions.
- `/chats` redirects anonymous users to `/login?next=%2Fchats`.
- Authenticated `/chats` renders the app shell, sidebar, chat list, and mobile nav.
- No transient "Please log in" state appears after an authenticated chat opens.
- `globals.css` is loaded and Tailwind classes render.
- Browser console has no app errors.

## Messaging

- Alice sends a text message to Bob.
- Bob receives the message through Realtime without refresh.
- Optimistic Alice message reconciles to one server message.
- No duplicate messages appear after reconnect or refresh.
- Edit message works inside the edit window.
- Delete for me hides only for the acting user.
- Delete for everyone tombstones for both users.

## Reactions And Receipts

- Alice reacts to Bob's message.
- Bob sees the reaction through Realtime.
- Toggling a reaction removes only the acting user's reaction.
- Read receipts insert when a chat is opened.
- Sender read state updates without duplicate receipts.

## Polls

- Alice creates a poll.
- Bob sees the poll through Realtime.
- Bob votes.
- Alice sees the vote through Realtime.
- Single-choice polls replace Bob's previous vote.
- Closed polls prevent new votes.

## Contacts

- Alice opens the contact picker.
- Seeded Bob contact appears.
- Alice shares Bob's contact into chat.
- Bob sees the contact card.
- Contact card renders profile fallback safely when avatar is missing.

## Live Locations

- Alice shares a live location.
- Bob sees the live location card.
- Alice location updates propagate to Bob through Realtime.
- Alice can stop live sharing.
- Expired sessions show ended state.
- Static location opens a maps URL.

## Events

- Alice creates an event.
- The event message appears exactly once.
- `events` row stores `message_id`, `chat_id`, title, description, location, `start_time`, `end_time`, `meeting_link`, `timezone`, and `created_by`.
- Bob RSVPs `going`, `maybe`, and `declined`.
- Alice sees RSVP updates through Realtime.
- Meeting link opens externally.
- ICS export downloads a valid `.ics` payload.
- Timezone persists and displays consistently.
- Legacy `starts_at` / `ends_at` columns do not block inserts.
- No null constraint failures occur.
- Event editing is currently not implemented and must be added before marking this section complete.

## Media And Attachments

- Temporary runtime QA note: `npm run qa:runtime` currently verifies the `attachments` bucket upload with the service-role client only, because authenticated `storage.objects` policies must be configured safely through the Supabase Dashboard.
- The app bucket name is `attachments`.
- Service-role upload success proves the bucket exists and signed URLs can be generated; it does not prove authenticated user upload/read policies.
- Alice uploads a small image.
- Uploading state appears and reconciles to a signed URL.
- Bob can open the signed URL while it is valid.
- Alice uploads a voice note.
- Voice note playback renders and plays.
- Document upload routes through the attachment path until FileNinja is integrated.
- Failed uploads remove optimistic placeholders and show an error.

## Ecosystem Integrations

- FileNinja config placeholders are `FILENINJA_API_URL` and `FILENINJA_API_KEY`.
- Rev-Pro config placeholders are `REVPRO_API_URL` and `REVPRO_API_KEY`.
- Provider API keys stay server-side only and must not use `NEXT_PUBLIC_` names.
- Attachment drawer shows FileNinja and Rev-Pro entry points as unavailable until provider jobs are implemented.
- No FileNinja or Rev-Pro API call should run when the provider is unconfigured.
- Slice 1 provider responses are typed config/unavailable responses only; they do not prove secure file transfer, transcription, summaries, captions, or notes.
- Supabase attachments remain the active upload path until FileNinja upload sessions are implemented and verified.

## Realtime Recovery

- Open Alice and Bob in separate browser sessions.
- Disconnect network or pause one tab.
- Send a message while disconnected.
- Reconnect and verify the message list converges without duplicates.
- Reactions, votes, RSVP, reads, and live location state converge after reconnect.

## Mobile

- Test `/chats` at 390x844.
- Chat list and chat detail do not overlap.
- Attachment drawer is reachable by thumb.
- Poll, contact, location, and event dialogs fit without clipped text.
- Touch targets are at least 44px where practical.
- Keyboard open state does not hide the composer.

## Evidence To Capture

- `npx.cmd tsc --noEmit` output.
- `npm.cmd run build` output.
- `npm run qa:runtime` JSON report.
- Desktop screenshot of authenticated chat.
- Mobile screenshot of authenticated chat.
- Event card screenshot after RSVP.
- Attachment upload proof with signed URL generated, but do not store the URL in committed files.
