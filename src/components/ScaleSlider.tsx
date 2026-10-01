import Decimal from 'decimal.js'
import { useId } from 'react'
import type { Scale } from '../scales'
import type { Landmark } from '../copy/places'

interface Props {
  label: string
  value: Decimal
  scale: Scale
  onChange: (value: Decimal) => void
  /** Big readout, e.g. "27,576 km/h". */
  readout: string
  /** Small line under the readout, e.g. "Earth to the Moon in 14 hours". */
  hint?: string | undefined
  landmarks?: readonly Landmark[]
}

const STEPS = 1000

/** A slider over a non-linear scale, with tappable landmark chips underneath. */
export function ScaleSlider({ label, value, scale, onChange, readout, hint, landmarks }: Props) {
  const id = useId()
  const pos = Math.round(scale.toPos(value) * STEPS)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-xl text-terracotta-dark tabular-nums">
          {readout}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={STEPS}
        step={1}
        value={pos}
        onChange={(e) => onChange(scale.fromPos(Number(e.target.value) / STEPS))}
        aria-valuetext={readout}
      />
      {hint ? <p className="text-sm text-ink-light -mt-1">{hint}</p> : null}
      {landmarks && landmarks.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${label} presets`}>
          {landmarks.map((l) => {
            const active = isClose(value, l.value)
            return (
              <button
                key={l.label}
                type="button"
                onClick={() => onChange(l.value)}
                aria-pressed={active}
                className={`chip ${active ? 'chip-active' : ''}`}
              >
                {l.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function isClose(a: Decimal, b: Decimal): boolean {
  if (b.isZero()) return a.isZero()
  return a.minus(b).abs().div(b.abs()).lt('0.005')
}
