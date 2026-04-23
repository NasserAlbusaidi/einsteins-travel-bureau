interface Props {
  children: React.ReactNode
  color?: 'red' | 'blue' | 'green' | 'ink' | 'terracotta'
  rotate?: number
  className?: string
  animate?: boolean
}

const COLOR_CLASSES: Record<NonNullable<Props['color']>, string> = {
  red: 'text-stamp-red border-stamp-red',
  blue: 'text-stamp-blue border-stamp-blue',
  green: 'text-stamp-green border-stamp-green',
  ink: 'text-ink border-ink',
  terracotta: 'text-terracotta-dark border-terracotta-dark',
}

/**
 * Rubber stamp styling — ink-smudged border, rotated, uppercase text.
 * Use for verdict badges, hazard ratings, and certification marks.
 */
export function Stamp({ children, color = 'red', rotate = -6, className = '', animate = false }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-display uppercase tracking-widest text-[11px] border-2 rounded-sm ${COLOR_CLASSES[color]} ${animate ? 'stamp-animate' : ''} ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, opacity: 0.92 }}
    >
      {children}
    </span>
  )
}
