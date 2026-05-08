/**
 * TreeWishLights — canopy lights integrated with the Wish Tree stage.
 * ~70% static on branch anchors, ~20% drift toward canopy merge, few ascending wish orbs
 * from spread branch indices; cubic-bezier motion, soft trail, fade loop (no hard reset).
 */
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  allBranchAnchors,
  anchorHash,
  ASCENDING_BRANCH_INDICES_DESKTOP,
  ASCENDING_BRANCH_INDICES_MOBILE,
  CANOPY_MERGE_PCT,
} from '../constants/treeWishLightAnchors'
import './TreeWishLights.css'

export type TreeWishLightKind = 'static' | 'transition' | 'ascending'

export type TreeWishLightModel = {
  id: string
  kind: TreeWishLightKind
  startX: number
  startY: number
  midX: number
  midY: number
  endX: number
  endY: number
  sizePx: number
  delay: string
  duration: string
  opacityBase: number
  drift: number
  /** Ascending only: pixel offsets for keyframes (branch -> canopy -> sky). */
  o1x?: string
  o1y?: string
  o2x?: string
  o2y?: string
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n))
}

function buildModels(mobile: boolean): TreeWishLightModel[] {
  const anchors = allBranchAnchors()
  const nAnchors = anchors.length
  const ascIdx = mobile ? ASCENDING_BRANCH_INDICES_MOBILE : ASCENDING_BRANCH_INDICES_DESKTOP

  const total = mobile ? 30 : 46
  const nAsc = ascIdx.length
  const nTrans = Math.max(4, Math.round(total * 0.2))
  const nStatic = Math.max(0, total - nAsc - nTrans)

  const used = new Set<number>()
  ascIdx.forEach((i) => used.add(i < nAnchors ? i : i % nAnchors))

  const models: TreeWishLightModel[] = []
  let uid = 0
  const nextId = () => `twl-${uid++}`

  const pickUnused = (): number => {
    for (let k = 0; k < 400; k++) {
      const i = Math.floor(anchorHash(k + models.length, 9) * nAnchors)
      if (!used.has(i)) {
        used.add(i)
        return i
      }
    }
    return Math.floor(anchorHash(models.length, 8) * nAnchors)
  }

  for (let a = 0; a < nAsc; a++) {
    const idx = ascIdx[a] < nAnchors ? ascIdx[a] : ascIdx[a] % nAnchors
    const p = anchors[idx]
    const h = anchorHash(idx, 2)
    const mergeX = CANOPY_MERGE_PCT.x + (h - 0.5) * 6
    const mergeY = CANOPY_MERGE_PCT.y + (anchorHash(idx, 3) - 0.5) * 4
    const drift = (h - 0.5) * 14
    const endX = clamp(mergeX + drift * 0.55 + 6, 38, 62)
    const sx = 3.35
    const sy = 3.85
    const o1xN = (mergeX - p.x) * sx
    const o1yN = (mergeY - p.y) * sy
    const o1x = `${o1xN.toFixed(1)}px`
    const o1y = `${o1yN.toFixed(1)}px`
    const o2x = `${((endX - p.x) * sx + drift * 0.7).toFixed(1)}px`
    const o2y = `${(o1yN - 195 - h * 88).toFixed(1)}px`
    models.push({
      id: nextId(),
      kind: 'ascending',
      startX: p.x,
      startY: p.y,
      midX: mergeX,
      midY: mergeY,
      endX,
      endY: -6,
      sizePx: 3.2 + h * 2.4,
      delay: `${(a * 0.85 + h * 0.4).toFixed(2)}s`,
      duration: `${(11 + h * 5 + a * 0.6).toFixed(2)}s`,
      opacityBase: 0.55 + h * 0.25,
      drift,
      o1x,
      o1y,
      o2x,
      o2y,
    })
  }

  for (let t = 0; t < nTrans; t++) {
    const idx = pickUnused()
    const p = anchors[idx]
    const h = anchorHash(t, 4)
    const mx = CANOPY_MERGE_PCT.x + (h - 0.5) * 10
    const my = CANOPY_MERGE_PCT.y + (anchorHash(t, 5) - 0.5) * 8
    models.push({
      id: nextId(),
      kind: 'transition',
      startX: p.x,
      startY: p.y,
      midX: mx,
      midY: my,
      endX: mx,
      endY: my,
      sizePx: 2.4 + h * 2,
      delay: `${(t * 0.22 + h * 0.5).toFixed(2)}s`,
      duration: `${(7.5 + h * 4).toFixed(2)}s`,
      opacityBase: 0.35 + h * 0.28,
      drift: (h - 0.5) * 8,
    })
  }

  for (let s = 0; s < nStatic; s++) {
    const idx = pickUnused()
    const p = anchors[idx]
    const h = anchorHash(s, 6)
    models.push({
      id: nextId(),
      kind: 'static',
      startX: p.x,
      startY: p.y,
      midX: p.x,
      midY: p.y,
      endX: p.x,
      endY: p.y,
      sizePx: 1.8 + h * 2.6,
      delay: `${(h * 2.1 + s * 0.07).toFixed(2)}s`,
      duration: `${(2.4 + h * 1.8).toFixed(2)}s`,
      opacityBase: 0.28 + h * 0.35,
      drift: 0,
    })
  }

  return models
}

export type TreeWishLightsProps = {
  className?: string
}

export function TreeWishLights({ className }: TreeWishLightsProps) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => setMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const lights = useMemo(() => buildModels(mobile), [mobile])

  return (
    <div className={['tree-wish-lights', className].filter(Boolean).join(' ')} aria-hidden>
      {lights.map((L) => {
        const baseStyle: CSSProperties = {
          left: `${L.startX}%`,
          top: `${L.startY}%`,
          '--twl-delay': L.delay,
          '--twl-dur': L.duration,
          '--twl-size': `${L.sizePx}px`,
          '--twl-op': String(L.opacityBase),
        } as CSSProperties

        if (L.kind === 'static') {
          return (
            <div key={L.id} className="tree-wish-lights__node tree-wish-lights__node--static" style={baseStyle}>
              <span className="tree-wish-lights__core tree-wish-lights__core--static" />
            </div>
          )
        }

        if (L.kind === 'transition') {
          const st = {
            ...baseStyle,
            '--tx0': String(L.startX),
            '--ty0': String(L.startY),
            '--tx1': String(L.midX),
            '--ty1': String(L.midY),
            '--twl-drift': String(L.drift),
          } as CSSProperties
          return (
            <div key={L.id} className="tree-wish-lights__node tree-wish-lights__node--transition" style={st}>
              <span className="tree-wish-lights__core tree-wish-lights__core--transition" />
            </div>
          )
        }

        const st = {
          ...baseStyle,
          '--o1x': L.o1x,
          '--o1y': L.o1y,
          '--o2x': L.o2x,
          '--o2y': L.o2y,
        } as CSSProperties

        return (
          <div key={L.id} className="tree-wish-lights__node tree-wish-lights__node--ascending" style={st}>
            <span className="tree-wish-lights__trail" />
            <span className="tree-wish-lights__core tree-wish-lights__core--ascending" />
          </div>
        )
      })}
    </div>
  )
}
