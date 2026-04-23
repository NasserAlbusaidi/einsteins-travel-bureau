import Decimal from 'decimal.js'
import { formatGamma } from '../format'

interface Props {
  ratio: Decimal
}

const NEAR_UNITY_THRESHOLD = new Decimal('1e-3')

export function GammaReadout({ ratio }: Props) {
  const diffFromOne = ratio.minus(1)
  const isNearUnity = diffFromOne.abs().lt(NEAR_UNITY_THRESHOLD)

  if (isNearUnity) {
    const sign = diffFromOne.isNegative() ? '−' : '+'
    return (
      <div className="paper-card bg-paper-light p-4 flex flex-col justify-center items-start gap-2 min-h-[140px]">
        <div className="font-display text-[10px] uppercase tracking-[0.3em] text-ink-softer">
          Dilation Coefficient
        </div>
        <div className="font-display text-2xl text-ink">
          γ ≈ 1
        </div>
        <div className="font-mono text-[13px] text-terracotta-dark tabular-nums">
          1 {sign} {diffFromOne.abs().toExponential(3)}
        </div>
        <div className="text-[11px] text-ink-softer italic">
          {diffFromOne.isNegative() ? 'Traveler runs slow' : 'Traveler runs fast'} — effect is minuscule but real.
        </div>
      </div>
    )
  }

  const gammaValue = ratio.gt(1) ? ratio : new Decimal(1).div(ratio)
  const isInverted = ratio.gt(1)

  return (
    <div className="paper-card bg-paper-light p-4 flex flex-col justify-center items-start gap-2 min-h-[140px]">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-ink-softer">
        Dilation Coefficient
      </div>
      <div className="font-display text-[44px] leading-none text-terracotta-dark">
        γ = {formatGamma(gammaValue)}
      </div>
      <div className="font-mono text-[11px] text-ink tabular-nums">
        τ<sub>trav</sub> / τ<sub>ref</sub> = {ratio.toPrecision(6)}
      </div>
      <div className="text-[11px] text-ink-softer italic">
        {isInverted ? 'Traveler ages faster than home' : '1 traveler second ≈ γ home seconds'}
      </div>
    </div>
  )
}
