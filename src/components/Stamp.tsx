interface Props {
  children: React.ReactNode
  color?: 'red' | 'you' | 'home' | 'gold' | 'ink'
  rotate?: number
  className?: string
  animate?: boolean
}

const COLORS: Record<NonNullable<Props['color']>, string> = {
  red: '#b3261e',
  you: '#c2471f',
  home: '#13786d',
  gold: '#8c6820',
  ink: '#161a33',
}

/** Rubber stamp: inked border, uneven coverage, slammed down at an angle. */
export function Stamp({ children, color = 'red', rotate = -6, className = '', animate = false }: Props) {
  return (
    <span
      className={`stamp ${animate ? 'stamp-animate' : ''} ${className}`}
      style={{ color: COLORS[color], transform: `rotate(${rotate}deg)`, '--rot': `${rotate}deg` } as React.CSSProperties}
    >
      {children}
    </span>
  )
}
