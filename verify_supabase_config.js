// Script to verify Supabase configuration for Google OAuth
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function verifySupabaseConfig() {
  console.log('🔍 Verifying Supabase Configuration for Google OAuth');
  console.log('=================================================');
  
  // Check if environment variables are set
  console.log('\n1. Checking environment variables:');
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL is not set in .env.local');
    console.log('   Please add your Supabase URL to the .env.local file');
    return false;
  } else {
    console.log(`✅ VITE_SUPABASE_URL: ${supabaseUrl}`);
  }
  
  if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.error('❌ VITE_SUPABASE_ANON_KEY is not set in .env.local or is using the placeholder value');
    console.log('   Please add your Supabase anon key to the .env.local file');
    return false;
  } else {
    console.log(`✅ VITE_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);
  }
  
  // Check if Supabase client can be initialized
  console.log('\n2. Initializing Supabase client:');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
    
    // Check if auth is available
    console.log('\n3. Checking auth functionality:');
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`❌ Error checking auth session: ${error.message}`);
        return false;
      }
      
      console.log('✅ Auth functionality is working');
      console.log(`   Session: ${data.session ? 'Active' : 'None'}`);
      
      // Check OAuth providers
      console.log('\n4. Generating Google OAuth URL (test only):');
      try {
        const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3000',
            skipBrowserRedirect: true,
          }
        });
        
        if (oauthError) {
          console.error(`❌ Error generating OAuth URL: ${oauthError.message}`);
          return false;
        }
        
        if (oauthData && oauthData.url) {
          console.log('✅ Google OAuth URL generated successfully');
          console.log(`   URL: ${oauthData.url.substring(0, 50)}...`);
        } else {
          console.error('❌ No OAuth URL returned');
          return false;
        }
      } catch (oauthErr) {
        console.error(`❌ Exception during OAuth test: ${oauthErr.message}`);
        return false;
      }
      
    } catch (authErr) {
      console.error(`❌ Exception checking auth: ${authErr.message}`);
      return false;
    }
    
  } catch (err) {
    console.error(`❌ Error initializing Supabase client: ${err.message}`);
    return false;
  }
  
  // Check AuthModal component
  console.log('\n5. Checking AuthModal component:');
  try {
    const authModalPath = path.join(process.cwd(), 'components/landing/AuthModal.tsx');
    if (fs.existsSync(authModalPath)) {
      const authModalContent = fs.readFileSync(authModalPath, 'utf8');
      
      if (authModalContent.includes('handleOAuthSignIn') && 
          authModalContent.includes('google') && 
          authModalContent.includes('redirectTo')) {
        console.log('✅ AuthModal component has Google OAuth implementation');
      } else {
        console.log('❌ AuthModal component may not have proper Google OAuth implementation');
      }
    } else {
      console.log('❌ AuthModal component not found at expected path');
    }
  } catch (fileErr) {
    console.error(`❌ Error checking AuthModal component: ${fileErr.message}`);
  }
  
  // Check AuthDebugger component
  console.log('\n6. Checking AuthDebugger component:');
  try {
    const authDebuggerPath = path.join(process.cwd(), 'components/AuthDebugger.tsx');
    if (fs.existsSync(authDebuggerPath)) {
      const authDebuggerContent = fs.readFileSync(authDebuggerPath, 'utf8');
      
      if (authDebuggerContent.includes('testGoogleAuth') && 
          authDebuggerContent.includes('signInWithOAuth')) {
        console.log('✅ AuthDebugger component has Google OAuth testing functionality');
      } else {
        console.log('❌ AuthDebugger component may not have proper Google OAuth testing functionality');
      }
    } else {
      console.log('❌ AuthDebugger component not found at expected path');
    }
  } catch (fileErr) {
    console.error(`❌ Error checking AuthDebugger component: ${fileErr.message}`);
  }
  
  console.log('\n=================================================');
  console.log('✅ Supabase configuration verification completed');
  console.log('\nNext steps:');
  console.log('1. Update .env.local with your actual Supabase anon key');
  console.log('2. Configure Google OAuth in Google Cloud Console and Supabase');
  console.log('3. Run the application with: npm run start');
  console.log('4. Test the Google OAuth flow using the AuthDebugger');
  
  return true;
}

// Run the verification
verifySupabaseConfig().catch(err => {
  console.error('Unhandled error during verification:', err);
});
