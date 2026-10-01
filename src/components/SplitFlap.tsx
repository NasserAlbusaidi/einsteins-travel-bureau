import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/motion'

const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-'"
const TICK_MS = 45

interface Props {
  text: string
  /** Pad or clip to this many characters so columns line up. */
  length?: number
  /** Hold the old letters until this flips true (e.g. when the board scrolls into view). */
  active?: boolean
  /** Extra ticks before this field starts settling, for a left-to-right ripple. */
  stagger?: number
  className?: string
  /** Colour for the letters, e.g. a status colour. */
  tone?: string
}

/**
 * A row of split-flap tiles, like an old airport departures board. Each tile
 * rattles through the drum and lands on its letter a beat after its neighbour.
 */
export function SplitFlap({ text, length, active = true, stagger = 0, className = '', tone }: Props) {
  const target = fit(text.toUpperCase(), length)
  const [shown, setShown] = useState(() => ' '.repeat(target.length))
  const [spinning, setSpinning] = useState<boolean[]>(() => Array(target.length).fill(false))
  const settled = useRef('')
  // With reduced motion the letters just appear: no rattling drum.
  const [still] = useState(prefersReducedMotion)

  useEffect(() => {
    if (!active || still || settled.current === target) return
    // Every tile gets a number of ticks to rattle for before it lands.
    const stops = Array.from(target, (_, i) => stagger + i * 0.9 + 4 + Math.random() * 6)
    let tick = 0
    const id = window.setInterval(() => {
      tick++
      let done = true
      const next: string[] = []
      const spin: boolean[] = []
      for (let i = 0; i < target.length; i++) {
        if (tick >= stops[i]!) {
          next.push(target[i]!)
          spin.push(false)
        } else {
          done = false
          next.push(tick < stagger ? ' ' : DRUM[Math.floor(Math.random() * DRUM.length)]!)
          spin.push(tick >= stagger)
        }
      }
      setShown(next.join(''))
      setSpinning(spin)
      if (done) {
        settled.current = target
        window.clearInterval(id)
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [target, active, stagger, still])

  return (
    <span className={`inline-flex whitespace-pre ${className}`}>
      <span className="sr-only">{text}</span>
      {Array.from(target, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`flap ${spinning[i] ? 'flap-spinning' : ''}`}
          style={tone ? { color: tone } : undefined}
        >
          {(still && active ? target[i] : shown[i]) ?? ' '}
        </span>
      ))}
    </span>
  )
}

function fit(s: string, length?: number): string {
  if (length === undefined) return s
  return s.length > length ? s.slice(0, length) : s.padEnd(length, ' ')
}
