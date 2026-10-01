/**
 * Plain-language copy for the places a traveler can go, plus the landmark
 * chips shown under each slider.
 */
import Decimal from 'decimal.js'
import type { BodyId } from '../physics/bodies'
import { C, JULIAN_YEAR_SECONDS, DAY_SECONDS } from '../physics/constants'
import { getBody } from '../physics/bodies'

export interface PlaceCopy {
  readonly emoji: string
  readonly name: string
  /** Name as it reads mid-sentence, e.g. "the Sun". */
  readonly inSentence: string
  readonly blurb: string
  /** Label for the height slider. */
  readonly heightLabel: string
  readonly heightLandmarks: readonly Landmark[]
}

export interface Landmark {
  readonly label: string
  readonly value: Decimal
}

const rs = (id: BodyId) => getBody(id).floorRadius

export const PLACES: Record<BodyId, PlaceCopy> = {
  none: {
    emoji: '🌌',
    name: 'Deep space',
    inSentence: 'deep space',
    blurb: 'Nothing heavy nearby — only your speed matters.',
    heightLabel: '',
    heightLandmarks: [],
  },
  earth: {
    emoji: '🌍',
    name: 'Earth',
    inSentence: 'Earth',
    blurb: 'Home is someone standing on the ground.',
    heightLabel: 'Height above the ground',
    heightLandmarks: [
      { label: 'Ground', value: new Decimal(0) },
      { label: 'Everest', value: new Decimal(8849) },
      { label: 'Airliner', value: new Decimal(10000) },
      { label: 'Space station', value: new Decimal(408000) },
      { label: 'GPS', value: new Decimal(20180000) },
      { label: 'The Moon', value: new Decimal(384400000) },
    ],
  },
  sun: {
    emoji: '☀️',
    name: 'The Sun',
    inSentence: 'the Sun',
    blurb: '333,000 Earths of mass. Bring sunscreen.',
    heightLabel: 'Height above the surface',
    heightLandmarks: [
      { label: 'Surface', value: new Decimal(0) },
      { label: 'Parker Solar Probe', value: new Decimal('6.2e9') },
      { label: 'Mercury', value: new Decimal('5.7e10') },
      { label: 'Earth', value: new Decimal('1.49e11') },
    ],
  },
  'white-dwarf': {
    emoji: '⚪',
    name: 'A white dwarf',
    inSentence: 'a white dwarf',
    blurb: 'Sirius B: a whole Sun crushed down to the size of Earth.',
    heightLabel: 'Height above the surface',
    heightLandmarks: [
      { label: 'Surface', value: new Decimal(0) },
      { label: '10,000 km', value: new Decimal('1e7') },
      { label: '1 million km', value: new Decimal('1e9') },
    ],
  },
  'neutron-star': {
    emoji: '💫',
    name: 'A neutron star',
    inSentence: 'a neutron star',
    blurb: '1.4 Suns squeezed into a ball the size of a city.',
    heightLabel: 'Height above the surface',
    heightLandmarks: [
      { label: 'Surface', value: new Decimal(0) },
      { label: '10 km', value: new Decimal('1e4') },
      { label: '1,000 km', value: new Decimal('1e6') },
    ],
  },
  'sgr-a': {
    emoji: '🕳️',
    name: 'Sagittarius A*',
    inSentence: 'Sagittarius A*',
    blurb: 'The real black hole at the centre of our galaxy — 4.3 million Suns.',
    heightLabel: 'Distance from the edge (event horizon)',
    heightLandmarks: [
      { label: '1 km', value: new Decimal(1000) },
      { label: 'Half its size', value: rs('sgr-a').div(2) },
      { label: 'Its own size', value: rs('sgr-a') },
      { label: '10× its size', value: rs('sgr-a').times(10) },
    ],
  },
  gargantua: {
    emoji: '⚫',
    name: 'Gargantua',
    inSentence: 'Gargantua',
    blurb: 'The monster black hole from Interstellar — 100 million Suns.',
    heightLabel: 'Distance from the edge (event horizon)',
    heightLandmarks: [
      { label: "Miller's planet", value: new Decimal('78.5') },
      { label: '1 km', value: new Decimal(1000) },
      { label: 'Its own size', value: rs('gargantua') },
      { label: '10× its size', value: rs('gargantua').times(10) },
    ],
  },
}

export const SPEED_LANDMARKS: readonly Landmark[] = [
  { label: 'Standing still', value: new Decimal(0) },
  { label: 'Airliner', value: new Decimal(250) },
  { label: 'Space station', value: new Decimal(7660) },
  { label: 'Fastest probe ever', value: new Decimal(191700) },
  { label: '10% light', value: C.times('0.1') },
  { label: '50% light', value: C.times('0.5') },
  { label: '90% light', value: C.times('0.9') },
  { label: '99% light', value: C.times('0.99') },
  { label: '99.99% light', value: C.times('0.9999') },
]

export const DURATION_LANDMARKS: readonly Landmark[] = [
  { label: '1 hour', value: new Decimal(3600) },
  { label: '1 day', value: DAY_SECONDS },
  { label: '1 year', value: JULIAN_YEAR_SECONDS },
  { label: '10 years', value: JULIAN_YEAR_SECONDS.times(10) },
  { label: 'A lifetime', value: JULIAN_YEAR_SECONDS.times(80) },
  { label: '1,000 years', value: JULIAN_YEAR_SECONDS.times(1000) },
]
