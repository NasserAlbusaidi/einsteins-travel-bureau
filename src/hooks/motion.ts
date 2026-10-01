import { useEffect, useRef, useState } from 'react'

/** True when the visitor has asked the OS for less motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * Run `tick(dtSeconds)` every animation frame while mounted. The callback can
 * change between renders without restarting the loop. Pauses in hidden tabs
 * (the browser does that for us) and clamps big gaps so nothing jumps.
 */
export function useFrame(tick: (dt: number) => void, active = true): void {
  const ref = useRef(tick)
  useEffect(() => {
    ref.current = tick
  })
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      ref.current(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

/** Flips to true the first time the element scrolls into view, then stays true. */
export function useInView<T extends Element>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null)
  // No observer (old browser, tests): just show everything.
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, rootMargin])
  return [ref, seen] as const
}
