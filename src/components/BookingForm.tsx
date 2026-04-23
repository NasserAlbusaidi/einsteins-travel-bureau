import Decimal from 'decimal.js'
import { useStore } from '../store'
import { getScenario } from '../physics/scenarios'
import { getDestinationCopy, PALETTE_CLASSES, HAZARD_CLASSES } from '../copy/destinations'
import { C } from '../physics/constants'
import { formatVelocity, formatLength, formatMass, formatTime } from '../format'
import { LogSlider } from './LogSlider'

const VELOCITY_MIN = new Decimal('1e-3')
const VELOCITY_MAX = C.times('0.9999')
const RADIUS_MIN = new Decimal('1e-3')
const RADIUS_MAX = new Decimal('1e25')
const MASS_MIN = new Decimal('1')
const MASS_MAX = new Decimal('1e40')
const DURATION_MIN = new Decimal('1')
const DURATION_MAX = new Decimal('1e12')

export function BookingForm() {
  const scenarioId = useStore((s) => s.scenarioId)
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

  const isPreset = scenarioId !== 'custom' && !scenarioId.startsWith('custom-')
  const scenario = (() => {
    if (!isPreset) return null
    try {
      return getScenario(scenarioId)
    } catch {
      return null
    }
  })()
  const isCustom = !scenario
  const copy = scenario ? getDestinationCopy(scenarioId) : null
  const palette = copy ? PALETTE_CLASSES[copy.palette] : null

  return (
    <section className="paper-card p-6">
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-softer">
            Section II — Booking Office
          </div>
          <h2 className="font-display text-3xl text-ink mt-0.5">
            {scenario ? `Itinerary: ${scenario.name.split(' (')[0]}` : 'Custom Itinerary'}
          </h2>
          {copy ? (
            <div className="flex items-center gap-2 mt-1 text-xs text-ink-light italic">
              <span>{copy.tagline}</span>
              <span className="text-ink-softer">·</span>
              <span>{copy.region}</span>
              <span
                className={`border px-1.5 py-0.5 text-[9px] font-display tracking-widest ${HAZARD_CLASSES[copy.hazard]} bg-paper-light/70 not-italic`}
              >
                {copy.hazard}
              </span>
            </div>
          ) : (
            <p className="text-xs text-ink-light italic mt-1">Adjusted parameters — pick a preset to restore a published package.</p>
          )}
        </div>
        {isCustom ? (
          <div className="stamp-rect text-terracotta-dark border-terracotta-dark bg-paper-light">
            Off-Menu Itinerary
          </div>
        ) : null}
      </div>

      {scenario ? (
        <div className={`rounded-sm ${palette?.card ?? 'bg-paper-dark/40'} border-2 border-ink/20 p-4 mb-5`}>
          <p className="text-[13px] leading-relaxed text-ink-light">{scenario.description}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FieldBox
          label="Ship Parameters"
          sublabel="Your vessel's motion & altitude"
          accent="terracotta"
        >
          <LogSlider
            label="Cruise speed"
            value={travelerVelocity}
            onChange={setTravelerVelocity}
            min={VELOCITY_MIN}
            max={VELOCITY_MAX}
            format={formatVelocity}
            secondary={(v) => `β = v/c = ${v.div(C).toExponential(3)}`}
          />
          <LogSlider
            label="Orbital / gravitational altitude (r)"
            value={travelerRadius}
            onChange={setTravelerRadius}
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            format={formatLength}
          />
        </FieldBox>

        <FieldBox
          label="Home Observer"
          sublabel="Whoever stays behind to compare watches"
          accent="blue"
        >
          <LogSlider
            label="Local speed"
            value={referenceVelocity}
            onChange={setReferenceVelocity}
            min={VELOCITY_MIN}
            max={VELOCITY_MAX}
            format={formatVelocity}
            secondary={(v) => `β = ${v.div(C).toExponential(3)}`}
          />
          <LogSlider
            label="Local altitude (r)"
            value={referenceRadius}
            onChange={setReferenceRadius}
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            format={formatLength}
          />
        </FieldBox>

        <FieldBox
          label="Gravity Well"
          sublabel="The mass both observers are near"
          accent="olive"
        >
          <LogSlider
            label="Mass of body"
            value={travelerMass.gt(0) ? travelerMass : MASS_MIN}
            onChange={setSharedMass}
            min={MASS_MIN}
            max={MASS_MAX}
            format={formatMass}
          />
        </FieldBox>

        <FieldBox
          label="Trip Duration"
          sublabel="Measured in the home observer's clock"
          accent="mustard"
        >
          <LogSlider
            label="Elapsed reference time"
            value={duration}
            onChange={setDuration}
            min={DURATION_MIN}
            max={DURATION_MAX}
            format={formatTime}
          />
        </FieldBox>
      </div>
    </section>
  )
}

interface FieldBoxProps {
  label: string
  sublabel: string
  accent: 'terracotta' | 'blue' | 'olive' | 'mustard'
  children: React.ReactNode
}

const ACCENT_BORDER: Record<FieldBoxProps['accent'], string> = {
  terracotta: 'border-terracotta/40',
  blue: 'border-stamp-blue/40',
  olive: 'border-olive/40',
  mustard: 'border-mustard-dark/40',
}

const ACCENT_TEXT: Record<FieldBoxProps['accent'], string> = {
  terracotta: 'text-terracotta-dark',
  blue: 'text-stamp-blue',
  olive: 'text-olive-dark',
  mustard: 'text-mustard-dark',
}

function FieldBox({ label, sublabel, accent, children }: FieldBoxProps) {
  return (
    <div
      className={`relative bg-paper-light/60 border-2 ${ACCENT_BORDER[accent]} rounded-sm p-4 pt-5 flex flex-col gap-5`}
    >
      <div
        className={`absolute -top-2.5 left-4 px-2 bg-paper-light font-display uppercase tracking-widest text-[11px] ${ACCENT_TEXT[accent]}`}
      >
        {label}
      </div>
      <div className="text-[11px] italic text-ink-softer -mt-1">{sublabel}</div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}
