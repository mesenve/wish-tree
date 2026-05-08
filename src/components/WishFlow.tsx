import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { FAIRY_LIGHTS } from '../constants/fairyLights'
import type { Wish } from '../types'

const HeroCanvas = lazy(() => import('./HeroCanvas').then((m) => ({ default: m.HeroCanvas })))

type Step = 'write' | 'sending' | 'done'

type Props = {
  onClose: () => void
  onOpenWall: () => void
  addWish: (w: Wish) => void
}

const WISH_MAX_LEN = 200
const SEND_ANIMATION_MS = 5184
const SCAN_STAR_COUNT = 80
const SCAN_SPARK_COUNT = 360
const SCAN_SHARD_COUNT = 180

export function WishFlow({ onClose: _onClose, onOpenWall: _onOpenWall, addWish }: Props) {
  const [step, setStep] = useState<Step>('write')
  const [text, setText] = useState('')
  const [sendFxReady, setSendFxReady] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const canSend = text.trim().length >= 3 && text.length <= WISH_MAX_LEN
  const scanStars = useMemo(
    () =>
      Array.from({ length: SCAN_STAR_COUNT }, (_, i) => ({
        id: i,
        left: `${2 + ((i * 37) % 96)}%`,
        top: `${6 + ((i * 29) % 88)}%`,
        size: `${0.8 + (i % 4) * 0.38}px`,
        delay: `${(i % 18) * 0.08}s`,
      })),
    [],
  )
  const scanSparks = useMemo(
    () =>
      Array.from({ length: SCAN_SPARK_COUNT }, (_, i) => {
        const isStar = i % 3 === 0
        const spread = isStar ? 1.15 : 1
        return {
          id: i,
          kind: isStar ? ('star' as const) : ('dust' as const),
          left: `${1.5 + ((i * 17) % 97)}%`,
          size: isStar
            ? `${1.1 + (i % 4) * 0.55}px`
            : `${0.55 + (i % 6) * 0.22}px`,
          delay: `${(i % 20) * 0.045}s`,
          duration: `${0.42 + (i % 7) * 0.1}s`,
          driftX: `${(-28 + (i % 13) * 4.5) * spread}px`,
          driftY: `${(-14 + (i % 11) * 2.6) * spread}px`,
          rotate: `${(i * 47) % 180}deg`,
        }
      }),
    [],
  )

  /** Küçük yıldız parçacıkları — silinen kenarın “toz / chip” gibi parçalanması */
  const scanStarShards = useMemo(
    () =>
      Array.from({ length: SCAN_SHARD_COUNT }, (_, i) => {
        const row = i % 3
        const up = -(10 + (i % 11) * 3.4 + row * 2.2)
        const side = -42 + (i % 19) * 4.6
        const micro = i % 4 === 0
        return {
          id: i,
          left: `${0.4 + ((i * 23 + (i >> 2)) % 985) / 10}%`,
          size: micro
            ? `${0.45 + (i % 3) * 0.2}px`
            : `${0.75 + (i % 5) * 0.42}px`,
          delay: `${(i % 26) * 0.032}s`,
          duration: `${0.26 + (i % 6) * 0.08}s`,
          driftX: `${side}px`,
          driftY: `${up + (i % 5) * 0.9}px`,
          rotate: `${(i * 37) % 360}deg`,
        }
      }),
    [],
  )

  function startSend() {
    if (!text.trim()) return
    setStep('sending')
    setSendFxReady(false)
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    // Let the button/text state paint first, then mount heavy FX.
    window.setTimeout(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        setSendFxReady(true)
        rafRef.current = null
      })
    }, 120)
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      const wish: Wish = {
        id: crypto.randomUUID(),
        text: text.trim(),
        category: 'other',
        ritual: 'sky',
        createdAt: Date.now(),
      }
      addWish(wish)
      setStep('done')
      setSendFxReady(false)
    }, SEND_ANIMATION_MS + 250)
  }


  return (
    <div className="flow-page">
      <div className="landing-hero-bg" aria-hidden>
        <div className="landing-hero-bg-photo" />
        <div className="landing-hero-parallax-canvas">
          <Suspense fallback={<div className="hero-canvas hero-canvas-fallback" aria-hidden />}>
            <HeroCanvas />
          </Suspense>
        </div>
        <div className="landing-hero-gradient" />
        <div className="landing-fairy-lights">
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
        </div>
      </div>

      <div className="flow-page-content">
        <AnimatePresence mode="wait">
          {(step === 'write' || step === 'sending') && (
          <motion.section
            key="write"
            className={`flow-panel ${step === 'sending' ? 'flow-panel--sending' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={`flow-panel-surface ${step === 'sending' && sendFxReady ? 'flow-panel-surface--wiping' : ''}`}
            >
              <h2 className="flow-title">Whisper a little wish</h2>
              <p className="flow-hint">Leave a tiny note for the universe.</p>
              <label className="sr-only" htmlFor="wish-text">
                Wish text
              </label>
              <div className="flow-parchment-wrap">
                <textarea
                  id="wish-text"
                  className={`parchment ${step === 'sending' ? 'parchment--sending' : ''}`}
                  maxLength={WISH_MAX_LEN}
                  placeholder="A little luck. A little magic. A lot less stress…"
                  value={text}
                  disabled={step === 'sending'}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="flow-footer flow-footer--wish">
                <button
                  type="button"
                  className="btn btn-primary btn-send-sky"
                  disabled={!canSend || step === 'sending'}
                  onClick={startSend}
                >
                  {step === 'sending' ? (
                    'Sending...'
                  ) : (
                    'Make it glow'
                  )}
                </button>
              </div>
            </div>
            {step === 'sending' && sendFxReady && (
              <div className="send-scan-stage" aria-hidden>
                <div className="send-scan-card">
                  <div className="send-scan-stars">
                    {scanStars.map((s) => (
                      <span
                        key={s.id}
                        className="send-scan-star"
                        style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
                      />
                    ))}
                  </div>
                  <div className="send-scan-sweep">
                    <div className="send-scan-shards">
                      {scanStarShards.map((s) => (
                        <span
                          key={`shard-${s.id}`}
                          className={`send-scan-shard ${s.id % 4 === 0 ? 'send-scan-shard--micro' : ''}`}
                          style={{
                            left: s.left,
                            width: s.size,
                            height: s.size,
                            animationDelay: s.delay,
                            animationDuration: s.duration,
                            ['--spark-drift-x' as string]: s.driftX,
                            ['--spark-drift-y' as string]: s.driftY,
                            ['--spark-rot' as string]: s.rotate,
                          }}
                        />
                      ))}
                    </div>
                    <div className="send-scan-sparks">
                      {scanSparks.map((s) => (
                        <span
                          key={s.id}
                          className={`send-scan-spark ${s.kind === 'star' ? 'send-scan-spark--star' : ''}`}
                          style={{
                            left: s.left,
                            width: s.size,
                            height: s.size,
                            animationDelay: s.delay,
                            animationDuration: s.duration,
                            ['--spark-drift-x' as string]: s.driftX,
                            ['--spark-drift-y' as string]: s.driftY,
                            ['--spark-rot' as string]: s.rotate,
                          }}
                        />
                      ))}
                    </div>
                    <div className="send-scan-line" />
                  </div>
                </div>
              </div>
            )}
          </motion.section>
          )}

          {step === 'done' && (
          <motion.section
            key="done"
            className="flow-done-plain"
            initial={{ opacity: 0.18, filter: 'blur(3px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="flow-title">Your wish is on the way</h2>
            <p className="flow-hint">The universe got your message.</p>
          </motion.section>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
