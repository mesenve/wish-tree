type Props = {
  position: [number, number, number]
}

export function EnergyRings({ position }: Props) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.018, 12, 128]} />
        <meshBasicMaterial color="#b56cff" transparent opacity={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, 0.01, 12, 128]} />
        <meshBasicMaterial color="#4cc9ff" transparent opacity={0.55} />
      </mesh>

      <pointLight position={[0, 0.2, 0]} color="#9f5cff" intensity={2} distance={3} />
    </group>
  )
}
