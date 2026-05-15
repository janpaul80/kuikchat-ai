import { NextResponse } from 'next/server'
import { chatWithHermes, getLangdockConfig } from '@/lib/openai/hermes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DIAGNOSTIC ENDPOINT — raw-fetch Langdock probe.
 *
 * The OpenAI SDK swallows non-JSON error bodies (you get "400 status code
 * (no body)" even when the server DID return useful info). This endpoint
 * bypasses the SDK and uses native fetch() so we can see EXACTLY what
 * Langdock is returning — status, headers, body text.
 *
 * Usage:
 *   GET /api/debug/langdock                     → probe all candidate URLs
 *   GET /api/debug/langdock?baseURL=<URL>       → probe one URL
 *   GET /api/debug/langdock?model=<MODEL_ID>    → override model
 *   GET /api/debug/langdock?verbose=1           → include full response headers
 *
 * DELETE THIS FILE before production deploy.
 */

const CANDIDATE_BASE_URLS = [
  '__configured__',
  'https://api.langdock.com/openai/v1',
  'https://api.langdock.com/openai/eu/v1',
  'https://api.langdock.com/openai/us/v1',
  'https://api.langdock.com/assistant/v1',
  'https://api.langdock.com/openai',
  'https://api.langdock.com/assistant/eu/v1',
  'https://api.langdock.com/assistant/us/v1',
]

const CANDIDATE_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'claude-3-5-sonnet-latest',
]

type ProbeResult = {
  baseURL: string
  model: string
  endpoint: string
  status: number
  ok: boolean
  latencyMs: number
  bodyPreview: string
  bodyJson?: unknown
  headers?: Record<string, string>
  error?: string
}

async function rawProbe(
  apiKey: string,
  baseURL: string,
  model: string,
  verbose: boolean
): Promise<ProbeResult> {
  const endpoint = `${baseURL.replace(/\/$/, '')}/chat/completions`
  const started = Date.now()

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(15000),
    })

    const bodyText = await resp.text()
    let bodyJson: unknown
    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : undefined
    } catch {
      // Not JSON — keep as text
    }

    const headers: Record<string, string> = {}
    if (verbose) {
      resp.headers.forEach((v, k) => {
        headers[k] = v
      })
    }

    return {
      baseURL,
      model,
      endpoint,
      status: resp.status,
      ok: resp.ok,
      latencyMs: Date.now() - started,
      bodyPreview: bodyText.slice(0, 800),
      bodyJson,
      headers: verbose ? headers : undefined,
    }
  } catch (err: any) {
    return {
      baseURL,
      model,
      endpoint,
      status: 0,
      ok: false,
      latencyMs: Date.now() - started,
      bodyPreview: '',
      error: err?.message?.slice(0, 300) || 'Network error',
    }
  }
}

export async function GET(req: Request) {
  const cfg = getLangdockConfig()

  if (!cfg.apiKey) {
    return NextResponse.json(
      { ok: false, error: 'LANGDOCK_API_KEY is not set in .env.local' },
      { status: 503 }
    )
  }

  const url = new URL(req.url)
  const overrideBaseURL = url.searchParams.get('baseURL')
  const overrideModel = url.searchParams.get('model')
  const verbose = url.searchParams.get('verbose') === '1'
  const live = url.searchParams.get('live') === '1'

  // --- Live mode: exercise the full chatWithHermes() code path ---
  if (live) {
    const started = Date.now()
    try {
      const prompt = url.searchParams.get('prompt') || 'Say hi in exactly 6 words.'
      const resp: any = await chatWithHermes({
        messages: [{ role: 'user', content: prompt }],
        mode: 'casual',
        model: overrideModel || undefined,
      })
      const reply = resp?.choices?.[0]?.message?.content ?? ''
      const usage = resp?.usage ?? null
      return NextResponse.json({
        ok: reply.length > 0,
        mode: 'live-chat',
        model: resp?.model,
        prompt,
        reply,
        replyLength: reply.length,
        latencyMs: Date.now() - started,
        usage,
        finishReason: resp?.choices?.[0]?.finish_reason,
        note:
          reply.length === 0
            ? 'Empty reply — likely reasoning model consumed all budget. Try a larger maxTokens or a `*-chat-*` model.'
            : 'Working end-to-end ✅',
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      return NextResponse.json(
        {
          ok: false,
          mode: 'live-chat',
          error: err?.message?.slice(0, 500) || 'Unknown error',
          status: err?.status,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  }

  // --- Single-target mode ---
  if (overrideBaseURL) {
    const result = await rawProbe(
      cfg.apiKey,
      overrideBaseURL,
      overrideModel || cfg.chatModel,
      true
    )
    return NextResponse.json(
      {
        ok: result.ok,
        mode: 'single',
        result,
        hint: result.ok
          ? `✅ SUCCESS! Put in .env.local: LANGDOCK_BASE_URL=${overrideBaseURL}`
          : `Status ${result.status}. Inspect the body to understand what Langdock wants.`,
        timestamp: new Date().toISOString(),
      },
      { status: result.ok ? 200 : 500 }
    )
  }

  // --- Auto-probe mode ---
  const baseURLs = Array.from(
    new Set(
      CANDIDATE_BASE_URLS.map((u) => (u === '__configured__' ? cfg.baseURL : u))
    )
  )
  const primaryModel = overrideModel || cfg.chatModel
  const results: ProbeResult[] = []

  // Round 1: all base URLs with primary model
  for (const base of baseURLs) {
    results.push(await rawProbe(cfg.apiKey, base, primaryModel, verbose))
  }

  let winner = results.find((r) => r.ok)

  // Round 2: if no winner and we got any 200-class or 4xx with real bodies,
  // try other models on promising URLs (those that returned non-404)
  if (!winner) {
    const promising = results.filter(
      (r) => r.status !== 404 && r.status !== 0 && !r.ok
    )
    outer: for (const base of promising.map((p) => p.baseURL)) {
      for (const model of CANDIDATE_MODELS.filter((m) => m !== primaryModel)) {
        const r = await rawProbe(cfg.apiKey, base, model, verbose)
        results.push(r)
        if (r.ok) {
          winner = r
          break outer
        }
      }
    }
  }

  // Diagnostic summary
  const by404 = results.filter((r) => r.status === 404).length
  const by400 = results.filter((r) => r.status === 400).length
  const by401 = results.filter((r) => r.status === 401).length
  const by403 = results.filter((r) => r.status === 403).length
  const by200 = results.filter((r) => r.ok).length

  return NextResponse.json(
    {
      ok: !!winner,
      mode: 'auto-probe-raw',
      provider: 'langdock',
      currentConfig: {
        baseURL: cfg.baseURL,
        chatModel: cfg.chatModel,
      },
      keyPreview: `${cfg.apiKey.slice(0, 6)}...${cfg.apiKey.slice(-4)} (len ${cfg.apiKey.length})`,
      winner: winner
        ? {
            baseURL: winner.baseURL,
            model: winner.model,
            latencyMs: winner.latencyMs,
            replyPreview: winner.bodyPreview.slice(0, 200),
          }
        : null,
      hint: winner
        ? [
            `✅ Found working Langdock endpoint!`,
            `Add to .env.local:`,
            `  LANGDOCK_BASE_URL=${winner.baseURL}`,
            `  LANGDOCK_CHAT_MODEL=${winner.model}`,
            `Restart dev server after saving.`,
          ].join('\n')
        : [
            `❌ No working endpoint found.`,
            `Summary: ${by200} ok · ${by400} bad-request · ${by401} unauth · ${by403} forbidden · ${by404} not-found`,
            by400 > 0
              ? `Promising: some URLs returned 400 — your key is valid but request format is off. Inspect "allResults[].bodyJson" for the exact Langdock error message.`
              : `All URLs rejected the key. Double-check LANGDOCK_API_KEY at https://app.langdock.com → Settings → API Keys.`,
          ].join('\n'),
      stats: { total: results.length, ok: by200, 400: by400, 401: by401, 403: by403, 404: by404 },
      allResults: results,
      timestamp: new Date().toISOString(),
    },
    { status: winner ? 200 : 500 }
  )
}
