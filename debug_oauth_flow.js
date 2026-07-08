// Debug script for OAuth flow issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import open from 'open';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

async function debugOAuthFlow() {
  console.log('🔍 Debugging Google OAuth Flow');
  console.log('==============================');
  
  // Check server
  console.log('\n1. Checking if server is running...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log(`✅ Server is running at http://localhost:3000`);
    } else {
      console.error(`❌ Server returned status: ${response.status}`);
      console.log('   Try running: npm run start');
      return;
    }
  } catch (error) {
    console.error(`❌ Server is not running: ${error.message}`);
    console.log('   Try running: npm run start');
    return;
  }
  
  // Initialize Supabase
  console.log('\n2. Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
  
  // Generate OAuth URL
  console.log('\n3. Generating Google OAuth URL...');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000',
        skipBrowserRedirect: true,
      }
    });
    
    if (error) {
      console.error(`❌ Error generating OAuth URL: ${error.message}`);
      return;
    }
    
    if (data && data.url) {
      console.log('✅ OAuth URL generated successfully');
      console.log(`   URL: ${data.url.substring(0, 50)}...`);
      
      // Display redirect URL for verification
      const redirectUrl = new URL(data.url).searchParams.get('redirect_to');
      console.log(`   Redirect URL: ${redirectUrl || 'Not specified'}`);
      
      // Check if redirect URL matches local server
      if (redirectUrl && !redirectUrl.includes('localhost:3000')) {
        console.log('⚠️  Warning: Redirect URL does not point to localhost:3000');
        console.log('   This may cause issues with the OAuth flow');
        console.log('   Update your Supabase configuration to use http://localhost:3000 as the redirect URL');
      }
      
      // Offer to open OAuth URL directly
      console.log('\n4. Would you like to test the OAuth flow directly?');
      console.log('   This will open the Google OAuth URL in your browser');
      console.log('   After logging in, you should be redirected to your application');
      console.log('\n   To proceed, run: node debug_oauth_direct.js');
      
      // Create direct test script
      const directTestScript = `
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
    console.error(\`❌ Error: \${error.message}\`);
    return;
  }
  
  console.log('✅ Opening Google OAuth URL in browser...');
  console.log('   You should be redirected to Google login page');
  console.log('   After logging in, you should be redirected to your application');
}

testOAuthDirect().catch(console.error);
      `;
      
      // Save direct test script
      const fs = await import('fs');
      fs.writeFileSync('debug_oauth_direct.js', directTestScript);
      console.log('✅ Created debug_oauth_direct.js for direct testing');
      
    } else {
      console.error('❌ No OAuth URL returned');
    }
  } catch (error) {
    console.error(`❌ Exception during OAuth test: ${error.message}`);
  }
  
  // Check for common issues
  console.log('\n5. Checking for common issues:');
  
  // Check if Google provider is enabled in AuthModal
  try {
    const fs = await import('fs');
    const authModalPath = './components/landing/AuthModal.tsx';
    
    if (fs.existsSync(authModalPath)) {
      const authModalContent = fs.readFileSync(authModalPath, 'utf8');
      
      if (authModalContent.includes('handleOAuthSignIn') && 
          authModalContent.includes('google')) {
        console.log('✅ AuthModal has Google OAuth implementation');
      } else {
        console.log('❌ AuthModal may not have proper Google OAuth implementation');
      }
      
      // Check for redirect URL in AuthModal
      if (authModalContent.includes('redirectTo')) {
        console.log('✅ AuthModal has redirectTo configuration');
      } else {
        console.log('❌ AuthModal may be missing redirectTo configuration');
      }
    } else {
      console.log('❌ AuthModal component not found at expected path');
    }
  } catch (error) {
    console.error(`❌ Error checking AuthModal: ${error.message}`);
  }
  
  console.log('\n6. Troubleshooting tips:');
  console.log('   a. Check browser console for errors (F12 > Console)');
  console.log('   b. Verify that your .env.local file has the correct Supabase URL and API key');
  console.log('   c. Ensure Google OAuth is properly configured in Supabase dashboard:');
  console.log('      - Go to Authentication > Providers > Google');
  console.log('      - Make sure it\'s enabled and has the correct Client ID and Secret');
  console.log('   d. Check that your Google Cloud Console project has the correct redirect URIs:');
  console.log(`      - The redirect URI should be: ${supabaseUrl}/auth/v1/callback?provider=google`);
  console.log('   e. Verify that the redirect URL in Supabase matches your local development URL (http://localhost:3000)');
  
  console.log('\n==============================');
  console.log('✅ OAuth flow debugging complete');
}

// Run the debug function
debugOAuthFlow().catch(console.error);
