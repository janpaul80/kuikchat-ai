// Direct login script for KuikChat
import open from 'open';

console.log('🔑 Direct Login Helper');
console.log('=====================');
console.log('\n1. Opening KuikChat in your browser...');

// Open the app directly in the browser
open('http://localhost:3000');

console.log('\n2. Direct Login Instructions:');
console.log('   - When the landing page loads, look for the "handleLogin" function in App.tsx');
console.log('   - This function bypasses OAuth and logs you in directly');
console.log('   - You can trigger this function by clicking the "Log in" button');

console.log('\nAlternative: If you want to bypass the landing page completely:');
console.log('1. Open App.tsx');
console.log('2. Find the line: const [showLanding, setShowLanding] = useState(!isAuthenticated);');
console.log('3. Change it to: const [showLanding, setShowLanding] = useState(false);');
console.log('4. Save the file and refresh the page');
