export interface WarpStar {
  x: number
  y: number
  /** 0 = far and faint, 1 = near and bright. */
  z: number
}

export function makeWarpStars(n: number): WarpStar[] {
  return Array.from({ length: n }, () => ({ x: Math.random() * 1.2, y: Math.random(), z: Math.random() }))
}

/** Stars stream past faster, and stretch into streaks, as you speed up. */
export function drawWarp(canvas: HTMLCanvasElement | null, stars: WarpStar[], beta: number, dt: number) {
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== w * 2) {
    canvas.width = w * 2
    canvas.height = h * 2
  }
  ctx.setTransform(2, 0, 0, 2, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const speed = 0.04 + beta * 1.6
  const streak = 2 + beta * beta * 120
  for (const s of stars) {
    s.x -= dt * speed * (0.3 + s.z)
    if (s.x < -0.3) {
      s.x = 1 + Math.random() * 0.2
      s.y = Math.random()
    }
    const x = s.x * w
    const y = s.y * h
    const len = streak * (0.3 + s.z)
    const grad = ctx.createLinearGradient(x, y, x + len, y)
    grad.addColorStop(0, `rgba(244,234,212,${0.35 + s.z * 0.6})`)
    grad.addColorStop(1, 'rgba(244,234,212,0)')
    ctx.strokeStyle = grad
    ctx.lineWidth = 0.6 + s.z * 1.1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + len, y)
    ctx.stroke()
  }
}
