/**
 * Plain-English formatters for people who don't think in SI prefixes.
 * Display-only — never feed these strings back into physics.
 */
import Decimal from 'decimal.js'
import {
  AU,
  C,
  DAY_SECONDS,
  EARTH_MASS,
  JULIAN_YEAR_SECONDS,
  LIGHT_YEAR,
  SUN_MASS,
} from './physics/constants'
import type { Scalar } from './physics/types'

function d(x: Scalar): Decimal {
  return x instanceof Decimal ? x : new Decimal(x)
}

const BIG_WORDS: readonly [number, string][] = [
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
]

/** 3 significant figures, thousands separators, words for millions and up. */
export function humanNumber(n: number): string {
  if (!Number.isFinite(n)) return '∞'
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1e15) {
    const exp = Math.floor(Math.log10(abs))
    const mant = abs / 10 ** exp
    return `${sign}${trim(mant.toPrecision(2))} × 10${superscript(exp)}`
  }
  for (const [size, word] of BIG_WORDS) {
    if (abs >= size) return `${sign}${trim((abs / size).toPrecision(3))} ${word}`
  }
  if (abs >= 1000) return sign + Math.round(abs).toLocaleString('en-US')
  if (abs === 0) return '0'
  return sign + Number(abs.toPrecision(3)).toLocaleString('en-US', { maximumFractionDigits: 6 })
}

function trim(s: string): string {
  return s.includes('.') && !s.includes('e') ? s.replace(/\.?0+$/, '') : s
}

const SUPERSCRIPTS: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

export function superscript(n: number): string {
  return String(n)
    .split('')
    .map((ch) => SUPERSCRIPTS[ch] ?? ch)
    .join('')
}

function unit(n: number, singular: string, plural = `${singular}s`): string {
  const shown = humanNumber(n)
  return `${shown} ${shown === '1' ? singular : plural}`
}

export interface HumanDuration {
  /** e.g. "38.4 microseconds" */
  readonly text: string
  /** Optional plain gloss for unfamiliar units, e.g. "millionths of a second". */
  readonly gloss?: string
}

/** Pick the most familiar unit for a span of time. Sign is dropped. */
export function humanDuration(seconds: Scalar): HumanDuration {
  const s = d(seconds).abs()
  if (s.isZero()) return { text: 'no time at all' }
  // Compare against unit boundaries with a little headroom, so 3599.99 s reads
  // "1 hour" rather than rounding up to "60 minutes".
  const t = s.times('1.001')
  if (t.lt('1e-12')) {
    const exp = Math.floor(Decimal.log10(s).toNumber())
    const mant = s.div(new Decimal(10).pow(exp)).toNumber()
    return {
      text: `${trim(mant.toPrecision(2))} × 10${superscript(exp)} seconds`,
      gloss: 'far too small for any clock ever built',
    }
  }
  if (t.lt('1e-9')) return { text: unit(s.times('1e12').toNumber(), 'picosecond'), gloss: 'trillionths of a second' }
  if (t.lt('1e-6')) return { text: unit(s.times('1e9').toNumber(), 'nanosecond'), gloss: 'billionths of a second' }
  if (t.lt('1e-3')) return { text: unit(s.times('1e6').toNumber(), 'microsecond'), gloss: 'millionths of a second' }
  if (t.lt(1)) return { text: unit(s.times('1e3').toNumber(), 'millisecond'), gloss: 'thousandths of a second' }
  if (t.lt(60)) return { text: unit(s.toNumber(), 'second') }
  if (t.lt(3600)) return { text: unit(s.div(60).toNumber(), 'minute') }
  if (t.lt(DAY_SECONDS)) return { text: unit(s.div(3600).toNumber(), 'hour') }
  if (t.lt(JULIAN_YEAR_SECONDS)) return { text: unit(s.div(DAY_SECONDS).toNumber(), 'day') }
  return { text: unit(s.div(JULIAN_YEAR_SECONDS).toNumber(), 'year') }
}

/** Shortcut when the gloss isn't wanted. */
export function durationText(seconds: Scalar): string {
  return humanDuration(seconds).text
}

/**
 * Express two durations in the same unit (picked from the larger one) so they
 * can be compared side by side: "4.23 years" vs "9.71 years". A value too small
 * to show in that unit gets its own: "59.9 minutes" vs "7 years".
 * Returns null when they'd print identically at display precision.
 */
export function sameUnitPair(a: Decimal, b: Decimal): [string, string] | null {
  const big = Decimal.max(a.abs(), b.abs())
  const [divisor, singular] = pairUnit(big)
  const fmt = (x: Decimal): string => {
    const n = x.abs().div(divisor).toNumber()
    // "0 years" helps nobody: let a tiny value pick its own unit instead.
    if (n < 0.005) return durationText(x)
    const str = n >= 100 ? humanNumber(n) : trim(n.toFixed(2))
    return `${str} ${str === '1' ? singular : `${singular}s`}`
  }
  const fa = fmt(a)
  const fb = fmt(b)
  return fa === fb ? null : [fa, fb]
}

function pairUnit(s: Decimal): [Decimal, string] {
  if (s.gte(JULIAN_YEAR_SECONDS)) return [JULIAN_YEAR_SECONDS, 'year']
  if (s.gte(DAY_SECONDS)) return [DAY_SECONDS, 'day']
  if (s.gte(3600)) return [new Decimal(3600), 'hour']
  if (s.gte(60)) return [new Decimal(60), 'minute']
  return [new Decimal(1), 'second']
}

/** "90% of light speed" above 1 % c, otherwise km/h. */
export function humanSpeed(velocity: Scalar): string {
  const v = d(velocity).abs()
  if (v.isZero()) return 'standing still'
  const beta = v.div(C)
  if (beta.gte('0.01')) return `${percentOfLight(beta)} of light speed`
  const kmh = v.times('3.6').toNumber()
  if (kmh < 10) return `${trim(kmh.toPrecision(2))} km/h`
  return `${humanNumber(kmh)} km/h`
}

/**
 * β as a percentage with just enough decimals to not round up to 100 %.
 * 0.9 → "90%", 0.9999 → "99.99%", 0.9428 → "94.3%".
 */
export function percentOfLight(beta: Decimal): string {
  const gap = new Decimal(1).minus(beta)
  let decimals = gap.gt(0) ? Math.max(1, Math.ceil(-Decimal.log10(gap).toNumber()) - 1) : 1
  let out = trim(beta.times(100).toFixed(decimals, Decimal.ROUND_DOWN))
  while (out === '100' && decimals < 40) {
    decimals += 1
    out = trim(beta.times(100).toFixed(decimals, Decimal.ROUND_DOWN))
  }
  return `${out}%`
}

/** Metres → m / km / million km / AU-free light-years. */
export function humanDistance(meters: Scalar): string {
  const m = d(meters).abs()
  if (m.isZero()) return '0 metres'
  if (m.lt('0.001')) return 'less than a millimetre'
  if (m.lt(1)) return `${trim(m.times(100).toNumber().toPrecision(2))} cm`
  if (m.lt(1000)) return unit(Number(m.toNumber().toPrecision(3)), 'metre')
  if (m.lt(LIGHT_YEAR.div(10))) return `${humanNumber(m.div(1000).toNumber())} km`
  return unit(m.div(LIGHT_YEAR).toNumber(), 'light-year')
}

/** Distance in AU, for the math drawer and black-hole sizes. */
export function inAU(meters: Scalar): string {
  return `${humanNumber(d(meters).div(AU).toNumber())} AU`
}

/** "333,000 × the Earth" / "4.3 million × the Sun". */
export function humanMass(kg: Scalar): string {
  const m = d(kg)
  if (m.isZero()) return 'nothing'
  if (m.lt(SUN_MASS.div(100))) return `${humanNumber(m.div(EARTH_MASS).toNumber())} × the Earth`
  return `${humanNumber(m.div(SUN_MASS).toNumber())} × the Sun`
}

const MOON_DISTANCE = new Decimal('384400000')

/** How long a trip to the Moon would take at this speed. */
export function moonTripAt(velocity: Scalar): string | null {
  const v = d(velocity).abs()
  if (v.isZero()) return null
  return durationText(MOON_DISTANCE.div(v))
}
