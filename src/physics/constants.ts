import Decimal from 'decimal.js'

// Use 50 digits of precision everywhere. Relativistic dilation at small v/c
// subtracts numbers like (1 - 1e-17) from 1, which silently collapses to 1.0
// in float64. Decimal with 50 digits keeps 30+ sig figs after that subtraction.
Decimal.set({ precision: 50 })

/** Speed of light in vacuum (m/s). Exact by SI definition (2019 SI). */
export const C = new Decimal('299792458')

/** c² in m²/s². Precomputed so we don't re-do the multiplication everywhere. */
export const C_SQUARED = C.pow(2)

/**
 * Newtonian gravitational constant (m³ kg⁻¹ s⁻²).
 * Source: CODATA 2018 recommended value. Uncertainty ±2.2e-15.
 * https://physics.nist.gov/cgi-bin/cuu/Value?bg
 */
export const G = new Decimal('6.67430e-11')

/**
 * Earth mass (kg).
 * Source: IAU 2015 nominal Earth mass parameter (GM⊕ / G), ~5.9722e24 kg.
 * https://iau-a3.gitlab.io/NSFA/NSFA_cbe.html
 */
export const EARTH_MASS = new Decimal('5.9722e24')

/**
 * Earth equatorial radius (m).
 * Source: WGS-84 (used for GPS). Equatorial radius, not mean radius.
 * https://earth-info.nga.mil/ (NGA WGS-84)
 */
export const EARTH_RADIUS = new Decimal('6378137')

/**
 * Sun mass (kg).
 * Source: IAU 2015 nominal solar mass parameter. Well-known to ~1e-4.
 * https://iau-a3.gitlab.io/NSFA/NSFA_cbe.html
 */
export const SUN_MASS = new Decimal('1.98892e30')

/**
 * Astronomical unit (m). Exact by IAU 2012 resolution B2.
 * https://www.iau.org/static/resolutions/IAU2012_English.pdf
 */
export const AU = new Decimal('149597870700')

/**
 * Light-year (m). Defined as c × Julian year (365.25 days of 86400 s).
 * Source: IAU.
 */
export const LIGHT_YEAR = new Decimal('9460730472580800')

/** Parsec (m). Source: IAU 2015 resolution B2. */
export const PARSEC = new Decimal('3.0856775814913673e16')

/** Julian year in seconds (365.25 days × 86400 s). Used for ly definition. */
export const JULIAN_YEAR_SECONDS = new Decimal('31557600')

/** Solar day in seconds. */
export const DAY_SECONDS = new Decimal('86400')

// --- Orbital presets (for scenario scripting) ---

/**
 * GPS satellite orbital radius (m) from Earth's center.
 * Source: GPS constellation nominal semi-major axis ~26,559,800 m (MEO).
 * Published altitude 20,180 km above geoid + 6,378 km ≈ 26,559 km.
 * https://www.gps.gov/systems/gps/space/
 */
export const GPS_ORBITAL_RADIUS = new Decimal('26559800')

/**
 * GPS satellite orbital velocity (m/s).
 * Computed from v = √(GM⊕ / r) at GPS_ORBITAL_RADIUS ≈ 3,874 m/s.
 * Hardcoded here; verified in tests.
 */
export const GPS_ORBITAL_VELOCITY = new Decimal('3874')

/**
 * ISS orbital radius (m) from Earth's center.
 * Source: ISS nominal altitude ~408 km + Earth radius.
 * https://www.nasa.gov/mission_pages/station/overview/
 */
export const ISS_ORBITAL_RADIUS = new Decimal('6786137')

/**
 * ISS orbital velocity (m/s). Nominal ~7,660 m/s (v = √(GM/r)).
 * https://spotthestation.nasa.gov/
 */
export const ISS_ORBITAL_VELOCITY = new Decimal('7660')
