
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
  console.log('\n1. Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
  
  // Use MCP to search docs
  console.log('\n2. Using MCP to search Supabase docs...');
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
    console.error(`❌ Error using MCP: ${error.message}`);
  }
  
  // Check auth status
  console.log('\n3. Checking authentication status...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`❌ Error checking session: ${error.message}`);
    } else if (data.session) {
      console.log('✅ User is authenticated');
      console.log(`   User: ${data.session.user.email}`);
      
      // Try to list projects using MCP
      console.log('\n4. Using MCP to list projects...');
      try {
        const response = await fetch('https://mcp.supabase.com/mcp', {
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
        
        const projectData = await response.json();
        console.log('✅ MCP list_projects response:');
        console.log(JSON.stringify(projectData, null, 2));
        
      } catch (error) {
        console.error(`❌ Error listing projects: ${error.message}`);
      }
    } else {
      console.log('❌ User is not authenticated');
      console.log('   Please authenticate first using the OAuth flow');
    }
  } catch (error) {
    console.error(`❌ Error checking authentication: ${error.message}`);
  }
  
  console.log('\n=================================');
  console.log('✅ MCP demo complete');
}

// Run the demo
demoMcp().catch(console.error);
  