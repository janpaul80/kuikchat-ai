// Simple script to check if the local server is running
import fetch from 'node-fetch';

const PORT = 3000; // Port from vite.config.ts
const URL = `http://localhost:${PORT}`;

async function checkServer() {
  console.log(`Checking if server is running at ${URL}...`);
  
  try {
    const response = await fetch(URL, { timeout: 5000 });
    
    if (response.ok) {
      console.log(`✅ Server is running at ${URL}`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      console.log(`❌ Server responded with status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Could not connect to server: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the development server is running with: npm run dev');
    console.log('2. Check if the server is running on a different port');
    console.log('3. Ensure there are no firewall or network issues blocking the connection');
    return false;
  }
}

// Run the check
checkServer();
