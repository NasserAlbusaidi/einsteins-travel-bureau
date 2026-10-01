import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import { speedScale, durationScale, logScale } from './scales'
import { C } from './physics/constants'

describe('speedScale', () => {
  it('starts at standing still and tops out just under c', () => {
    expect(speedScale.fromPos(0).isZero()).toBe(true)
    const top = speedScale.fromPos(1)
    expect(top.lt(C)).toBe(true)
    expect(top.div(C).toNumber()).toBeGreaterThan(0.9999)
  })

  it('is monotone', () => {
    let prev = new Decimal(-1)
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const v = speedScale.fromPos(p)
      expect(v.gte(prev)).toBe(true)
      prev = v
    }
  })

  it('round-trips everyday and relativistic speeds', () => {
    for (const v of ['1.4', '250', '7660', '3e7', C.times('0.5').toString(), C.times('0.99').toString()]) {
      const val = new Decimal(v)
      const back = speedScale.fromPos(speedScale.toPos(val))
      expect(back.minus(val).abs().div(val).toNumber()).toBeLessThan(1e-9)
    }
    expect(speedScale.toPos(new Decimal(0))).toBe(0)
  })
})

describe('logScale', () => {
  it('maps endpoints and honours the zero zone', () => {
    const s = logScale(new Decimal(1), new Decimal(1000), 0.05)
    expect(s.fromPos(0).isZero()).toBe(true)
    expect(s.fromPos(0.05).toNumber()).toBeCloseTo(1)
    expect(s.fromPos(1).toNumber()).toBeCloseTo(1000)
    expect(s.toPos(new Decimal(0))).toBe(0)
  })

  it('durationScale spans a minute to ten millennia', () => {
    expect(durationScale.fromPos(0).toNumber()).toBeCloseTo(60)
    expect(durationScale.fromPos(1).toNumber()).toBeCloseTo(3.15576e11, -5)
  })
})
