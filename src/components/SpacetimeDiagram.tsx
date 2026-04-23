import { useRef, useState } from 'react'
import Decimal from 'decimal.js'
import { C } from '../physics/constants'
import type { Scalar } from '../physics/types'
import type { Trajectory } from '../physics/scenarios'

type ExaggerationMode = 'auto' | 'on' | 'off'

interface Props {
  travelerVelocity: Scalar
  trajectory?: Trajectory
  /** When provided, the traveler endpoint becomes a draggable handle. */
  onVelocityChange?: (velocity: Decimal) => void
}

const VIEW = { width: 400, height: 280 }
const ORIGIN = { x: 200, y: 240 }
const SCALE = 170

const MIN_BETA = 1e-6
const MAX_BETA = 0.9999

const svgX = (xNorm: number): number => ORIGIN.x + xNorm * SCALE
const svgY = (tNorm: number): number => ORIGIN.y - tNorm * SCALE

// Travel-bureau palette mapped onto the diagram.
const COLORS = {
  paper: '#f8f0dc',
  grid: '#c9b584',
  rule: '#1a2332',
  light: '#6c7a8f',
  reference: '#2c4c7c', // stamp-blue
  traveler: '#b5482d', // terracotta
  simultaneity: '#6b7043', // olive
  simultaneity2: '#8a8f5c',
  point: '#1a2332',
  text: '#425066',
}

export function SpacetimeDiagram({ travelerVelocity, trajectory: trajProp, onVelocityChange }: Props) {
  const beta = new Decimal(travelerVelocity).abs().div(C).toNumber()
  const trajectory = trajProp ?? { kind: 'linear' }
  const [mode, setMode] = useState<ExaggerationMode>('auto')
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const exaggerated =
    mode === 'on' || (mode === 'auto' && beta > 0 && beta < 0.05)

  const xScale = exaggerated && beta > 0 ? 0.5 / beta : 1

  const handleX = trajectory.kind === 'round-trip' ? beta * trajectory.turnaroundFraction : beta
  const handleT = trajectory.kind === 'round-trip' ? trajectory.turnaroundFraction : 1

  const travelerPoints = (() => {
    if (trajectory.kind === 'round-trip') {
      const turnT = trajectory.turnaroundFraction
      const turnX = beta * turnT
      return [
        [0, 0],
        [turnX, turnT],
        [0, 1],
      ] as const
    }
    return [
      [0, 0],
      [beta, 1],
    ] as const
  })()

  const pathD = travelerPoints
    .map(([x, t], i) => `${i === 0 ? 'M' : 'L'} ${svgX(x * xScale)} ${svgY(t)}`)
    .join(' ')

  const simultaneityLines =
    trajectory.kind === 'round-trip' && !exaggerated
      ? buildSimultaneityLines(beta, trajectory.turnaroundFraction)
      : []

  const pointerToBeta = (e: React.PointerEvent): number | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const viewX = ((e.clientX - rect.left) / rect.width) * VIEW.width
    const xNorm = (viewX - ORIGIN.x) / SCALE
    const turnT = trajectory.kind === 'round-trip' ? trajectory.turnaroundFraction : 1
    const rawBeta = xNorm / (xScale * turnT)
    const clamped = Math.max(MIN_BETA, Math.min(MAX_BETA, Math.abs(rawBeta)))
    return clamped
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onVelocityChange) return
    e.preventDefault()
    try {
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    } catch {
      // Synthetic/programmatic pointers may not be capturable — not fatal.
    }
    setDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !onVelocityChange) return
    const newBeta = pointerToBeta(e)
    if (newBeta === null) return
    onVelocityChange(new Decimal(newBeta).times(C))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return
    try {
      ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
    } catch {
      // See setPointerCapture — release may fail for the same reason.
    }
    setDragging(false)
  }

  return (
    <div className="paper-card bg-paper-light p-4">
      <div className="flex items-start justify-between mb-3 gap-4">
        <div>
          <div className="font-display text-sm uppercase tracking-widest text-ink">
            Worldlines · Home Frame
          </div>
          <div className="text-[10px] text-ink-softer font-mono tabular-nums">
            β = {beta.toExponential(3)}
            {exaggerated ? (
              <span className="text-terracotta-dark ml-2">x-axis ×{xScale.toPrecision(3)}</span>
            ) : null}
          </div>
        </div>
        <ExaggerationToggle mode={mode} onChange={setMode} />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Spacetime diagram showing traveler and home worldlines"
        style={{ background: COLORS.paper, touchAction: onVelocityChange ? 'none' : 'auto' }}
      >
        <defs>
          <pattern id="grid" width="17" height="17" patternUnits="userSpaceOnUse">
            <path d="M 17 0 L 0 0 0 17" fill="none" stroke={COLORS.grid} strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width={VIEW.width} height={VIEW.height} fill="url(#grid)" />

        {/* Light cones — 45° */}
        <line
          x1={svgX(0)}
          y1={svgY(0)}
          x2={svgX(1)}
          y2={svgY(1)}
          stroke={COLORS.light}
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <line
          x1={svgX(0)}
          y1={svgY(0)}
          x2={svgX(-1)}
          y2={svgY(1)}
          stroke={COLORS.light}
          strokeDasharray="3 3"
          strokeWidth={1}
        />

        {simultaneityLines.map((ln, i) => (
          <line
            key={i}
            x1={svgX(ln.x1 * xScale)}
            y1={svgY(ln.y1)}
            x2={svgX(ln.x2 * xScale)}
            y2={svgY(ln.y2)}
            stroke={ln.color}
            strokeDasharray="2 3"
            strokeWidth={1}
            opacity={0.8}
          />
        ))}

        {/* Axes */}
        <line x1={svgX(-1)} y1={svgY(0)} x2={svgX(1)} y2={svgY(0)} stroke={COLORS.rule} strokeWidth={1} />
        <line x1={svgX(0)} y1={svgY(0)} x2={svgX(0)} y2={svgY(1)} stroke={COLORS.rule} strokeWidth={1} />

        {/* Home observer worldline */}
        <line x1={svgX(0)} y1={svgY(0)} x2={svgX(0)} y2={svgY(1)} stroke={COLORS.reference} strokeWidth={2.5} />

        {/* Traveler worldline */}
        <path d={pathD} fill="none" stroke={COLORS.traveler} strokeWidth={2.5} />

        {/* Events */}
        <circle cx={svgX(0)} cy={svgY(0)} r={3.5} fill={COLORS.point} />

        {/* Traveler handle (draggable when onVelocityChange provided) */}
        <g
          style={{ cursor: onVelocityChange ? (dragging ? 'grabbing' : 'ew-resize') : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {onVelocityChange ? (
            <circle
              cx={svgX(handleX * xScale)}
              cy={svgY(handleT)}
              r={dragging ? 11 : 9}
              fill={COLORS.traveler}
              opacity={dragging ? 0.22 : 0.14}
            />
          ) : null}
          <circle
            cx={svgX(handleX * xScale)}
            cy={svgY(handleT)}
            r={onVelocityChange ? 5 : 3.5}
            fill={COLORS.traveler}
            stroke={onVelocityChange ? COLORS.paper : 'none'}
            strokeWidth={onVelocityChange ? 1.5 : 0}
          />
          {onVelocityChange ? (
            <circle
              cx={svgX(handleX * xScale)}
              cy={svgY(handleT)}
              r={16}
              fill="transparent"
            />
          ) : null}
        </g>

        {trajectory.kind === 'round-trip' ? (
          <text
            x={svgX(handleX * xScale) + 10}
            y={svgY(handleT) + 4}
            fontSize={10}
            fill={COLORS.traveler}
            fontFamily="'Space Grotesk', sans-serif"
          >
            turnaround
          </text>
        ) : null}

        {onVelocityChange && !dragging ? (
          <text
            x={svgX(handleX * xScale) + 12}
            y={svgY(handleT) - 10}
            fontSize={9}
            fill={COLORS.traveler}
            fontFamily="'DM Serif Display', serif"
            letterSpacing="1.5"
            opacity={0.8}
          >
            DRAG ←→
          </text>
        ) : null}

        <text x={svgX(-1) + 4} y={svgY(0) + 14} fontSize={10} fill={COLORS.text} fontFamily="'JetBrains Mono', monospace">
          −ct
        </text>
        <text x={svgX(1) - 22} y={svgY(0) + 14} fontSize={10} fill={COLORS.text} fontFamily="'JetBrains Mono', monospace">
          +ct
        </text>
        <text x={svgX(0) + 4} y={svgY(1) + 4} fontSize={10} fill={COLORS.text} fontFamily="'JetBrains Mono', monospace">
          t = T
        </text>

        <g transform="translate(12, 14)">
          <line x1={0} y1={0} x2={18} y2={0} stroke={COLORS.reference} strokeWidth={2.5} />
          <text x={22} y={4} fontSize={10} fill={COLORS.text} fontFamily="'Space Grotesk', sans-serif">
            home
          </text>
          <line x1={80} y1={0} x2={98} y2={0} stroke={COLORS.traveler} strokeWidth={2.5} />
          <text x={102} y={4} fontSize={10} fill={COLORS.text} fontFamily="'Space Grotesk', sans-serif">
            traveler
          </text>
          {simultaneityLines.length > 0 ? (
            <>
              <line
                x1={176}
                y1={0}
                x2={194}
                y2={0}
                stroke={COLORS.simultaneity}
                strokeDasharray="2 3"
                strokeWidth={1}
              />
              <text x={198} y={4} fontSize={10} fill={COLORS.text} fontFamily="'Space Grotesk', sans-serif">
                "now"
              </text>
            </>
          ) : null}
        </g>
      </svg>

      {simultaneityLines.length > 0 ? (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-light italic">
          The olive dashes are the traveler's lines of "now" in home's frame. Notice the jump at turnaround — that's the time back home the traveler never witnesses, and exactly why they come back younger.
        </p>
      ) : null}
    </div>
  )
}

interface ToggleProps {
  mode: ExaggerationMode
  onChange: (mode: ExaggerationMode) => void
}

function ExaggerationToggle({ mode, onChange }: ToggleProps) {
  const options: ExaggerationMode[] = ['auto', 'on', 'off']
  return (
    <div className="flex items-center gap-1" aria-label="Exaggeration mode">
      <span className="text-[10px] uppercase tracking-widest text-ink-softer mr-1 font-display">
        Exag
      </span>
      {options.map((opt) => {
        const active = mode === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-display border rounded-sm transition-colors ${
              active
                ? 'border-terracotta bg-terracotta text-paper-light'
                : 'border-ink/30 bg-paper-light text-ink-softer hover:border-ink hover:text-ink'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

interface SimultaneityLine {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

function buildSimultaneityLines(beta: number, turnFrac: number): SimultaneityLine[] {
  const lines: SimultaneityLine[] = []
  const turnX = beta * turnFrac
  const turnT = turnFrac

  const backToAxis = (x0: number, t0: number, slope: number) => ({
    x: 0,
    t: t0 - slope * x0,
  })

  const outboundFractions = [0.5, 1.0]
  for (const f of outboundFractions) {
    const x0 = turnX * f
    const t0 = turnT * f
    const end = backToAxis(x0, t0, beta)
    lines.push({
      x1: x0,
      y1: t0,
      x2: end.x,
      y2: end.t,
      color: COLORS.simultaneity,
    })
  }

  const inboundFractions = [0.0, 0.5]
  for (const g of inboundFractions) {
    const x0 = turnX * (1 - g)
    const t0 = turnT + (1 - turnT) * g
    const end = backToAxis(x0, t0, -beta)
    lines.push({
      x1: x0,
      y1: t0,
      x2: end.x,
      y2: end.t,
      color: COLORS.simultaneity2,
    })
  }

  return lines
}
