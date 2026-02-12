#!/usr/bin/env node

// 简单修复导航问题 - 移除依赖数组让useEffect每次都运行

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在修复分类导航...');

  const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
  let content = fs.readFileSync(pagePath, 'utf8');

  // 简单修复：移除useEffect的依赖数组，让它每次都检查URL
  content = content.replace(
    /\/\/ 从URL获取分类[\s\S]*?}, \[\]\)/,
    `// 从URL获取分类 - 每次都检查URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const category = urlParams.get('category')
    const newCategory = category || ''
    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory)
    }
  })`
  );

  fs.writeFileSync(pagePath, content);

  log('✅ 导航修复完成！现在分类链接应该能正常工作了。');

  process.exit(0);
} catch (error) {
  console.error('❌ 修复失败:', error.message);
  process.exit(1);
}
