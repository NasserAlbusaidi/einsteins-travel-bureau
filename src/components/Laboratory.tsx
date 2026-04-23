import { useEffect, useMemo, useRef, useState } from 'react'
import Decimal from 'decimal.js'
import {
  lorentzFactor,
  properTimeRate,
} from '../physics/relativity'
import {
  C,
  EARTH_MASS,
  EARTH_RADIUS,
  ISS_ORBITAL_RADIUS,
  ISS_ORBITAL_VELOCITY,
  JULIAN_YEAR_SECONDS,
  SUN_MASS,
} from '../physics/constants'
import {
  formatGamma,
  formatLength,
  formatTime,
  formatVelocity,
} from '../format'
import { LogSlider } from './LogSlider'

type ObserverColor = 'terracotta' | 'blue' | 'olive' | 'mustard' | 'plum'

interface LabObserver {
  id: string
  label: string
  color: ObserverColor
  velocity: Decimal
  radius: Decimal
}

interface ObserverPalette {
  hex: string
  ring: string
  fill: string
  text: string
  chip: string
}

const OBSERVER_PALETTES: Record<ObserverColor, ObserverPalette> = {
  terracotta: {
    hex: '#b5482d',
    ring: 'border-terracotta',
    fill: 'bg-terracotta',
    text: 'text-terracotta-dark',
    chip: 'bg-terracotta/10 border-terracotta text-terracotta-dark',
  },
  blue: {
    hex: '#2c4c7c',
    ring: 'border-stamp-blue',
    fill: 'bg-stamp-blue',
    text: 'text-stamp-blue',
    chip: 'bg-stamp-blue/10 border-stamp-blue text-stamp-blue',
  },
  olive: {
    hex: '#6b7043',
    ring: 'border-olive',
    fill: 'bg-olive',
    text: 'text-olive-dark',
    chip: 'bg-olive/10 border-olive text-olive-dark',
  },
  mustard: {
    hex: '#a07d2e',
    ring: 'border-mustard-dark',
    fill: 'bg-mustard-dark',
    text: 'text-mustard-dark',
    chip: 'bg-mustard/20 border-mustard-dark text-mustard-dark',
  },
  plum: {
    hex: '#704050',
    ring: 'border-[#704050]',
    fill: 'bg-[#704050]',
    text: 'text-[#4e2a38]',
    chip: 'bg-[#704050]/10 border-[#704050] text-[#4e2a38]',
  },
}

const COLOR_ORDER: ObserverColor[] = ['blue', 'terracotta', 'olive', 'mustard', 'plum']

interface MassPreset {
  id: string
  label: string
  value: Decimal
  hint: string
}

const MASS_PRESETS: MassPreset[] = [
  { id: 'flat', label: 'Flat space', value: new Decimal(0), hint: 'No gravity — pure special relativity' },
  { id: 'earth', label: 'Earth', value: EARTH_MASS, hint: 'Radii like surface, ISS, GPS' },
  { id: 'sun', label: 'The Sun', value: SUN_MASS, hint: 'Set radii in AU; 1 AU ≈ 1.496e11 m' },
  { id: 'sgr-a', label: 'Sgr A* (Milky Way core)', value: SUN_MASS.times('4.15e6'), hint: '4.15M solar masses' },
  { id: 'gargantua', label: 'Gargantua (108 M☉)', value: SUN_MASS.times('1e8'), hint: 'Interstellar-class supermassive' },
]

const VELOCITY_MIN = new Decimal('1e-3')
const VELOCITY_MAX = C.times('0.9999')
const RADIUS_MIN = new Decimal('1')
const RADIUS_MAX = new Decimal('1e25')
const DURATION_MIN = new Decimal('1')
const DURATION_MAX = new Decimal('1e12')

function makeId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function defaultObservers(): LabObserver[] {
  return [
    {
      id: makeId(),
      label: 'Home',
      color: 'blue',
      velocity: new Decimal(0),
      radius: EARTH_RADIUS,
    },
    {
      id: makeId(),
      label: 'Orbiter',
      color: 'terracotta',
      velocity: ISS_ORBITAL_VELOCITY,
      radius: ISS_ORBITAL_RADIUS,
    },
    {
      id: makeId(),
      label: 'Cruiser',
      color: 'olive',
      velocity: C.times('0.5'),
      radius: new Decimal('1e20'),
    },
  ]
}

function nextLabel(observers: LabObserver[]): string {
  const candidates = ['Home', 'Orbiter', 'Cruiser', 'Diver', 'Voyager', 'Lurker', 'Marauder']
  const used = new Set(observers.map((o) => o.label))
  for (const c of candidates) if (!used.has(c)) return c
  return `Observer ${observers.length + 1}`
}

function nextColor(observers: LabObserver[]): ObserverColor {
  const used = new Set(observers.map((o) => o.color))
  for (const c of COLOR_ORDER) if (!used.has(c)) return c
  return COLOR_ORDER[observers.length % COLOR_ORDER.length]!
}

interface ObserverResult {
  rate: Decimal | null
  gamma: Decimal | null
  properTime: Decimal | null
  error: string | null
}

export function Laboratory() {
  const [observers, setObservers] = useState<LabObserver[]>(defaultObservers)
  const [massPresetId, setMassPresetId] = useState<string>('flat')
  const [duration, setDuration] = useState<Decimal>(JULIAN_YEAR_SECONDS)
  const [homeId, setHomeId] = useState<string>(() => observers[0]!.id)

  const massPreset = MASS_PRESETS.find((p) => p.id === massPresetId) ?? MASS_PRESETS[0]!
  const mass = massPreset.value

  const results: Record<string, ObserverResult> = useMemo(() => {
    const out: Record<string, ObserverResult> = {}
    for (const o of observers) {
      try {
        const rate = properTimeRate({ velocity: o.velocity, radius: o.radius, mass })
        const gamma = lorentzFactor(o.velocity)
        const properTime = rate.times(duration)
        out[o.id] = { rate, gamma, properTime, error: null }
      } catch (e) {
        out[o.id] = {
          rate: null,
          gamma: null,
          properTime: null,
          error: (e as Error).message,
        }
      }
    }
    return out
  }, [observers, mass, duration])

  const maxRate = useMemo(() => {
    let best = new Decimal(0)
    for (const r of Object.values(results)) {
      if (r.rate && r.rate.gt(best)) best = r.rate
    }
    return best.isZero() ? new Decimal(1) : best
  }, [results])

  const homeResult = results[homeId] ?? null

  const updateObserver = (id: string, patch: Partial<LabObserver>) => {
    setObservers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const addObserver = () => {
    if (observers.length >= 5) return
    const o: LabObserver = {
      id: makeId(),
      label: nextLabel(observers),
      color: nextColor(observers),
      velocity: new Decimal('1e6'),
      radius: new Decimal('1e20'),
    }
    setObservers([...observers, o])
  }

  const removeObserver = (id: string) => {
    if (observers.length <= 1) return
    const next = observers.filter((o) => o.id !== id)
    setObservers(next)
    if (homeId === id) setHomeId(next[0]!.id)
  }

  const resetExperiment = () => {
    const fresh = defaultObservers()
    setObservers(fresh)
    setHomeId(fresh[0]!.id)
    setMassPresetId('flat')
    setDuration(JULIAN_YEAR_SECONDS)
  }

  return (
    <section className="paper-card p-6">
      <header className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-softer">
            Section V — The Laboratory
          </div>
          <h2 className="font-display text-3xl text-ink mt-0.5">Multi-Observer Workbench</h2>
          <p className="text-sm text-ink-light italic mt-1 max-w-2xl">
            Place up to five observers in a common gravity well. Spin the dials and watch
            their wristwatches diverge in real time. No trip, no destination — just physics
            misbehaving.
          </p>
        </div>
        <button
          type="button"
          onClick={resetExperiment}
          className="stamp-rect text-ink-light border-ink/30 hover:text-ink hover:border-ink bg-paper-light transition-colors"
        >
          Reset Bench
        </button>
      </header>

      <GlobalControls
        massPresetId={massPresetId}
        setMassPresetId={setMassPresetId}
        massHint={massPreset.hint}
        duration={duration}
        setDuration={setDuration}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {observers.map((o) => (
          <ObserverCard
            key={o.id}
            observer={o}
            result={results[o.id]!}
            isHome={o.id === homeId}
            homeResult={homeResult}
            canDelete={observers.length > 1}
            onChange={(patch) => updateObserver(o.id, patch)}
            onSetHome={() => setHomeId(o.id)}
            onRemove={() => removeObserver(o.id)}
          />
        ))}
        {observers.length < 5 ? (
          <button
            type="button"
            onClick={addObserver}
            className="min-h-[220px] rounded-sm border-2 border-dashed border-ink/30 bg-paper-light/40 hover:border-ink hover:bg-paper-light transition-colors flex flex-col items-center justify-center gap-2 font-display uppercase tracking-widest text-sm text-ink-softer hover:text-ink"
          >
            <span className="text-4xl leading-none">+</span>
            <span>Add Observer</span>
            <span className="text-[10px] italic normal-case tracking-normal">{5 - observers.length} slots left</span>
          </button>
        ) : null}
      </div>

      <ClockRace observers={observers} results={results} maxRate={maxRate} />

      <AgingStrip observers={observers} results={results} duration={duration} homeId={homeId} />
    </section>
  )
}

interface GlobalControlsProps {
  massPresetId: string
  setMassPresetId: (id: string) => void
  massHint: string
  duration: Decimal
  setDuration: (d: Decimal) => void
}

function GlobalControls({
  massPresetId,
  setMassPresetId,
  massHint,
  duration,
  setDuration,
}: GlobalControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-paper-light/60 border-2 border-ink/20 rounded-sm p-4">
        <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer mb-2">
          Gravity Well (shared)
        </div>
        <select
          value={massPresetId}
          onChange={(e) => setMassPresetId(e.target.value)}
          className="w-full rounded-sm border-2 border-ink/30 bg-paper-light px-3 py-2 text-sm text-ink focus:border-terracotta focus:outline-none"
        >
          {MASS_PRESETS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[11px] text-ink-softer italic">{massHint}</p>
      </div>
      <div className="bg-paper-light/60 border-2 border-ink/20 rounded-sm p-4 flex flex-col gap-2">
        <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer">
          Coordinate Time Window
        </div>
        <LogSlider
          label="Run experiment for"
          value={duration}
          onChange={setDuration}
          min={DURATION_MIN}
          max={DURATION_MAX}
          format={formatTime}
        />
      </div>
    </div>
  )
}

interface ObserverCardProps {
  observer: LabObserver
  result: ObserverResult
  isHome: boolean
  homeResult: ObserverResult | null
  canDelete: boolean
  onChange: (patch: Partial<LabObserver>) => void
  onSetHome: () => void
  onRemove: () => void
}

function ObserverCard({
  observer,
  result,
  isHome,
  homeResult,
  canDelete,
  onChange,
  onSetHome,
  onRemove,
}: ObserverCardProps) {
  const palette = OBSERVER_PALETTES[observer.color]
  const gammaText = result.gamma ? formatGamma(result.gamma) : '—'
  const rateText =
    result.rate !== null ? `${result.rate.toFixed(10)} s/s` : '—'

  let delta: Decimal | null = null
  if (result.properTime && homeResult?.properTime && !isHome) {
    delta = result.properTime.minus(homeResult.properTime)
  }

  return (
    <article
      className={`relative rounded-sm border-2 ${palette.ring} bg-paper-light/80 p-4 pt-5 flex flex-col gap-3 ${
        isHome ? 'ring-2 ring-offset-2 ring-offset-paper ring-ink/30' : ''
      }`}
    >
      <div className={`absolute -top-2.5 left-4 px-2 bg-paper-light font-display uppercase tracking-widest text-[11px] ${palette.text}`}>
        {observer.label}
      </div>
      <div className="flex items-start justify-between gap-2">
        <input
          type="text"
          value={observer.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className={`font-display text-lg bg-transparent ${palette.text} border-b border-dashed border-ink/20 focus:border-ink focus:outline-none px-0.5 w-40`}
          aria-label="Observer name"
        />
        <div className="flex items-center gap-1.5">
          {isHome ? (
            <span className="stamp-rect text-[9px] border-ink text-ink bg-paper-dark/40">Home</span>
          ) : (
            <button
              type="button"
              onClick={onSetHome}
              className="text-[10px] uppercase tracking-widest font-display border border-ink/20 rounded-sm px-2 py-0.5 text-ink-softer hover:text-ink hover:border-ink transition-colors"
            >
              Set as home
            </button>
          )}
          {canDelete ? (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${observer.label}`}
              className="text-ink-softer hover:text-terracotta-dark text-lg leading-none px-1.5 py-0.5 border border-transparent hover:border-terracotta rounded-sm transition-colors"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {COLOR_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ color: c })}
            aria-label={`Color ${c}`}
            className={`w-5 h-5 rounded-full border-2 transition-transform ${
              observer.color === c ? 'border-ink scale-110' : 'border-ink/20 hover:border-ink/60'
            }`}
            style={{ backgroundColor: OBSERVER_PALETTES[c].hex }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 mt-1">
        <LogSlider
          label="Velocity"
          value={observer.velocity.abs().lt(VELOCITY_MIN) ? VELOCITY_MIN : observer.velocity.abs()}
          onChange={(v) => onChange({ velocity: v })}
          min={VELOCITY_MIN}
          max={VELOCITY_MAX}
          format={formatVelocity}
          secondary={(v) => `β = ${v.div(C).toExponential(3)}`}
        />
        <LogSlider
          label="Radius from center of mass"
          value={observer.radius.lt(RADIUS_MIN) ? RADIUS_MIN : observer.radius}
          onChange={(r) => onChange({ radius: r })}
          min={RADIUS_MIN}
          max={RADIUS_MAX}
          format={formatLength}
        />
      </div>

      {result.error ? (
        <div className="mt-1 text-[11px] text-terracotta-dark italic border-t border-dashed border-terracotta/40 pt-2">
          ⚠ {result.error}
        </div>
      ) : (
        <dl className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-ink/20 font-mono text-[11px]">
          <div>
            <dt className="text-[9px] uppercase tracking-widest text-ink-softer">γ</dt>
            <dd className={`tabular-nums ${palette.text} text-xs`}>{gammaText}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-widest text-ink-softer">dτ/dt</dt>
            <dd className={`tabular-nums ${palette.text} text-xs`}>{rateText}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-widest text-ink-softer">
              {isHome ? 'Ages' : 'Δ vs home'}
            </dt>
            <dd className={`tabular-nums ${palette.text} text-xs`}>
              {isHome
                ? result.properTime
                  ? formatTime(result.properTime)
                  : '—'
                : delta
                ? `${delta.isNegative() ? '' : '+'}${formatTime(delta)}`
                : '—'}
            </dd>
          </div>
        </dl>
      )}
    </article>
  )
}

interface ClockRaceProps {
  observers: LabObserver[]
  results: Record<string, ObserverResult>
  maxRate: Decimal
}

function ClockRace({ observers, results, maxRate }: ClockRaceProps) {
  const [running, setRunning] = useState(true)
  const [phase, setPhase] = useState(0) // radians for the fastest clock
  const lastRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) {
      lastRef.current = null
      return
    }
    let frame = 0
    const loop = (t: number) => {
      if (lastRef.current === null) lastRef.current = t
      const dt = (t - lastRef.current) / 1000
      lastRef.current = t
      setPhase((p) => p + dt * 0.8 * Math.PI) // fastest clock: one revolution per ~2.5s
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [running])

  const reset = () => {
    setPhase(0)
    lastRef.current = null
  }

  return (
    <div className="mt-8 border-t-2 border-ink/10 pt-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-3">
        <div>
          <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer">
            The Clock Race
          </div>
          <p className="text-xs text-ink-light italic mt-0.5">
            Every clock ticks at its own proper-time rate. The fastest dial tracks coordinate time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="stamp-rect text-stamp-blue border-stamp-blue bg-paper-light hover:bg-paper-dark/30 transition-colors"
          >
            {running ? 'Pause' : 'Run'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="stamp-rect text-ink-light border-ink/30 bg-paper-light hover:border-ink hover:text-ink transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {observers.map((o) => {
          const r = results[o.id]
          if (!r || r.rate === null) {
            return (
              <ClockFace
                key={o.id}
                label={o.label}
                color={OBSERVER_PALETTES[o.color].hex}
                ratio={0}
                phase={0}
                sublabel="undefined"
              />
            )
          }
          const ratio = maxRate.isZero()
            ? 0
            : Number(r.rate.div(maxRate).toFixed(6))
          const rateSub = r.rate.toFixed(8)
          return (
            <ClockFace
              key={o.id}
              label={o.label}
              color={OBSERVER_PALETTES[o.color].hex}
              ratio={ratio}
              phase={phase}
              sublabel={`dτ/dt = ${rateSub}`}
            />
          )
        })}
      </div>
    </div>
  )
}

interface ClockFaceProps {
  label: string
  color: string
  ratio: number
  phase: number
  sublabel: string
}

function ClockFace({ label, color, ratio, phase, sublabel }: ClockFaceProps) {
  const size = 92
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 6
  const angle = phase * ratio - Math.PI / 2
  const hx = cx + Math.cos(angle) * (radius * 0.82)
  const hy = cy + Math.sin(angle) * (radius * 0.82)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    const r1 = radius - 2
    const r2 = radius - (i % 3 === 0 ? 8 : 5)
    return {
      x1: cx + Math.cos(a) * r1,
      y1: cy + Math.sin(a) * r1,
      x2: cx + Math.cos(a) * r2,
      y2: cy + Math.sin(a) * r2,
      bold: i % 3 === 0,
    }
  })

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${label} clock`}
      >
        <circle cx={cx} cy={cy} r={radius} fill="#f8f0dc" stroke="#1a2332" strokeWidth={1.5} />
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="#1a2332"
            strokeWidth={t.bold ? 1.5 : 0.75}
            opacity={t.bold ? 0.9 : 0.5}
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={hx}
          y2={hy}
          stroke={color}
          strokeWidth={2.25}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={2.25} fill={color} />
      </svg>
      <div className="font-display text-[11px] uppercase tracking-widest" style={{ color }}>
        {label}
      </div>
      <div className="font-mono text-[9px] text-ink-softer tabular-nums">{sublabel}</div>
    </div>
  )
}

interface AgingStripProps {
  observers: LabObserver[]
  results: Record<string, ObserverResult>
  duration: Decimal
  homeId: string
}

function AgingStrip({ observers, results, duration, homeId }: AgingStripProps) {
  // Find max proper time for scale
  const maxProper = useMemo(() => {
    let best = new Decimal(0)
    for (const r of Object.values(results)) {
      if (r.properTime && r.properTime.gt(best)) best = r.properTime
    }
    return best.isZero() ? new Decimal(1) : best
  }, [results])

  const coordWidth = Number(duration.div(maxProper).toFixed(6))

  return (
    <div className="mt-6 border-t-2 border-ink/10 pt-5">
      <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer mb-2">
        Accumulated Proper Time
      </div>
      <p className="text-xs text-ink-light italic mb-3">
        Each bar is how much each observer's wristwatch advanced while coordinate time ran
        for {formatTime(duration)}. Dashed line shows coordinate time for comparison.
      </p>
      <div className="flex flex-col gap-2.5">
        <BarRow
          label="Coordinate"
          sublabel="the bureau's reference clock"
          color="#1a2332"
          widthFrac={Math.min(1, coordWidth)}
          value={formatTime(duration)}
          delta={null}
          isHome={false}
          dashed
        />
        {observers.map((o) => {
          const r = results[o.id]!
          if (!r.properTime) {
            return (
              <BarRow
                key={o.id}
                label={o.label}
                sublabel={r.error ?? 'invalid'}
                color={OBSERVER_PALETTES[o.color].hex}
                widthFrac={0}
                value="—"
                delta={null}
                isHome={o.id === homeId}
              />
            )
          }
          const frac = Number(r.properTime.div(maxProper).toFixed(6))
          const homeProper = results[homeId]?.properTime ?? null
          const delta =
            o.id === homeId || homeProper === null
              ? null
              : r.properTime.minus(homeProper)
          return (
            <BarRow
              key={o.id}
              label={o.label}
              sublabel={`γ = ${r.gamma ? formatGamma(r.gamma) : '—'}`}
              color={OBSERVER_PALETTES[o.color].hex}
              widthFrac={Math.min(1, frac)}
              value={formatTime(r.properTime)}
              delta={delta}
              isHome={o.id === homeId}
            />
          )
        })}
      </div>
    </div>
  )
}

interface BarRowProps {
  label: string
  sublabel: string
  color: string
  widthFrac: number
  value: string
  delta: Decimal | null
  isHome: boolean
  dashed?: boolean
}

function BarRow({
  label,
  sublabel,
  color,
  widthFrac,
  value,
  delta,
  isHome,
  dashed,
}: BarRowProps) {
  return (
    <div className="grid grid-cols-[140px_1fr_auto] gap-3 items-center">
      <div className="min-w-0">
        <div className="font-display text-xs truncate" style={{ color }}>
          {label} {isHome ? <span className="text-ink-softer italic text-[10px]">· home</span> : null}
        </div>
        <div className="text-[10px] text-ink-softer italic truncate">{sublabel}</div>
      </div>
      <div className="relative h-5 bg-paper-dark/30 border border-ink/10 rounded-sm overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${dashed ? 'opacity-60' : ''}`}
          style={{
            width: `${widthFrac * 100}%`,
            backgroundColor: color,
            backgroundImage: dashed
              ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 6px, transparent 6px 10px)'
              : undefined,
            transition: 'width 200ms ease-out',
          }}
        />
      </div>
      <div className="font-mono text-[11px] text-ink tabular-nums text-right min-w-[130px]">
        {value}
        {delta ? (
          <div
            className={`text-[10px] italic ${delta.isNegative() ? 'text-terracotta-dark' : 'text-stamp-blue'}`}
          >
            {delta.isNegative() ? '' : '+'}
            {formatTime(delta)}
          </div>
        ) : null}
      </div>
    </div>
  )
}
