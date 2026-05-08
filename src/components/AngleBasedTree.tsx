import { Sparkles, Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  LinearFilter,
  MathUtils,
  SRGBColorSpace,
  type Mesh,
  type Texture,
} from 'three'

type AngleBasedTreeProps = {
  frameUrls: string[]
  position?: [number, number, number]
  planeSize?: [number, number]
  dragSensitivity?: number
  fadeSpeed?: number
}

function normalizeIndex(index: number, count: number): number {
  return ((index % count) + count) % count
}

function setupTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
}

function AngleBasedTreeScene({
  frameUrls,
  position = [0, 0, 0],
  planeSize = [6, 7.4],
  dragSensitivity = 0.012,
  fadeSpeed = 7.2,
}: AngleBasedTreeProps) {
  const { camera } = useThree()
  const dragPlaneRef = useRef<Mesh>(null)
  const frontPlaneRef = useRef<Mesh>(null)
  const backPlaneRef = useRef<Mesh>(null)

  const [virtualRotation, setVirtualRotation] = useState(0)
  const [frontIndex, setFrontIndex] = useState(0)
  const [backIndex, setBackIndex] = useState(0)
  const isDraggingRef = useRef(false)
  const lastXRef = useRef(0)
  const blendRef = useRef(1)

  const frames = useMemo(() => {
    const deduped = frameUrls.filter(Boolean)
    if (deduped.length < 2) {
      throw new Error('AngleBasedTree requires at least 2 PNG frames.')
    }
    return deduped
  }, [frameUrls])

  useEffect(() => {
    frames.forEach((url) => useTexture.preload(url))
  }, [frames])

  const textures = useTexture(frames) as Texture[]

  useEffect(() => {
    textures.forEach(setupTexture)
  }, [textures])

  const targetIndex = useMemo(() => {
    const ratio = virtualRotation / (Math.PI * 2)
    const raw = Math.round(ratio * frames.length)
    return normalizeIndex(raw, frames.length)
  }, [virtualRotation, frames.length])

  useEffect(() => {
    if (targetIndex === frontIndex) return
    setBackIndex(frontIndex)
    setFrontIndex(targetIndex)
    blendRef.current = 0
  }, [targetIndex, frontIndex])

  useFrame((_, delta) => {
    if (frontPlaneRef.current) {
      frontPlaneRef.current.quaternion.copy(camera.quaternion)
    }
    if (backPlaneRef.current) {
      backPlaneRef.current.quaternion.copy(camera.quaternion)
    }
    if (dragPlaneRef.current) {
      dragPlaneRef.current.quaternion.copy(camera.quaternion)
    }

    blendRef.current = Math.min(1, blendRef.current + delta * fadeSpeed)

    const frontMaterial = frontPlaneRef.current?.material
    const backMaterial = backPlaneRef.current?.material
    if (frontMaterial && 'opacity' in frontMaterial) {
      frontMaterial.opacity = blendRef.current
    }
    if (backMaterial && 'opacity' in backMaterial) {
      backMaterial.opacity = 1 - blendRef.current
    }
  })

  const frontTexture = textures[frontIndex]
  const backTexture = textures[backIndex]

  return (
    <group position={position}>
      <color attach="background" args={['#09050f']} />

      {/* Low-cost atmospheric lights only; tree lighting is baked in PNG. */}
      <ambientLight intensity={0.52} />
      <pointLight position={[0, 3.2, 2.4]} color="#ffcc9a" intensity={5} distance={16} />
      <pointLight position={[-3.2, 2.1, -2.2]} color="#7d68d8" intensity={2.6} distance={12} />

      {/* Keep ritual circle + mystical atmosphere as requested. */}
      <mesh position={[0, -3.15, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 4.35, 72]} />
        <meshBasicMaterial
          color="#c59f6a"
          transparent
          opacity={0.28}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, -3.14, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.05, 64]} />
        <meshBasicMaterial
          color="#8b73ff"
          transparent
          opacity={0.2}
          blending={AdditiveBlending}
        />
      </mesh>

      <Stars radius={52} depth={30} count={1200} factor={1.55} saturation={0.2} fade speed={0.32} />
      <Sparkles count={85} scale={9.5} size={2.1} speed={0.26} color="#ffd38a" opacity={0.34} />
      <Sparkles count={52} scale={7.2} size={1.8} speed={0.2} color="#9ba8ff" opacity={0.2} />

      {/* Two stacked planes for smooth crossfade between sprite angles. */}
      <mesh ref={backPlaneRef} position={[0, 0.2, 0]}>
        <planeGeometry args={planeSize} />
        <meshBasicMaterial
          map={backTexture}
          transparent
          depthWrite={false}
          opacity={0}
          alphaTest={0.04}
        />
      </mesh>
      <mesh ref={frontPlaneRef} position={[0, 0.2, 0.001]}>
        <planeGeometry args={planeSize} />
        <meshBasicMaterial
          map={frontTexture}
          transparent
          depthWrite={false}
          opacity={1}
          alphaTest={0.04}
        />
      </mesh>

      {/* Invisible hit plane for drag gestures. */}
      <mesh
        ref={dragPlaneRef}
        position={[0, 0.2, 0.25]}
        onPointerDown={(e) => {
          e.stopPropagation()
          isDraggingRef.current = true
          lastXRef.current = e.clientX
          window.document.body.style.cursor = 'grabbing'
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current) return
          e.stopPropagation()
          const deltaX = e.clientX - lastXRef.current
          lastXRef.current = e.clientX
          setVirtualRotation((prev) =>
            MathUtils.euclideanModulo(prev + deltaX * dragSensitivity, Math.PI * 2),
          )
        }}
        onPointerUp={() => {
          isDraggingRef.current = false
          window.document.body.style.cursor = 'default'
        }}
        onPointerOut={() => {
          isDraggingRef.current = false
          window.document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[planeSize[0] * 1.05, planeSize[1] * 1.05]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

export function AngleBasedTree(props: AngleBasedTreeProps) {
  return (
    <Canvas camera={{ position: [0, 1.4, 8], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <AngleBasedTreeScene {...props} />
    </Canvas>
  )
}

