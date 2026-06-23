#!/usr/bin/env node
/**
 * Backfill script: ensure community owners/admins are members of Announcements and General chats
 * for existing communities created before the seed/membership pipeline fix.
 *
 * SAFE OPS:
 * - READ communities (by optional slug/name filter or all)
 * - For each community, find chats (announcement_only and "general")
 * - For each owner/admin in community_members, ensure chat_members rows exist with role escalated
 * - Idempotent: uses unique(chat_id, user_id) and UPSERT-like logic (try insert, ignore on conflict)
 * - DRY-RUN default; pass APPLY=1 to write changes
 *
 * USAGE:
 *   APPLY=1 node scripts/backfill_community_chat_members.mjs --slug atlaslm
 *   node scripts/backfill_community_chat_members.mjs --all
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .option('slug', { type: 'string', describe: 'Community slug to backfill' })
  .option('name', { type: 'string', describe: 'Community name to backfill (ILIKE %name%)' })
  .option('all', { type: 'boolean', default: false, describe: 'Process all communities' })
  .parseSync()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function main() {
  let commQuery = supabase.from('communities').select('*')
  if (argv.slug) commQuery = commQuery.eq('slug', argv.slug)
  if (argv.name) commQuery = commQuery.ilike('name', `%${argv.name}%`)
  const { data: comms, error: commErr } = await commQuery
  if (commErr) throw commErr

  for (const c of comms || []) {
    const { data: members } = await supabase
      .from('community_members')
      .select('user_id, role')
      .eq('community_id', c.id)

    const { data: chats } = await supabase
      .from('chats')
      .select('id, name, announcement_only, community_id')
      .eq('community_id', c.id)

    const ann = (chats || []).find(ch => ch.announcement_only)
    const gen = (chats || []).find(ch => (ch.name || '').toLowerCase() === 'general')

    const ownersAndAdmins = (members || []).filter(m => ['owner','admin'].includes(m.role))

    for (const m of ownersAndAdmins) {
      for (const ch of [ann, gen].filter(Boolean)) {
        // check exist
        const { data: cmExists } = await supabase
          .from('chat_members')
          .select('id')
          .eq('chat_id', ch.id)
          .eq('user_id', m.user_id)
          .maybeSingle()
        if (!cmExists) {
          if (process.env.APPLY === '1' || process.env.APPLY === 'true') {
            await supabase.from('chat_members').insert({
              chat_id: ch.id,
              user_id: m.user_id,
              role: m.role === 'owner' ? 'owner' : 'admin',
            })
            console.log(`[WRITE] inserted chat_members for community ${c.slug || c.name}, chat ${ch.name}, user ${m.user_id}`)
          } else {
            console.log(`[DRY] would insert chat_members for community ${c.slug || c.name}, chat ${ch.name}, user ${m.user_id}`)
          }
        }
      }
    }
  }

  console.log('Done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
