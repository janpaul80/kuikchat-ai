// Simple script to demonstrate the Supabase MCP server capabilities
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Supabase MCP Server Demo');
console.log('========================');

// Check if the MCP server is configured
try {
  const settings = JSON.parse(fs.readFileSync('./blackbox_mcp_settings.json', 'utf8'));
  console.log('MCP Server Configuration:');
  console.log(JSON.stringify(settings, null, 2));
  console.log('\nServer name:', Object.keys(settings.mcpServers)[0]);
  console.log('Server URL:', settings.mcpServers[Object.keys(settings.mcpServers)[0]].url);
} catch (error) {
  console.error('Error reading MCP settings:', error.message);
  process.exit(1);
}

console.log('\nTo use the MCP server with an AI assistant:');
console.log('1. Configure your AI tool with the MCP settings');
console.log('2. Ask the AI to perform Supabase operations like:');
console.log('   - "Search the Supabase documentation for authentication"');
console.log('   - "List available Supabase tools"');
console.log('   - "Get information about database tables"');

console.log('\nNote: Some tools require authentication with Supabase');
console.log('You may need to log in to your Supabase account when prompted');
