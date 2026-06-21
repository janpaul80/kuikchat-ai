/**
 * Hermes AI Provider - Langdock
 * -----------------------------------------------------------------------------
 * KuikChat uses Langdock (https://langdock.com) as the AI provider abstraction
 * for Hermes. Langdock exposes an OpenAI-compatible REST API gateway, so we
 * can reuse the official `openai` npm SDK by simply pointing it at Langdock's
 * base URL with the Langdock API key.
 *
 * Environment variables (configure in .env.local):
 *   LANGDOCK_API_KEY         - required. Your Langdock API key.
 *   LANGDOCK_BASE_URL        - optional. Default: https://api.langdock.com/openai/v1
 *   LANGDOCK_CHAT_MODEL      - optional. Default: gpt-4o-mini
 *   LANGDOCK_IMAGE_MODEL     - optional. Default: dall-e-3
 *   LANGDOCK_TRANSCRIBE_MODEL- optional. Default: whisper-1
 *
 * Pick any model name your Langdock workspace has enabled. Langdock proxies
 * multiple upstream providers (OpenAI, Anthropic, Mistral, Google, etc.) so
 * you can put things like `gpt-4o`, `claude-3-5-sonnet-20241022`, `mistral-large`
 * etc. depending on what's activated in your Langdock dashboard.
 * -----------------------------------------------------------------------------
 */
import OpenAI from 'openai'

// Langdock EU region - confirmed working base URL for the OpenAI-compatible gateway.
// US region currently has no models enabled. Override with LANGDOCK_BASE_URL if needed.
export const LANGDOCK_DEFAULT_BASE_URL = 'https://api.langdock.com/openai/eu/v1'

// Default model - `gpt-5-chat-latest` is the conversational (non-reasoning)
// variant, which is ideal for chat UX: no reasoning-token overhead means
// faster responses, lower cost, and no risk of empty replies when the model
// burns the whole token budget on hidden reasoning steps.
//
// Reasoning variants available if you want deeper analysis:
//   - `gpt-5-mini` / `gpt-5` / `o3` / `o4-mini` - reasoning models
//   - `gpt-5.2-pro` - top-tier reasoning
// Override per-request by passing `model` to chatWithHermes(), or globally
// via LANGDOCK_CHAT_MODEL in .env.local.
export const LANGDOCK_DEFAULT_CHAT_MODEL = 'gpt-5-chat-latest'

// Generous default completion budget so reasoning models don't return
// empty strings on short probes.
export const HERMES_DEFAULT_MAX_TOKENS = 1024

// Image + transcribe: Langdock may or may not proxy these. If they don't work,
// override via env vars or disable the corresponding Hermes features.
export const LANGDOCK_DEFAULT_IMAGE_MODEL = 'dall-e-3'
export const LANGDOCK_DEFAULT_TRANSCRIBE_MODEL = 'whisper-1'

// Static fallback list for UI pickers when /models endpoint isn't exposed.
// Refreshed from Langdock workspace error response on 2025-04-24.
export const LANGDOCK_KNOWN_MODELS: readonly string[] = [
  'gpt-5-mini',
  'gpt-5',
  'gpt-5-chat-latest',
  'gpt-5.1',
  'gpt-5.1-chat-latest',
  'gpt-5.2',
  'gpt-5.2-pro',
  'gpt-5.4',
  'gpt-5.4-mini',
  'o3',
  'o4-mini',
] as const

export function getLangdockConfig() {
  const apiKey = process.env.LANGDOCK_API_KEY
  const baseURL = process.env.LANGDOCK_BASE_URL || LANGDOCK_DEFAULT_BASE_URL
  const chatModel = process.env.LANGDOCK_CHAT_MODEL || LANGDOCK_DEFAULT_CHAT_MODEL
  const imageModel = process.env.LANGDOCK_IMAGE_MODEL || LANGDOCK_DEFAULT_IMAGE_MODEL
  const transcribeModel =
    process.env.LANGDOCK_TRANSCRIBE_MODEL || LANGDOCK_DEFAULT_TRANSCRIBE_MODEL

  return { apiKey, baseURL, chatModel, imageModel, transcribeModel }
}

export function isHermesConfigured(): boolean {
  return !!process.env.LANGDOCK_API_KEY
}

// Lazy singleton - LANGDOCK_API_KEY isn't required at build time
let _client: OpenAI | null = null
export function getHermesClient(): OpenAI {
  if (!_client) {
    const { apiKey, baseURL } = getLangdockConfig()
    if (!apiKey) {
      throw new Error(
        'LANGDOCK_API_KEY environment variable is not set. ' +
          'Add it to .env.local to enable Hermes AI features.'
      )
    }
    _client = new OpenAI({ apiKey, baseURL })
  }
  return _client
}

/**
 * Backwards-compat alias. Internally points to Langdock via OpenAI-compatible SDK.
 * Prefer `getHermesClient()` in new code.
 */
export const getOpenAI = getHermesClient

export const HERMES_SYSTEM_PROMPTS = {
  professional: `You are Hermes, the AI assistant inside KuikChat. Respond in a formal, concise, business-focused tone. Be direct, accurate, and respectful. Avoid slang.`,
  casual: `You are Hermes, the AI assistant inside KuikChat. Respond in a friendly, conversational, relaxed tone. Use natural language.`,
  creative: `You are Hermes, the AI assistant inside KuikChat. Respond with imagination, expression, and artistic flair. Use vivid language and creative metaphors.`,
  analytical: `You are Hermes, the AI assistant inside KuikChat. Respond with data-driven, precise, detailed answers. Use structured formats, bullet points, and cite reasoning.`,
  multilingual: `You are Hermes, the AI assistant inside KuikChat. Auto-detect the user's language and respond in the same language. Be helpful and natural.`,
} as const

export type HermesMode = keyof typeof HERMES_SYSTEM_PROMPTS

export const HERMES_DASH_RULE = `\n\nWriting rule:\nWhen drafting, summarizing, or rewriting any message for a KuikChat user:\n- NEVER use a long dash (em or en). Use a comma, a period, or a plain hyphen.\n- Write the way people text: short sentences, plain words, no AI tells.\n- Prefer two short sentences over one long sentence joined by a dash.`

export const HERMES_EMOJI_RULE = `\n- STRICTLY FORBIDDEN: NEVER use any emojis, emoticons, or pictorial symbols (such as 👋, ✨, 😊, etc.) in your response. Always respond using standard text only.`

export interface HermesMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Returns true for Langdock/OpenAI "reasoning" model families that consume
 * a chunk of the completion budget on hidden reasoning tokens before emitting
 * visible content. These models also typically ignore `temperature`.
 */
function isReasoningModel(modelId: string): boolean {
  const id = modelId.toLowerCase()
  if (id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) return true
  // gpt-5 family: everything EXCEPT `*-chat-*` variants is a reasoning model.
  if (id.startsWith('gpt-5') && !id.includes('chat')) return true
  return false
}

export async function chatWithHermes({
  messages,
  mode = 'casual',
  stream = false,
  model,
  maxTokens,
  temperature,
}: {
  messages: HermesMessage[]
  mode?: HermesMode
  stream?: boolean
  model?: string
  maxTokens?: number
  temperature?: number
}) {
  const { chatModel } = getLangdockConfig()
  const resolvedModel = model || chatModel
  const systemPrompt = HERMES_SYSTEM_PROMPTS[mode] + HERMES_DASH_RULE + HERMES_EMOJI_RULE
  const fullMessages: HermesMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const reasoning = isReasoningModel(resolvedModel)

  // Build payload. Reasoning models: skip temperature (they reject anything
  // other than the default) and use `max_completion_tokens`.
  const payload: Record<string, unknown> = {
    model: resolvedModel,
    messages: fullMessages,
    stream,
  }

  if (reasoning) {
    payload.max_completion_tokens = maxTokens ?? HERMES_DEFAULT_MAX_TOKENS
  } else {
    payload.max_tokens = maxTokens ?? HERMES_DEFAULT_MAX_TOKENS
    payload.temperature = temperature ?? 0.7
  }

  const response = await getHermesClient().chat.completions.create(payload as any)
  return response
}

export async function generateImage(prompt: string, model?: string) {
  const { imageModel } = getLangdockConfig()
  const response = await getHermesClient().images.generate({
    model: model || imageModel,
    prompt,
    n: 1,
    size: '1024x1024',
  })
  return response.data?.[0]?.url
}

export async function transcribeAudio(audioFile: File, model?: string) {
  const { transcribeModel } = getLangdockConfig()
  const response = await getHermesClient().audio.transcriptions.create({
    file: audioFile,
    model: model || transcribeModel,
  })
  return response.text
}

export async function translateText(text: string, targetLang: string) {
  const { chatModel } = getLangdockConfig()
  const response = await getHermesClient().chat.completions.create({
    model: chatModel,
    messages: [
      {
        role: 'system',
        content: `You are a translation engine. Translate the user's text to ${targetLang}. Output ONLY the translation, no explanations.` + HERMES_DASH_RULE,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
  })
  return response.choices[0]?.message?.content || ''
}

export async function rewriteTone(
  text: string,
  tone: 'professional' | 'casual' | 'friendly'
) {
  const { chatModel } = getLangdockConfig()
  const response = await getHermesClient().chat.completions.create({
    model: chatModel,
    messages: [
      {
        role: 'system',
        content: `Rewrite the user's text in a ${tone} tone. Preserve meaning. Output only the rewritten text.` + HERMES_DASH_RULE,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.5,
  })
  return response.choices[0]?.message?.content || ''
}

export async function summarizeMessages(messages: string[]) {
  const { chatModel } = getLangdockConfig()
  const response = await getHermesClient().chat.completions.create({
    model: chatModel,
    messages: [
      {
        role: 'system',
        content:
          'Summarize the following chat conversation concisely with key points and action items.' + HERMES_DASH_RULE,
      },
      { role: 'user', content: messages.join('\n') },
    ],
    temperature: 0.4,
  })
  return response.choices[0]?.message?.content || ''
}

/**
 * Lists the models available through your Langdock workspace.
 *
 * Strategy:
 *   1. Try the OpenAI-compatible /models endpoint (some Langdock setups expose it).
 *   2. Fall back to probing /chat/completions with a bogus model name - Langdock
 *      helpfully returns the list of valid models in the 400 error message.
 *   3. Final fallback: return the hardcoded LANGDOCK_KNOWN_MODELS list.
 */
export async function listAvailableModels(): Promise<
  Array<{ id: string; created?: number; owned_by?: string }>
> {
  const { apiKey, baseURL } = getLangdockConfig()
  if (!apiKey) throw new Error('LANGDOCK_API_KEY not set')

  // --- Attempt 1: /models endpoint ---
  try {
    const res = await fetch(`${baseURL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data
      }
    }
  } catch {
    // fall through
  }

  // --- Attempt 2: Probe /chat/completions to extract model list from error ---
  try {
    const probeRes = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: '__probe_for_available_models__',
        messages: [{ role: 'user', content: 'probe' }],
        max_tokens: 1,
      }),
      cache: 'no-store',
    })

    if (probeRes.status === 400) {
      const body = await probeRes.json().catch(() => null)
      const msg: string | undefined = body?.message
      // Expected format: "Invalid model, available models are: a, b, c"
      if (msg && typeof msg === 'string') {
        const match = msg.match(/available models are:\s*(.+)$/i)
        if (match) {
          const ids = match[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          if (ids.length > 0) {
            return ids.map((id) => ({ id, owned_by: 'langdock' }))
          }
        }
      }
    }
  } catch {
    // fall through
  }

  // --- Attempt 3: Hardcoded fallback ---
  return LANGDOCK_KNOWN_MODELS.map((id) => ({ id, owned_by: 'langdock-static' }))
}
