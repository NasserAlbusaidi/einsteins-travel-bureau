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
  { id: 'earth', label: 'Earth (home)', value: EARTH_MASS },
  { id: 'sun', label: 'The Sun', value: SUN_MASS },
  { id: 'sgr-a', label: 'Sgr A* · Milky Way core', value: SUN_MASS.times('4.15e6') },
  { id: 'gargantua', label: 'Gargantua · Interstellar', value: SUN_MASS.times('1e8') },
]

export function CustomItinerary() {
  const [xInput, setXInput] = useState('3')
  const [massId, setMassId] = useState<string>('gargantua')

  const mass = useMemo(
    () => MASS_PRESETS.find((m) => m.id === massId)?.value ?? EARTH_MASS,
    [massId],
  )

  const { result, error } = useMemo(() => {
    const x = Number(xInput)
    if (!Number.isFinite(x) || x <= 1) {
      return { result: null, error: 'Enter a value > 1 (your year must take longer back home).' }
    }
    try {
      const ratio = new Decimal(1).div(x)
      return { result: solveForRatio({ ratio, mass }), error: null }
    } catch (e) {
      return { result: null, error: (e as Error).message }
    }
  }, [xInput, mass])

  return (
    <section className="paper-card p-6">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-softer">
            Section IV — Bespoke Services
          </div>
          <h2 className="font-display text-3xl text-ink mt-0.5">Custom Itinerary Builder</h2>
          <p className="text-sm text-ink-light italic mt-1 max-w-2xl">
            Name your desired ratio and we'll compute two ways to get there — coast at a high
            velocity, or loiter near a massive body. The math is identical; the honeymoon is different.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="bg-paper-dark/30 border-2 border-ink/20 rounded-sm p-4">
          <div className="flex flex-wrap items-end gap-6">
            <label className="flex flex-col gap-1">
              <span className="font-display text-[11px] uppercase tracking-widest text-ink-softer">
                1 of your years =
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={xInput}
                  onChange={(e) => setXInput(e.target.value)}
                  className="w-28 rounded-sm border-2 border-ink/30 bg-paper-light px-3 py-2 font-mono text-lg text-ink focus:border-terracotta focus:outline-none"
                />
                <span className="font-display text-sm text-ink">years back home</span>
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-display text-[11px] uppercase tracking-widest text-ink-softer">
                Gravity well available
              </span>
              <select
                value={massId}
                onChange={(e) => setMassId(e.target.value)}
                className="rounded-sm border-2 border-ink/30 bg-paper-light px-3 py-2 font-sans text-sm text-ink focus:border-terracotta focus:outline-none"
              >
                {MASS_PRESETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-3 text-[11px] text-ink-softer italic">
            Tell us what you want. We'll tell you the laws of physics' price tag.
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[320px]">
          <SolutionCard
            title="Option A · Cruise Package"
            value={result?.velocity ? formatVelocity(result.velocity) : null}
            description="Coast at this speed through flat space. Bring snacks."
            error={error}
            accent="terracotta"
          />
          <SolutionCard
            title="Option B · Gravity Resort"
            value={result?.radius ? formatLength(result.radius) : null}
            description={`Hover at this altitude above a ${formatMass(mass)} body.`}
            error={error}
            accent="blue"
          />
        </div>
      </div>
    </section>
  )
}

interface CardProps {
  title: string
  value: string | null
  description: string
  error: string | null
  accent: 'terracotta' | 'blue'
}

const ACCENT_CLASSES: Record<CardProps['accent'], { border: string; text: string; heading: string }> = {
  terracotta: {
    border: 'border-terracotta',
    text: 'text-terracotta-dark',
    heading: 'text-terracotta-dark',
  },
  blue: {
    border: 'border-stamp-blue',
    text: 'text-stamp-blue',
    heading: 'text-stamp-blue',
  },
}

function SolutionCard({ title, value, description, error, accent }: CardProps) {
  const a = ACCENT_CLASSES[accent]
  return (
    <div className={`rounded-sm border-2 ${a.border} bg-paper-light p-4`}>
      <div className={`font-display text-[11px] uppercase tracking-widest ${a.heading}`}>{title}</div>
      <div className={`font-display text-[26px] ${a.text} mt-1 tabular-nums`}>
        {error ? <span className="text-[13px] font-sans italic text-ink-softer">{error}</span> : (value ?? '—')}
      </div>
      <div className="text-[12px] text-ink-light mt-1 italic">{description}</div>
    </div>
  )
}
