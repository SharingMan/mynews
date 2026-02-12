#!/usr/bin/env node

// 为Hobby账户创建手动更新功能

const path = require('path');
const fs = require('fs');

const manualUpdatePage = `import { NextRequest, NextResponse } from 'next/server'

// 手动更新页面 - 用于Hobby账户手动触发新闻抓取
export default function ManualUpdatePage() {
  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/cron/fetch', {
        method: 'GET',
      });

      const result = await response.json();

      if (result.success) {
        alert(\`抓取成功！新增 \${result.new} 篇新闻\`);
        window.location.reload();
      } else {
        alert('抓取失败，请稍后再试');
      }
    } catch (error) {
      alert('更新异常：' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4">手动更新新闻</h1>
        <p className="text-gray-600 mb-6">
          由于Vercel免费版限制，无法频繁自动抓取。
          您可以手动点击下面的按钮来更新最新新闻。
        </p>

        <button
          onClick={handleUpdate}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          🔄 立即更新新闻
        </button>

        <div className="mt-4 text-sm text-gray-500">
          <p>• 每次最多抓取35篇最新新闻</p>
          <p>• 自动去重和分类</p>
          <p>• 建议每天更新2-3次</p>
        </div>

        <div className="mt-6">
          <Link href="/" className="text-orange-500 hover:underline">
            ← 返回新闻主页
          </Link>
        </div>
      </div>
    </div>
  );
}`;

  // 创建手动更新页面
  const updatePagePath = path.join(__dirname, '..', 'app', 'update', 'page.tsx');

  // 确保目录存在
  const updateDir = path.dirname(updatePagePath);
  if (!fs.existsSync(updateDir)) {
    fs.mkdirSync(updateDir, { recursive: true });
  }

  fs.writeFileSync(updatePagePath, manualUpdatePage);

  console.log('✅ 手动更新页面已创建: /update');
  console.log('💡 用户可以访问 /update 页面手动触发新闻抓取');

} catch (error) {
  console.error('❌ 创建失败:', error.message);
}
