/**
 * CLI sanity checks — run with `npx tsx src/physics/check.ts` or vitest node env.
 * This module exists to verify the physics module can be imported without any
 * React/DOM context. If this file typechecks and runs, the pure-function
 * invariant is preserved.
 */
import Decimal from 'decimal.js'
import { dilate, properTimeRate, lorentzFactor } from './relativity'
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

const ground = { velocity: 0, radius: EARTH_RADIUS, mass: EARTH_MASS }
const gps = { velocity: GPS_ORBITAL_VELOCITY, radius: GPS_ORBITAL_RADIUS, mass: EARTH_MASS }
const iss = { velocity: ISS_ORBITAL_VELOCITY, radius: ISS_ORBITAL_RADIUS, mass: EARTH_MASS }

const gpsResult = dilate(gps, ground, DAY_SECONDS)
const issResult = dilate(iss, ground, DAY_SECONDS)

// Scott Kelly: 340 days on ISS
const kelly = dilate(iss, ground, new Decimal(340).times(DAY_SECONDS))

// Twin paradox: 10 Earth-years at 0.9c in flat space
const flatSpaceHome = { velocity: 0, radius: '1e20', mass: 0 }
const travellingTwin = { velocity: C.times('0.9'), radius: '1e20', mass: 0 }
const twin = dilate(travellingTwin, flatSpaceHome, new Decimal(10).times(JULIAN_YEAR_SECONDS))

console.log('=== relativity module sanity checks ===')
console.log(`γ(0.5c)        = ${lorentzFactor(C.div(2)).toFixed(15)}`)
console.log(`γ(0.9c)        = ${lorentzFactor(C.times('0.9')).toFixed(15)}`)
console.log(`γ(0.99c)       = ${lorentzFactor(C.times('0.99')).toFixed(15)}`)
console.log(`γ(1 m/s) − 1   = ${lorentzFactor(1).minus(1).toExponential(6)}  (float64 would show 0)`)
console.log()
console.log(`Ground dτ/dt   = ${properTimeRate(ground).toFixed(15)}`)
console.log(`GPS dτ/dt      = ${properTimeRate(gps).toFixed(15)}`)
console.log(`ISS dτ/dt      = ${properTimeRate(iss).toFixed(15)}`)
console.log()
console.log(`GPS Δ/day      = ${gpsResult.delta.times('1e6').toFixed(4)} μs  (expected ~ +38.5)`)
console.log(`ISS Δ/day      = ${issResult.delta.times('1e6').toFixed(4)} μs  (expected ~ -25 to -28)`)
console.log(`Kelly Δ/340d   = ${kelly.delta.times('1e3').toFixed(4)} ms     (expected few ms, negative)`)
console.log()
console.log(`Twin paradox: 10 home-years at 0.9c`)
console.log(`   home ages   = ${twin.referenceProperTime.div(JULIAN_YEAR_SECONDS).toFixed(6)} yr`)
console.log(`   traveler    = ${twin.travelerProperTime.div(JULIAN_YEAR_SECONDS).toFixed(6)} yr`)
console.log(`   Δ           = ${twin.delta.div(JULIAN_YEAR_SECONDS).toFixed(6)} yr  (expected −5.641)`)
