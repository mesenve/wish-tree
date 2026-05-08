import { useState } from 'react'
import type { Wish } from '../types'
import { WishOverlayLights } from './WishOverlayLights'

type Props = {
  wishes: Wish[]
  onBack: () => void
}

type Doodle = {
  kind:
    | 'money-wing'
    | 'coin'
    | 'heart'
    | 'ring'
    | 'leaf'
    | 'spark'
    | 'rocket'
    | 'star'
    | 'house'
    | 'key'
    | 'moon'
    | 'bulb'
    | 'pencil'
  left: string
  top: string
  rotate: number
  size: number
}

function hashText(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function wishDoodles(text: string): Doodle[] {
  const t = text.toLocaleLowerCase('tr-TR')
  const byTopic: Array<{ keys: string[]; kinds: Doodle['kind'][] }> = [
    { keys: ['para', 'maddi', 'kısmet', 'zengin', 'maaş', 'borç'], kinds: ['money-wing', 'coin', 'spark', 'star'] },
    { keys: ['aşk', 'sevgi', 'evlilik', 'kalp', 'ilişki'], kinds: ['heart', 'ring', 'spark', 'star'] },
    { keys: ['sağlık', 'şifa', 'iyi', 'hast', 'ameliyat'], kinds: ['leaf', 'spark', 'moon', 'star'] },
    { keys: ['iş', 'kariyer', 'terfi', 'başarı', 'okul', 'sınav'], kinds: ['rocket', 'star', 'spark', 'pencil'] },
    { keys: ['ev', 'yuva', 'araba', 'taşın'], kinds: ['house', 'key', 'spark', 'star'] },
    { keys: ['ilham', 'üretken', 'yaratıc', 'sanat', 'tasarım', 'proje'], kinds: ['bulb', 'pencil', 'spark', 'star'] },
  ]
  const matched = byTopic.find((topic) => topic.keys.some((k) => t.includes(k)))
  const kinds = matched?.kinds ?? (['bulb', 'star', 'spark', 'moon'] as Doodle['kind'][])
  const seed = hashText(text)

  return kinds.map((kind, i) => ({
    kind,
    left: `${7 + i * 26 + ((seed >> (i * 2)) % 10)}%`,
    top: `${8 + (i % 2) * 63 + ((seed >> (i * 3 + 4)) % 8)}%`,
    rotate: -16 + i * 10 + ((seed >> (i * 4 + 8)) % 10),
    size: 34 + ((seed >> (i * 5 + 3)) % 14),
  }))
}

function DoodleIcon({ kind }: { kind: Doodle['kind'] }) {
  const common = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2.1 }
  switch (kind) {
    case 'money-wing':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M7.5 12.5h17a2.5 2.5 0 012.5 2.5v7.5a2.5 2.5 0 01-2.5 2.5h-17A2.5 2.5 0 015 22.5V15a2.5 2.5 0 012.5-2.5z" {...common} />
          <path d="M6.5 16.5h19M16 16.5v8M13 20.5h6M13.8 9.6h4.4a3.7 3.7 0 013.6 2.9M11.5 8.7c1.8-1 4.8-1.2 6.6-.2" {...common} />
          <path d="M3.8 11.5l2.1 1.2M27 11l1.9-1.3M4.2 24.7l2.2-.8M26.4 24.2l2.3.7" {...common} />
          <path d="M10 14.2c1.4-.8 3.5-1 5.1-.5M17.7 13.8c1.3.1 2.6.5 3.6 1.1" {...common} />
        </svg>
      )
    case 'coin':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <ellipse cx="16" cy="17" rx="8.8" ry="8.4" {...common} />
          <path d="M11.8 21.2c1.6 1 6 1.1 8.3-.1M12.5 12.4c1.4-.9 5.3-1.1 7.2 0M15.4 12v10" {...common} />
          <path d="M9.2 16h2M20.8 16h2M8.8 11.5l1.7 1M21.5 20.8l1.7 1" {...common} />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M7 9.5l1.8 1.3M24.8 8.5l1.7-1.2M6.6 21.5l2-.7" {...common} />
          <path d="M16 26s-9-5.4-9-11a5 5 0 019-3 5 5 0 019 3c0 5.6-9 11-9 11z" {...common} />
        </svg>
      )
    case 'ring':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <circle cx="16" cy="18" r="9.4" className="modal-doodle-accent" />
          <circle cx="16" cy="18" r="7" {...common} />
          <path d="M16 4l2.3 3.7L22 10l-3.7 2.3L16 16l-2.3-3.7L10 10l3.7-2.3z" {...common} />
        </svg>
      )
    case 'leaf':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M7 22c8 2 14-2 17-12-9-1-16 4-17 12zM9 20c3-2 7-4 12-7" {...common} />
        </svg>
      )
    case 'rocket':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M11.5 20.5l4.2-4.2c3-5 7.8-6.9 10.8-7-1 3-2.9 7.8-7.9 10.8l-4.1 4.1zM9.5 22.5l-2 5.6 5.6-2M15.1 17.1l3 3" {...common} />
          <path d="M20.5 10.8l1.2 1.2" {...common} />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M16 5l2.6 6.2L25 13l-4.8 4 1.4 6.4L16 20.2l-5.6 3.2L11.8 17 7 13l6.4-1.8z" {...common} />
        </svg>
      )
    case 'house':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <rect x="8.2" y="13.5" width="15.6" height="12" rx="2.8" className="modal-doodle-accent" />
          <path d="M6 15l10-8 10 8M9 14v11h14V14M14 25v-6h4v6" {...common} />
        </svg>
      )
    case 'key':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <circle cx="11" cy="16" r="4" {...common} />
          <path d="M15 16h11M22 16v3M25 16v2" {...common} />
        </svg>
      )
    case 'moon':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M21 6a10 10 0 101 19 9 9 0 01-1-19z" {...common} />
          <path d="M8.5 10.5l1.7 1M9.5 23l1.5-.6M23.8 21.6l1.7.8" {...common} />
        </svg>
      )
    case 'bulb':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M16 6c-4.2 0-7.6 3.2-7.6 7.2 0 2.8 1.6 4.7 3.3 6.1.8.7 1.3 1.6 1.5 2.5h5.6c.1-.9.6-1.8 1.4-2.5 1.8-1.5 3.5-3.4 3.5-6.3C23.7 9.2 20.2 6 16 6zM13.5 24h5M14.2 26h3.6M10.2 11.2l-1.8-1M21.8 11.2l1.8-1M16 3.8V2.2" {...common} />
        </svg>
      )
    case 'pencil':
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M7 24l2.6-6.8L20.4 6.4a2.1 2.1 0 013 0l2.2 2.2a2.1 2.1 0 010 3L14.8 22.4 8 25zM18.9 8l5.1 5.1M6.5 26.5h7.8" {...common} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 32 32" className="modal-doodle-svg">
          <path d="M16 7v18M7 16h18M10 10l12 12M22 10L10 22" {...common} />
        </svg>
      )
  }
}

export function WishWall({ wishes: _wishes, onBack }: Props) {
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)

  const pickWishByLight = (lightId: string) => {
    if (_wishes.length === 0) return
    let hash = 0
    for (let i = 0; i < lightId.length; i++) hash = (hash * 31 + lightId.charCodeAt(i)) >>> 0
    const next = _wishes[hash % _wishes.length]
    if (next) setSelectedWish(next)
  }

  return (
    <div className="wall-page">
      <div className="wall-hero-bg" aria-hidden />
      <div className="wall-stage-shell">
        <div className="wall-top-bar">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
            ← Geri dön
          </button>
        </div>

        <header className="wall-header wall-header--below-visual">
          <h2 className="wall-title">Dilek Ağacı</h2>
          <p className="wall-desc">Işıklara dokununca dilek metni açılır. Ağacı istersen sürükleyebilirsin.</p>
        </header>

        <div className="wall-scene">
          <WishOverlayLights onLightClick={pickWishByLight} />
          <p className="wall-tree-empty-note wall-tree-empty-note--top">
            Dilekler ağacın içinde parlıyor ve nefes alır gibi akıyor.
          </p>
        </div>
      </div>
      {selectedWish && (
        <div className="modal-backdrop" onClick={() => setSelectedWish(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-doodles" aria-hidden>
              {wishDoodles(selectedWish.text).map((d, i) => (
                <span
                  key={`${selectedWish.id}-doodle-${i}`}
                  className="modal-doodle"
                  style={{ left: d.left, top: d.top, transform: `rotate(${d.rotate}deg)`, width: `${d.size}px`, height: `${d.size}px` }}
                >
                  <DoodleIcon kind={d.kind} />
                </span>
              ))}
            </div>
            <p className="modal-text">{selectedWish.text}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelectedWish(null)}>
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
