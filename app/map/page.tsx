'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// 动态导入 Globe3D 组件，禁用 SSR，因为 Three.js 依赖 window 对象
const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-[#000510] text-[#ff6600] font-mono">INITIALIZING GLOBE SYSTEMS...</div>
})

export default function MapPage() {
  return (
    <div className="relative w-full h-screen bg-[#000510] overflow-hidden">
      {/* 3D 地球容器 */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Globe3D />
      </div>

      {/* 顶部导航 overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-[#ff6600] transition-colors mb-4 backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 返回首页
          </Link>
          <div className="space-y-1 mt-2">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl" style={{ fontFamily: 'Verdana, sans-serif' }}>
              GLOBAL<span className="text-[#ff6600]">NEWS</span>
            </h1>
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase ml-1">
              Real-time 3D Visualization
            </p>
          </div>
        </div>
      </div>

      {/* 底部数据面板 */}
      <div className="absolute bottom-10 left-10 z-10 pointer-events-none hidden sm:block">
        <div className="flex gap-8 backdrop-blur-md bg-black/30 p-6 rounded-2xl border border-white/10">
          <div className="text-center">
            <div className="text-3xl font-black text-white tabular-nums">37</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">News Sources</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-[#ff6600] animate-pulse">LIVE</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Stream Status</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-white tabular-nums">24h</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Timeline</div>
          </div>
        </div>
      </div>

      {/* 右下角版权 */}
      <div className="absolute bottom-4 right-6 pointer-events-none opacity-30 text-[10px] text-white">
        POWERED BY GLOBESTREAM3D
      </div>
    </div>
  )
}
