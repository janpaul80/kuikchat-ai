/**
 * KuikChat - design tokens (single source of truth for web + Android)
 * Path: src/theme/tokens.ts
 *
 * Use these everywhere. Do not hardcode hex values in screens.
 */
export const KC = {
  brand: {
    blue:  "#3b82f6",
    green: "#22c55e",
    gradient: "linear-gradient(135deg, #3b82f6, #22c55e)",
    hermes: "#a78bfa",
  },
  bg: {
    base:     "var(--bg-base)",
    surface:  "var(--bg-surface)",
    elevated: "var(--bg-elevated)",
    // backwards compatibility
    app:      "var(--bg-base)",
    screen:   "var(--bg-base)",
    card:     "var(--bg-surface)",
    avatar:   "var(--bg-base)",
  },
  text: {
    primary:   "var(--text-primary)",
    secondary: "var(--text-secondary)",
    body:      "var(--text-secondary)",
    muted:     "var(--text-secondary)",
    dim:       "var(--text-dim)",
  },
  border: "var(--border)",
  hairline: "var(--border)",
  radius: { card: 16, pill: 999, avatar: 999 },
} as const;
