// Final MCP demo with Supabase authentication
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function finalMcpDemo() {
  console.log('🔍 Final MCP Demo with Supabase');
  console.log('==============================');
  
  // Check MCP settings
  console.log('\n1. Checking MCP settings...');
  const mcpSettingsPath = path.join(process.cwd(), 'blackbox_mcp_settings.json');
  
  if (fs.existsSync(mcpSettingsPath)) {
    try {
      const mcpSettings = JSON.parse(fs.readFileSync(mcpSettingsPath, 'utf8'));
      console.log('✅ MCP settings file found');
      
      // Check if Supabase MCP server is configured
      if (mcpSettings.mcpServers && 
          mcpSettings.mcpServers['github.com/supabase-community/supabase-mcp']) {
        console.log('✅ Supabase MCP server is configured');
        console.log(`   Server: ${JSON.stringify(mcpSettings.mcpServers['github.com/supabase-community/supabase-mcp'], null, 2)}`);
      } else {
        console.error('❌ Supabase MCP server is not configured correctly');
        return;
      }
    } catch (error) {
      console.error(`❌ Error parsing MCP settings: ${error.message}`);
      return;
    }
  } else {
    console.error('❌ MCP settings file not found');
    return;
  }
  
  // Initialize Supabase client
  console.log('\n2. Initializing Supabase client...');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
    
    // Check auth functionality
    console.log('\n3. Checking authentication status...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`❌ Error checking session: ${error.message}`);
      return;
    }
    
    if (data.session) {
      console.log('✅ User is authenticated');
      console.log(`   User: ${data.session.user.email}`);
      
      // Use MCP to search docs
      console.log('\n4. Using MCP to search Supabase docs...');
      try {
        const response = await fetch('https://mcp.supabase.com/mcp?features=docs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
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
                query: 'model context protocol'
              }
            }
          })
        });
        
        const searchData = await response.json();
        console.log('✅ MCP search_docs response:');
        console.log(JSON.stringify(searchData, null, 2));
        
        // Try to list projects
        console.log('\n5. Using MCP to list projects...');
        try {
          const projectsResponse = await fetch('https://mcp.supabase.com/mcp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
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
          
          const projectsData = await projectsResponse.json();
          console.log('✅ MCP list_projects response:');
          console.log(JSON.stringify(projectsData, null, 2));
          
        } catch (error) {
          console.error(`❌ Error listing projects: ${error.message}`);
        }
        
      } catch (error) {
        console.error(`❌ Error using MCP: ${error.message}`);
      }
    } else {
      console.log('❌ User is not authenticated');
      console.log('   Please authenticate first using the OAuth flow');
      console.log('   Run: node oauth_debug_browser.js');
    }
  } catch (error) {
    console.error(`❌ Error initializing Supabase client: ${error.message}`);
    return;
  }
  
  console.log('\n==============================');
  console.log('✅ MCP demo complete');
}

// Run the demo
finalMcpDemo().catch(console.error);

// Update package.json
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add final MCP demo script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['final-mcp-demo'] = 'node mcp_demo_final.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with final-mcp-demo script');
  }
} catch (error) {
  console.error(`❌ Error updating package.json: ${error.message}`);
}
