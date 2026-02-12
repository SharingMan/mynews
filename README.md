# GlobalNews - 全球实时新闻聚合日报网站

基于 Next.js + TypeScript + Prisma + Tailwind CSS 构建的全球新闻聚合平台。

## 功能特性

- 📰 **实时新闻聚合** - 自动抓取全球主流新闻源，每5分钟更新
- 🏷️ **智能分类** - 10大新闻分类（科技、财经、政治、体育、娱乐、健康、教育、环境、国际、国内）
- 🔍 **全文搜索** - 支持按关键词、分类、时间范围搜索
- 📧 **日报订阅** - 每日自动生成精选日报，邮件推送
- 🌐 **多语言支持** - 中英双语，自动翻译
- 📱 **响应式设计** - 完美适配 Desktop、Tablet、Mobile

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: SQLite + Prisma ORM
- **部署**: 支持 Vercel / 自有服务器

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npx prisma migrate dev
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 抓取新闻数据

开发环境直接访问：
```bash
curl http://localhost:3000/api/cron/fetch
```

生产环境需要设置 `CRON_SECRET` 环境变量：
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/fetch
```

### 5. 生成日报

```bash
curl http://localhost:3000/api/daily/generate
```

## 项目结构

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── articles/      # 新闻列表、搜索
│   │   ├── cron/fetch     # 新闻抓取任务
│   │   ├── daily/generate # 日报生成
│   │   └── subscribe      # 邮件订阅
│   ├── article/[id]/      # 新闻详情页
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── news-card.tsx      # 新闻卡片
│   ├── category-nav.tsx   # 分类导航
│   ├── search-bar.tsx     # 搜索框
│   └── daily-newsletter.tsx # 日报订阅
├── lib/                   # 工具函数
│   ├── prisma.ts          # Prisma 客户端
│   ├── fetcher.ts         # 新闻抓取器
│   └── news-sources.ts    # 新闻源配置
├── prisma/
│   └── schema.prisma      # 数据库模型
└── types/                 # TypeScript 类型
```

## 新闻源配置

新闻源配置在 `lib/news-sources.ts` 中：

```typescript
export const newsSources = [
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss',
    category: 'tech',
    language: 'en',
  },
  // ... 更多源
]
```

## 环境变量

```env
# Database
DATABASE_URL="file:./dev.db"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GlobalNews

# Cron Secret (用于保护定时任务接口)
CRON_SECRET=your-cron-secret-key

# Email (可选 - 用于日报邮件推送)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@globalnews.com
```

## 定时任务设置

### 使用 Vercel Cron (推荐)

创建 `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/daily/generate",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 使用系统 Cron

```bash
# 每5分钟抓取新闻
*/5 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/fetch

# 每天0点生成日报
0 0 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/daily/generate
```

## 生产部署

### 部署到 Vercel

```bash
npm i -g vercel
vercel --prod
```

### 部署到自有服务器

```bash
npm run build
npm start
```

## 开发计划

- [x] 基础架构搭建
- [x] 新闻抓取引擎
- [x] 分类系统
- [x] 前端展示
- [x] 日报生成
- [x] 邮件订阅
- [ ] 多语言翻译 (集成翻译API)
- [ ] 用户系统
- [ ] 收藏功能
- [ ] 更多新闻源

## 许可证

MIT
