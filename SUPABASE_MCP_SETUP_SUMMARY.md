# Supabase MCP Server Setup Guide

This guide provides a comprehensive overview of setting up and using the Supabase MCP (Model Context Protocol) server, which allows AI assistants to interact with your Supabase projects.

## What We've Done

1. **Cloned the Supabase MCP Repository**
   - Repository: https://github.com/supabase-community/supabase-mcp
   - Location: `/home/jp/Documents/kuikchat/supabase-mcp`

2. **Created MCP Configuration**
   - Created `blackbox_mcp_settings.json` with the server name "github.com/supabase-community/supabase-mcp"
   - This configuration allows BLACKBOXAI to connect to the Supabase MCP server

3. **Created Demo Scripts**
   - `demo_mcp.js`: Demonstrates basic MCP server functionality
   - `run_mcp_server.js`: Script to run the MCP server locally
   - `search_docs_example.js`: Example of using the search_docs tool
   - `mcp_demo_improved.js`: Enhanced demo with more MCP tools

4. **Added Authentication Debugging**
   - Created `AuthDebugger.tsx` component to help with OAuth debugging
   - Added the component to App.tsx for easy access
   - Updated OAuth redirect URLs to use port 3000 instead of 5173

5. **Created Testing Scripts**
   - `check_local_server.js`: Verifies if the local development server is running
   - `test_google_oauth.js`: Tests Google OAuth login with Supabase
   - `check_supabase_config.js`: Validates Supabase configuration

## How to Use the MCP Server

### 1. Start Your Local Development Server

```bash
npm run dev
```

### 2. Run the MCP Server

```bash
node run_mcp_server.js
```

### 3. Use MCP Tools

The Supabase MCP server provides several tools that AI assistants can use:

- **Database Tools**: list_tables, execute_sql, apply_migration
- **Authentication**: get_publishable_keys
- **Documentation**: search_docs
- **Project Management**: list_projects, get_project
- **Edge Functions**: list_edge_functions, deploy_edge_function

### 4. Example: Search Supabase Documentation

```bash
node search_docs_example.js "how to set up Google OAuth"
```

### 5. Example: Run a Complete MCP Demo

```bash
node mcp_demo_improved.js
```

## Troubleshooting

### OAuth Issues

If you encounter issues with Google OAuth:

1. Run the test script:
   ```bash
   node test_google_oauth.js
   ```

2. Check the AuthDebugger component in your app
3. Verify redirect URLs in Supabase and Google Cloud Console
4. Ensure your local server is running on port 3000

### MCP Server Connection Issues

If the MCP server fails to connect:

1. Check if your Supabase project is accessible
2. Verify your Supabase API keys in .env.local
3. Ensure the MCP server is running

## Next Steps

1. **Explore More MCP Tools**: Try using other tools like list_tables or execute_sql
2. **Integrate with AI Assistants**: Connect your Supabase project to AI assistants like Claude or ChatGPT
3. **Develop Custom MCP Tools**: Extend the MCP server with your own custom tools

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
