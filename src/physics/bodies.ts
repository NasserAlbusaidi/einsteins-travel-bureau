/**
 * Gravitating bodies a traveler can visit. Pure data — mass and the radius of
 * the "floor" (planet/star surface, or the event horizon for black holes).
 */
import Decimal from 'decimal.js'
import { EARTH_MASS, EARTH_RADIUS, SUN_MASS } from './constants'
import { schwarzschildRadius } from './relativity'

export type BodyId =
  | 'none'
  | 'earth'
  | 'sun'
  | 'white-dwarf'
  | 'neutron-star'
  | 'sgr-a'
  | 'gargantua'

export type BodyKind = 'empty' | 'planet' | 'star' | 'black-hole'

export interface Body {
  readonly id: BodyId
  readonly kind: BodyKind
  /** kg. Zero for empty space. */
  readonly mass: Decimal
  /**
   * Radius of the floor in m: the physical surface, or the Schwarzschild
   * radius for a black hole. For empty space this is a far-away placeholder.
   */
  readonly floorRadius: Decimal
  /** Largest height above the floor the UI offers, in m. */
  readonly maxHeight: Decimal
  /** Height above the floor a fresh visit starts at, in m. */
  readonly defaultHeight: Decimal
}

/** Placeholder radius for "nowhere near anything" (mass is zero anyway). */
export const DEEP_SPACE_RADIUS = new Decimal('1e20')

/**
 * Sun radius (m). IAU 2015 nominal solar radius.
 * https://iau-a3.gitlab.io/NSFA/NSFA_cbe.html
 */
export const SUN_RADIUS = new Decimal('6.957e8')

/** Sirius B: 1.018 M☉, 0.008098 R☉ (Bond et al. 2017, ApJ 840, 70). */
const SIRIUS_B_MASS = SUN_MASS.times('1.018')
const SIRIUS_B_RADIUS = SUN_RADIUS.times('0.008098')

/** Canonical neutron star: 1.4 M☉, ~12 km radius (NICER-era estimates). */
const NEUTRON_STAR_MASS = SUN_MASS.times('1.4')
const NEUTRON_STAR_RADIUS = new Decimal('12000')

/** Sagittarius A*: ~4.297 × 10⁶ M☉ (GRAVITY Collaboration 2023). */
export const SGR_A_MASS = SUN_MASS.times('4.297e6')

/** Gargantua (Interstellar): ~10⁸ M☉, same value used by the Miller's planet scenario. */
export const GARGANTUA_MASS = SUN_MASS.times('1e8')

const BODY_LIST: readonly Body[] = [
  {
    id: 'none',
    kind: 'empty',
    mass: new Decimal(0),
    floorRadius: DEEP_SPACE_RADIUS,
    maxHeight: new Decimal(0),
    defaultHeight: new Decimal(0),
  },
  {
    id: 'earth',
    kind: 'planet',
    mass: EARTH_MASS,
    floorRadius: EARTH_RADIUS,
    maxHeight: new Decimal('1e9'),
    defaultHeight: new Decimal('408000'),
  },
  {
    id: 'sun',
    kind: 'star',
    mass: SUN_MASS,
    floorRadius: SUN_RADIUS,
    maxHeight: new Decimal('1e12'),
    defaultHeight: new Decimal('6.2e9'),
  },
  {
    id: 'white-dwarf',
    kind: 'star',
    mass: SIRIUS_B_MASS,
    floorRadius: SIRIUS_B_RADIUS,
    maxHeight: new Decimal('1e11'),
    defaultHeight: new Decimal(0),
  },
  {
    id: 'neutron-star',
    kind: 'star',
    mass: NEUTRON_STAR_MASS,
    floorRadius: NEUTRON_STAR_RADIUS,
    maxHeight: new Decimal('1e11'),
    defaultHeight: new Decimal(0),
  },
  {
    id: 'sgr-a',
    kind: 'black-hole',
    mass: SGR_A_MASS,
    floorRadius: schwarzschildRadius(SGR_A_MASS),
    maxHeight: new Decimal('1e14'),
    defaultHeight: schwarzschildRadius(SGR_A_MASS),
  },
  {
    id: 'gargantua',
    kind: 'black-hole',
    mass: GARGANTUA_MASS,
    floorRadius: schwarzschildRadius(GARGANTUA_MASS),
    maxHeight: new Decimal('1e15'),
    defaultHeight: schwarzschildRadius(GARGANTUA_MASS),
  },
]

export const BODIES: ReadonlyMap<BodyId, Body> = new Map(BODY_LIST.map((b) => [b.id, b]))
export const BODY_IDS: readonly BodyId[] = BODY_LIST.map((b) => b.id)

export function getBody(id: BodyId): Body {
  const b = BODIES.get(id)
  if (!b) throw new Error(`Unknown body id: "${id}"`)
  return b
}

export function isBodyId(x: string): x is BodyId {
  return BODIES.has(x as BodyId)
}

/** Find the body whose mass matches exactly, if any. */
export function bodyForMass(mass: Decimal): Body | undefined {
  return BODY_LIST.find((b) => b.mass.eq(mass))
}
