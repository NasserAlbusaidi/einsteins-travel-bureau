/**
 * Slider scales: map a slider position p ∈ [0, 1] to a physical value and back.
 * Physical ranges here span 10+ orders of magnitude, so linear sliders are
 * useless. Each scale is monotone and round-trips within slider resolution.
 */
import Decimal from 'decimal.js'
import { C } from './physics/constants'
import type { Body } from './physics/bodies'

export interface Scale {
  toPos(value: Decimal): number
  fromPos(pos: number): Decimal
}

const clamp01 = (p: number) => Math.max(0, Math.min(1, p))

/**
 * Log scale between min and max. With `zeroBelow`, positions under that
 * threshold mean exactly zero (e.g. "standing still", "on the surface").
 */
export function logScale(min: Decimal, max: Decimal, zeroBelow = 0): Scale {
  const lo = Decimal.log10(min).toNumber()
  const hi = Decimal.log10(max).toNumber()
  const span = hi - lo
  const start = zeroBelow
  return {
    toPos(value) {
      if (value.lte(0)) return 0
      const t = (Decimal.log10(value).toNumber() - lo) / span
      return clamp01(start + (1 - start) * clamp01(t))
    },
    fromPos(pos) {
      const p = clamp01(pos)
      if (p < start) return new Decimal(0)
      const t = start === 1 ? 0 : (p - start) / (1 - start)
      return new Decimal(10).pow(lo + span * t)
    },
  }
}

/**
 * Speed scale. Everyday speeds are log-spaced (1 m/s → 10 % c) over the first
 * 60 % of the track; the rest counts "nines" of light speed (10 % → 99.99 %),
 * which is where the interesting relativity lives.
 */
const ZERO_UNTIL = 0.02
const SPLIT = 0.6
const SLOW_MIN = new Decimal(1)
const SLOW_MAX = C.div(10)
const NINES = 4 // top of the track: 1 − β = 0.9 × 10⁻⁴ → 99.991 %
const slow = logScale(SLOW_MIN, SLOW_MAX)

export const speedScale: Scale = {
  toPos(v) {
    const a = v.abs()
    if (a.isZero()) return 0
    if (a.lte(SLOW_MAX)) {
      const t = slow.toPos(a)
      return ZERO_UNTIL + (SPLIT - ZERO_UNTIL) * t
    }
    const gap = new Decimal(1).minus(a.div(C))
    if (gap.lte(0)) return 1
    // gap = 0.9 · 10^(−NINES·t)
    const t = -Decimal.log10(gap.div('0.9')).toNumber() / NINES
    return clamp01(SPLIT + (1 - SPLIT) * clamp01(t))
  },
  fromPos(pos) {
    const p = clamp01(pos)
    if (p < ZERO_UNTIL) return new Decimal(0)
    if (p <= SPLIT) return slow.fromPos((p - ZERO_UNTIL) / (SPLIT - ZERO_UNTIL))
    const t = (p - SPLIT) / (1 - SPLIT)
    const gap = new Decimal('0.9').times(new Decimal(10).pow(-NINES * t))
    return C.times(new Decimal(1).minus(gap))
  },
}

/** Trip length (home clock): 1 minute → 10,000 years. */
export const durationScale = logScale(new Decimal(60), new Decimal('3.15576e11'))

/**
 * Height above a body: logarithmic from 1 m up to the body's limit. Bodies with
 * a surface reserve the bottom of the slider for "on the ground"; black holes
 * have no ground, so they start at 1 m.
 */
export function heightScale(body: Body): Scale {
  return logScale(new Decimal(1), body.maxHeight, body.kind === 'black-hole' ? 0 : 0.03)
}
