import { useState } from 'react'
import Decimal from 'decimal.js'
import { useStore } from '../store'
import { encodeTrip, evaluateTrip, heightOf, type Trip, type TripProblem } from '../trip'
import { getBody } from '../physics/bodies'
import { C, DAY_SECONDS, JULIAN_YEAR_SECONDS } from '../physics/constants'
import type { EffectSplit } from '../physics/effects'
import type { DilationResult } from '../physics/types'
import { getDestinationCopy, HAZARD_TONE, type Hazard } from '../copy/destinations'
import { PLACES } from '../copy/places'
import { funFactsForMiss } from '../copy/funFacts'
import { durationText, humanDistance, humanDuration, humanSpeed, sameUnitPair } from '../humanize'
import { Stamp } from './Stamp'
import { MathDrawer } from './MathDrawer'
import { CountUp } from './CountUp'
import { Icon } from './art/Icons'
import { BodyGlyph } from './art/Bodies'

/** The answer: what happens to your clock on this trip, in plain English. */
export function BoardingPass() {
  const trip = useStore((s) => s.trip)
  const presetId = useStore((s) => s.presetId)
  const loadCount = useStore((s) => s.loadCount)
  const copy = getDestinationCopy(presetId)
  const outcome = evaluateTrip(trip)
  const hazard = presetId ? copy.hazard : customHazard(trip)
  const body = getBody(trip.place)
  const height = heightOf(trip)

  return (
    <article className="ticket rounded-[22px] overflow-hidden" aria-label="Boarding pass">
      <header className="bg-night-900 text-cream px-5 sm:px-7 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon name="sparkle" size={16} className="text-gold shrink-0" />
          <span className="hidden min-[440px]:inline font-mono text-[11px] uppercase tracking-[0.25em] text-gold-300 truncate">
            Einstein’s Travel Bureau
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist-300 whitespace-nowrap">
          Boarding pass · {copy.flight}
        </span>
      </header>

      <div className="px-5 sm:px-7 pt-5 pb-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="ticket-label">{copy.package}</div>
            <h3 className="font-display text-[32px] sm:text-[40px] leading-[1.05] font-semibold tracking-tight mt-1">
              {copy.title}
            </h3>
          </div>
          <span className="shrink-0 grid place-items-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-night-900 ring-1 ring-gold/40">
            <BodyGlyph id={trip.place} size={52} />
          </span>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-5">
          <Field label="Speed" value={capitalise(humanSpeed(trip.speed))} />
          <Field
            label="Near"
            value={
              body.kind === 'empty'
                ? 'Nothing at all'
                : `${PLACES[trip.place].name}${height.isZero() ? ', on the ground' : ''}`
            }
          />
          <Field
            label={body.kind === 'black-hole' ? 'From the edge' : 'Height'}
            value={body.kind === 'empty' ? '—' : height.isZero() ? 'Surface' : humanDistance(height)}
          />
          <Field label="Away for" value={durationText(trip.duration)} hint="(home time)" />
        </dl>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="ticket-label">Hazard</span>
          <span
            className="font-mono text-[11px] font-bold tracking-[0.2em] px-2 py-0.5 rounded border-[1.5px]"
            style={{ color: HAZARD_TONE[hazard].onCream, borderColor: HAZARD_TONE[hazard].onCream }}
          >
            {hazard}
          </span>
        </div>
      </div>

      <div className="perforation" aria-hidden />

      {outcome.ok ? (
        <Result
          key={loadCount}
          trip={trip}
          result={outcome.result}
          split={outcome.split}
          lesson={presetId ? copy.lesson : null}
          traveler={outcome.traveler}
          home={outcome.home}
        />
      ) : (
        <Refused problem={outcome.problem} />
      )}

      <footer className="bg-ink/[0.04] border-t border-ink/10 px-5 sm:px-7 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <ShareButton />
          <Barcode seed={encodeTrip({ presetId, trip })} />
        </div>
        {outcome.ok ? (
          <MathDrawer result={outcome.result} split={outcome.split} traveler={outcome.traveler} reference={outcome.home} />
        ) : null}
      </footer>
    </article>
  )
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="ticket-label">{label}</dt>
      <dd className="font-semibold text-ink leading-snug mt-0.5 [overflow-wrap:anywhere]">
        {value} {hint ? <span className="font-normal text-ink-3 text-sm">{hint}</span> : null}
      </dd>
    </div>
  )
}

interface ResultProps {
  trip: Trip
  result: DilationResult
  split: EffectSplit
  lesson: string | null
  traveler: Parameters<typeof MathDrawer>[0]['traveler']
  home: Parameters<typeof MathDrawer>[0]['reference']
}

function Result({ trip, result, split, lesson }: ResultProps) {
  const younger = result.delta.isNegative()
  const nothing = result.delta.isZero()
  const pair = sameUnitPair(result.travelerProperTime, result.referenceProperTime)
  const diff = humanDuration(result.delta)

  return (
    <div className="flex flex-col" aria-live="polite">
      <section className="relative px-5 sm:px-7 pt-4 pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="ticket-label">When you get back</div>
          {!nothing ? (
            <Stamp color={younger ? 'you' : 'home'} rotate={-9} animate className="absolute right-5 sm:right-7 top-3 text-[13px]">
              {younger ? 'Younger' : 'Older'}
            </Stamp>
          ) : null}
        </div>

        {nothing ? (
          <p className="font-display text-3xl sm:text-4xl leading-tight mt-3">
            No difference at all. As far as time is concerned, you never left.
          </p>
        ) : pair ? (
          <>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Stat tone="you" label="You aged" value={pair[0]} />
              <Stat tone="home" label="Home aged" value={pair[1]} />
            </div>
            <p className="text-lg text-ink-2 mt-4 leading-snug">
              You come back{' '}
              <strong className="text-ink font-semibold">
                {diff.text} {younger ? 'younger' : 'older'}
              </strong>{' '}
              than {younger ? 'everyone you left behind' : 'if you’d stayed home'}.
            </p>
          </>
        ) : (
          <>
            <div className="mt-4 rounded-2xl bg-night-900 text-cream px-5 py-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist-300">
                Your clock ends up {younger ? 'behind' : 'ahead of'} home by
              </div>
              <div className={`font-display text-4xl sm:text-5xl leading-tight mt-1 ${younger ? 'text-you-300' : 'text-home-300'}`}>
                <CountUp text={diff.text} />
              </div>
            </div>
            <p className="text-lg text-ink-2 mt-4 leading-snug">
              {diff.gloss ? <>That’s {diff.gloss}. </> : null}
              Far too small to feel, but atomic clocks measure it, and it’s completely real.
            </p>
          </>
        )}

        <RateLine ratio={result.ratio} />
        {!nothing ? <AgingRace result={result} /> : null}
      </section>

      <div className="perforation" aria-hidden />
      <Why trip={trip} split={split} />

      {lesson ? (
        <div className="mx-5 sm:mx-7 mb-6 rounded-2xl bg-gold/15 ring-1 ring-inset ring-gold/40 px-5 py-4">
          <div className="ticket-label !text-gold-700 mb-1.5">What’s going on here</div>
          <p className="text-ink leading-relaxed">{lesson}</p>
        </div>
      ) : null}

      <FunFacts delta={result.delta} />
    </div>
  )
}

function Stat({ tone, label, value }: { tone: 'you' | 'home'; label: string; value: string }) {
  const you = tone === 'you'
  return (
    <div className={`rounded-2xl px-4 py-3 ${you ? 'bg-you/15 ring-1 ring-inset ring-you/40' : 'bg-home/15 ring-1 ring-inset ring-home/50'}`}>
      <div className={`ticket-label ${you ? '!text-you-700' : '!text-home-700'}`}>{label}</div>
      <div className="font-display text-[28px] sm:text-[36px] leading-[1.05] font-semibold tabular-nums mt-1 [overflow-wrap:anywhere]">
        <CountUp text={value} />
      </div>
    </div>
  )
}

function RateLine({ ratio }: { ratio: Decimal }) {
  const off = ratio.minus(1)
  if (off.isZero()) return null
  let text: React.ReactNode
  if (off.abs().lt('1e-3')) {
    const perDay = durationText(off.abs().times(DAY_SECONDS))
    text = (
      <>
        Every day, your clock {off.isNegative() ? 'loses' : 'gains'} <strong>{perDay}</strong> on home’s.
      </>
    )
  } else {
    text = (
      <>
        For every <strong>year</strong> at home, <strong>{durationText(ratio.times(JULIAN_YEAR_SECONDS))}</strong> pass
        for you.
      </>
    )
  }
  return (
    <p className="mt-4 flex items-start gap-2.5 text-ink-2">
      <Icon name="clock" size={20} className="text-gold-700 shrink-0 mt-0.5" />
      <span>{text}</span>
    </p>
  )
}

/** Two bars that grow at their real relative rates: a race between clocks. */
function AgingRace({ result }: { result: DilationResult }) {
  const trav = result.travelerProperTime
  const ref = result.referenceProperTime
  const big = Decimal.max(trav, ref)
  const frac = (x: Decimal) => (big.isZero() ? 0 : x.div(big).toNumber())
  const tooSmall = Math.abs(frac(trav) - frac(ref)) < 0.005

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-2.5">
        <RaceBar label="Home" value={durationText(ref)} frac={frac(ref)} tone="home" />
        <RaceBar label="You" value={durationText(trav)} frac={frac(trav)} tone="you" />
      </div>
      <p className="text-sm text-ink-3 mt-2">
        {tooSmall
          ? 'The bars look identical because the gap is too small to draw. That’s the point: tiny, but there.'
          : 'Both clocks run for the whole trip. Yours fills up slower because it ticks slower.'}
      </p>
    </div>
  )
}

function RaceBar({ label, value, frac, tone }: { label: string; value: string; frac: number; tone: 'you' | 'home' }) {
  return (
    <div className="grid grid-cols-[3.25rem_1fr] items-center gap-3">
      <span className={`text-xs font-mono font-semibold uppercase tracking-[0.15em] ${tone === 'you' ? 'text-you-700' : 'text-home-700'}`}>
        {label}
      </span>
      <div className="relative h-7 rounded-full bg-ink/[0.07] overflow-hidden">
        <div
          className={`race-bar absolute inset-y-0 left-0 rounded-full ${tone === 'you' ? 'bg-gradient-to-r from-you-600 to-you' : 'bg-gradient-to-r from-home-600 to-home'}`}
          style={{ width: `${Math.max(frac * 100, 1.5)}%` }}
        />
        <span className="absolute inset-y-0 left-3 flex items-center text-[13px] font-semibold text-night-950 mix-blend-normal whitespace-nowrap">
          {value}
        </span>
      </div>
    </div>
  )
}

/** "Why?": the speed part and the gravity part, as a tug of war. */
function Why({ trip, split }: { trip: Trip; split: EffectSplit }) {
  const body = getBody(trip.place)
  const speedAbs = split.speed.abs()
  const gravAbs = split.gravity.abs()
  const max = Decimal.max(speedAbs, gravAbs)
  const width = (x: Decimal) => (max.isZero() || x.isZero() ? 0 : Math.max(3, x.div(max).times(100).toNumber()))

  const speedNote = split.speed.isZero()
    ? 'No effect: you’re not moving.'
    : `Moving at ${humanSpeed(trip.speed)} slowed your clock by ${durationText(speedAbs)}.`

  let gravNote: string
  if (body.kind === 'empty') gravNote = 'No effect: there’s nothing heavy nearby.'
  else if (split.gravity.isZero()) gravNote = 'No effect: you’re at the same height as home.'
  else if (split.gravity.isPositive())
    gravNote = `Higher up, Earth’s pull is weaker, so your clock ran ${durationText(gravAbs)} faster.`
  else gravNote = `Sitting close to ${PLACES[trip.place].inSentence} slowed your clock by ${durationText(gravAbs)}.`

  let verdict: string | null = null
  if (!split.speed.isZero() && !split.gravity.isZero()) {
    if (split.speed.isNegative() !== split.gravity.isNegative()) {
      verdict = speedAbs.gt(gravAbs)
        ? 'The two effects pull in opposite directions. Speed wins.'
        : 'The two effects pull in opposite directions. Gravity wins.'
    } else {
      verdict = speedAbs.gt(gravAbs)
        ? 'Both slow you down, but speed does most of the work.'
        : 'Both slow you down, but gravity does most of the work.'
    }
  }

  return (
    <section className="px-5 sm:px-7 pt-4 pb-6">
      <div className="ticket-label">Why?</div>
      <div className="mt-3 grid grid-cols-2 text-[11px] font-mono uppercase tracking-[0.12em] text-ink-3" aria-hidden>
        <span className="text-right pr-3">← Slows your clock</span>
        <span className="pl-3">Speeds it up →</span>
      </div>
      <div className="flex flex-col gap-4 mt-1.5">
        <TugRow icon="rocket" title="Speed" note={speedNote} width={width(speedAbs)} slows={!split.speed.isPositive()} />
        <TugRow icon="weight" title="Gravity" note={gravNote} width={width(gravAbs)} slows={!split.gravity.isPositive()} />
      </div>
      {verdict ? <p className="mt-4 font-display text-xl leading-snug">{verdict}</p> : null}
    </section>
  )
}

function TugRow(props: { icon: 'rocket' | 'weight'; title: string; note: string; width: number; slows: boolean }) {
  const bar = (
    <div
      className={`h-3 rounded-full ${props.slows ? 'bg-gradient-to-l from-you to-you-600 ml-auto' : 'bg-gradient-to-r from-home-600 to-home'}`}
      style={{ width: `${props.width}%` }}
    />
  )
  return (
    <div>
      <div className="grid grid-cols-2 items-center h-3" aria-hidden>
        <div className="border-r-2 border-ink/30 pr-0 flex">{props.slows && props.width > 0 ? bar : null}</div>
        <div className="flex">{!props.slows && props.width > 0 ? bar : null}</div>
      </div>
      <div className="flex items-start gap-2.5 mt-2">
        <Icon name={props.icon} size={20} className="text-ink-2 shrink-0 mt-0.5" />
        <p className="text-ink-2 text-[15px] leading-snug">
          <strong className="text-ink">{props.title}.</strong> {props.note}
        </p>
      </div>
    </div>
  )
}

function FunFacts({ delta }: { delta: Decimal }) {
  if (delta.isZero()) return null
  // funFactsForMiss expects "seconds missed": positive when the traveller aged less.
  const facts = funFactsForMiss(delta.neg())
  return (
    <section className="px-5 sm:px-7 pb-6">
      <div className="ticket-label mb-2.5">{delta.isNegative() ? 'While you were away' : 'To put that in perspective'}</div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {facts.map((f) => (
          <li key={f.text} className="flex gap-2.5 rounded-xl bg-white/50 ring-1 ring-inset ring-ink/10 px-3.5 py-2.5 text-[15px] leading-snug text-ink-2">
            <span aria-hidden className="text-lg leading-none mt-0.5">
              {f.icon}
            </span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (insecure context etc.): the URL bar still has the link.
    }
  }
  return (
    <button type="button" onClick={share} className="btn-ink">
      <Icon name={copied ? 'check' : 'link'} size={18} />
      {copied ? 'Link copied' : 'Copy a link to this trip'}
    </button>
  )
}

/** Decorative barcode, deterministic per trip, so every pass looks like its own. */
function Barcode({ seed }: { seed: string }) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const bars: number[] = []
  for (let i = 0; i < 38; i++) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995)
    bars.push(1 + ((h >>> 0) % 3))
  }
  let x = 0
  return (
    <svg viewBox="0 0 150 36" className="h-9 w-[150px] text-ink" aria-hidden>
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="36" fill="currentColor" /> : null
        x += w + 0.8
        return rect
      })}
    </svg>
  )
}

function Refused({ problem }: { problem: TripProblem }) {
  return (
    <div className="px-5 sm:px-7 py-8 flex flex-col gap-3 items-start">
      <Stamp color="red" rotate={-5} animate className="text-base">
        Trip refused
      </Stamp>
      {problem === 'faster-than-light' ? (
        <>
          <p className="font-display text-3xl mt-2">Nothing can reach the speed of light.</p>
          <p className="text-lg text-ink-2">
            The closer you get, the more energy each extra bit of speed costs. Reaching it would take infinite energy.
            Back off a little.
          </p>
        </>
      ) : (
        <>
          <p className="font-display text-3xl mt-2">The black hole wins.</p>
          <p className="text-lg text-ink-2">
            This close to the edge, gravity is so strong that moving this fast would mean outrunning light itself.
            Slow down, or move further from the edge.
          </p>
        </>
      )}
    </div>
  )
}

/** Hazard for trips that aren't on the menu. Mostly for laughs. */
function customHazard(trip: Trip): Hazard {
  const body = getBody(trip.place)
  if (body.kind === 'black-hole' || body.id === 'neutron-star') return 'FATAL'
  if (body.kind === 'star' && heightOf(trip).lt(body.floorRadius)) return 'FATAL'
  if (trip.speed.gte(C.div(100))) return 'EXTREME'
  if (body.kind === 'star' || trip.speed.gt(1000)) return 'CAUTION'
  return 'SAFE'
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
