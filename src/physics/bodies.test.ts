import { describe, expect, it } from 'vitest'
import { BODY_IDS, getBody, bodyForMass, isBodyId } from './bodies'
import { schwarzschildRadius } from './relativity'
import { EARTH_MASS } from './constants'

describe('bodies', () => {
  it('every non-black-hole body is larger than its own event horizon', () => {
    for (const id of BODY_IDS) {
      const b = getBody(id)
      if (b.kind === 'planet' || b.kind === 'star') {
        expect(b.floorRadius.gt(schwarzschildRadius(b.mass))).toBe(true)
      }
    }
  })

  it('black holes have their floor at the event horizon', () => {
    for (const id of ['sgr-a', 'gargantua'] as const) {
      const b = getBody(id)
      expect(b.floorRadius.eq(schwarzschildRadius(b.mass))).toBe(true)
    }
  })

  it("Sgr A*'s horizon is ~0.08 AU (≈12.7 million km)", () => {
    const km = getBody('sgr-a').floorRadius.div(1000).toNumber()
    expect(km).toBeGreaterThan(12.5e6)
    expect(km).toBeLessThan(12.9e6)
  })

  it('looks bodies up by mass and validates ids', () => {
    expect(bodyForMass(EARTH_MASS)?.id).toBe('earth')
    expect(isBodyId('earth')).toBe(true)
    expect(isBodyId('pluto')).toBe(false)
    expect(() => getBody('pluto' as never)).toThrow()
  })
})
