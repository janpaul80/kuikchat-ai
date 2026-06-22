import { SupabaseClient } from '@supabase/supabase-js'

export async function selfHealProfile(
  supabase: SupabaseClient,
  userId: string,
  email?: string,
  userMetadata?: any
) {
  try {
    // 1. Check if the profile already exists
    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .maybeSingle()

    if (profile) {
      // Profile exists, let's just make sure default settings rows exist
      await ensureSettingsRows(supabase, userId)
      return
    }

    // 2. Generate a clean username from email or default
    let baseUsername = 'user'
    if (email) {
      baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
    }
    if (baseUsername.length < 3) {
      baseUsername = 'user' + userId.replace(/-/g, '').substring(0, 8)
    }

    let finalUsername = baseUsername

    // Check collision
    const { data: collision } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', finalUsername)
      .maybeSingle()

    if (collision) {
      const suffix = userId.split('-')[0].substring(0, 4)
      finalUsername = `${baseUsername}_${suffix}`
    }

    const displayName =
      userMetadata?.full_name ||
      userMetadata?.name ||
      email?.split('@')[0] ||
      finalUsername

    // Insert profile, retry if username collision happens
    let inserted = false
    let attempts = 0
    while (!inserted && attempts < 3) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email || null,
          username: finalUsername,
          display_name: displayName,
          avatar_url: userMetadata?.avatar_url || null,
        })

      if (!insertError) {
        inserted = true
      } else if (insertError.code === '23505') {
        attempts++
        const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
        finalUsername = `${baseUsername}_${randomSuffix}`
      } else {
        console.error('Error inserting profile in self-heal:', insertError)
        break
      }
    }

    // Insert settings rows
    await ensureSettingsRows(supabase, userId)
  } catch (error) {
    console.error('Unhandled error in selfHealProfile:', error)
  }
}

async function ensureSettingsRows(supabase: SupabaseClient, userId: string) {
  const { data: notifs } = await supabase
    .from('notification_settings')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!notifs) {
    await supabase.from('notification_settings').insert({ user_id: userId }).maybeSingle()
  }

  const { data: appearance } = await supabase
    .from('appearance_settings')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!appearance) {
    await supabase.from('appearance_settings').insert({ user_id: userId }).maybeSingle()
  }
}
