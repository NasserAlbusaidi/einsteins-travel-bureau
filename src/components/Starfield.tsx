import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/motion'

interface Star {
  x: number
  y: number
  r: number
  phase: number
  speed: number
  depth: number
  hue: string
}

const HUES = ['#f4ead4', '#f4ead4', '#f4ead4', '#cfe3ff', '#ffe2b8', '#ffd0c2']

/**
 * The night sky behind the whole site: a fixed canvas of twinkling stars with
 * a little scroll parallax and the odd shooting star. Cheap: ~250 dots.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = prefersReducedMotion()
    let stars: Star[] = []
    let w = 0
    let h = 0
    let raf = 0
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(320, (w * h) / 5200))
      stars = Array.from({ length: count }, () => {
        const depth = Math.random()
        return {
          x: Math.random() * w,
          y: Math.random() * h * 1.6,
          r: depth > 0.92 ? 1.4 + Math.random() * 0.8 : 0.35 + depth * 0.9,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.6,
          depth,
          hue: HUES[Math.floor(Math.random() * HUES.length)]!,
        }
      })
      if (still) draw(0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const scroll = window.scrollY
      for (const s of stars) {
        const y = (((s.y - scroll * (0.02 + s.depth * 0.08)) % (h * 1.6)) + h * 1.6) % (h * 1.6)
        if (y > h + 4) continue
        const tw = still ? 0.8 : 0.55 + 0.45 * Math.sin(s.phase + t * 0.001 * s.speed)
        ctx.globalAlpha = tw * (0.35 + s.depth * 0.65)
        ctx.fillStyle = s.hue
        ctx.beginPath()
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
        if (s.r > 1.4) {
          // Big stars get a soft cross glint.
          ctx.globalAlpha *= 0.35
          ctx.fillRect(s.x - s.r * 3, y - 0.3, s.r * 6, 0.6)
          ctx.fillRect(s.x - 0.3, y - s.r * 3, 0.6, s.r * 6)
        }
      }
      if (shooting) {
        const { x, y, vx, vy, life } = shooting
        const grad = ctx.createLinearGradient(x, y, x - vx * 18, y - vy * 18)
        grad.addColorStop(0, 'rgba(255,240,210,0.9)')
        grad.addColorStop(1, 'rgba(255,240,210,0)')
        ctx.globalAlpha = Math.min(1, life)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - vx * 18, y - vy * 18)
        ctx.stroke()
        shooting.x += vx
        shooting.y += vy
        shooting.life -= 0.012
        if (shooting.life <= 0 || shooting.x > w + 100 || shooting.y > h + 100) shooting = null
      } else if (Math.random() < 0.0025) {
        shooting = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4, vx: 7, vy: 2.6, life: 1.2 }
      }
      ctx.globalAlpha = 1
    }

    const loop = (t: number) => {
      draw(t)
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    const onScroll = () => draw(performance.now())
    if (still) window.addEventListener('scroll', onScroll, { passive: true })
    else raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />
}
