# 📰 AI 每日新闻总结功能

## 🎯 功能概述

新增了基于 **DeepSeek AI** 的每日新闻智能总结功能，自动分析过去24小时的新闻并生成简洁的总结和亮点。

---

## ✨ 主要特性

### 1. **智能总结生成**
- 使用 DeepSeek AI (`deepseek-chat` 模型) 分析新闻
- 自动总结当日全球新闻趋势和要点
- 提取 3-5 个最重要的新闻亮点
- 支持多领域新闻分类（科技、财经、政治、体育等）

### 2. **自动化定时任务**
- 每天早上 **8:00** (北京时间) 自动生成总结
- GitHub Actions 定时触发
- 生成后缓存结果，避免重复调用 AI

### 3. **优雅的UI设计**
- 在每日日报页面 (`/daily`) 顶部显示总结
- 渐变橙色背景 + AI标识
- 编号亮点列表，清晰易读
- 响应式设计，适配各种屏幕

### 4. **性能优化**
- **数据库缓存**：每日只需调用一次AI
- **降级方案**：AI调用失败时使用基本统计总结
- **异步加载**：不阻塞页面其他内容

---

## 🔧 技术实现

### API 端点

#### `/api/daily-summary`
生成每日新闻总结的主要 API。

**响应格式：**
```json
{
  "summary": "今日共收录 50 条全球新闻，覆盖 8 个领域...",
  "highlights": [
    "【科技】OpenAI 发布新模型，性能提升显著",
    "【财经】美联储宣布维持利率不变",
    "【政治】G7峰会达成重要共识"
  ],
  "totalArticles": 50,
  "date": "2026/2/9",
  "cached": true
}
```

**工作流程：**
1. 检查今日是否已有缓存总结
2. 如有缓存，直接返回
3. 如无缓存，获取过去24小时的新闻
4. 调用 DeepSeek AI 生成总结
5. 保存到数据库缓存
6. 返回结果

#### `/api/cron/generate-daily-summary`
定时任务调用的端点，每天早上8点触发。

**认证：**
需要在请求 Header 中提供密钥：
```
Authorization: Bearer <CRON_SECRET>
```

---

## ⚙️ DeepSeek AI 配置

### API 密钥
```typescript
const DEEPSEEK_API_KEY = 'sk-d207a0a28744431385a58715c4003213'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
```

### AI 提示词
```
你是一位专业的新闻编辑。请根据以下今日新闻列表，生成一份简洁的每日新闻总结。

【总结】
用2-3句话概括今日全球新闻的整体情况和主要趋势。

【亮点】
- 列出3-5个最重要的新闻亮点
- 每个亮点一行，以"- "开头
- 包含分类标签和简短描述
```

### AI 参数
```typescript
{
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 800
}
```

---

## 🤖 GitHub Actions 自动化

### 工作流文件
`.github/workflows/generate-daily-summary.yml`

### 执行时间
- **Cron 表达式**：`0 0 * * *`
- **含义**：每天 UTC 0:00 = 北京时间 8:00

### 手动触发
可以在 GitHub Actions 页面手动触发生成总结。

---

## 📱 前端集成

### 页面位置
`/daily` - 每日日报页面

### 显示逻辑
```tsx
{dailySummary && (
  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full">
        <span className="text-white font-bold text-lg">AI</span>
      </div>
      <div>
        <h3>今日要闻速览</h3>
        <p>由 DeepSeek AI 智能生成</p>
      </div>
    </div>
    
    {/* 总结文本 */}
    <div className="mb-4 p-4 bg-white/60 rounded-lg">
      <p>{dailySummary.summary}</p>
    </div>

    {/* 亮点列表 */}
    {dailySummary.highlights.map((highlight, idx) => (
      <div key={idx}>
        <span>{idx + 1}</span>
        <p>{highlight}</p>
      </div>
    ))}
  </div>
)}
```

---

## 💾 数据库缓存

### 表结构
使用 `dailyNews` 表存储每日总结：

```prisma
model DailyNews {
  id      String   @id @default(cuid())
  date    DateTime @unique
  summary String
  title   String
  // highlights 存储在 summary JSON 或单独字段
}
```

### 缓存策略
- **键**：当天日期 (00:00:00)
- **生存期**：直到第二天
- **更新**：每日早上8点更新

---

## 🚀 使用指南

### 1. 查看每日总结
访问：`https://mynews-production-52a2.up.railway.app/daily`

### 2. 手动生成总结
调用 API：
```bash
curl https://mynews-production-52a2.up.railway.app/api/daily-summary
```

### 3. 触发定时任务（需要密钥）
```bash
curl -H "Authorization: Bearer <your-secret>" \
  https://mynews-production-52a2.up.railway.app/api/cron/generate-daily-summary
```

---

## 📊 性能指标

- **AI 调用时间**：通常 3-8 秒
- **缓存命中**：第二次及后续访问 < 100ms
- **降级响应**：AI 失败时使用基本统计（即时返回）
- **每日调用次数**：1次（早上8点）

---

## 🔍 降级方案

当 DeepSeek API 调用失败时，系统自动使用基本总结生成器：

```typescript
function generateBasicSummary(articles) {
  // 统计分类
  // 提取热门分类
  // 生成简单总结文本
  // 返回前5条新闻作为亮点
}
```

---

## 🎨 UI 预览

### 总结区域
- 渐变橙色背景
- AI 圆形标识
- 白色半透明卡片
- 编号亮点列表

### 显示位置
在统计信息栏下方，新闻分类列表上方。

---

## 📝 待优化事项

1. **多语言支持**：为英文新闻提供英文总结
2. **情感分析**：添加情感标签（正面/负面/中性）
3. **趋势预测**：基于历史数据预测新闻趋势
4. **个性化**：根据用户偏好定制总结内容
5. **语音播报**：为总结添加语音朗读功能

---

## 🛠️ 故障排查

### 问题1：总结不显示
- 检查 API 是否返回数据
- 查看浏览器控制台是否有错误
- 确认数据库中是否有缓存数据

### 问题2：AI 调用失败
- 检查 DeepSeek API 密钥是否有效
- 查看网络连接是否正常
- 确认 API 配额是否充足

### 问题3：定时任务未执行
- 查看 GitHub Actions 日志
- 确认 Cron 表达式配置正确
- 检查 Railway 服务是否正常运行

---

## 📚 相关文档

- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [GitHub Actions Cron 语法](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Railway 部署指南](https://docs.railway.app/)

---

## ✅ 部署清单

- [x] 创建 `/api/daily-summary` API 端点
- [x] 集成 DeepSeek AI
- [x] 添加数据库缓存逻辑
- [x] 创建前端UI组件
- [x] 配置 GitHub Actions 定时任务
- [x] 创建定时任务触发端点
- [x] 推送代码到 GitHub
- [x] 等待 Railway 自动部署

---

**部署地址**：https://mynews-production-52a2.up.railway.app/daily

**每日总结生成时间**：每天早上 8:00 (北京时间)

**AI 提供商**：DeepSeek

**最后更新**：2026-02-09
