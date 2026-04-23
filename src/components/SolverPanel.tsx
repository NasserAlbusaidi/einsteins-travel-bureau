import { useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import { solveForRatio } from '../physics/solver'
import { EARTH_MASS, SUN_MASS } from '../physics/constants'
import { formatVelocity, formatLength, formatMass } from '../format'

interface MassPreset {
  id: string
  label: string
  value: Decimal
}

const MASS_PRESETS: MassPreset[] = [
  { id: 'earth', label: 'Earth', value: EARTH_MASS },
  { id: 'sun', label: 'Sun', value: SUN_MASS },
  { id: 'sgr-a', label: 'Sgr A* (4.15M M☉)', value: SUN_MASS.times('4.15e6') },
  { id: 'gargantua', label: 'Gargantua (1e8 M☉)', value: SUN_MASS.times('1e8') },
]

export function SolverPanel() {
  const [xInput, setXInput] = useState('3')
  const [massId, setMassId] = useState<string>('gargantua')

  const mass = useMemo(
    () => MASS_PRESETS.find((m) => m.id === massId)?.value ?? EARTH_MASS,
    [massId],
  )

  const { result, error } = useMemo(() => {
    const x = Number(xInput)
    if (!Number.isFinite(x) || x <= 1) {
      return { result: null, error: 'Enter a value > 1 (traveler ages slower than reference).' }
    }
    try {
      const ratio = new Decimal(1).div(x)
      return { result: solveForRatio({ ratio, mass }), error: null }
    } catch (e) {
      return { result: null, error: (e as Error).message }
    }
  }, [xInput, mass])

  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
      <div>
        <h2 className="text-sm font-semibold text-slate-200 mb-2">What-if solver</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Given a desired dilation ratio, find what velocity (special relativity) or what radius
          above a gravitating body (general relativity) would produce it. &quot;I want 1 traveler
          year to feel like X reference years&quot;.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-xs">
            <span className="uppercase tracking-wider text-slate-500">
              1 traveler year = X reference years
            </span>
            <input
              type="number"
              min={1}
              step={0.1}
              value={xInput}
              onChange={(e) => setXInput(e.target.value)}
              className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="uppercase tracking-wider text-slate-500">
              Mass for gravitational solution
            </span>
            <select
              value={massId}
              onChange={(e) => setMassId(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {MASS_PRESETS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 min-w-[320px]">
        <SolutionCard
          title="Velocity (flat-space SR)"
          value={result?.velocity ? formatVelocity(result.velocity) : null}
          description="Coast at this speed in flat space."
          error={error}
        />
        <SolutionCard
          title="Radius (hover above mass)"
          value={result?.radius ? formatLength(result.radius) : null}
          description={`Stationary observer at this r above a ${formatMass(mass)}.`}
          error={error}
        />
      </div>
    </div>
  )
}

interface CardProps {
  title: string
  value: string | null
  description: string
  error: string | null
}

function SolutionCard({ title, value, description, error }: CardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{title}</div>
      <div className="font-mono text-lg text-cyan-300 mt-1 tabular-nums">
        {error ? <span className="text-amber-400 text-sm">{error}</span> : (value ?? '—')}
      </div>
      <div className="text-[11px] text-slate-500 mt-1">{description}</div>
    </div>
  )
}
