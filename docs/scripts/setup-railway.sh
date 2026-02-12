#!/bin/bash

# Railway 部署准备脚本
# 使用方法: bash scripts/setup-railway.sh

echo "🚂 准备 Railway 部署..."
echo ""

# 检查是否安装了 railway CLI
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI 未安装"
    echo "正在安装..."
    npm install -g @railway/cli
fi

echo "📦 安装依赖..."
npm install

echo ""
echo "🔄 切换到 PostgreSQL 配置..."
cp prisma/schema.postgresql.prisma prisma/schema.prisma

echo ""
echo "🗄️  创建初始迁移..."
npx prisma migrate dev --name init --create-only 2>/dev/null || true

echo ""
echo "🔧 生成 Prisma Client..."
npx prisma generate

echo ""
echo "✅ 准备完成！"
echo ""
echo "下一步操作："
echo ""
echo "1. 登录 Railway:"
echo "   railway login"
echo ""
echo "2. 链接项目:"
echo "   railway link"
echo ""
echo "3. 添加 PostgreSQL 数据库:"
echo "   railway add --database postgres"
echo ""
echo "4. 设置环境变量:"
echo "   railway variables set CRON_SECRET=your-secret-key"
echo "   railway variables set NEXT_PUBLIC_APP_NAME=GlobalNews"
echo ""
echo "5. 部署:"
echo "   railway up"
echo ""
echo "6. 生成域名:"
echo "   railway domain"
echo ""
