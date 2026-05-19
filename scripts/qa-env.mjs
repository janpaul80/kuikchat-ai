import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

export const QA_DIR = join(process.cwd(), '.tmp', 'qa-auth')
export const SESSION_PATH = join(QA_DIR, 'sessions.json')
export const SEED_PATH = join(QA_DIR, 'seed.json')
export const REPORT_PATH = join(QA_DIR, 'runtime-report.json')

export const QA_EMAILS = {
  alice: process.env.KUIKCHAT_QA_ALICE_EMAIL || 'kuikchat.qa+alice@example.com',
  bob: process.env.KUIKCHAT_QA_BOB_EMAIL || 'kuikchat.qa+bob@example.com',
}

export const QA_PASSWORD =
  process.env.KUIKCHAT_QA_PASSWORD || 'KuikChat-QA-local-2026!'

export function loadDotEnvLocal() {
  let text = ''
  try {
    text = readFileSync('.env.local', 'utf8')
  } catch {
    return
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

export function requireSupabaseEnv() {
  loadDotEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const missing = []
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(', ')}`)
  }

  return { url, anonKey, serviceRoleKey }
}

export function createServiceClient() {
  const { url, serviceRoleKey } = requireSupabaseEnv()
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createAnonClient() {
  const { url, anonKey } = requireSupabaseEnv()
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function signInQaUser(email) {
  const client = createAnonClient()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: QA_PASSWORD,
  })
  if (error) throw new Error(`QA sign-in failed for ${email}: ${error.message}`)
  return { client, user: data.user, session: data.session }
}

export function ensureQaDir() {
  mkdirSync(QA_DIR, { recursive: true })
}

export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function redactSession(session) {
  if (!session) return null
  return {
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user
      ? {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        }
      : null,
  }
}

export function assertStep(report, name, condition, details = {}) {
  report.steps.push({
    name,
    status: condition ? 'pass' : 'fail',
    details,
  })
  if (!condition) {
    report.ok = false
  }
}

export async function must(label, promise) {
  const { data, error } = await promise
  if (error) throw new Error(`${label}: ${error.message}`)
  return data
}

export function waitForEvent(labelOrChannelFactory, maybeChannelFactory, maybeAction, maybePredicate, maybeOptions) {
  const hasLabel = typeof labelOrChannelFactory === 'string'
  const label = hasLabel ? labelOrChannelFactory : 'unnamed realtime wait'
  const channelFactory = hasLabel ? maybeChannelFactory : labelOrChannelFactory
  const action = hasLabel ? maybeAction : maybeChannelFactory
  const predicate = hasLabel ? maybePredicate : maybeAction
  const rawOptions = hasLabel ? maybeOptions : maybePredicate
  const options = typeof rawOptions === 'number' ? { timeoutMs: rawOptions } : rawOptions || {}
  const timeoutMs = options.timeoutMs ?? 30000
  const onStatus = options.onStatus || (() => {})
  const onPayload = options.onPayload || (() => {})

  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(`${label}: timed out waiting for realtime event`))
    }, timeoutMs)

    const cleanupFns = []
    function cleanup() {
      clearTimeout(timeout)
      for (const fn of cleanupFns.splice(0)) fn()
    }

    const channel = channelFactory((payload) => {
      onPayload(payload)
      if (settled || !predicate(payload)) return
      settled = true
      cleanup()
      resolve(payload)
    })

    cleanupFns.push(() => {
      try {
        channel.unsubscribe()
      } catch {}
    })

    channel.subscribe(async (status, error) => {
      onStatus(status, error)
      if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') && !settled) {
        settled = true
        cleanup()
        reject(new Error(`${label}: realtime subscription ${status}${error?.message ? `: ${error.message}` : ''}`))
        return
      }
      if (status !== 'SUBSCRIBED' || settled) return
      try {
        await action()
      } catch (error) {
        settled = true
        cleanup()
        reject(error)
      }
    })
  })
}
