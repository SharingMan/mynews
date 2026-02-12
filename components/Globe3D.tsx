'use client'

import { useEffect, useRef } from 'react'
import ChartScene from '@/lib/globe/chartScene'
import chart from '@/lib/globe/index'
import world from '@/public/map/world.json'

export default function Globe3D() {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartInstanceRef = useRef<ChartScene | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // 注册地图数据
        chart.registerMap('world', world)

        // 初始化场景
        const chartInstance = chart.init({
            dom: containerRef.current,
            helper: false,
            map: 'world',
            autoRotate: true,
            mode: '3d',
            config: {
                R: 140, // 地球半径
                enableZoom: false,
                texture: {
                    path: '/images/globe/earth.png', // 使用 public 目录下的图片
                    mixed: false,
                },
                earth: {
                    color: '#ffffff',
                    dragConfig: {
                        rotationSpeed: 0.5,
                        inertiaFactor: 0.2, // 惯性
                        disableX: false,
                        disableY: false,
                    }
                },
                bgStyle: {
                    color: '#000000',
                    opacity: 0, // 透明背景
                },
                // 飞线样式
                flyLineStyle: {
                    color: '#ff6600', // HN Orange!
                    size: 2,
                },
                // 地图样式
                mapStyle: {
                    areaColor: '#2e3564',
                    lineColor: '#797eff',
                },
                spriteStyle: {
                    color: '#797eff',
                    show: true,
                },
            }
        })

        chartInstanceRef.current = chartInstance

        // 模拟数据 (后续替换为真实新闻数据)
        const flyLines = [
            {
                from: { lon: 116.4074, lat: 39.9042 }, // 北京
                to: { lon: -74.006, lat: 40.7128 },   // 纽约
            },
            {
                from: { lon: -0.1278, lat: 51.5074 }, // 伦敦
                to: { lon: 139.6917, lat: 35.6895 },  // 东京
            }
        ]

        chartInstance.setData('flyLine', flyLines)

        // 清理函数
        return () => {
            // 销毁实例
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy()
                chartInstanceRef.current = null
            }
        }
    }, [])

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '600px', outline: 'none' }}
        />
    )
}
