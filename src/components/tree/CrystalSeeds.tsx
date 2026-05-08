import { AdditiveBlending } from 'three'

type Props = {
  position: [number, number, number]
  onClick?: () => void
}

export function CrystalSeed({ position, onClick }: Props) {
  return (
    <group position={position}>
      <mesh
        onPointerOver={() => {
          window.document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          window.document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
      >
        <octahedronGeometry args={[0.16, 0]} />
        <meshPhysicalMaterial
          color="#c7a3ff"
          emissive="#b56cff"
          emissiveIntensity={1.4}
          roughness={0.05}
          metalness={0.15}
          transmission={0.55}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.008, 8, 64]} />
        <meshBasicMaterial
          color="#ffd6ff"
          transparent
          opacity={0.65}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight color="#c084fc" intensity={1.4} distance={1.2} />
    </group>
  )
}
