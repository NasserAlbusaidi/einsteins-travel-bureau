/**
 * Inverse dilation: given a desired proper-time ratio (traveler / reference),
 * find the velocity (pure SR) or the radius (pure GR) that produces it.
 *
 * Both solutions have closed forms.
 */
import Decimal from 'decimal.js'
import { C } from './constants'
import { schwarzschildRadius } from './relativity'
import type { Scalar } from './types'

function toDecimal(x: Scalar): Decimal {
  return x instanceof Decimal ? x : new Decimal(x)
}

function assertRatioInRange(ratio: Decimal): void {
  if (ratio.lte(0) || ratio.gt(1)) {
    throw new Error(
      `Ratio must be in (0, 1], got ${ratio.toString()}. ` +
        'Ratio = traveler proper time / reference proper time.',
    )
  }
}

/**
 * Solve for the velocity a traveler must have (in flat space) so that
 * their proper-time ratio relative to a stationary observer equals `ratio`.
 *
 *   ratio = √(1 − v²/c²)   ⇒   v = c · √(1 − ratio²)
 *
 * @param ratio Target proper-time ratio ∈ (0, 1].
 * @returns Velocity in m/s.
 * @throws If ratio is outside (0, 1].
 */
export function solveVelocityForRatio(ratio: Scalar): Decimal {
  const r = toDecimal(ratio)
  assertRatioInRange(r)
  const radicand = new Decimal(1).minus(r.pow(2))
  return C.times(Decimal.sqrt(radicand))
}

/**
 * Solve for the radius at which a stationary observer in the field of a point
 * mass experiences proper time at the desired ratio relative to a distant
 * observer.
 *
 *   ratio = √(1 − r_s/r)   ⇒   r = r_s / (1 − ratio²)
 *
 * @param mass Mass of the gravitating body in kg (must be > 0).
 * @param ratio Target proper-time ratio ∈ (0, 1].
 * @returns Radius in m. Returns +Infinity when ratio = 1 (no dilation).
 * @throws If mass ≤ 0 or ratio outside (0, 1].
 */
export function solveRadiusForRatio(mass: Scalar, ratio: Scalar): Decimal {
  const M = toDecimal(mass)
  if (M.lte(0)) {
    throw new Error(`Mass must be > 0, got ${M.toString()}`)
  }
  const r = toDecimal(ratio)
  assertRatioInRange(r)
  const rs = schwarzschildRadius(M)
  const denom = new Decimal(1).minus(r.pow(2))
  if (denom.isZero()) {
    // ratio = 1: would need r = ∞. Decimal division by zero returns Infinity.
    return new Decimal(Infinity)
  }
  return rs.div(denom)
}

/** Input to {@link solveForRatio}. */
export interface SolveForRatioInput {
  /** Target proper-time ratio ∈ (0, 1]. */
  readonly ratio: Scalar
  /** Mass of the gravitating body in kg (0 means no gravitational solution). */
  readonly mass: Scalar
}

/** Output of {@link solveForRatio}: both solutions where physically feasible. */
export interface SolveForRatioResult {
  /** Pure-SR velocity solution (m/s), or null if infeasible. */
  readonly velocity: Decimal | null
  /** Pure-GR radius solution (m), or null if mass ≤ 0 or infeasible. */
  readonly radius: Decimal | null
}

/**
 * Return both the velocity-only and the radius-only solution for a given
 * target ratio. Either slot is null when that branch is infeasible (e.g.,
 * no mass means no gravitational solution).
 */
export function solveForRatio(input: SolveForRatioInput): SolveForRatioResult {
  const r = toDecimal(input.ratio)
  const M = toDecimal(input.mass)

  let velocity: Decimal | null
  try {
    velocity = solveVelocityForRatio(r)
  } catch {
    velocity = null
  }

  let radius: Decimal | null = null
  if (M.gt(0)) {
    try {
      radius = solveRadiusForRatio(M, r)
    } catch {
      radius = null
    }
  }

  return { velocity, radius }
}
