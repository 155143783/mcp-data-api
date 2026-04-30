import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create MCP Server instance
const server = new McpServer({
  name: "data-api",
  version: "1.0.0",
});

// Tool: github_trending - Get GitHub trending repositories
server.tool(
  "github_trending",
  "Get GitHub trending repositories",
  {
    language: z.string().optional().describe("Programming language filter (e.g., 'typescript', 'python')"),
    since: z.enum(["daily", "weekly", "monthly"]).optional().describe("Time range: daily, weekly, or monthly"),
    limit: z.number().min(1).max(100).optional().default(10).describe("Number of results to return"),
  },
  async ({ language, since = "daily", limit = 10 }) => {
    try {
      const url = `https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=${limit}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "MCP-Data-API/1.0" }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      const repos = data.items?.slice(0, limit).map((repo: any) => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
      })) || [];
      
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, data: repos }, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
        isError: true,
      };
    }
  }
);

// Tool: npm_stats - Get NPM package download statistics
server.tool(
  "npm_stats",
  "Get NPM package download statistics",
  {
    package: z.string().describe("NPM package name (e.g., 'lodash', 'express')"),
    period: z.enum(["last-day", "last-week", "last-month"]).optional().default("last-week").describe("Time period"),
  },
  async ({ package: packageName, period = "last-week" }) => {
    try {
      const response = await fetch(
        `https://api.npmjs.org/downloads/point/${period}/${packageName}`
      );
      
      if (!response.ok) {
        throw new Error(`NPM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              package: data.package,
              downloads: data.downloads,
              period: data.period,
              start: data.start,
              end: data.end,
            }
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
        isError: true,
      };
    }
  }
);

// Tool: hackernews_top - Get Hacker News top stories
server.tool(
  "hackernews_top",
  "Get Hacker News top stories",
  {
    limit: z.number().min(1).max(100).optional().default(10).describe("Number of stories to return"),
  },
  async ({ limit = 10 }) => {
    try {
      // First get top story IDs
      const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
      if (!idsResponse.ok) {
        throw new Error(`Hacker News API error: ${idsResponse.status}`);
      }
      const topIds = await idsResponse.json();
      const storyIds = topIds.slice(0, limit);
      
      // Fetch story details
      const stories = await Promise.all(
        storyIds.map(async (id: number) => {
          const storyResponse = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
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
      
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, data: filteredStories }, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
        isError: true,
      };
    }
  }
);

// Tool: crypto_price - Get cryptocurrency price
server.tool(
  "crypto_price",
  "Get cryptocurrency price from CoinGecko",
  {
    symbol: z.string().describe("Cryptocurrency symbol (e.g., 'bitcoin', 'ethereum')"),
    currency: z.string().optional().default("usd").describe("Fiat currency (usd, eur, jpy, etc.)"),
  },
  async ({ symbol, currency = "usd" }) => {
    try {
      // CoinGecko API - search by coin ID
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${symbol}`
      );
      
      if (!searchResponse.ok) {
        throw new Error(`CoinGecko search API error: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      const coin = searchData.coins?.[0];
      
      if (!coin) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: "Coin not found" }) }],
          isError: true,
        };
      }
      
      // Get price data
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!priceResponse.ok) {
        throw new Error(`CoinGecko price API error: ${priceResponse.status}`);
      }
      
      const priceData = await priceResponse.json();
      const coinData = priceData[coin.id];
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              name: coin.name,
              symbol: coin.symbol?.toUpperCase(),
              price: coinData?.[currency],
              change24h: coinData?.[`${currency}_24h_change`]?.toFixed(2) + "%",
              marketCap: coinData?.[`${currency}_market_cap`],
              image: coin.thumb,
            }
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
        isError: true,
      };
    }
  }
);

// Tool: crypto_gas - Get Ethereum gas prices
server.tool(
  "crypto_gas",
  "Get Ethereum gas prices",
  {},
  async () => {
    try {
      const response = await fetch(
        "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken"
      );
      
      if (!response.ok) {
        throw new Error(`Etherscan API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== "1") {
        // Fallback to alternative API
        const fallbackResponse = await fetch(
          "https://gas-estimate.ioApi.info/gasnow"
        );
        if (fallbackResponse.ok) {
          const gasNow = await fallbackResponse.json();
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: true,
                data: {
                  source: "GasNow",
                  slow: {
                    gasPrice: gasNow.data?.standard / 1e9,
                    estimatedSeconds: "300+",
                  },
                  standard: {
                    gasPrice: gasNow.data?.fast / 1e9,
                    estimatedSeconds: "60-120",
                  },
                  fast: {
                    gasPrice: gasNow.data?.fastest / 1e9,
                    estimatedSeconds: "<30",
                  },
                }
              }, null, 2),
            }],
          };
        }
        throw new Error("Both APIs failed");
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            data: {
              source: "Etherscan",
              slow: {
                gasPrice: data.result.SafeGasPrice + " Gwei",
                estimatedSeconds: "300+",
              },
              standard: {
                gasPrice: data.result.ProposeGasPrice + " Gwei",
                estimatedSeconds: "60-120",
              },
              fast: {
                gasPrice: data.result.FastGasPrice + " Gwei",
                estimatedSeconds: "<30",
              },
            }
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
        isError: true,
      };
    }
  }
);

// Tool: github_search - Search GitHub repositories by keyword
server.tool(
  "github_search",
  "Search GitHub repositories by keyword, topic, or description",
  {
    query: z.string().describe("Search query (e.g., 'machine learning framework', 'react ui library')"),
    sort: z.enum(["stars", "forks", "updated"]).optional().default("stars").describe("Sort by: stars, forks, or updated"),
    limit: z.number().min(1).max(30).optional().default(10).describe("Number of results"),
  },
  async ({ query, sort = "stars", limit = 10 }) => {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${limit}`;
      const response = await fetch(url, { headers: { "User-Agent": "MCP-Data-API/1.0" } });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      const repos = data.items?.slice(0, limit).map((repo: any) => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
      })) || [];
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, total: data.total_count, data: repos }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: github_user - Get GitHub user profile
server.tool(
  "github_user",
  "Get GitHub user profile information including bio, repos, and followers",
  {
    username: z.string().describe("GitHub username"),
  },
  async ({ username }) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: { "User-Agent": "MCP-Data-API/1.0" }
      });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const user = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            username: user.login,
            name: user.name,
            bio: user.bio,
            company: user.company,
            location: user.location,
            blog: user.blog,
            twitter: user.twitter_username,
            publicRepos: user.public_repos,
            followers: user.followers,
            following: user.following,
            createdAt: user.created_at,
            avatarUrl: user.avatar_url,
          }
        }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: github_repo - Get detailed repository information
server.tool(
  "github_repo",
  "Get detailed GitHub repository information including stats, languages, and recent activity",
  {
    owner: z.string().describe("Repository owner (username or org)"),
    repo: z.string().describe("Repository name"),
  },
  async ({ owner, repo }) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { "User-Agent": "MCP-Data-API/1.0" }
      });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const r = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            name: r.full_name,
            description: r.description,
            stars: r.stargazers_count,
            forks: r.forks_count,
            openIssues: r.open_issues_count,
            language: r.language,
            license: r.license?.spdx_id,
            defaultBranch: r.default_branch,
            topics: r.topics || [],
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            pushedAt: r.pushed_at,
            homepage: r.homepage,
            isArchived: r.archived,
            isFork: r.fork,
          }
        }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: npm_package - Get detailed NPM package information
server.tool(
  "npm_package",
  "Get detailed NPM package information including version, license, dependencies, and description",
  {
    package: z.string().describe("NPM package name (e.g., 'react', 'express')"),
  },
  async ({ package: packageName }) => {
    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      if (!response.ok) throw new Error(`NPM registry error: ${response.status}`);
      const data = await response.json();
      const latest = data["dist-tags"]?.latest;
      const latestVersion = data.versions?.[latest];
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            name: data.name,
            description: data.description,
            latestVersion: latest,
            license: latestVersion?.license || data.license,
            homepage: data.homepage || latestVersion?.homepage,
            repository: data.repository?.url || latestVersion?.repository?.url,
            dependencies: latestVersion?.dependencies ? Object.keys(latestVersion.dependencies) : [],
            devDependencies: latestVersion?.devDependencies ? Object.keys(latestVersion.devDependencies).length : 0,
            keywords: data.keywords || [],
            created: data.time?.created,
            modified: data.time?.modified,
            maintainers: data.maintainers?.map((m: any) => m.name) || [],
          }
        }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: devto_articles - Get Dev.to trending articles
server.tool(
  "devto_articles",
  "Get trending articles from Dev.to",
  {
    tag: z.string().optional().describe("Filter by tag (e.g., 'javascript', 'react', 'ai')"),
    limit: z.number().min(1).max(30).optional().default(10).describe("Number of articles"),
  },
  async ({ tag, limit = 10 }) => {
    try {
      const params = new URLSearchParams({ per_page: String(limit), state: "rising" });
      if (tag) params.set("tag", tag);
      const response = await fetch(`https://dev.to/api/articles?${params}`);
      if (!response.ok) throw new Error(`Dev.to API error: ${response.status}`);
      const articles = await response.json();
      const data = articles.map((a: any) => ({
        title: a.title,
        url: a.url,
        author: a.user?.name,
        tagList: a.tag_list,
        reactions: a.positive_reactions_count,
        comments: a.comments_count,
        readingTime: a.reading_time + " min",
        publishedAt: a.published_at,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, data }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: url_to_markdown - Convert any URL to clean markdown
server.tool(
  "url_to_markdown",
  "Convert any webpage URL to clean markdown text using Jina Reader API",
  {
    url: z.string().describe("The URL to convert to markdown"),
  },
  async ({ url }) => {
    try {
      const response = await fetch(`https://r.jina.ai/${url}`, {
        headers: { "Accept": "text/markdown" }
      });
      if (!response.ok) throw new Error(`Jina Reader error: ${response.status}`);
      const markdown = await response.text();
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, url, markdown: markdown.slice(0, 10000) }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: ip_lookup - IP address geolocation
server.tool(
  "ip_lookup",
  "Get geolocation and network information for an IP address",
  {
    ip: z.string().describe("IP address to look up (e.g., '8.8.8.8')"),
  },
  async ({ ip }) => {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      if (!response.ok) throw new Error(`IP API error: ${response.status}`);
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            ip: data.query,
            country: data.country,
            region: data.regionName,
            city: data.city,
            lat: data.lat,
            lon: data.lon,
            isp: data.isp,
            org: data.org,
            timezone: data.timezone,
          }
        }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: dns_lookup - DNS record lookup
server.tool(
  "dns_lookup",
  "Look up DNS records for a domain (A, AAAA, MX, TXT, CNAME, NS)",
  {
    domain: z.string().describe("Domain name to look up (e.g., 'example.com')"),
    recordType: z.enum(["A", "AAAA", "MX", "TXT", "CNAME", "NS"]).optional().default("A").describe("DNS record type"),
  },
  async ({ domain, recordType = "A" }) => {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${recordType}`);
      if (!response.ok) throw new Error(`DNS API error: ${response.status}`);
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            domain,
            recordType,
            records: data.Answer?.map((a: any) => ({
              name: a.name,
              type: a.type,
              ttl: a.TTL,
              data: a.data,
            })) || [],
            status: data.Status === 0 ? "NOERROR" : `ERROR(${data.Status})`,
          }
        }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: website_status - Check if a website is up and get response info
server.tool(
  "website_status",
  "Check if a website is up, get HTTP status code, response time, and basic info",
  {
    url: z.string().describe("Website URL to check (e.g., 'https://example.com')"),
  },
  async ({ url }) => {
    try {
      const start = Date.now();
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
      });
      const responseTime = Date.now() - start;
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            url,
            isUp: response.ok,
            statusCode: response.status,
            statusText: response.statusText,
            responseTime: `${responseTime}ms`,
            headers: Object.fromEntries(
              ["server", "content-type", "x-powered-by", "cache-control"]
                .filter(h => response.headers.get(h))
                .map(h => [h, response.headers.get(h)])
            ),
          }
        }, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: { url, isUp: false, error: String(error) }
        }, null, 2) }],
      };
    }
  }
);

// Tool: wikipedia_search - Search Wikipedia articles
server.tool(
  "wikipedia_search",
  "Search Wikipedia articles and get summaries",
  {
    query: z.string().describe("Search query"),
    limit: z.number().min(1).max(10).optional().default(5).describe("Number of results"),
  },
  async ({ query, limit = 5 }) => {
    try {
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`
      );
      if (!searchResponse.ok) throw new Error(`Wikipedia API error: ${searchResponse.status}`);
      const searchData = await searchResponse.json();
      const results = searchData.query?.search?.map((r: any) => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]*>/g, ""),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, "_"))}`,
        wordCount: r.wordcount,
      })) || [];
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, data: results }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Tool: weather - Get current weather for a location
server.tool(
  "weather",
  "Get current weather conditions for any city or location",
  {
    location: z.string().describe("City name or location (e.g., 'Beijing', 'New York', 'Tokyo')"),
  },
  async ({ location }) => {
    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();
      const current = data.current_condition?.[0];
      return {
        content: [{ type: "text", text: JSON.stringify({
          success: true,
          data: {
            location: data.nearest_area?.[0]?.areaName?.[0]?.value || location,
            country: data.nearest_area?.[0]?.country?.[0]?.value,
            temperature: current?.temp_C + "°C / " + current?.temp_F + "°F",
            feelsLike: current?.FeelsLikeC + "°C",
            humidity: current?.humidity + "%",
            description: current?.weatherDesc?.[0]?.value,
            windSpeed: current?.windspeedKmph + " km/h",
            windDir: current?.winddir16Point,
            visibility: current?.visibility + " km",
            pressure: current?.pressure + " hPa",
            uvIndex: current?.uvIndex,
          }
        }, null, 2) }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }], isError: true };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Data API Server v2.0 started - 15 tools available");
}

main().catch(console.error);
