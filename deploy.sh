#!/bin/bash
# MCP Data API Server - 快速部署脚本

set -e

echo "======================================"
echo "MCP Data API Server 部署脚本"
echo "======================================"
echo ""

# 检查node版本
if ! command -v node &> /dev/null; then
    echo "错误: 需要安装 Node.js"
    exit 1
fi

echo "Node.js 版本: $(node --version)"
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 安装依赖
echo "步骤1: 安装依赖..."
npm install

# 构建项目
echo ""
echo "步骤2: 构建项目..."
npm run build

echo ""
echo "======================================"
echo "本地构建完成!"
echo "======================================"
echo ""
echo "下一步操作:"
echo ""
echo "1. 本地测试:"
echo "   npm run dev"
echo ""
echo "2. Apify 部署:"
echo "   - 安装 Apify CLI: npm install -g apify-cli"
echo "   - 登录: apify login"
echo "   - 推送: apify push"
echo ""
echo "3. Smithery 发布:"
echo "   - 访问 https://smithery.ai/new"
echo "   - 输入你的MCP服务器URL"
echo ""
echo "4. MCP官方注册中心:"
echo "   - Fork https://github.com/modelcontextprotocol/registry"
echo "   - 添加服务器配置并提交PR"
echo ""
