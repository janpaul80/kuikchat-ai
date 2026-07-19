# KuikChat standing instructions

- Project is KuikChat: a dark-themed authenticated chat and business-tools platform with Hermes AI.
- It is not a game platform; do not add player, shop, coins, gems, inventory, or progression features.
- Standard chat must use the existing production model: `chats` + `chat_members` + `messages`.
- Do not create parallel `conversations` or `conversation_participants` tables for standard chat.
- Use `profiles.id` as membership identity; do not add/use `profiles.user_id` to fix profile/chat membership issues.
- Business profile schema uses `profiles.id` and `profiles.bio`; do not reference `profiles.about`.
- Use `chats.type = 'direct'` for one-to-one chats.
- Use authenticated Supabase sessions and RLS. Never trust client-provided sender IDs.
- Never expose Langdock, OpenRouter, Supabase service-role, or other privileged keys in frontend code.
- Do not use Mistral for KuikChat.
- Do not change DNS or move Vercel domains without explicit approval.
- Do not begin audio/video call implementation until standard chat and Hermes AI are verified in production.
- Legacy AI function `supabase/functions/ai-chat` should receive no new traffic; confirm references are gone before deleting/deprecating it.
