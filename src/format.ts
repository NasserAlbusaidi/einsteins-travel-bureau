/**
 * Human-readable formatters. Take raw Decimal/Scalar values and pick the most
 * legible unit for the UI. These are display-only — never feed formatted
 * strings back into physics.
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

/** Signed toPrecision without the messy exponent when it's avoidable. */
function sig(x: Decimal, digits: number): string {
  const abs = x.abs()
  if (abs.isZero()) return '0'
  if (abs.gte('1e-4') && abs.lt('1e7')) {
    return x.toPrecision(digits)
  }
  return x.toExponential(digits - 1)
}

/** Velocity: switches to c-units for anything above 1 % c. */
export function formatVelocity(velocity: Scalar): string {
  const v = d(velocity).abs()
  const beta = v.div(C)
  const sign = d(velocity).isNegative() ? '−' : ''

  if (beta.gte('0.01')) {
    return `${sign}${sig(beta, 4)} c`
  }
  if (v.gte(1000)) {
    return `${sign}${sig(v.div(1000), 4)} km/s`
  }
  return `${sign}${sig(v, 4)} m/s`
}

/** Time: picks ns/μs/ms/s/min/hr/days/yr/centuries based on magnitude. */
export function formatTime(seconds: Scalar): string {
  const s = d(seconds)
  const abs = s.abs()
  const sign = s.isNegative() ? '−' : ''
  if (abs.isZero()) return '0 s'
  if (abs.lt('1e-6')) return `${sign}${sig(abs.times('1e9'), 4)} ns`
  if (abs.lt('1e-3')) return `${sign}${sig(abs.times('1e6'), 4)} μs`
  if (abs.lt(1)) return `${sign}${sig(abs.times('1e3'), 4)} ms`
  if (abs.lt(60)) return `${sign}${sig(abs, 4)} s`
  if (abs.lt(3600)) return `${sign}${sig(abs.div(60), 4)} min`
  if (abs.lt(DAY_SECONDS)) return `${sign}${sig(abs.div(3600), 4)} hr`
  if (abs.lt(JULIAN_YEAR_SECONDS)) return `${sign}${sig(abs.div(DAY_SECONDS), 4)} days`
  if (abs.lt(JULIAN_YEAR_SECONDS.times(100))) return `${sign}${sig(abs.div(JULIAN_YEAR_SECONDS), 4)} yr`
  return `${sign}${sig(abs.div(JULIAN_YEAR_SECONDS.times(100)), 4)} centuries`
}

/** Distance: m → km → AU → ly depending on magnitude. */
export function formatLength(meters: Scalar): string {
  const m = d(meters).abs()
  const sign = d(meters).isNegative() ? '−' : ''
  if (m.lt(1000)) return `${sign}${sig(m, 4)} m`
  if (m.lt(AU.div(10))) return `${sign}${sig(m.div(1000), 4)} km`
  if (m.lt(LIGHT_YEAR.div(10))) return `${sign}${sig(m.div(AU), 4)} AU`
  return `${sign}${sig(m.div(LIGHT_YEAR), 4)} ly`
}

/** Mass: scientific for small, Earth-masses for Earth-scale, solar for stellar. */
export function formatMass(kg: Scalar): string {
  const m = d(kg)
  if (m.isZero()) return '0 kg (flat space)'
  const abs = m.abs()
  if (abs.lt(EARTH_MASS.div(100))) return `${sig(m, 3)} kg`
  if (abs.lt(SUN_MASS.div(100))) return `${sig(m.div(EARTH_MASS), 4)} M⊕`
  return `${sig(m.div(SUN_MASS), 4)} M☉`
}

/** Large number in a readable form — fixed for small, scientific for huge. */
export function formatNumber(x: Scalar, digits = 6): string {
  return sig(d(x), digits)
}

/** γ factor — always a positive dimensionless number. */
export function formatGamma(gamma: Scalar): string {
  const g = d(gamma)
  // When γ is indistinguishably close to 1 (everyday speeds), 6 fixed digits
  // hide the physics. Show the tiny excess explicitly: "1 + 3.336e-10".
  const excess = g.minus(1)
  if (g.gte(1) && excess.abs().lt('1e-4') && !excess.isZero()) {
    return `1 + ${excess.toExponential(3)}`
  }
  if (g.lt(10)) return g.toFixed(6)
  if (g.lt('1e4')) return sig(g, 5)
  return g.toExponential(4)
}

/** The ratio τ_trav / τ_ref. Same rules as γ but inverted scale. */
export function formatRatio(ratio: Scalar): string {
  const r = d(ratio)
  if (r.gte('1e-4') && r.lte('1e4')) return r.toPrecision(6)
  return r.toExponential(4)
}
