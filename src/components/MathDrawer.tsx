import { useState } from 'react'
import Decimal from 'decimal.js'
import type { DilationResult, ObserverState } from '../physics/types'
import { C, G } from '../physics/constants'
import { schwarzschildRadius, gravitationalFactor } from '../physics/relativity'
import { formatVelocity, formatLength, formatMass, formatGamma, formatRatio } from '../format'

interface Props {
  result: DilationResult
  traveler: ObserverState
  reference: ObserverState
  duration: Decimal
}

/**
 * Collapsible panel that exposes the actual equations used. For the curious
 * tourist — the travel agency still has to show its work.
 */
export function MathDrawer({ result, traveler, reference, duration }: Props) {
  const [open, setOpen] = useState(false)

  const beta = new Decimal(traveler.velocity).abs().div(C)
  const refBeta = new Decimal(reference.velocity).abs().div(C)
  const srGammaTrav = beta.lt(1) ? new Decimal(1).div(new Decimal(1).minus(beta.pow(2)).sqrt()) : null
  const srGammaRef = refBeta.lt(1) ? new Decimal(1).div(new Decimal(1).minus(refBeta.pow(2)).sqrt()) : null

  const mass = new Decimal(traveler.mass)
  const rs = mass.gt(0) ? schwarzschildRadius(mass) : null
  const grTrav = mass.gt(0)
    ? safeGravitational(traveler)
    : null
  const grRef = mass.gt(0)
    ? safeGravitational(reference)
    : null

  return (
    <div className="border-2 border-ink/20 rounded-sm bg-paper-light/70 ">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <div className="font-display text-sm tracking-widest uppercase text-ink">
            How the Trip Was Calculated
          </div>
          <div className="text-[11px] text-ink-softer italic mt-0.5">
            Real formulas. Decimal.js at 50-digit precision. Show your work.
          </div>
        </div>
        <span className="font-mono text-lg text-terracotta-dark">{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="px-4 pb-4 border-t border-dashed border-ink/20 pt-4 space-y-5 text-sm text-ink-light">
          <Section title="Special Relativity (velocity term)">
            <Formula>
              γ = 1 / √(1 − β²),  β = v / c
            </Formula>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Kv label="Traveler v" value={formatVelocity(traveler.velocity)} />
              <Kv label="Traveler β" value={beta.toExponential(4)} />
              <Kv label="γ (traveler, SR only)" value={srGammaTrav ? formatGamma(srGammaTrav) : '—'} />
              <Kv label="Reference β" value={refBeta.toExponential(4)} />
              <Kv label="γ (reference, SR only)" value={srGammaRef ? formatGamma(srGammaRef) : '—'} />
            </div>
          </Section>

          <Section title="General Relativity (gravity term)">
            <Formula>
              dτ/dt = √(1 − r<sub>s</sub>/r),  r<sub>s</sub> = 2GM/c²
            </Formula>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Kv label="Mass of body" value={formatMass(mass)} />
              <Kv label="Schwarzschild radius r_s" value={rs ? formatLength(rs) : '—'} />
              <Kv label="Traveler altitude r" value={formatLength(traveler.radius)} />
              <Kv label="GR factor (traveler)" value={grTrav ?? '—'} />
              <Kv label="Reference altitude r" value={formatLength(reference.radius)} />
              <Kv label="GR factor (reference)" value={grRef ?? '—'} />
            </div>
          </Section>

          <Section title="Combined — what the bureau actually sold you">
            <Formula>
              τ<sub>trav</sub> / τ<sub>ref</sub> = [√(1 − β<sub>trav</sub>²) · √(1 − r<sub>s</sub>/r<sub>trav</sub>)] ÷ [√(1 − β<sub>ref</sub>²) · √(1 − r<sub>s</sub>/r<sub>ref</sub>)]
            </Formula>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Kv label="Ratio τ_trav / τ_ref" value={formatRatio(result.ratio)} />
              <Kv label="Dominant effect" value={result.dominantEffect} />
              <Kv label="Duration (ref. time)" value={duration.toPrecision(6) + ' s'} />
              <Kv
                label="Delta (trav − ref)"
                value={`${result.delta.isNegative() ? '−' : '+'}${result.delta.abs().toPrecision(6)} s`}
              />
            </div>
          </Section>

          <Section title="Constants (CODATA 2018)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Kv label="Speed of light c" value={`${C.toString()} m/s`} />
              <Kv label="Gravitational constant G" value={`${G.toString()} m³·kg⁻¹·s⁻²`} />
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-sm text-terracotta-dark uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[13px] text-ink bg-paper-dark/40 border border-ink/15 rounded-sm px-3 py-2">
      {children}
    </div>
  )
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/15 pb-1">
      <span className="text-[11px] uppercase tracking-wider text-ink-softer">{label}</span>
      <span className="font-mono text-[12px] text-ink tabular-nums text-right">{value}</span>
    </div>
  )
}

function safeGravitational(o: ObserverState): string {
  try {
    return gravitationalFactor(o.mass, o.radius).toPrecision(8)
  } catch {
    return '(below horizon)'
  }
}
