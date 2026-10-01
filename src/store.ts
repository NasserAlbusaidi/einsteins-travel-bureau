import { create } from 'zustand'
import type Decimal from 'decimal.js'
import type { BodyId } from './physics/bodies'
import {
  DEFAULT_PRESET,
  decodeTrip,
  encodeTrip,
  getPresetTrip,
  withHeight,
  withPlace,
  type Trip,
  type TripState,
} from './trip'

interface Store extends TripState {
  /** Bumped whenever a trip is loaded wholesale, so result animations replay. */
  readonly loadCount: number
  choosePreset: (id: string) => void
  loadTrip: (trip: Trip) => void
  setSpeed: (v: Decimal) => void
  setPlace: (place: BodyId) => void
  setHeight: (h: Decimal) => void
  setDuration: (t: Decimal) => void
}

function initial(): TripState {
  const fromHash = typeof window !== 'undefined' ? decodeTrip(window.location.hash) : null
  return fromHash ?? { presetId: DEFAULT_PRESET, trip: getPresetTrip(DEFAULT_PRESET)! }
}

export const useStore = create<Store>((set) => ({
  ...initial(),
  loadCount: 0,

  choosePreset: (id) => {
    const trip = getPresetTrip(id)
    if (trip) set((s) => ({ presetId: id, trip, loadCount: s.loadCount + 1 }))
  },
  loadTrip: (trip) => set((s) => ({ presetId: null, trip, loadCount: s.loadCount + 1 })),

  // Any manual edit turns the trip into a custom one.
  setSpeed: (speed) => set((s) => ({ presetId: null, trip: { ...s.trip, speed } })),
  setPlace: (place) => set((s) => ({ presetId: null, trip: withPlace(s.trip, place) })),
  setHeight: (h) => set((s) => ({ presetId: null, trip: withHeight(s.trip, h) })),
  setDuration: (duration) => set((s) => ({ presetId: null, trip: { ...s.trip, duration } })),
}))

// Keep the URL hash in sync so every trip is a shareable link.
if (typeof window !== 'undefined') {
  let last = encodeTrip(useStore.getState())
  useStore.subscribe((s) => {
    const next = encodeTrip(s)
    if (next === last) return
    last = next
    window.history.replaceState(null, '', '#' + next)
  })
  window.addEventListener('hashchange', () => {
    const fromHash = decodeTrip(window.location.hash)
    if (fromHash) useStore.setState((s) => ({ ...fromHash, loadCount: s.loadCount + 1 }))
  })
}
