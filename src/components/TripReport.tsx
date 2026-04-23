import { useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import type { ObserverState } from '../physics/types'
import { useCurrentObservers, useStore } from '../store'
import { dilate } from '../physics/relativity'
import { GammaReadout } from './GammaReadout'
import { DominantBadge } from './DominantBadge'
import { AgeChart } from './AgeChart'
import { SpacetimeDiagram } from './SpacetimeDiagram'
import { Stamp } from './Stamp'
import { formatTime, formatVelocity, formatLength } from '../format'
import { JULIAN_YEAR_SECONDS, DAY_SECONDS } from '../physics/constants'
import { funFactsForMiss } from '../copy/funFacts'
import { getDestinationCopy } from '../copy/destinations'
import { getScenario } from '../physics/scenarios'
import { MathDrawer } from './MathDrawer'

interface Snapshot {
  label: string
  traveler: ObserverState
  reference: ObserverState
  duration: Decimal
}

function cloneState(
  traveler: ObserverState,
  reference: ObserverState,
  duration: Decimal,
  label: string,
): Snapshot {
  return {
    label,
    traveler: { ...traveler },
    reference: { ...reference },
    duration,
  }
}

export function TripReport() {
  const { traveler, reference, duration, trajectory } = useCurrentObservers()
  const scenarioId = useStore((s) => s.scenarioId)
  const setTravelerVelocity = useStore((s) => s.setTravelerVelocity)
  const isPreset = scenarioId !== 'custom' && !scenarioId.startsWith('custom-')
  const scenario = (() => {
    if (!isPreset) return null
    try {
      return getScenario(scenarioId)
    } catch {
      return null
    }
  })()
  const copy = scenario ? getDestinationCopy(scenarioId) : null

  const [fork, setFork] = useState<Snapshot | null>(null)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  const result = useMemo(
    () => {
      try {
        return { ok: true as const, value: dilate(traveler, reference, duration) }
      } catch (err) {
        return { ok: false as const, error: (err as Error).message }
      }
    },
    [traveler, reference, duration],
  )

  const forkResult = useMemo(() => {
    if (!fork) return null
    try {
      return dilate(fork.traveler, fork.reference, fork.duration)
    } catch {
      return null
    }
  }, [fork])

  const snapshotLabel = scenario ? scenario.name.split(' (')[0]! : 'Off-menu'

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 1600)
    } catch {
      // Ignore — browser refused clipboard (insecure context, etc.)
    }
  }

  const handleFork = () => {
    setFork(cloneState(traveler, reference, duration, snapshotLabel))
  }

  const handleDropFork = () => setFork(null)

  if (!result.ok) {
    return (
      <section className="paper-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Stamp color="red">Trip Refused</Stamp>
          <h3 className="font-display text-2xl text-ink">This itinerary is not physical.</h3>
        </div>
        <p className="text-sm text-ink-light">{result.error}</p>
        <p className="text-xs text-ink-softer mt-3">
          Your configuration slipped past the light-speed ceiling or beneath an event horizon.
          Adjust velocity, altitude, or mass and re-book.
        </p>
      </section>
    )
  }

  const r = result.value
  const travelerYounger = r.delta.isNegative()
  const missedMagnitude = r.delta.abs()
  const funFacts = funFactsForMiss(r.delta)

  const headline = buildHeadline(r.referenceProperTime, r.travelerProperTime, r.delta)

  return (
    <section className="paper-card overflow-hidden">
      {/* ---------- Boarding Pass header ---------------------------------- */}
      <div className="relative bg-ink text-paper-light px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-paper-darker">
            Trip Report · Einstein's Travel Bureau
          </div>
          <div className="font-display text-2xl mt-0.5">
            {scenario ? `Boarding Pass — ${scenario.name.split(' (')[0]}` : 'Custom Expedition Report'}
          </div>
          {copy ? (
            <div className="text-xs text-paper-darker italic mt-0.5">{copy.tagline} · {copy.region}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Stamp color="terracotta" rotate={-7} animate>
            {travelerYounger ? 'Time Saved' : 'Time Gained'}
          </Stamp>
          <DominantBadge effect={r.dominantEffect} />
        </div>
      </div>
      <div className="ticket-edge h-[6px]" />

      {/* ---------- Bureau actions (share / fork) ------------------------- */}
      <div className="px-6 pt-4 pb-1 flex items-center gap-2 flex-wrap text-xs">
        <span className="font-display uppercase tracking-widest text-[10px] text-ink-softer mr-1">
          Counter Services:
        </span>
        <button
          type="button"
          onClick={handleShare}
          className="stamp-rect bg-paper-light hover:bg-paper-dark/40 transition-colors text-stamp-blue border-stamp-blue"
          aria-label="Copy shareable link to this itinerary"
        >
          {shareStatus === 'copied' ? '✓ Link Stamped' : 'Stamp & Share'}
        </button>
        <button
          type="button"
          onClick={handleFork}
          className="stamp-rect bg-paper-light hover:bg-paper-dark/40 transition-colors text-olive-dark border-olive"
        >
          Fork This Trip
        </button>
        {fork ? (
          <button
            type="button"
            onClick={handleDropFork}
            className="stamp-rect bg-paper-light hover:bg-paper-dark/40 transition-colors text-ink-softer border-ink/30 hover:text-ink hover:border-ink"
          >
            Drop Fork
          </button>
        ) : null}
      </div>

      {/* ---------- Dramatic headline ------------------------------------- */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-[11px] uppercase tracking-widest text-ink-softer font-display">
          When you return...
        </div>
        {headline.kind === 'contrast' ? (
          <>
            <h3 className="font-display text-[32px] md:text-[40px] leading-tight text-ink mt-1 max-w-3xl">
              You aged <span className="text-terracotta">{headline.traveler}</span>.
              {' '}Home aged <span className="text-stamp-blue">{headline.reference}</span>.
            </h3>
            <p className="mt-2 text-base text-ink-light max-w-3xl">
              {travelerYounger ? (
                <>
                  You return <strong className="text-terracotta-dark">{formatTime(missedMagnitude)}</strong>{' '}
                  younger than if you had stayed put.
                </>
              ) : (
                <>
                  You age <strong className="text-terracotta-dark">{formatTime(missedMagnitude)}</strong>{' '}
                  more than the folks at home.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h3 className="font-display text-[30px] md:text-[36px] leading-tight text-ink mt-1 max-w-3xl">
              After <span className="text-ink">{headline.tripLength}</span>, your clock runs{' '}
              <span className="text-terracotta">{headline.deltaStr}</span>{' '}
              {travelerYounger ? 'behind' : 'ahead of'} home.
            </h3>
            <p className="mt-2 text-base text-ink-light max-w-3xl italic">
              A subtle effect — invisible to a wristwatch, routine for atomic clocks, and
              absolutely real.
            </p>
          </>
        )}
      </div>

      {/* ---------- Gamma + "You would have..." -------------------------- */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <GammaReadout ratio={r.ratio} />
        <div className="paper-card p-4 bg-paper-light">
          <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer mb-2">
            What you would have missed
          </div>
          <ul className="flex flex-col gap-1.5">
            {funFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                <span className="text-base leading-5">{fact.icon}</span>
                <span className="leading-5">{fact.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rule-line mx-6" />

      {/* ---------- Itinerary map + aging curve --------------------------- */}
      <div className="px-6 py-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div>
          <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer mb-1">
            Itinerary Map
          </div>
          <SpacetimeDiagram
            travelerVelocity={traveler.velocity}
            trajectory={trajectory}
            onVelocityChange={setTravelerVelocity}
          />
        </div>
        <div>
          <div className="font-display text-[11px] uppercase tracking-widest text-ink-softer mb-1">
            Aging Timeline
          </div>
          <AgeChart result={r} />
        </div>
      </div>

      {fork && forkResult ? (
        <>
          <div className="rule-line mx-6" />
          <ForkPanel
            fork={fork}
            forkResult={forkResult}
            liveTraveler={traveler}
            liveDuration={duration}
            liveResult={r}
            onDrop={handleDropFork}
            onRefresh={() => setFork(cloneState(traveler, reference, duration, snapshotLabel))}
          />
        </>
      ) : null}

      <div className="rule-line mx-6" />

      {/* ---------- The math drawer --------------------------------------- */}
      <div className="px-6 py-5">
        <MathDrawer result={r} traveler={traveler} reference={reference} duration={duration} />
      </div>
    </section>
  )
}

interface ForkPanelProps {
  fork: Snapshot
  forkResult: ReturnType<typeof dilate>
  liveTraveler: ObserverState
  liveDuration: Decimal
  liveResult: ReturnType<typeof dilate>
  onDrop: () => void
  onRefresh: () => void
}

function ForkPanel({
  fork,
  forkResult,
  liveTraveler,
  liveDuration,
  liveResult,
  onDrop,
  onRefresh,
}: ForkPanelProps) {
  const deltaOfDelta = liveResult.delta.minus(forkResult.delta)
  const travelerShift = new Decimal(liveTraveler.velocity).minus(
    new Decimal(fork.traveler.velocity),
  )

  return (
    <div className="px-6 py-5 bg-paper-dark/20">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-softer">
            What-If Comparison · forked from {fork.label}
          </div>
          <h4 className="font-display text-xl text-ink mt-0.5">
            The live itinerary vs. the one you just walked away from
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="stamp-rect bg-paper-light hover:bg-paper-dark/40 transition-colors text-stamp-blue border-stamp-blue"
          >
            Pin Current Here
          </button>
          <button
            type="button"
            onClick={onDrop}
            className="stamp-rect bg-paper-light hover:bg-paper-dark/40 transition-colors text-ink-softer border-ink/30 hover:text-ink hover:border-ink"
          >
            Discard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <ForkColumn
          title="Fork (frozen)"
          accent="olive"
          traveler={fork.traveler}
          duration={fork.duration}
          result={forkResult}
        />
        <div className="hidden md:flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-[10px] uppercase tracking-widest text-ink-softer">
              Δ of Δ
            </div>
            <div
              className={`font-display text-2xl tabular-nums ${
                deltaOfDelta.isNegative() ? 'text-terracotta-dark' : 'text-stamp-blue'
              }`}
            >
              {deltaOfDelta.isNegative() ? '' : '+'}
              {formatTime(deltaOfDelta)}
            </div>
            <div className="text-[10px] text-ink-softer italic mt-0.5 max-w-[140px] mx-auto">
              {deltaOfDelta.isZero()
                ? 'no change'
                : deltaOfDelta.isNegative()
                ? 'live traveler is younger than the fork'
                : 'live traveler is older than the fork'}
            </div>
            {!travelerShift.isZero() ? (
              <div className="text-[10px] text-ink-softer mt-1 font-mono">
                Δv = {formatVelocity(travelerShift)}
              </div>
            ) : null}
          </div>
        </div>
        <ForkColumn
          title="Live (changing)"
          accent="terracotta"
          traveler={liveTraveler}
          duration={liveDuration}
          result={liveResult}
          highlight
        />
      </div>
    </div>
  )
}

interface ForkColumnProps {
  title: string
  accent: 'olive' | 'terracotta'
  traveler: ObserverState
  duration: Decimal
  result: ReturnType<typeof dilate>
  highlight?: boolean
}

function ForkColumn({ title, accent, traveler, duration, result, highlight }: ForkColumnProps) {
  const accentText = accent === 'olive' ? 'text-olive-dark' : 'text-terracotta-dark'
  const accentBorder = accent === 'olive' ? 'border-olive' : 'border-terracotta'

  return (
    <div
      className={`rounded-sm border-2 ${accentBorder} ${highlight ? 'bg-paper-light' : 'bg-paper-light/50'} p-4 flex flex-col gap-2`}
    >
      <div className={`font-display text-[11px] uppercase tracking-widest ${accentText}`}>
        {title}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px] font-mono tabular-nums">
        <dt className="text-ink-softer text-[10px] uppercase tracking-wider">v</dt>
        <dd className={`${accentText}`}>{formatVelocity(traveler.velocity)}</dd>
        <dt className="text-ink-softer text-[10px] uppercase tracking-wider">r</dt>
        <dd className="text-ink">{formatLength(traveler.radius)}</dd>
        <dt className="text-ink-softer text-[10px] uppercase tracking-wider">T</dt>
        <dd className="text-ink">{formatTime(duration)}</dd>
        <dt className="text-ink-softer text-[10px] uppercase tracking-wider">Ratio</dt>
        <dd className={`${accentText}`}>{result.ratio.toPrecision(8)}</dd>
        <dt className="text-ink-softer text-[10px] uppercase tracking-wider">You age</dt>
        <dd className="text-ink">{formatTime(result.travelerProperTime)}</dd>
        <dt className="text-ink-softer text-[10px] uppercase tracking-wider">Δ vs home</dt>
        <dd className={`${result.delta.isNegative() ? 'text-terracotta-dark' : 'text-stamp-blue'}`}>
          {result.delta.isNegative() ? '' : '+'}
          {formatTime(result.delta)}
        </dd>
      </dl>
    </div>
  )
}

type Headline =
  | { kind: 'contrast'; reference: string; traveler: string }
  | { kind: 'subtle'; tripLength: string; deltaStr: string }

/**
 * When the effect is large enough to make ref vs. traveler render as distinct
 * numbers in a single unit → contrast mode ("You aged X. Home aged Y.").
 * When it isn't → subtle mode ("After 1 day, your clock runs 38 μs behind.").
 */
function buildHeadline(refSeconds: Decimal, travSeconds: Decimal, delta: Decimal): Headline {
  const abs = refSeconds.abs()
  const unit = pickHeadlineUnit(abs)
  const refFormatted = formatInUnit(refSeconds, unit)
  const travFormatted = formatInUnit(travSeconds, unit)

  if (refFormatted === travFormatted) {
    return {
      kind: 'subtle',
      tripLength: refFormatted,
      deltaStr: formatTime(delta.abs()),
    }
  }
  return {
    kind: 'contrast',
    reference: refFormatted,
    traveler: travFormatted,
  }
}

const SINGULAR: Record<string, string> = {
  years: 'year',
  days: 'day',
  hours: 'hour',
  minutes: 'minute',
  seconds: 'second',
}

function formatInUnit(x: Decimal, unit: { divisor: Decimal; label: string }): string {
  const val = x.div(unit.divisor)
  const n = val.toNumber()
  let numStr: string
  if (Math.abs(n) >= 100) {
    numStr = n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  } else if (Math.abs(n) >= 10) {
    numStr = n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  } else if (Math.abs(n) >= 1) {
    numStr = n.toLocaleString('en-US', { maximumFractionDigits: 3 })
  } else {
    // Fractional — plural is the right default here.
    return `${val.toPrecision(4)} ${unit.label}`
  }
  const renderedAbs = Math.abs(parseFloat(numStr.replace(/,/g, '')))
  const label = renderedAbs === 1 ? (SINGULAR[unit.label] ?? unit.label) : unit.label
  return `${numStr} ${label}`
}

function pickHeadlineUnit(abs: Decimal): { divisor: Decimal; label: string } {
  if (abs.gte(JULIAN_YEAR_SECONDS)) return { divisor: JULIAN_YEAR_SECONDS, label: 'years' }
  if (abs.gte(DAY_SECONDS)) return { divisor: DAY_SECONDS, label: 'days' }
  if (abs.gte(3600)) return { divisor: new Decimal(3600), label: 'hours' }
  if (abs.gte(60)) return { divisor: new Decimal(60), label: 'minutes' }
  if (abs.gte(1)) return { divisor: new Decimal(1), label: 'seconds' }
  if (abs.gte('1e-3')) return { divisor: new Decimal('1e-3'), label: 'ms' }
  if (abs.gte('1e-6')) return { divisor: new Decimal('1e-6'), label: 'μs' }
  return { divisor: new Decimal('1e-9'), label: 'ns' }
}
