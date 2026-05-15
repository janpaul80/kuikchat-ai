/**
 * 48 curated emojis for the reactions panel.
 * Kept as a constant array so we avoid the weight of `emoji-mart` etc.
 * Ordered by popularity / grouping for a natural scan pattern.
 */
export const REACTION_EMOJIS: readonly string[] = [
  // Positive — most used first
  '👍', '❤️', '😂', '🔥', '🎉', '😮',
  '😢', '😡', '🙏', '👏', '💯', '✨',

  // Smileys
  '😀', '😅', '😍', '😘', '🤔', '🤗',
  '🥳', '😎', '🤯', '😴', '🤤', '🙃',

  // Gestures
  '👋', '🤝', '✌️', '🤞', '👌', '💪',
  '🫶', '🤌', '🤟', '🙌', '👉', '👈',

  // Objects / concepts
  '💡', '🎯', '📌', '⚡', '🏆', '🎁',
  '💎', '🚀', '📝', '✅', '❌', '❓',
] as const

/**
 * Quick-pick strip shown on bubble hover (before the full popover opens).
 * Keep this short — 5–6 is the sweet spot visually.
 */
export const QUICK_REACTIONS: readonly string[] = [
  '👍', '❤️', '😂', '😮', '😢', '🙏',
] as const

export function isValidReactionEmoji(emoji: string): boolean {
  return (
    typeof emoji === 'string' &&
    emoji.length > 0 &&
    emoji.length <= 16
  )
}
