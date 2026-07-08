// Simple OAuth test - just test the flow
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Simple OAuth Test');
console.log('===================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('✅ Credentials found');

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client created');

// Test OAuth URL generation
console.log('\nTesting OAuth URL generation...');
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000',
  },
}).then(({ data, error }) => {
  if (error) {
    console.error('❌ OAuth error:', error.message);
  } else if (data?.url) {
    console.log('✅ OAuth URL generated successfully');
    console.log('URL:', data.url);
    console.log('\n📋 Instructions:');
    console.log('1. Copy and paste this URL in your browser');
    console.log('2. Complete Google authentication');
    console.log('3. You should be redirected to http://localhost:3000');
    console.log('4. Check if you\'re logged into the chat app');
  } else {
    console.error('❌ No URL returned');
  }
}).catch(err => {
  console.error('❌ Error:', err.message);
});
