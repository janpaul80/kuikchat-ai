// Test MCP server with Supabase integration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec
const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if blackbox_mcp_settings.json exists
const mcpSettingsPath = path.join(process.cwd(), 'blackbox_mcp_settings.json');

async function testMcpWithSupabase() {
  console.log('🔍 Testing MCP Server with Supabase');
  console.log('==================================');
  
  // Check Supabase configuration
  console.log('\n1. Checking Supabase configuration...');
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  console.log('✅ Supabase environment variables found');
  
  // Initialize Supabase client
  console.log('\n2. Initializing Supabase client...');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
    
    // Check auth functionality
    console.log('\n3. Checking auth functionality...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`❌ Error checking session: ${error.message}`);
    } else {
      console.log(`✅ Auth functionality working (Session: ${data.session ? 'Active' : 'None'})`);
    }
  } catch (error) {
    console.error(`❌ Error initializing Supabase client: ${error.message}`);
    return;
  }
  
  // Check MCP settings
  console.log('\n4. Checking MCP settings...');
  let mcpSettings;
  
  if (fs.existsSync(mcpSettingsPath)) {
    try {
      mcpSettings = JSON.parse(fs.readFileSync(mcpSettingsPath, 'utf8'));
      console.log('✅ MCP settings file found');
      
      // Check if Supabase MCP server is configured
      if (mcpSettings.mcpServers && 
          mcpSettings.mcpServers['github.com/supabase-community/supabase-mcp']) {
        console.log('✅ Supabase MCP server is configured');
        console.log(`   Server: ${JSON.stringify(mcpSettings.mcpServers['github.com/supabase-community/supabase-mcp'], null, 2)}`);
      } else {
        console.log('❌ Supabase MCP server is not configured');
        console.log('   Creating MCP settings with Supabase server...');
        
        // Create MCP settings with Supabase server
        mcpSettings = {
          mcpServers: {
            'github.com/supabase-community/supabase-mcp': {
              type: 'http',
              url: 'https://mcp.supabase.com/mcp'
            }
          }
        };
        
        fs.writeFileSync(mcpSettingsPath, JSON.stringify(mcpSettings, null, 2));
        console.log('✅ Created MCP settings with Supabase server');
      }
    } catch (error) {
      console.error(`❌ Error parsing MCP settings: ${error.message}`);
      return;
    }
  } else {
    console.log('❌ MCP settings file not found');
    console.log('   Creating MCP settings file...');
    
    // Create MCP settings file
    mcpSettings = {
      mcpServers: {
        'github.com/supabase-community/supabase-mcp': {
          type: 'http',
          url: 'https://mcp.supabase.com/mcp'
        }
      }
    };
    
    fs.writeFileSync(mcpSettingsPath, JSON.stringify(mcpSettings, null, 2));
    console.log('✅ Created MCP settings file');
  }
  
  // Check if supabase-mcp directory exists
  console.log('\n5. Checking supabase-mcp directory...');
  const supabaseMcpPath = path.join(process.cwd(), 'supabase-mcp');
  
  if (fs.existsSync(supabaseMcpPath)) {
    console.log('✅ supabase-mcp directory found');
    
    // Check if packages directory exists
    const packagesPath = path.join(supabaseMcpPath, 'packages');
    if (fs.existsSync(packagesPath)) {
      console.log('✅ packages directory found');
      
      // Check if mcp-server-supabase directory exists
      const mcpServerPath = path.join(packagesPath, 'mcp-server-supabase');
      if (fs.existsSync(mcpServerPath)) {
        console.log('✅ mcp-server-supabase directory found');
      } else {
        console.log('❌ mcp-server-supabase directory not found');
      }
    } else {
      console.log('❌ packages directory not found');
    }
  } else {
    console.log('❌ supabase-mcp directory not found');
    console.log('   You may need to clone the repository again');
  }
  
  // Create MCP demo script
  console.log('\n6. Creating MCP demo script...');
  const mcpDemoPath = path.join(process.cwd(), 'mcp_demo_with_supabase.js');
  
  const mcpDemoContent = `
// MCP demo with Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function demoMcp() {
  console.log('🔍 Demonstrating MCP with Supabase');
  console.log('=================================');
  
  // Initialize Supabase client
  console.log('\\n1. Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
  
  // Use MCP to search docs
  console.log('\\n2. Using MCP to search Supabase docs...');
  try {
    const response = await fetch('https://mcp.supabase.com/mcp?features=docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool_choice: {
          type: 'function',
          function: { name: 'search_docs' }
        },
        tools: [
          {
            type: 'function',
            function: {
              name: 'search_docs',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The search query'
                  }
                },
                required: ['query']
              }
            }
          }
        ],
        tool_inputs: {
          search_docs: {
            query: 'google oauth'
          }
        }
      })
    });
    
    const data = await response.json();
    console.log('✅ MCP search_docs response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error(\`❌ Error using MCP: \${error.message}\`);
  }
  
  // Check auth status
  console.log('\\n3. Checking authentication status...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(\`❌ Error checking session: \${error.message}\`);
    } else if (data.session) {
      console.log('✅ User is authenticated');
      console.log(\`   User: \${data.session.user.email}\`);
      
      // Try to list projects using MCP
      console.log('\\n4. Using MCP to list projects...');
      try {
        const response = await fetch('https://mcp.supabase.com/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${data.session.access_token}\`
          },
          body: JSON.stringify({
            tool_choice: {
              type: 'function',
              function: { name: 'list_projects' }
            },
            tools: [
              {
                type: 'function',
                function: {
                  name: 'list_projects',
                  parameters: {
                    type: 'object',
                    properties: {}
                  }
                }
              }
            ],
            tool_inputs: {
              list_projects: {}
            }
          })
        });
        
        const projectData = await response.json();
        console.log('✅ MCP list_projects response:');
        console.log(JSON.stringify(projectData, null, 2));
        
      } catch (error) {
        console.error(\`❌ Error listing projects: \${error.message}\`);
      }
    } else {
      console.log('❌ User is not authenticated');
      console.log('   Please authenticate first using the OAuth flow');
    }
  } catch (error) {
    console.error(\`❌ Error checking authentication: \${error.message}\`);
  }
  
  console.log('\\n=================================');
  console.log('✅ MCP demo complete');
}

// Run the demo
demoMcp().catch(console.error);
  `;
  
  fs.writeFileSync(mcpDemoPath, mcpDemoContent);
  console.log('✅ Created MCP demo script');
  
  // Update package.json
  console.log('\n7. Updating package.json...');
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add MCP demo script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['mcp-demo'] = 'node mcp_demo_with_supabase.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json');
  } catch (error) {
    console.error(`❌ Error updating package.json: ${error.message}`);
  }
  
  console.log('\n==================================');
  console.log('✅ MCP with Supabase setup complete');
  console.log('\nNext steps:');
  console.log('1. Run the MCP demo: npm run mcp-demo');
  console.log('2. If you need to authenticate, run: node oauth_debug_browser.js');
  console.log('3. After authentication, run the MCP demo again');
}

// Run the test
testMcpWithSupabase().catch(console.error);
