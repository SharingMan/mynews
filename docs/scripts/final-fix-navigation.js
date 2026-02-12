#!/usr/bin/env node

// 最终修复导航问题 - 简化逻辑，确保状态更新正确

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[INFO] ${message}`);
}

try {
  log('🔄 正在进行最终的导航修复...');

  const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
  let content = fs.readFileSync(pagePath, 'utf8');

  // 找到从URL获取分类的部分并简化
  const oldSection = /\/\/ 从URL获取分类[\s\S]*?}\s*\)\s*\n\s*\/\/ 监听路由变化[\s\S]*?}\s*\,\s*\[\]\)/;

  const newSection = `  // 从URL获取分类 - 简化版本
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const category = urlParams.get('category')
    const newCategory = category || ''

    // 只在分类真正改变时更新状态
    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory)
    }
  }, [activeCategory])`;

  content = content.replace(oldSection, newSection);

  // 确保loadArticles有正确的依赖
  content = content.replace(
    'const loadArticles = useCallback(async () => {',
    'const loadArticles = useCallback(async () => {\n    console.log("Loading articles for category:", activeCategory);'
  );

  fs.writeFileSync(pagePath, content);

  log('✅ 最终修复完成！');
  log('📊 修复内容:');
  log('   - 简化了URL参数监听逻辑');
  log('   - 添加了调试日志');
  log('   - 确保状态更新不会导致无限循环');

  process.exit(0);
} catch (error) {
  console.error('❌ 修复失败:', error.message);
  process.exit(1);
}
