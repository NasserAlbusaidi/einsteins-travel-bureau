/**
 * The trip model the UI works with. Four human-sized knobs —
 * how fast, near what, how high, how long — mapped onto the two-observer
 * physics in ./physics.
 *
 * "Home" is derived, never configured:
 *  - trips around Earth compare against someone standing still on the ground;
 *  - every other trip compares against someone far from any mass.
 * (Earth's own pull on the stay-at-home twin shifts those results by under
 * 1 part in a billion, which is invisible next to the effects involved.)
 */
import Decimal from 'decimal.js'
import { dilate } from './physics/relativity'
import { splitEffects, type EffectSplit } from './physics/effects'
import { SCENARIOS, type Scenario } from './physics/scenarios'
import { C, EARTH_MASS, EARTH_RADIUS } from './physics/constants'
import {
  DEEP_SPACE_RADIUS,
  bodyForMass,
  getBody,
  isBodyId,
  type BodyId,
} from './physics/bodies'
import type { DilationResult, ObserverState } from './physics/types'

export interface Trip {
  /** Traveler speed, m/s. */
  readonly speed: Decimal
  /** What the traveler is near. */
  readonly place: BodyId
  /** Distance from the body's centre, m. Ignored in empty space. */
  readonly radius: Decimal
  /** How long the trip lasts on the home clock, s. */
  readonly duration: Decimal
}

const EARTH_GROUND: ObserverState = { velocity: 0, radius: EARTH_RADIUS, mass: EARTH_MASS }
const FAR_AWAY: ObserverState = { velocity: 0, radius: DEEP_SPACE_RADIUS, mass: 0 }

export function homeObserver(place: BodyId): ObserverState {
  return place === 'earth' ? EARTH_GROUND : FAR_AWAY
}

export function travelerObserver(trip: Trip): ObserverState {
  const body = getBody(trip.place)
  return {
    velocity: trip.speed,
    radius: body.kind === 'empty' ? DEEP_SPACE_RADIUS : trip.radius,
    mass: body.mass,
  }
}

/** Height above the body's surface (or event horizon), m. */
export function heightOf(trip: Trip): Decimal {
  const body = getBody(trip.place)
  if (body.kind === 'empty') return new Decimal(0)
  return trip.radius.minus(body.floorRadius)
}

export function withHeight(trip: Trip, height: Decimal): Trip {
  const body = getBody(trip.place)
  return { ...trip, radius: body.floorRadius.plus(height) }
}

export function withPlace(trip: Trip, place: BodyId): Trip {
  const body = getBody(place)
  return { ...trip, place, radius: body.floorRadius.plus(body.defaultHeight) }
}

// --- Evaluation ---------------------------------------------------------------

export type TripProblem = 'faster-than-light' | 'swallowed'

export type TripOutcome =
  | {
      readonly ok: true
      readonly result: DilationResult
      readonly split: EffectSplit
      readonly traveler: ObserverState
      readonly home: ObserverState
    }
  | { readonly ok: false; readonly problem: TripProblem }

export function evaluateTrip(trip: Trip): TripOutcome {
  if (trip.speed.abs().gte(C)) return { ok: false, problem: 'faster-than-light' }
  const traveler = travelerObserver(trip)
  const home = homeObserver(trip.place)
  try {
    return {
      ok: true,
      result: dilate(traveler, home, trip.duration),
      split: splitEffects(traveler, home, trip.duration),
      traveler,
      home,
    }
  } catch {
    // Either inside the horizon or moving so fast this deep in the well that
    // the combined rate goes imaginary. Both mean "the black hole wins".
    return { ok: false, problem: 'swallowed' }
  }
}

// --- Presets --------------------------------------------------------------------

/** Re-express a physics scenario as a Trip. Throws if it doesn't fit the model. */
export function tripFromScenario(s: Scenario): Trip {
  const mass = new Decimal(s.traveler.mass)
  const body = bodyForMass(mass)
  if (!body) throw new Error(`Scenario "${s.id}" uses a body the trip model doesn't know`)
  return {
    speed: new Decimal(s.traveler.velocity),
    place: body.id,
    radius: body.kind === 'empty' ? DEEP_SPACE_RADIUS : new Decimal(s.traveler.radius),
    duration: s.duration,
  }
}

export const PRESET_IDS: readonly string[] = SCENARIOS.map((s) => s.id)

export const PRESET_TRIPS: ReadonlyMap<string, Trip> = new Map(
  SCENARIOS.map((s) => [s.id, tripFromScenario(s)]),
)

export function getPresetTrip(id: string): Trip | undefined {
  return PRESET_TRIPS.get(id)
}

export const DEFAULT_PRESET = 'twin-paradox'

// --- URL hash -------------------------------------------------------------------

export interface TripState {
  readonly presetId: string | null
  readonly trip: Trip
}

/** `trip=<preset>` for untouched presets, explicit numbers otherwise. */
export function encodeTrip({ presetId, trip }: TripState): string {
  const p = new URLSearchParams()
  if (presetId) {
    p.set('trip', presetId)
    return p.toString()
  }
  p.set('v', short(trip.speed))
  p.set('at', trip.place)
  if (trip.place !== 'none') p.set('h', short(heightOf(trip)))
  p.set('t', short(trip.duration))
  return p.toString()
}

export function decodeTrip(hash: string): TripState | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''))
  // `s=` is the pre-rework share-link format; presets still resolve.
  const presetId = p.get('trip') ?? p.get('s')
  if (presetId) {
    const preset = getPresetTrip(presetId)
    return preset ? { presetId, trip: preset } : null
  }
  const v = num(p.get('v'))
  const at = p.get('at')
  const t = num(p.get('t'))
  if (!v || !t || !at || !isBodyId(at)) return null
  if (v.isNegative() || v.gte(C) || t.lte(0)) return null
  const base: Trip = { speed: v, place: at, radius: getBody(at).floorRadius, duration: t }
  const h = num(p.get('h'))
  return { presetId: null, trip: h && h.gte(0) ? withHeight(base, h) : withPlace(base, at) }
}

/** 30 significant digits: enough for 99.99…% of light speed, short enough to paste. */
function short(x: Decimal): string {
  return x.toSignificantDigits(30).toString()
}

function num(x: string | null): Decimal | null {
  if (x === null) return null
  try {
    const n = new Decimal(x)
    return n.isFinite() ? n : null
  } catch {
    return null
  }
}
