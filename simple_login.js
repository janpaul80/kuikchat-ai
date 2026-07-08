// Simple login script for KuikChat
import open from 'open';

console.log('🔑 Simple Login Helper');
console.log('=====================');
console.log('\n1. Opening KuikChat in your browser...');

// Open the app directly in the browser
open('http://localhost:3000');

console.log('\n2. Login instructions:');
console.log('   - When the landing page loads, click "Log in" in the top right corner');
console.log('   - In the login modal, click "Continue with Google"');
console.log('   - Complete the Google authentication process');
console.log('   - You will be redirected back to the app after successful login');

console.log('\nNote: If you encounter any issues with Google OAuth:');
console.log('1. Make sure your Supabase project is properly configured');
console.log('2. Check that your redirect URLs are set up correctly in Google Cloud Console');
console.log('3. Verify that your .env.local file has the correct Supabase credentials');
