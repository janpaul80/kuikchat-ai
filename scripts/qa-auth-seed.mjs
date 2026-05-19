import {
  QA_EMAILS,
  QA_PASSWORD,
  SEED_PATH,
  SESSION_PATH,
  createServiceClient,
  ensureQaDir,
  must,
  redactSession,
  signInQaUser,
  writeJson,
} from './qa-env.mjs'

async function findUserByEmail(admin, email) {
  let page = 1
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const user = data.users.find((candidate) => candidate.email === email)
    if (user) return user
    if (data.users.length < 100) return null
    page += 1
  }
  return null
}

async function ensureUser(admin, role, email, displayName) {
  const existing = await findUserByEmail(admin, email)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: QA_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: displayName, qa_role: role },
    })
    return existing
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: QA_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: displayName, qa_role: role },
  })
  if (error) throw error
  return data.user
}

async function run() {
  ensureQaDir()
  const admin = createServiceClient()

  const alice = await ensureUser(admin, 'alice', QA_EMAILS.alice, 'Alice QA')
  const bob = await ensureUser(admin, 'bob', QA_EMAILS.bob, 'Bob QA')

  await must(
    'upsert profiles',
    admin.from('profiles').upsert(
      [
        {
          id: alice.id,
          email: QA_EMAILS.alice,
          username: 'qa_alice',
          display_name: 'Alice QA',
        },
        {
          id: bob.id,
          email: QA_EMAILS.bob,
          username: 'qa_bob',
          display_name: 'Bob QA',
        },
      ],
      { onConflict: 'id' }
    )
  )

  const chat = await must(
    'upsert QA chat',
    admin
      .from('chats')
      .upsert(
        {
          id: '11111111-1111-4111-8111-111111111111',
          type: 'direct',
          name: 'QA Alice and Bob',
          created_by: alice.id,
          last_message_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('id, type, name, created_by')
      .single()
  )

  await must(
    'upsert chat members',
    admin.from('chat_members').upsert(
      [
        { chat_id: chat.id, user_id: alice.id, role: 'owner' },
        { chat_id: chat.id, user_id: bob.id, role: 'member' },
      ],
      { onConflict: 'chat_id,user_id' }
    )
  )

  await must(
    'upsert QA contacts',
    admin.from('contacts').upsert(
      [
        { user_id: alice.id, contact_id: bob.id, nickname: 'Bob QA', is_favorite: true },
        { user_id: bob.id, contact_id: alice.id, nickname: 'Alice QA', is_favorite: true },
      ],
      { onConflict: 'user_id,contact_id' }
    )
  )

  const [aliceAuth, bobAuth] = await Promise.all([
    signInQaUser(QA_EMAILS.alice),
    signInQaUser(QA_EMAILS.bob),
  ])

  writeJson(SESSION_PATH, {
    warning: 'Contains QA access tokens. .tmp is gitignored.',
    alice: aliceAuth.session,
    bob: bobAuth.session,
  })

  const seed = {
    created_at: new Date().toISOString(),
    chat,
    users: {
      alice: { id: alice.id, email: QA_EMAILS.alice },
      bob: { id: bob.id, email: QA_EMAILS.bob },
    },
    sessions: {
      alice: redactSession(aliceAuth.session),
      bob: redactSession(bobAuth.session),
    },
  }
  writeJson(SEED_PATH, seed)

  console.log(
    JSON.stringify(
      {
        ok: true,
        seed_path: SEED_PATH,
        sessions_path: SESSION_PATH,
        chat_id: chat.id,
        users: seed.users,
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
})
