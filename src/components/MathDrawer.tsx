import Decimal from 'decimal.js'
import type { DilationResult, ObserverState } from '../physics/types'
import type { EffectSplit } from '../physics/effects'
import { C, G } from '../physics/constants'
import { gravitationalFactor, lorentzFactor, schwarzschildRadius } from '../physics/relativity'
import { formatGamma, formatLength, formatMass, formatRatio, formatTime, formatVelocity } from '../format'

interface Props {
  result: DilationResult
  split: EffectSplit
  traveler: ObserverState
  reference: ObserverState
}

/** The real equations and every intermediate value, for anyone who wants receipts. */
export function MathDrawer({ result, split, traveler, reference }: Props) {
  const beta = new Decimal(traveler.velocity).abs().div(C)
  const mass = new Decimal(traveler.mass)
  const rs = mass.gt(0) ? schwarzschildRadius(mass) : null
  const homeMass = new Decimal(reference.mass)

  return (
    <details className="group border-2 border-ink/20 rounded-sm bg-paper-light/70">
      <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3">
        <span>
          <span className="block font-semibold text-ink">🧮 Show the math</span>
          <span className="block text-sm text-ink-softer">
            The actual equations, at 50-digit precision. Optional — for the curious.
          </span>
        </span>
        <span className="font-mono text-xl text-terracotta-dark group-open:rotate-45 transition-transform" aria-hidden>
          +
        </span>
      </summary>

      <div className="px-4 pb-4 border-t border-dashed border-ink/20 pt-4 space-y-5 text-ink-light">
        <Section title="Speed (special relativity)">
          <p className="text-sm">
            A moving clock ticks slower by the Lorentz factor γ. Below about 1% of light speed γ is so close to 1
            that ordinary computer arithmetic rounds it away — which is why this app uses 50-digit decimals.
          </p>
          <Formula>γ = 1 / √(1 − v²/c²)</Formula>
          <Grid>
            <Kv label="Your speed v" value={formatVelocity(traveler.velocity)} />
            <Kv label="v / c" value={beta.isZero() ? '0' : beta.toExponential(4)} />
            <Kv label="γ" value={formatGamma(lorentzFactor(traveler.velocity))} />
          </Grid>
        </Section>

        <Section title="Gravity (general relativity)">
          <p className="text-sm">
            A clock deeper in a gravity well ticks slower. r<sub>s</sub> is the Schwarzschild radius — the size of
            the black hole this mass would make.
          </p>
          <Formula>
            rate = √(1 − r<sub>s</sub>/r),  r<sub>s</sub> = 2GM/c²
          </Formula>
          <Grid>
            <Kv label="Mass M" value={formatMass(mass)} />
            <Kv label="r_s" value={rs ? formatLength(rs) : '—'} />
            <Kv label="Your distance from centre r" value={mass.gt(0) ? formatLength(traveler.radius) : '—'} />
            <Kv label="Your gravity factor" value={mass.gt(0) ? gravFactor(traveler) : '1'} />
            <Kv label="Home's gravity factor" value={homeMass.gt(0) ? gravFactor(reference) : '1'} />
          </Grid>
        </Section>

        <Section title="Both together">
          <Formula>
            τ<sub>you</sub> / τ<sub>home</sub> = √(1 − r<sub>s</sub>/r − v²/c²) ÷ √(1 − r<sub>s</sub>/r<sub>home</sub>)
          </Formula>
          <Grid>
            <Kv label="Ratio τ_you / τ_home" value={ratioText(result.ratio)} />
            <Kv label="Home clock" value={formatTime(result.referenceProperTime)} />
            <Kv label="Your clock" value={formatTime(result.travelerProperTime)} />
            <Kv label="Difference" value={signed(result.delta)} />
            <Kv label="…from speed" value={signed(split.speed)} />
            <Kv label="…from gravity" value={signed(split.gravity)} />
          </Grid>
          <p className="text-sm">
            Who counts as “home”: on Earth trips, someone standing still on the ground. Everywhere else, someone far
            from any mass. (Earth’s own gravity would shift those results by less than a billionth.) Speeds are taken
            as given — the bureau doesn’t check whether you’d actually stay in orbit, and it ignores the time spent
            speeding up and turning around.
          </p>
        </Section>

        <Section title="Constants">
          <Grid>
            <Kv label="Speed of light c" value={`${C.toString()} m/s`} />
            <Kv label="Gravitational constant G" value={`${G.toString()} m³·kg⁻¹·s⁻²`} />
          </Grid>
          <p className="text-sm">CODATA 2018 and IAU 2015 values.</p>
        </Section>
      </div>
    </details>
  )
}

function gravFactor(o: ObserverState): string {
  try {
    return gravitationalFactor(o.mass, o.radius).toPrecision(10)
  } catch {
    return '(inside the horizon)'
  }
}

/** Near-1 ratios as "1 − 2.846e-10" so the interesting digits stay visible. */
function ratioText(r: Decimal): string {
  const off = r.minus(1)
  if (!off.isZero() && off.abs().lt('1e-4')) {
    return `1 ${off.isNegative() ? '−' : '+'} ${off.abs().toExponential(4)}`
  }
  return formatRatio(r)
}

function signed(x: Decimal): string {
  return `${x.isNegative() ? '' : '+'}${formatTime(x)}`
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-lg text-terracotta-dark mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-y-2">{children}</div>
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[13px] text-ink bg-paper-dark/40 border border-ink/15 rounded-sm px-3 py-2 overflow-x-auto">
      {children}
    </div>
  )
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/15 pb-1">
      <span className="text-sm text-ink-softer">{label}</span>
      <span className="font-mono text-[13px] text-ink tabular-nums text-right [overflow-wrap:anywhere]">{value}</span>
    </div>
  )
}
