#!/usr/bin/env node

// 更新UI界面：更新导航栏分类

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在更新UI界面...');

  // 更新主页导航
  const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
  let pageContent = fs.readFileSync(pagePath, 'utf8');

  // 替换导航链接
  pageContent = pageContent.replace(
    'href="/?category=international"',
    'href="/?category=overseas"'
  );
  pageContent = pageContent.replace(
    'href="/?category=domestic"',
    'href="/?category=china"'
  );
  pageContent = pageContent.replace(
    'className="hn-navlink mx-1">国际</Link>',
    'className="hn-navlink mx-1">海外</Link>'
  );
  pageContent = pageContent.replace(
    'className="hn-navlink mx-1">国内</Link>',
    'className="hn-navlink mx-1">中国</Link>'
  );

  // 重新排列导航顺序：科技|财经|中国|海外|体育|政治|娱乐
  const oldNav = `                      <Link href="/?category=tech" className="hn-navlink mr-1">科技</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=finance" className="hn-navlink mx-1">财经</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=overseas" className="hn-navlink mx-1">海外</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=sports" className="hn-navlink mx-1">体育</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=politics" className="hn-navlink mx-1">政治</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=entertainment" className="hn-navlink mx-1">娱乐</Link>`;

  const newNav = `                      <Link href="/?category=tech" className="hn-navlink mr-1">科技</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=finance" className="hn-navlink mx-1">财经</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=china" className="hn-navlink mx-1">中国</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=overseas" className="hn-navlink mx-1">海外</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=sports" className="hn-navlink mx-1">体育</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=politics" className="hn-navlink mx-1">政治</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=entertainment" className="hn-navlink mx-1">娱乐</Link>`;

  if (pageContent.includes(oldNav)) {
    pageContent = pageContent.replace(oldNav, newNav);
  }

  // 更新分类名称映射
  pageContent = pageContent.replace(
    "international: '国际',",
    "overseas: '海外',"
  );
  pageContent = pageContent.replace(
    "domestic: '国内',",
    "china: '中国',"
  );

  // 更新分类颜色映射
  pageContent = pageContent.replace(
    "international: '#8b5cf6',",
    "overseas: '#2563eb',"
  );
  pageContent = pageContent.replace(
    "domestic: '#06b6d4',",
    "china: '#dc2626',"
  );

  fs.writeFileSync(pagePath, pageContent);

  log('✅ UI界面更新完成！');
  log('📊 导航栏顺序: 科技 | 财经 | 中国 | 海外 | 体育 | 政治 | 娱乐');

  process.exit(0);
} catch (error) {
  console.error('❌ UI更新失败:', error.message);
  process.exit(1);
}
