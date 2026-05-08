import { TREE_ORNAMENT_SLOTS_PCT } from './treeOrnamentSlots'

export const CANOPY_MERGE_PCT = { x: 50, y: 24 } as const

const EXTRA_ANCHORS: readonly { x: number; y: number }[] = [
  { x: 50, y: 70 },
  { x: 48, y: 74 },
  { x: 52, y: 74 },
  { x: 36, y: 58 },
  { x: 64, y: 58 },
  { x: 28, y: 44 },
  { x: 72, y: 44 },
  { x: 50, y: 32 },
  { x: 44, y: 20 },
  { x: 56, y: 20 },
  { x: 32, y: 24 },
  { x: 68, y: 24 },
]

export function anchorHash(i: number, salt: number): number {
  const t = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453123
  return t - Math.floor(t)
}

export function allBranchAnchors(): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  for (let i = 0; i < TREE_ORNAMENT_SLOTS_PCT.length; i++) {
    const p = TREE_ORNAMENT_SLOTS_PCT[i]
    const j = anchorHash(i, 1)
    out.push({ x: p.left, y: p.top })
    out.push({
      x: Math.min(96, Math.max(4, p.left + (j - 0.5) * 5)),
      y: Math.min(78, Math.max(14, p.top + 2.4 + j * 1.8)),
    })
  }
  for (const e of EXTRA_ANCHORS) {
    out.push({ x: e.x, y: e.y })
  }
  return out
}

export const ASCENDING_BRANCH_INDICES_DESKTOP = [0, 3, 7, 11, 16, 21] as const
export const ASCENDING_BRANCH_INDICES_MOBILE = [0, 5, 12] as const
