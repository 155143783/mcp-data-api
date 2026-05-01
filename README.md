# MCP Data API Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> **Production-ready MCP Server with 16 powerful data tools** for AI agents. Query GitHub trending, NPM stats, HackerNews, crypto prices, weather, news, and more.

## 🎯 Features

### 16 Built-in Tools

| Category | Tools |
|----------|-------|
| **GitHub** | `github_trending` - Get trending repositories by language/timeframe |
| **NPM** | `npm_downloads` - Download stats, `npm_package_info` - Package details |
| **Social** | `hackernews_top`, `reddit_trending` - Top posts from tech communities |
| **Crypto** | `crypto_price` - Real-time prices, `crypto_news` - Latest news |
| **Weather** | `weather_current`, `weather_forecast` - Current & forecast data |
| **News** | `news_headlines` - Top headlines by category/country |
| **Finance** | `stock_quote` - Stock prices, `forex_rate` - Currency exchange |
| **Utilities** | `ip_lookup`, `qr_generate`, `url_shorten`, `base64_encode`, `hash_generate` |

### Deployment Modes

- **MCP Protocol** - Native MCP server for AI agent integration
- **HTTP Mode** - REST API server for direct HTTP access
- **x402 Support** - Optional micro-payment for API access (USDC on Base)

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### Configuration

Create `config.json`:

```json
{
  "mcp": {
    "port": 3000,
    "auth": {
      "type": "bearer",
      "token": "your-api-key"
    }
  },
  "x402": {
    "enabled": true,
    "maxPrice": 1000000,
    "paymentAddress": "0x..."
  }
}
```

### Run MCP Server

```bash
# MCP Protocol mode
npm start

# HTTP mode
npm run http
```

### Docker Deployment

```bash
# Build
docker build -t mcp-data-api .

# Run
docker run -p 3000:3000 -v ./config.json:/app/config.json mcp-data-api
```

## 💳 x402 Micro-Payment

The x402 protocol enables pay-per-request API access using USDC on Base chain.

```javascript
// Request with x402 payment
const response = await fetch('https://api.example.com/github/trending', {
  headers: {
    'Authorization': 'Bearer your-key',
    'X-402-Payment': 'amount=1000000&address=0x...&signature=...'
  }
});
```

## 📖 API Documentation

### MCP Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `github_trending` | `language`, ` timeframe` | Trending repos |
| `crypto_price` | `symbol` | Current price |
| `weather_current` | `city` | Current weather |
| `news_headlines` | `category`, `country` | Top headlines |

### HTTP Endpoints

```
GET /api/github/trending?language=typescript
GET /api/crypto/price?symbol=BTC
GET /api/weather?city=Beijing
GET /api/news?category=technology
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [GitHub Repository](https://github.com/155143783/mcp-data-api)
- [Report Issues](https://github.com/155143783/mcp-data-api/issues)

## 🌐 Live Demo

Try the MCP Server right now:

- **Health Check**: [https://compliant-milton-hybrid-hoped.trycloudflare.com/health](https://compliant-milton-hybrid-hoped.trycloudflare.com/health)
- **MCP Endpoint**: `POST https://compliant-milton-hybrid-hoped.trycloudflare.com/mcp`
- **Server Card**: [https://compliant-milton-hybrid-hoped.trycloudflare.com/server-card.json](https://compliant-milton-hybrid-hoped.trycloudflare.com/server-card.json)

## 🧩 Coze Skills (Try Online)

Related skills deployed on Coze platform:

| Skill | URL |
|-------|-----|
| 📊 Data Visualization | [https://rvpk8hwp7f.coze.site](https://rvpk8hwp7f.coze.site) |
| 📈 Stock Technical Analysis | [https://x9pbf5fcrh.coze.site](https://x9pbf5fcrh.coze.site) |
| 🔍 Hotspot Research | [https://nq495w538h.coze.site](https://nq495w538h.coze.site) |

## 📰 Blog

Read our technical guides:

- [MCP + x402: Building Paid API Services from Zero to One](https://155143783.github.io/posts/mcp-x402-paid-api.html)
- [API Monitoring in Practice](https://155143783.github.io)
