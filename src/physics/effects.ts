/**
 * Split a dilation result into "how much came from speed" and "how much came
 * from gravity". Exact and additive: speed + gravity = total.
 *
 * gravity = T · (rate(v=0, r, M) / rate_ref − 1)
 * total   = T · (rate(v,   r, M) / rate_ref − 1)
 * speed   = total − gravity
 *
 * Positive values mean the traveler's clock gained time relative to home.
 */
import Decimal from 'decimal.js'
import { properTimeRate } from './relativity'
import type { ObserverState, Scalar } from './types'

export interface EffectSplit {
  /** Seconds gained (+) or lost (−) because of the traveler's speed. */
  readonly speed: Decimal
  /** Seconds gained (+) or lost (−) because of where the traveler sits in gravity. */
  readonly gravity: Decimal
  /** speed + gravity: the traveler's total gain (+) or loss (−). */
  readonly total: Decimal
}

export function splitEffects(
  traveler: ObserverState,
  reference: ObserverState,
  referenceProperTime: Scalar,
): EffectSplit {
  const T = new Decimal(referenceProperTime)
  const rateRef = properTimeRate(reference)
  const rateTrav = properTimeRate(traveler)
  const rateParked = properTimeRate({ ...traveler, velocity: 0 })

  const gravity = T.times(rateParked.div(rateRef).minus(1))
  const total = T.times(rateTrav.div(rateRef).minus(1))
  return { speed: total.minus(gravity), gravity, total }
}
