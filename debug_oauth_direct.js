
// Direct OAuth test script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import open from 'open';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testOAuthDirect() {
  console.log('🔍 Testing Google OAuth Flow Directly');
  console.log('===================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000',
      skipBrowserRedirect: false,
    }
  });
  
  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return;
  }
  
  console.log('✅ Opening Google OAuth URL in browser...');
  console.log('   You should be redirected to Google login page');
  console.log('   After logging in, you should be redirected to your application');
}

testOAuthDirect().catch(console.error);
      