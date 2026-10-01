import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../hooks/motion'

const DURATION_MS = 1500

/**
 * Rolls the number at the start of `text` up from zero when it first mounts
 * ("9.71 years" counts 0.00 → 9.71). Later changes show instantly, so dragging
 * a slider doesn't make the numbers swim. Remount (via `key`) to replay.
 */
export function CountUp({ text, delay = 0 }: { text: string; delay?: number }) {
  const [t, setT] = useState(() => (prefersReducedMotion() ? 1 : 0))

  useEffect(() => {
    if (t >= 1) return
    let raf = 0
    const start = performance.now() + delay
    const loop = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start) / DURATION_MS))
      setT(p)
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // Only on mount: later text changes are shown as-is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (t >= 1) return <>{text}</>
  const m = /^([\d,]+(?:\.(\d+))?)(.*)$/.exec(text)
  if (!m) return <>{text}</>
  const target = Number(m[1]!.replace(/,/g, ''))
  const decimals = m[2]?.length ?? 0
  const eased = 1 - (1 - t) ** 3
  const shown = (target * eased).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return <>{shown + m[3]}</>
}
