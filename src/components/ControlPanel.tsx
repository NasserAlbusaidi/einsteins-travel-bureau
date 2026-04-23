import Decimal from 'decimal.js'
import { useStore } from '../store'
import { SCENARIOS, getScenario } from '../physics/scenarios'
import { C } from '../physics/constants'
import { formatVelocity, formatLength, formatMass, formatTime } from '../format'
import { LogSlider } from './LogSlider'

const VELOCITY_MIN = new Decimal('1e-3') // m/s
const VELOCITY_MAX = C.times('0.9999')
const RADIUS_MIN = new Decimal('1e-3') // m
const RADIUS_MAX = new Decimal('1e25') // m
const MASS_MIN = new Decimal('1') // kg
const MASS_MAX = new Decimal('1e40') // kg (headroom past supermassive BHs)
const DURATION_MIN = new Decimal('1') // s
const DURATION_MAX = new Decimal('1e12') // s (~31,700 yr)

export function ControlPanel() {
  const scenarioId = useStore((s) => s.scenarioId)
  const setScenario = useStore((s) => s.setScenario)
  const travelerVelocity = useStore((s) => s.travelerVelocity)
  const travelerRadius = useStore((s) => s.travelerRadius)
  const travelerMass = useStore((s) => s.travelerMass)
  const referenceVelocity = useStore((s) => s.referenceVelocity)
  const referenceRadius = useStore((s) => s.referenceRadius)
  const duration = useStore((s) => s.duration)
  const setTravelerVelocity = useStore((s) => s.setTravelerVelocity)
  const setTravelerRadius = useStore((s) => s.setTravelerRadius)
  const setReferenceVelocity = useStore((s) => s.setReferenceVelocity)
  const setReferenceRadius = useStore((s) => s.setReferenceRadius)
  const setSharedMass = useStore((s) => s.setSharedMass)
  const setDuration = useStore((s) => s.setDuration)

  const isCustom = scenarioId === 'custom'
  const scenario = isCustom ? null : getScenario(scenarioId)

  return (
    <aside className="flex flex-col gap-4 overflow-y-auto pr-2">
      <section>
        <label
          htmlFor="scenario"
          className="block text-[11px] uppercase tracking-wider text-slate-500 mb-2"
        >
          Scenario
        </label>
        <select
          id="scenario"
          value={scenarioId}
          onChange={(e) => setScenario(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
        >
          <option value="custom">Custom (tweak sliders below)</option>
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        {scenario ? (
          <>
            <h2 className="text-sm font-semibold text-slate-200 mb-2">{scenario.name}</h2>
            <p className="text-xs leading-relaxed text-slate-400">{scenario.description}</p>
            {scenario.expected ? (
              <p className="mt-3 text-xs text-cyan-400/80">
                <span className="text-slate-500">Expected:</span> {scenario.expected}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Custom state</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              You've modified a preset. Pick a scenario from the dropdown to snap back to a
              known configuration, or keep sliding to explore.
            </p>
          </>
        )}
      </section>

      <SliderGroup label="Traveler" accent="amber">
        <LogSlider
          label="Velocity"
          value={travelerVelocity}
          onChange={setTravelerVelocity}
          min={VELOCITY_MIN}
          max={VELOCITY_MAX}
          format={formatVelocity}
          secondary={(v) => `v/c = ${v.div(C).toExponential(3)}`}
        />
        <LogSlider
          label="Radius"
          value={travelerRadius}
          onChange={setTravelerRadius}
          min={RADIUS_MIN}
          max={RADIUS_MAX}
          format={formatLength}
        />
      </SliderGroup>

      <SliderGroup label="Reference" accent="sky">
        <LogSlider
          label="Velocity"
          value={referenceVelocity}
          onChange={setReferenceVelocity}
          min={VELOCITY_MIN}
          max={VELOCITY_MAX}
          format={formatVelocity}
          secondary={(v) => `v/c = ${v.div(C).toExponential(3)}`}
        />
        <LogSlider
          label="Radius"
          value={referenceRadius}
          onChange={setReferenceRadius}
          min={RADIUS_MIN}
          max={RADIUS_MAX}
          format={formatLength}
        />
      </SliderGroup>

      <SliderGroup label="Shared gravitational body" accent="violet">
        <LogSlider
          label="Mass"
          value={travelerMass.gt(0) ? travelerMass : new Decimal(MASS_MIN)}
          onChange={setSharedMass}
          min={MASS_MIN}
          max={MASS_MAX}
          format={formatMass}
        />
      </SliderGroup>

      <SliderGroup label="Duration" accent="slate">
        <LogSlider
          label="Reference proper time"
          value={duration}
          onChange={setDuration}
          min={DURATION_MIN}
          max={DURATION_MAX}
          format={formatTime}
        />
      </SliderGroup>
    </aside>
  )
}

interface GroupProps {
  label: string
  accent: 'amber' | 'sky' | 'violet' | 'slate'
  children: React.ReactNode
}

const ACCENT_CLASSES: Record<GroupProps['accent'], string> = {
  amber: 'text-amber-400/80',
  sky: 'text-sky-400/80',
  violet: 'text-violet-400/80',
  slate: 'text-slate-400/80',
}

function SliderGroup({ label, accent, children }: GroupProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-4">
      <h3
        className={`text-[11px] uppercase tracking-wider font-medium ${ACCENT_CLASSES[accent]}`}
      >
        {label}
      </h3>
      {children}
    </section>
  )
}
