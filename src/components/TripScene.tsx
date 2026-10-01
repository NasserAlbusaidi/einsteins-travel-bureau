import { useRef, useState } from 'react'
import Decimal from 'decimal.js'
import { useStore } from '../store'
import { evaluateTrip, heightOf } from '../trip'
import { getBody, type BodyId } from '../physics/bodies'
import { C } from '../physics/constants'
import { heightScale, speedScale } from '../scales'
import { PLACES } from '../copy/places'
import { humanDistance, humanSpeed } from '../humanize'
import { useFrame } from '../hooks/motion'
import { BodyShape } from './art/Bodies'
import { ClockFace } from './art/ClockFace'
import { ShipShape } from './art/Ship'
import { drawWarp, makeWarpStars } from './art/warp'

/** Where the body sits in the 640×360 scene, and how big each one is drawn. */
const CX = 250
const CY = 185
const TILT = 0.36
const R: Record<BodyId, number> = {
  none: 0,
  earth: 62,
  sun: 78,
  'white-dwarf': 15,
  'neutron-star': 9,
  'sgr-a': 40,
  gargantua: 36,
}
const ORBIT_MAX = 300
/** One turn of the home clock, in real seconds. */
const HOME_PERIOD = 3

/**
 * A window onto the trip: what you're near, how high you are, how fast you're
 * going, and two clocks ticking at their real relative rates.
 */
export function TripScene() {
  const trip = useStore((s) => s.trip)
  const out = evaluateTrip(trip)
  const body = getBody(trip.place)
  const place = PLACES[trip.place]
  const height = heightOf(trip)
  const deep = body.kind === 'empty'
  const onGround = !deep && height.isZero()

  // Visual speed: the slider position, so a car and light speed both look like something.
  const speedPos = speedScale.toPos(trip.speed)
  const beta = trip.speed.div(C).toNumber()
  const orbitR = deep ? 0 : R[trip.place] + 16 + heightScale(body).toPos(height) * (ORBIT_MAX - R[trip.place] - 16)
  const ratio = out.ok ? out.result.ratio.toNumber() : 0

  const backShip = useRef<SVGGElement>(null)
  const frontShip = useRef<SVGGElement>(null)
  const homeHand = useRef<SVGGElement>(null)
  const youHand = useRef<SVGGElement>(null)
  const warp = useRef<HTMLCanvasElement>(null)
  const [stars] = useState(() => makeWarpStars(90))
  // Start on the near side of the orbit, so a parked ship is never hidden behind the body.
  const clock = useRef({ angle: 0.5, home: 0, you: 0 })

  useFrame((dt) => {
    const c = clock.current
    c.home += dt / HOME_PERIOD
    c.you += (dt / HOME_PERIOD) * ratio
    homeHand.current?.setAttribute('transform', `rotate(${(c.home % 1) * 360})`)
    youHand.current?.setAttribute('transform', `rotate(${(c.you % 1) * 360})`)

    // Deep space: the stars do the moving. Near a body: the ship orbits.
    drawWarp(warp.current, stars, deep ? Math.max(speedPos, 0.02) ** 1.5 : 0.01, dt)
    if (deep || onGround) return
    c.angle += dt * (speedPos === 0 ? 0 : 0.15 + speedPos * 1.1)
    const x = CX + orbitR * Math.cos(c.angle)
    const y = CY + orbitR * TILT * Math.sin(c.angle)
    const heading = (Math.atan2(TILT * Math.cos(c.angle), -Math.sin(c.angle)) * 180) / Math.PI
    // Scale the ship by depth so the far side of the orbit reads as further away.
    const depth = 0.8 + 0.2 * Math.sin(c.angle)
    const transform = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading.toFixed(1)}) scale(${depth.toFixed(3)})`
    const behind = Math.sin(c.angle) < 0
    backShip.current?.setAttribute('transform', transform)
    frontShip.current?.setAttribute('transform', transform)
    backShip.current?.setAttribute('visibility', behind ? 'visible' : 'hidden')
    frontShip.current?.setAttribute('visibility', behind ? 'hidden' : 'visible')
  })

  return (
    <figure className="relative shrink-0 flex flex-col overflow-hidden rounded-[22px] bg-[radial-gradient(120%_100%_at_30%_40%,#1b2550_0%,#0d1330_45%,#05070f_100%)] ring-1 ring-gold/25 shadow-panel">
      <div className="relative">
      <canvas ref={warp} className="absolute inset-0 w-full h-full" aria-hidden />
      <svg viewBox="0 0 640 360" className="relative block w-full h-auto" role="img" aria-label={sceneLabel(trip.place, height, trip.speed)}>
        {deep ? (
          <>
            <g transform="translate(540 70)" opacity="0.6">
              <BodyShape id="none" r={42} />
            </g>
            <g transform="translate(300 175)">
              <g className="float">
                <g transform="translate(-84 -28) scale(1.4)">
                  <ShipShape />
                </g>
              </g>
            </g>
          </>
        ) : (
          <>
            {/* Back half of the orbit, then the body, then the front half. */}
            {!onGround ? <OrbitHalf r={orbitR} back /> : null}
            <g ref={backShip} visibility="hidden">
              <ShipMarker />
            </g>
            <g transform={`translate(${CX} ${CY})`}>
              <BodyShape id={trip.place} r={R[trip.place]} />
            </g>
            {!onGround ? (
              <>
                <OrbitHalf r={orbitR} />
                <HeightRuler from={R[trip.place]} to={orbitR} />
              </>
            ) : (
              <GroundPin y={CY - R[trip.place]} />
            )}
            <g ref={frontShip} visibility="hidden">
              <ShipMarker />
            </g>
          </>
        )}
      </svg>

      {/* Caption chips over the scene. */}
      <figcaption className="absolute left-3 top-3 sm:left-4 sm:top-4 flex flex-wrap gap-1.5 max-w-[70%]">
        <Chip>{deep ? 'Deep space' : `Near ${place.inSentence}`}</Chip>
        {!deep ? <Chip>{onGround ? 'On the ground' : `${humanDistance(height)} ${body.kind === 'black-hole' ? 'from the edge' : 'up'}`}</Chip> : null}
        <Chip tone="you">{capitalise(humanSpeed(trip.speed))}</Chip>
      </figcaption>
      </div>

      <div className="relative flex items-center gap-3 sm:gap-4 border-t border-gold/20 bg-night-950/80 px-3 py-2.5 sm:px-4">
        <MiniClock tone="home" handRef={homeHand} label="Home" />
        <MiniClock tone="you" handRef={youHand} label="You" />
        <p className="text-[13px] sm:text-sm leading-snug text-mist-200 min-w-0">{clockNote(out.ok ? out.result.ratio : null, beta)}</p>
      </div>
    </figure>
  )
}

function OrbitHalf({ r, back = false }: { r: number; back?: boolean }) {
  // An ellipse split at the horizon line: the far half sits behind the body.
  const rx = r
  const ry = r * TILT
  const d = back
    ? `M${CX - rx} ${CY} A${rx} ${ry} 0 0 1 ${CX + rx} ${CY}`
    : `M${CX - rx} ${CY} A${rx} ${ry} 0 0 0 ${CX + rx} ${CY}`
  return (
    <path
      d={d}
      fill="none"
      stroke="#e3b04b"
      strokeOpacity={back ? 0.25 : 0.55}
      strokeWidth={back ? 1 : 1.4}
      strokeDasharray="3 5"
    />
  )
}

/** A dimension line from the surface out to the orbit, like an engineer's drawing. */
function HeightRuler({ from, to }: { from: number; to: number }) {
  if (to - from < 18) return null
  const y = CY
  return (
    <g stroke="#f3d38a" strokeOpacity="0.8">
      <line x1={CX + from + 3} y1={y} x2={CX + to - 3} y2={y} strokeWidth="1" />
      <line x1={CX + from + 3} y1={y - 5} x2={CX + from + 3} y2={y + 5} strokeWidth="1.2" />
      <line x1={CX + to - 3} y1={y - 5} x2={CX + to - 3} y2={y + 5} strokeWidth="1.2" />
    </g>
  )
}

function GroundPin({ y }: { y: number }) {
  return (
    <g transform={`translate(${CX} ${y})`}>
      <circle r="10" fill="#ff7b54" className="pulse-ring" opacity="0.6" />
      <path d="M0 0 C-7 -10 -9 -14 -9 -18 a9 9 0 0 1 18 0 c0 4 -2 8 -9 18 z" fill="#ff7b54" stroke="#fbf6ea" strokeWidth="1.5" />
      <circle cy="-18" r="3.2" fill="#fbf6ea" />
    </g>
  )
}

function ShipMarker() {
  return (
    <g>
      <circle r="16" fill="#ff7b54" opacity="0.18" />
      <g transform="translate(-27 -9) scale(0.45)">
        <ShipShape />
      </g>
    </g>
  )
}

function MiniClock({ tone, handRef, label }: { tone: 'you' | 'home'; handRef: React.Ref<SVGGElement>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <ClockFace tone={tone} handRef={handRef} className="w-11 h-11 sm:w-12 sm:h-12" />
      <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${tone === 'you' ? 'text-you-300' : 'text-home-300'}`}>
        {label}
      </span>
    </div>
  )
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: 'you' }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-medium backdrop-blur ring-1 ring-inset ${
        tone === 'you' ? 'bg-you/15 text-you-300 ring-you/40' : 'bg-night-950/60 text-mist-100 ring-gold/25'
      }`}
    >
      {children}
    </span>
  )
}

function clockNote(ratio: Decimal | null, beta: number): string {
  if (!ratio) return 'Your clock has stopped. This trip can’t happen.'
  const off = ratio.minus(1).abs().toNumber()
  if (off < 0.002) return 'Same speed to the eye. The gap is real, just far too small to see.'
  if (ratio.lt('0.01')) return 'Your clock is all but frozen compared to home.'
  if (ratio.lt(1)) return `Your clock runs at ${Math.round(ratio.toNumber() * 100)}% of home’s speed.`
  return beta > 0 ? 'Your clock runs a little faster than home’s.' : 'Your clock runs faster than home’s.'
}

function sceneLabel(place: BodyId, height: Decimal, speed: Decimal): string {
  const where = place === 'none' ? 'in deep space' : `${humanDistance(height)} above ${PLACES[place].inSentence}`
  return `Your ship, ${where}, moving at ${humanSpeed(speed)}.`
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
