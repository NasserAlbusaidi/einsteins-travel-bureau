/**
 * In-session + localStorage-backed store for user-designed brochures.
 * A brochure is a named snapshot of the bureau's current parameters, rendered
 * as a card in the DestinationPicker grid.
 */
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'etb:custom-brochures:v1'

export interface CustomBrochure {
  readonly id: string
  readonly name: string
  readonly hazard: 'SAFE' | 'CAUTION' | 'EXTREME' | 'FATAL'
  readonly palette: 'sky' | 'sun' | 'dusk' | 'void' | 'ember'
  readonly travelerVelocity: string
  readonly travelerRadius: string
  readonly travelerMass: string
  readonly referenceVelocity: string
  readonly referenceRadius: string
  readonly referenceMass: string
  readonly duration: string
  readonly createdAt: number
}

type Listener = () => void

function readStorage(): CustomBrochure[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidBrochure)
  } catch {
    return []
  }
}

function isValidBrochure(x: unknown): x is CustomBrochure {
  if (typeof x !== 'object' || x === null) return false
  const b = x as Record<string, unknown>
  return (
    typeof b.id === 'string' &&
    typeof b.name === 'string' &&
    typeof b.travelerVelocity === 'string' &&
    typeof b.duration === 'string'
  )
}

function writeStorage(list: CustomBrochure[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Storage full or unavailable — fail silently, state still lives in memory.
  }
}

let state: CustomBrochure[] = readStorage()
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(l: Listener): () => void {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function getCustomBrochures(): CustomBrochure[] {
  return state
}

export function addCustomBrochure(b: Omit<CustomBrochure, 'id' | 'createdAt'>): CustomBrochure {
  const entry: CustomBrochure = {
    ...b,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  }
  state = [...state, entry]
  writeStorage(state)
  emit()
  return entry
}

export function removeCustomBrochure(id: string): void {
  state = state.filter((b) => b.id !== id)
  writeStorage(state)
  emit()
}

export function useCustomBrochures(): CustomBrochure[] {
  const [list, setList] = useState<CustomBrochure[]>(state)
  useEffect(() => {
    return subscribe(() => setList(state))
  }, [])
  return list
}

export function getCustomBrochure(id: string): CustomBrochure | undefined {
  return state.find((b) => b.id === id)
}
