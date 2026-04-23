/**
 * Travel-bureau brochure copy for each physics scenario.
 * Keyed by scenario id. Add a new entry here when a scenario is added.
 */

export interface BrochureCopy {
  readonly tagline: string
  readonly region: string
  readonly hazard: 'SAFE' | 'CAUTION' | 'EXTREME' | 'FATAL'
  readonly sticker: string
  readonly blurb: string
  readonly palette: 'sky' | 'sun' | 'dusk' | 'void' | 'ember'
}

export const DESTINATIONS: Record<string, BrochureCopy> = {
  gps: {
    tagline: 'Low-Orbit Express',
    region: 'Medium Earth Orbit',
    hazard: 'SAFE',
    sticker: 'SIGNATURE PACKAGE',
    blurb:
      'Circle the Earth twice a day at a comfortable 3.9 km/s. Our signature daytrip — gravity relaxes just enough to age you faster than the groundlings below.',
    palette: 'sky',
  },
  iss: {
    tagline: 'The Orbital Weekender',
    region: 'Low Earth Orbit',
    hazard: 'CAUTION',
    sticker: 'FREE FALL INCLUDED',
    blurb:
      'Skim the upper atmosphere aboard a veteran orbital station. You will weigh nothing and age slightly less than your spouse. 16 sunrises a day — towels provided.',
    palette: 'sky',
  },
  'scott-kelly': {
    tagline: 'Year-Long Orbital Retreat',
    region: 'Low Earth Orbit',
    hazard: 'CAUTION',
    sticker: 'EXTENDED STAY',
    blurb:
      '340 nights aboard the station while your twin holds down the Earth. You come back a few milliseconds younger and with space-knees. Our Longest Ongoing Package.',
    palette: 'dusk',
  },
  flight: {
    tagline: 'Pacific Business Class',
    region: 'Stratosphere',
    hazard: 'SAFE',
    sticker: 'EVERYDAY LUXURY',
    blurb:
      'San Francisco to Tokyo at 10 km altitude. Gravitational altitude juuust wins against cabin speed — you disembark having aged a few nanoseconds extra. Drinks included.',
    palette: 'sun',
  },
  'twin-paradox': {
    tagline: 'Alpha Centauri Round-Trip',
    region: 'Interstellar',
    hazard: 'EXTREME',
    sticker: 'FLAGSHIP VOYAGE',
    blurb:
      'A 4.37-light-year getaway at ninety percent the speed of light. Leave Earth, wave to Proxima, come home to find a decade has passed without you. Our most photographed trip.',
    palette: 'ember',
  },
  'millers-planet': {
    tagline: 'Gargantua Resort & Spa',
    region: 'Supermassive Event Horizon',
    hazard: 'FATAL',
    sticker: 'LIMITED AVAILABILITY',
    blurb:
      "Hover above a hundred-million solar mass black hole where one hour on the sand equals seven Earth years. Waves are exceptional. Tides: catastrophic.",
    palette: 'void',
  },
  'hail-mary': {
    tagline: 'Hail Mary Cruise',
    region: 'Deep Space',
    hazard: 'EXTREME',
    sticker: 'CAPTAIN\'S PICK',
    blurb:
      'Ten years of coasting at 0.92c, no stops. Every ten years back home passes as four on the ship. Bring a book. Bring a friend. Bring a new one, eventually.',
    palette: 'ember',
  },
}

const DEFAULT_COPY: BrochureCopy = {
  tagline: 'Bespoke Expedition',
  region: 'Unclassified',
  hazard: 'CAUTION',
  sticker: 'CUSTOM ORDER',
  blurb: 'A one-of-one itinerary assembled at your request. Consult the solver for specifics.',
  palette: 'dusk',
}

/** Returns the brochure copy for a scenario id, or a default if unknown. */
export function getDestinationCopy(id: string): BrochureCopy {
  return DESTINATIONS[id] ?? DEFAULT_COPY
}

/** Palette → {background, ink, accent} for brochure card + stamp styling. */
export const PALETTE_CLASSES: Record<
  BrochureCopy['palette'],
  {
    card: string
    band: string
    stamp: string
    accent: string
  }
> = {
  sky: {
    card: 'bg-[#e6ddc4] border-ink/20',
    band: 'bg-stamp-blue text-paper-light',
    stamp: 'text-stamp-blue',
    accent: 'text-stamp-blue',
  },
  sun: {
    card: 'bg-[#f0dfb6] border-ink/20',
    band: 'bg-mustard-dark text-paper-light',
    stamp: 'text-mustard-dark',
    accent: 'text-mustard-dark',
  },
  dusk: {
    card: 'bg-[#dcd2bc] border-ink/20',
    band: 'bg-olive text-paper-light',
    stamp: 'text-olive-dark',
    accent: 'text-olive-dark',
  },
  ember: {
    card: 'bg-[#ebcdad] border-ink/20',
    band: 'bg-terracotta text-paper-light',
    stamp: 'text-terracotta-dark',
    accent: 'text-terracotta-dark',
  },
  void: {
    card: 'bg-[#c9b7a0] border-ink/40',
    band: 'bg-ink text-paper-light',
    stamp: 'text-ink',
    accent: 'text-ink',
  },
}

/** Hazard → small colored badge classes. */
export const HAZARD_CLASSES: Record<BrochureCopy['hazard'], string> = {
  SAFE: 'text-stamp-green border-stamp-green',
  CAUTION: 'text-mustard-dark border-mustard-dark',
  EXTREME: 'text-terracotta border-terracotta',
  FATAL: 'text-stamp-red border-stamp-red',
}
