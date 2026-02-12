'use client'

import { useEffect, useRef } from 'react'
import ChartScene from '@/lib/globe/chartScene'
import chart from '@/lib/globe/index'
import world from '@/public/map/world.json'

interface Marker {
    id: string
    lat: number
    lon: number
    newsCount: number
    name: string
}

interface Globe3DProps {
    markers?: Marker[]
    onMarkerClick?: (marker: Marker) => void
}

export default function Globe3D({ markers = [], onMarkerClick }: Globe3DProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartInstanceRef = useRef<ChartScene | null>(null)
    const onMarkerClickRef = useRef(onMarkerClick)

    useEffect(() => {
        onMarkerClickRef.current = onMarkerClick
    }, [onMarkerClick])

    useEffect(() => {
        if (!containerRef.current) return

        // 注册地图数据
        chart.registerMap('world', world as any) // 需要 any 强制绕过类型如果不匹配

        // 初始化场景
        const chartInstance = chart.init({
            dom: containerRef.current,
            helper: false,
            map: 'world',
            autoRotate: true,
            rotateSpeed: 0.002, // 慢一点转动
            mode: '3d',
            config: {
                R: 140,
                enableZoom: true,
                texture: {
                    // path: '/images/globe/earth.png', 
                    mixed: false,
                },
                earth: {
                    color: '#ffffff',
                    dragConfig: {
                        rotationSpeed: 0.5,
                        inertiaFactor: 0.2,
                        disableX: false,
                        disableY: false,
                    }
                },
                bgStyle: {
                    color: '#000000',
                    opacity: 0,
                },
                flyLineStyle: {
                    color: '#ff6600',
                    size: 2,
                },
                mapStyle: {
                    areaColor: '#2e3564',
                    lineColor: '#797eff',
                },
                spriteStyle: {
                    color: '#797eff',
                    show: true,
                },
                scatterStyle: {
                    color: '#ff6600',
                    size: 5,
                }
            }
        })

        chartInstanceRef.current = chartInstance

        // 监听点击事件
        chartInstance.on('click', (e: any, mesh: any) => {
            // 检查 mesh 是否是我们的 scatter 或 point
            if (mesh && (mesh.name === 'scatter' || mesh.name === 'point')) {
                // 有时候 mesh 是 Group 的子元素
                const userData = mesh.userData
                // 调用保存的回调
                if (userData && onMarkerClickRef.current) {
                    onMarkerClickRef.current(userData as Marker)
                }
            }
        })

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy()
                chartInstanceRef.current = null
            }
        }
    }, [])

    // 响应 markers 数据变化
    useEffect(() => {
        if (!chartInstanceRef.current) return

        // 如果没有数据，可能需要清空，或者保留当前状态
        if (markers.length === 0) return

        const scatterData = markers.map(m => ({
            text: m.name,
            style: {
                size: Math.max(3, Math.min(m.newsCount * 2, 12)), // 最小3，最大12
                color: '#ff6600',
                opacity: 0.9,
            },
            ...m // 传递所有 marker 属性到 userData
        }))

        chartInstanceRef.current.setData('scatter', scatterData)
    }, [markers])

    return (
        <div
            ref={containerRef}
            className="w-full h-full outline-none"
        />
    )
}
