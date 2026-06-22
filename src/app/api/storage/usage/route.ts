import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Client } from 'pg'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DB_CONN_STRING = process.env.DATABASE_URL
if (!DB_CONN_STRING) {
  console.warn("WARNING: DATABASE_URL is not set.")
}

export async function GET() {
  let db: Client | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user plan limit
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    const plan = profile.plan || 'free'
    let quotaBytes = 2 * 1024 * 1024 * 1024 // 2 GB Free
    if (plan === 'ultra') {
      quotaBytes = 50 * 1024 * 1024 * 1024 // 50 GB Ultra
    } else if (plan === 'business') {
      quotaBytes = 200 * 1024 * 1024 * 1024 // 200 GB Business
    }

    if (!DB_CONN_STRING) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 })
    }
    db = new Client({ connectionString: DB_CONN_STRING })
    await db.connect()

    // 1. Get usage by category
    const catQuery = `
      SELECT
        CASE
          WHEN metadata->>'mimetype' LIKE 'image/%' THEN 'photos'
          WHEN metadata->>'mimetype' LIKE 'video/%' THEN 'videos'
          WHEN metadata->>'mimetype' LIKE 'audio/%' THEN 'voice'
          ELSE 'documents'
        END as category,
        COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint as size
      FROM storage.objects
      WHERE owner = $1
      GROUP BY 1
    `
    const catRes = await db.query(catQuery, [user.id])
    
    const breakdown = {
      photos: 0,
      videos: 0,
      voice: 0,
      documents: 0,
    }
    let totalUsed = 0

    for (const row of catRes.rows) {
      const cat = row.category as keyof typeof breakdown
      const sizeVal = parseInt(row.size, 10) || 0
      breakdown[cat] = sizeVal
      totalUsed += sizeVal
    }

    // 2. Get list of files for cleanup review (e.g. sorted by size descending)
    const filesQuery = `
      SELECT 
        id, 
        bucket_id, 
        name, 
        COALESCE((metadata->>'size')::bigint, 0)::bigint as size, 
        created_at, 
        metadata->>'mimetype' as mimetype
      FROM storage.objects
      WHERE owner = $1
      ORDER BY size DESC
      LIMIT 50
    `
    const filesRes = await db.query(filesQuery, [user.id])
    const filesList = filesRes.rows.map((r) => ({
      id: r.id,
      bucket: r.bucket_id,
      name: r.name,
      size: parseInt(r.size, 10) || 0,
      created_at: r.created_at,
      mimetype: r.mimetype,
    }))

    // 3. Get server headroom stats (admin-visible, but shown to help monitor)
    const headroomQuery = `
      SELECT 
        (SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint FROM storage.objects) as total_used,
        (SELECT SUM(CASE 
          WHEN plan = 'business' THEN 200 * 1024 * 1024 * 1024::bigint
          WHEN plan = 'ultra' THEN 50 * 1024 * 1024 * 1024::bigint
          ELSE 2 * 1024 * 1024 * 1024::bigint
         END) FROM public.profiles) as total_provisioned
    `
    const headroomRes = await db.query(headroomQuery)
    const serverUsed = parseInt(headroomRes.rows[0].total_used, 10) || 0
    const serverProvisioned = parseInt(headroomRes.rows[0].total_provisioned, 10) || 0
    const physicalDiskPool = 480 * 1024 * 1024 * 1024 // 480 GB pool

    return NextResponse.json({
      plan,
      totalUsed,
      quotaBytes,
      breakdown,
      files: filesList,
      headroom: {
        totalProvisioned: serverProvisioned,
        totalUsed: serverUsed,
        physicalDiskPool,
        oversubscriptionRatio: 11.25,
      },
    })
  } catch (err: any) {
    console.error('[storage/usage] error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch storage usage' }, { status: 500 })
  } finally {
    if (db) {
      await db.end().catch((e) => console.error('Error closing database connection:', e))
    }
  }
}
