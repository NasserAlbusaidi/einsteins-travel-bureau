import { useId } from 'react'

interface Props {
  tone: 'you' | 'home'
  /** Ref to the hand group; the parent rotates it every frame. */
  handRef: React.Ref<SVGGElement>
  className?: string
}

const TONES = {
  you: { hand: '#ff7b54', glow: 'rgba(255,123,84,0.35)' },
  home: { hand: '#4fd1c5', glow: 'rgba(79,209,197,0.35)' },
}

/**
 * A Deco station clock. It has no clockwork of its own: the parent spins
 * `handRef` so two clocks can share one animation loop and stay honest.
 */
export function ClockFace({ tone, handRef, className = '' }: Props) {
  const t = TONES[tone]
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="-60 -60 120 120" className={className} aria-hidden>
      <defs>
        <radialGradient id={`face-${id}`} cx="0.5" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#1b2550" />
          <stop offset="1" stopColor="#090d20" />
        </radialGradient>
        <linearGradient id={`bezel-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d68e" />
          <stop offset="0.5" stopColor="#b88a2c" />
          <stop offset="1" stopColor="#f3d38a" />
        </linearGradient>
      </defs>
      <circle r="58" fill={t.glow} opacity="0.35" />
      <circle r="55" fill={`url(#face-${id})`} stroke={`url(#bezel-${id})`} strokeWidth="3" />
      <circle r="49" fill="none" stroke="#e3b04b" strokeOpacity="0.25" strokeWidth="0.75" />
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0
        return (
          <line
            key={i}
            x1="0"
            y1={-47}
            x2="0"
            y2={major ? -40 : -44}
            stroke={major ? '#f3d38a' : '#646e9f'}
            strokeWidth={major ? 2 : 0.8}
            strokeLinecap="round"
            transform={`rotate(${i * 6})`}
          />
        )
      })}
      {/* Deco sunburst in the middle of the dial. */}
      <g stroke="#e3b04b" strokeOpacity="0.12" strokeWidth="0.75">
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1="0" y1="-8" x2="0" y2="-30" transform={`rotate(${i * 15})`} />
        ))}
      </g>
      <g ref={handRef}>
        <line x1="0" y1="10" x2="0" y2="-42" stroke={t.hand} strokeWidth="2.6" strokeLinecap="round" />
        <circle cy="-34" r="3.4" fill="none" stroke={t.hand} strokeWidth="1.8" />
      </g>
      <circle r="4.5" fill={t.hand} />
      <circle r="1.6" fill="#090d20" />
    </svg>
  )
}
