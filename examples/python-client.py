#!/usr/bin/env python3
"""
MCP Data API - Python Client Example
Access 16 developer data tools via MCP protocol with x402 micro-payment support
"""

import requests
import json

# MCP Server endpoint (use cloudflared URL for public access)
MCP_SERVER_URL = "https://compliant-milton-hybrid-hoped.trycloudflare.com"

def call_mcp_tool(tool_name: str, arguments: dict = None):
    """Call an MCP tool by name with arguments"""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments or {}
        }
    }
    
    response = requests.post(
        f"{MCP_SERVER_URL}/mcp",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    return response.json()

def main():
    print("=== MCP Data API Python Examples ===\n")
    
    # Example 1: GitHub Trending
    print("1. GitHub Trending (Python)")
    result = call_mcp_tool("github_trending", {"language": "python", "since": "daily"})
    print(json.dumps(result, indent=2)[:500])
    print()
    
    # Example 2: NPM Stats
    print("2. NPM Package Stats")
    result = call_mcp_tool("npm_stats", {"packageName": "express"})
    print(json.dumps(result, indent=2)[:500])
    print()
    
    # Example 3: HackerNews Top
    print("3. HackerNews Top Stories")
    result = call_mcp_tool("hackernews_top", {"limit": 5})
    print(json.dumps(result, indent=2)[:500])
    print()
    
    # Example 4: Crypto Price
    print("4. Crypto Price")
    result = call_mcp_tool("crypto_price", {"symbol": "ETH"})
    print(json.dumps(result, indent=2)[:500])

if __name__ == "__main__":
    main()
