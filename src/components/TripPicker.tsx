import { useStore } from '../store'
import { PRESET_IDS, getPresetTrip, evaluateTrip, type Trip } from '../trip'
import { getDestinationCopy, HAZARD_CLASSES, PALETTE_CLASSES } from '../copy/destinations'
import { durationText } from '../humanize'
import { C, JULIAN_YEAR_SECONDS } from '../physics/constants'

const BLANK_TRIP: Trip = {
  speed: C.times('0.5'),
  place: 'none',
  radius: getPresetTrip('hail-mary')!.radius,
  duration: JULIAN_YEAR_SECONDS,
}

/** Brochure rack: the curated trips plus a build-your-own card. */
export function TripPicker() {
  const presetId = useStore((s) => s.presetId)
  const choosePreset = useStore((s) => s.choosePreset)
  const loadTrip = useStore((s) => s.loadTrip)

  const go = (target: string) =>
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PRESET_IDS.map((id) => {
        const copy = getDestinationCopy(id)
        const palette = PALETTE_CLASSES[copy.palette]
        const active = id === presetId
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              choosePreset(id)
              go('boarding-pass')
            }}
            aria-pressed={active}
            className={`brochure-card text-left paper-card flex flex-col ${active ? 'ring-4 ring-terracotta/60' : ''}`}
          >
            <div className={`${palette.band} px-4 py-2 flex items-center justify-between gap-2`}>
              <span className="font-mono text-[11px] uppercase tracking-wider leading-tight">{copy.package}</span>
              <span
                className={`shrink-0 border px-1.5 text-[9px] font-display tracking-widest bg-paper-light ${HAZARD_CLASSES[copy.hazard]}`}
              >
                {copy.hazard}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl leading-none" aria-hidden>
                  {copy.emoji}
                </span>
                <h3 className={`font-display text-2xl leading-tight ${palette.accent}`}>{copy.title}</h3>
              </div>
              <p className="text-ink-light text-[15px] flex-1">{copy.pitch}</p>
              <p className="text-[15px] font-semibold text-ink border-t border-dashed border-ink/20 pt-2">
                {teaser(getPresetTrip(id)!)}
              </p>
              <span className={`text-sm font-semibold ${active ? 'text-terracotta-dark' : 'text-ink-softer'}`}>
                {active ? '✓ Booked — see your boarding pass' : 'Book this trip →'}
              </span>
            </div>
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => {
          loadTrip(BLANK_TRIP)
          go('adjust')
        }}
        aria-pressed={presetId === null}
        className={`brochure-card text-left rounded-sm border-2 border-dashed border-ink/30 bg-paper-light/40 p-5 flex flex-col items-center justify-center gap-2 text-center ${presetId === null ? 'ring-4 ring-terracotta/60' : ''}`}
      >
        <span className="text-4xl" aria-hidden>
          🧭
        </span>
        <span className="font-display text-2xl text-ink">Build your own</span>
        <span className="text-ink-light text-[15px]">
          Pick a speed, a place and a length of time. We’ll tell you what happens to your clock.
        </span>
      </button>
    </div>
  )
}

function teaser(trip: Trip): string {
  const out = evaluateTrip(trip)
  if (!out.ok) return ''
  const d = out.result.delta
  if (d.isZero()) return 'No change'
  return `Come back ${durationText(d)} ${d.isNegative() ? 'younger' : 'older'}`
}
