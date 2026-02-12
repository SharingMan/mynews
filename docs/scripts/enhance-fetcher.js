#!/usr/bin/env node

// 临时修复脚本：更新抓取器以获取更多最新新闻

const fs = require('fs');
const path = require('path');

const fetcherPath = path.join(__dirname, '..', 'lib', 'fetcher.ts');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在优化新闻抓取策略...');

  let content = fs.readFileSync(fetcherPath, 'utf8');

  // 1. 增加RSS项目数量：从20增加到35
  content = content.replace(
    'for (const item of feed.items.slice(0, 20))',
    'for (const item of feed.items.slice(0, 35))'
  );

  // 2. 扩展时间窗口：从24小时增加到48小时
  content = content.replace(
    'const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)',
    'const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)'
  );

  content = content.replace(
    'if (publishedAt < oneDayAgo) continue',
    'if (publishedAt < twoDaysAgo) continue'
  );

  // 3. 增加摘要长度：从200增加到350
  content = content.replace(
    'function extractSummary(text: string, maxLength: number = 200)',
    'function extractSummary(text: string, maxLength: number = 350)'
  );

  // 4. 增强分类算法
  const newAutoCategoryFunction = `export function autoCategory(title: string, content: string, defaultCategory: string): string {
  const text = (title + ' ' + content).toLowerCase()

  const scores: Record<string, number> = {}

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi')
      const matches = text.match(regex)
      if (matches) {
        // 标题中匹配的权重更高
        const titleMatches = title.toLowerCase().match(regex)
        scores[category] += matches.length + (titleMatches ? titleMatches.length * 2 : 0)
      }
    }
  }

  // 找到得分最高的分类，需要达到最低阈值
  let bestCategory = defaultCategory
  let maxScore = 2 // 最低阈值，避免误分类

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }

  return bestCategory
}`;

  // 替换现有的autoCategory函数
  content = content.replace(
    /export function autoCategory[\s\S]*?return maxScore > 0 \? bestCategory : defaultCategory\n}/,
    newAutoCategoryFunction
  );

  fs.writeFileSync(fetcherPath, content);

  log('✅ 抓取策略优化完成！');
  log('📊 改进内容:');
  log('   - RSS项目数量: 20 → 35');
  log('   - 时间窗口: 24小时 → 48小时');
  log('   - 摘要长度: 200 → 350字符');
  log('   - 分类算法: 增强准确性');

  process.exit(0);
} catch (error) {
  console.error('❌ 优化失败:', error.message);
  process.exit(1);
}
