import { Canvas } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'

export function HeroCanvas() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setParallax({ x, y })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="hero-canvas" aria-hidden>
      <div
        className="hero-nebula-layer"
        style={{ transform: `translate3d(${parallax.x * -12}px, ${parallax.y * -8}px, 0)` }}
      />
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[3, 2, 6]} intensity={45} color="#ffd54a" distance={40} />
        <pointLight position={[-4, -1, 4]} intensity={12} color="#a78bfa" distance={30} />
        <Suspense fallback={null}>
          <Stars
            radius={90}
            depth={52}
            count={5200}
            factor={3.1}
            saturation={0.12}
            fade
            speed={0.4}
          />
          <Sparkles
            count={100}
            scale={14}
            size={2.2}
            speed={0.35}
            opacity={0.55}
            color="#ffcc33"
          />
        </Suspense>
      </Canvas>
      <div
        className="hero-shooting-stars"
        style={{ transform: `translate3d(${parallax.x * -6}px, ${parallax.y * -4}px, 0)` }}
      >
        <span className="shooting-star s1" />
        <span className="shooting-star s2" />
      </div>
    </div>
  )
}
