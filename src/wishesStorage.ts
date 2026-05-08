import type { Wish } from './types'
import { SEED_WISHES } from './seedWishes'

const STORAGE_KEY = 'hidrellez-dilek-agaci-v2'

/** İlk yüklemede seed dilekleri ekler (eksikse tamamlar). */
export function ensureSeedWishesOnDisk(): Wish[] {
  const existing = loadWishes()
  const seedById = new Map(SEED_WISHES.map((s) => [s.id, s]))
  const merged = existing.map((w) => seedById.get(w.id) ?? w)
  const have = new Set(merged.map((w) => w.id))
  const missing = SEED_WISHES.filter((s) => !have.has(s.id))
  if (missing.length > 0) merged.push(...missing)
  merged.sort((a, b) => b.createdAt - a.createdAt)
  const changed =
    missing.length > 0 ||
    merged.length !== existing.length ||
    merged.some((w, i) => {
      const prev = existing[i]
      return (
        !prev ||
        prev.id !== w.id ||
        prev.text !== w.text ||
        prev.category !== w.category ||
        prev.ritual !== w.ritual ||
        prev.createdAt !== w.createdAt
      )
    })
  if (!changed) return existing
  saveWishes(merged)
  return merged
}

export function loadWishes(): Wish[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isWish)
  } catch {
    return []
  }
}

export function saveWishes(wishes: Wish[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes))
}

function isWish(x: unknown): x is Wish {
  if (!x || typeof x !== 'object') return false
  const w = x as Record<string, unknown>
  return (
    typeof w.id === 'string' &&
    typeof w.text === 'string' &&
    typeof w.category === 'string' &&
    typeof w.ritual === 'string' &&
    typeof w.createdAt === 'number'
  )
}

export const DEMO_TOTAL_BASE = 124_600
