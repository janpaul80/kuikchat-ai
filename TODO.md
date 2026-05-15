# KuikChat Slice B Bugfix TODO (QA Failures)

## Priority 1 — Duplicate message rendering
- [ ] Refactor `RealChatWindow` message state to deterministic dedupe by `message.id`
- [ ] Ensure single realtime subscription lifecycle per `chatId`
- [ ] Prevent duplicate append from optimistic + realtime server insert race

## Priority 2 — Sender message disappearing
- [ ] Add robust optimistic send with temp-id reconciliation
- [ ] Prevent local state replacement/removal on unrelated UPDATE events
- [ ] Validate sender keeps message after ack/realtime update

## Priority 3 — Latency / speed
- [ ] Remove bulk refetch loops on reaction/read updates
- [ ] Apply incremental local updates from realtime payloads
- [ ] Throttle/debounce read-receipt writes (`mark_chat_as_read`)
- [ ] Keep send path lightweight (single RPC + reconcile)

## Priority 4 — Premium/professional message actions + reactions UX
- [ ] Polish `MessageBubble` hover actions with subtle icon strip
- [ ] Hide actions until hover/focus
- [ ] Replace large emoji box with compact quick reactions
- [ ] Quick reaction set only: 👍 👎 ❤️ 😂 😮 😢
- [ ] Render only chosen reactions on message

## Validation
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Focused QA retest:
  - [ ] No duplicates
  - [ ] No disappearing sender message
  - [ ] Improved send/receive responsiveness
  - [ ] Premium action/reaction UX confirmed
