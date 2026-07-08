// Script to check Supabase configuration
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('Checking Supabase Configuration');
console.log('==============================');

// Check Supabase URL and API key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Supabase API Key:', supabaseKey ? '✅ Found' : '❌ Missing');

// Print instructions
console.log('\nTo fix Google OAuth issues:');
console.log('1. Make sure your Supabase project has Google OAuth enabled:');
console.log('   - Go to https://app.supabase.com');
console.log('   - Select your project');
console.log('   - Go to Authentication > Providers');
console.log('   - Enable Google provider');
console.log('   - Add your Google OAuth credentials');

console.log('\n2. Configure redirect URLs in Supabase:');
console.log('   - Go to Authentication > URL Configuration');
console.log('   - Add Site URL: http://localhost:5173');
console.log('   - Add Redirect URLs: http://localhost:5173');

console.log('\n3. Configure redirect URLs in Google Cloud Console:');
console.log('   - Go to https://console.cloud.google.com');
console.log('   - Select your project');
console.log('   - Go to APIs & Services > Credentials');
console.log('   - Edit your OAuth 2.0 Client ID');
console.log('   - Add Authorized redirect URIs:');
console.log(`   - ${supabaseUrl}/auth/v1/callback`);

console.log('\nIf you need to update your .env.local file, use these values:');
console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
