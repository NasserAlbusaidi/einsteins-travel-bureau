import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'
import {
  lorentzFactor,
  gravitationalFactor,
  properTimeRate,
  dilate,
  schwarzschildRadius,
} from './relativity'
import {
  C,
  EARTH_MASS,
  EARTH_RADIUS,
  GPS_ORBITAL_RADIUS,
  GPS_ORBITAL_VELOCITY,
  ISS_ORBITAL_RADIUS,
  ISS_ORBITAL_VELOCITY,
  DAY_SECONDS,
  JULIAN_YEAR_SECONDS,
} from './constants'
import type { ObserverState, Scalar } from './types'

// Build an observer state quickly.
const obs = (velocity: Scalar, radius: Scalar, mass: Scalar): ObserverState => ({
  velocity,
  radius,
  mass,
})

// Earth-surface reference: stationary, at Earth's surface.
// Note: we ignore Earth rotation (~465 m/s at equator) for these baseline tests.
const earthSurface = (): ObserverState => ({
  velocity: 0,
  radius: EARTH_RADIUS,
  mass: EARTH_MASS,
})

describe('lorentzFactor', () => {
  it('γ(0) equals exactly 1', () => {
    expect(lorentzFactor(0).eq(1)).toBe(true)
  })

  it('γ(c/2) equals 2/√3 ≈ 1.1547', () => {
    const g = lorentzFactor(C.div(2))
    expect(g.toNumber()).toBeCloseTo(2 / Math.sqrt(3), 10)
  })

  it('γ(0.9c) ≈ 2.294', () => {
    const g = lorentzFactor(C.times('0.9'))
    expect(g.toNumber()).toBeCloseTo(1 / Math.sqrt(1 - 0.81), 10)
  })

  it('γ(0.99c) ≈ 7.0888', () => {
    const g = lorentzFactor(C.times('0.99'))
    expect(g.toNumber()).toBeCloseTo(1 / Math.sqrt(1 - 0.9801), 8)
  })

  it('γ(0.9999c) is finite and large', () => {
    const g = lorentzFactor(C.times('0.9999'))
    expect(g.toNumber()).toBeGreaterThan(50)
    expect(g.toNumber()).toBeLessThan(100)
  })

  it('throws at v = c (physical singularity)', () => {
    expect(() => lorentzFactor(C)).toThrow()
  })

  it('throws at v > c (superluminal)', () => {
    expect(() => lorentzFactor(C.times('1.000001'))).toThrow()
  })

  it('preserves precision at 1 m/s (does NOT collapse to 1.0)', () => {
    // At 1 m/s, γ - 1 ≈ v²/(2c²) ≈ 5.563e-18.
    // float64 silently rounds 1 - 5.563e-18 to 1.0, which would make γ = 1 exactly.
    // decimal.js at 50-digit precision must preserve the tiny offset.
    const g = lorentzFactor(1)
    const excess = g.minus(1)
    expect(excess.isPositive()).toBe(true)
    // Expected ≈ 5.563e-18 (first-order Taylor).
    const expected = new Decimal(1).div(new Decimal(299792458).pow(2).times(2))
    const relativeError = excess.minus(expected).abs().div(expected).toNumber()
    expect(relativeError).toBeLessThan(0.01) // within 1 %
  })

  it('preserves precision at 250 m/s (airliner speed)', () => {
    const g = lorentzFactor(250)
    const excess = g.minus(1)
    expect(excess.isPositive()).toBe(true)
    // γ - 1 ≈ 250²/(2c²) ≈ 3.48e-13
    expect(excess.toNumber()).toBeGreaterThan(3e-13)
    expect(excess.toNumber()).toBeLessThan(4e-13)
  })
})

describe('gravitationalFactor', () => {
  it('returns 1 far from any mass (flat spacetime limit)', () => {
    // At r = 1e20 m, gravitational dilation is negligible.
    const f = gravitationalFactor(EARTH_MASS, '1e20')
    expect(f.toNumber()).toBeCloseTo(1, 15)
  })

  it('returns exactly 0 at the Schwarzschild radius (event horizon)', () => {
    const rs = schwarzschildRadius(EARTH_MASS)
    expect(gravitationalFactor(EARTH_MASS, rs).eq(0)).toBe(true)
  })

  it('throws below the Schwarzschild radius', () => {
    const rs = schwarzschildRadius(EARTH_MASS)
    expect(() => gravitationalFactor(EARTH_MASS, rs.times('0.99'))).toThrow()
  })

  it('Earth surface dilation is ~6.95e-10 below 1', () => {
    // dτ/dt at surface = √(1 - 2GM/(Rc²)), and 2GM/(Rc²) ≈ 1.391e-9,
    // so dτ/dt ≈ 1 - 6.955e-10.
    const f = gravitationalFactor(EARTH_MASS, EARTH_RADIUS)
    const deficit = new Decimal(1).minus(f)
    expect(deficit.toNumber()).toBeGreaterThan(6.9e-10)
    expect(deficit.toNumber()).toBeLessThan(7.0e-10)
  })

  it('zero-mass means no gravitational dilation', () => {
    const f = gravitationalFactor(0, EARTH_RADIUS)
    expect(f.eq(1)).toBe(true)
  })
})

describe('schwarzschildRadius', () => {
  it('for Earth is ~8.87 mm', () => {
    const rs = schwarzschildRadius(EARTH_MASS).toNumber()
    expect(rs).toBeGreaterThan(0.00885)
    expect(rs).toBeLessThan(0.00890)
  })
})

describe('properTimeRate', () => {
  it('is 1 in flat space at rest', () => {
    const rate = properTimeRate(obs(0, '1e20', 0))
    expect(rate.eq(1)).toBe(true)
  })

  it('throws when combined effect would make observer superluminal', () => {
    // v² + 2GM/r > c²  — unphysical for a stationary observer near a large mass.
    // Pick r slightly above horizon AND high v.
    const rs = schwarzschildRadius(EARTH_MASS)
    expect(() => properTimeRate(obs(C.times('0.9'), rs.times('1.0001'), EARTH_MASS))).toThrow()
  })
})

describe('GPS scenario (the precision gate)', () => {
  it('GPS satellite gains ~38.5 μs/day relative to ground clock', () => {
    const satellite = obs(GPS_ORBITAL_VELOCITY, GPS_ORBITAL_RADIUS, EARTH_MASS)
    const result = dilate(satellite, earthSurface(), DAY_SECONDS)
    const deltaMicroseconds = result.delta.times('1e6').toNumber()
    expect(deltaMicroseconds).toBeGreaterThan(38.0)
    expect(deltaMicroseconds).toBeLessThan(39.0)
  })

  it('GPS gravitational-only effect is ~+45.7 μs/day', () => {
    const satellite = obs(0, GPS_ORBITAL_RADIUS, EARTH_MASS) // strip the velocity
    const result = dilate(satellite, earthSurface(), DAY_SECONDS)
    const deltaMicroseconds = result.delta.times('1e6').toNumber()
    expect(deltaMicroseconds).toBeGreaterThan(45.0)
    expect(deltaMicroseconds).toBeLessThan(46.5)
  })

  it('GPS velocity-only effect is ~-7.2 μs/day', () => {
    // Same radius as ground, but orbital velocity. Isolates the SR term.
    const sameAltitude = obs(GPS_ORBITAL_VELOCITY, EARTH_RADIUS, EARTH_MASS)
    const result = dilate(sameAltitude, earthSurface(), DAY_SECONDS)
    const deltaMicroseconds = result.delta.times('1e6').toNumber()
    expect(deltaMicroseconds).toBeLessThan(-7.0)
    expect(deltaMicroseconds).toBeGreaterThan(-7.5)
  })
})

describe('ISS scenario', () => {
  it('ISS astronaut loses time (velocity wins)', () => {
    const iss = obs(ISS_ORBITAL_VELOCITY, ISS_ORBITAL_RADIUS, EARTH_MASS)
    const result = dilate(iss, earthSurface(), DAY_SECONDS)
    expect(result.delta.isNegative()).toBe(true)
    const deltaMicroseconds = result.delta.times('1e6').toNumber()
    // Commonly cited ~-25 to -28 μs/day (depending on altitude).
    expect(deltaMicroseconds).toBeLessThan(-20)
    expect(deltaMicroseconds).toBeGreaterThan(-35)
  })

  it('identifies velocity as dominant effect on ISS', () => {
    const iss = obs(ISS_ORBITAL_VELOCITY, ISS_ORBITAL_RADIUS, EARTH_MASS)
    const result = dilate(iss, earthSurface(), DAY_SECONDS)
    expect(result.dominantEffect).toBe('velocity')
  })
})

describe('Scott Kelly one-year mission', () => {
  it('astronaut ages a few milliseconds less over 340 days', () => {
    const iss = obs(ISS_ORBITAL_VELOCITY, ISS_ORBITAL_RADIUS, EARTH_MASS)
    const missionSeconds = new Decimal(340).times(DAY_SECONDS)
    const result = dilate(iss, earthSurface(), missionSeconds)
    const deltaMilliseconds = result.delta.times('1e3').toNumber()
    // With our ISS params, ~(-25 μs/day) × 340 days ≈ -8.5 ms, but
    // various sources cite -5 to -9 ms. Accept any negative millisecond-scale value.
    expect(deltaMilliseconds).toBeLessThan(-4)
    expect(deltaMilliseconds).toBeGreaterThan(-12)
  })
})

describe('Commercial flight (SF → Tokyo, 11h, 900 km/h, 10 km altitude)', () => {
  it('crew gains a few nanoseconds of ageing vs ground', () => {
    const flight = obs(250, EARTH_RADIUS.plus(10000), EARTH_MASS) // 900 km/h ≈ 250 m/s
    const flightSeconds = new Decimal(11).times(3600)
    const result = dilate(flight, earthSurface(), flightSeconds)
    const deltaNanoseconds = result.delta.times('1e9').toNumber()
    // Positive: gravitational gain (higher up) beats velocity loss at 250 m/s.
    expect(deltaNanoseconds).toBeGreaterThan(10)
    expect(deltaNanoseconds).toBeLessThan(80)
  })
})

describe('Twin paradox (idealized)', () => {
  it('Twin travelling at 0.9c ages 1/γ = 1/2.294 of stay-home time', () => {
    const homeTwin = obs(0, '1e20', 0) // effectively flat space, at rest
    const travelingTwin = obs(C.times('0.9'), '1e20', 0)
    const stayHomeYears = new Decimal(10).times(JULIAN_YEAR_SECONDS)
    const result = dilate(travelingTwin, homeTwin, stayHomeYears)
    const travelerYears = result.travelerProperTime.div(JULIAN_YEAR_SECONDS).toNumber()
    // Expected: 10 × √(1 - 0.81) ≈ 4.3589 years.
    expect(travelerYears).toBeCloseTo(4.3589, 3)
  })
})

describe('DilationResult dominantEffect', () => {
  it('flags gravity for high-r stationary observer near massive body', () => {
    // Observer near (but above) Earth's Schwarzschild radius, at rest.
    const rs = schwarzschildRadius(EARTH_MASS)
    const stationary = obs(0, rs.times(1.5), EARTH_MASS)
    const result = dilate(stationary, earthSurface(), DAY_SECONDS)
    expect(result.dominantEffect).toBe('gravity')
  })

  it('flags balanced when velocity and gravity contribute equally', () => {
    // Purely synthetic: at orbital radius where v and gravity terms cancel.
    // A circular orbit has GM/r = v², so gravity term (2GM/rc²) = 2v²/c².
    // Thus gravity is always twice velocity for a circular orbit. So we fabricate
    // a non-orbital configuration to test "balanced" — equal terms.
    // We skip this — it's a UI concern, not physics. Test just checks it's not 'gravity' or 'velocity' when they match.
    // Pick observer where gravitational and velocity contributions to deficit are equal magnitude.
    // 2GM/(rc²) = v²/c² → v² = 2GM/r → v = √(2GM/r) = escape velocity.
    const r = new Decimal('1e8')
    const vEscape = Decimal.sqrt(new Decimal('6.67430e-11').times(EARTH_MASS).times(2).div(r))
    const balanced = obs(vEscape, r, EARTH_MASS)
    const result = dilate(balanced, obs(0, '1e20', 0), DAY_SECONDS)
    expect(result.dominantEffect).toBe('balanced')
  })
})
