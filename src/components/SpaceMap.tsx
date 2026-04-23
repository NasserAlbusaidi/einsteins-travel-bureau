import { getDestinationCopy } from '../copy/destinations'
import type { BrochureCopy } from '../copy/destinations'
import { useStore } from '../store'

/**
 * Vintage wall-chart SVG map of every bureau destination.
 * Stylised, not to scale. Left half: Earth orbits. Right half: deep space.
 * Each pin is clickable and loads that scenario in the store.
 */

type ZoneKind = 'earth' | 'interstellar'
type SymbolKind = 'pin' | 'star' | 'hole' | 'ship' | 'jet'

interface MapPoint {
  readonly id: string
  readonly label: string
  readonly sublabel?: string
  readonly x: number
  readonly y: number
  readonly zone: ZoneKind
  readonly symbol: SymbolKind
  readonly labelAnchor?: 'start' | 'middle' | 'end'
  readonly labelDx?: number
  readonly labelDy?: number
}

const EARTH_CENTER = { x: 260, y: 290 } as const
const EARTH_RADIUS = 30

const ORBITS: ReadonlyArray<{ r: number; label: string; labelAngle: number }> = [
  { r: 48, label: 'STRATOSPHERE · 10 km', labelAngle: -110 },
  { r: 92, label: 'LEO · 408 km', labelAngle: 40 },
  { r: 154, label: 'MEO · 20,180 km', labelAngle: 72 },
]

const POINTS: ReadonlyArray<MapPoint> = [
  {
    id: 'flight',
    label: 'SF → TOKYO',
    sublabel: '900 km/h',
    x: EARTH_CENTER.x + 38,
    y: EARTH_CENTER.y - 29,
    zone: 'earth',
    symbol: 'jet',
    labelAnchor: 'start',
    labelDx: 10,
    labelDy: 2,
  },
  {
    id: 'iss',
    label: 'ISS',
    sublabel: '7.66 km/s',
    x: EARTH_CENTER.x + 92,
    y: EARTH_CENTER.y,
    zone: 'earth',
    symbol: 'pin',
    labelAnchor: 'start',
    labelDx: 10,
    labelDy: 4,
  },
  {
    id: 'scott-kelly',
    label: 'KELLY · 340 d',
    sublabel: 'one-year mission',
    x: EARTH_CENTER.x - 92,
    y: EARTH_CENTER.y,
    zone: 'earth',
    symbol: 'pin',
    labelAnchor: 'end',
    labelDx: -10,
    labelDy: 4,
  },
  {
    id: 'gps',
    label: 'GPS',
    sublabel: '3.87 km/s',
    x: EARTH_CENTER.x + 115,
    y: EARTH_CENTER.y - 102,
    zone: 'earth',
    symbol: 'pin',
    labelAnchor: 'start',
    labelDx: 10,
    labelDy: 4,
  },
  {
    id: 'twin-paradox',
    label: 'ALPHA CENTAURI',
    sublabel: '4.37 ly · 0.9c',
    x: 800,
    y: 130,
    zone: 'interstellar',
    symbol: 'star',
    labelAnchor: 'middle',
    labelDy: 30,
  },
  {
    id: 'hail-mary',
    label: 'HAIL MARY CRUISE',
    sublabel: '0.92c · deep space',
    x: 950,
    y: 360,
    zone: 'interstellar',
    symbol: 'ship',
    labelAnchor: 'middle',
    labelDy: 30,
  },
  {
    id: 'millers-planet',
    label: 'GARGANTUA',
    sublabel: "Miller's planet",
    x: 1095,
    y: 200,
    zone: 'interstellar',
    symbol: 'hole',
    labelAnchor: 'middle',
    labelDy: 36,
  },
]

// Raw hex for SVG fills/strokes (can't use Tailwind tokens inside SVG attrs).
const COLORS = {
  ink: '#1a2332',
  inkLight: '#425066',
  inkSofter: '#6c7a8f',
  inkFaint: '#9ba7b8',
  paper: '#f1e6ce',
  paperLight: '#f8f0dc',
  paperDark: '#e2d1a9',
  terracotta: '#b5482d',
  stampGreen: '#3c6447',
  stampRed: '#a92525',
  mustardDark: '#a07d2e',
  olive: '#6b7043',
} as const

const HAZARD_COLOR: Record<BrochureCopy['hazard'], string> = {
  SAFE: COLORS.stampGreen,
  CAUTION: COLORS.mustardDark,
  EXTREME: COLORS.terracotta,
  FATAL: COLORS.stampRed,
}

export function SpaceMap() {
  const scenarioId = useStore((s) => s.scenarioId)
  const setScenario = useStore((s) => s.setScenario)

  const onPick = (id: string) => {
    setScenario(id)
    // scroll to the booking form so the action has consequences
    const el = document.getElementById('booking-form')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="font-display text-[11px] tracking-[0.35em] uppercase text-ink-softer">
            Section I · The Atlas
          </div>
          <h2 className="font-display text-3xl text-ink">The Bureau Wall-Map</h2>
          <p className="text-sm text-ink-light mt-1 italic max-w-2xl">
            Every destination we service. Schematic, not to scale — Gargantua would be several
            galaxies off the page if we drew it honestly. Tap a pin to begin booking.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end text-[10px] uppercase tracking-[0.3em] text-ink-softer gap-1">
          <span className="stamp-rect text-stamp-blue border-stamp-blue">Chart VII</span>
          <span>First plate · 1905</span>
        </div>
      </div>

      <div className="paper-card bg-paper-light px-4 py-3 overflow-hidden">
        <svg
          viewBox="0 0 1200 540"
          className="w-full h-auto block"
          role="img"
          aria-label="Schematic map of every destination offered by Einstein's Travel Bureau"
        >
          <defs>
            <pattern
              id="map-grain"
              x="0"
              y="0"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="0.6" fill="rgba(139,115,78,0.14)" />
            </pattern>
            <marker
              id="map-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={COLORS.ink} />
            </marker>
            <radialGradient id="hole-grad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={COLORS.ink} />
              <stop offset="70%" stopColor={COLORS.ink} />
              <stop offset="100%" stopColor={COLORS.inkLight} />
            </radialGradient>
          </defs>

          {/* paper texture + nested border cartouche */}
          <rect x="0" y="0" width="1200" height="540" fill="url(#map-grain)" />
          <rect
            x="6"
            y="6"
            width="1188"
            height="528"
            fill="none"
            stroke={COLORS.ink}
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          <rect
            x="14"
            y="14"
            width="1172"
            height="512"
            fill="none"
            stroke={COLORS.ink}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />

          {/* Title cartouche */}
          <g transform="translate(600, 40)">
            <text
              textAnchor="middle"
              y="0"
              fontFamily="DM Serif Display, Georgia, serif"
              fontSize="18"
              fill={COLORS.ink}
              letterSpacing="6"
            >
              ATLAS · OF · RELATIVISTIC · ITINERARIES
            </text>
            <text
              textAnchor="middle"
              y="18"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
              fontSize="9"
              fill={COLORS.inkSofter}
              letterSpacing="4"
            >
              HOME · ORBIT · INTERSTELLAR · SUPERMASSIVE
            </text>
          </g>

          {/* ===== Zone I: Home System ===== */}
          <text
            x="60"
            y="100"
            fontSize="10"
            fill={COLORS.inkSofter}
            letterSpacing="4"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
          >
            I · HOME  SYSTEM
          </text>
          <line
            x1="60"
            y1="108"
            x2="460"
            y2="108"
            stroke={COLORS.ink}
            strokeOpacity="0.3"
            strokeWidth="0.5"
          />

          {/* Orbit rings + labels */}
          {ORBITS.map((o) => {
            const rad = (o.labelAngle * Math.PI) / 180
            const lx = EARTH_CENTER.x + Math.cos(rad) * (o.r + 10)
            const ly = EARTH_CENTER.y + Math.sin(rad) * (o.r + 10)
            return (
              <g key={o.r}>
                <circle
                  cx={EARTH_CENTER.x}
                  cy={EARTH_CENTER.y}
                  r={o.r}
                  fill="none"
                  stroke={COLORS.ink}
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={o.labelAngle > -90 && o.labelAngle < 90 ? 'start' : 'end'}
                  fontSize="8"
                  fill={COLORS.inkSofter}
                  letterSpacing="2"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                >
                  {o.label}
                </text>
              </g>
            )
          })}

          {/* Earth */}
          <EarthGlyph />

          {/* ===== Compression break ===== */}
          <g transform="translate(504, 0)">
            <line
              x1="0"
              y1="60"
              x2="0"
              y2="500"
              stroke={COLORS.ink}
              strokeOpacity="0.35"
              strokeWidth="0.75"
              strokeDasharray="3 5"
            />
            <line
              x1="14"
              y1="60"
              x2="14"
              y2="500"
              stroke={COLORS.ink}
              strokeOpacity="0.35"
              strokeWidth="0.75"
              strokeDasharray="3 5"
            />
            <rect x="-2" y="260" width="18" height="40" fill={COLORS.paperLight} />
            <text
              transform="translate(7, 280) rotate(-90)"
              textAnchor="middle"
              fontSize="8"
              fill={COLORS.inkSofter}
              letterSpacing="3"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
            >
              ≈ NOT TO SCALE ≈
            </text>
          </g>

          {/* ===== Zone II: Beyond ===== */}
          <text
            x="560"
            y="100"
            fontSize="10"
            fill={COLORS.inkSofter}
            letterSpacing="4"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
          >
            II · BEYOND  THE  SOLAR  SYSTEM
          </text>
          <line
            x1="560"
            y1="108"
            x2="1150"
            y2="108"
            stroke={COLORS.ink}
            strokeOpacity="0.3"
            strokeWidth="0.5"
          />

          {/* Departure anchor (stylised Earth-origin for deep space routes) */}
          <g transform="translate(560, 290)">
            <circle r="5" fill={COLORS.ink} />
            <circle r="10" fill="none" stroke={COLORS.ink} strokeOpacity="0.3" strokeWidth="0.75" />
            <text
              y="-14"
              textAnchor="middle"
              fontSize="8"
              fill={COLORS.inkSofter}
              letterSpacing="3"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
            >
              DEPART
            </text>
          </g>

          {/* Route: Earth → Alpha Centauri (outbound arc + faint return arc) */}
          <path
            d="M 570 285 Q 680 60 800 130"
            fill="none"
            stroke={COLORS.ink}
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="5 4"
            markerEnd="url(#map-arrow)"
          />
          <path
            d="M 800 130 Q 690 210 570 295"
            fill="none"
            stroke={COLORS.ink}
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
          <text
            x="685"
            y="85"
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.inkLight}
            letterSpacing="2"
            fontFamily="DM Serif Display, Georgia, serif"
            fontStyle="italic"
          >
            round-trip · γ ≈ 2.29
          </text>

          {/* Route: Earth → Hail Mary */}
          <path
            d="M 570 295 Q 750 345 950 360"
            fill="none"
            stroke={COLORS.ink}
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="7 4"
            markerEnd="url(#map-arrow)"
          />
          <text
            x="770"
            y="340"
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.inkLight}
            letterSpacing="2"
            fontFamily="DM Serif Display, Georgia, serif"
            fontStyle="italic"
          >
            open-ended · γ ≈ 2.55
          </text>

          {/* Route: Earth → Gargantua */}
          <path
            d="M 570 285 Q 820 230 1095 200"
            fill="none"
            stroke={COLORS.ink}
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="10 4"
            markerEnd="url(#map-arrow)"
          />
          <text
            x="860"
            y="225"
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.inkLight}
            letterSpacing="2"
            fontFamily="DM Serif Display, Georgia, serif"
            fontStyle="italic"
          >
            1 hr ↔ 7 yr
          </text>

          {/* Background stars (decorative) */}
          {BACKGROUND_STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={COLORS.ink}
              opacity={s.o}
            />
          ))}

          {/* Pins */}
          {POINTS.map((p) => (
            <Pin
              key={p.id}
              point={p}
              selected={scenarioId === p.id}
              onSelect={onPick}
            />
          ))}

          {/* Compass rose */}
          <CompassRose x={1130} y={470} />

          {/* Footer motto */}
          <text
            x="600"
            y="516"
            textAnchor="middle"
            fontSize="10"
            fill={COLORS.inkSofter}
            letterSpacing="6"
            fontFamily="DM Serif Display, Georgia, serif"
          >
            · HIC · SVNT · DILATATIONES ·
          </text>
        </svg>
      </div>
    </section>
  )
}

/* ---------- Pin + symbols ---------- */

interface PinProps {
  readonly point: MapPoint
  readonly selected: boolean
  readonly onSelect: (id: string) => void
}

function Pin({ point, selected, onSelect }: PinProps) {
  const copy = getDestinationCopy(point.id)
  const color = HAZARD_COLOR[copy.hazard]
  const labelAnchor = point.labelAnchor ?? 'middle'
  const labelDx = point.labelDx ?? 0
  const labelDy = point.labelDy ?? 22

  return (
    <g
      className="map-pin"
      onClick={() => onSelect(point.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(point.id)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Select ${copy.tagline}`}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <title>{`${point.label} — ${copy.tagline}`}</title>

      {/* invisible hit area */}
      <circle cx={point.x} cy={point.y} r="22" fill="transparent" />

      {/* selected ring */}
      {selected ? (
        <g>
          <circle
            cx={point.x}
            cy={point.y}
            r="16"
            fill="none"
            stroke={COLORS.terracotta}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r="20"
            fill="none"
            stroke={COLORS.terracotta}
            strokeOpacity="0.4"
            strokeWidth="0.75"
          />
        </g>
      ) : null}

      {/* symbol */}
      {point.symbol === 'pin' ? <PinSymbol x={point.x} y={point.y} color={color} /> : null}
      {point.symbol === 'jet' ? <JetSymbol x={point.x} y={point.y} color={color} /> : null}
      {point.symbol === 'star' ? <StarSymbol x={point.x} y={point.y} color={color} /> : null}
      {point.symbol === 'ship' ? <ShipSymbol x={point.x} y={point.y} color={color} /> : null}
      {point.symbol === 'hole' ? <HoleSymbol x={point.x} y={point.y} /> : null}

      {/* label */}
      <text
        x={point.x + labelDx}
        y={point.y + labelDy}
        textAnchor={labelAnchor}
        fontSize="10"
        fill={COLORS.ink}
        fontFamily="DM Serif Display, Georgia, serif"
        letterSpacing="2"
      >
        {point.label}
      </text>
      {point.sublabel ? (
        <text
          x={point.x + labelDx}
          y={point.y + labelDy + 11}
          textAnchor={labelAnchor}
          fontSize="8"
          fill={COLORS.inkSofter}
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          letterSpacing="1"
        >
          {point.sublabel}
        </text>
      ) : null}
    </g>
  )
}

function PinSymbol({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill={color} stroke={COLORS.ink} strokeWidth="1.25" />
      <circle cx={x} cy={y} r="1.5" fill={COLORS.paperLight} />
    </g>
  )
}

function JetSymbol({ x, y, color }: { x: number; y: number; color: string }) {
  // Tiny stylised plane silhouette pointing up-right.
  return (
    <g transform={`translate(${x}, ${y}) rotate(-30)`}>
      <path
        d="M 0 -6 L 1.2 0 L 6 1.2 L 6 2.4 L 1.2 2 L 1 5 L 2.4 6.5 L 2.4 7.5 L 0 6.5 L -2.4 7.5 L -2.4 6.5 L -1 5 L -1.2 2 L -6 2.4 L -6 1.2 L -1.2 0 Z"
        fill={color}
        stroke={COLORS.ink}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </g>
  )
}

function StarSymbol({ x, y, color }: { x: number; y: number; color: string }) {
  // 5-point star built from polar coords
  const outer = 8
  const inner = 3.5
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`)
  }
  return (
    <g>
      <polygon
        points={pts.join(' ')}
        fill={color}
        stroke={COLORS.ink}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* corona */}
      <circle cx={x} cy={y} r="13" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="0.75" strokeDasharray="1 3" />
    </g>
  )
}

function ShipSymbol({ x, y, color }: { x: number; y: number; color: string }) {
  // Arrowhead pointing right, with little trailing dashes for motion.
  return (
    <g>
      <path
        d={`M ${x - 8} ${y - 6} L ${x + 8} ${y} L ${x - 8} ${y + 6} L ${x - 4} ${y} Z`}
        fill={color}
        stroke={COLORS.ink}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <line x1={x - 14} y1={y - 3} x2={x - 10} y2={y - 3} stroke={COLORS.ink} strokeOpacity="0.6" strokeWidth="1" />
      <line x1={x - 14} y1={y + 3} x2={x - 10} y2={y + 3} stroke={COLORS.ink} strokeOpacity="0.6" strokeWidth="1" />
      <line x1={x - 20} y1={y} x2={x - 16} y2={y} stroke={COLORS.ink} strokeOpacity="0.4" strokeWidth="1" />
    </g>
  )
}

function HoleSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* outer accretion glow */}
      <circle cx={x} cy={y} r="16" fill="none" stroke={COLORS.mustardDark} strokeOpacity="0.35" strokeWidth="0.75" strokeDasharray="2 3" />
      <circle cx={x} cy={y} r="12" fill="none" stroke={COLORS.terracotta} strokeOpacity="0.5" strokeWidth="0.75" strokeDasharray="1 2" />
      {/* event horizon */}
      <circle cx={x} cy={y} r="7.5" fill="url(#hole-grad)" stroke={COLORS.ink} strokeWidth="1" />
      <circle cx={x} cy={y} r="9.5" fill="none" stroke={COLORS.ink} strokeWidth="0.5" strokeDasharray="1 2" />
    </g>
  )
}

function EarthGlyph() {
  const { x, y } = EARTH_CENTER
  const r = EARTH_RADIUS
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={COLORS.paperDark} stroke={COLORS.ink} strokeWidth="1.5" />
      {/* faint meridians */}
      <path
        d={`M ${x - r} ${y} Q ${x} ${y - 12} ${x + r} ${y}`}
        fill="none"
        stroke={COLORS.ink}
        strokeOpacity="0.3"
        strokeWidth="0.5"
      />
      <path
        d={`M ${x - r} ${y} Q ${x} ${y + 12} ${x + r} ${y}`}
        fill="none"
        stroke={COLORS.ink}
        strokeOpacity="0.3"
        strokeWidth="0.5"
      />
      <line x1={x} y1={y - r} x2={x} y2={y + r} stroke={COLORS.ink} strokeOpacity="0.3" strokeWidth="0.5" />
      {/* stylised continent blobs */}
      <path
        d={`M ${x - 14} ${y - 4} q 4 -6 10 -4 q 3 3 -1 8 q -7 3 -9 -4 z`}
        fill={COLORS.olive ?? '#6b7043'}
        opacity="0.55"
      />
      <path
        d={`M ${x + 2} ${y + 3} q 8 -2 12 4 q -2 6 -8 5 q -6 -3 -4 -9 z`}
        fill="#6b7043"
        opacity="0.55"
      />
      <text
        x={x}
        y={y + r + 14}
        textAnchor="middle"
        fontSize="10"
        fill={COLORS.ink}
        fontFamily="DM Serif Display, Georgia, serif"
        letterSpacing="4"
      >
        EARTH
      </text>
    </g>
  )
}

function CompassRose({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="28" fill={COLORS.paperLight} stroke={COLORS.ink} strokeOpacity="0.4" strokeWidth="0.75" />
      <circle r="22" fill="none" stroke={COLORS.ink} strokeOpacity="0.3" strokeWidth="0.5" />
      {/* cardinal arrow */}
      <path d="M 0 -28 L 3 0 L 0 28 L -3 0 z" fill={COLORS.terracotta} stroke={COLORS.ink} strokeWidth="0.5" />
      <path d="M -28 0 L 0 3 L 28 0 L 0 -3 z" fill={COLORS.paper} stroke={COLORS.ink} strokeWidth="0.5" />
      <text y="-32" textAnchor="middle" fontSize="9" fill={COLORS.ink} fontFamily="DM Serif Display, Georgia, serif">
        N
      </text>
      <text y="42" textAnchor="middle" fontSize="9" fill={COLORS.ink} fontFamily="DM Serif Display, Georgia, serif">
        S
      </text>
      <text x="-36" y="3" textAnchor="middle" fontSize="9" fill={COLORS.ink} fontFamily="DM Serif Display, Georgia, serif">
        W
      </text>
      <text x="36" y="3" textAnchor="middle" fontSize="9" fill={COLORS.ink} fontFamily="DM Serif Display, Georgia, serif">
        E
      </text>
    </g>
  )
}

/* Decorative scatter, deterministic — no RNG per render */
const BACKGROUND_STARS: ReadonlyArray<{ x: number; y: number; r: number; o: number }> = [
  { x: 640, y: 160, r: 0.8, o: 0.4 },
  { x: 705, y: 205, r: 0.6, o: 0.3 },
  { x: 870, y: 80, r: 1.1, o: 0.5 },
  { x: 985, y: 175, r: 0.7, o: 0.4 },
  { x: 720, y: 420, r: 0.9, o: 0.45 },
  { x: 1040, y: 370, r: 0.7, o: 0.35 },
  { x: 880, y: 250, r: 0.5, o: 0.3 },
  { x: 600, y: 380, r: 0.6, o: 0.3 },
  { x: 820, y: 400, r: 0.8, o: 0.4 },
  { x: 1150, y: 260, r: 0.9, o: 0.45 },
  { x: 1000, y: 100, r: 0.5, o: 0.3 },
  { x: 760, y: 280, r: 0.6, o: 0.3 },
  { x: 660, y: 450, r: 0.7, o: 0.35 },
  { x: 1120, y: 140, r: 0.8, o: 0.4 },
  { x: 900, y: 460, r: 0.6, o: 0.3 },
]
