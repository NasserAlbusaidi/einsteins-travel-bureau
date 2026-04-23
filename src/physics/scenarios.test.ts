import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import { SCENARIOS, getScenario } from './scenarios'
import { dilate } from './relativity'
import { JULIAN_YEAR_SECONDS } from './constants'

describe('SCENARIOS list', () => {
  it('exposes the expected seven presets', () => {
    const ids = SCENARIOS.map((s) => s.id).sort()
    expect(ids).toEqual(
      ['flight', 'gps', 'hail-mary', 'iss', 'millers-planet', 'scott-kelly', 'twin-paradox'].sort(),
    )
  })

  it('every scenario has non-empty name and description', () => {
    for (const s of SCENARIOS) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.description.length).toBeGreaterThan(10)
    }
  })
})

describe('getScenario()', () => {
  it('returns the scenario matching the id', () => {
    expect(getScenario('gps').id).toBe('gps')
  })

  it('throws on unknown id', () => {
    expect(() => getScenario('no-such-scenario')).toThrow()
  })
})

describe('GPS scenario', () => {
  it('produces ~+38.5 μs over 1 day', () => {
    const s = getScenario('gps')
    const r = dilate(s.traveler, s.reference, s.duration)
    const us = r.delta.times('1e6').toNumber()
    expect(us).toBeGreaterThan(38)
    expect(us).toBeLessThan(39)
  })
})

describe('ISS scenario', () => {
  it('produces a negative delta (velocity wins)', () => {
    const s = getScenario('iss')
    const r = dilate(s.traveler, s.reference, s.duration)
    expect(r.delta.isNegative()).toBe(true)
    expect(r.dominantEffect).toBe('velocity')
  })
})

describe('Scott Kelly scenario', () => {
  it('produces a few-milliseconds-younger result over 340 days', () => {
    const s = getScenario('scott-kelly')
    const r = dilate(s.traveler, s.reference, s.duration)
    const ms = r.delta.times('1e3').toNumber()
    expect(ms).toBeLessThan(-4)
    expect(ms).toBeGreaterThan(-12)
  })
})

describe('Commercial flight scenario', () => {
  it('produces a positive nanosecond-scale delta', () => {
    const s = getScenario('flight')
    const r = dilate(s.traveler, s.reference, s.duration)
    const ns = r.delta.times('1e9').toNumber()
    expect(ns).toBeGreaterThan(10)
    expect(ns).toBeLessThan(80)
  })
})

describe('Twin paradox scenario', () => {
  it('traveler ages less than reference by γ factor', () => {
    const s = getScenario('twin-paradox')
    const r = dilate(s.traveler, s.reference, s.duration)
    // Ratio should equal 1/γ(0.9c) = √0.19 ≈ 0.4359.
    expect(r.ratio.toNumber()).toBeCloseTo(Math.sqrt(0.19), 6)
  })

  it('traveler ages ~4.23 years over ~9.71 Earth years', () => {
    const s = getScenario('twin-paradox')
    const r = dilate(s.traveler, s.reference, s.duration)
    const earthYears = r.referenceProperTime.div(JULIAN_YEAR_SECONDS).toNumber()
    const travelerYears = r.travelerProperTime.div(JULIAN_YEAR_SECONDS).toNumber()
    expect(earthYears).toBeCloseTo(9.711, 2)
    expect(travelerYears).toBeCloseTo(4.233, 2)
  })
})

describe("Miller's planet scenario", () => {
  it('7 years Earth time = ~1 hour on the planet', () => {
    const s = getScenario('millers-planet')
    const r = dilate(s.traveler, s.reference, s.duration)
    const earthYears = r.referenceProperTime.div(JULIAN_YEAR_SECONDS).toNumber()
    const travelerHours = r.travelerProperTime.div(3600).toNumber()
    expect(earthYears).toBeCloseTo(7, 6)
    expect(travelerHours).toBeGreaterThan(0.95)
    expect(travelerHours).toBeLessThan(1.05)
  })

  it('gravitational effect dominates', () => {
    const s = getScenario('millers-planet')
    const r = dilate(s.traveler, s.reference, s.duration)
    expect(r.dominantEffect).toBe('gravity')
  })
})

describe('Hail Mary scenario', () => {
  it('γ(0.92c) ≈ 2.55, so 10 Earth years ≈ 3.92 ship years', () => {
    const s = getScenario('hail-mary')
    const r = dilate(s.traveler, s.reference, s.duration)
    const travelerYears = r.travelerProperTime.div(JULIAN_YEAR_SECONDS).toNumber()
    // γ = 1/√(1-0.8464) = 2.551 → 10/2.551 = 3.919
    expect(travelerYears).toBeCloseTo(3.919, 2)
  })
})

describe('every scenario produces a finite result', () => {
  it.each(['gps', 'iss', 'scott-kelly', 'flight', 'twin-paradox', 'millers-planet', 'hail-mary'])(
    'dilate() works for "%s" without throwing',
    (id) => {
      const s = getScenario(id)
      const r = dilate(s.traveler, s.reference, s.duration)
      expect(r.ratio.isFinite()).toBe(true)
      expect(r.delta.isFinite()).toBe(true)
    },
  )
})

describe('scenario durations are positive Decimal instances', () => {
  it.each(SCENARIOS.map((s) => s.id))('"%s" has positive duration', (id) => {
    const s = getScenario(id)
    expect(s.duration instanceof Decimal).toBe(true)
    expect(s.duration.isPositive()).toBe(true)
  })
})
