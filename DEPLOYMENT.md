# 📚 完整部署指南

## 🚀 Vercel 部署步骤

### 第一步：访问 Vercel
1. 打开浏览器，访问 [https://vercel.com](https://vercel.com)
2. 点击右上角 "Sign Up" 或 "Login"
3. 选择 "Continue with GitHub" 使用GitHub账号登录

### 第二步：创建新项目
1. 登录后点击 "New Project" 按钮
2. 在项目列表中找到 `SharingMan/mynews`
3. 点击 "Import" 按钮

### 第三步：配置项目设置
- **Project Name**: `mynews` (可以修改为您喜欢的名字)
- **Framework Preset**: Next.js (自动检测，无需修改)
- **Root Directory**: `./` (保持默认)

### 第四步：设置环境变量 (重要！)
在 "Environment Variables" 部分添加以下变量：

```
NEXT_PUBLIC_APP_NAME=GlobalNews
DATABASE_URL=file:./dev.db
CRON_SECRET=mynews-secret-key-2026
```

可选环境变量：
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
```

### 第五步：部署
1. 确认所有设置正确
2. 点击 "Deploy" 按钮
3. 等待构建完成（约2-3分钟）

### 第六步：配置域名
部署完成后会获得：
- 自动分配的域名：`https://mynews-xxxx.vercel.app`
- 可以绑定自定义域名

### 第七步：测试功能
1. 访问首页确认界面正常
2. 测试各个分类链接
3. 查看时间轴功能
4. 手动触发新闻抓取：`https://your-app.vercel.app/api/cron/fetch`

## 🔧 故障排除

### 问题1：数据库相关错误
- 确保 `DATABASE_URL=file:./dev.db` 已设置
- Prisma会自动创建SQLite数据库

### 问题2：新闻抓取失败
- 检查 `CRON_SECRET` 环境变量是否设置
- 手动访问API端点测试

### 问题3：构建失败
- 检查 Node.js 版本是否兼容
- 确认所有依赖已正确安装

## 🌟 一键部署链接

如果手动部署有问题，可以使用一键部署：
[https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSharingMan%2Fmynews](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSharingMan%2Fmynews)
