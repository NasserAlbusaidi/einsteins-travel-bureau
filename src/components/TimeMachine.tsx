import { useState } from 'react'
import Decimal from 'decimal.js'
import { useStore } from '../store'
import { solveRadiusForRatio, solveVelocityForRatio } from '../physics/solver'
import { DEEP_SPACE_RADIUS, getBody, type BodyId } from '../physics/bodies'
import { C, JULIAN_YEAR_SECONDS } from '../physics/constants'
import { PLACES } from '../copy/places'
import { humanDistance, humanNumber, percentOfLight } from '../humanize'
import type { Trip } from '../trip'

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
    document.getElementById('boarding-pass')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      <div className="grid gap-4 md:grid-cols-2">
        <Option
          kicker="Option A · The cruise"
          title={`Fly at ${percentOfLight(beta)} of light speed`}
          onBook={() => book({ speed: v, place: 'none', radius: DEEP_SPACE_RADIUS, duration })}
        >
          Head out about <strong>{humanNumber(outLy.toNumber())} light-years</strong>, turn around, and come home.
          You’ll have aged {humanNumber(age)} {age === 1 ? 'year' : 'years'}; Earth will be in {year}.
        </Option>
        <Option
          kicker="Option B · The black-hole spa"
          title={`Hover ${humanDistance(height)} above the edge`}
          onBook={() => book({ speed: new Decimal(0), place: hole, radius: r, duration })}
        >
          <span className="flex flex-wrap gap-1.5 mb-2" role="radiogroup" aria-label="Black hole">
            {HOLES.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={id === hole}
                onClick={() => setHole(id)}
                className={`chip ${id === hole ? 'chip-active' : ''}`}
              >
                {PLACES[id].emoji} {PLACES[id].name}
              </button>
            ))}
          </span>
          Sit still next to {PLACES[hole].inSentence} and let gravity do the work. No engines required — just
          nerves of steel.
        </Option>
      </div>
    )
  }

  return (
    <div className="paper-card p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-ink">I want to arrive in the year</span>
          <input
            type="number"
            inputMode="numeric"
            className="field w-40"
            value={yearText}
            onChange={(e) => setYearText(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-ink">…while only aging (years)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            className="field w-40"
            value={ageText}
            onChange={(e) => setAgeText(e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5 -mt-2" role="group" aria-label="Destination year presets">
        {YEAR_CHIPS.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setYearText(String(y))}
            className={`chip ${Number(yearText) === y ? 'chip-active' : ''}`}
          >
            Year {y < 10000 ? y : y.toLocaleString('en-US')}
          </button>
        ))}
      </div>
      {body}
    </div>
  )
}

function Option(props: { kicker: string; title: string; onBook: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border-2 border-terracotta/50 bg-paper-light p-4 flex flex-col gap-2">
      <div className="text-sm font-semibold uppercase tracking-wider text-terracotta-dark">{props.kicker}</div>
      <div className="font-display text-2xl text-ink leading-tight">{props.title}</div>
      <div className="text-ink-light flex-1">{props.children}</div>
      <button type="button" onClick={props.onBook} className="btn-primary self-start mt-1">
        Book it & see the boarding pass
      </button>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-sm bg-paper-dark/40 px-4 py-3 text-ink">{children}</p>
}
