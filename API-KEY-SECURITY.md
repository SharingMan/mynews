# 🔐 API Key 安全配置指南

## ⚠️ 重要安全提示

**请勿在代码中硬编码 API Key！** 所有敏感信息都应通过环境变量配置。

---

## 📋 环境变量配置

### 1. 本地开发环境

在项目根目录创建 `.env.local` 文件（已自动忽略 Git）：

```bash
# DeepSeek AI API Key
DEEPSEEK_API_KEY="your-deepseek-api-key-here"

# Cron Job Secret (用于定时任务认证)
CRON_SECRET="your-secret-key-for-cron"
```

### 2. Railway 生产环境

在 Railway 项目设置中配置环境变量：

#### 方法一：通过 Railway Dashboard
1. 访问 https://railway.app/
2. 进入你的项目
3. 点击 **Variables** 标签
4. 添加以下环境变量：

```
DEEPSEEK_API_KEY = sk-d207a0a28744431385a58715c4003213
CRON_SECRET = your-production-secret-key
```

#### 方法二：通过 Railway CLI
```bash
railway variables set DEEPSEEK_API_KEY=sk-d207a0a28744431385a58715c4003213
railway variables set CRON_SECRET=your-production-secret-key
```

---

## 🔒 API Key 存放位置

### ✅  **正确做法**

1. **本地开发**
   - 存放在 `.env.local` 文件中
   - 该文件被 `.gitignore` 忽略，不会提交到 Git

2. **生产环境**
   - 存放在 Railway 的环境变量中
   - 通过控制面板或 CLI 配置
   - 不暴露在代码或日志中

3. **代码中使用**
   ```typescript
   // ✅ 正确：从环境变量读取
   const API_KEY = process.env.DEEPSEEK_API_KEY || ''
   
   // ❌ 错误：硬编码
   const API_KEY = 'sk-d207a0a28744431385a58715c4003213'
   ```

### ❌ **错误做法（已修复）**

- ~~硬编码在源代码中~~
- ~~提交到 Git 仓库~~
- ~~暴露在公开的日志中~~

---

## 🛡️ 安全最佳实践

### 1. **环境变量命名规范**
- 使用大写字母和下划线
- 以功能模块命名，如 `DEEPSEEK_API_KEY`
- 不要使用通用名称如 `API_KEY`

### 2. **密钥轮换**
建议定期更换 API Key：
- 登录 DeepSeek 控制台
- 生成新的 API Key
- 更新所有环境（本地 + Railway）
- 删除旧的 API Key

### 3. **权限控制**
- 限制 API Key 的访问权限
- 为不同环境使用不同的 Key
- 开发环境和生产环境分离

### 4. **监控使用情况**
- 定期查看 DeepSeek 使用量
- 设置预算提醒
- 发现异常立即撤销 Key

---

## 🔄 从 Git 历史中移除敏感信息

### 如果 API Key 已经被提交到 Git

⚠️ **注意：以下操作会改写 Git 历史，请谨慎操作！**

#### 方法一：使用 BFG Repo-Cleaner（推荐）

```bash
# 1. 安装 BFG
brew install bfg  # macOS
# 或从 https://rtyley.github.io/bfg-repo-cleaner/ 下载

# 2. 创建敏感词列表
echo "sk-d207a0a28744431385a58715c4003213" > passwords.txt

# 3. 清理仓库
bfg --replace-text passwords.txt .git

# 4. 清理 refs 和 GC
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. 强制推送（会覆盖远程历史）
git push --force origin main
```

#### 方法二：使用 git filter-branch

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app/api/daily-summary/route.ts" \
  --prune-empty --tag-name-filter cat -- --all

git push --force origin main
```

---

## 📸 快速检查清单

在提交代码前，请确认：

- [ ] `.env.local` 文件不在 Git 版本控制中
- [ ] `.env.example` 中只有示例值，没有真实 Key
- [ ] 代码中使用 `process.env.XXX` 读取环境变量
- [ ] Railway 环境变量已配置
- [ ] 所有团队成员都知道如何配置本地环境变量

---

## 🆘 如果 API Key 已经泄露

1. **立即撤销旧 Key**
   - 登录 DeepSeek 控制台
   - 删除/禁用泄露的 API Key

2. **生成新 Key**
   - 创建新的 API Key
   - 更新所有环境配置

3. **清理 Git 历史**
   - 使用上述方法从历史中移除

4. **监控账户**
   - 检查是否有异常使用
   - 查看账单是否有异常费用

---

## 📚 相关文档

- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Railway 环境变量](https://docs.railway.app/develop/variables)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## ✅ 当前状态

- [x] API Key 已移到环境变量
- [x] 创建 `.env.local` 文件
- [x] 创建 `.env.example` 示例
- [x] 添加 API Key 验证逻辑
- [x] 准备从 Git 历史中移除（待执行）

**下一步**：在 Railway 控制面板配置环境变量
