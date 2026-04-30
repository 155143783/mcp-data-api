# MCP Data API Server

MCP server providing access to popular data APIs for AI agents and applications.

## Features

- **GitHub Trending** - Get trending GitHub repositories
- **NPM Stats** - Get NPM package download statistics
- **HackerNews** - Get top stories from Hacker News
- **Crypto Price** - Get cryptocurrency prices from CoinGecko
- **Crypto Gas** - Get Ethereum gas prices

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Usage

### Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "data-api": {
      "command": "npx",
      "args": ["tsx", "src/server.ts"],
      "cwd": "/path/to/mcp-data-api"
    }
  }
}
```

### Using as CLI

```bash
npm start
```

## Available Tools

### github_trending
Get GitHub trending repositories.

Parameters:
- `language` (optional): Programming language filter (e.g., 'typescript')
- `since` (optional): Time range - 'daily', 'weekly', or 'monthly'
- `limit` (optional): Number of results (default: 10)

### npm_stats
Get NPM package download statistics.

Parameters:
- `package`: NPM package name (e.g., 'lodash')
- `period` (optional): Time period - 'last-day', 'last-week', 'last-month'

### hackernews_top
Get Hacker News top stories.

Parameters:
- `limit` (optional): Number of stories (default: 10)

### crypto_price
Get cryptocurrency price from CoinGecko.

Parameters:
- `symbol`: Cryptocurrency symbol (e.g., 'bitcoin', 'ethereum')
- `currency` (optional): Fiat currency (default: 'usd')

### crypto_gas
Get Ethereum gas prices.

No parameters required.

## Deployment

### Local Deployment
```bash
npm run build
npm start
```

### Apify Deployment
```bash
# Install Apify CLI
npm install -g apify-cli

# Login to Apify
apify login

# Push to Apify
apify push
```

After deployment, enable Standby mode in Apify Console for persistent MCP endpoints.

## License

MIT
