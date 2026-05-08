import { Sparkles } from '@react-three/drei'

export function TreeParticles() {
  return (
    <>
      <Sparkles count={90} scale={[7, 5, 3]} size={2} speed={0.35} opacity={0.55} color="#cda7ff" />
      <Sparkles count={36} scale={[6, 4, 4]} size={1.35} speed={0.2} opacity={0.28} color="#ffd8a8" />
    </>
  )
}
