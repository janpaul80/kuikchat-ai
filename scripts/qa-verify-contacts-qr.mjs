import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const SESS_PATH = '.tmp/qa-auth/sessions.json'
function loadEnv(key) {
  try {
    const txt = readFileSync('.env.local', 'utf8')
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^([^=#]+)=(.*)$/)
      if (m && m[1].trim() === key) return m[2].trim().replace(/^['"]|['"]$/g, '')
    }
  } catch {}
  return process.env[key]
}

const SUPA_URL = loadEnv('NEXT_PUBLIC_SUPABASE_URL')
if (!SUPA_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
const host = new URL(SUPA_URL).host // <ref>.supabase.co
const projectRef = host.split('.')[0]
const storageKey = `sb-${projectRef}-auth-token`

function log(msg){ console.log(`[qr-verify] ${msg}`)}

async function run(){
  const sessions = JSON.parse(readFileSync(SESS_PATH, 'utf8'))
  const session = sessions.alice
  if (!session || !session.access_token) throw new Error('No QA session for alice; run npm run qa:auth:seed')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ acceptDownloads: true })
  const page = await context.newPage()
  try {
    // Seed Supabase session into localStorage before any script runs
    await page.addInitScript(([key, sess]) => {
      const payload = {
        currentSession: {
          access_token: sess.access_token,
          token_type: sess.token_type,
          expires_in: sess.expires_in,
          expires_at: sess.expires_at,
          refresh_token: sess.refresh_token,
          user: sess.user,
        },
        expiresAt: sess.expires_at,
        currentUser: sess.user,
      }
      window.localStorage.setItem(key, JSON.stringify(payload))
    }, [storageKey, session])

    log('goto /contacts (with pre-seeded session)')
    await page.goto('https://kuikchat.io/contacts', { waitUntil: 'domcontentloaded' })

    // Confirm app shell visible and QR section present
    await page.getByText('Share Profile QR', { exact: false }).waitFor({ timeout: 15000 })

    // Wait for QR canvas and give a tick
    const canvas = await page.waitForSelector('canvas', { timeout: 15000 })
    await page.waitForTimeout(600)

    const dataUrl = await canvas.evaluate((el) => el.toDataURL('image/png'))
    if (!dataUrl || dataUrl.length < 500) throw new Error(`QR dataURL too small (len=${dataUrl?.length || 0})`)
    log(`QR canvas dataURL len=${dataUrl.length}`)

    // Trigger download and confirm
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.getByRole('button', { name: /download qr png/i }).click(),
    ])
    const path = await dl.path()
    if (!path) throw new Error('No download path returned')
    log(`Downloaded: ${path}`)

    console.log('\nCONFIRM: CONTACTS_QR_OK')
  } finally {
    await page.close(); await context.close(); await browser.close()
  }
}

run().catch(e => { console.error(`[qr-verify] ERROR: ${e.message}`); process.exit(1) })
