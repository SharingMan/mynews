#!/usr/bin/env node

// 更新分类系统：添加中国和海外分类

const fs = require('fs');
const path = require('path');

const newsSourcesPath = path.join(__dirname, '..', 'lib', 'news-sources.ts');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在更新分类系统...');

  let content = fs.readFileSync(newsSourcesPath, 'utf8');

  // 1. 更新分类映射
  const oldCategoryLabels = `// 分类映射
export const categoryLabels: Record<string, { zh: string; en: string; color: string }> = {
  tech: { zh: '科技', en: 'Technology', color: 'bg-blue-500' },
  finance: { zh: '财经', en: 'Finance', color: 'bg-green-500' },
  politics: { zh: '政治', en: 'Politics', color: 'bg-red-500' },
  sports: { zh: '体育', en: 'Sports', color: 'bg-orange-500' },
  entertainment: { zh: '娱乐', en: 'Entertainment', color: 'bg-pink-500' },
  health: { zh: '健康', en: 'Health', color: 'bg-teal-500' },
  education: { zh: '教育', en: 'Education', color: 'bg-indigo-500' },
  environment: { zh: '环境', en: 'Environment', color: 'bg-emerald-500' },
  international: { zh: '国际', en: 'International', color: 'bg-purple-500' },
  domestic: { zh: '国内', en: 'Domestic', color: 'bg-cyan-500' },
}`;

  const newCategoryLabels = `// 分类映射
export const categoryLabels: Record<string, { zh: string; en: string; color: string }> = {
  tech: { zh: '科技', en: 'Technology', color: 'bg-blue-500' },
  finance: { zh: '财经', en: 'Finance', color: 'bg-green-500' },
  politics: { zh: '政治', en: 'Politics', color: 'bg-red-500' },
  sports: { zh: '体育', en: 'Sports', color: 'bg-orange-500' },
  entertainment: { zh: '娱乐', en: 'Entertainment', color: 'bg-pink-500' },
  health: { zh: '健康', en: 'Health', color: 'bg-teal-500' },
  education: { zh: '教育', en: 'Education', color: 'bg-indigo-500' },
  environment: { zh: '环境', en: 'Environment', color: 'bg-emerald-500' },
  china: { zh: '中国', en: 'China', color: 'bg-red-600' },
  overseas: { zh: '海外', en: 'Overseas', color: 'bg-blue-600' },
}`;

  content = content.replace(oldCategoryLabels, newCategoryLabels);

  // 2. 更新分类关键词
  content = content.replace(
    `  international: ['国际', '外交', '国外', '海外', 'world', 'international', 'global', 'foreign', 'diplomacy', 'nation', 'country', 'border', 'immigration', 'europe', 'asia', 'africa', 'middle east'],
  domestic: ['国内', '中国', '北京', '上海', 'china', 'domestic', 'national', 'local', 'province', 'city', 'regional'],`,
    `  china: ['中国', '中华', '大陆', '内地', '国内', '北京', '上海', '深圳', '广州', '杭州', '南京', '天津', '重庆', '成都', '武汉', '西安', '人民币', '央行', 'china', 'chinese', 'beijing', 'shanghai', 'shenzhen', 'guangzhou', 'mainland', 'prc'],
  overseas: ['海外', '国外', '外国', '国际', '全球', '世界', '欧洲', '美国', '日本', '韩国', '东南亚', '中东', '非洲', '拉美', 'overseas', 'international', 'global', 'world', 'foreign', 'europe', 'america', 'usa', 'japan', 'korea', 'southeast asia', 'middle east', 'africa', 'latin america'],`
  );

  // 3. 更新新闻源分类
  content = content.replace(/category: 'international'/g, "category: 'overseas'");
  content = content.replace(/category: 'domestic'/g, "category: 'china'");

  // 4. 更新分类图标映射
  content = content.replace(
    `  international: Globe,
  domestic: Home,`,
    `  china: Home,
  overseas: Globe,`
  );

  fs.writeFileSync(newsSourcesPath, content);

  log('✅ 分类系统更新完成！');
  log('📊 新的分类:');
  log('   - 中国 (原国内)');
  log('   - 海外 (原国际)');
  log('   - 保留其他分类: 科技、财经、政治、体育、娱乐、健康、教育、环境');

  process.exit(0);
} catch (error) {
  console.error('❌ 更新失败:', error.message);
  process.exit(1);
}
