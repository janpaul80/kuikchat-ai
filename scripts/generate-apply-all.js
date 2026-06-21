const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, '../supabase/migrations')
const migrations = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()
  .map(f => path.join(migrationsDir, f))

let sql = `-- KuikChat - COMPLETE DATABASE SCHEMA (001-012)\n`
sql += `-- Generated: ${new Date().toISOString()}\n\n`

for (const file of migrations) {
  const content
