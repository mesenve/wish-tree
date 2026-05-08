import { OrbitControls, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  AdditiveBlending,
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  TubeGeometry,
  Vector3,
  type Group,
  type Mesh,
} from 'three'
import type { Wish, WishCategory } from '../types'

type Props = {
  wishes: Wish[]
  onSelectWish: (wish: Wish) => void
}

type PositionedWish = {
  wish: Wish
  position: [number, number, number]
  scale: number
}

type CategoryColor = {
  base: string
  emissive: string
  halo: string
  hoverBase: string
}

const CATEGORY_COLORS: Record<WishCategory, CategoryColor> = {
  love: { base: '#ffd88a', emissive: '#9a6616', halo: '#ffe8b8', hoverBase: '#efc66d' },
  career: { base: '#ffd88a', emissive: '#9a6616', halo: '#ffe8b8', hoverBase: '#efc66d' },
  health: { base: '#ffd88a', emissive: '#9a6616', halo: '#ffe8b8', hoverBase: '#efc66d' },
  money: { base: '#ffd88a', emissive: '#9a6616', halo: '#ffe8b8', hoverBase: '#efc66d' },
  other: { base: '#ffd88a', emissive: '#9a6616', halo: '#ffe8b8', hoverBase: '#efc66d' },
}

function hashId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function placeWish(wish: Wish): PositionedWish {
  const h = hashId(wish.id)
  const n1 = (h & 1023) / 1023
  const n2 = ((h >> 10) & 1023) / 1023
  const n3 = ((h >> 20) & 1023) / 1023
  const branchBand = Math.floor(n3 * 3)
  const y = 0.9 + branchBand * 0.95 + n2 * 0.85
  const radius = Math.max(0.5, 2.55 - y * 0.52) + n1 * 0.5
  const theta = Math.PI * 2 * ((n1 + n2 * 0.37) % 1)
  const x = Math.cos(theta) * radius
  const z = Math.sin(theta) * radius
  const scale = 0.07 + ((h >> 5) & 255) / 2800
  return { wish, position: [x, y, z], scale }
}

function noise(i: number, j = 0): number {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453123
  return n - Math.floor(n)
}

function TubeStrand({
  points,
  radius,
  color,
  emissive,
  emissiveIntensity,
  opacity = 0.72,
  segments = 36,
}: {
  points: [number, number, number][]
  radius: number
  color: string
  emissive: string
  emissiveIntensity: number
  opacity?: number
  segments?: number
}) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(p[0], p[1], p[2])))
    const g = new TubeGeometry(curve, segments, radius, 12, false)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const base = new Color(color)
    for (let i = 0; i < pos.count; i++) {
      const t = i / Math.max(1, pos.count - 1)
      // Base side stays lighter; toward tips gets darker.
      const shade = 1 - t * 0.4
      colors[i * 3] = base.r * shade
      colors[i * 3 + 1] = base.g * shade
      colors[i * 3 + 2] = base.b * shade
    }
    g.setAttribute('color', new BufferAttribute(colors, 3))
    return g
  }, [points, segments, radius])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        vertexColors
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.25}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  )
}

// Tree branches are currently hidden, keep TubeStrand referenced to satisfy TS noUnusedLocals.
void TubeStrand

function WishTree({ wishes, onSelectWish }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const lotusRef = useRef<Group>(null)

  const nodes = useMemo(() => wishes.map(placeWish), [wishes])
  const branchCurves = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const t = (i / 10) * Math.PI * 2 + (i % 2 === 0 ? 0.06 : -0.06)
        const spread = 1.45 + noise(i, 221) * 0.75
        const lift = 1.7 + noise(i, 222) * 0.55
        return [
          [0.0, 0.75, 0.0],
          [Math.cos(t) * 0.34, 1.25, Math.sin(t) * 0.34],
          [Math.cos(t + 0.08) * 0.96, lift, Math.sin(t + 0.08) * 0.96],
          [Math.cos(t + 0.16) * spread, lift + 0.75, Math.sin(t + 0.16) * spread],
        ] as [number, number, number][]
      }),
    [],
  )

  const twigCurves = useMemo(
    () =>
      branchCurves.flatMap((curve, i) => {
        const tip = curve[curve.length - 1]
        return Array.from({ length: 2 }, (_, j) => {
          const dir = (j === 0 ? -1 : 1) * (0.26 + noise(i * 3 + j, 240) * 0.24)
          const up = 0.45 + noise(i * 3 + j, 241) * 0.3
          return [
            [tip[0] * 0.78, tip[1] - 0.3, tip[2] * 0.78],
            [tip[0] * 0.9 + dir * 0.08, tip[1] - 0.02, tip[2] * 0.9 - dir * 0.08],
            [tip[0] + dir * 0.35, tip[1] + up, tip[2] - dir * 0.35],
          ] as [number, number, number][]
        })
      }),
    [branchCurves],
  )

  const treeWishLights = useMemo(
    () =>
      [...branchCurves, ...twigCurves].map((curve, i) => {
        const tip = curve[curve.length - 1]
        return {
          key: i,
          position: [tip[0], tip[1], tip[2]] as [number, number, number],
          scale: 0.075 + noise(i, 231) * 0.035,
          speed: 0.32 + noise(i, 232) * 0.28,
          offset: noise(i, 233) * Math.PI * 2,
        }
      }),
    [branchCurves, twigCurves],
  )

  const hangingLights = useMemo(
    () =>
      [...branchCurves, ...twigCurves].map((curve, i) => {
        const tip = curve[curve.length - 1]
        const drop = 0.34 + noise(i, 251) * 0.55
        return {
          key: i,
          from: [tip[0], tip[1], tip[2]] as [number, number, number],
          to: [tip[0], tip[1] - drop, tip[2]] as [number, number, number],
          size: 0.05 + noise(i, 252) * 0.025,
          speed: 0.25 + noise(i, 253) * 0.25,
          offset: noise(i, 254) * Math.PI * 2,
        }
      }),
    [branchCurves, twigCurves],
  )

  const ambientOrbs = useMemo(
    () => {
      const layers = [
        { y: 1.72, count: 18, rx: 1.75, rz: 1.35 },
        { y: 2.46, count: 16, rx: 2.02, rz: 1.52 },
        { y: 3.15, count: 14, rx: 1.64, rz: 1.24 },
      ]
      const all: {
        key: number
        position: [number, number, number]
        size: number
        speed: number
        offset: number
        color: string
      }[] = []
      let idx = 0
      for (const layer of layers) {
        for (let i = 0; i < layer.count; i++) {
          const t = (i / layer.count) * Math.PI * 2 + noise(idx, 121) * 0.2
          const x = Math.cos(t) * layer.rx * (0.94 + noise(idx, 122) * 0.14)
          const z = Math.sin(t) * layer.rz * (0.94 + noise(idx, 123) * 0.14)
          all.push({
            key: idx,
            position: [x, layer.y + (noise(idx, 124) - 0.5) * 0.22, z],
            size: 0.06 + noise(idx, 125) * 0.04,
            speed: 0.24 + noise(idx, 126) * 0.28,
            offset: noise(idx, 127) * Math.PI * 2,
            color: '#FFD88A',
          })
          idx++
        }
      }
      return all
    },
    [],
  )
  void ambientOrbs

  function animateTree(elapsed: number) {
    if (!lotusRef.current) return
    lotusRef.current.rotation.y = Math.sin(elapsed * 0.09) * 0.04
    lotusRef.current.position.y = Math.sin(elapsed * 0.36) * 0.04
  }

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    animateTree(t)
  })

  function createFuturisticTreeCore() {
    return null
  }

  function createWishLights() {
    return (
      <>
        {treeWishLights.map((orb) => (
          <WishLight
            key={`wish-light-${orb.key}`}
            position={orb.position}
            scale={orb.scale}
            color="#FFD88A"
            speed={orb.speed}
            offset={orb.offset}
            onClick={() => {
              if (wishes.length === 0) return
              const wish = wishes[orb.key % wishes.length]
              if (wish) onSelectWish(wish)
            }}
          />
        ))}
        {hangingLights.map((light) => (
          <HangingLight
            key={`hanging-light-${light.key}`}
            from={light.from}
            to={light.to}
            scale={light.size * 0.92}
            speed={light.speed}
            offset={light.offset}
            onClick={() => {
              if (wishes.length === 0) return
              const wish = wishes[light.key % wishes.length]
              if (wish) onSelectWish(wish)
            }}
          />
        ))}
        {/* Large ambient purple orbs disabled: keep lights attached to tree canopy */}
      </>
    )
  }

  function createAtmosphere() {
    return (
      <>
        <Sparkles count={34} scale={8.4} size={1.6} speed={0.13} color="#ffd8db" opacity={0.2} />
        <Sparkles count={28} scale={7.0} size={1.2} speed={0.1} color="#d8b8ff" opacity={0.14} />
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.34} />
      <hemisphereLight intensity={0.56} color="#f1d8ff" groundColor="#140d21" />
      <directionalLight position={[4, 7, 5]} intensity={0.72} color="#ffd7c6" />
      <pointLight position={[0, 4.2, 0]} intensity={14} distance={18} color="#ffd88a" />
      <pointLight position={[-2.8, 1.4, -1.8]} intensity={5} distance={12} color="#ceabff" />

      <group ref={lotusRef} scale={2.15} position={[0, -1.35, 0]}>
        {createFuturisticTreeCore()}
        {createWishLights()}
      </group>
      <RitualGround />

      {nodes.slice(0, 0).map(({ wish, position, scale }) => {
        const isHovered = hoveredId === wish.id
        const color = CATEGORY_COLORS[wish.category]
        return (
          <group key={wish.id}>
            <mesh
              position={position}
              scale={isHovered ? scale * 1.35 : scale}
              onPointerOver={(e) => {
                e.stopPropagation()
                window.document.body.style.cursor = 'pointer'
                setHoveredId(wish.id)
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                window.document.body.style.cursor = 'default'
                setHoveredId((curr) => (curr === wish.id ? null : curr))
              }}
              onClick={(e) => {
                e.stopPropagation()
                onSelectWish(wish)
              }}
            >
              <sphereGeometry args={[1, 18, 18]} />
              <meshStandardMaterial
                color={isHovered ? color.hoverBase : color.base}
                emissive={color.emissive}
                emissiveIntensity={isHovered ? 1.15 : 0.8}
                roughness={0.38}
                metalness={0.06}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={position} scale={isHovered ? scale * 1.76 : scale * 1.56}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial
                color={color.halo}
                transparent
                opacity={isHovered ? 0.16 : 0.09}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        )
      })}

      {createAtmosphere()}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate
        target={[0, 0.95, 0]}
        minPolarAngle={Math.PI / 3.3}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}

function RitualGround() {
  return null
}

function WishLight({
  position,
  scale,
  color,
  speed,
  offset,
  onClick,
}: {
  position: [number, number, number]
  scale: number
  color: string
  speed: number
  offset: number
  onClick: () => void
}) {
  const ref = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    const pulse = 0.94 + (Math.sin(t * speed + offset) + 1) * 0.07
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.05
    ref.current.scale.setScalar(scale * pulse)
    if (coreRef.current) {
      const m = coreRef.current.material
      if ('opacity' in m) m.opacity = 0.82 + (Math.sin(t * speed + offset) + 1) * 0.08
    }
  })

  return (
    <group ref={ref} position={position}>
      <mesh
        ref={coreRef}
        onPointerOver={() => {
          window.document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          window.document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshPhysicalMaterial
          color={color}
          emissive="#8d5e1a"
          emissiveIntensity={0.95}
          roughness={0.16}
          metalness={0.08}
          transmission={0.28}
          thickness={0.35}
          ior={1.36}
          clearcoat={1}
          clearcoatRoughness={0.08}
          transparent
          opacity={0.96}
        />
      </mesh>
      {/* small specular hotspot to reinforce depth */}
      <mesh position={[-0.22, 0.28, 0.34]} scale={0.3}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#fff6d9" transparent opacity={0.58} depthWrite={false} />
      </mesh>
      <mesh scale={1.9}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.36} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

function PurpleGlowOrb({
  position = [0, 0, 0],
  scale = 1,
  speed,
  offset,
  onClick,
}: {
  position?: [number, number, number]
  scale?: number
  speed: number
  offset: number
  onClick: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const auraRef = useRef<THREE.Mesh>(null)
  const rimRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const count = 90
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 0.15 + Math.random() * 0.65
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.055
      groupRef.current.rotation.y = t * 0.18
      groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.03
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.08
      coreRef.current.scale.setScalar(pulse)
    }
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * 1.8) * 0.05
      auraRef.current.scale.setScalar(pulse)
    }
    if (rimRef.current) {
      const pulse = 1 + Math.sin(t * 1.4) * 0.035
      rimRef.current.scale.setScalar(pulse)
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.12
      particlesRef.current.rotation.x = Math.sin(t * 0.3) * 0.08
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh
        ref={coreRef}
        onPointerOver={() => {
          window.document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          window.document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <sphereGeometry args={[0.38, 48, 48]} />
        <meshBasicMaterial color="#FFE38A" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh ref={auraRef}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshBasicMaterial
          color="#FFB84D"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhysicalMaterial
          color="#B46CFF"
          transparent
          opacity={0.28}
          roughness={0.08}
          metalness={0}
          transmission={0.55}
          thickness={0.8}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.04}
          emissive="#5F2BFF"
          emissiveIntensity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={rimRef}>
        <sphereGeometry args={[1.035, 96, 96]} />
        <meshBasicMaterial
          color="#B34CFF"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.16, 96, 96]} />
        <meshBasicMaterial
          color="#7D38FF"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#FFD27A"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

    </group>
  )
}
void PurpleGlowOrb

function HangingLight({
  from,
  to,
  scale,
  speed,
  offset,
  onClick,
}: {
  from: [number, number, number]
  to: [number, number, number]
  scale: number
  speed: number
  offset: number
  onClick: () => void
}) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.position.x = Math.sin(t * speed + offset) * 0.012
    ref.current.position.z = Math.cos(t * speed + offset) * 0.012
  })

  const height = Math.max(0.02, from[1] - to[1])
  const midY = (from[1] + to[1]) / 2

  return (
    <group ref={ref}>
      <mesh position={[from[0], midY, from[2]]}>
        <cylinderGeometry args={[0.003, 0.003, height, 8]} />
        <meshBasicMaterial color="#ffdca1" transparent opacity={0.5} />
      </mesh>
      <group
        position={to}
        scale={scale}
        onPointerOver={() => {
          window.document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          window.document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        {/* Spiraldeki sarı orb stiline yakın: sıcak çekirdek + yumuşak halo */}
        <mesh>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshPhysicalMaterial
            color="#ffd88a"
            emissive="#7d4e12"
            emissiveIntensity={1.05}
            roughness={0.12}
            metalness={0.12}
            transmission={0.34}
            thickness={0.28}
            ior={1.36}
            clearcoat={1}
            clearcoatRoughness={0.06}
            transparent
            opacity={0.96}
          />
        </mesh>
        <mesh position={[-0.08, 0.1, 0.14]} scale={0.33}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshBasicMaterial color="#fff4cf" transparent opacity={0.62} depthWrite={false} />
        </mesh>
        <mesh scale={1.85}>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshBasicMaterial color="#ffd88a" transparent opacity={0.42} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh scale={2.4}>
          <sphereGeometry args={[0.24, 18, 18]} />
          <meshBasicMaterial color="#ffcc7a" transparent opacity={0.24} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

export function WishTreeCanvas({ wishes, onSelectWish }: Props) {
  return (
    <div className="wall-tree-wrap">
      <Canvas
        camera={{ position: [2.9, 5.7, 5.2], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
      >
        <WishTree wishes={wishes} onSelectWish={onSelectWish} />
      </Canvas>
    </div>
  )
}
