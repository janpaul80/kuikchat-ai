import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const { Client } = pg
const password = process.env.PASSWORD || 'Ecuagrowers10@@'

// We will try standard AWS regions where Supabase defaults projects
const regions = [
  'eu-central-1', // Frankfurt
  'eu-west-1',    // Ireland
  'eu-west-2',    // London
  'eu-west-3',    // Paris
  'us-east-1',    // N. Virginia
  'us-east-2',    // Ohio
  'us-west-1',    // N. California
  'us-west-2',    // Oregon
  'ap-southeast-1', // Singapore
  'ap-northeast-1', // Tokyo
  'sa-east-1',    // Sao Paulo
]

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`
  const user = `postgres.fkvikwkmrlyhpjtaydln`
  const connectionString = `postgresql://${user}:${password}@${host}:6543/postgres`

  console.log(`Testing region ${region} (${host})...`)
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })

  try {
    await client.connect()
    console.log(`\n🎉 SUCCESS! Connected to region: ${region}`)
    console.log(`Host: ${host}`)
    await client.end()
    return true
  } catch (error) {
    console.log(`❌ Failed ${region}:`, error.message)
    return false
  }
}

async function run() {
  for (const region of regions) {
    const success = await testRegion(region)
    if (success) {
      process.exit(0)
    }
  }
  console.log('Could not connect to any regional pooler.')
  process.exit(1)
}

run()
