/**
 * Relativity: pure functions for time dilation.
 *
 * All math goes through decimal.js at 50-digit precision (set in ./constants.ts).
 * Float64 silently collapses `1 - v²/c²` to `1` for speeds below ~100 m/s,
 * which hides real physics (commercial flights, walking). Decimal.js preserves it.
 *
 * Zero React/DOM imports — import this from Node to compute GPS drift on the CLI.
 *
 * References:
 *  - Misner, Thorne, Wheeler. Gravitation (1973). Ch. 23 (Schwarzschild).
 *  - Hartle, Gravity (2003). Ch. 9.
 *  - https://en.wikipedia.org/wiki/Time_dilation
 *  - https://en.wikipedia.org/wiki/Schwarzschild_metric
 */

import Decimal from 'decimal.js'
import { C, C_SQUARED, G } from './constants'
import type { DilationResult, ObserverState, Scalar } from './types'

/** Coerce any Scalar to a Decimal. Decimal inputs pass through. */
function toDecimal(x: Scalar): Decimal {
  return x instanceof Decimal ? x : new Decimal(x)
}

/** Relative-difference threshold below which two effects are called "balanced". */
const BALANCED_BAND = new Decimal('0.2') // ±20 %

/**
 * Lorentz factor γ = 1 / √(1 − v²/c²).
 *
 * Units: velocity in m/s, dimensionless output.
 *
 * @throws If |v| ≥ c (γ diverges or is imaginary).
 * @see https://en.wikipedia.org/wiki/Lorentz_factor
 */
export function lorentzFactor(velocity: Scalar): Decimal {
  const v = toDecimal(velocity).abs()
  if (v.gte(C)) {
    throw new Error(
      `|v| = ${v.toString()} m/s ≥ c; Lorentz factor is undefined at or beyond light speed`,
    )
  }
  const betaSquared = v.pow(2).div(C_SQUARED)
  return new Decimal(1).div(Decimal.sqrt(new Decimal(1).minus(betaSquared)))
}

/**
 * Schwarzschild radius r_s = 2GM/c². Event horizon of a non-rotating mass.
 *
 * Units: mass in kg, output in m.
 */
export function schwarzschildRadius(mass: Scalar): Decimal {
  const M = toDecimal(mass)
  return M.times(G).times(2).div(C_SQUARED)
}

/**
 * Gravitational time-dilation factor for a stationary observer at radius r
 * in the Schwarzschild metric (weak-field, non-rotating point mass):
 *   dτ/dt = √(1 − 2GM/(rc²)) = √(1 − r_s/r)
 *
 * Units: mass in kg, radius in m, dimensionless output.
 *
 * - r → ∞   : returns 1 (no dilation far from the mass)
 * - r = r_s : returns 0 exactly (clock stops at the horizon)
 * - r < r_s : throws (no stationary observer exists inside the horizon)
 * - M = 0   : returns 1 (flat space)
 *
 * @see https://en.wikipedia.org/wiki/Gravitational_time_dilation
 */
export function gravitationalFactor(mass: Scalar, radius: Scalar): Decimal {
  const M = toDecimal(mass)
  if (M.isZero()) return new Decimal(1)

  const r = toDecimal(radius)
  const rs = schwarzschildRadius(M)

  if (r.lt(rs)) {
    throw new Error(
      `r = ${r.toString()} m is inside the Schwarzschild radius (${rs.toString()} m); ` +
        `no stationary observer exists here`,
    )
  }
  if (r.eq(rs)) return new Decimal(0)

  return Decimal.sqrt(new Decimal(1).minus(rs.div(r)))
}

/**
 * Proper-time rate dτ/dt for an observer with coordinate velocity v at radius r
 * in the field of a point mass M. Weak-field Schwarzschild, combining SR + GR:
 *   dτ/dt = √((1 − 2GM/(rc²)) − v²/c²)
 *
 * This is the rate of the observer's wristwatch vs. a distant (Schwarzschild)
 * observer's coordinate time.
 *
 * Units: velocity m/s, radius m, mass kg. Dimensionless output.
 *
 * @throws If |v| ≥ c, if r is inside r_s, or if the combined expression
 *         would be negative (observer is superluminal relative to the metric).
 */
export function properTimeRate(state: ObserverState): Decimal {
  const v = toDecimal(state.velocity).abs()
  const M = toDecimal(state.mass)
  const r = toDecimal(state.radius)

  if (v.gte(C)) {
    throw new Error(`|v| = ${v.toString()} m/s ≥ c`)
  }

  let gravTerm: Decimal
  if (M.isZero()) {
    gravTerm = new Decimal(1)
  } else {
    const rs = schwarzschildRadius(M)
    if (r.lt(rs)) {
      throw new Error(
        `r = ${r.toString()} m is inside r_s = ${rs.toString()} m; stationary observer undefined`,
      )
    }
    gravTerm = new Decimal(1).minus(rs.div(r))
  }

  const velTerm = v.pow(2).div(C_SQUARED)
  const combined = gravTerm.minus(velTerm)

  if (combined.isNegative()) {
    throw new Error(
      'Combined dilation is negative: (1 − 2GM/(rc²)) − v²/c² < 0. ' +
        'This observer cannot exist at this radius and velocity (effectively superluminal).',
    )
  }
  return Decimal.sqrt(combined)
}

/**
 * Compare two observers over an interval of reference-observer proper time.
 *
 * @param traveler              Traveler's state (what we want to know about).
 * @param reference             Reference observer's state (the baseline).
 * @param referenceProperTime   How long the reference observer ages, in seconds.
 * @returns Elapsed times for both, plus their ratio and the dominant effect.
 */
export function dilate(
  traveler: ObserverState,
  reference: ObserverState,
  referenceProperTime: Scalar,
): DilationResult {
  const refTime = toDecimal(referenceProperTime)
  const rateTrav = properTimeRate(traveler)
  const rateRef = properTimeRate(reference)
  if (rateRef.isZero()) {
    throw new Error(
      'Reference observer proper-time rate is 0 (reference is at the event horizon).',
    )
  }

  const ratio = rateTrav.div(rateRef)
  const travelerProperTime = refTime.times(ratio)
  const delta = travelerProperTime.minus(refTime)

  return {
    travelerProperTime,
    referenceProperTime: refTime,
    delta,
    ratio,
    dominantEffect: classifyEffect(traveler, reference),
  }
}

/**
 * Classify the dominant contributor to the dilation between two observers.
 *
 * Compares the magnitude of the difference in gravitational deficit (r_s/r)
 * vs. the difference in velocity term (v²/c²). If they agree within ±20 %,
 * the result is called "balanced".
 */
function classifyEffect(
  traveler: ObserverState,
  reference: ObserverState,
): 'velocity' | 'gravity' | 'balanced' {
  const velTrav = toDecimal(traveler.velocity).abs().pow(2).div(C_SQUARED)
  const velRef = toDecimal(reference.velocity).abs().pow(2).div(C_SQUARED)
  const velDiff = velTrav.minus(velRef).abs()

  const gravDeficit = (state: ObserverState): Decimal => {
    const M = toDecimal(state.mass)
    if (M.isZero()) return new Decimal(0)
    return schwarzschildRadius(M).div(toDecimal(state.radius))
  }
  const gravDiff = gravDeficit(traveler).minus(gravDeficit(reference)).abs()

  if (velDiff.isZero() && gravDiff.isZero()) return 'balanced'
  if (velDiff.isZero()) return 'gravity'
  if (gravDiff.isZero()) return 'velocity'

  // Both non-zero: check if they're within ±20% of each other.
  const ratio = velDiff.div(gravDiff)
  const low = new Decimal(1).minus(BALANCED_BAND)
  const high = new Decimal(1).plus(BALANCED_BAND)
  if (ratio.gte(low) && ratio.lte(high)) return 'balanced'
  return ratio.gt(1) ? 'velocity' : 'gravity'
}
