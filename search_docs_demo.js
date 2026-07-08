// MCP search_docs demo
import fetch from 'node-fetch';

async function searchDocsDemo() {
  console.log('🔍 MCP Search Docs Demo');
  console.log('======================');
  
  console.log('\n1. Using MCP to search Supabase docs...');
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
            query: 'model context protocol'
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
  
  console.log('\n======================');
  console.log('✅ MCP search_docs demo complete');
}

// Run the demo
searchDocsDemo().catch(console.error);

// Update package.json
import fs from 'fs';
import path from 'path';

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add search docs demo script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['search-docs-demo'] = 'node search_docs_demo.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with search-docs-demo script');
  }
} catch (error) {
  console.error(`❌ Error updating package.json: ${error.message}`);
}
