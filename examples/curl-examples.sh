#!/bin/bash
# MCP Data API - cURL Examples
MCP_SERVER="https://compliant-milton-hybrid-hoped.trycloudflare.com"

echo "=== MCP Data API cURL Examples ==="

echo -e "\n1. GitHub Trending:"
curl -s -X POST "$MCP_SERVER/mcp" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"github_trending","arguments":{"language":"python","since":"daily"}}}' | head -c 300

echo -e "\n\n2. NPM Stats:"
curl -s -X POST "$MCP_SERVER/mcp" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"npm_stats","arguments":{"packageName":"express"}}}' | head -c 300

echo -e "\n\n3. HackerNews Top:"
curl -s -X POST "$MCP_SERVER/mcp" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"hackernews_top","arguments":{"limit":5}}}' | head -c 300

echo -e "\n\n4. Crypto Price:"
curl -s -X POST "$MCP_SERVER/mcp" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"crypto_price","arguments":{"symbol":"ETH"}}}' | head -c 300

echo -e "\n\n5. Gas Tracker:"
curl -s -X POST "$MCP_SERVER/mcp" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"gas_tracker","arguments":{}}}' | head -c 300

echo -e "\n\n=== End ==="
