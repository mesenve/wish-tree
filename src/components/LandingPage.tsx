import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FAIRY_LIGHTS } from '../constants/fairyLights'
import { Banner } from './ui/banner'

const HeroCanvas = lazy(() =>
  import('./HeroCanvas').then((m) => ({ default: m.HeroCanvas })),
)

type Props = {
  totalWishes: number
  inUniverse: number
  onStartWish: () => void
  onOpenWall: () => void
}

export function LandingPage({
  totalWishes,
  inUniverse,
  onStartWish,
  onOpenWall,
}: Props) {
  const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n)
  const animatedTotal = useAnimatedCount(totalWishes, 1300)
  const animatedUniverse = useAnimatedCount(inUniverse, 900)

  const namePool = useMemo(
    () => [
      'merve',
      'deniz',
      'aylin',
      'zeynep',
      'arda',
      'elif',
      'cem',
      'naz',
      'selin',
      'umut',
      'ece',
      'berk',
      'sena',
      'melis',
      'kaan',
    ],
    [],
  )
  const verbPool = useMemo(
    () => [
      'dilek bıraktı',
      'dileğini ağaca işledi',
      'gökyüzüne bir ışık gönderdi',
      'kalbinden bir niyet fısıldadı',
      'evrene bir dilek daha bıraktı',
      'dileğini geceye emanet etti',
    ],
    [],
  )
  const buildEvent = useCallback(() => {
    const name = namePool[Math.floor(Math.random() * namePool.length)]
    const verb = verbPool[Math.floor(Math.random() * verbPool.length)]
    const displayName = name.charAt(0).toUpperCase() + name.slice(1)
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: `${displayName} ${verb}`,
    }
  }, [namePool, verbPool])

  const [liveEvents, setLiveEvents] = useState(() => [buildEvent(), buildEvent(), buildEvent(), buildEvent()])

  const reduceMotion = useReducedMotion()
  const pauseParallax = useRef(false)
  pauseParallax.current = reduceMotion === true
  const { scrollY } = useScroll()
  const yBgPhoto = useTransform(scrollY, (y) => y * (pauseParallax.current ? 0 : 0.14))
  const yCanvasLayer = useTransform(scrollY, (y) => y * (pauseParallax.current ? 0 : 0.22))
  const yFrontLayer = useTransform(scrollY, (y) => y * (pauseParallax.current ? 0 : 0.3))
  const yMain = useTransform(scrollY, (y) => y * (pauseParallax.current ? 0 : -0.07))

  useEffect(() => {
    const timers: number[] = []
    const baseDelay = 3600

    const scheduleSlot = (slot: number, delay: number) => {
      const tick = () => {
        setLiveEvents((prev) => {
          const next = [...prev]
          next[slot] = buildEvent()
          return next
        })
        timers[slot] = window.setTimeout(tick, delay)
      }
      timers[slot] = window.setTimeout(tick, delay)
    }

    scheduleSlot(0, baseDelay + 400)
    scheduleSlot(1, baseDelay + 900)
    scheduleSlot(2, baseDelay + 1400)
    scheduleSlot(3, baseDelay + 1900)

    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [buildEvent])

  return (
    <div className="landing">
      <div className="landing-hero-bg">
        <motion.div aria-hidden className="landing-hero-bg-photo" style={{ y: yBgPhoto }} />
        <motion.div className="landing-hero-parallax-canvas" style={{ y: yCanvasLayer }}>
          <Suspense fallback={<div className="hero-canvas hero-canvas-fallback" aria-hidden />}>
            <HeroCanvas />
          </Suspense>
        </motion.div>
        <motion.div className="landing-hero-gradient" style={{ y: yFrontLayer }} />
        <motion.div className="landing-fairy-lights" aria-hidden style={{ y: yFrontLayer }}>
          {FAIRY_LIGHTS.map((dot, i) => (
            <span
              key={i}
              className="landing-fairy-light"
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
                animationDelay: `${dot.delay}s`,
                animationDuration: `${dot.duration}s`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.main className="landing-main" style={{ y: yMain }}>
        <motion.div
          className="glass-stats glass-stats--above-title"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.06, type: 'spring', stiffness: 120, damping: 18 }}
        >
          <div className="glass-stat">
            <span className="glass-stat-icon" aria-hidden>
              ★
            </span>
            <div>
              <div className="glass-stat-label">Toplam bırakılan dilek</div>
              <div className="glass-stat-value">{fmt(animatedTotal)}</div>
            </div>
          </div>
          <div className="glass-divider" />
          <div className="glass-stat">
            <span className="glass-stat-icon dim" aria-hidden>
              ✧
            </span>
            <div>
              <div className="glass-stat-label">Canlı ritüel</div>
              <div className="glass-stat-value gold">Şu anda {fmt(animatedUniverse)} dilek yükseliyor ✨</div>
            </div>
          </div>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          Hıdrellez'de dileğini göğe emanet et
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34 }}
        >
          Bu gece dileğini bırak; gökyüzünde yükselen ışıkların arasına katılsın.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
        >
          <button type="button" className="btn btn-primary" onClick={onStartWish}>
            <Banner
              variant="rainbow"
              className="cta-banner--button"
              rainbowColors={[
                'rgba(231,77,255,0.77)',
                'rgba(170,113,255,0.82)',
                'rgba(82,46,186,0.7)',
                'rgba(231,77,255,0.77)',
                'rgba(125,96,255,0.74)',
                'rgba(231,77,255,0.77)',
              ]}
            >
              <span className="btn-sparkle">✦</span> Dileğini bırak
            </Banner>
          </button>
          <button type="button" className="btn btn-ghost" onClick={onOpenWall}>
            Dilek Ağacı
          </button>
        </motion.div>
      </motion.main>

      <div className="collective-feed side-feed" aria-hidden>
        <AnimatePresence initial={false}>
          {liveEvents.map((event, i) => (
            <motion.div
              key={event.id}
              className={`collective-item p${i + 1}`}
              initial={{ opacity: 0, y: 24, scale: 0.99, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, scale: 0.995, filter: 'blur(6px)' }}
              transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {event.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function useAnimatedCount(target: number, durationMs = 900) {
  const [value, setValue] = useState(target)

  useEffect(() => {
    const from = value
    const diff = target - from
    if (diff === 0) return
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + diff * eased))
      if (p < 1) raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [target])

  return value
}
