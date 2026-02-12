'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'

interface NewsMarker {
  id: string
  title: string
  lat: number
  lng: number
  category: string
  count: number
}

interface GlobeProps {
  markers?: NewsMarker[]
  onMarkerClick?: (marker: NewsMarker) => void
}

// 将经纬度转换为3D坐标
function latLngToVector3(lat: number, lng: number, radius: number = 2) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

// 地球组件
function Earth({ markers = [], onMarkerClick }: GlobeProps) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  // 加载纹理
  const [textures, setTextures] = useState<{
    map?: THREE.Texture
    normalMap?: THREE.Texture
    specularMap?: THREE.Texture
    cloudMap?: THREE.Texture
  }>({})

  useEffect(() => {
    const loader = new THREE.TextureLoader()

    // 使用免费的地球纹理
    const textureUrls = {
      map: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      normalMap: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
      specularMap: 'https://unpkg.com/three-globe/example/img/earth-water.png',
      cloudMap: 'https://unpkg.com/three-globe/example/img/earth-clouds.png',
    }

    Promise.all([
      loader.loadAsync(textureUrls.map),
      loader.loadAsync(textureUrls.normalMap),
      loader.loadAsync(textureUrls.specularMap),
      loader.loadAsync(textureUrls.cloudMap),
    ]).then(([map, normalMap, specularMap, cloudMap]) => {
      setTextures({ map, normalMap, specularMap, cloudMap })
    }).catch(() => {
      // 如果加载失败，使用纯色材质
      console.warn('Failed to load textures, using default material')
    })
  }, [])

  // 自动旋转
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07
    }
  })

  const earthMaterial = useMemo(() => {
    if (textures.map) {
      return new THREE.MeshPhongMaterial({
        map: textures.map,
        normalMap: textures.normalMap,
        specularMap: textures.specularMap,
        specular: new THREE.Color(0x333333),
        shininess: 5,
      })
    }
    return new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      shininess: 10,
    })
  }, [textures])

  return (
    <group>
      {/* 地球本体 */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      {/* 云层 */}
      {textures.cloudMap && (
        <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshPhongMaterial
            map={textures.cloudMap}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 大气层光晕 */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color={0x4488ff}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 新闻热点标记 */}
      {markers.map((marker) => (
        <NewsPin
          key={marker.id}
          marker={marker}
          onClick={() => onMarkerClick?.(marker)}
        />
      ))}
    </group>
  )
}

// 新闻标记点
function NewsPin({ marker, onClick }: { marker: NewsMarker; onClick?: () => void }) {
  const pinRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const position = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, 2.05)
  }, [marker.lat, marker.lng])

  // 脉冲动画
  useFrame((state) => {
    if (pinRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2
      pinRef.current.scale.setScalar(scale)
    }
  })

  const categoryColors: Record<string, string> = {
    tech: '#3b82f6',
    finance: '#22c55e',
    politics: '#ef4444',
    sports: '#f97316',
    entertainment: '#a855f7',
    health: '#ec4899',
    education: '#14b8a6',
    environment: '#84cc16',
    international: '#6366f1',
    domestic: '#f59e0b',
  }

  const color = categoryColors[marker.category] || '#3b82f6'
  const size = Math.min(marker.count * 0.1 + 0.3, 1)

  return (
    <group position={position}>
      {/* 标记点 */}
      <mesh
        ref={pinRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size * 0.15, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* 光晕效果 */}
      <mesh scale={[2, 2, 2]}>
        <sphereGeometry args={[size * 0.15, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 连线到地面 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              0, 0, 0,
              0, 0, -0.5,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </line>

      {/* 悬停提示 */}
      {hovered && (
        <Text
          position={[0, size * 0.3 + 0.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {marker.title}
        </Text>
      )}
    </group>
  )
}

// 灯光设置
function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.5}
        castShadow
      />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color={0x4488ff} />
    </>
  )
}

// 主组件
export function Globe({ markers = [], onMarkerClick }: GlobeProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Lights />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        <Earth markers={markers} onMarkerClick={onMarkerClick} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}

export default Globe
