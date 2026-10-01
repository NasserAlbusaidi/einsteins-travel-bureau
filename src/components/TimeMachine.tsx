import { useState } from 'react'
import Decimal from 'decimal.js'
import { useStore } from '../store'
import { solveRadiusForRatio, solveVelocityForRatio } from '../physics/solver'
import { DEEP_SPACE_RADIUS, getBody, type BodyId } from '../physics/bodies'
import { C, JULIAN_YEAR_SECONDS } from '../physics/constants'
import { PLACES } from '../copy/places'
import { humanDistance, humanNumber, percentOfLight } from '../humanize'
import type { Trip } from '../trip'
import { BodyGlyph } from './art/Bodies'
import { Ship } from './art/Ship'
import { SplitFlap } from './SplitFlap'

const THIS_YEAR = new Date().getFullYear()
const YEAR_CHIPS = [2100, 3000, 10000, 1000000]
const HOLES: readonly BodyId[] = ['sgr-a', 'gargantua']

/** The solver, run backwards: "get me to year X while I only age Y years". */
export function TimeMachine() {
  const loadTrip = useStore((s) => s.loadTrip)
  const [yearText, setYearText] = useState('3000')
  const [ageText, setAgeText] = useState('1')
  const [hole, setHole] = useState<BodyId>('gargantua')

  const year = Number(yearText)
  const age = Number(ageText)
  const homeYears = year - THIS_YEAR

  const book = (trip: Trip) => {
    loadTrip(trip)
    document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  let body: React.ReactNode
  if (!Number.isFinite(year) || !Number.isFinite(age) || yearText === '' || ageText === '') {
    body = <Note>Type a year and how long you’re willing to spend getting there.</Note>
  } else if (homeYears <= 0) {
    body = <Note>That’s not the future. Time travel only goes one way — there’s no reverse gear, and no refunds.</Note>
  } else if (age <= 0) {
    body = <Note>You have to spend at least a little time on board. Even light can’t do it in zero.</Note>
  } else if (age >= homeYears) {
    body = (
      <Note>
        Good news: no trip needed. Just wait — you’ll get to {year} in {humanNumber(homeYears)} years the ordinary way.
      </Note>
    )
  } else if (new Decimal(age).div(homeYears).lt('1e-12')) {
    body = (
      <Note>
        That jump is so extreme your speed would be indistinguishable from light speed — the bureau can’t
        print a ticket that precise. Try a closer year or a longer trip.
      </Note>
    )
  } else {
    const ratio = new Decimal(age).div(homeYears)
    const duration = JULIAN_YEAR_SECONDS.times(homeYears)
    const v = solveVelocityForRatio(ratio)
    const beta = v.div(C)
    const outLy = beta.times(homeYears).div(2)
    const holeBody = getBody(hole)
    const r = solveRadiusForRatio(holeBody.mass, ratio)
    const height = r.minus(holeBody.floorRadius)

    body = (
      <div className="grid gap-5 md:grid-cols-2">
        <Option
          kicker="Option A · The cruise"
          art={<Ship className="w-28 -rotate-6" />}
          title={`Fly at ${percentOfLight(beta)} of light speed`}
          onBook={() => book({ speed: v, place: 'none', radius: DEEP_SPACE_RADIUS, duration })}
        >
          Head out about <strong>{humanNumber(outLy.toNumber())} light-years</strong>, turn around, come home.
          You’ll have aged {humanNumber(age)} {age === 1 ? 'year' : 'years'}; Earth will be in {year}.
        </Option>
        <Option
          kicker="Option B · The black-hole spa"
          art={<BodyGlyph id={hole} size={72} />}
          title={`Hover ${humanDistance(height)} above the edge`}
          onBook={() => book({ speed: new Decimal(0), place: hole, radius: r, duration })}
        >
          <span className="flex flex-wrap gap-1.5 mb-2.5" role="radiogroup" aria-label="Black hole">
            {HOLES.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={id === hole}
                onClick={() => setHole(id)}
                className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset transition-colors ${
                  id === hole ? 'bg-ink text-cream ring-ink' : 'ring-ink/25 text-ink-2 hover:ring-ink/60'
                }`}
              >
                {PLACES[id].name}
              </button>
            ))}
          </span>
          Sit still next to {PLACES[hole].inSentence} and let gravity do the work. No engines required, just nerves
          of steel.
        </Option>
      </div>
    )
  }

  const shownYear = Number.isFinite(year) && yearText !== '' ? String(Math.trunc(year)) : '----'

  return (
    <div className="panel deco-frame p-5 sm:p-8 flex flex-col gap-8">
      {/* The route, on a little departures display. */}
      <div className="flex items-end gap-3 sm:gap-6" aria-hidden>
        <RouteEnd label="Departing" year={String(THIS_YEAR)} />
        <div className="relative flex-1 mb-[0.9em] text-[15px] sm:text-[24px] border-t-2 border-dashed border-gold/40">
          <Ship className="absolute left-1/2 -translate-x-1/2 -top-[15px] w-[72px] sm:w-[96px] sm:-top-[18px]" />
        </div>
        <RouteEnd label="Arriving" year={shownYear.length > 7 ? '-------' : shownYear} right />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-mist-300 font-medium">Take me to the year</span>
            <input
              type="number"
              inputMode="numeric"
              className="field !text-5xl sm:!text-6xl !py-3 text-gold-300"
              value={yearText}
              onChange={(e) => setYearText(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Destination year presets">
            {YEAR_CHIPS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYearText(String(y))}
                className={`chip ${Number(yearText) === y ? 'chip-active' : ''}`}
              >
                {y < 10000 ? y : y.toLocaleString('en-US')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-mist-300 font-medium">…while I only age (years)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              className="field !text-5xl sm:!text-6xl !py-3"
              value={ageText}
              onChange={(e) => setAgeText(e.target.value)}
            />
          </label>
          <p className="text-sm text-mist-400">
            How long the trip feels to you. Everyone at home lives through every year in between.
          </p>
        </div>
      </div>
      {body}
    </div>
  )
}

function RouteEnd({ label, year, right = false }: { label: string; year: string; right?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${right ? 'items-end' : 'items-start'}`}>
      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mist-500">{label}</span>
      <span className="text-[15px] sm:text-[24px]">
        <SplitFlap text={year} />
      </span>
    </div>
  )
}

function Option(props: {
  kicker: string
  art: React.ReactNode
  title: string
  onBook: () => void
  children: React.ReactNode
}) {
  return (
    <div className="ticket rounded-[20px] p-5 sm:p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 h-14">
        <div className="ticket-label !text-you-700">{props.kicker}</div>
        <div className="shrink-0 grid place-items-center h-14 w-28 -mr-2">{props.art}</div>
      </div>
      <div className="font-display text-[26px] font-semibold leading-tight">{props.title}</div>
      <div className="text-ink-2 flex-1 leading-relaxed">{props.children}</div>
      <button type="button" onClick={props.onBook} className="btn-ink self-start mt-2">
        Book it & see the boarding pass
      </button>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-gold/20 px-5 py-4 text-mist-200">{children}</p>
}
