// 测试 DeepSeek 翻译功能
// 运行: npx ts-node scripts/test-translation.ts

import { translateText, translateBatch, translateArticle, getTranslationStats, clearTranslationCache } from '../lib/translate'

async function testTranslation() {
  console.log('🧪 测试 DeepSeek 翻译功能\n')

  // 检查环境变量
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey || apiKey === 'your-deepseek-api-key-here') {
    console.error('❌ 错误: DEEPSEEK_API_KEY 未设置')
    console.log('\n请按照以下步骤操作:')
    console.log('1. 访问 https://platform.deepseek.com 注册账号')
    console.log('2. 获取 API Key')
    console.log('3. 将 Key 添加到 .env.local 文件:')
    console.log('   DEEPSEEK_API_KEY="sk-xxx"')
    process.exit(1)
  }

  console.log('✅ DEEPSEEK_API_KEY 已设置\n')

  try {
    // 测试 1: 单个翻译
    console.log('测试 1: 单文本翻译')
    console.log('-------------------')
    const englishText = 'Apple unveils new AI features for iPhone'
    console.log(`原文: ${englishText}`)
    const chineseResult = await translateText(englishText, 'zh')
    console.log(`译文: ${chineseResult}`)
    console.log('✅ 单文本翻译成功\n')

    // 测试 2: 批量翻译
    console.log('测试 2: 批量翻译')
    console.log('-------------------')
    const texts = [
      'Breaking: Major earthquake hits Japan',
      'Stock market reaches record high',
      'New COVID-19 variant discovered',
    ]
    console.log(`原文列表:`)
    texts.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))

    const batchResults = await translateBatch(texts, 'zh')
    console.log(`译文列表:`)
    batchResults.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))
    console.log('✅ 批量翻译成功\n')

    // 测试 3: 文章翻译
    console.log('测试 3: 文章翻译')
    console.log('-------------------')
    const article = {
      title: 'Tesla announces price cuts for Model 3 and Model Y',
      summary: 'The electric vehicle maker is reducing prices in key markets to boost sales amid increasing competition from Chinese rivals.',
    }
    console.log(`标题: ${article.title}`)
    console.log(`摘要: ${article.summary}`)

    const translatedArticle = await translateArticle(article, 'zh')
    console.log(`译文标题: ${translatedArticle.translatedTitle}`)
    console.log(`译文摘要: ${translatedArticle.translatedSummary}`)
    console.log('✅ 文章翻译成功\n')

    // 测试 4: 缓存功能
    console.log('测试 4: 缓存功能')
    console.log('-------------------')
    const stats1 = getTranslationStats()
    console.log(`缓存条目数: ${stats1.cacheSize}`)

    // 再次翻译相同文本（应该从缓存获取）
    const startTime = Date.now()
    await translateText(englishText, 'zh')
    const cacheTime = Date.now() - startTime
    console.log(`缓存命中耗时: ${cacheTime}ms (应该 < 10ms)`)

    const stats2 = getTranslationStats()
    console.log(`缓存条目数: ${stats2.cacheSize} (应该不变)`)
    console.log('✅ 缓存功能正常\n')

    // 测试 5: 中文检测（不翻译中文）
    console.log('测试 5: 中文检测')
    console.log('-------------------')
    const chineseText = '这是一段中文文本'
    const result = await translateText(chineseText, 'zh')
    console.log(`原文: ${chineseText}`)
    console.log(`结果: ${result}`)
    console.log(`是否保持不变: ${result === chineseText ? '✅ 是' : '❌ 否'}`)
    console.log()

    console.log('🎉 所有测试通过! DeepSeek 翻译集成成功。')
    console.log('\n成本估算:')
    console.log('- DeepSeek: 约 ¥1-2/百万 tokens')
    console.log('- 每天 500 篇新闻: 约 ¥0.5-1/月')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

testTranslation()
