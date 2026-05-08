import { useCallback, useEffect, useState } from 'react'
import type { Wish } from '../types'
import { DEMO_TOTAL_BASE, ensureSeedWishesOnDisk, saveWishes } from '../wishesStorage'

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>(() =>
    typeof window === 'undefined' ? [] : ensureSeedWishesOnDisk(),
  )

  useEffect(() => {
    setWishes(ensureSeedWishesOnDisk())
  }, [])

  const addWish = useCallback((wish: Wish) => {
    setWishes((prev) => {
      const next = [wish, ...prev]
      saveWishes(next)
      return next
    })
  }, [])

  const totalReported = DEMO_TOTAL_BASE + wishes.length
  const inUniverse = Math.min(9_999, 800 + wishes.length * 3)

  return { wishes, addWish, totalReported, inUniverse }
}
