// Script to start the development server for KuikChat
import { spawn } from 'child_process';
import { createServer } from 'http';
import fetch from 'node-fetch';
import open from 'open';

const PORT = 3000;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000; // 1 second

// Function to check if the server is already running
async function isServerRunning() {
  try {
    const response = await fetch(`http://localhost:${PORT}`, { timeout: 1000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Function to wait for the server to start
async function waitForServer(retries = 0) {
  if (retries >= MAX_RETRIES) {
    console.error('❌ Server did not start within the expected time');
    return false;
  }
  
  try {
    const running = await isServerRunning();
    if (running) {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
      return true;
    } else {
      console.log(`Waiting for server to start... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return waitForServer(retries + 1);
    }
  } catch (error) {
    console.error('Error checking server status:', error);
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    return waitForServer(retries + 1);
  }
}

async function main() {
  console.log('🚀 Starting KuikChat development server');
  console.log('=======================================');
  
  // Check if server is already running
  const serverRunning = await isServerRunning();
  if (serverRunning) {
    console.log(`✅ Server is already running at http://localhost:${PORT}`);
    console.log('Opening browser...');
    await open(`http://localhost:${PORT}`);
    return;
  }
  
  // Start the development server
  console.log('Starting Vite development server...');
  const devProcess = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process events
  devProcess.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
  });
  
  // Wait for the server to start
  const started = await waitForServer();
  if (started) {
    console.log('Opening browser...');
    await open(`http://localhost:${PORT}`);
    
    console.log('\n📝 Google OAuth Testing Instructions:');
    console.log('1. When the application loads, you should see the landing page');
    console.log('2. Click on "Log in" or any button that triggers the auth modal');
    console.log('3. In the auth modal, click "Continue with Google"');
    console.log('4. You should be redirected to Google\'s login page');
    console.log('5. After logging in, you should be redirected back to the application');
    console.log('6. Check the AuthDebugger component in the bottom-right corner for authentication status');
    
    console.log('\nPress Ctrl+C to stop the server when done');
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
