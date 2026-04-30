# MCP Data API Server 部署指南

## 快速开始

### 1. 本地运行

```bash
cd ./变现研究/mcp-servers/data-api
npm install
npm run dev
```

### 2. 构建

```bash
npm run build
npm start
```

---

## Smithery 上架指南

Smithery 支持通过URL方式发布MCP服务器。

### 前置条件
- MCP服务器需要托管在公开的HTTPS URL上
- 支持Streamable HTTP transport

### 发布步骤

1. **访问 Smithery 发布页面**
   - 打开 https://smithery.ai/new
   
2. **输入服务器URL**
   - 格式: `https://your-server.com/mcp`
   - 例如部署到Apify后: `https://your-username--data-api-mcp-server.apify.actor/sse`

3. **完成发布流程**
   - 服务器会被自动扫描
   - 配置schema会被提取

### 使用CLI发布

```bash
# 安装CLI
npm install -g @smithery/cli

# 发布
smithery mcp publish "https://your-mcp-server.com/mcp" -n @your-org/data-api
```

### 静态Server Card

如果自动扫描失败，可以使用静态server card。在服务器上提供以下端点:

```
GET /.well-known/mcp/server-card.json
```

我们的server-card.json已准备好，位于: `./变现研究/mcp-servers/data-api/server-card.json`

---

## Apify 部署指南

### 前置条件
- Apify账号
- Apify CLI: `npm install -g apify-cli`
- 登录: `apify login`

### 部署步骤

```bash
# 1. 进入项目目录
cd ./变现研究/mcp-servers/data-api

# 2. 登录Apify
apify login

# 3. 推送Actor
apify push

# 4. 在Apify Console中启用Standby模式
#    - 访问 Actor Settings
#    - 启用 Standby mode
#    - 设置 idle timeout (建议 300秒)

# 5. 获取MCP URL
#    格式: https://your-username--data-api-mcp-server.apify.actor/sse
```

### 变现配置

我们的pay_per_event.json已配置:
- 事件: tool-request
- 价格: $0.01/次

在Apify Console的Monetization选项卡中可以修改定价。

### MCP客户端配置示例

```json
{
  "mcpServers": {
    "data-api": {
      "transport": "sse",
      "url": "https://your-username--data-api-mcp-server.apify.actor/sse",
      "headers": {
        "Authorization": "Bearer YOUR_APIFY_API_TOKEN"
      }
    }
  }
}
```

---

## MCP 官方注册中心

### Fork 仓库

1. 访问 https://github.com/modelcontextprotocol/registry
2. Fork 仓库
3. 在 `servers/` 目录下添加服务器配置

### 配置文件格式

参考 `./变现研究/mcp-servers/data-api/mcp-registry-listing.md`

---

## mcp.so 提交

1. 访问 https://mcp.so
2. 注册账号
3. 提交服务器信息

---

## Glama 提交

1. 访问 https://glama.ai
2. 注册账号
3. 添加MCP服务器

---

## 部署后操作清单

- [ ] 注册Smithery账号
- [ ] 在Smithery发布服务器
- [ ] 注册Apify账号 (zaizai-agent@coze.email)
- [ ] 使用Apify CLI部署
- [ ] 在Apify Console启用Standby模式
- [ ] Fork并提交PR到MCP官方注册中心
- [ ] 在mcp.so提交服务器
- [ ] 在Glama提交服务器
