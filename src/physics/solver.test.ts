import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import { solveVelocityForRatio, solveRadiusForRatio, solveForRatio } from './solver'
import { C, EARTH_MASS, SUN_MASS, JULIAN_YEAR_SECONDS } from './constants'
import { lorentzFactor, gravitationalFactor } from './relativity'

describe('solveVelocityForRatio', () => {
  it('ratio = 1 ⇒ v = 0', () => {
    expect(solveVelocityForRatio(1).eq(0)).toBe(true)
  })

  it('ratio = 0.5 ⇒ v ≈ 0.866c (γ = 2)', () => {
    const v = solveVelocityForRatio(0.5)
    expect(v.div(C).toNumber()).toBeCloseTo(Math.sqrt(0.75), 10)
  })

  it('ratio = 1/3 ⇒ v ≈ 0.9428c (γ = 3, the 12yr-4yr puzzle)', () => {
    const v = solveVelocityForRatio(new Decimal(1).div(3))
    expect(v.div(C).toNumber()).toBeCloseTo(Math.sqrt(8 / 9), 10)
  })

  it('ratio = 0.1 ⇒ v ≈ 0.9950c (γ = 10)', () => {
    const v = solveVelocityForRatio('0.1')
    expect(v.div(C).toNumber()).toBeCloseTo(Math.sqrt(0.99), 10)
  })

  it('round-trip: γ(v(ratio)) = 1/ratio', () => {
    const target = new Decimal('0.25')
    const v = solveVelocityForRatio(target)
    const gamma = lorentzFactor(v)
    expect(gamma.times(target).toNumber()).toBeCloseTo(1, 12)
  })

  it('throws on ratio outside (0, 1]', () => {
    expect(() => solveVelocityForRatio(0)).toThrow()
    expect(() => solveVelocityForRatio(-1)).toThrow()
    expect(() => solveVelocityForRatio(2)).toThrow()
  })
})

describe('solveRadiusForRatio', () => {
  it('ratio = 1 ⇒ r = ∞ (returns very large value, or throws — pick one)', () => {
    // Flat-space ratio requires r → ∞; we return Infinity.
    const r = solveRadiusForRatio(EARTH_MASS, 1)
    expect(r.isFinite()).toBe(false)
  })

  it('ratio = 1/√2 ⇒ r = 2·r_s (since 1 - r_s/r = 0.5)', () => {
    const r = solveRadiusForRatio(EARTH_MASS, new Decimal(1).div(Decimal.sqrt(2)))
    // r_s Earth ≈ 8.87e-3 m, so r ≈ 1.774e-2 m
    expect(r.toNumber()).toBeCloseTo(2 * 0.008870, 5)
  })

  it('round-trip: gravitationalFactor(M, r(ratio)) = ratio', () => {
    const target = new Decimal('0.3')
    const r = solveRadiusForRatio(EARTH_MASS, target)
    const f = gravitationalFactor(EARTH_MASS, r)
    expect(f.toNumber()).toBeCloseTo(target.toNumber(), 12)
  })

  it("matches Miller's planet: 1 hour per 7 years at ≈ r_s of 1e8 M☉", () => {
    const ratio = new Decimal(3600).div(new Decimal(7).times(JULIAN_YEAR_SECONDS))
    const M = SUN_MASS.times('1e8')
    const r = solveRadiusForRatio(M, ratio)
    const f = gravitationalFactor(M, r)
    expect(f.toNumber()).toBeCloseTo(ratio.toNumber(), 15)
  })

  it('throws on mass ≤ 0 or ratio outside (0, 1]', () => {
    expect(() => solveRadiusForRatio(0, 0.5)).toThrow()
    expect(() => solveRadiusForRatio(-1, 0.5)).toThrow()
    expect(() => solveRadiusForRatio(EARTH_MASS, 0)).toThrow()
    expect(() => solveRadiusForRatio(EARTH_MASS, 2)).toThrow()
  })
})

describe('solveForRatio (high-level: returns both solutions if feasible)', () => {
  it('returns both a velocity and a radius solution when ratio is in (0, 1)', () => {
    const result = solveForRatio({ ratio: new Decimal('0.5'), mass: EARTH_MASS })
    expect(result.velocity).not.toBeNull()
    expect(result.radius).not.toBeNull()
  })

  it('returns null radius when mass = 0 (no gravitational solution)', () => {
    const result = solveForRatio({ ratio: new Decimal('0.5'), mass: 0 })
    expect(result.velocity).not.toBeNull()
    expect(result.radius).toBeNull()
  })

  it('γ = 3 (ratio = 1/3) solution: v ≈ 0.9428c', () => {
    const result = solveForRatio({ ratio: new Decimal(1).div(3), mass: EARTH_MASS })
    expect(result.velocity).not.toBeNull()
    expect(result.velocity!.div(C).toNumber()).toBeCloseTo(Math.sqrt(8 / 9), 10)
  })
})
