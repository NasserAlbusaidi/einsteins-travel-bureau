import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import { splitEffects } from './effects'
import { dilate } from './relativity'
import { SCENARIOS, getScenario } from './scenarios'

describe('splitEffects()', () => {
  it('speed + gravity equals the full dilate() delta for every scenario', () => {
    for (const s of SCENARIOS) {
      const split = splitEffects(s.traveler, s.reference, s.duration)
      const r = dilate(s.traveler, s.reference, s.duration)
      expect(split.speed.plus(split.gravity).minus(split.total).abs().lt('1e-30')).toBe(true)
      expect(split.total.minus(r.delta).abs().lt('1e-30')).toBe(true)
    }
  })

  it('GPS: gravity gains ~45.7 μs/day, speed loses ~7.2 μs/day', () => {
    const s = getScenario('gps')
    const split = splitEffects(s.traveler, s.reference, s.duration)
    const grav = split.gravity.times('1e6').toNumber()
    const speed = split.speed.times('1e6').toNumber()
    expect(grav).toBeGreaterThan(45)
    expect(grav).toBeLessThan(46.5)
    expect(speed).toBeLessThan(-7)
    expect(speed).toBeGreaterThan(-7.5)
  })

  it('twin paradox is pure speed, Miller is pure gravity', () => {
    const twin = getScenario('twin-paradox')
    const t = splitEffects(twin.traveler, twin.reference, twin.duration)
    expect(t.gravity.isZero()).toBe(true)
    expect(t.speed.isNegative()).toBe(true)

    const miller = getScenario('millers-planet')
    const m = splitEffects(miller.traveler, miller.reference, miller.duration)
    expect(m.speed.isZero()).toBe(true)
    expect(m.gravity.isNegative()).toBe(true)
  })

  it('accepts plain number durations', () => {
    const s = getScenario('iss')
    const split = splitEffects(s.traveler, s.reference, 86400)
    expect(split.total.lt(0)).toBe(true)
    expect(split.total.gt(new Decimal('-1e-4'))).toBe(true)
  })
})
