import {
  QA_EMAILS,
  REPORT_PATH,
  assertStep,
  createServiceClient,
  must,
  readJson,
  signInQaUser,
  waitForEvent,
  writeJson,
} from './qa-env.mjs'

const CHAT_ID = '11111111-1111-4111-8111-111111111111'

function isoPlus(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

function markStep(report, name) {
  report.current_step = name
  console.log(JSON.stringify({ status: 'running', step: name }))
}

function rememberStatus(report, key) {
  return (status, error) => {
    report.realtime_statuses ||= {}
    report.realtime_statuses[key] ||= []
    report.realtime_statuses[key].push({
      status,
      error: error?.message,
      at: new Date().toISOString(),
    })
  }
}

async function readPublicationDiagnostics(admin) {
  const { data, error } = await admin.rpc('qa_realtime_publication_state')
  if (error) {
    return {
      available: false,
      error: error.message,
      hint: 'Apply supabase/migrations/024_qa_realtime_publication_diagnostics.sql to enable publication checks from qa:runtime.',
    }
  }

  return {
    available: true,
    tables: data,
    messages_in_publication: data?.some(
      (row) => row.schemaname === 'public' && row.tablename === 'messages' && row.in_supabase_realtime
    ) ?? false,
    messages_replica_identity: data?.find(
      (row) => row.schemaname === 'public' && row.tablename === 'messages'
    )?.replica_identity,
  }
}

async function collectMessageRealtimeDiagnostics(report, admin, bob, messageId, bobId) {
  report.diagnostics ||= {}
  report.diagnostics.messages_realtime ||= {}

  const [serviceRead, bobRead, bobSession, membershipRead, publicationState] = await Promise.all([
    admin
      .from('messages')
      .select('id,chat_id,sender_id,type,body,metadata,deleted_by_user_ids')
      .eq('id', messageId)
      .maybeSingle(),
    bob.client
      .from('messages')
      .select('id,chat_id,sender_id,type,body,metadata,deleted_by_user_ids')
      .eq('id', messageId)
      .maybeSingle(),
    bob.client.auth.getUser(),
    bob.client
      .from('chat_members')
      .select('chat_id,user_id,role')
      .eq('chat_id', CHAT_ID)
      .eq('user_id', bobId),
    readPublicationDiagnostics(admin),
  ])

  report.diagnostics.messages_realtime = {
    inserted_message_id: messageId,
    service_can_read_inserted_message: !!serviceRead.data && !serviceRead.error,
    service_read_error: serviceRead.error?.message,
    bob_can_read_inserted_message: !!bobRead.data && !bobRead.error,
    bob_read_error: bobRead.error?.message,
    bob_message_visible: bobRead.data
      ? {
          id: bobRead.data.id,
          chat_id: bobRead.data.chat_id,
          sender_id: bobRead.data.sender_id,
          type: bobRead.data.type,
          body: bobRead.data.body,
          metadata_type: typeof bobRead.data.metadata,
          deleted_by_user_ids_count: bobRead.data.deleted_by_user_ids?.length ?? 0,
        }
      : null,
    bob_auth_session_valid: !!bobSession.data?.user && !bobSession.error,
    bob_auth_error: bobSession.error?.message,
    bob_auth_user_id: bobSession.data?.user?.id,
    bob_membership_visible: (membershipRead.data?.length ?? 0) > 0 && !membershipRead.error,
    bob_membership_error: membershipRead.error?.message,
    publication_state: publicationState,
  }
}

async function run() {
  const startedAt = new Date().toISOString()
  const report = {
    ok: true,
    started_at: startedAt,
    finished_at: null,
    chat_id: CHAT_ID,
    steps: [],
    ids: {},
    notes: [],
  }

  const admin = createServiceClient()
  const alice = await signInQaUser(QA_EMAILS.alice)
  const bob = await signInQaUser(QA_EMAILS.bob)
  const aliceId = alice.user.id
  const bobId = bob.user.id

  const textBody = `QA realtime text ${startedAt}`
  const eventTitle = `QA Event ${startedAt}`
  const eventBody = `Event: ${eventTitle}`

  const memberships = await must(
    'service membership readback',
    admin.from('chat_members').select('chat_id,user_id,role').eq('chat_id', CHAT_ID)
  )
  assertStep(report, 'seeded Alice/Bob chat memberships exist', memberships.length >= 2, {
    count: memberships.length,
  })

  try {
  const bobAuth = await bob.client.auth.getUser()
  assertStep(report, 'Bob authenticated session is valid before subscribing', !!bobAuth.data?.user && !bobAuth.error, {
    user_id: bobAuth.data?.user?.id,
    error: bobAuth.error?.message,
  })

  markStep(report, 'Bob waits for Alice text message realtime')
  const msgPayload = await waitForEvent(
    'messages INSERT text seen by Bob',
    (handler) =>
      bob.client
        .channel(`qa_message_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${CHAT_ID}` },
          handler
        ),
    async () => {
      const msg = await must(
        'Alice text insert',
        alice.client
          .from('messages')
          .insert({
            chat_id: CHAT_ID,
            sender_id: aliceId,
            type: 'text',
            body: textBody,
          })
          .select('id')
          .single()
      )
      report.ids.text_message_id = msg.id
    },
    (payload) => payload.new?.body === textBody,
    { onStatus: rememberStatus(report, 'messages_insert_text_seen_by_bob') }
  )
  assertStep(report, 'Bob receives Alice message over realtime', !!msgPayload.new?.id, {
    message_id: msgPayload.new?.id,
  })

  markStep(report, 'Bob waits for Alice event message realtime')
  const eventMessagePayload = await waitForEvent(
    'messages INSERT event seen by Bob',
    (handler) =>
      bob.client
        .channel(`qa_event_message_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${CHAT_ID}` },
          handler
        ),
    async () => {
      const { data, error } = await alice.client.rpc('create_event_with_message', {
        p_chat_id: CHAT_ID,
        p_sender_id: aliceId,
        p_title: eventTitle,
        p_description: 'Runtime QA event',
        p_location: 'QA Lab',
        p_start_time: isoPlus(30),
        p_end_time: isoPlus(90),
        p_meeting_link: 'https://meet.example.com/kuikchat-qa',
        p_timezone: 'America/Chicago',
      })
      if (error) throw new Error(`create_event_with_message: ${error.message}`)
      report.ids.event_message_id = data.id
    },
    (payload) => payload.new?.body === eventBody
  )
  assertStep(report, 'event RPC creates realtime event message once', !!eventMessagePayload.new?.id, {
    message_id: eventMessagePayload.new?.id,
  })

  const events = await must(
    'service event readback',
    admin.from('events').select('*').eq('message_id', report.ids.event_message_id)
  )
  const event = events[0]
  report.ids.event_id = event?.id
  assertStep(report, 'event row persisted with meeting link and timezone', !!event?.id, {
    event_id: event?.id,
    meeting_link: event?.meeting_link,
    timezone: event?.timezone,
  })

  markStep(report, 'Alice waits for Bob RSVP realtime')
  const rsvpPayload = await waitForEvent(
    'event_rsvps UPSERT seen by Alice',
    (handler) =>
      alice.client
        .channel(`qa_event_rsvp_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_rsvps', filter: `event_id=eq.${event.id}` },
          handler
        ),
    async () => {
      await must(
        'Bob RSVP upsert',
        bob.client.from('event_rsvps').upsert(
          {
            event_id: event.id,
            user_id: bobId,
            status: 'going',
          },
          { onConflict: 'event_id,user_id' }
        )
      )
    },
    (payload) => payload.new?.event_id === event.id && payload.new?.user_id === bobId
  )
  assertStep(report, 'Alice receives Bob RSVP over realtime', !!rsvpPayload.new?.id, {
    rsvp_id: rsvpPayload.new?.id,
    status: rsvpPayload.new?.status,
  })

  markStep(report, 'Alice creates poll fixture')
  const pollMsg = await must(
    'Alice poll message insert',
    alice.client
      .from('messages')
      .insert({
        chat_id: CHAT_ID,
        sender_id: aliceId,
        type: 'poll',
        body: `Poll: QA ${startedAt}`,
      })
      .select('id')
      .single()
  )
  report.ids.poll_message_id = pollMsg.id

  const poll = await must(
    'Alice poll row insert',
    alice.client
      .from('polls')
      .insert({
        chat_id: CHAT_ID,
        message_id: pollMsg.id,
        question: `QA poll ${startedAt}`,
        options: [
          { id: 'yes', text: 'Yes' },
          { id: 'no', text: 'No' },
        ],
        is_multiple: false,
        is_anonymous: false,
        closes_at: isoPlus(60),
        created_by: aliceId,
      })
      .select('id')
      .single()
  )
  report.ids.poll_id = poll.id

  markStep(report, 'Alice waits for Bob poll vote realtime')
  const votePayload = await waitForEvent(
    'poll_votes INSERT seen by Alice',
    (handler) =>
      alice.client
        .channel(`qa_poll_vote_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'poll_votes', filter: `poll_id=eq.${poll.id}` },
          handler
        ),
    async () => {
      await must(
        'Bob poll vote insert',
        bob.client.from('poll_votes').insert({
          poll_id: poll.id,
          user_id: bobId,
          option_id: 'yes',
        })
      )
    },
    (payload) => payload.new?.poll_id === poll.id && payload.new?.user_id === bobId
  )
  assertStep(report, 'Alice receives Bob poll vote over realtime', !!votePayload.new?.id, {
    vote_id: votePayload.new?.id,
  })

  markStep(report, 'Alice creates live location fixture')
  const locationMsg = await must(
    'Alice location message insert',
    alice.client
      .from('messages')
      .insert({
        chat_id: CHAT_ID,
        sender_id: aliceId,
        type: 'location',
        body: 'Live Location: QA Lab',
        metadata: {
          type: 'live',
          latitude: 41.8781,
          longitude: -87.6298,
          address: 'QA Lab',
        },
      })
      .select('id')
      .single()
  )
  report.ids.location_message_id = locationMsg.id

  const locationSession = await must(
    'Alice live location session insert',
    alice.client
      .from('live_location_sessions')
      .insert({
        message_id: locationMsg.id,
        chat_id: CHAT_ID,
        user_id: aliceId,
        latitude: 41.8781,
        longitude: -87.6298,
        expires_at: isoPlus(30),
      })
      .select('id')
      .single()
  )
  report.ids.live_location_session_id = locationSession.id

  markStep(report, 'Bob waits for Alice live location update realtime')
  const locationPayload = await waitForEvent(
    'live_location_sessions UPDATE seen by Bob',
    (handler) =>
      bob.client
        .channel(`qa_live_location_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_location_sessions',
            filter: `message_id=eq.${locationMsg.id}`,
          },
          handler
        ),
    async () => {
      await must(
        'Alice live location update',
        alice.client
          .from('live_location_sessions')
          .update({ latitude: 41.879, longitude: -87.63 })
          .eq('id', locationSession.id)
      )
    },
    (payload) => payload.new?.id === locationSession.id
  )
  assertStep(report, 'Bob receives live location update over realtime', !!locationPayload.new?.id, {
    session_id: locationPayload.new?.id,
  })

  markStep(report, 'Service role verifies attachment bucket upload and signed URL')
  const uploadPath = `${CHAT_ID}/qa-${Date.now()}.txt`
  report.notes.push(
    'Attachment storage upload currently uses the service-role QA client only. This does not prove authenticated user upload policies; configure storage.objects policies for the attachments bucket in the Supabase Dashboard.'
  )
  const { data: bucketData, error: bucketError } = await admin.storage.getBucket('attachments')
  assertStep(report, 'attachments storage bucket exists', !!bucketData?.id && !bucketError, {
    bucket: 'attachments',
    error: bucketError?.message,
  })

  const { error: uploadError } = await admin.storage
    .from('attachments')
    .upload(uploadPath, Buffer.from(`KuikChat QA upload ${startedAt}`), {
      contentType: 'text/plain',
      upsert: false,
    })
  assertStep(report, 'service role uploads attachment into chat-scoped storage path', !uploadError, {
    path: uploadPath,
    bucket: 'attachments',
    authenticated_policy_proven: false,
    error: uploadError?.message,
  })
  if (!uploadError) {
    const { data: signed, error: signedError } = await admin.storage
      .from('attachments')
      .createSignedUrl(uploadPath, 60)
    assertStep(report, 'service role can create signed URL for attachment', !!signed?.signedUrl && !signedError, {
      has_signed_url: !!signed?.signedUrl,
      authenticated_policy_proven: false,
      error: signedError?.message,
    })

    const { error: removeError } = await admin.storage.from('attachments').remove([uploadPath])
    assertStep(report, 'service role cleans up QA attachment object', !removeError, {
      path: uploadPath,
      error: removeError?.message,
    })
  }

  const duplicateEvents = await must(
    'duplicate event message check',
    admin
      .from('messages')
      .select('id')
      .eq('chat_id', CHAT_ID)
      .eq('type', 'event')
      .eq('body', eventMessagePayload.new.body)
  )
  assertStep(report, 'event RPC did not create duplicate event messages', duplicateEvents.length === 1, {
    matching_event_messages: duplicateEvents.length,
  })

  report.notes.push('Event editing is not implemented in the current UI/runtime and is tracked in docs/qa-checklist.md.')
  delete report.current_step
  } catch (error) {
    report.ok = false
    report.error = error.message
    if (
      report.current_step === 'Bob waits for Alice text message realtime' &&
      report.ids.text_message_id
    ) {
      await collectMessageRealtimeDiagnostics(report, admin, bob, report.ids.text_message_id, bobId)
    }
  }

  report.finished_at = new Date().toISOString()
  writeJson(REPORT_PATH, report)
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

try {
  readJson('.tmp/qa-auth/seed.json')
} catch {
  console.error('Run npm run qa:auth:seed before npm run qa:runtime.')
  process.exit(1)
}

run().catch((error) => {
  const report = {
    ok: false,
    finished_at: new Date().toISOString(),
    error: error.message,
  }
  writeJson(REPORT_PATH, report)
  console.error(JSON.stringify(report, null, 2))
  process.exit(1)
})
