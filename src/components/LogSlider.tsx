import Decimal from 'decimal.js'

interface Props {
  label: string
  value: Decimal
  onChange: (value: Decimal) => void
  /** Log-scale range (both must be > 0). */
  min: number | string | Decimal
  max: number | string | Decimal
  format: (v: Decimal) => string
  /** Optional secondary display (e.g. raw SI value in scientific notation). */
  secondary?: (v: Decimal) => string
}

/**
 * Log-scale slider over [min, max]. The underlying <input type=range> lives in
 * normalized [0, 1] space; we map via base-10 logs so each decade takes the
 * same visual distance. Zero/negative values are clamped to the minimum.
 */
export function LogSlider({ label, value, onChange, min, max, format, secondary }: Props) {
  const minD = min instanceof Decimal ? min : new Decimal(min)
  const maxD = max instanceof Decimal ? max : new Decimal(max)
  const log10Min = Decimal.log10(minD).toNumber()
  const log10Max = Decimal.log10(maxD).toNumber()
  const span = log10Max - log10Min

  const currentLog10 = value.gt(0) ? Decimal.log10(value).toNumber() : log10Min
  const pos = Math.max(0, Math.min(1, (currentLog10 - log10Min) / span))

  const handleChange = (newPos: number) => {
    const clamped = Math.max(0, Math.min(1, newPos))
    const newLog10 = log10Min + span * clamped
    onChange(new Decimal(10).pow(newLog10))
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label className="font-display text-[11px] uppercase tracking-widest text-ink-softer">{label}</label>
        <span className="font-mono text-xs text-ink tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={pos}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        aria-label={label}
      />
      {secondary ? (
        <div className="text-[10px] text-ink-softer text-right font-mono tabular-nums italic">
          {secondary(value)}
        </div>
      ) : null}
    </div>
  )
}
