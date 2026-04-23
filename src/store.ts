import { create } from 'zustand'
import Decimal from 'decimal.js'
import { SCENARIOS, getScenario } from './physics/scenarios'
import { getCustomBrochure } from './customBrochures'
import type { Scalar, ObserverState } from './physics/types'
import type { Trajectory } from './physics/scenarios'

const CUSTOM_ID = 'custom'

function d(x: Scalar): Decimal {
  return x instanceof Decimal ? x : new Decimal(x)
}

const SCENARIO_IDS = new Set(SCENARIOS.map((s) => s.id))

function readHash(): Omit<State, StateDataKeys> | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  const params = new URLSearchParams(hash)
  const s = params.get('s')
  if (!s) return null
  if (s !== CUSTOM_ID && SCENARIO_IDS.has(s)) {
    try {
      return loadScenario(s)
    } catch {
      return null
    }
  }
  if (s !== CUSTOM_ID) {
    const custom = getCustomBrochure(s)
    if (custom) {
      return {
        scenarioId: s,
        travelerVelocity: new Decimal(custom.travelerVelocity),
        travelerRadius: new Decimal(custom.travelerRadius),
        travelerMass: new Decimal(custom.travelerMass),
        referenceVelocity: new Decimal(custom.referenceVelocity),
        referenceRadius: new Decimal(custom.referenceRadius),
        referenceMass: new Decimal(custom.referenceMass),
        duration: new Decimal(custom.duration),
        trajectory: { kind: 'linear' },
      }
    }
    return null
  }
  const parse = (key: string, fallback: Decimal): Decimal => {
    const v = params.get(key)
    if (v === null) return fallback
    try {
      return new Decimal(v)
    } catch {
      return fallback
    }
  }
  const base = loadScenario(DEFAULT_ID)
  return {
    scenarioId: CUSTOM_ID,
    travelerVelocity: parse('tv', base.travelerVelocity),
    travelerRadius: parse('tr', base.travelerRadius),
    travelerMass: parse('tm', base.travelerMass),
    referenceVelocity: parse('rv', base.referenceVelocity),
    referenceRadius: parse('rr', base.referenceRadius),
    referenceMass: parse('rm', base.referenceMass),
    duration: parse('d', base.duration),
    trajectory: { kind: 'linear' },
  }
}

export function encodeStateToHash(s: Pick<State,
  | 'scenarioId'
  | 'travelerVelocity'
  | 'travelerRadius'
  | 'travelerMass'
  | 'referenceVelocity'
  | 'referenceRadius'
  | 'referenceMass'
  | 'duration'
>): string {
  const params = new URLSearchParams()
  if (s.scenarioId === CUSTOM_ID) {
    params.set('s', CUSTOM_ID)
    params.set('tv', s.travelerVelocity.toString())
    params.set('tr', s.travelerRadius.toString())
    params.set('tm', s.travelerMass.toString())
    params.set('rv', s.referenceVelocity.toString())
    params.set('rr', s.referenceRadius.toString())
    params.set('rm', s.referenceMass.toString())
    params.set('d', s.duration.toString())
  } else {
    params.set('s', s.scenarioId)
  }
  return params.toString()
}

function writeHash(s: State): void {
  if (typeof window === 'undefined') return
  const next = '#' + encodeStateToHash(s)
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', next)
  }
}

interface State {
  /** Active scenario id, or 'custom' when any slider has been touched. */
  scenarioId: string

  travelerVelocity: Decimal
  travelerRadius: Decimal
  travelerMass: Decimal
  referenceVelocity: Decimal
  referenceRadius: Decimal
  referenceMass: Decimal
  duration: Decimal
  /** Drawn on the spacetime diagram. Survives slider edits. */
  trajectory: Trajectory

  setScenario: (id: string) => void
  setTravelerVelocity: (v: Decimal) => void
  setTravelerRadius: (r: Decimal) => void
  setReferenceVelocity: (v: Decimal) => void
  setReferenceRadius: (r: Decimal) => void
  /** Sets both traveler and reference mass (shared gravitational body). */
  setSharedMass: (m: Decimal) => void
  setDuration: (t: Decimal) => void
}

type StateDataKeys =
  | 'setScenario'
  | 'setTravelerVelocity'
  | 'setTravelerRadius'
  | 'setReferenceVelocity'
  | 'setReferenceRadius'
  | 'setSharedMass'
  | 'setDuration'

function loadScenario(id: string): Omit<State, StateDataKeys> {
  const s = getScenario(id)
  return {
    scenarioId: id,
    travelerVelocity: d(s.traveler.velocity),
    travelerRadius: d(s.traveler.radius),
    travelerMass: d(s.traveler.mass),
    referenceVelocity: d(s.reference.velocity),
    referenceRadius: d(s.reference.radius),
    referenceMass: d(s.reference.mass),
    duration: s.duration,
    trajectory: s.trajectory ?? { kind: 'linear' },
  }
}

const DEFAULT_ID = SCENARIOS[0]?.id ?? 'gps'

export const useStore = create<State>((set) => ({
  ...(readHash() ?? loadScenario(DEFAULT_ID)),

  setScenario: (id) => {
    if (id === CUSTOM_ID) {
      set({ scenarioId: CUSTOM_ID })
      return
    }
    const custom = getCustomBrochure(id)
    if (custom) {
      set({
        scenarioId: id,
        travelerVelocity: new Decimal(custom.travelerVelocity),
        travelerRadius: new Decimal(custom.travelerRadius),
        travelerMass: new Decimal(custom.travelerMass),
        referenceVelocity: new Decimal(custom.referenceVelocity),
        referenceRadius: new Decimal(custom.referenceRadius),
        referenceMass: new Decimal(custom.referenceMass),
        duration: new Decimal(custom.duration),
        trajectory: { kind: 'linear' },
      })
      return
    }
    set(loadScenario(id))
  },

  setTravelerVelocity: (v) => set({ travelerVelocity: v, scenarioId: CUSTOM_ID }),
  setTravelerRadius: (r) => set({ travelerRadius: r, scenarioId: CUSTOM_ID }),
  setReferenceVelocity: (v) => set({ referenceVelocity: v, scenarioId: CUSTOM_ID }),
  setReferenceRadius: (r) => set({ referenceRadius: r, scenarioId: CUSTOM_ID }),
  setSharedMass: (m) => set({ travelerMass: m, referenceMass: m, scenarioId: CUSTOM_ID }),
  setDuration: (t) => set({ duration: t, scenarioId: CUSTOM_ID }),
}))

// Sync store → URL hash whenever any observable field changes.
if (typeof window !== 'undefined') {
  let lastHash = ''
  useStore.subscribe((s) => {
    const next = encodeStateToHash(s)
    if (next !== lastHash) {
      lastHash = next
      writeHash(s)
    }
  })
  // Listen for back/forward nav so shared deep-links Just Work.
  window.addEventListener('hashchange', () => {
    const fromHash = readHash()
    if (fromHash) useStore.setState(fromHash)
  })
}

/**
 * Extract the current observer states and duration for feeding into dilate().
 * Reads six fields — zustand shallow-compares each selector independently,
 * so rebuilding these objects here is cheap and doesn't cause spurious renders.
 */
export function useCurrentObservers(): {
  traveler: ObserverState
  reference: ObserverState
  duration: Decimal
  trajectory: Trajectory
} {
  const travelerVelocity = useStore((s) => s.travelerVelocity)
  const travelerRadius = useStore((s) => s.travelerRadius)
  const travelerMass = useStore((s) => s.travelerMass)
  const referenceVelocity = useStore((s) => s.referenceVelocity)
  const referenceRadius = useStore((s) => s.referenceRadius)
  const referenceMass = useStore((s) => s.referenceMass)
  const duration = useStore((s) => s.duration)
  const trajectory = useStore((s) => s.trajectory)
  return {
    traveler: { velocity: travelerVelocity, radius: travelerRadius, mass: travelerMass },
    reference: { velocity: referenceVelocity, radius: referenceRadius, mass: referenceMass },
    duration,
    trajectory,
  }
}
