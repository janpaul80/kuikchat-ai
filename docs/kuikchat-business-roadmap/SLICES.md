# KuikChat Business Mode — Slice Tracking

## Completed Slices (Approved)

| Slice | Status | Notes |
|-------|--------|-------|
| 2a — Save bug fix | ✅ Approved | Root cause: stale page caching |
| 2b — Stepped profile setup | ✅ Approved | 6-step wizard, multi-select categories |

## Current Slice

| Slice | Status | PR |
|-------|--------|-----|
| **2c — Business Tools hub** | 🔨 In Progress | Coming soon |

## Upcoming Slices (Backlog)

| Slice | Priority | Description |
|--------|---------|------------|
| 2d — Business chat / Customers | M | Wired to real chat, not parallel system |
| 2e — Greeting / away / quick replies | M | + labels |
| 2f — Share business + QR | M | Reuse existing QR engine |
| 2g — Social Connect | M | Instagram/Facebook OAuth |

## Future Roadmap

| Slice | Priority | Description |
|--------|---------|------------|
| 3 — Business Mode Switcher | L | ⭐ Foundation — identity split |
| 4 — Smart Inbox | M | Auto-Tags, Snooze, Follow-ups |
| 5 — Company Notebook | M | + Hermes pin suggestions |
| 6 — Client Portal | L | Booking, e-sign, payments |
| 7 — Burn After Reading | M | Secure docs |
| 8 — Shoppable Catalog | L | Video hotspots |
| 9 — Hyperframes × Hermes | XL | AI video generation |
| 10 — Livestream Shopping | XL | Live commerce |

---

## How to Update

When a slice is approved:
1. Move from "Current" to "Completed"
2. Add PR link to the table
3. Move next slice from "Backlog" to "Current"

When starting a new slice:
1. Create branch: `slice/{id}-{name}`
2. Update "Current" section above
3. Start building