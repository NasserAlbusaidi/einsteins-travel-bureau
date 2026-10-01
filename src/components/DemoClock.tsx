interface Props {
  /** Seconds per revolution of the hand. Bigger = slower clock. */
  period: number
  label: string
  tone?: 'ink' | 'terracotta' | 'blue'
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  ink: '#1a2332',
  terracotta: '#b5482d',
  blue: '#2c4c7c',
}

/** A little analogue clock whose hand spins at a given rate. Decorative. */
export function DemoClock({ period, label, tone = 'ink' }: Props) {
  const color = TONE[tone]
  return (
    <figure className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden>
        <circle cx="32" cy="32" r="29" fill="#f8f0dc" stroke={color} strokeWidth="3" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="32"
            y1="6"
            x2="32"
            y2={i % 3 === 0 ? 11 : 9}
            stroke={color}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            transform={`rotate(${i * 30} 32 32)`}
          />
        ))}
        <g className="demo-hand" style={{ animationDuration: `${period}s` }}>
          <line x1="32" y1="32" x2="32" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="32" cy="32" r="3" fill={color} />
      </svg>
      <figcaption className="text-xs text-center text-ink-light leading-tight max-w-[7rem]">{label}</figcaption>
    </figure>
  )
}
