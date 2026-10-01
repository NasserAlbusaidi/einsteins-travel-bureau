import { useStore } from '../store'
import { evaluateTrip } from '../trip'
import { durationText } from '../humanize'

/** Compact verdict pinned to the bottom of the controls on small screens. */
export function MiniResult() {
  const trip = useStore((s) => s.trip)
  const out = evaluateTrip(trip)
  let text: string
  if (!out.ok) text = '⛔ Trip refused — see the boarding pass'
  else if (out.result.delta.isZero()) text = 'No difference at all'
  else
    text = `You come back ${durationText(out.result.delta)} ${out.result.delta.isNegative() ? 'younger' : 'older'}`

  return (
    <a
      href="#boarding-pass"
      className="lg:hidden sticky bottom-3 z-10 mx-auto flex items-center justify-between gap-3 rounded-sm bg-ink text-paper-light px-4 py-3 shadow-ticket"
    >
      <span className="font-semibold">{text}</span>
      <span className="text-sm text-paper-darker whitespace-nowrap">See pass ↑</span>
    </a>
  )
}
