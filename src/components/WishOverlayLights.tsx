import { useEffect, useMemo, useState } from 'react'
import './WishOverlayLights.css'

type LightType = 'static' | 'orbit' | 'ascending'

type WishLightPoint = {
  id: string
  type: LightType
  startX: number
  startY: number
  midX: number
  midY: number
  endX: number
  endY: number
  size: number
  delay: number
  duration: number
  opacity: number
  drift: number
  wobble: number
  phase: number
  tone: number
}

type Anchor = { x: number; y: number }
type Props = {
  onLightClick?: (lightId: string) => void
}

// Approximate branch splines over the background tree image.
const BRANCH_PATHS: readonly Anchor[][] = [
  [
    { x: 49, y: 66 },
    { x: 43, y: 61 },
    { x: 36, y: 57 },
    { x: 28, y: 53 },
    { x: 20, y: 51 },
  ],
  [
    { x: 49, y: 66 },
    { x: 45, y: 58 },
    { x: 40, y: 52 },
    { x: 33, y: 47 },
    { x: 25, y: 44 },
  ],
  [
    { x: 50, y: 65 },
    { x: 47, y: 57 },
    { x: 44, y: 50 },
    { x: 40, y: 44 },
    { x: 35, y: 40 },
  ],
  [
    { x: 51, y: 65 },
    { x: 54, y: 57 },
    { x: 58, y: 50 },
    { x: 64, y: 44 },
    { x: 71, y: 40 },
  ],
  [
    { x: 51, y: 66 },
    { x: 56, y: 59 },
    { x: 63, y: 54 },
    { x: 71, y: 50 },
    { x: 80, y: 49 },
  ],
  [
    { x: 50, y: 66 },
    { x: 54, y: 62 },
    { x: 59, y: 59 },
    { x: 66, y: 57 },
    { x: 73, y: 56 },
  ],
]

const CANOPY_MERGE = { x: 50, y: 46 } as const

function rnd01(seed: number): number {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return n - Math.floor(n)
}

function sampleBranchAnchors(perPath: number): Anchor[] {
  const out: Anchor[] = []
  for (let p = 0; p < BRANCH_PATHS.length; p++) {
    const path = BRANCH_PATHS[p]
    const segs = path.length - 1
    const localCount = Math.max(3, perPath + (p % 2 === 0 ? 1 : 0))
    for (let i = 0; i < localCount; i++) {
      const t = i / Math.max(1, localCount - 1)
      const jitter = (rnd01(p * 31 + i * 7 + 3) - 0.5) * 0.06
      const tj = Math.min(1, Math.max(0, t + jitter))
      const ft = tj * segs
      const idx = Math.min(segs - 1, Math.floor(ft))
      const lt = ft - idx
      const a = path[idx]
      const b = path[idx + 1]
      out.push({
        x: a.x + (b.x - a.x) * lt,
        y: a.y + (b.y - a.y) * lt,
      })
    }
  }
  return out
}

function buildLights(mobile: boolean): WishLightPoint[] {
  const out: WishLightPoint[] = []
  const anchors = sampleBranchAnchors(mobile ? 5 : 7)

  const staticCount = mobile ? 20 : 34
  const orbitCount = mobile ? 4 : 6
  const ascendingCount = mobile ? 3 : 5

  for (let i = 0; i < staticCount; i++) {
    const a = anchors[i % anchors.length]
    const n = rnd01(i + 1)
    const n2 = rnd01(i + 9)
    out.push({
      id: `s-${i}`,
      type: 'static',
      startX: a.x + (n - 0.5) * 1.6,
      startY: a.y + (n2 - 0.5) * 1.3,
      midX: 0,
      midY: 0,
      endX: 0,
      endY: 0,
      size: 4 + n * 6.5,
      delay: n * 2.8,
      duration: 2.2 + n * 2.1,
      opacity: 0.34 + n * 0.4,
      drift: 0,
      wobble: 0.8 + rnd01(i + 201) * 2.1,
      phase: rnd01(i + 211) * Math.PI * 2,
      tone: Math.max(0, Math.min(1, (a.x - 20) / 60)),
    })
  }

  for (let i = 0; i < orbitCount; i++) {
    const n = rnd01(i + 41)
    const n2 = rnd01(i + 52)
    const cx = CANOPY_MERGE.x + (n - 0.5) * 12
    const cy = CANOPY_MERGE.y + (n2 - 0.5) * 8
    out.push({
      id: `o-${i}`,
      type: 'orbit',
      startX: cx,
      startY: cy,
      midX: 8 + n * 10,
      midY: 4 + n2 * 6,
      endX: 0,
      endY: 0,
      size: 7 + n2 * 8,
      delay: n2 * 4,
      duration: 8.5 + n * 6,
      opacity: 0.4 + n * 0.28,
      drift: n > 0.5 ? 1 : -1,
      wobble: 1.2 + rnd01(i + 301) * 2.8,
      phase: rnd01(i + 311) * Math.PI * 2,
      tone: Math.max(0, Math.min(1, (cx - 20) / 60)),
    })
  }

  for (let i = 0; i < ascendingCount; i++) {
    const a = anchors[(i * 6 + 5) % anchors.length]
    const n = rnd01(i + 80)
    const n2 = rnd01(i + 91)
    out.push({
      id: `u-${i}`,
      type: 'ascending',
      startX: a.x,
      startY: a.y,
      midX: CANOPY_MERGE.x + (n - 0.5) * 8,
      midY: CANOPY_MERGE.y + (n2 - 0.5) * 6,
      endX: CANOPY_MERGE.x + 4 + (n - 0.5) * 14,
      endY: 20 + n2 * 6,
      size: 7 + n * 6,
      delay: i * 1.2 + n2,
      duration: 9 + n * 4,
      opacity: 0.48 + n * 0.28,
      drift: (n - 0.5) * 18,
      wobble: 1.5 + rnd01(i + 401) * 3.2,
      phase: rnd01(i + 411) * Math.PI * 2,
      tone: Math.max(0, Math.min(1, (a.x - 20) / 60)),
    })
  }

  return out
}

export function WishOverlayLights({ onLightClick }: Props) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const onChange = () => setMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const lights = useMemo(() => buildLights(mobile), [mobile])

  return (
    <div className="wish-overlay" aria-hidden={!onLightClick}>
      {lights.map((light) => (
        <span
          key={light.id}
          className={`wish-overlay__light wish-overlay__light--${light.type}`}
          role={onLightClick ? 'button' : undefined}
          tabIndex={onLightClick ? 0 : undefined}
          aria-label={onLightClick ? 'Dileği aç' : undefined}
          onClick={onLightClick ? () => onLightClick(light.id) : undefined}
          onKeyDown={
            onLightClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onLightClick(light.id)
                  }
                }
              : undefined
          }
          style={
            {
              '--wl-start-x': `${light.startX}%`,
              '--wl-start-y': `${light.startY}%`,
              '--wl-mid-x': `${light.midX}%`,
              '--wl-mid-y': `${light.midY}%`,
              '--wl-end-x': `${light.endX}%`,
              '--wl-end-y': `${light.endY}%`,
              '--wl-size': `${light.size}px`,
              '--wl-delay': `${light.delay.toFixed(2)}s`,
              '--wl-duration': `${light.duration.toFixed(2)}s`,
              '--wl-opacity': `${light.opacity.toFixed(3)}`,
              '--wl-drift': `${light.drift.toFixed(2)}px`,
              '--wl-wobble': `${light.wobble.toFixed(2)}px`,
              '--wl-phase': `${light.phase.toFixed(3)}rad`,
              '--wl-tone': `${light.tone.toFixed(3)}`,
            } as React.CSSProperties
          }
        >
          <i className="wish-overlay__core" />
          <i className="wish-overlay__halo" />
          {light.type === 'ascending' ? <i className="wish-overlay__trail" /> : null}
        </span>
      ))}
    </div>
  )
}
