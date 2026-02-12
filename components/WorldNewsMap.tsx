'use client'

import React, { memo } from 'react'
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'

// Using a stable TopoJSON source
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface NewsMarker {
    id: string
    name: string
    lat: number
    lon: number
    newsCount: number
}

interface WorldNewsMapProps {
    markers: NewsMarker[]
    onMarkerClick: (marker: NewsMarker) => void
    selectedMarkerId?: string
}

const WorldNewsMap = ({ markers, onMarkerClick, selectedMarkerId }: WorldNewsMapProps) => {
    // Scale marker size based on news count
    const maxNews = Math.max(...markers.map(m => m.newsCount), 1)
    const sizeScale = scaleLinear()
        .domain([0, maxNews])
        .range([4, 12]) // Min size 4, Max size 12

    return (
        <div className="w-full h-full bg-[#000510]">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 120, // Initial zoom
                    center: [20, 30] // Center map roughly to show most land
                }}
                className="w-full h-full"
            >
                <ZoomableGroup zoom={1} minZoom={0.5} maxZoom={4}>
                    {/* Countries Layer */}
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#1a1d2d"
                                    stroke="#2e344e"
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#23273a", outline: "none" },
                                        pressed: { fill: "#1a1d2d", outline: "none" },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {/* Markers Layer */}
                    {markers.map((marker) => {
                        const size = sizeScale(marker.newsCount)
                        const isSelected = selectedMarkerId === marker.id

                        return (
                            <Marker
                                key={marker.id}
                                coordinates={[marker.lon, marker.lat]}
                                onClick={() => onMarkerClick(marker)}
                                className="cursor-pointer group"
                            >
                                {/* Glow Effect */}
                                <circle
                                    r={size * 2.5}
                                    fill="#ff6600"
                                    opacity={isSelected ? 0.3 : 0}
                                    className="animate-pulse transition-opacity duration-300"
                                />

                                {/* Outer Ring */}
                                <circle
                                    r={size * 1.5}
                                    fill="transparent"
                                    stroke="#ff6600"
                                    strokeWidth={1}
                                    opacity={isSelected ? 0.8 : 0.3}
                                    className="transition-opacity duration-300 group-hover:opacity-80"
                                />

                                {/* Core Dot */}
                                <circle
                                    r={size}
                                    fill={isSelected ? "#fff" : "#ff6600"}
                                    stroke="#fff"
                                    strokeWidth={1}
                                    className="transition-colors duration-300"
                                />

                                {/* Text Label on Hover */}
                                <text
                                    textAnchor="middle"
                                    y={size + 15}
                                    style={{
                                        fontFamily: "system-ui",
                                        fill: "#fff",
                                        fontSize: 10,
                                        fontWeight: "bold",
                                        opacity: isSelected ? 1 : 0.7,
                                        pointerEvents: "none"
                                    }}
                                    className="group-hover:opacity-100 transition-opacity"
                                >
                                    {marker.name}
                                </text>
                            </Marker>
                        )
                    })}
                </ZoomableGroup>
            </ComposableMap>
        </div>
    )
}

export default memo(WorldNewsMap)
