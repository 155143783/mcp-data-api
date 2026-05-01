# MCP Data API - Examples

## Available Examples

| File | Language | Description |
|------|----------|-------------|
| `python-client.py` | Python | Using requests library |
| `node-client.js` | Node.js | Using built-in https module |
| `curl-examples.sh` | Shell | Ready-to-use cURL commands |

## Available Tools

- `github_trending` - GitHub trending repos
- `npm_stats` - NPM package stats
- `hackernews_top` - HackerNews stories
- `crypto_price` - Crypto prices
- `gas_tracker` - Base gas prices
- `ip_info` - IP information
- `domain_info` - DNS records
- `ai_model_pricing` - AI model pricing

## Usage

```bash
python3 examples/python-client.py
node examples/node-client.js
bash examples/curl-examples.sh
```

## MCP Protocol

```json
POST /mcp
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"tool_name","arguments":{}}}
```
