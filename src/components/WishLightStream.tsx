import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import './WishLightStream.css'

export type WishLightDatum = {
  /** px offset from stream anchor (center); start */
  x0: number
  /** px at mid path (merge / sway) */
  x1: number
  /** px at top (meteor-lean right) */
  x2: number
  /** vertical travel multiplier for 1vh (e.g. 84 -> 84vh) */
  travelVh: number
  /** bottom offset % of overlay */
  originBottomPct: number
  delay: string
  duration: string
  sizePx: number
  scaleMin: number
  scaleMax: number
  scaleMid: number
  opacityPeak: number
  trailAngleDeg: number
  trailLengthPx: number
  /** gold-lavender mix 0-1 */
  hueMix: number
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n))
}

/** Deterministic pseudo-random from index (stable re-renders). */
function hash01(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function buildLightData(count: number): WishLightDatum[] {
  const out: WishLightDatum[] = []
  for (let i = 0; i < count; i++) {
    const h1 = hash01(i, 1)
    const h2 = hash01(i, 2)
    const h3 = hash01(i, 3)
    const h4 = hash01(i, 4)

    const branchRole = i % 11
    let x0: number
    if (branchRole === 0 || branchRole === 3) {
      x0 = -58 - h1 * 22
    } else if (branchRole === 6 || branchRole === 9) {
      x0 = 58 + h1 * 22
    } else {
      x0 = (h2 - 0.5) * 140
    }
    x0 = clamp(x0, -70, 70)

    const mergePull = 0.18 + h3 * 0.22
    const x1 = clamp(x0 * (1 - mergePull) + (h4 - 0.5) * 28, -42, 42)

    const meteorLean = 10 + h1 * 22
    const x2 = clamp(x1 * 0.35 + meteorLean + (h2 - 0.5) * 18, -28, 72)

    const travelVh = 76 + h3 * 18
    const originBottomPct = 11 + h4 * 9

    const duration = 2.55 + h1 * 1.35 + (i % 7) * 0.11
    const delay = i * 0.095 + (i % 5) * 0.14 + h2 * 0.35

    const sizePx = 2.8 + h3 * 5.5 + (i % 4) * 1.2
    const scaleMin = 0.72 + h1 * 0.2
    const scaleMax = 1.02 + h2 * 0.28
    const scaleMid = scaleMin * 0.45 + scaleMax * 0.55 + 0.04 * (h3 - 0.5)

    const opacityPeak = 0.42 + h4 * 0.48

    const trailAngleDeg = -6 + h2 * 14 + (i % 3) * 4
    const trailLengthPx = 18 + h3 * 36

    const hueMix = h4

    out.push({
      x0,
      x1,
      x2,
      travelVh,
      originBottomPct,
      delay: `${delay.toFixed(2)}s`,
      duration: `${duration.toFixed(2)}s`,
      sizePx,
      scaleMin,
      scaleMax,
      scaleMid,
      opacityPeak,
      trailAngleDeg,
      trailLengthPx,
      hueMix,
    })
  }
  return out
}

export type WishLightStreamProps = {
  className?: string
}

export function WishLightStream({ className }: WishLightStreamProps) {
  const [orbCount, setOrbCount] = useState(22)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => setOrbCount(mq.matches ? 11 : 22)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const lights = useMemo(() => buildLightData(orbCount), [orbCount])

  return (
    <div className={['wish-light-stream', className].filter(Boolean).join(' ')} aria-hidden>
      {lights.map((L, i) => (
        <div
          key={i}
          className="wish-light-stream__node"
          style={
            {
              '--wl-x0': String(L.x0),
              '--wl-x1': String(L.x1),
              '--wl-x2': String(L.x2),
              '--wl-travel': String(L.travelVh),
              '--wl-origin-bottom': `${L.originBottomPct}%`,
              '--wl-delay': L.delay,
              '--wl-duration': L.duration,
              '--wl-size': `${L.sizePx}px`,
              '--wl-scale-a': String(L.scaleMin),
              '--wl-scale-b': String(L.scaleMax),
              '--wl-scale-m': String(L.scaleMid),
              '--wl-scale-c': String(L.scaleMin * 0.92),
              '--wl-op-peak': String(L.opacityPeak),
              '--wl-trail-deg': `${L.trailAngleDeg}deg`,
              '--wl-trail-len': `${L.trailLengthPx}px`,
              '--wl-hue-mix': String(L.hueMix),
            } as CSSProperties
          }
        >
          <span className="wish-light-stream__trail" />
          <span className="wish-light-stream__core">
            <span className="wish-light-stream__glow" />
          </span>
        </div>
      ))}
    </div>
  )
}
