/**
 * Travel-bureau brochure copy for each preset trip, keyed by scenario id.
 * Add an entry here whenever a scenario is added to physics/scenarios.ts.
 */

import type { IconName } from '../components/art/Icons'

export type Hazard = 'SAFE' | 'CAUTION' | 'EXTREME' | 'FATAL'
export type BoardStatus = 'BOARDING' | 'ON TIME' | 'IN ORBIT' | 'LANDED' | 'ONE WAY' | 'FINAL CALL'

export interface BrochureCopy {
  readonly icon: IconName
  /** Plain name everyone recognises. */
  readonly title: string
  /** The bureau's marketing name. */
  readonly package: string
  readonly hazard: Hazard
  /** Departures board: flight number, short destination (16 chars max) and status. */
  readonly flight: string
  readonly board: string
  readonly status: BoardStatus
  /** One-sentence pitch, no jargon. */
  readonly pitch: string
  /** What this trip teaches, shown on the boarding pass. */
  readonly lesson: string
}

export const DESTINATIONS: Record<string, BrochureCopy> = {
  'twin-paradox': {
    icon: 'rocket',
    title: 'Twin paradox',
    package: 'Alpha Centauri Round-Trip',
    hazard: 'EXTREME',
    flight: 'ETB 001',
    board: 'ALPHA CENTAURI',
    status: 'BOARDING',
    pitch: 'Fly to the nearest star and back at 90% of light speed while your twin stays home.',
    lesson:
      "This is the famous one. Moving very fast makes your clock tick slower than everyone else's. You don't feel it — your watch, your heartbeat and your birthdays all slow down together — but when you land, your twin is over five years older than you.",
  },
  'hail-mary': {
    icon: 'rocket',
    title: 'Hail Mary cruise',
    package: 'Hail Mary Deep-Space Cruise',
    hazard: 'EXTREME',
    flight: 'ETB 042',
    board: 'TAU CETI',
    status: 'ON TIME',
    pitch: 'Ten years of coasting at 92% of light speed, from Project Hail Mary.',
    lesson:
      'Same rule as the twin paradox, slightly faster. At 92% of light speed, ten years back home squeeze into about four years on board.',
  },
  'millers-planet': {
    icon: 'blackhole',
    title: "Miller's planet",
    package: 'Gargantua Resort & Spa',
    hazard: 'FATAL',
    flight: 'ETB 007',
    board: "MILLER'S PLANET",
    status: 'ONE WAY',
    pitch: 'The ocean planet from Interstellar, where one hour equals seven years back on Earth.',
    lesson:
      "No speed involved here — this is gravity. The closer you sit to something enormously heavy, the slower your clock runs. Parked just above a giant black hole's edge, an hour for you is seven years for everyone else. (To pull this off, the planet would have to hover about 78 metres above the edge. Don't try it.)",
  },
  gps: {
    icon: 'satellite',
    title: 'GPS satellite',
    package: 'Low-Orbit Express',
    hazard: 'SAFE',
    flight: 'ETB 020',
    board: 'GPS ORBIT',
    status: 'IN ORBIT',
    pitch: 'Ride along with the satellites that run the map on your phone.',
    lesson:
      "Two effects fight here. The satellite moves fast, which slows its clock. But it's also 20,000 km up where Earth's gravity is weaker, which speeds its clock up. Gravity wins. Engineers correct for exactly this every day — without the fix, your phone's map would drift about 10 km per day.",
  },
  iss: {
    icon: 'station',
    title: 'Space station',
    package: 'The Orbital Weekender',
    hazard: 'CAUTION',
    flight: 'ETB 400',
    board: 'SPACE STATION',
    status: 'IN ORBIT',
    pitch: 'A day aboard the International Space Station, 400 km up.',
    lesson:
      "Same tug-of-war as GPS, but the station is lower and faster, so this time speed wins. Astronauts actually age a tiny bit slower than people on the ground.",
  },
  'scott-kelly': {
    icon: 'twins',
    title: 'Scott Kelly’s year in space',
    package: 'Year-Long Orbital Retreat',
    hazard: 'CAUTION',
    flight: 'ETB 340',
    board: 'KELLY TWINS',
    status: 'LANDED',
    pitch: 'The real twin experiment: astronaut Scott Kelly spent 340 days in orbit while his twin Mark stayed on Earth.',
    lesson:
      'A real-life twin paradox. Scott came home a few thousandths of a second younger than his identical twin Mark. Tiny, but real — and exactly what the math predicts.',
  },
  flight: {
    icon: 'plane',
    title: 'Long-haul flight',
    package: 'Pacific Business Class',
    hazard: 'SAFE',
    flight: 'ETB 071',
    board: 'SFO - TOKYO',
    status: 'FINAL CALL',
    pitch: 'An 11-hour flight from San Francisco to Tokyo at 10 km up.',
    lesson:
      'Yes, even you do this. Flying fast slows your clock; being higher up speeds it up. At cruising altitude, height narrowly wins — you land a few billionths of a second older. In 1971, physicists flew atomic clocks around the world on airliners and measured exactly this.',
  },
}

const CUSTOM_COPY: BrochureCopy = {
  icon: 'compass',
  title: 'Your own trip',
  package: 'Bespoke Expedition',
  hazard: 'CAUTION',
  flight: 'ETB 999',
  board: 'YOUR OWN TRIP',
  status: 'BOARDING',
  pitch: 'A one-of-a-kind itinerary assembled at your request.',
  lesson: '',
}

export function getDestinationCopy(id: string | null): BrochureCopy {
  return (id && DESTINATIONS[id]) || CUSTOM_COPY
}

/** Most dramatic first: this is the order of the departures board. */
export const BOARD_ORDER: readonly string[] = [
  'twin-paradox',
  'millers-planet',
  'hail-mary',
  'scott-kelly',
  'iss',
  'gps',
  'flight',
]

/** Hazard colour on the ticket (cream) and on the board (night). */
export const HAZARD_TONE: Record<Hazard, { onCream: string; onNight: string }> = {
  SAFE: { onCream: '#1f7a4a', onNight: '#7ddc9a' },
  CAUTION: { onCream: '#8c6820', onNight: '#f3d38a' },
  EXTREME: { onCream: '#b2401c', onNight: '#ff9b75' },
  FATAL: { onCream: '#b3261e', onNight: '#ff6b6b' },
}

export const STATUS_TONE: Record<BoardStatus, string> = {
  BOARDING: '#f3d38a',
  'ON TIME': '#7ddc9a',
  'IN ORBIT': '#8be6dc',
  LANDED: '#a3abd3',
  'ONE WAY': '#ff6b6b',
  'FINAL CALL': '#ffa384',
}
