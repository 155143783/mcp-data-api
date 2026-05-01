#!/usr/bin/env node
/**
 * MCP Data API - Node.js Client Example
 */

const https = require('https');
const MCP_SERVER_URL = 'https://compliant-milton-hybrid-hoped.trycloudflare.com';

async function callMcpTool(toolName, args = {}) {
    const payload = {
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: toolName, arguments: args }
    };
    return new Promise((resolve, reject) => {
        const url = new URL(`${MCP_SERVER_URL}/mcp`);
        const options = {
            hostname: url.hostname, port: 443, path: url.pathname,
            method: 'POST', headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}

async function main() {
    console.log('=== MCP Data API Node.js Examples ===\n');
    const r1 = await callMcpTool('github_trending', { language: 'javascript', since: 'weekly' });
    console.log('1. GitHub Trending:', JSON.stringify(r1).slice(0, 300));
    const r2 = await callMcpTool('npm_stats', { packageName: 'react' });
    console.log('2. NPM Stats:', JSON.stringify(r2).slice(0, 300));
    const r3 = await callMcpTool('hackernews_top', { limit: 5 });
    console.log('3. HN Top:', JSON.stringify(r3).slice(0, 300));
    const r4 = await callMcpTool('crypto_price', { symbol: 'BTC' });
    console.log('4. BTC Price:', JSON.stringify(r4).slice(0, 300));
}

main().catch(console.error);
