// Script to debug authentication issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

console.log('Debugging Supabase Authentication');
console.log('================================');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 5) + '...' + supabaseKey.substring(supabaseKey.length - 5));

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if Supabase is accessible
async function checkSupabaseConnection() {
  try {
    console.log('\nChecking Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase');
      console.log('Session:', data.session ? 'Active' : 'None');
    }
    
    // Check if Google OAuth is enabled
    console.log('\nChecking available auth providers...');
    const { data: settings, error: settingsError } = await supabase.auth.getSettings();
    
    if (settingsError) {
      console.error('❌ Error fetching auth settings:', settingsError.message);
    } else if (settings) {
      console.log('Auth settings:', settings);
      
      // Check for Google provider
      const googleEnabled = settings.external?.google?.enabled;
      console.log('Google OAuth:', googleEnabled ? '✅ Enabled' : '❌ Not enabled or not accessible');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Run the checks
checkSupabaseConnection().then(() => {
  console.log('\nDebugging complete. Follow these steps to fix the blank page issue:');
  console.log('1. Make sure your Supabase project has Google OAuth properly configured');
  console.log('2. Verify that the redirect URLs are correctly set in both Supabase and Google Cloud Console');
  console.log('3. Check browser console for any errors when trying to authenticate');
  console.log('4. Ensure your application is properly handling the authentication redirect');
  
  console.log('\nTo fix the blank page after login:');
  console.log('- Check if your app is correctly handling the auth state in AuthContext.tsx');
  console.log('- Verify that the redirectTo URL in signInWithOAuth is correct');
  console.log('- Make sure your app has proper error handling for authentication failures');
});
