# MCP Data API Server - Listing for MCP Official Registry

## Server Configuration

```json
{
  "name": "data-api",
  "description": "MCP server providing access to data APIs: GitHub trending, NPM stats, HackerNews, crypto prices, and Ethereum gas prices",
  "author": "Your Name",
  "homepage": "https://github.com/your-username/mcp-data-api",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/mcp-data-api"
  },
  "license": "MIT",
  "version": "1.0.0",
  "runtime": "node",
  "languages": ["typescript", "javascript"],
  "tools": [
    {
      "name": "github_trending",
      "description": "Get GitHub trending repositories",
      "inputSchema": {
        "type": "object",
        "properties": {
          "language": { "type": "string" },
          "since": { "type": "string", "enum": ["daily", "weekly", "monthly"] },
          "limit": { "type": "number" }
        }
      }
    },
    {
      "name": "npm_stats",
      "description": "Get NPM package download statistics",
      "inputSchema": {
        "type": "object",
        "properties": {
          "package": { "type": "string" },
          "period": { "type": "string", "enum": ["last-day", "last-week", "last-month"] }
        },
        "required": ["package"]
      }
    },
    {
      "name": "hackernews_top",
      "description": "Get Hacker News top stories",
      "inputSchema": {
        "type": "object",
        "properties": {
          "limit": { "type": "number" }
        }
      }
    },
    {
      "name": "crypto_price",
      "description": "Get cryptocurrency prices from CoinGecko",
      "inputSchema": {
        "type": "object",
        "properties": {
          "symbol": { "type": "string" },
          "currency": { "type": "string" }
        },
        "required": ["symbol"]
      }
    },
    {
      "name": "crypto_gas",
      "description": "Get Ethereum gas prices",
      "inputSchema": {
        "type": "object",
        "properties": {}
      }
    }
  ],
  "installations": {
    "npm": "npm install mcp-data-api",
    "npx": "npx tsx server.ts"
  }
}
```

## For MCP Registry PR

When submitting to https://github.com/modelcontextprotocol/registry, add your server configuration to the appropriate category in the registry.
