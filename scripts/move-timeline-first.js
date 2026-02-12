#!/usr/bin/env node

// 将时间轴移到导航栏最前面

const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在移动时间轴到导航栏最前面...');

  let content = fs.readFileSync(pagePath, 'utf8');

  // 找到当前的导航结构并替换
  const oldNav = `                    <span className="text-xs">
                      <Link href="/?category=tech" className="hn-navlink mr-1">科技</Link>
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
                      <Link href="/?category=entertainment" className="hn-navlink mx-1">娱乐</Link>
                      <span className="text-black">|</span>
                      <Link href="/daily" className="hn-navlink mx-1">日报</Link>
                      <span className="text-black">|</span>
                      <Link href="/timeline" className="hn-navlink mx-1">时间轴</Link>
                    </span>`;

  const newNav = `                    <span className="text-xs">
                      <Link href="/timeline" className="hn-navlink mr-1">时间轴</Link>
                      <span className="text-black">|</span>
                      <Link href="/?category=tech" className="hn-navlink mx-1">科技</Link>
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
                      <Link href="/?category=entertainment" className="hn-navlink mx-1">娱乐</Link>
                      <span className="text-black">|</span>
                      <Link href="/daily" className="hn-navlink mx-1">日报</Link>
                    </span>`;

  if (content.includes(oldNav)) {
    content = content.replace(oldNav, newNav);
    fs.writeFileSync(pagePath, content);
    log('✅ 时间轴已移动到导航栏最前面！');
    log('📊 新的导航栏顺序: 时间轴 | 科技 | 财经 | 中国 | 海外 | 体育 | 政治 | 娱乐 | 日报');
  } else {
    log('⚠️ 未找到匹配的导航结构，请检查代码');
  }

  process.exit(0);
} catch (error) {
  console.error('❌ 移动失败:', error.message);
  process.exit(1);
}
