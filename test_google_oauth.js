// Script to test Google OAuth flow with Supabase
import fetch from 'node-fetch';
import open from 'open';

// Configuration
const PORT = 3000; // Port from vite.config.ts
const BASE_URL = `http://localhost:${PORT}`;

async function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth with Supabase');
  console.log('=====================================');
  
  try {
    // Step 1: Check if server is running
    console.log(`\n1. Checking if server is running at ${BASE_URL}...`);
    
    try {
      const response = await fetch(BASE_URL, { timeout: 5000 });
      
      if (response.ok) {
        console.log(`✅ Server is running at ${BASE_URL}`);
      } else {
        throw new Error(`Server responded with status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Could not connect to server: ${error.message}`);
      console.log('\nTroubleshooting:');
      console.log('- Make sure the development server is running with: npm run dev');
      console.log('- Check if the server is running on a different port');
      console.log('- Ensure there are no firewall or network issues blocking the connection');
      return;
    }
    
    // Step 2: Open the application in the browser
    console.log('\n2. Opening the application in your default browser...');
    await open(BASE_URL);
    
    console.log('\n3. Instructions for testing Google OAuth:');
    console.log('   a. When the application loads, you should see the landing page');
    console.log('   b. Click on "Log in" or any button that triggers the auth modal');
    console.log('   c. In the auth modal, click "Continue with Google"');
    console.log('   d. You should be redirected to Google\'s login page');
    console.log('   e. After logging in with your Google account, you should be redirected back to the application');
    console.log('   f. Check the AuthDebugger component in the bottom-right corner for authentication status');
    
    console.log('\n4. Troubleshooting tips if OAuth fails:');
    console.log('   - Check browser console for errors (F12 > Console)');
    console.log('   - Verify that your .env.local file has the correct Supabase URL and API key');
    console.log('   - Ensure Google OAuth is properly configured in Supabase dashboard');
    console.log('   - Verify that the redirect URL in Supabase matches your local development URL (http://localhost:3000)');
    console.log('   - Check that your Google Cloud Console project has the correct redirect URIs configured');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run the test
testGoogleOAuth();
