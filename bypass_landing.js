// Script to bypass the landing page in KuikChat
import fs from 'fs';
import { exec } from 'child_process';

console.log('🔑 Bypass Landing Page Helper');
console.log('============================');
console.log('\n1. Modifying App.tsx to bypass landing page...');

// Read the App.tsx file
const appTsxPath = './App.tsx';
let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Replace the showLanding state initialization
const originalLine = 'const [showLanding, setShowLanding] = useState(!isAuthenticated);';
const newLine = 'const [showLanding, setShowLanding] = useState(false); // Modified to bypass landing page';

if (appTsxContent.includes(originalLine)) {
  appTsxContent = appTsxContent.replace(originalLine, newLine);
  
  // Write the modified content back to App.tsx
  fs.writeFileSync(appTsxPath, appTsxContent);
  console.log('✅ Successfully modified App.tsx to bypass the landing page');
  
  console.log('\n2. Restarting the development server...');
  
  // Kill any running server
  exec('pkill -f "node start_dev_server.js"', (error) => {
    // Start a new server
    exec('node start_dev_server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error restarting server: ${error.message}`);
        return;
      }
      
      console.log('✅ Development server restarted');
      console.log('\n3. Opening KuikChat in your browser...');
      
      // Open the app in the browser
      exec('node -e "import(\'open\').then(({default: open}) => open(\'http://localhost:3000\'))"');
      
      console.log('\n✅ Done! You should now be taken directly to the main app, bypassing the landing page.');
    });
  });
} else {
  console.log('❌ Could not find the line to modify in App.tsx');
  console.log('Please modify the file manually:');
  console.log('1. Open App.tsx');
  console.log('2. Find the line: const [showLanding, setShowLanding] = useState(!isAuthenticated);');
  console.log('3. Change it to: const [showLanding, setShowLanding] = useState(false);');
  console.log('4. Save the file and restart the development server');
}
