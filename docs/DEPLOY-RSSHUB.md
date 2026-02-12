# 🚀 部署私有 RSSHub 指南

由于公共的 RSSHub 实例 (`rsshub.app`) 对云服务器 IP 有严格的反爬限制，导致我们在 Railway 上无法直接抓取金十数据、晚点等新闻源。

**解决方案是部署一个你自己的 RSSHub 实例。这完全免费，且非常简单。**

## 步骤 1: 一键部署到 Railway

点击下方的按钮，将 RSSHub 部署到你的 Railway 账号中：

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/rsshub)

1.  点击按钮后，登录你的 Railway 账号。
2.  Review 设置（通常保持默认即可）。
3.  点击 **Deploy**。

## 步骤 2: 获取你的 RSSHub 域名

1.  等待部署完成（约 1-2 分钟）。
2.  点击新创建的 RSSHub 项目。
3.  进入 **Settings** -> **Networking**。
4.  你会看到一个分配的域名，例如：
    `rsshub-production-xxxx.up.railway.app`
    或者 `xxxx.railway.app`。

## 步骤 3: 更新新闻源配置

拿到域名后，回到本项目。

### 方法 A: 使用脚本自动更新

在终端运行以下命令（将 `YOUR_DOMAIN` 替换为你的实际域名）：

```bash
# 例如: npm run update-rsshub -- https://rsshub-production-xxxx.up.railway.app
node scripts/update-rsshub-domain.js https://你的域名.up.railway.app
```

### 方法 B: 手动修改

打开 `lib/news-sources.ts`，查找所有 `https://rsshub.app`，替换为你的域名 `https://你的域名.up.railway.app`。

## 步骤 4: 验证

更新后，运行测试脚本验证连接：

```bash
npx tsx scripts/test-feeds.ts
```

如果看到所有源都显示 `✅ [OK]`，恭喜你，你的新闻聚合引擎已经火力全开了！
