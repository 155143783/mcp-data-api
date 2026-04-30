#!/usr/bin/env node
/**
 * Simple test script for MCP Data API Server
 * Run with: node test-server.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create MCP Server instance
const server = new McpServer({
  name: "data-api",
  version: "1.0.0",
});

// Test tool for verification
server.tool(
  "test",
  "Test tool to verify server is working",
  {},
  async () => {
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, message: "MCP Data API Server is working!" }) }],
    };
  }
);

// GitHub trending tool
server.tool(
  "github_trending",
  "Get GitHub trending repositories",
  {
    language: z.string().optional(),
    since: z.enum(["daily", "weekly", "monthly"]).optional(),
    limit: z.number().min(1).max(100).optional().default(10),
  },
  async ({ limit = 10 }) => {
    try {
      const url = `https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=${limit}`;
      const response = await fetch(url, { headers: { "User-Agent": "MCP-Data-API/1.0" } });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      const repos = data.items?.slice(0, limit).map((repo) => ({
        name: repo.full_name,
        stars: repo.stargazers_count,
        language: repo.language,
      })) || [];
      return { content: [{ type: "text", text: JSON.stringify({ success: true, data: repos }, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

async function main() {
  console.error("MCP Data API Server started (test mode)");
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
