# Slice 2c — Business Tools Hub

## Status: In Progress

## Branch: `slice/2c-business-tools-hub`

## What We're Building

A grouped landing hub inside the Business tab — the central navigation area for all business features.
This hub is additive (does not touch any existing chat code) and serves as the shell that
future slices (2d–2g) will plug into.

---

## UI Structure

### Pinned Promo Card (top)
- Title: "Share your business"
- Subtitle: "Let customers find and message you"
- CTA button: "Share Now" (navigates to Slice 2f QR share — for now, coming soon)
- Style: blue→green gradient background, SVG icon only (no emoji)

### Group: Grow
| Item | Icon | Action |
|------|------|--------|
| Catalog | ShoppingBag SVG | Coming soon (Slice 8) |
| Broadcasts | Megaphone SVG | Coming soon (Slice 2d) |

### Group: Organize
| Item | Icon | Action |
|------|------|--------|
| Lists & Labels | Tag SVG | Coming soon (Slice 2e) |
| Greeting message | MessageSquare SVG | Coming soon (Slice 2e) |
| Away message | Clock SVG | Coming soon (Slice 2e) |
| Quick replies | Zap SVG | Coming soon (Slice 2e) |

### Group: Manage
| Item | Icon | Action |
|------|------|--------|
| Profile | User SVG | Opens existing BusinessProfileWizard (Slice 2b) |
| Branding | Palette SVG | Coming soon |

---

## Design Rules (STRICT)
- Dark professional theme — matches existing app dark background
- blue→green gradient accents (matches brand-gradient CSS class)
- SVG icons ONLY — no emoji
- No fake data — "Coming soon" label on any unbuilt action
- No device frame
- Naturally responsive (mobile + desktop)
- Use existing Radix UI + Tailwind CSS + shadcn components only

---

## File Structure to Create

```
src/components/business/
  BusinessToolsHub.tsx       ← Main hub component
  tools/
    PromoCard.tsx            ← "Share your business" promo
    ToolGroup.tsx            ← Reusable group with title + rows
    ToolRow.tsx              ← Individual tool row (icon + label + action)
```

---

## Integration Point

In `src/pages/Chat.tsx` and `src/components/chat/ChatSidebar.tsx`:

1. Add `"Business"` to the `SidebarView` type
2. Add a Business icon to the nav (Briefcase from lucide-react)
3. Add `case "Business": return <BusinessToolsHub />;` in `renderContent()`
4. Add to Mobile Bottom Nav

---

## Acceptance Criteria

- [ ] Business tab appears in sidebar (desktop) and mobile bottom nav
- [ ] Hub shows pinned "Share your business" promo card
- [ ] Three groups rendered: Grow, Organize, Manage
- [ ] All items show correct icon + label
- [ ] "Coming soon" items are clearly labeled (honest, not fake-active)
- [ ] "Profile" row navigates to the existing business profile wizard
- [ ] No TypeScript errors
- [ ] Builds successfully with `bun run build`
- [ ] Pushed to GitHub branch `slice/2c-business-tools-hub`
- [ ] Deployed to 217.154.11.234

---

## What NOT to Do
- Do NOT add fake "connected" states
- Do NOT add fake counts or badges
- Do NOT rewrite existing components (additive only)
- Do NOT add Analytics tab
- Do NOT use emojis as icons
- Do NOT add a device frame wrapper
