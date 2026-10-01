import { useState } from 'react'
import Decimal from 'decimal.js'
import { useStore } from '../store'
import { evaluateTrip, heightOf, type Trip, type TripProblem } from '../trip'
import { getBody } from '../physics/bodies'
import { C, DAY_SECONDS, JULIAN_YEAR_SECONDS } from '../physics/constants'
import type { EffectSplit } from '../physics/effects'
import type { DilationResult } from '../physics/types'
import { getDestinationCopy, HAZARD_CLASSES, type Hazard } from '../copy/destinations'
import { PLACES } from '../copy/places'
import { funFactsForMiss } from '../copy/funFacts'
import { durationText, humanDuration, humanSpeed, sameUnitPair } from '../humanize'
import { Stamp } from './Stamp'
import { MathDrawer } from './MathDrawer'

/** The answer: what happens to your clock on this trip, in plain English. */
export function BoardingPass() {
  const trip = useStore((s) => s.trip)
  const presetId = useStore((s) => s.presetId)
  const loadCount = useStore((s) => s.loadCount)
  const copy = getDestinationCopy(presetId)
  const outcome = evaluateTrip(trip)
  const hazard = presetId ? copy.hazard : customHazard(trip)

  return (
    <section className="paper-card overflow-hidden" aria-live="polite" aria-label="Boarding pass">
      <header className="bg-ink text-paper-light px-5 sm:px-6 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper-darker">
            Boarding pass
          </div>
          <h3 className="font-display text-2xl sm:text-3xl mt-0.5 leading-tight">
            <span aria-hidden>{copy.emoji} </span>
            {copy.title}
          </h3>
          <p className="text-sm text-paper-darker mt-1">{tripSummary(trip)}</p>
        </div>
        <span
          className={`shrink-0 border-2 px-2 py-0.5 font-display text-[11px] tracking-widest bg-paper-light ${HAZARD_CLASSES[hazard]}`}
          title="Bureau hazard rating"
        >
          {hazard}
        </span>
      </header>
      <div className="ticket-edge h-[6px]" />

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
    </section>
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

function Result({ trip, result, split, lesson, traveler, home }: ResultProps) {
  const younger = result.delta.isNegative()
  const nothing = result.delta.isZero()
  const pair = sameUnitPair(result.travelerProperTime, result.referenceProperTime)
  const diff = humanDuration(result.delta)

  return (
    <div className="flex flex-col">
      <div className="px-5 sm:px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-semibold uppercase tracking-wider text-ink-softer">
            When you get back…
          </div>
          {!nothing ? (
            <Stamp color={younger ? 'terracotta' : 'blue'} rotate={-7} animate>
              {younger ? 'You’re younger' : 'You’re older'}
            </Stamp>
          ) : null}
        </div>

        {nothing ? (
          <p className="font-display text-3xl sm:text-4xl leading-tight text-ink mt-2">
            No difference at all. As far as time is concerned, you never left.
          </p>
        ) : pair ? (
          <>
            <p className="font-display text-3xl sm:text-[40px] leading-tight text-ink mt-2">
              You aged <span className="text-terracotta">{pair[0]}</span>. Home aged{' '}
              <span className="text-stamp-blue">{pair[1]}</span>.
            </p>
            <p className="text-lg text-ink-light mt-3">
              You come back <strong className="text-ink">{diff.text} {younger ? 'younger' : 'older'}</strong>{' '}
              than {younger ? 'everyone who stayed behind' : 'if you’d stayed home'}.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl sm:text-[40px] leading-tight text-ink mt-2">
              Your clock ends up <span className="text-terracotta">{diff.text}</span>{' '}
              {younger ? 'behind' : 'ahead of'} home.
            </p>
            <p className="text-lg text-ink-light mt-3">
              {diff.gloss ? <>That’s {diff.gloss}. </> : null}
              Far too small to feel — but atomic clocks measure it, and it’s completely real.
            </p>
          </>
        )}

        <RateLine ratio={result.ratio} />
      </div>

      <AgingRace result={result} />

      <div className="rule-line mx-5 sm:mx-6" />
      <Why trip={trip} split={split} />

      {lesson ? (
        <div className="mx-5 sm:mx-6 mb-5 rounded-sm border-l-4 border-mustard bg-paper-dark/30 px-4 py-3">
          <div className="text-sm font-semibold uppercase tracking-wider text-mustard-dark mb-1">
            What’s going on here
          </div>
          <p className="text-ink leading-relaxed">{lesson}</p>
        </div>
      ) : null}

      <FunFacts delta={result.delta} />

      <div className="rule-line mx-5 sm:mx-6" />
      <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
        <ShareButton />
        <MathDrawer result={result} split={split} traveler={traveler} reference={home} />
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
        Every day, your clock {off.isNegative() ? 'loses' : 'gains'} <strong>{perDay}</strong> compared to home.
      </>
    )
  } else {
    text = (
      <>
        For every <strong>year</strong> that passes at home, <strong>{durationText(ratio.times(JULIAN_YEAR_SECONDS))}</strong> pass for you.
      </>
    )
  }
  return (
    <p className="mt-4 inline-flex items-center gap-2 rounded-sm bg-paper-dark/40 px-3 py-2 text-ink">
      <span aria-hidden>⏱</span>
      <span>{text}</span>
    </p>
  )
}

/** Two bars that grow at their real relative rates: a race between clocks. */
function AgingRace({ result }: { result: DilationResult }) {
  const trav = result.travelerProperTime
  const ref = result.referenceProperTime
  const big = Decimal.max(trav, ref)
  const pct = (x: Decimal) => (big.isZero() ? 0 : x.div(big).times(100).toNumber())
  const tooSmall = Math.abs(pct(trav) - pct(ref)) < 0.5

  return (
    <div className="px-5 sm:px-6 pb-6">
      <div className="text-sm font-semibold uppercase tracking-wider text-ink-softer mb-3">
        The aging race
      </div>
      <div className="flex flex-col gap-3">
        <RaceBar label="🏠 Home" value={durationText(ref)} pct={pct(ref)} tone="bg-stamp-blue" />
        <RaceBar label="🧳 You" value={durationText(trav)} pct={pct(trav)} tone="bg-terracotta" />
      </div>
      <p className="text-sm text-ink-light mt-2">
        {tooSmall
          ? 'The bars look identical because the difference is far too small to draw. That’s the point — it’s tiny, but it’s there.'
          : 'Both bars grow for the same amount of time. Yours grows slower because your clock is slower.'}
      </p>
    </div>
  )
}

function RaceBar({ label, value, pct, tone }: { label: string; value: string; pct: number; tone: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-mono tabular-nums text-ink-light">{value}</span>
      </div>
      <div className="h-4 rounded-sm bg-paper-dark/50 overflow-hidden">
        <div className={`race-bar h-full ${tone}`} style={{ width: `${Math.max(pct, 0.6)}%` }} />
      </div>
    </div>
  )
}

/** "Why?" — split into the speed part and the gravity part. */
function Why({ trip, split }: { trip: Trip; split: EffectSplit }) {
  const body = getBody(trip.place)
  const speedAbs = split.speed.abs()
  const gravAbs = split.gravity.abs()
  const max = Decimal.max(speedAbs, gravAbs)
  const width = (x: Decimal) => (max.isZero() || x.isZero() ? 0 : Math.max(2, x.div(max).times(100).toNumber()))

  const speedNote = split.speed.isZero()
    ? 'No effect — you’re not moving.'
    : `Moving at ${humanSpeed(trip.speed)} slowed your clock by ${durationText(speedAbs)}.`

  let gravNote: string
  if (body.kind === 'empty') gravNote = 'No effect — there’s nothing heavy nearby.'
  else if (split.gravity.isZero()) gravNote = 'No effect — you’re at the same height as home.'
  else if (split.gravity.isPositive())
    gravNote = `You’re higher up than home, where Earth’s pull is weaker, so your clock ran ${durationText(gravAbs)} faster.`
  else gravNote = `Sitting close to ${PLACES[trip.place].inSentence} slowed your clock by ${durationText(gravAbs)}.`

  let verdict: string | null = null
  if (!split.speed.isZero() && !split.gravity.isZero()) {
    if (split.speed.isNegative() !== split.gravity.isNegative()) {
      verdict = speedAbs.gt(gravAbs)
        ? 'The two effects pull in opposite directions — speed wins.'
        : 'The two effects pull in opposite directions — gravity wins.'
    } else {
      verdict = speedAbs.gt(gravAbs)
        ? 'Both slow you down, but speed does most of the work.'
        : 'Both slow you down, but gravity does most of the work.'
    }
  }

  return (
    <div className="px-5 sm:px-6 py-5">
      <div className="text-sm font-semibold uppercase tracking-wider text-ink-softer mb-3">Why?</div>
      <div className="flex flex-col gap-4">
        <EffectRow icon="🏎️" title="Speed" note={speedNote} width={width(speedAbs)} slows={!split.speed.isPositive()} />
        <EffectRow icon="🪐" title="Gravity" note={gravNote} width={width(gravAbs)} slows={!split.gravity.isPositive()} />
      </div>
      {verdict ? <p className="mt-3 font-semibold text-ink">{verdict}</p> : null}
    </div>
  )
}

function EffectRow(props: { icon: string; title: string; note: string; width: number; slows: boolean }) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-x-3 items-start">
      <span className="text-2xl leading-none" aria-hidden>
        {props.icon}
      </span>
      <div>
        <div className="font-semibold text-ink">{props.title}</div>
        <p className="text-ink-light text-[15px]">{props.note}</p>
        {props.width > 0 ? (
          <div className="mt-1.5 h-2 rounded-full bg-paper-dark/50 overflow-hidden" aria-hidden>
            <div
              className={`h-full rounded-full ${props.slows ? 'bg-terracotta' : 'bg-stamp-blue'}`}
              style={{ width: `${props.width}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FunFacts({ delta }: { delta: Decimal }) {
  // funFactsForMiss expects "seconds missed": positive when the traveler aged less.
  const facts = funFactsForMiss(delta.neg())
  if (delta.isZero()) return null
  return (
    <div className="px-5 sm:px-6 pb-5">
      <div className="text-sm font-semibold uppercase tracking-wider text-ink-softer mb-2">
        {delta.isNegative() ? 'While you were away' : 'To put that in perspective'}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {facts.map((f) => (
          <li key={f.text} className="flex gap-2 rounded-sm bg-paper-light border border-ink/10 px-3 py-2 text-[15px]">
            <span aria-hidden>{f.icon}</span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
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
      // Clipboard blocked (insecure context etc.) — the URL bar still has the link.
    }
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button type="button" onClick={share} className="btn-primary">
        {copied ? '✓ Link copied' : '🔗 Copy a link to this trip'}
      </button>
      <span className="text-sm text-ink-softer">Anyone who opens it sees exactly this trip.</span>
    </div>
  )
}

function Refused({ problem }: { problem: TripProblem }) {
  return (
    <div className="px-5 sm:px-6 py-8 flex flex-col gap-3">
      <Stamp color="red" rotate={-4} className="self-start text-sm" animate>
        Trip refused
      </Stamp>
      {problem === 'faster-than-light' ? (
        <>
          <p className="font-display text-3xl text-ink">Nothing can reach the speed of light.</p>
          <p className="text-lg text-ink-light">
            The closer you get, the more energy each extra bit of speed costs — reaching it would take infinite energy.
            Back off a little.
          </p>
        </>
      ) : (
        <>
          <p className="font-display text-3xl text-ink">The black hole wins.</p>
          <p className="text-lg text-ink-light">
            This close to the edge, gravity is so strong that moving this fast would mean outrunning light itself.
            Slow down, or move further away from the edge.
          </p>
        </>
      )}
    </div>
  )
}

function tripSummary(trip: Trip): string {
  const body = getBody(trip.place)
  const where =
    body.kind === 'empty'
      ? 'deep space'
      : heightOf(trip).isZero()
        ? `on the surface of ${PLACES[trip.place].inSentence}`
        : `near ${PLACES[trip.place].inSentence}`
  return `${capitalise(humanSpeed(trip.speed))} · ${where} · ${durationText(trip.duration)} at home`
}

/** Hazard for trips that aren't on the menu — mostly for laughs. */
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
