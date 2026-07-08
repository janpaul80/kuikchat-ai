// Simple script to demonstrate the search_docs tool of Supabase MCP
import { spawn } from 'child_process';
import path from 'path';

// The query to search for in the Supabase documentation
const searchQuery = "Google OAuth setup";

console.log(`🔍 Searching Supabase documentation for: "${searchQuery}"`);
console.log('=================================================');

// Path to the MCP server CLI
const mcpServerPath = path.join(process.cwd(), 'supabase-mcp/packages/mcp-server-supabase/dist/transports/stdio.js');

// Spawn the MCP server process
const mcpProcess = spawn('node', [mcpServerPath]);

// Handle process output
mcpProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Look for tool result in the output
  if (output.includes('"type":"tool_result"')) {
    try {
      // Extract the JSON part
      const jsonStart = output.indexOf('{');
      const jsonEnd = output.lastIndexOf('}') + 1;
      const jsonStr = output.substring(jsonStart, jsonEnd);
      const result = JSON.parse(jsonStr);
      
      if (result.type === 'tool_result' && result.body && result.body.results) {
        const searchResults = result.body.results;
        
        console.log(`\n✅ Found ${searchResults.length} results:`);
        
        searchResults.forEach((result, index) => {
          console.log(`\n📄 Result ${index + 1}:`);
          console.log(`Title: ${result.title}`);
          console.log(`URL: ${result.url}`);
          console.log(`Excerpt: ${result.excerpt}`);
        });
      } else {
        console.log('\n❌ No results found or unexpected response format');
      }
    } catch (error) {
      console.error('\n❌ Error parsing response:', error.message);
    }
    
    // Close the process after getting results
    mcpProcess.stdin.end();
  }
});

// Handle errors
mcpProcess.stderr.on('data', (data) => {
  console.error(`❌ Error: ${data}`);
});

// Handle process exit
mcpProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`\n❌ Process exited with code ${code}`);
  } else {
    console.log('\n✅ Search completed successfully');
  }
  
  console.log('\n📝 Note: This demonstrates the search_docs tool of the Supabase MCP server.');
  console.log('The MCP server provides many other tools for AI assistants to interact with Supabase projects.');
});

// Send the search_docs tool request
const toolRequest = {
  type: "tool_call",
  body: {
    name: "search_docs",
    parameters: {
      query: searchQuery
    }
  }
};

// Write the request to the process stdin
mcpProcess.stdin.write(JSON.stringify(toolRequest) + '\n');
