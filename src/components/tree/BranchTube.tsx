import { useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'

type Props = {
  points: [number, number, number][]
  radius?: number
  color?: string
  emissive?: string
}

export function BranchTube({
  points,
  radius = 0.08,
  color = '#7c3cff',
  emissive = '#9f5cff',
}: Props) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)))
    return new TubeGeometry(curve, 72, radius, 16, false)
  }, [points, radius])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.65}
        roughness={0.18}
        metalness={0.45}
        clearcoat={1}
        clearcoatRoughness={0.08}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}
