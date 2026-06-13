# KuikChat Slice B Bugfix TODO (QA Failures) — COMPLETED

## Priority 1 — Duplicate message rendering
- [x] Refactor `RealChatWindow` message state to deterministic dedupe by `message.id`
- [x] Ensure single realtime subscription lifecycle per `chatId`
- [x] Prevent duplicate append from optimistic + realtime server insert race

## Priority 2 — Sender message disappearing
- [x] Add robust optimistic send with temp-id reconciliation
- [x] Prevent local state replacement/removal on unrelated UPDATE events
- [x] Validate sender keeps message after ack/realtime update

## Priority 3 — Latency / speed
- [x] Remove bulk refetch loops on reaction/read updates
- [x] Apply incremental local updates from realtime payloads
- [x] Throttle/debounce read-receipt writes (`mark_chat_as_read`)
- [x] Keep send path lightweight (single RPC + reconcile)

## Priority 4 — Premium/professional message actions + reactions UX
- [x] Polish `MessageBubble` hover actions with subtle icon strip
- [x] Hide actions until hover/focus
- [x] Replace large emoji box with compact quick reactions
- [x] Quick reaction set only: 👍 👎 ❤️ 😂 😮 😢
- [x] Render only chosen reactions on message

## Validation
- [x] `npx tsc --noEmit`
- [x] `npm run build`
# KuikChat Slice B Bugfix TODO (QA Failures) — COMPLETED

## Priority 1 — Duplicate message rendering
- [x] Refactor `RealChatWindow` message state to deterministic dedupe by `message.id`
- [x] Ensure single realtime subscription lifecycle per `chatId`
- [x] Prevent duplicate append from optimistic + realtime server insert race

## Priority 2 — Sender message disappearing
- [x] Add robust optimistic send with temp-id reconciliation
- [x] Prevent local state replacement/removal on unrelated UPDATE events
- [x] Validate sender keeps message after ack/realtime update

## Priority 3 — Latency / speed
- [x] Remove bulk refetch loops on reaction/read updates
- [x] Apply incremental local updates from realtime payloads
- [x] Throttle/debounce read-receipt writes (`mark_chat_as_read`)
- [x] Keep send path lightweight (single RPC + reconcile)

## Priority 4 — Premium/professional message actions + reactions UX
- [x] Polish `MessageBubble` hover actions with subtle icon strip
- [x] Hide actions until hover/focus
- [x] Replace large emoji box with compact quick reactions
- [x] Quick reaction set only: 👍 👎 ❤️ 😂 😮 😢
- [x] Render only chosen reactions on message

## Validation
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] Focused QA retest:
  - [x] No duplicates
  - [x] No disappearing sender message
  - [x] Improved send/receive responsiveness
  - [x] Premium action/reaction UX confirmed

## Next Roadmap Priorities (Phase 3 & Beyond)
1. **Media Uploads & Attachment System**
   - [x] Modern attachment/action drawer (Photos, Camera, Location, Contact, Document, Poll, Event, AI Images)
   - [x] Advanced media picker (Albums/Recents tabs, Grid preview, HD toggle)
   - [x] Document/file system (native file picker, progress tracking)
2. **Voice Notes**
   - [x] Recording interface and playback
   - [x] Voice note preview in chat list
3. **Interactive Features**
   - Poll creation (question, multi-answer, scheduling)
   - Live location sharing & Contact sharing flow
4. **Mobile-First UX (Web)**
   - Premium dark UI, glass effects, native-feeling animations
   - Professional SVG icons (no oversized emojis)
5. **Business Mini Apps Architecture**
   - Business profiles, shared groups, export chat
6. **KuikChat Ecosystem Integrations**
   - **FileNinja**: Native professional file delivery (large files, secure expiring links, encrypted business sharing, resumable uploads)
   - **Rev-Pro**: AI-powered media utilities (transcribe/summarize pasted TikTok/YouTube links, convert voice/video to notes, translations)
7. **Hermes AI In-Chat Actions**
8. **Android App Foundation**
   - Build native app (not a web wrapper) after web MVP stabilizes
