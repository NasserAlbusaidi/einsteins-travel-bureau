import { useId, useRef, useState } from 'react'
import Decimal from 'decimal.js'
import { ClockFace } from './art/ClockFace'
import { Ship } from './art/Ship'
import { drawWarp, makeWarpStars } from './art/warp'
import { useFrame } from '../hooks/motion'
import { percentOfLight } from '../humanize'

/** One turn of the home clock = one year at home, every few real seconds. */
const SECONDS_PER_YEAR = 2.6
const START = 0.22 // ≈ 87% of light speed: your clock at half speed.

/** Throttle position 0…1 → fraction of light speed. Each quarter adds a nine. */
function betaAt(p: number): number {
  return p <= 0 ? 0 : 1 - 10 ** (-4 * p)
}

/**
 * The hero's hands-on demo: two clocks, one throttle. Push it and watch your
 * clock fall behind your twin's. The counters keep score.
 */
export function TwinClocks() {
  const id = useId()
  const [p, setP] = useState(START)
  const beta = betaAt(p)
  const rate = Math.sqrt(1 - beta * beta)

  const homeHand = useRef<SVGGElement>(null)
  const youHand = useRef<SVGGElement>(null)
  const homeCount = useRef<HTMLSpanElement>(null)
  const youCount = useRef<HTMLSpanElement>(null)
  const gapCount = useRef<HTMLSpanElement>(null)
  const warp = useRef<HTMLCanvasElement>(null)
  const years = useRef({ home: 0, you: 0 })
  const [stars] = useState(() => makeWarpStars(70))

  useFrame((dt) => {
    const y = years.current
    y.home += dt / SECONDS_PER_YEAR
    y.you += (dt / SECONDS_PER_YEAR) * rate
    homeHand.current?.setAttribute('transform', `rotate(${(y.home % 1) * 360})`)
    youHand.current?.setAttribute('transform', `rotate(${(y.you % 1) * 360})`)
    if (homeCount.current) homeCount.current.textContent = y.home.toFixed(1)
    if (youCount.current) youCount.current.textContent = y.you.toFixed(1)
    if (gapCount.current) gapCount.current.textContent = (y.home - y.you).toFixed(1)
    drawWarp(warp.current, stars, beta, dt)
  })

  const reset = () => {
    years.current = { home: 0, you: 0 }
  }

  const slowdown = 1 / rate
  const verdict =
    beta === 0
      ? 'Standing still, both clocks tick together.'
      : rate > 0.995
        ? 'Barely any difference yet. Push harder.'
        : `For every year your twin lives, you live ${perYear(rate)}.`

  return (
    <div className="panel deco-frame p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="kicker">Try it · Push the throttle</span>
        <button type="button" onClick={reset} className="text-xs font-mono uppercase tracking-[0.2em] text-mist-400 hover:text-gold-300">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 mt-5">
        <Dial tone="home" handRef={homeHand} countRef={homeCount} title="Your twin" subtitle="at home" />
        <Dial tone="you" handRef={youHand} countRef={youCount} title="You" subtitle="on the ship" />
      </div>

      <div className="relative mt-5 h-16 rounded-xl overflow-hidden bg-night-950/70 ring-1 ring-inset ring-gold/15">
        <canvas ref={warp} className="absolute inset-0 w-full h-full" aria-hidden />
        <Ship className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 drop-shadow-[0_0_12px_rgba(255,123,84,0.6)]" />
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="text-sm font-medium text-mist-300">
            Ship speed
          </label>
          <output htmlFor={id} className="font-display text-2xl text-cream tabular-nums">
            {beta === 0 ? 'Parked' : `${percentOfLight(new Decimal(beta))} of light`}
          </output>
        </div>
        <input
          id={id}
          type="range"
          className="dial mt-1"
          min={0}
          max={1000}
          value={Math.round(p * 1000)}
          onChange={(e) => setP(Number(e.target.value) / 1000)}
          style={{ '--fill': `${p * 100}%` } as React.CSSProperties}
          aria-valuetext={beta === 0 ? 'Parked' : `${percentOfLight(new Decimal(beta))} of light speed`}
        />
        <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider text-mist-500 -mt-1">
          <span>Parked</span>
          <span>90%</span>
          <span>99%</span>
          <span>99.9%</span>
          <span>99.99%</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] items-center">
        <p className="text-mist-200 leading-snug" aria-live="polite">
          {verdict}
          {rate <= 0.995 ? (
            <span className="block text-sm text-mist-400 mt-0.5">
              Your clock runs {slowdown >= 1.995 ? `${trimNum(slowdown)}× slower` : `at ${Math.round(rate * 100)}% speed`}.
              You won’t feel a thing.
            </span>
          ) : null}
        </p>
        <div className="rounded-xl bg-you/10 ring-1 ring-inset ring-you/40 px-4 py-2 text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-you-300">You’re younger by</div>
          <div className="font-display text-2xl text-cream tabular-nums leading-tight">
            <span ref={gapCount}>0.0</span> <span className="text-base text-mist-300">yrs</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dial({
  tone,
  handRef,
  countRef,
  title,
  subtitle,
}: {
  tone: 'you' | 'home'
  handRef: React.Ref<SVGGElement>
  countRef: React.Ref<HTMLSpanElement>
  title: string
  subtitle: string
}) {
  const color = tone === 'you' ? 'text-you' : 'text-home'
  return (
    <figure className="flex flex-col items-center">
      <ClockFace tone={tone} handRef={handRef} className="w-full max-w-[180px]" />
      <figcaption className="mt-3 text-center">
        <div className={`font-display text-xl leading-tight ${color}`}>
          {title} <span className="text-mist-400 text-base italic">{subtitle}</span>
        </div>
        <div className="font-display text-3xl sm:text-4xl text-cream tabular-nums leading-tight mt-1">
          <span ref={countRef}>0.0</span>
          <span className="text-base text-mist-400 ml-1.5">years</span>
        </div>
      </figcaption>
    </figure>
  )
}

function perYear(rate: number): string {
  const days = rate * 365.25
  if (days >= 60) return `${trimNum(rate * 12)} months`
  if (days >= 14) return `${trimNum(days / 7)} weeks`
  if (days >= 2) return `${trimNum(days)} days`
  return `${trimNum(days * 24)} hours`
}

function trimNum(n: number): string {
  return n >= 10 ? Math.round(n).toLocaleString('en-US') : String(Number(n.toFixed(1)))
}
