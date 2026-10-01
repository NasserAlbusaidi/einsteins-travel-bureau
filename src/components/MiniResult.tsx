import { useStore } from '../store'
import { evaluateTrip } from '../trip'
import { durationText } from '../humanize'

/** Compact verdict pinned to the bottom of the screen while you drag sliders on a phone. */
export function MiniResult() {
  const trip = useStore((s) => s.trip)
  const out = evaluateTrip(trip)
  let text: React.ReactNode
  if (!out.ok) text = <span className="text-alarm">Trip refused</span>
  else if (out.result.delta.isZero()) text = 'No difference at all'
  else {
    const younger = out.result.delta.isNegative()
    text = (
      <>
        You come back{' '}
        <span className={younger ? 'text-you-300' : 'text-home-300'}>
          {durationText(out.result.delta)} {younger ? 'younger' : 'older'}
        </span>
      </>
    )
  }

  return (
    <a
      href="#boarding-pass"
      className="lg:hidden sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-2xl bg-night-950/90 backdrop-blur text-cream px-4 py-3 ring-1 ring-gold/40 shadow-panel"
    >
      <span className="font-semibold leading-snug">{text}</span>
      <span className="text-xs font-mono uppercase tracking-[0.2em] text-gold-300 whitespace-nowrap">Pass ↓</span>
    </a>
  )
}
