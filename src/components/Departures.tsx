import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { evaluateTrip, getPresetTrip, type Trip } from '../trip'
import { BOARD_ORDER, STATUS_TONE, getDestinationCopy } from '../copy/destinations'
import { boardDuration } from '../humanize'
import { C, JULIAN_YEAR_SECONDS } from '../physics/constants'
import { DEEP_SPACE_RADIUS } from '../physics/bodies'
import { useInView } from '../hooks/motion'
import { SplitFlap } from './SplitFlap'
import { Icon } from './art/Icons'

const BLANK_TRIP: Trip = {
  speed: C.times('0.5'),
  place: 'none',
  radius: DEEP_SPACE_RADIUS,
  duration: JULIAN_YEAR_SECONDS,
}

const W = { flight: 7, dest: 15, away: 9, back: 13, dir: 7, status: 10 }

interface Row {
  id: string
  flight: string
  dest: string
  away: string
  back: string
  dir: string
  status: string
  statusTone: string
  younger: boolean
}

const ROWS: readonly Row[] = BOARD_ORDER.map((id) => {
  const copy = getDestinationCopy(id)
  const trip = getPresetTrip(id)!
  const out = evaluateTrip(trip)
  const delta = out.ok ? out.result.delta : null
  return {
    id,
    flight: copy.flight,
    dest: copy.board,
    away: boardDuration(trip.duration),
    back: delta ? boardDuration(delta) : '',
    dir: delta && !delta.isZero() ? (delta.isNegative() ? 'YOUNGER' : 'OLDER') : '',
    status: copy.status,
    statusTone: STATUS_TONE[copy.status],
    younger: delta?.isNegative() ?? false,
  }
})

/** The trip picker, as an airport departures board. Tap a row to board. */
export function Departures() {
  const presetId = useStore((s) => s.presetId)
  const choosePreset = useStore((s) => s.choosePreset)
  const loadTrip = useStore((s) => s.loadTrip)
  const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px')

  const go = () => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div ref={ref} className="rounded-[22px] bg-[#05070f] p-3 sm:p-5 shadow-panel ring-1 ring-gold/25">
      <div className="flex items-center justify-between gap-4 px-2 pb-4 pt-1 border-b border-gold/15">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-full bg-gold text-night-900">
            <Icon name="rocket" size={22} strokeWidth={1.8} />
          </span>
          <div>
            <div className="font-display italic text-2xl sm:text-3xl text-cream leading-none">Departures</div>
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-mist-400 mt-1">
              Terminal 1905 · All gates
            </div>
          </div>
        </div>
        <LocalClock />
      </div>

      {/* Column heads, wide screens only. */}
      <div
        className="hidden md:grid board-grid px-3 pt-4 pb-2 text-[12px] xl:text-[14px] font-mono uppercase tracking-[0.15em] text-gold/80"
        aria-hidden
      >
        <span className="hidden lg:block text-[10px] xl:text-[11px]">Flight</span>
        <span className="text-[10px] xl:text-[11px]">Destination</span>
        <span className="hidden lg:block text-[10px] xl:text-[11px]">Away for</span>
        <span className="text-[10px] xl:text-[11px] col-span-2">You come back</span>
        <span className="text-[10px] xl:text-[11px]">Status</span>
      </div>

      <ul className="flex flex-col gap-1 mt-3 md:mt-0" aria-label="Trips">
        {ROWS.map((row, i) => {
          const active = row.id === presetId
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => {
                  choosePreset(row.id)
                  go()
                }}
                aria-pressed={active}
                aria-label={`${getDestinationCopy(row.id).title}: away ${row.away.toLowerCase()}, you come back ${row.back.toLowerCase()} ${row.dir.toLowerCase()}. Book this trip.`}
                className={`group relative w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                  active ? 'bg-gold/[0.12] ring-1 ring-inset ring-gold/60' : 'hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity ${active ? 'bg-gold opacity-100' : 'bg-gold opacity-0 group-hover:opacity-60'}`}
                  aria-hidden
                />
                {/* Phones: two lines. */}
                <span className="md:hidden flex flex-col gap-1 text-[12px] min-[400px]:text-[13px]" aria-hidden>
                  <span className="flex items-center justify-between gap-2">
                    <SplitFlap text={row.dest} length={W.dest} active={seen} stagger={i * 2} />
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.statusTone }} />
                  </span>
                  <span className="flex gap-[0.6em]">
                    <SplitFlap text={row.back} length={W.back} active={seen} stagger={i * 2 + 6} />
                    <SplitFlap text={row.dir} length={W.dir} active={seen} stagger={i * 2 + 8} tone={row.younger ? '#ffa384' : '#8be6dc'} />
                  </span>
                </span>
                {/* Tablets and up: one line, real columns. */}
                <span className="hidden md:grid board-grid items-center text-[12px] xl:text-[14px]" aria-hidden>
                  <SplitFlap className="hidden lg:inline-flex" text={row.flight} length={W.flight} active={seen} stagger={i * 2} tone="#e3b04b" />
                  <SplitFlap text={row.dest} length={W.dest} active={seen} stagger={i * 2 + 2} />
                  <SplitFlap className="hidden lg:inline-flex" text={row.away} length={W.away} active={seen} stagger={i * 2 + 5} />
                  <SplitFlap text={row.back} length={W.back} active={seen} stagger={i * 2 + 7} />
                  <SplitFlap text={row.dir} length={W.dir} active={seen} stagger={i * 2 + 9} tone={row.younger ? '#ffa384' : '#8be6dc'} />
                  <SplitFlap text={row.status} length={W.status} active={seen} stagger={i * 2 + 11} tone={row.statusTone} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-gold/15 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-mist-400">
          <span className="text-mist-200">Tap a flight to board it.</span> “You come back” is how much younger (or
          older) than everyone at home.
        </p>
        <button
          type="button"
          onClick={() => {
            loadTrip(BLANK_TRIP)
            go()
          }}
          className="btn-ghost !py-2 !px-4 text-sm shrink-0"
        >
          <Icon name="compass" size={18} /> Build your own trip
        </button>
      </div>
    </div>
  )
}

function LocalClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="text-right">
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-mist-500">Local time</div>
      <div className="font-mono text-lg sm:text-xl text-gold-300 tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
    </div>
  )
}
