/**
 * MCP Data API Server - HTTP/SSE Transport Version
 * For deployment to cloud services like Koyeb, Render, or cloudflared tunnel
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import express from "express";
import { randomUUID } from "crypto";
import { z } from "zod";

// Store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Server Card
const serverCard = {
  name: "DevData MCP",
  description: "MCP Server with 5 data APIs: GitHub trending, NPM stats, HackerNews, Crypto prices, Ethereum gas",
  version: "2.0.0",
  author: "zaizai-agent",
  license: "MIT",
  categories: ["developer-tools", "data-api", "github", "crypto"],
  tools: [
    { name: "github_trending", description: "Get GitHub trending repositories" },
    { name: "npm_stats", description: "Get NPM package download statistics" },
    { name: "hackernews_top", description: "Get Hacker News top stories" },
    { name: "crypto_price", description: "Get cryptocurrency price" },
    { name: "crypto_gas", description: "Get Ethereum gas prices" },
  ]
};

// Create MCP Server with all tools
function createMCPServer(): McpServer {
  const server = new McpServer({
    name: "data-api",
    version: "2.0.0",
  });

  // Tool: github_trending
  server.tool(
    "github_trending",
    "Get GitHub trending repositories",
    {
      language: z.string().optional().describe("Programming language filter"),
      since: z.enum(["daily", "weekly", "monthly"]).optional().default("daily").describe("Time range"),
      limit: z.number().min(1).max(100).optional().default(10).describe("Number of results"),
    },
    async ({ language, since = "daily", limit = 10 }) => {
      try {
        const query = language ? `language:${language}` : "";
        const url = `https://api.github.com/search/repositories?q=${query}+stars:>1&sort=stars&order=desc&per_page=${limit}`;
        const response = await fetch(url, { headers: { "User-Agent": "MCP-Data-API/2.0" } });
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        const data = await response.json();
        const repos = data.items?.slice(0, limit).map((repo: any) => ({
          name: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          url: repo.html_url,
        })) || [];
        return { content: [{ type: "text", text: JSON.stringify({ success: true, data: repos }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
      }
    }
  );

  // Tool: npm_stats
  server.tool(
    "npm_stats",
    "Get NPM package download statistics",
    {
      package: z.string().describe("NPM package name"),
      period: z.enum(["last-day", "last-week", "last-month"]).optional().default("last-week").describe("Time period"),
    },
    async ({ package: packageName, period = "last-week" }) => {
      try {
        const response = await fetch(`https://api.npmjs.org/downloads/point/${period}/${packageName}`);
        if (!response.ok) throw new Error(`NPM API error: ${response.status}`);
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify({ success: true, data: { package: data.package, downloads: data.downloads, period: data.period } }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
      }
    }
  );

  // Tool: hackernews_top
  server.tool(
    "hackernews_top",
    "Get Hacker News top stories",
    { limit: z.number().min(1).max(100).optional().default(10).describe("Number of stories") },
    async ({ limit = 10 }) => {
      try {
        const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
        if (!idsResponse.ok) throw new Error(`HN API error: ${idsResponse.status}`);
        const topIds = await idsResponse.json();
        const stories = await Promise.all(
          topIds.slice(0, limit).map(async (id: number) => {
            const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (!storyResponse.ok) return null;
            return storyResponse.json();
          })
        );
        const filteredStories = stories.filter(Boolean).map((story: any) => ({
          title: story.title,
          url: story.url,
          score: story.score,
          by: story.by,
          time: new Date(story.time * 1000).toISOString(),
          comments: story.descendants || 0,
        }));
        return { content: [{ type: "text", text: JSON.stringify({ success: true, data: filteredStories }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
      }
    }
  );

  // Tool: crypto_price
  server.tool(
    "crypto_price",
    "Get cryptocurrency price from CoinGecko",
    {
      symbol: z.string().describe("Cryptocurrency symbol (e.g., 'bitcoin', 'ethereum')"),
      currency: z.string().optional().default("usd").describe("Fiat currency"),
    },
    async ({ symbol, currency = "usd" }) => {
      try {
        const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
        if (!searchResponse.ok) throw new Error(`CoinGecko error: ${searchResponse.status}`);
        const searchData = await searchResponse.json();
        const coin = searchData.coins?.[0];
        if (!coin) return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Coin not found" }) }], isError: true };
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=${currency}&include_24hr_change=true`);
        if (!priceResponse.ok) throw new Error(`CoinGecko error: ${priceResponse.status}`);
        const priceData = await priceResponse.json();
        const coinData = priceData[coin.id];
        return { content: [{ type: "text", text: JSON.stringify({ success: true, data: { name: coin.name, symbol: coin.symbol?.toUpperCase(), price: coinData?.[currency], change24h: coinData?.[`${currency}_24h_change`]?.toFixed(2) + "%" } }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
      }
    }
  );

  // Tool: crypto_gas
  server.tool(
    "crypto_gas",
    "Get Ethereum gas prices",
    {},
    async () => {
      try {
        const response = await fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken");
        if (!response.ok) throw new Error(`Etherscan error: ${response.status}`);
        const data = await response.json();
        if (data.status !== "1") return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "API rate limited" }) }], isError: true };
        return { content: [{ type: "text", text: JSON.stringify({ success: true, data: { slow: data.result.SafeGasPrice + " Gwei", standard: data.result.ProposeGasPrice + " Gwei", fast: data.result.FastGasPrice + " Gwei" } }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
      }
    }
  );

  return server;
}

// HTTP Server
async function main() {
  const port = parseInt(process.env.PORT || "3000");
  
  // Create Express app with MCP middleware
  const app = createMcpExpressApp({ host: '0.0.0.0' });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: "ok", server: "mcp-data-api", version: "2.0.0" });
  });

  // Server card endpoint
  app.get('/server-card.json', (req, res) => {
    res.json(serverCard);
  });
  
  // Also serve at .well-known path
  app.get('/.well-known/mcp/server-card.json', (req, res) => {
    res.json(serverCard);
  });

  // MCP POST endpoint
  app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    try {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId as string]) {
        // Reuse existing transport
        transport = transports[sessionId as string];
      } else if (!sessionId && req.body?.method === "initialize") {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableDnsRebindingProtection: false,
          onsessioninitialized: (sid: string) => {
            console.log(`Session initialized: ${sid}`);
            transports[sid] = transport;
            transport.onclose = () => {
              console.log(`Session closed: ${sid}`);
              delete transports[sid];
            };
          }
        });
        
        // Create a new server and connect to transport
        const server = createMCPServer();
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Bad Request' }, id: null });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
      }
    }
  });

  // MCP GET endpoint for SSE streams
  app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId as string]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    const transport = transports[sessionId as string];
    await transport.handleRequest(req, res);
  });

  // MCP DELETE endpoint
  app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId as string]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    const transport = transports[sessionId as string];
    await transport.handleRequest(req, res);
  });

  // Start server
  app.listen(port, "0.0.0.0", () => {
    console.log(`MCP Data API Server v2.0 running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Server card: http://localhost:${port}/server-card.json`);
    console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
