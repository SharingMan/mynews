# 🚀 在GitHub上部署新闻聚合网站

由于Vercel部署遇到问题，我们提供了多个在GitHub生态系统中的部署方案。

## 🎯 推荐部署方案

### 方案一：Railway (推荐) 🚂
**优势**: 免费额度充足，支持数据库，部署简单

#### 部署步骤：
1. **访问Railway**: https://railway.app
2. **GitHub登录**: 使用GitHub账号注册登录
3. **新建项目**:
   - 点击 "Deploy from GitHub repo"
   - 选择 `SharingMan/mynews` 仓库
4. **自动配置**: Railway自动检测Next.js项目
5. **设置环境变量**:
   ```
   DATABASE_URL=file:./dev.db
   CRON_SECRET=railway-secret-2026
   NEXT_PUBLIC_APP_NAME=GlobalNews
   ```
6. **部署完成**: 获得 `https://your-app.railway.app` 访问地址

### 方案二：Render 🌐
**优势**: 免费SSL，全球CDN，自动从GitHub部署

#### 部署步骤：
1. **访问Render**: https://render.com
2. **GitHub登录**: 连接GitHub账号
3. **新建Web Service**:
   - 选择 `SharingMan/mynews` 仓库
   - 服务类型: Web Service
   - 构建命令: `npm run build`
   - 启动命令: `npm start`
4. **环境变量配置**:
   ```
   DATABASE_URL=file:./dev.db
   CRON_SECRET=render-secret-2026
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   ```
5. **部署完成**: 获得 `.onrender.com` 域名

### 方案三：GitHub Actions + GitHub Pages (静态版) 📄
**优势**: 完全免费，GitHub官方支持

#### 配置步骤：
1. **启用GitHub Pages**:
   - 仓库设置 → Pages
   - Source: "GitHub Actions"

2. **自动部署**: 已配置好的Actions会：
   - 每小时抓取新闻
   - 生成静态页面
   - 自动推送到 `gh-pages` 分支
   - 访问地址: `https://sharingman.github.io/mynews`

## ⚡ 立即部署 (推荐Railway)

### 🚂 Railway一键部署
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/8xVfPr?referralCode=github)

### 📋 详细步骤:

1. **点击Deploy按钮** → 自动打开Railway
2. **GitHub授权** → 允许Railway访问仓库
3. **配置项目** → 自动检测Next.js设置
4. **环境变量** → 设置以下变量:
   ```bash
   DATABASE_URL=file:./dev.db
   CRON_SECRET=railway-secret-key-2026
   NEXT_PUBLIC_APP_NAME=GlobalNews
   ```
5. **Deploy** → 等待构建完成(约3-5分钟)
6. **访问网站** → 获得 railway.app 域名

### 🎊 部署后功能

#### ✅ **完整功能**:
- **🏠 主页**: Hacker News风格新闻列表
- **🔍 分类**: 时间轴|科技|财经|中国|海外|体育|政治|娱乐|日报|更新
- **⏰ 自动更新**: GitHub Actions每小时抓取新闻
- **📱 手动更新**: `/update` 页面随时手动刷新

#### 🤖 **自动化流程**:
- **每小时**: GitHub Actions抓取新闻 → 推送仓库
- **检测更新**: Railway检测仓库变化 → 自动重新部署
- **更新网站**: 用户看到最新新闻

### 💡 **为什么选择Railway?**

| 特性 | Railway | Vercel | GitHub Pages |
|------|---------|---------|-------------|
| 免费额度 | $5/月免费 | 限制多 | 完全免费 |
| 数据库支持 | ✅ | ❌ | ❌ |
| 服务端功能 | ✅ | ✅ | ❌ |
| 自动部署 | ✅ | ✅ | ✅ |
| 定时任务 | ✅ | 限制 | 通过Actions |

### 🔧 **部署后设置**

部署完成后：
1. **测试网站** - 确认所有功能正常
2. **启用Actions** - GitHub会自动开始每小时抓取
3. **绑定域名** - (可选) 在Railway中绑定自定义域名
4. **监控运行** - 通过GitHub Actions页面监控

---

**🎯 推荐立即使用Railway部署！** 简单快捷，功能完整，而且完全免费！🚀

需要我详细指导任何一个部署平台的具体操作吗？