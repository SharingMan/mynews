# 🤖 GitHub Actions 自动化指南

## 概述

您的新闻聚合网站现在支持两种在GitHub上自动运行的方式：

1. **🔄 自动新闻抓取** - 每小时自动获取最新新闻
2. **🚀 自动部署** - 代码推送时自动部署到Vercel

## 🤖 新闻抓取工作流

### 工作流配置
文件：`.github/workflows/fetch-news.yml`

### 触发条件
- **⏰ 定时执行**: 每小时自动运行 (`0 * * * *`)
- **🔄 手动触发**: GitHub仓库Actions页面点击"Run workflow"
- **📝 代码更新**: 修改新闻源配置时自动运行

### 功能特点
- 📡 抓取全球10大主流新闻源
- 🏷️ 智能自动分类和去重
- 💾 直接更新GitHub仓库中的数据库
- 📊 自动提交新闻统计信息
- 🎯 每个源最多抓取5篇最新新闻

## 🚀 自动部署工作流

### 工作流配置
文件：`.github/workflows/deploy.yml`

### 功能包括
- **🧪 自动测试**: 依赖检查、构建测试
- **🔍 预览部署**: PR时自动创建预览
- **🌐 生产部署**: main分支推送时自动部署
- **📊 性能监控**: Lighthouse性能检测

## ⚙️ 设置步骤

### 第一步：启用Actions
1. 访问您的GitHub仓库: https://github.com/SharingMan/mynews
2. 点击 "Actions" 标签页
3. 如果看到"Workflows"，说明Actions已启用

### 第二步：配置Secrets (可选 - 用于Vercel集成)
在仓库设置中添加以下Secrets：

1. 点击 "Settings" → "Secrets and variables" → "Actions"
2. 添加以下Repository secrets：

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
DATABASE_URL=file:./dev.db
CRON_SECRET=github-actions-secret
```

### 第三步：手动触发测试
1. 进入 "Actions" 页面
2. 选择 "🤖 自动抓取全球新闻" 工作流
3. 点击 "Run workflow" → "Run workflow"
4. 等待执行完成（约2-3分钟）

## 📊 工作流状态监控

### 查看执行历史
- **Actions页面**: 查看所有工作流运行记录
- **绿色✅**: 执行成功
- **红色❌**: 执行失败，点击查看详细日志

### 执行频率
- **新闻抓取**: 每小时自动执行
- **代码部署**: 每次推送main分支时执行
- **数据更新**: 自动提交到GitHub仓库

## 🎯 实际效果

### 每小时执行后
- 📰 新闻数据库自动更新
- 📊 GitHub仓库显示最新统计
- 🕰️ 提交消息显示抓取时间和数量
- 🌍 您的Vercel网站自动获得最新数据

### 示例提交消息
```
🤖 Auto-update: Fetched latest news

- 📰 当前新闻总数: 456 篇
- ⏰ 抓取时间: 2026-02-08 12:00:00
- 🤖 执行者: GitHub Actions
- 🌍 来源: 全球主流媒体RSS源
```

## 💡 使用建议

### 免费使用
- GitHub Actions免费版每月提供2000分钟
- 每次新闻抓取约用时2-3分钟
- 每小时运行，一个月约用时150分钟，完全够用

### 监控和调试
- 定期查看Actions页面确认正常运行
- 如果某个源经常失败，可以在`lib/news-sources.ts`中禁用
- 通过GitHub提交记录查看数据更新历史

## 🔧 故障排除

### 常见问题
1. **工作流失败**: 检查日志，通常是网络问题或源站限制
2. **数据库错误**: 确保Prisma配置正确
3. **推送失败**: 检查GitHub token权限

### 手动修复
- 访问Actions页面点击"Re-run jobs"重新执行
- 或者本地运行 `npm run scheduler` 手动抓取

---

**🎉 现在您的新闻网站完全自动化了！**
- GitHub Actions自动抓取新闻
- Vercel自动部署更新
- 完全无需手动干预的全球新闻聚合系统！
