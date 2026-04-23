import type Decimal from 'decimal.js'

/** A scalar that may be expressed as a number or a Decimal. */
export type Scalar = number | Decimal | string

/**
 * State of an observer used for combined time-dilation calculations.
 * `velocity` is local (coordinate) velocity in m/s; `radius` is distance
 * from the gravitating body's center in m. `mass` is the mass of the body
 * creating the gravitational field (in kg). Setting mass=0 disables
 * gravitational dilation (flat Minkowski).
 */
export interface ObserverState {
  readonly velocity: Scalar
  readonly radius: Scalar
  readonly mass: Scalar
}

/** Result of combined time-dilation over a coordinate time interval. */
export interface DilationResult {
  /** Proper time elapsed for the traveler (seconds). */
  readonly travelerProperTime: Decimal
  /** Proper time elapsed for the reference observer (seconds). */
  readonly referenceProperTime: Decimal
  /** Traveler ages less by this many seconds (positive = traveler younger). */
  readonly delta: Decimal
  /** Ratio travelerProperTime / referenceProperTime. */
  readonly ratio: Decimal
  /** Which effect dominated the result. */
  readonly dominantEffect: 'velocity' | 'gravity' | 'balanced'
}
