import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const { Client } = pg

// Supposing the password is the VPS password or standard Supabase config
const password = process.env.PASSWORD || 'Ecuagrowers10@@'
const connectionString = `postgresql://postgres.fkvikwkmrlyhpjtaydln:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`

console.log('Connecting to database:', `postgresql://postgres:***@db.fkvikwkmrlyhpjtaydln.supabase.co:6543/postgres`)

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function run() {
  try {
    await client.connect()
    console.log('Connected to Supabase PostgreSQL database successfully!')

    const sqlPath = path.resolve(__dirname, '../supabase/migrations/026_settings_2fa.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('Applying migration...')
    await client.query(sql)
    console.log('Migration 026_settings_2fa.sql applied successfully!')
  } catch (error) {
    console.error('Error applying migration:', error.message)
  } finally {
    await client.end()
  }
}

run()
