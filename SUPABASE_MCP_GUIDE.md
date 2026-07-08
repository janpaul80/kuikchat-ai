# Supabase MCP Server Setup Guide

This guide will help you set up the Supabase Model Context Protocol (MCP) server to connect your Supabase projects to AI assistants like Cursor, Claude, and Windsurf.

## What is the Model Context Protocol (MCP)?

The Model Context Protocol (MCP) standardizes how Large Language Models (LLMs) talk to external services like Supabase. It connects AI assistants directly with your Supabase project and allows them to perform tasks like managing tables, fetching config, and querying data.

## Prerequisites

- Node.js (LTS version)
- pnpm package manager
- A Supabase account and project
- (Optional) A Supabase access token for authenticated requests

## Step 1: Install pnpm

If you don't have pnpm installed, you can install it using npm:

```bash
npm install -g pnpm
```

## Step 2: Clone the Supabase MCP Repository

```bash
git clone https://github.com/supabase-community/supabase-mcp.git
cd supabase-mcp
```

## Step 3: Install Dependencies

```bash
pnpm install
```

## Step 4: Build the MCP Server

```bash
pnpm build
```

## Step 5: Create the MCP Configuration File

Create a file named `blackbox_mcp_settings.json` in your project root with the following content:

```json
{
  "mcpServers": {
    "github.com/supabase-community/supabase-mcp": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

For local development or self-hosted Supabase, you can use:

```json
{
  "mcpServers": {
    "github.com/supabase-community/supabase-mcp": {
      "type": "http",
      "url": "http://localhost:54321/mcp"
    }
  }
}
```

## Step 6: Configure Your MCP Client

Most MCP clients will automatically detect the `blackbox_mcp_settings.json` file. If you're using a specific client that requires manual configuration, check their documentation for how to set up the MCP server.

## Step 7: Test the MCP Server

You can test the MCP server by creating a simple script:

```javascript
// demo_mcp.js
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Example: List tables in the public schema
async function listTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error listing tables:', error);
      return;
    }
    
    console.log('Tables in public schema:');
    data.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listTables();
```

Run the script:

```bash
node demo_mcp.js
```

## Step 8: Use MCP Tools

Once your MCP server is set up, you can use it with AI assistants to perform various tasks. Here are some examples:

### Example 1: Search Documentation

```javascript
// search_docs_example.js
// This would be executed by the AI assistant
async function searchDocs(query) {
  // The AI would use the MCP server to search Supabase docs
  const results = await mcpServer.searchDocs(query);
  return results;
}

// Example query: "How to set up Row Level Security in Supabase"
```

### Example 2: List Tables

```javascript
// list_tables_example.js
// This would be executed by the AI assistant
async function listTables() {
  // The AI would use the MCP server to list tables
  const tables = await mcpServer.listTables();
  return tables;
}
```

### Example 3: Execute SQL

```javascript
// execute_sql_example.js
// This would be executed by the AI assistant
async function executeQuery(sql) {
  // The AI would use the MCP server to execute SQL
  const results = await mcpServer.executeSQL(sql);
  return results;
}

// Example query: "SELECT * FROM users LIMIT 10"
```

## Security Considerations

1. **Read-only mode**: Set the server to read-only mode to prevent write operations:
   ```
   https://mcp.supabase.com/mcp?read_only=true
   ```

2. **Project scoping**: Scope your MCP server to a specific project:
   ```
   https://mcp.supabase.com/mcp?project_ref=<project-ref>
   ```

3. **Feature groups**: Enable only specific tool groups:
   ```
   https://mcp.supabase.com/mcp?features=database,docs
   ```

4. **Development environment**: Use the MCP server with a development project, not production.

## Troubleshooting

### Issue: Authentication Errors

If you're experiencing authentication errors, make sure:
- Your Supabase access token is valid
- You have the necessary permissions for the project
- The project reference is correct

### Issue: Connection Errors

If you can't connect to the MCP server:
- Check your network connection
- Verify the MCP server URL is correct
- Ensure your Supabase project is active (not paused)

### Issue: Tool Execution Errors

If tools are failing to execute:
- Check if you have the necessary permissions
- Verify that the feature is enabled in your URL parameters
- Make sure you're not in read-only mode when trying to perform write operations

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase MCP GitHub Repository](https://github.com/supabase-community/supabase-mcp)
