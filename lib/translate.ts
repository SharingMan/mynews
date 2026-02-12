// DeepSeek AI 翻译服务
// 使用 DeepSeek Chat API 进行高质量翻译
// API 文档: https://platform.deepseek.com/docs

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 语言代码映射（中文显示名称）
const langNames: Record<string, string> = {
  'zh': '中文',
  'en': '英文',
  'ja': '日文',
  'ko': '韩文',
  'fr': '法文',
  'de': '德文',
  'es': '西班牙文',
  'it': '意大利文',
  'ru': '俄文',
  'pt': '葡萄牙文',
}

// 简单的内存缓存
const translationCache = new Map<string, string>()

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

/**
 * 使用 DeepSeek API 翻译文本
 */
async function translateWithDeepSeek(
  text: string,
  targetLang: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    console.warn('DEEPSEEK_API_KEY not set, returning original text')
    return text
  }

  const targetLangName = langNames[targetLang] || '中文'

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
          content: `You are a professional translator. Translate the following news text to ${targetLangName}.
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
      temperature: 0.3, // 低温度，更确定性的翻译
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
  }

  const data: DeepSeekResponse = await response.json()
  return data.choices[0]?.message?.content?.trim() || text
}

/**
 * 翻译文本
 * @param text 要翻译的文本
 * @param targetLang 目标语言代码 (zh/en/ja/ko/fr/de/es/it/ru/pt)
 * @returns 翻译后的文本
 */
export async function translateText(
  text: string,
  targetLang: string = 'zh'
): Promise<string> {
  // 如果文本为空，直接返回
  if (!text || text.trim().length === 0) {
    return text
  }

  // 如果目标语言是中文且文本已经是中文，直接返回
  if (targetLang === 'zh' && isChinese(text)) {
    return text
  }

  // 检查缓存
  const cacheKey = `${text}:${targetLang}`
  const cached = translationCache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // 调用 DeepSeek API
    const translated = await translateWithDeepSeek(text, targetLang)

    // 存入缓存
    translationCache.set(cacheKey, translated)

    // 限制缓存大小（防止内存溢出）
    if (translationCache.size > 2000) {
      const firstKey = translationCache.keys().next().value
      if (firstKey) {
        translationCache.delete(firstKey)
      }
    }

    return translated
  } catch (error) {
    console.error('Translation error:', error)
    return text // 翻译失败返回原文
  }
}

/**
 * 批量翻译（DeepSeek 不支持原生批量，使用并发控制）
 * @param texts 要翻译的文本数组
 * @param targetLang 目标语言代码
 * @returns 翻译后的文本数组
 */
export async function translateBatch(
  texts: string[],
  targetLang: string = 'zh'
): Promise<string[]> {
  // 过滤空文本和已缓存的
  const results: Array<{ index: number; text: string }> = []
  const toTranslate: Array<{ index: number; text: string }> = []

  texts.forEach((text, index) => {
    if (!text || text.trim().length === 0) {
      results.push({ index, text })
      return
    }

    // 如果目标语言是中文且文本已经是中文
    if (targetLang === 'zh' && isChinese(text)) {
      results.push({ index, text })
      return
    }

    const cacheKey = `${text}:${targetLang}`
    const cached = translationCache.get(cacheKey)
    if (cached) {
      results.push({ index, text: cached })
    } else {
      toTranslate.push({ index, text })
    }
  })

  // 如果没有需要翻译的，直接返回
  if (toTranslate.length === 0) {
    return mergeResults(texts.length, results, [])
  }

  try {
    // 使用 Promise.all 并发翻译，但限制并发数
    const concurrencyLimit = 5
    const translatedTexts: Array<{ index: number; text: string }> = []

    for (let i = 0; i < toTranslate.length; i += concurrencyLimit) {
      const batch = toTranslate.slice(i, i + concurrencyLimit)
      const batchPromises = batch.map(async (item) => {
        const translated = await translateWithDeepSeek(item.text, targetLang)
        return { index: item.index, text: translated }
      })

      const batchResults = await Promise.all(batchPromises)
      translatedTexts.push(...batchResults)

      // 缓存结果
      batchResults.forEach((item, idx) => {
        const originalText = batch[idx].text
        translationCache.set(`${originalText}:${targetLang}`, item.text)
      })

      // 小延迟，避免触发速率限制
      if (i + concurrencyLimit < toTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // 限制缓存大小
    if (translationCache.size > 2000) {
      const keysToDelete = Array.from(translationCache.keys()).slice(0, 500)
      keysToDelete.forEach(key => translationCache.delete(key))
    }

    return mergeResults(texts.length, results, translatedTexts)
  } catch (error) {
    console.error('Batch translation error:', error)
    // 批量失败时，回退到逐个翻译（带错误处理）
    const fallbackResults = await Promise.all(
      toTranslate.map(async (item) => {
        try {
          const translated = await translateText(item.text, targetLang)
          return { index: item.index, text: translated }
        } catch (e) {
          return { index: item.index, text: item.text }
        }
      })
    )
    return mergeResults(texts.length, results, fallbackResults)
  }
}

/**
 * 合并翻译结果
 */
function mergeResults(
  totalLength: number,
  cachedResults: Array<{ index: number; text: string }>,
  newResults: Array<{ index: number; text: string }>
): string[] {
  const merged = new Array(totalLength)
  cachedResults.forEach(item => (merged[item.index] = item.text))
  newResults.forEach(item => (merged[item.index] = item.text))
  return merged
}

/**
 * 检测文本语言
 */
export function detectLanguage(text: string): string {
  if (isChinese(text)) return 'zh'
  if (isJapanese(text)) return 'ja'
  if (isKorean(text)) return 'ko'
  return 'en' // 默认为英文
}

// 辅助函数
function isChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text)
}

function isJapanese(text: string): boolean {
  return /[\u3040-\u309f\u30a0-\u30ff]/.test(text)
}

function isKorean(text: string): boolean {
  return /[\uac00-\ud7af]/.test(text)
}

/**
 * 翻译文章（标题和摘要）
 * 使用批量翻译优化 API 调用次数
 */
export async function translateArticle(article: {
  title: string
  summary?: string
  content?: string
}, targetLang: string = 'zh') {
  const texts = [article.title]
  if (article.summary) {
    texts.push(article.summary)
  }

  const translated = await translateBatch(texts, targetLang)

  return {
    translatedTitle: translated[0],
    translatedSummary: translated[1] || '',
  }
}

/**
 * 获取翻译统计信息
 */
export function getTranslationStats() {
  return {
    cacheSize: translationCache.size,
    cacheLimit: 2000,
  }
}

/**
 * 清空翻译缓存
 */
export function clearTranslationCache() {
  translationCache.clear()
}
