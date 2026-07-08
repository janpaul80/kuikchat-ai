// Final demonstration of Supabase MCP server capabilities
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const MCP_CONFIG_PATH = './blackbox_mcp_settings.json';
const SERVER_NAME = 'github.com/supabase-community/supabase-mcp';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to create MCP config file if it doesn't exist
async function ensureMcpConfig() {
  try {
    await fs.access(MCP_CONFIG_PATH);
    console.log(`${colors.green}✓${colors.reset} MCP configuration file exists`);
  } catch (error) {
    console.log(`${colors.yellow}!${colors.reset} Creating MCP configuration file...`);
    
    const config = {
      mcpServers: {
        [SERVER_NAME]: {
          type: "http",
          url: "https://mcp.supabase.com/mcp"
        }
      }
    };
    
    await fs.writeFile(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`${colors.green}✓${colors.reset} Created MCP configuration file`);
  }
}

// Function to simulate an AI assistant using the search_docs tool
async function demonstrateSearchDocs(query) {
  console.log(`\n${colors.bright}${colors.blue}AI Assistant:${colors.reset} I'll search the Supabase documentation for "${query}"`);
  console.log(`\n${colors.dim}Using search_docs tool...${colors.reset}`);
  
  return new Promise((resolve, reject) => {
    const searchProcess = spawn('node', [
      path.join(process.cwd(), 'supabase-mcp/packages/mcp-server-supabase/dist/transports/stdio.js')
    ]);
    
    let outputData = '';
    let errorData = '';
    let toolResponse = '';
    let toolResponseStarted = false;
    
    searchProcess.stdout.on('data', (data) => {
      const dataStr = data.toString();
      outputData += dataStr;
      
      // Check if we've received the tool response
      if (dataStr.includes('"type":"tool_result"')) {
        toolResponseStarted = true;
        toolResponse += dataStr;
      } else if (toolResponseStarted) {
        toolResponse += dataStr;
      }
    });
    
    searchProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    searchProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`${colors.red}Error:${colors.reset} Process exited with code ${code}`);
        console.error(errorData);
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      
      try {
        // Extract and parse the tool response
        const jsonStart = toolResponse.indexOf('{');
        const jsonEnd = toolResponse.lastIndexOf('}') + 1;
        const jsonStr = toolResponse.substring(jsonStart, jsonEnd);
        const result = JSON.parse(jsonStr);
        
        if (result.type === 'tool_result' && result.body && result.body.results) {
          const searchResults = result.body.results;
          
          console.log(`\n${colors.bright}${colors.blue}AI Assistant:${colors.reset} Here's what I found in the Supabase documentation:`);
          
          searchResults.forEach((result, index) => {
            console.log(`\n${colors.bright}${colors.cyan}Result ${index + 1}:${colors.reset}`);
            console.log(`${colors.bright}Title:${colors.reset} ${result.title}`);
            console.log(`${colors.bright}URL:${colors.reset} ${result.url}`);
            console.log(`${colors.bright}Excerpt:${colors.reset} ${result.excerpt}`);
          });
          
          resolve(searchResults);
        } else {
          console.log(`\n${colors.bright}${colors.blue}AI Assistant:${colors.reset} I couldn't find any relevant information in the Supabase documentation.`);
          resolve([]);
        }
      } catch (error) {
        console.error(`${colors.red}Error parsing response:${colors.reset}`, error);
        reject(error);
      }
    });
    
    // Send the search_docs tool request
    const toolRequest = {
      type: "tool_call",
      body: {
        name: "search_docs",
        parameters: {
          query: query
        }
      }
    };
    
    searchProcess.stdin.write(JSON.stringify(toolRequest) + '\n');
    searchProcess.stdin.end();
  });
}

// Main function
async function main() {
  console.log(`\n${colors.bright}${colors.magenta}=== Supabase MCP Server Demonstration ===${colors.reset}`);
  console.log(`This script demonstrates the capabilities of the Supabase MCP server`);
  
  // Ensure MCP config exists
  await ensureMcpConfig();
  
  // Ask for a search query
  const query = await question(`\n${colors.bright}Enter a Supabase documentation search query:${colors.reset} `);
  
  // Demonstrate search_docs tool
  try {
    await demonstrateSearchDocs(query);
  } catch (error) {
    console.error(`${colors.red}Error during demonstration:${colors.reset}`, error);
  }
  
  console.log(`\n${colors.bright}${colors.magenta}=== Demonstration Complete ===${colors.reset}`);
  console.log(`\nThe Supabase MCP server provides many other tools for AI assistants:`);
  console.log(`- ${colors.cyan}Database Tools:${colors.reset} list_tables, execute_sql, apply_migration`);
  console.log(`- ${colors.cyan}Authentication:${colors.reset} get_publishable_keys, get_project_url`);
  console.log(`- ${colors.cyan}Project Management:${colors.reset} list_projects, get_project`);
  console.log(`- ${colors.cyan}Edge Functions:${colors.reset} list_edge_functions, deploy_edge_function`);
  console.log(`- ${colors.cyan}Storage:${colors.reset} list_storage_buckets, get_storage_config`);
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
