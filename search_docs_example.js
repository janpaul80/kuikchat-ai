// Example script to demonstrate the Supabase MCP server's search_docs tool
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Supabase MCP Server - Search Docs Example');
console.log('=========================================');

// Path to the MCP server executable
const mcpServerPath = path.join(__dirname, 'supabase-mcp', 'packages', 'mcp-server-supabase', 'dist', 'transports', 'stdio.js');

// Check if the server executable exists
if (!fs.existsSync(mcpServerPath)) {
  console.error(`Error: MCP server executable not found at ${mcpServerPath}`);
  console.error('Make sure you have built the server with "pnpm build"');
  process.exit(1);
}

// Example search_docs request
const searchRequest = {
  jsonrpc: '2.0',
  id: '1',
  method: 'mcp.tool.call',
  params: {
    name: 'search_docs',
    parameters: {
      query: 'authentication'
    }
  }
};

// Run the MCP server
const server = spawn('node', [mcpServerPath, '--features', 'docs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

console.log('Sending search_docs request to the MCP server...');

// Send the request to the server
server.stdin.write(JSON.stringify(searchRequest) + '\n');

// Collect response data
let responseData = '';

// Handle server output
server.stdout.on('data', (data) => {
  responseData += data.toString();
  
  // Check if we have a complete JSON response
  try {
    const response = JSON.parse(responseData);
    console.log('\nSearch Results:');
    console.log('---------------');
    
    if (response.result && response.result.results) {
      response.result.results.forEach((result, index) => {
        console.log(`Result ${index + 1}:`);
        console.log(`Title: ${result.title}`);
        console.log(`URL: ${result.url}`);
        console.log(`Content: ${result.content.substring(0, 150)}...`);
        console.log('');
      });
    } else {
      console.log('No results found or unexpected response format.');
      console.log('Raw response:', JSON.stringify(response, null, 2));
    }
    
    // Close the server
    server.kill();
    process.exit(0);
  } catch (e) {
    // Not a complete JSON response yet, continue collecting data
  }
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

// Handle timeout
setTimeout(() => {
  console.log('Timeout: No response received from the server after 10 seconds.');
  server.kill();
  process.exit(1);
}, 10000);
