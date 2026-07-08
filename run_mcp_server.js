// Script to run the Supabase MCP server locally
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Supabase MCP Server...');

// Path to the MCP server executable
const mcpServerPath = path.join(__dirname, 'supabase-mcp', 'packages', 'mcp-server-supabase', 'dist', 'transports', 'stdio.js');

// Check if the server executable exists
if (!fs.existsSync(mcpServerPath)) {
  console.error(`Error: MCP server executable not found at ${mcpServerPath}`);
  console.error('Make sure you have built the server with "pnpm build"');
  process.exit(1);
}

// Run the MCP server
const server = spawn('node', [mcpServerPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

console.log(`MCP server started with PID ${server.pid}`);
console.log('Server is running in read-only mode by default');
console.log('\nPress Ctrl+C to stop the server');

// Handle server output
server.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Stopping MCP server...');
  server.kill();
  process.exit(0);
});
