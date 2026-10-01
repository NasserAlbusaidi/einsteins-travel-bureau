/**
 * Travel-bureau brochure copy for each preset trip, keyed by scenario id.
 * Add an entry here whenever a scenario is added to physics/scenarios.ts.
 */

export type Hazard = 'SAFE' | 'CAUTION' | 'EXTREME' | 'FATAL'
export type Palette = 'sky' | 'sun' | 'dusk' | 'void' | 'ember'

export interface BrochureCopy {
  readonly emoji: string
  /** Plain name everyone recognises. */
  readonly title: string
  /** The bureau's marketing name. */
  readonly package: string
  readonly hazard: Hazard
  readonly palette: Palette
  /** One-sentence pitch, no jargon. */
  readonly pitch: string
  /** What this trip teaches, shown on the boarding pass. */
  readonly lesson: string
}

export const DESTINATIONS: Record<string, BrochureCopy> = {
  'twin-paradox': {
    emoji: '🚀',
    title: 'Twin paradox',
    package: 'Alpha Centauri Round-Trip',
    hazard: 'EXTREME',
    palette: 'ember',
    pitch: 'Fly to the nearest star and back at 90% of light speed while your twin stays home.',
    lesson:
      "This is the famous one. Moving very fast makes your clock tick slower than everyone else's. You don't feel it — your watch, your heartbeat and your birthdays all slow down together — but when you land, your twin is over five years older than you.",
  },
  'hail-mary': {
    emoji: '🛸',
    title: 'Hail Mary cruise',
    package: 'Hail Mary Deep-Space Cruise',
    hazard: 'EXTREME',
    palette: 'ember',
    pitch: 'Ten years of coasting at 92% of light speed, from Project Hail Mary.',
    lesson:
      'Same rule as the twin paradox, slightly faster. At 92% of light speed, ten years back home squeeze into about four years on board.',
  },
  'millers-planet': {
    emoji: '🌊',
    title: "Miller's planet",
    package: 'Gargantua Resort & Spa',
    hazard: 'FATAL',
    palette: 'void',
    pitch: 'The ocean planet from Interstellar, where one hour equals seven years back on Earth.',
    lesson:
      "No speed involved here — this is gravity. The closer you sit to something enormously heavy, the slower your clock runs. Parked just above a giant black hole's edge, an hour for you is seven years for everyone else. (To pull this off, the planet would have to hover about 78 metres above the edge. Don't try it.)",
  },
  gps: {
    emoji: '🛰️',
    title: 'GPS satellite',
    package: 'Low-Orbit Express',
    hazard: 'SAFE',
    palette: 'sky',
    pitch: 'Ride along with the satellites that run the map on your phone.',
    lesson:
      "Two effects fight here. The satellite moves fast, which slows its clock. But it's also 20,000 km up where Earth's gravity is weaker, which speeds its clock up. Gravity wins. Engineers correct for exactly this every day — without the fix, your phone's map would drift about 10 km per day.",
  },
  iss: {
    emoji: '🧑‍🚀',
    title: 'Space station',
    package: 'The Orbital Weekender',
    hazard: 'CAUTION',
    palette: 'sky',
    pitch: 'A day aboard the International Space Station, 400 km up.',
    lesson:
      "Same tug-of-war as GPS, but the station is lower and faster, so this time speed wins. Astronauts actually age a tiny bit slower than people on the ground.",
  },
  'scott-kelly': {
    emoji: '👯',
    title: 'Scott Kelly’s year in space',
    package: 'Year-Long Orbital Retreat',
    hazard: 'CAUTION',
    palette: 'dusk',
    pitch: 'The real twin experiment: astronaut Scott Kelly spent 340 days in orbit while his twin Mark stayed on Earth.',
    lesson:
      'A real-life twin paradox. Scott came home a few thousandths of a second younger than his identical twin Mark. Tiny, but real — and exactly what the math predicts.',
  },
  flight: {
    emoji: '✈️',
    title: 'Long-haul flight',
    package: 'Pacific Business Class',
    hazard: 'SAFE',
    palette: 'sun',
    pitch: 'An 11-hour flight from San Francisco to Tokyo at 10 km up.',
    lesson:
      'Yes, even you do this. Flying fast slows your clock; being higher up speeds it up. At cruising altitude, height narrowly wins — you land a few billionths of a second older. In 1971, physicists flew atomic clocks around the world on airliners and measured exactly this.',
  },
}

const CUSTOM_COPY: BrochureCopy = {
  emoji: '🧭',
  title: 'Your own trip',
  package: 'Bespoke Expedition',
  hazard: 'CAUTION',
  palette: 'dusk',
  pitch: 'A one-of-a-kind itinerary assembled at your request.',
  lesson: '',
}

export function getDestinationCopy(id: string | null): BrochureCopy {
  return (id && DESTINATIONS[id]) || CUSTOM_COPY
}

/** Palette → classes for brochure cards. */
export const PALETTE_CLASSES: Record<Palette, { band: string; accent: string }> = {
  sky: { band: 'bg-stamp-blue text-paper-light', accent: 'text-stamp-blue' },
  sun: { band: 'bg-mustard-dark text-paper-light', accent: 'text-mustard-dark' },
  dusk: { band: 'bg-olive text-paper-light', accent: 'text-olive-dark' },
  ember: { band: 'bg-terracotta text-paper-light', accent: 'text-terracotta-dark' },
  void: { band: 'bg-ink text-paper-light', accent: 'text-ink' },
}

export const HAZARD_CLASSES: Record<Hazard, string> = {
  SAFE: 'text-stamp-green border-stamp-green',
  CAUTION: 'text-mustard-dark border-mustard-dark',
  EXTREME: 'text-terracotta border-terracotta',
  FATAL: 'text-stamp-red border-stamp-red',
}
