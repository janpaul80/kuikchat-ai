// Test MCP server connection
import fetch from 'node-fetch';
import fs from 'fs/promises';

async function testMcpConnection() {
  console.log('🔍 Testing Supabase MCP server connection');
  console.log('=======================================');
  
  try {
    // Read MCP configuration
    const configData = await fs.readFile('./blackbox_mcp_settings.json', 'utf8');
    const config = JSON.parse(configData);
    
    // Get server URL
    const serverName = 'github.com/supabase-community/supabase-mcp';
    const serverConfig = config.mcpServers[serverName];
    
    if (!serverConfig) {
      console.error('❌ Server configuration not found for:', serverName);
      return;
    }
    
    const serverUrl = serverConfig.url;
    console.log(`Attempting to connect to MCP server: ${serverUrl}`);
    
    // Test connection
    const response = await fetch(serverUrl, { 
      method: 'GET',
      timeout: 5000 // 5 second timeout
    });
    
    if (response.ok) {
      console.log('✅ MCP server is accessible!');
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      // Get response body
      const body = await response.text();
      console.log('\nResponse preview:');
      console.log(body.substring(0, 200) + (body.length > 200 ? '...' : ''));
      
      console.log('\nThe Supabase MCP server is properly configured and ready to use.');
    } else {
      console.log(`❌ Server responded with status: ${response.status} ${response.statusText}`);
      console.log('\nTroubleshooting:');
      console.log('- Check if the Supabase MCP server is running');
      console.log('- Verify that the URL in blackbox_mcp_settings.json is correct');
      console.log('- Ensure you have internet connectivity');
    }
  } catch (error) {
    console.error('❌ Could not connect to MCP server:', error.message);
    console.log('\nTroubleshooting:');
    console.log('- Check your internet connection');
    console.log('- Verify that the URL in blackbox_mcp_settings.json is correct');
    console.log('- Ensure the Supabase MCP server is publicly accessible');
  }
}

// Run the test
testMcpConnection();
