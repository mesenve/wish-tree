import { Float } from '@react-three/drei'
import type { Wish } from '../types'
import { BranchTube } from './tree/BranchTube'
import { CrystalSeed } from './tree/CrystalSeeds'
import { EnergyRings } from './tree/EnergyRings'

type Props = {
  wishes: Wish[]
  onSelectWish: (wish: Wish) => void
}

function BasePortal() {
  return (
    <group position={[0, -1.78, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.35, 1.55, 0.08, 96]} />
        <meshPhysicalMaterial
          color="#150824"
          emissive="#6d28d9"
          emissiveIntensity={0.35}
          roughness={0.28}
          metalness={0.7}
          clearcoat={1}
        />
      </mesh>
      <EnergyRings position={[0, 0.04, 0]} />
    </group>
  )
}

export function FuturisticWishTree({ wishes, onSelectWish }: Props) {
  const branches: [number, number, number][][] = [
    [[0, -0.4, 0], [-0.45, 0.25, 0], [-1.15, 1.05, 0.15], [-2, 1.55, 0]],
    [[0, -0.2, 0], [0.5, 0.3, 0], [1.25, 1.05, -0.1], [2.05, 1.55, 0]],
    [[0.05, 0.05, 0], [-0.25, 0.75, -0.2], [-0.65, 1.45, -0.35]],
    [[0.05, 0.05, 0], [0.35, 0.8, 0.25], [0.75, 1.55, 0.35]],
    [[0.08, 0.25, 0], [0.1, 0.9, 0], [0.05, 1.85, 0]],
  ]

  const tips = [
    [-2, 1.55, 0],
    [2.05, 1.55, 0],
    [-0.65, 1.45, -0.35],
    [0.75, 1.55, 0.35],
    [0.05, 1.85, 0],
  ] as [number, number, number][]

  return (
    <group position={[0, 0.15, 0]}>
      <BranchTube
        points={[
          [0, -1.75, 0],
          [-0.15, -0.9, 0.05],
          [0.15, -0.15, -0.05],
          [0, 0.8, 0],
        ]}
        radius={0.2}
        color="#4b19a8"
        emissive="#8f4dff"
      />

      {branches.map((points, index) => (
        <BranchTube
          key={index}
          points={points}
          radius={index < 2 ? 0.12 : 0.055}
          color={index % 2 === 0 ? '#6f31d9' : '#351069'}
          emissive={index % 2 === 0 ? '#b56cff' : '#4cc9ff'}
        />
      ))}

      {tips.map((position, index) => (
        <Float key={index} speed={1.2} rotationIntensity={0.8} floatIntensity={0.25}>
          <CrystalSeed
            position={position}
            onClick={() => {
              if (wishes.length === 0) return
              const wish = wishes[index % wishes.length]
              if (wish) onSelectWish(wish)
            }}
          />
        </Float>
      ))}

      <BasePortal />
    </group>
  )
}
