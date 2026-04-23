/**
 * Preset scenarios — each one is a directly runnable dilation experiment.
 * `traveler` is whoever we're asking about; `reference` is the baseline.
 * `duration` is in seconds of the reference observer's proper time.
 */
import Decimal from 'decimal.js'
import {
  C,
  SUN_MASS,
  EARTH_MASS,
  EARTH_RADIUS,
  GPS_ORBITAL_RADIUS,
  GPS_ORBITAL_VELOCITY,
  ISS_ORBITAL_RADIUS,
  ISS_ORBITAL_VELOCITY,
  DAY_SECONDS,
  JULIAN_YEAR_SECONDS,
} from './constants'
import { schwarzschildRadius } from './relativity'
import type { ObserverState } from './types'

/**
 * Shape of the traveler's trajectory, used by the Minkowski diagram.
 * Dilation math uses |v| — so trajectory shape is viz-only.
 */
export type Trajectory =
  | { readonly kind: 'linear' }
  | { readonly kind: 'round-trip'; readonly turnaroundFraction: number }

/**
 * A dilation scenario: pair of observers + how long we simulate (reference time).
 */
export interface Scenario {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly traveler: ObserverState
  readonly reference: ObserverState
  readonly duration: Decimal
  /** Optional label describing what the user should expect to see. */
  readonly expected?: string
  /** How to draw the trajectory on the spacetime diagram. Defaults to linear. */
  readonly trajectory?: Trajectory
}

const EARTH_SURFACE_REST: ObserverState = {
  velocity: 0,
  radius: EARTH_RADIUS,
  mass: EARTH_MASS,
}

/** Effectively flat, at rest — used for thought experiments. */
const FLAT_SPACE_REST: ObserverState = {
  velocity: 0,
  radius: new Decimal('1e20'),
  mass: 0,
}

// --- Miller's planet setup ---------------------------------------------------
// Interstellar's Miller's planet: 1 hour at surface = 7 Earth years.
// Ratio = 3600 s / (7 × Julian year) ≈ 1.630e-5.
// Pick Gargantua-like supermassive BH (≈ 1e8 M☉), then tune r so the stationary
// observer sees exactly this ratio. Resulting r sits just above r_s
// (unphysically close in reality, but the numbers work for the demonstration).
const MILLER_RATIO = new Decimal(3600).div(new Decimal(7).times(JULIAN_YEAR_SECONDS))
const GARGANTUA_MASS = SUN_MASS.times('1e8')
const GARGANTUA_RS = schwarzschildRadius(GARGANTUA_MASS)
const MILLER_RADIUS = GARGANTUA_RS.div(new Decimal(1).minus(MILLER_RATIO.pow(2)))

const MILLERS_PLANET: ObserverState = {
  velocity: 0,
  radius: MILLER_RADIUS,
  mass: GARGANTUA_MASS,
}

// --- Twin-paradox setup ------------------------------------------------------
// Alpha Centauri is 4.37 ly away. Round trip at 0.9c ⇒ 2 × 4.37 / 0.9 ≈ 9.71 yr
// in Earth frame. Traveler ages this × √(1 − 0.81) ≈ 4.23 yr.
const ALPHA_CENTAURI_LY = new Decimal('4.37')
const TWIN_VELOCITY_FRAC = new Decimal('0.9')
const TWIN_EARTH_DURATION = ALPHA_CENTAURI_LY.times(2)
  .div(TWIN_VELOCITY_FRAC)
  .times(JULIAN_YEAR_SECONDS)

// -----------------------------------------------------------------------------

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'gps',
    name: 'GPS satellite',
    description:
      'A GPS satellite orbits ~20,180 km above Earth at ~3,874 m/s. Gravity wins (higher up in the well), but velocity subtracts a bit. Without correcting for this, GPS fixes would drift ~10 km per day.',
    traveler: { velocity: GPS_ORBITAL_VELOCITY, radius: GPS_ORBITAL_RADIUS, mass: EARTH_MASS },
    reference: EARTH_SURFACE_REST,
    duration: DAY_SECONDS,
    expected: '+38 μs per day (satellite clock runs faster)',
  },
  {
    id: 'iss',
    name: 'ISS astronaut',
    description:
      "The ISS orbits at ~408 km altitude at ~7,660 m/s. Velocity wins — astronauts age slightly less than their colleagues on the ground.",
    traveler: { velocity: ISS_ORBITAL_VELOCITY, radius: ISS_ORBITAL_RADIUS, mass: EARTH_MASS },
    reference: EARTH_SURFACE_REST,
    duration: DAY_SECONDS,
    expected: '~−25 μs per day (astronaut loses time)',
  },
  {
    id: 'scott-kelly',
    name: 'Scott Kelly — 340 days on ISS',
    description:
      "Scott Kelly's One-Year Mission: 340 days on the ISS while twin Mark stayed on Earth. Net difference is real but tiny — a few milliseconds of lost ageing.",
    traveler: { velocity: ISS_ORBITAL_VELOCITY, radius: ISS_ORBITAL_RADIUS, mass: EARTH_MASS },
    reference: EARTH_SURFACE_REST,
    duration: new Decimal(340).times(DAY_SECONDS),
    expected: '~−8 ms over the mission',
  },
  {
    id: 'flight',
    name: 'Commercial flight (SF → Tokyo)',
    description:
      '11-hour flight at 900 km/h and 10 km altitude. Gravitational time-gain at altitude slightly beats the velocity loss at 250 m/s — the crew ages a few nanoseconds more than the ground.',
    traveler: { velocity: 250, radius: EARTH_RADIUS.plus(10000), mass: EARTH_MASS },
    reference: EARTH_SURFACE_REST,
    duration: new Decimal(11).times(3600),
    expected: '+a few tens of nanoseconds',
  },
  {
    id: 'twin-paradox',
    name: 'Twin paradox (Alpha Centauri round-trip at 0.9c)',
    description:
      'One twin travels to Alpha Centauri (4.37 ly) and back at 0.9c while the other stays home. Earth frame: ~9.71 years elapse. Traveler: ~4.23 years. Idealized — ignores acceleration.',
    traveler: { velocity: C.times(TWIN_VELOCITY_FRAC), radius: new Decimal('1e20'), mass: 0 },
    reference: FLAT_SPACE_REST,
    duration: TWIN_EARTH_DURATION,
    expected: 'Traveler 4.23 yr younger than stay-home twin',
    trajectory: { kind: 'round-trip', turnaroundFraction: 0.5 },
  },
  {
    id: 'millers-planet',
    name: "Miller's planet (Interstellar)",
    description:
      'A planet hovering just above a 100-million-solar-mass black hole such that 1 hour on the surface equals 7 years outside. An extreme gravity-dilation demonstration.',
    traveler: MILLERS_PLANET,
    reference: FLAT_SPACE_REST,
    duration: new Decimal(7).times(JULIAN_YEAR_SECONDS),
    expected: '7 yr outside ↔ 1 hour on the planet',
  },
  {
    id: 'hail-mary',
    name: 'Hail Mary cruise (0.92c)',
    description:
      'Project Hail Mary: the Hail Mary cruises at 0.92c. γ ≈ 2.55, so for every 10 years back home about 4 shipboard years pass.',
    traveler: { velocity: C.times('0.92'), radius: new Decimal('1e20'), mass: 0 },
    reference: FLAT_SPACE_REST,
    duration: new Decimal(10).times(JULIAN_YEAR_SECONDS),
    expected: 'Traveler ages ≈ 3.92 yr per 10 Earth years',
  },
]

const SCENARIO_BY_ID: ReadonlyMap<string, Scenario> = new Map(SCENARIOS.map((s) => [s.id, s]))

/** Fetch a scenario by id. Throws on unknown ids. */
export function getScenario(id: string): Scenario {
  const s = SCENARIO_BY_ID.get(id)
  if (!s) throw new Error(`Unknown scenario id: "${id}"`)
  return s
}
