# Supabase MCP Server Setup Guide

This guide explains how to set up and use the Supabase Model Context Protocol (MCP) server, which allows AI assistants to interact with your Supabase projects.

## What is the Supabase MCP Server?

The [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) standardizes how Large Language Models (LLMs) talk to external services like Supabase. It connects AI assistants directly with your Supabase project and allows them to perform tasks like:

- Managing database tables
- Fetching configuration
- Querying data
- Searching documentation
- Managing edge functions
- And more

## Setup Steps

### 1. Installation

We've already completed the following steps:

- Cloned the repository: `git clone https://github.com/supabase-community/supabase-mcp.git`
- Installed dependencies: `cd supabase-mcp && pnpm install`
- Built the server: `pnpm build`

### 2. Configuration

We've created a `blackbox_mcp_settings.json` file with the following configuration:

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

This configuration uses the hosted Supabase MCP server at `https://mcp.supabase.com/mcp`.

### 3. Authentication

To use the MCP server, you need a Supabase Personal Access Token (PAT). Here's how to get one:

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign in to your Supabase account
3. Click on your profile icon in the top right
4. Select "Access Tokens"
5. Create a new token with the necessary permissions
6. Copy the token

### 4. Running the Server Locally

To run the server locally, you need to provide your Supabase access token:

```bash
cd supabase-mcp
SUPABASE_ACCESS_TOKEN=your_token_here pnpm --filter @supabase/mcp-server-supabase dev
```

Or you can use our script:

```bash
SUPABASE_ACCESS_TOKEN=your_token_here node run_mcp_server.js
```

### 5. Using with AI Assistants

Most AI assistants that support MCP will automatically detect and use the MCP server when configured properly. You can ask the AI to:

- Search Supabase documentation
- List your Supabase projects
- Query your database
- Create or modify database tables
- Deploy edge functions
- And more

## Available Tools

The Supabase MCP server provides the following tool groups:

1. **Account**: List projects, get project details, create/pause/restore projects
2. **Knowledge Base**: Search Supabase documentation
3. **Database**: List tables, execute SQL, apply migrations
4. **Debugging**: Get logs, get advisors
5. **Development**: Get project URL, get API keys, generate TypeScript types
6. **Edge Functions**: List, get, and deploy edge functions
7. **Branching**: Create, list, delete, merge, reset, and rebase branches
8. **Storage**: List buckets, get and update storage config

## Security Considerations

When using the Supabase MCP server, keep these security best practices in mind:

1. **Don't connect to production**: Use the MCP server with a development project, not production.
2. **Don't give to your customers**: The MCP server operates under your developer permissions.
3. **Use read-only mode**: Set the server to read-only mode to prevent write operations.
4. **Project scoping**: Scope your MCP server to a specific project to limit access.
5. **Use branching**: Use Supabase's branching feature to test changes safely.
6. **Limit tool groups**: Enable only the tool groups you need.

## Demonstration

We've set up the Supabase MCP server with the configuration in `blackbox_mcp_settings.json`. To use it with an AI assistant:

1. Configure the AI assistant with the MCP settings
2. Ask the AI to perform Supabase operations like:
   - "Search the Supabase documentation for authentication"
   - "List available Supabase tools"
   - "Get information about database tables"

Note that you'll need to authenticate with your Supabase account when prompted.

## Troubleshooting

- **Authentication errors**: Make sure your access token is valid and has the necessary permissions.
- **Connection issues**: Check that the MCP server URL is correct and accessible.
- **Permission errors**: Ensure your Supabase account has access to the projects you're trying to work with.
- **Tool availability**: Some tools may be disabled based on your configuration or account type.

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase MCP GitHub Repository](https://github.com/supabase-community/supabase-mcp)
