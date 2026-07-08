// Script to check current authentication state
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkAuthState() {
  console.log('🔍 Checking Authentication State');
  console.log('===============================');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error(`❌ Error checking session: ${error.message}`);
    return;
  }
  
  if (session) {
    console.log('✅ User is authenticated');
    console.log('\nSession Information:');
    console.log(`- User ID: ${session.user.id}`);
    console.log(`- Email: ${session.user.email}`);
    console.log(`- Provider: ${session.user.app_metadata.provider}`);
    console.log(`- Created At: ${new Date(session.user.created_at).toLocaleString()}`);
    console.log(`- Last Sign In: ${new Date(session.user.last_sign_in_at).toLocaleString()}`);
    
    // Check user metadata
    if (session.user.user_metadata) {
      console.log('\nUser Metadata:');
      Object.entries(session.user.user_metadata).forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
      });
    }
    
    // Check if session is valid
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeLeft = expiresAt - now;
    
    console.log('\nSession Status:');
    console.log(`- Expires At: ${expiresAt.toLocaleString()}`);
    console.log(`- Time Left: ${Math.floor(timeLeft / 60000)} minutes`);
    
    if (timeLeft < 0) {
      console.log('⚠️ Session has expired');
    } else {
      console.log('✅ Session is valid');
    }
    
  } else {
    console.log('❌ User is not authenticated');
    console.log('\nPossible reasons:');
    console.log('1. You have not completed the Google OAuth flow');
    console.log('2. The session has expired');
    console.log('3. You have signed out');
    console.log('\nTo authenticate:');
    console.log('1. Run: node debug_oauth_direct.js');
    console.log('2. Complete the Google OAuth flow in the browser');
    console.log('3. Run this script again to check authentication state');
  }
  
  console.log('\n===============================');
}

// Run the check
checkAuthState().catch(console.error);
