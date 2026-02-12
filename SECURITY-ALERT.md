# ⚠️ 紧急安全警告：API Key 已泄露

## 🚨 严重安全问题

你的 **DeepSeek API Key** 已经被提交到 GitHub 公开仓库的历史记录中！

**泄露的 Key**: `sk-d207a0a28744431385a58715c4003213`

**泄露位置**: 
- 提交记录：`f5c42f7` feat: Add AI-powered daily news summary feature
- 文件：`app/api/daily-summary/route.ts`
- GitHub URL: https://github.com/SharingMan/mynews

---

## ⚡ 立即行动（必须在10分钟内完成）

### 第1步：立即撤销泄露的 API Key（最重要！）

1. 访问 DeepSeek 控制台：https://platform.deepseek.com/api_keys
2. **立即删除/禁用** Key: `sk-d207a0a28744431385a58715c4003213`
3. 生成一个新的 API Key
4. 保存新 Key 到安全的地方（密码管理器）

### 第2步：更新本地环境变量

编辑 `.env.local` 文件：
```bash
# 替换为新的 API Key
DEEPSEEK_API_KEY="sk-your-new-key-here"
```

### 第3步：更新 Railway 环境变量

```bash
# 方法1：Railway Dashboard
1. 访问 https://railway.app/project/your-project
2. 进入 Variables 标签
3. 更新 DEEPSEEK_API_KEY 的值为新 Key
4. 保存并重新部署

# 方法2：Railway CLI  
railway variables set DEEPSEEK_API_KEY=sk-your-new-key-here
```

### 第4步：清理 Git 历史（可选但强烈推荐）

⚠️ **该操作会改写 Git 历史，请确保团队成员知晓！**

#### 方案A：使用 BFG Repo-Cleaner（推荐）

```bash
# 安装 BFG
brew install bfg  # macOS
# 或从 https://rtyley.github.io/bfg-repo-cleaner/ 下载

# 创建敏感词列表
echo "sk-d207a0a28744431385a58715c4003213" > ~/passwords.txt

# 克隆镜像仓库
cd ~/Desktop
git clone --mirror https://github.com/SharingMan/mynews.git mynews-mirror
cd mynews-mirror

# 清理所有包含泄露 Key 的提交
bfg --replace-text ~/passwords.txt

# 清理 refs 和垃圾回收
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 强制推送到远程（会覆盖历史）
git push --force

# 返回原仓库并重新克隆
cd ~/Desktop/AI学习/19-news
rm -rf my-app
git clone https://github.com/SharingMan/mynews.git my-app
cd my-app
```

#### 方案B：删除并重建仓库（最彻底）

如果上述方法太复杂，可以：
1. 在 GitHub 上删除整个仓库
2. 创建新的空仓库
3. 推送当前代码（确保已移除 Key）

---

## 💰 检查是否被滥用

### 查看 DeepSeek 使用记录
1. 登录 DeepSeek 控制台
2. 查看 API 调用记录
3. 检查是否有异常的：
   - 调用量激增
   - 来自陌生 IP 的请求
   - 非预期时间的调用

### 检查账单
- 查看是否有异常扣费
- 如果发现异常，立即联系 DeepSeek 客服

---

## 📚 为什么会泄露

1. **硬编码在源代码中**
   - ❌ `const API_KEY = 'sk-xxx'`
   - ✅ `const API_KEY = process.env.API_KEY`

2. **提交到 Git 仓库**
   - 即使后续删除，历史记录仍然保留
   - GitHub 搜索机器人会扫描所有提交

3. **公开仓库**
   - 任何人都可以查看提交历史
   - 自动化工具会扫描密钥

---

## ✅ 预防措施（已实施）

- [x] API Key 移到环境变量
- [x] 创建 `.env.local` 文件（不被 Git 追踪）
- [x] 创建 `.env.example` 模板
- [x] 添加API Key 验证逻辑
- [x] 编写安全文档

**待完成**：
- [ ] 撤销旧 API Key
- [ ] 生成新 API Key
- [ ] 更新所有环境的 Key
- [ ] 清理 Git 历史（可选）

---

## 📱 联系方式

如果遇到问题：
- DeepSeek 文档：https://platform.deepseek.com/docs
- GitHub 安全指南：https://docs.github.com/en/code-security

---

## ⏰ 时间线

- **2026-02-09 20:49**: Key 被提交到 GitHub
- **2026-02-09 20:58**: 发现安全问题
- **2026-02-09 21:00**: 修复代码，移到环境变量
- **待执行**: 撤销旧 Key，生成新 Key

---

**请立即执行第1-3步，不要拖延！**
