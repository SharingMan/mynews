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
function startScheduler() {
  log('🕐 新闻定时抓取器启动');
  log(`📡 目标地址: ${NEXT_APP_URL}`);
  log('⏰ 执行频率: 每10分钟');

  // 每10分钟执行一次: 0 */10 * * * *
  // 格式: 秒 分 时 日 月 周
  const task = cron.schedule('0 */10 * * * *', async () => {
    await fetchNews();
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai"
  });

  log('✅ 定时任务已启动');
  log('💡 按 Ctrl+C 停止定时任务');

  // 立即执行一次
  log('🔄 立即执行首次抓取...');
  fetchNews();

  // 优雅退出
  process.on('SIGINT', () => {
    log('🛑 接收到停止信号，正在关闭定时任务...');
    task.stop();
    log('👋 定时任务已停止');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('🛑 接收到终止信号，正在关闭定时任务...');
    task.stop();
    log('👋 定时任务已停止');
    process.exit(0);
  });
}

// 检查必要的依赖
async function checkDependencies() {
  try {
    // 检查Next.js应用是否运行
    const response = await fetch(`${NEXT_APP_URL}/api/articles?limit=1`, {
      timeout: 5000,
    });

    if (!response.ok) {
      throw new Error('API响应异常');
    }

    log('✅ Next.js应用连接正常');
    return true;
  } catch (error) {
    log(`❌ 无法连接到Next.js应用: ${error.message}`, 'ERROR');
    log('💡 请先启动Next.js应用: npm run dev', 'WARN');
    return false;
  }
}

// 主函数
async function main() {
  log('🌐 全球新闻定时抓取器 v1.0');
  log('='.repeat(50));

  // 检查依赖
  const isReady = await checkDependencies();
  if (!isReady) {
    log('❌ 依赖检查失败，退出程序', 'ERROR');
    process.exit(1);
  }

  // 启动定时器
  startScheduler();
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('启动失败:', error);
    process.exit(1);
  });
}

module.exports = { fetchNews, startScheduler };
