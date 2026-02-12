// 测试 DeepSeek 翻译功能 (JavaScript 版本)
// 运行: node scripts/test-translation.js

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

async function translateWithDeepSeek(text, targetLang = '中文') {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not set');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following news text to ${targetLang}.
Rules:
1. Keep it concise and natural for news reading
2. Preserve the original meaning accurately
3. Return ONLY the translation, no explanations, no quotes
4. For titles: make it catchy but accurate
5. For summaries: keep it within 2-3 sentences`
        },
        { role: 'user', content: text }
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || text;
}

async function testTranslation() {
  console.log('🧪 测试 DeepSeek 翻译功能\n');

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'your-deepseek-api-key-here') {
    console.error('❌ 错误: DEEPSEEK_API_KEY 未设置');
    console.log('\n请检查 .env.local 文件是否包含有效的 DEEPSEEK_API_KEY');
    process.exit(1);
  }

  console.log('✅ DEEPSEEK_API_KEY 已设置\n');

  try {
    // 测试 1: 单文本翻译
    console.log('测试 1: 单文本翻译');
    console.log('-------------------');
    const englishText = 'Apple unveils new AI features for iPhone';
    console.log(`原文: ${englishText}`);
    const chineseResult = await translateWithDeepSeek(englishText, '中文');
    console.log(`译文: ${chineseResult}`);
    console.log('✅ 单文本翻译成功\n');

    // 测试 2: 文章翻译
    console.log('测试 2: 新闻文章翻译');
    console.log('-------------------');
    const title = 'Tesla announces price cuts for Model 3 and Model Y';
    const summary = 'The electric vehicle maker is reducing prices in key markets to boost sales amid increasing competition from Chinese rivals.';

    console.log(`标题: ${title}`);
    console.log(`摘要: ${summary}\n`);

    const [translatedTitle, translatedSummary] = await Promise.all([
      translateWithDeepSeek(title, '中文'),
      translateWithDeepSeek(summary, '中文')
    ]);

    console.log(`译文标题: ${translatedTitle}`);
    console.log(`译文摘要: ${translatedSummary}`);
    console.log('✅ 文章翻译成功\n');

    console.log('🎉 所有测试通过! DeepSeek 翻译正常工作。');
    console.log('\n成本估算:');
    console.log('- DeepSeek: 约 ¥1-2/百万 tokens');
    console.log('- 每天 500 篇新闻: 约 ¥0.5-1/月');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

testTranslation();
