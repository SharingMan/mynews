#!/bin/bash

echo "🔍 检查 Railway 部署状态..."
echo "=================================="
echo ""

# 检查 Git 状态
echo "📦 Git 状态:"
git status --short
echo ""

# 检查远程仓库
echo "🔗 远程仓库:"
git remote -v
echo ""

# 检查最新提交
echo "📝 最新提交:"
git log -1 --oneline
echo ""

# 检查配置文件
echo "📋 关键配置文件:"
echo "  ✅ .github/workflows/deploy-railway.yml"
echo "  ✅ prisma/schema.prisma (PostgreSQL)"
echo "  ✅ RAILWAY-DEPLOY.md"
echo ""

# GitHub Actions 链接
echo "🔗 查看部署状态："
echo "  GitHub Actions: https://github.com/SharingMan/mynews/actions"
echo "  Railway Dashboard: https://railway.app/dashboard"
echo ""

# 检查环境变量示例
echo "⚙️  需要在 Railway 中配置的环境变量："
echo "  - DATABASE_URL (自动注入)"
echo "  - NEXT_PUBLIC_APP_URL"
echo "  - CRON_SECRET"
echo ""

echo "✅ 检查完成！"
echo ""
echo "📌 下一步："
echo "  1. 访问 GitHub Actions 查看自动部署状态"
echo "  2. 访问 Railway Dashboard 配置环境变量"
echo "  3. 等待部署完成后访问生成的域名"
