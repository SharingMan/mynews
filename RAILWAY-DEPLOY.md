# Railway 部署指南

## 快速部署步骤

### 1. 准备代码

确保以下文件已正确配置：

- `prisma/schema.prisma` - 使用 PostgreSQL
- `railway.json` - Railway 构建配置
- `nixpacks.toml` - 构建命令配置
- `next.config.ts` - output: 'standalone'

### 2. 创建 Railway 项目

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的代码仓库

### 3. 添加 PostgreSQL 数据库

在项目页面：
1. 点击 "New" → "Database" → "Add PostgreSQL"
2. Railway 会自动创建数据库并生成 `DATABASE_URL`

### 4. 配置环境变量

在 Railway 项目 Settings → Variables 中添加：

```bash
# 必需变量（Railway 会自动生成 DATABASE_URL）
NEXT_PUBLIC_APP_URL=https://your-app-url.up.railway.app
CRON_SECRET=your-random-secret-key-here

# 翻译 API（必需）
DEEPSEEK_API_KEY=sk-your-deepseek-api-key

# 可选：新闻 API
NEWSDATA_API_KEY=your-newsdata-api-key
```

### 5. 部署

1. 每次推送代码到 main 分支，Railway 会自动重新部署
2. 或在 Railway Dashboard 点击 "Deploy"

### 6. 验证部署

部署完成后，访问：
- `https://your-app-url.up.railway.app/api/health` - 健康检查
- `https://your-app-url.up.railway.app` - 网站首页

## 数据库迁移

首次部署后，在 Railway 的 Shell 中运行：

```bash
npx prisma migrate deploy
```

## 配置定时任务

在 Railway 项目 Settings → Cron Jobs 中添加：

| 任务 | Cron 表达式 | 端点 |
|------|------------|------|
| 抓取新闻 | `*/30 * * * *` | `/api/cron/fetch?secret=YOUR_CRON_SECRET` |
| 生成日报 | `0 0 * * *` | `/api/daily/generate?secret=YOUR_CRON_SECRET` |

## 常见问题

### 1. 数据库连接失败
确保 `DATABASE_URL` 已正确设置，Railway 会自动生成。

### 2. 构建失败
检查 `railway.json` 和 `nixpacks.toml` 配置是否正确。

### 3. 环境变量不生效
修改环境变量后需要重新部署才能生效。
