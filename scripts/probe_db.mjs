import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, totp_secret, backup_codes')
    .limit(1)

  if (error) {
    console.error('Error fetching columns:', error.message)
  } else {
    console.log('Columns fetched successfully:', data)
  }
}

run()
