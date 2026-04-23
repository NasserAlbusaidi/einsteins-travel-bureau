import { useMemo } from 'react'
import { useCurrentObservers } from '../store'
import { dilate } from '../physics/relativity'
import { GammaReadout } from './GammaReadout'
import { StatRow } from './StatRow'
import { DominantBadge } from './DominantBadge'
import { AgeChart } from './AgeChart'
import { SpacetimeDiagram } from './SpacetimeDiagram'
import { formatTime } from '../format'

export function ResultsPanel() {
  const { traveler, reference, duration, trajectory } = useCurrentObservers()

  const result = useMemo(
    () => {
      try {
        return { ok: true as const, value: dilate(traveler, reference, duration) }
      } catch (err) {
        return { ok: false as const, error: (err as Error).message }
      }
    },
    [traveler, reference, duration],
  )

  if (!result.ok) {
    return (
      <section className="flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
          <h3 className="text-sm font-semibold text-amber-300 mb-1">
            Unphysical configuration
          </h3>
          <p className="text-xs text-amber-200/80">{result.error}</p>
          <p className="text-xs text-slate-500 mt-2">
            Adjust the sliders — probably v is too close to c for the current r/M combo, or the
            radius has slipped below the Schwarzschild horizon.
          </p>
        </div>
      </section>
    )
  }

  const r = result.value
  const travelerYounger = r.delta.isNegative()

  return (
    <section className="flex flex-col gap-4 overflow-y-auto pr-1">
      <GammaReadout ratio={r.ratio} />

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Dilation over scenario</h3>
          <DominantBadge effect={r.dominantEffect} />
        </div>
        <StatRow label="Reference proper time" value={formatTime(r.referenceProperTime)} />
        <StatRow label="Traveler proper time" value={formatTime(r.travelerProperTime)} />
        <StatRow
          label={travelerYounger ? 'Traveler ages LESS by' : 'Traveler ages MORE by'}
          value={formatTime(r.delta.abs())}
          accent
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AgeChart result={r} />
        <SpacetimeDiagram travelerVelocity={traveler.velocity} trajectory={trajectory} />
      </div>
    </section>
  )
}
