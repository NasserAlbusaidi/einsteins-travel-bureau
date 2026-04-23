import { useState } from 'react'
import { SCENARIOS } from '../physics/scenarios'
import { getDestinationCopy, PALETTE_CLASSES, HAZARD_CLASSES } from '../copy/destinations'
import type { BrochureCopy } from '../copy/destinations'
import { useStore } from '../store'
import {
  addCustomBrochure,
  removeCustomBrochure,
  useCustomBrochures,
  type CustomBrochure,
} from '../customBrochures'
import { formatTime, formatVelocity, formatLength } from '../format'

export function DestinationPicker() {
  const scenarioId = useStore((s) => s.scenarioId)
  const setScenario = useStore((s) => s.setScenario)
  const travelerVelocity = useStore((s) => s.travelerVelocity)
  const travelerRadius = useStore((s) => s.travelerRadius)
  const travelerMass = useStore((s) => s.travelerMass)
  const referenceVelocity = useStore((s) => s.referenceVelocity)
  const referenceRadius = useStore((s) => s.referenceRadius)
  const referenceMass = useStore((s) => s.referenceMass)
  const duration = useStore((s) => s.duration)
  const customBrochures = useCustomBrochures()
  const [designing, setDesigning] = useState(false)

  const handleSaveBrochure = (draft: BrochureDraft) => {
    const entry = addCustomBrochure({
      name: draft.name,
      hazard: draft.hazard,
      palette: draft.palette,
      travelerVelocity: travelerVelocity.toString(),
      travelerRadius: travelerRadius.toString(),
      travelerMass: travelerMass.toString(),
      referenceVelocity: referenceVelocity.toString(),
      referenceRadius: referenceRadius.toString(),
      referenceMass: referenceMass.toString(),
      duration: duration.toString(),
    })
    setScenario(entry.id)
    setDesigning(false)
  }

  return (
    <section className="max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-3xl text-ink">Choose Your Destination</h2>
          <p className="text-sm text-ink-light mt-1">
            Each package is a verified physical scenario. Select one, then adjust your itinerary in the Booking Office below.
          </p>
        </div>
        <div className="hidden sm:flex gap-2 text-[10px] uppercase tracking-widest text-ink-softer">
          <span className="stamp-rect text-stamp-green border-stamp-green">Safe</span>
          <span className="stamp-rect text-mustard-dark border-mustard-dark">Caution</span>
          <span className="stamp-rect text-terracotta border-terracotta">Extreme</span>
          <span className="stamp-rect text-stamp-red border-stamp-red">Fatal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {SCENARIOS.map((s) => {
          const copy = getDestinationCopy(s.id)
          const palette = PALETTE_CLASSES[copy.palette]
          const selected = scenarioId === s.id
          return (
            <article
              key={s.id}
              data-selected={selected}
              onClick={() => setScenario(s.id)}
              className={`brochure-card paper-card ${palette.card} border-2 ${selected ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-paper' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setScenario(s.id)
                }
              }}
            >
              <div className={`flex items-center justify-between px-3 py-1.5 ${palette.band}`}>
                <span className="font-mono text-[10px] tracking-widest uppercase">
                  {copy.region}
                </span>
                <span
                  className={`border px-1.5 py-0.5 text-[9px] font-display tracking-widest ${HAZARD_CLASSES[copy.hazard]} bg-paper-light`}
                >
                  {copy.hazard}
                </span>
              </div>

              <div className="px-4 pt-4 pb-5">
                <h3 className={`font-display text-[22px] leading-tight ${palette.accent}`}>
                  {s.name.split(' (')[0]}
                </h3>
                <p className={`mt-1 text-xs italic ${palette.accent} opacity-80`}>
                  {copy.tagline}
                </p>
                <p className="mt-3 text-[13px] leading-snug text-ink-light">{copy.blurb}</p>
                {s.expected ? (
                  <div className="mt-3 pt-3 border-t border-dashed border-ink/25">
                    <div className="text-[10px] uppercase tracking-widest text-ink-softer">
                      Expected outcome
                    </div>
                    <div className="font-mono text-[11px] text-ink mt-0.5">{s.expected}</div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-t border-ink/20 bg-paper-light/50">
                <span className="font-display text-[10px] tracking-widest uppercase text-ink-softer">
                  {copy.sticker}
                </span>
                <span className={`font-display uppercase text-xs tracking-wider ${selected ? 'text-terracotta' : palette.accent}`}>
                  {selected ? '✓ Booked' : 'Book →'}
                </span>
              </div>
            </article>
          )
        })}

        {customBrochures.map((b) => (
          <CustomBrochureCard
            key={b.id}
            brochure={b}
            selected={scenarioId === b.id}
            onBook={() => setScenario(b.id)}
            onRemove={() => removeCustomBrochure(b.id)}
          />
        ))}

        <DesignYourOwnCard
          designing={designing}
          onOpen={() => setDesigning(true)}
          onCancel={() => setDesigning(false)}
          onSave={handleSaveBrochure}
          currentVelocity={travelerVelocity.toString()}
          currentRadius={travelerRadius.toString()}
          currentDuration={duration.toString()}
        />
      </div>
    </section>
  )
}

interface CustomBrochureCardProps {
  brochure: CustomBrochure
  selected: boolean
  onBook: () => void
  onRemove: () => void
}

function CustomBrochureCard({ brochure, selected, onBook, onRemove }: CustomBrochureCardProps) {
  const palette = PALETTE_CLASSES[brochure.palette]
  return (
    <article
      className={`brochure-card paper-card ${palette.card} border-2 ${selected ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-paper' : ''}`}
      onClick={onBook}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onBook()
        }
      }}
    >
      <div className={`flex items-center justify-between px-3 py-1.5 ${palette.band}`}>
        <span className="font-mono text-[10px] tracking-widest uppercase">
          Your Design
        </span>
        <span
          className={`border px-1.5 py-0.5 text-[9px] font-display tracking-widest ${HAZARD_CLASSES[brochure.hazard]} bg-paper-light`}
        >
          {brochure.hazard}
        </span>
      </div>
      <div className="px-4 pt-4 pb-3">
        <h3 className={`font-display text-[22px] leading-tight ${palette.accent}`}>
          {brochure.name}
        </h3>
        <p className={`mt-1 text-xs italic ${palette.accent} opacity-80`}>
          Bespoke — saved to your wall
        </p>
        <dl className="mt-3 pt-3 border-t border-dashed border-ink/25 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] font-mono tabular-nums">
          <dt className="text-ink-softer">v</dt>
          <dd className="text-ink">{formatVelocity(brochure.travelerVelocity)}</dd>
          <dt className="text-ink-softer">r</dt>
          <dd className="text-ink">{formatLength(brochure.travelerRadius)}</dd>
          <dt className="text-ink-softer">T</dt>
          <dd className="text-ink">{formatTime(brochure.duration)}</dd>
        </dl>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-ink/20 bg-paper-light/50">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="font-display text-[10px] tracking-widest uppercase text-ink-softer hover:text-terracotta-dark transition-colors"
        >
          Rescind
        </button>
        <span className={`font-display uppercase text-xs tracking-wider ${selected ? 'text-terracotta' : palette.accent}`}>
          {selected ? '✓ Booked' : 'Book →'}
        </span>
      </div>
    </article>
  )
}

interface BrochureDraft {
  name: string
  hazard: BrochureCopy['hazard']
  palette: BrochureCopy['palette']
}

interface DesignYourOwnCardProps {
  designing: boolean
  onOpen: () => void
  onCancel: () => void
  onSave: (draft: BrochureDraft) => void
  currentVelocity: string
  currentRadius: string
  currentDuration: string
}

function DesignYourOwnCard({
  designing,
  onOpen,
  onCancel,
  onSave,
  currentVelocity,
  currentRadius,
  currentDuration,
}: DesignYourOwnCardProps) {
  const [name, setName] = useState('')
  const [hazard, setHazard] = useState<BrochureCopy['hazard']>('CAUTION')
  const [palette, setPalette] = useState<BrochureCopy['palette']>('dusk')

  if (!designing) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="paper-card border-2 border-dashed border-ink/30 bg-paper-light/40 hover:border-ink hover:bg-paper-light transition-colors min-h-[280px] flex flex-col items-center justify-center gap-2 p-6 text-ink-softer hover:text-ink group"
      >
        <span className="text-5xl leading-none font-display">✎</span>
        <span className="font-display uppercase tracking-widest text-sm">
          Design Your Own
        </span>
        <span className="text-[11px] italic text-center max-w-[180px] leading-snug">
          Configure the bureau below, then save your itinerary as a reusable brochure.
        </span>
      </button>
    )
  }

  const canSave = name.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave({ name: name.trim(), hazard, palette })
    setName('')
    setHazard('CAUTION')
    setPalette('dusk')
  }

  const paletteOptions: BrochureCopy['palette'][] = ['sky', 'sun', 'dusk', 'void', 'ember']
  const hazardOptions: BrochureCopy['hazard'][] = ['SAFE', 'CAUTION', 'EXTREME', 'FATAL']

  const chosenPalette = PALETTE_CLASSES[palette]

  return (
    <form
      onSubmit={handleSubmit}
      className={`paper-card border-2 ${chosenPalette.card} p-4 flex flex-col gap-3 min-h-[280px]`}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-softer">
        New Brochure · capturing current settings
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Expedition name"
        className="w-full rounded-sm border-2 border-ink/30 bg-paper-light px-3 py-2 font-display text-lg text-ink focus:border-terracotta focus:outline-none"
        autoFocus
      />
      <label className="flex flex-col gap-1">
        <span className="font-display text-[10px] uppercase tracking-widest text-ink-softer">
          Hazard Level
        </span>
        <select
          value={hazard}
          onChange={(e) => setHazard(e.target.value as BrochureCopy['hazard'])}
          className="rounded-sm border-2 border-ink/30 bg-paper-light px-2 py-1.5 text-sm text-ink focus:border-terracotta focus:outline-none"
        >
          {hazardOptions.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col gap-1">
        <span className="font-display text-[10px] uppercase tracking-widest text-ink-softer">
          Palette
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {paletteOptions.map((p) => {
            const cls = PALETTE_CLASSES[p]
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPalette(p)}
                className={`px-2 py-1 text-[10px] font-display uppercase tracking-widest ${cls.card} border-2 ${palette === p ? 'border-ink' : 'border-ink/20'} transition-colors`}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>
      <div className="text-[10px] font-mono text-ink-softer tabular-nums border-t border-dashed border-ink/25 pt-2">
        v={formatVelocity(currentVelocity)} · r={formatLength(currentRadius)} · T={formatTime(currentDuration)}
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          type="submit"
          disabled={!canSave}
          className={`stamp-rect flex-1 text-center ${canSave ? 'text-terracotta-dark border-terracotta bg-paper-light hover:bg-paper-dark/30' : 'text-ink-softer border-ink/20 bg-paper-light cursor-not-allowed opacity-60'} transition-colors`}
        >
          Issue Ticket
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="stamp-rect text-ink-softer border-ink/30 bg-paper-light hover:text-ink hover:border-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
