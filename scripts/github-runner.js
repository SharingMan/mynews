#!/usr/bin/env node

// GitHub Actions 新闻抓取脚本 - 简化版本，适用于CI环境

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 新闻源配置 - 简化版本，确保在GitHub Actions中正常运行
const simpleSources = [
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'tech',
    language: 'en',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/business/news.rss',
    category: 'finance',
    language: 'en',
  },
  {
    id: 'bbc-world',
    name: 'BBC World',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'overseas',
    language: 'en',
  },
  {
    id: '36kr',
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: 'china',
    language: 'zh',
  },
];

// 简化的RSS解析器
const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GlobalNewsBot/1.0; +https://github.com/SharingMan/mynews)',
  },
});

// 生成哈希
function generateHash(title, url) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(title + url).digest('hex');
}

// 清理HTML
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 提取摘要
function extractSummary(text, maxLength = 300) {
  const cleanText = stripHtml(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
}

// 简化的分类函数
function simpleCategory(title, content, defaultCategory) {
  const text = (title + ' ' + content).toLowerCase();

  const keywords = {
    tech: ['ai', 'tech', 'apple', 'google', 'microsoft', 'software', 'startup', '科技', '人工智能'],
    finance: ['market', 'stock', 'trade', 'economy', 'banking', '股票', '金融', '经济', '银行'],
    china: ['china', 'chinese', 'beijing', '中国', '北京', '上海', '深圳'],
    overseas: ['world', 'international', 'global', '海外', '国际', '全球'],
    sports: ['sports', 'football', 'basketball', '体育', '足球', '篮球'],
    politics: ['politics', 'government', 'election', '政治', '政府', '选举'],
  };

  let bestCategory = defaultCategory;
  let maxScore = 0;

  for (const [category, keywordList] of Object.entries(keywords)) {
    let score = 0;
    for (const keyword of keywordList) {
      if (text.includes(keyword)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// 抓取单个RSS源
async function fetchSource(source) {
  try {
    console.log(`📡 抓取 ${source.name}...`);

    const feed = await parser.parseURL(source.url);
    const articles = [];

    for (const item of feed.items.slice(0, 8)) { // 每个源最多8篇
      if (!item.title || !item.link) continue;

      const title = stripHtml(item.title);
      const content = item['content:encoded'] || item.content || item.summary || '';
      const summary = extractSummary(content);

      let publishedAt = new Date();
      if (item.pubDate || item.isoDate) {
        const date = new Date(item.pubDate || item.isoDate);
        if (!isNaN(date.getTime())) publishedAt = date;
      }

      // 只保留48小时内的新闻
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      if (publishedAt < twoDaysAgo) continue;

      const hash = generateHash(title, item.link);
      const category = simpleCategory(title, content, source.category);

      articles.push({
        title,
        summary,
        content: stripHtml(content),
        originalUrl: item.link,
        category,
        sourceId: source.id,
        sourceName: source.name,
        originalLanguage: source.language,
        publishedAt,
        hash,
        viewCount: 0,
        isFeatured: false,
        isDailySelected: false,
      });
    }

    console.log(`✅ ${source.name}: 抓取到 ${articles.length} 篇新闻`);
    return articles;

  } catch (error) {
    console.error(`❌ ${source.name}: ${error.message}`);
    return [];
  }
}

// 主函数
async function main() {
  console.log('🌐 GitHub Actions 新闻抓取器');
  console.log('='.repeat(40));

  let totalNew = 0;
  let totalFetched = 0;

  try {
    // 确保新闻源存在
    for (const source of simpleSources) {
      await prisma.newsSource.upsert({
        where: { id: source.id },
        update: { lastFetched: new Date(), fetchCount: { increment: 1 } },
        create: {
          id: source.id,
          name: source.name,
          url: source.url,
          type: 'rss',
          category: source.category,
          language: source.language,
          isActive: true,
          fetchCount: 1,
          errorCount: 0,
        },
      });
    }

    // 抓取新闻
    for (const source of simpleSources) {
      const articles = await fetchSource(source);
      totalFetched += articles.length;

      // 保存到数据库
      for (const article of articles) {
        try {
          const existing = await prisma.article.findUnique({
            where: { hash: article.hash },
          });

          if (!existing) {
            await prisma.article.create({ data: article });
            totalNew++;
          }
        } catch (error) {
          console.error(`保存失败: ${error.message}`);
        }
      }
    }

    // 统计结果
    const totalArticles = await prisma.article.count();

    console.log('');
    console.log('📊 抓取结果:');
    console.log(`   🔍 总抓取: ${totalFetched} 篇`);
    console.log(`   ✨ 新增: ${totalNew} 篇`);
    console.log(`   📰 数据库总计: ${totalArticles} 篇`);
    console.log('');

    // 更新README徽章数据
    const badgeData = {
      articles: totalArticles,
      lastUpdate: new Date().toISOString().split('T')[0],
    };

    const fs = require('fs');
    const badgeFile = 'data/stats.json';
    fs.mkdirSync('data', { recursive: true });
    fs.writeFileSync(badgeFile, JSON.stringify(badgeData, null, 2));

    console.log('✅ GitHub Actions 执行完成!');

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
