#!/usr/bin/env node

const cron = require('node-cron');
const fetch = require('node-fetch').default || require('node-fetch');

const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

// 日志记录
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// 新闻抓取任务
async function fetchNews() {
  try {
    log('🚀 开始抓取新闻...');

    const headers = {
      'Content-Type': 'application/json',
    };

    // 开发环境不需要authorization header
    if (process.env.NODE_ENV !== 'development' && CRON_SECRET) {
      headers['authorization'] = `Bearer ${CRON_SECRET}`;
    }

    const response = await fetch(`${NEXT_APP_URL}/api/cron/fetch`, {
      method: 'GET',
      headers,
      timeout: 60000, // 60秒超时
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      log(`✅ 抓取成功: 总计 ${result.total} 篇，新增 ${result.new} 篇`);

      if (result.errors && result.errors.length > 0) {
        log(`⚠️  部分新闻源失败: ${result.errors.length} 个`);
        result.errors.forEach(error => {
          log(`   - ${error}`, 'WARN');
        });
      }
    } else {
      log('❌ 抓取失败: ' + JSON.stringify(result), 'ERROR');
    }

  } catch (error) {
    log(`❌ 抓取异常: ${error.message}`, 'ERROR');

    // 如果是连接错误，可能是Next.js应用未启动
    if (error.code === 'ECONNREFUSED') {
      log('💡 请确保Next.js应用正在运行 (npm run dev)', 'WARN');
    }
  }
}

// 启动定时任务
// 获取配置
const FETCH_INTERVAL = process.env.FETCH_INTERVAL_MINUTES || 30; // 默认30分钟
const MAX_RETRIES = 60; // 最大重试次数 (60 * 5s = 5分钟)

// 启动定时任务
async function startScheduler() {
  log('🕐 新闻定时抓取器启动');
  log(`📡 目标地址: ${NEXT_APP_URL}`);
  log(`⏰ 执行频率: 每 ${FETCH_INTERVAL} 分钟`);

  // 等待服务启动
  let retries = 0;
  while (retries < MAX_RETRIES) {
    const isReady = await checkDependencies();
    if (isReady) break;

    retries++;
    log(`⏳ 等待服务启动 (${retries}/${MAX_RETRIES})...`, 'WARN');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  if (retries >= MAX_RETRIES) {
    log('❌ 服务启动超时，定时任务未能启动', 'ERROR');
    return;
  }

  // 构建 Cron 表达式
  // 注意：如果是 60 分钟，cron 表达式需要特殊处理，这里简单处理 */N
  const cronExpression = `0 */${FETCH_INTERVAL} * * * *`;

  const task = cron.schedule(cronExpression, async () => {
    await fetchNews();
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai"
  });

  log(`✅ 定时任务已启动 (Schedule: ${cronExpression})`);
  log('💡 按 Ctrl+C 停止定时任务');

  // 立即执行一次
  log('🔄 立即执行首次抓取...');
  fetchNews();

  // 优雅退出
  const cleanup = () => {
    log('🛑 正在停止定时任务...');
    task.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

// 检查必要的依赖
async function checkDependencies() {
  try {
    // 检查Next.js应用是否运行
    const response = await fetch(`${NEXT_APP_URL}/api/health`, {
      timeout: 5000,
    });

    // 如果 /api/health 不存在，尝试 /api/articles
    if (response.status === 404) {
      const articleRes = await fetch(`${NEXT_APP_URL}/api/articles?limit=1`, { timeout: 5000 });
      return articleRes.ok;
    }

    return response.ok;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  log('🌐 全球新闻定时抓取器 v1.1');
  log('='.repeat(50));

  await startScheduler();
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('启动失败:', error);
    process.exit(1);
  });
}

module.exports = { fetchNews, startScheduler };
