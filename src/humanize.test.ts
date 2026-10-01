import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import {
  boardDuration,
  humanDistance,
  humanDuration,
  humanMass,
  humanNumber,
  humanSpeed,
  percentOfLight,
  sameUnitPair,
} from './humanize'
import { C, EARTH_MASS, JULIAN_YEAR_SECONDS, LIGHT_YEAR, SUN_MASS } from './physics/constants'

describe('humanNumber', () => {
  it('uses separators and words', () => {
    expect(humanNumber(1234)).toBe('1,234')
    expect(humanNumber(2.345e6)).toBe('2.35 million')
    expect(humanNumber(7e9)).toBe('7 billion')
    expect(humanNumber(0.000123)).toBe('0.000123')
    expect(humanNumber(3e20)).toBe('3 × 10²⁰')
  })
})

describe('humanDuration', () => {
  it('picks friendly units with glosses for tiny ones', () => {
    expect(humanDuration(new Decimal('3.844e-5'))).toEqual({
      text: '38.4 microseconds',
      gloss: 'millionths of a second',
    })
    expect(humanDuration(3600).text).toBe('1 hour')
    expect(humanDuration(3599.99).text).toBe('1 hour')
    expect(humanDuration(59.94).text).toBe('59.9 seconds')
    expect(humanDuration(JULIAN_YEAR_SECONDS.times(7)).text).toBe('7 years')
    expect(humanDuration(JULIAN_YEAR_SECONDS.times('2.5e6')).text).toBe('2.5 million years')
    expect(humanDuration(0).text).toBe('no time at all')
    expect(humanDuration(new Decimal('3e-15')).text).toBe('3 × 10⁻¹⁵ seconds')
  })
})

describe('sameUnitPair', () => {
  it('compares in one unit, or returns null if indistinguishable', () => {
    const y = JULIAN_YEAR_SECONDS
    expect(sameUnitPair(y.times('4.233'), y.times('9.711'))).toEqual(['4.23 years', '9.71 years'])
    expect(sameUnitPair(new Decimal(3594), y.times(7))).toEqual(['59.9 minutes', '7 years'])
    expect(sameUnitPair(new Decimal(86400), new Decimal('86400.00004'))).toBeNull()
  })
})

describe('humanSpeed / percentOfLight', () => {
  it('uses km/h for everyday speeds', () => {
    expect(humanSpeed(7660)).toBe('27,576 km/h')
    expect(humanSpeed(0)).toBe('standing still')
    expect(humanSpeed(1.4)).toBe('5 km/h')
  })

  it('uses % of light speed without rounding up to 100%', () => {
    expect(humanSpeed(C.times('0.9'))).toBe('90% of light speed')
    expect(percentOfLight(new Decimal('0.9999'))).toBe('99.99%')
    expect(percentOfLight(new Decimal('0.9428'))).toBe('94.2%')
    expect(percentOfLight(new Decimal('0.99999999'))).not.toBe('100%')
  })
})

describe('humanDistance / humanMass', () => {
  it('formats distances', () => {
    expect(humanDistance(78.5)).toBe('78.5 metres')
    expect(humanDistance(408000)).toBe('408 km')
    expect(humanDistance(LIGHT_YEAR.times('4.37'))).toBe('4.37 light-years')
  })

  it('formats masses relative to Earth and Sun', () => {
    expect(humanMass(EARTH_MASS)).toBe('1 × the Earth')
    expect(humanMass(SUN_MASS.times('4.297e6'))).toBe('4.3 million × the Sun')
    expect(humanMass(0)).toBe('nothing')
  })
})

describe('boardDuration', () => {
  it('uses short upper-case units with 3 significant figures', () => {
    expect(boardDuration(JULIAN_YEAR_SECONDS.times('9.7123'))).toBe('9.71 YRS')
    expect(boardDuration(new Decimal(3600))).toBe('1 HR')
    expect(boardDuration(new Decimal('3.85e-5'))).toBe('38.5 MICROSEC')
    expect(boardDuration(new Decimal(340 * 86400))).toBe('340 DAYS')
    expect(boardDuration(JULIAN_YEAR_SECONDS.times(12345))).toBe('12,345 YRS')
    expect(boardDuration(JULIAN_YEAR_SECONDS.times('3.17e6'))).toBe('3.17M YRS')
  })

  it('handles nothing and next to nothing', () => {
    expect(boardDuration(0)).toBe('NONE')
    expect(boardDuration(new Decimal('1e-15'))).toBe('< 1 PICOSEC')
  })

  it('always fits a 13-character board column', () => {
    for (let e = -14; e < 20; e += 0.37) {
      expect(boardDuration(new Decimal(10).pow(e)).length).toBeLessThanOrEqual(13)
    }
  })
})
