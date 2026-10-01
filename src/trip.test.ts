import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import {
  PRESET_TRIPS,
  decodeTrip,
  encodeTrip,
  evaluateTrip,
  heightOf,
  withHeight,
  withPlace,
  homeObserver,
  travelerObserver,
  type Trip,
} from './trip'
import { SCENARIOS } from './physics/scenarios'
import { dilate } from './physics/relativity'
import { C, JULIAN_YEAR_SECONDS } from './physics/constants'
import { getBody } from './physics/bodies'

describe('presets as trips', () => {
  it('every scenario converts and reproduces the exact same physics', () => {
    for (const s of SCENARIOS) {
      const trip = PRESET_TRIPS.get(s.id)!
      expect(trip).toBeDefined()
      const original = dilate(s.traveler, s.reference, s.duration)
      const viaTrip = dilate(travelerObserver(trip), homeObserver(trip.place), trip.duration)
      expect(viaTrip.ratio.minus(original.ratio).abs().lt('1e-40')).toBe(true)
    }
  })

  it("Miller's planet hovers only ~78 m above Gargantua's horizon", () => {
    const h = heightOf(PRESET_TRIPS.get('millers-planet')!).toNumber()
    expect(h).toBeGreaterThan(70)
    expect(h).toBeLessThan(90)
  })

  it('ISS sits ~408 km up', () => {
    expect(heightOf(PRESET_TRIPS.get('iss')!).toNumber()).toBeCloseTo(408000, -2)
  })
})

describe('trip editing', () => {
  const base: Trip = PRESET_TRIPS.get('iss')!

  it('withHeight/heightOf round-trip', () => {
    const t = withHeight(base, new Decimal(12345))
    expect(heightOf(t).eq(12345)).toBe(true)
  })

  it('withPlace resets to the body default height', () => {
    const t = withPlace(base, 'gargantua')
    expect(heightOf(t).eq(getBody('gargantua').defaultHeight)).toBe(true)
    expect(t.speed.eq(base.speed)).toBe(true)
  })

  it('empty space has zero height', () => {
    expect(heightOf(withPlace(base, 'none')).isZero()).toBe(true)
  })
})

describe('evaluateTrip()', () => {
  it('returns the dilation and the speed/gravity split', () => {
    const out = evaluateTrip(PRESET_TRIPS.get('twin-paradox')!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    const yrs = out.result.travelerProperTime.div(JULIAN_YEAR_SECONDS).toNumber()
    expect(yrs).toBeCloseTo(4.23, 2)
    expect(out.split.gravity.isZero()).toBe(true)
  })

  it('refuses light speed', () => {
    const t: Trip = { ...PRESET_TRIPS.get('hail-mary')!, speed: C }
    expect(evaluateTrip(t)).toEqual({ ok: false, problem: 'faster-than-light' })
  })

  it('refuses moving fast right on top of a black hole', () => {
    const t = withHeight({ ...withPlace(PRESET_TRIPS.get('hail-mary')!, 'gargantua') }, new Decimal(1))
    expect(evaluateTrip(t)).toEqual({ ok: false, problem: 'swallowed' })
  })
})

describe('URL hash', () => {
  it('encodes untouched presets by name', () => {
    expect(encodeTrip({ presetId: 'gps', trip: PRESET_TRIPS.get('gps')! })).toBe('trip=gps')
  })

  it('round-trips a custom trip', () => {
    const trip = withHeight(withPlace(PRESET_TRIPS.get('gps')!, 'neutron-star'), new Decimal(5000))
    const back = decodeTrip('#' + encodeTrip({ presetId: null, trip }))
    expect(back?.presetId).toBeNull()
    expect(back?.trip.place).toBe('neutron-star')
    expect(back?.trip.speed.eq(trip.speed)).toBe(true)
    expect(back?.trip.radius.eq(trip.radius)).toBe(true)
    expect(back?.trip.duration.eq(trip.duration)).toBe(true)
  })

  it('keeps links short but precise enough for near-light speeds', () => {
    const trip = { ...PRESET_TRIPS.get('hail-mary')!, speed: C.times('0.99999999999') }
    const hash = encodeTrip({ presetId: null, trip })
    expect(hash.length).toBeLessThan(120)
    const back = decodeTrip(hash)!
    expect(back.trip.speed.lt(C)).toBe(true)
    expect(back.trip.speed.minus(trip.speed).abs().lt('1e-15')).toBe(true)
  })

  it('accepts legacy `s=` links and rejects garbage', () => {
    expect(decodeTrip('#s=iss')?.presetId).toBe('iss')
    expect(decodeTrip('#trip=narnia')).toBeNull()
    expect(decodeTrip('#v=abc&at=earth&t=10')).toBeNull()
    expect(decodeTrip('#v=1&at=pluto&t=10')).toBeNull()
    expect(decodeTrip(`#v=${C.toString()}&at=none&t=10`)).toBeNull()
    expect(decodeTrip('')).toBeNull()
  })
})
