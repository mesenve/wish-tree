import type { HTMLAttributes } from 'react'

type BannerVariant = 'rainbow' | 'normal'

type BannerProps = HTMLAttributes<HTMLDivElement> & {
  variant?: BannerVariant
  rainbowColors?: string[]
}

function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ')
}

export function Banner({
  variant = 'normal',
  rainbowColors = [
    'rgba(231,77,255,0.77)',
    'rgba(168,120,255,0.78)',
    'rgba(96,55,214,0.68)',
    'rgba(231,77,255,0.77)',
    'rgba(120,94,255,0.72)',
    'rgba(231,77,255,0.77)',
  ],
  className,
  children,
  ...props
}: BannerProps) {
  const gradient = `repeating-linear-gradient(72deg, ${[...rainbowColors, rainbowColors[0]]
    .map((color, i) => `${color} ${(i * 50) / rainbowColors.length}%`)
    .join(', ')})`

  return (
    <div className={cn('cta-banner', className)} {...props}>
      {variant === 'rainbow' ? (
        <span
          aria-hidden
          className="cta-banner__flow"
          style={{
            backgroundImage: gradient,
          }}
        />
      ) : null}
      <span className="cta-banner__text">{children}</span>
    </div>
  )
}
