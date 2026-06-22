import pg from 'pg'
import fs from 'fs'
import path from 'path'
const { Client } = pg

const connectionString = 'postgresql://postgres.fkvikwkmrlyhpjtaydln:Ecuagrowers10@@@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'

async function run() {
  console.log("Connecting to run ALTER TABLE with strict SSL...")
  const caCert = fs.readFileSync('ssl/supabase-root-ca.crt', 'utf8')
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: true,
      ca: caCert,
    },
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    console.log("Connected successfully!")
    
    // Add video_url to catalog_items if it doesn't exist
    await client.query(`
      ALTER TABLE public.catalog_items 
      ADD COLUMN IF NOT EXISTS video_url text;
    `)
    console.log("ALTER TABLE public.catalog_items completed.")

    // Check columns
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND table_schema = 'public';
    `)
    console.log("Columns of catalog_items:")
    console.log(res.rows)

  } catch (err) {
    console.error("Execution failed:", err)
  } finally {
    await client.end()
  }
}

run()
