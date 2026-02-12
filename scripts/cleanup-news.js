#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 日志记录
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// 清理过期新闻
async function cleanupOldNews() {
  try {
    log('🧹 开始清理过期新闻...');

    // 计算时间边界
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3天前
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);  // 7天前

    // 1. 统计当前数据
    const totalArticles = await prisma.article.count();
    const oldArticles = await prisma.article.count({
      where: {
        publishedAt: {
          lt: threeDaysAgo
        }
      }
    });

    log(`📊 当前总新闻数: ${totalArticles}`);
    log(`📊 3天前的新闻: ${oldArticles}`);

    // 2. 保留收藏的和热门的文章，删除其他过期文章
    const deleteResult = await prisma.article.deleteMany({
      where: {
        AND: [
          {
            publishedAt: {
              lt: threeDaysAgo // 3天前
            }
          },
          {
            viewCount: {
              lt: 10 // 阅读数少于10的
            }
          },
          {
            isFeatured: false // 非推荐文章
          },
          {
            isDailySelected: false // 非日报精选
          }
        ]
      }
    });

    log(`✅ 清理完成: 删除了 ${deleteResult.count} 篇过期新闻`);

    // 3. 清理孤立的fetchLog记录 (保留最近30条)
    const oldLogs = await prisma.fetchLog.findMany({
      orderBy: {
        startedAt: 'desc'
      },
      skip: 30 // 跳过最新的30条
    });

    if (oldLogs.length > 0) {
      const deleteLogResult = await prisma.fetchLog.deleteMany({
        where: {
          id: {
            in: oldLogs.map(log => log.id)
          }
        }
      });
      log(`🗑️  清理日志记录: 删除了 ${deleteLogResult.count} 条旧日志`);
    }

    // 4. 统计清理后的数据
    const finalCount = await prisma.article.count();
    log(`📈 清理后总新闻数: ${finalCount}`);
    log(`💾 节省空间: ${totalArticles - finalCount} 篇文章`);

    // 5. 按分类统计当前数据
    const categoryStats = await prisma.article.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    log('📊 当前分类统计:');
    categoryStats.forEach(stat => {
      log(`   ${stat.category}: ${stat._count.id} 篇`);
    });

    return {
      deleted: deleteResult.count,
      remaining: finalCount,
      saved: totalArticles - finalCount
    };

  } catch (error) {
    log(`❌ 清理失败: ${error.message}`, 'ERROR');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 主函数
async function main() {
  log('🌐 新闻数据清理工具 v1.0');
  log('='.repeat(50));

  try {
    const result = await cleanupOldNews();

    log('');
    log('✅ 清理任务完成!');
    log(`📊 删除: ${result.deleted} 篇过期新闻`);
    log(`📊 保留: ${result.remaining} 篇最新新闻`);
    log('');

    process.exit(0);
  } catch (error) {
    log(`❌ 任务失败: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { cleanupOldNews };
