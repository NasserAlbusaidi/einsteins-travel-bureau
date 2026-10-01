import { Reveal } from './Reveal'
import { Ship } from './art/Ship'
import { BodyShape } from './art/Bodies'
import { Icon } from './art/Icons'

/** The whole idea as three travel posters. No equations. */
export function HowItWorks() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-3">
        <Reveal delay={0}>
          <Poster
            number="Rule Nº 1"
            title="Speed slows your clock."
            art={<SpeedArt />}
            sky="from-[#ff7b54] via-[#c2456b] to-[#2a1d4f]"
          >
            The faster you go, the slower time passes for you compared with people standing still. In a car or a
            plane the difference is billionths of a second. Close to light speed, it’s years.
          </Poster>
        </Reveal>
        <Reveal delay={120}>
          <Poster
            number="Rule Nº 2"
            title="Heavy things slow time down."
            art={<GravityArt />}
            sky="from-[#2a9d8f] via-[#1f4e79] to-[#121a3c]"
          >
            Sit close to something massive (a planet, a star, a black hole) and your clock runs slow. Even on Earth,
            your feet age a tiny bit slower than your head.
          </Poster>
        </Reveal>
        <Reveal delay={240}>
          <Poster
            number="The catch"
            title="It only goes one way."
            art={<OneWayArt />}
            sky="from-[#e3b04b] via-[#a0522d] to-[#2a1d4f]"
          >
            You can skip ahead to the future but never come back. And you won’t feel it: your watch, heartbeat and
            thoughts all slow down together. You only notice when you compare clocks with someone who stayed home.
          </Poster>
        </Reveal>
      </div>

      <Reveal>
        <div className="panel px-5 py-5 sm:px-7 sm:py-6 grid gap-5 sm:grid-cols-[auto_1fr] items-center">
          <div className="relative w-28 h-20 mx-auto sm:mx-0" aria-hidden>
            <svg viewBox="-60 -40 120 80" className="w-full h-full">
              <BodyShape id="earth" r={24} />
              <ellipse rx="50" ry="14" fill="none" stroke="#e3b04b" strokeOpacity="0.5" strokeDasharray="2 3" transform="rotate(-12)" />
            </svg>
            <Icon name="satellite" size={26} className="absolute right-0 top-1 text-gold-300 float" />
          </div>
          <p className="text-mist-200 text-lg leading-relaxed">
            <strong className="text-cream font-semibold">Is this real? Your phone says yes.</strong> GPS satellites
            have to correct for both rules every single day. Skip the fix and the blue dot on your map would drift
            about <span className="text-gold-300 font-semibold">10 km a day</span>. Every number on this site comes
            from Einstein’s actual equations.
          </p>
        </div>
      </Reveal>
    </div>
  )
}

function Poster(props: { number: string; title: string; art: React.ReactNode; sky: string; children: React.ReactNode }) {
  return (
    <article className="group h-full rounded-[22px] overflow-hidden bg-cream text-ink shadow-ticket flex flex-col transition-transform duration-300 hover:-translate-y-1.5">
      <div className={`relative h-52 bg-gradient-to-b ${props.sky} overflow-hidden`}>
        <PosterSun />
        {props.art}
        <div className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-ink">
          {props.number}
        </div>
      </div>
      <div className="p-5 sm:p-6 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-[26px] leading-[1.1] font-semibold tracking-tight">{props.title}</h3>
        <p className="text-ink-2 leading-relaxed">{props.children}</p>
      </div>
    </article>
  )
}

/** The sunburst every good 1930s travel poster has behind it. */
function PosterSun() {
  return (
    <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <g stroke="#fff" strokeOpacity="0.1" strokeWidth="10">
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1="200" y1="230" x2="200" y2="-200" transform={`rotate(${-85 + i * 10} 200 230)`} />
        ))}
      </g>
      <g fill="#fff" fillOpacity="0.85">
        <circle cx="40" cy="40" r="1.2" />
        <circle cx="330" cy="30" r="1.5" />
        <circle cx="280" cy="80" r="1" />
        <circle cx="90" cy="110" r="1" />
        <circle cx="360" cy="120" r="1.2" />
      </g>
    </svg>
  )
}

function SpeedArt() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <g stroke="#fbf6ea" strokeLinecap="round">
          {[40, 70, 95, 125, 150, 175].map((y, i) => (
            <line key={y} x1={20 + i * 14} y1={y} x2={150 + i * 10} y2={y - 30} strokeOpacity={0.25 + (i % 3) * 0.15} strokeWidth={i % 2 ? 1.5 : 2.5} />
          ))}
        </g>
      </svg>
      <Ship className="absolute w-48 left-[38%] top-[34%] -rotate-[14deg] drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:translate-x-3" />
    </div>
  )
}

/** A sheet of spacetime with a black hole sitting in the dent it makes. */
function GravityArt() {
  const rows = 9
  const cols = 15
  const dip = (x: number, z: number) => 70 * Math.exp(-(((x - 200) / 70) ** 2 + ((z - 0.55) / 0.28) ** 2))
  const project = (x: number, z: number): [number, number] => {
    // z: 0 (far) … 1 (near). Simple perspective squash.
    const y = 70 + z * 120
    const spread = 0.55 + z * 0.75
    return [200 + (x - 200) * spread, y + dip(x, z) * (0.4 + z * 0.6)]
  }
  const lines: string[] = []
  for (let r = 0; r <= rows; r++) {
    const z = r / rows
    const pts = Array.from({ length: 41 }, (_, i) => project(i * 10, z))
    lines.push('M' + pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join('L'))
  }
  for (let c = 0; c <= cols; c++) {
    const x = (c / cols) * 400
    const pts = Array.from({ length: 21 }, (_, i) => project(x, i / 20))
    lines.push('M' + pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join('L'))
  }
  const [hx, hy] = project(200, 0.55)
  return (
    <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <g fill="none" stroke="#8be6dc" strokeOpacity="0.45" strokeWidth="1">
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g transform={`translate(${hx} ${hy - 26})`} className="transition-transform duration-500">
        <BodyShape id="gargantua" r={16} />
      </g>
    </svg>
  )
}

function OneWayArt() {
  return (
    <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
      {/* Road to the horizon. */}
      <path d="M150 210 L196 120 L204 120 L250 210 Z" fill="#161a33" fillOpacity="0.55" />
      <path d="M200 205 L200 190 M200 175 L200 162 M200 150 L200 141 M200 132 L200 126" stroke="#f3d38a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="200" cy="120" rx="160" ry="3" fill="#fbf6ea" fillOpacity="0.3" />
      {/* No U-turn sign. */}
      <g transform="translate(300 78)">
        <line x1="0" y1="20" x2="0" y2="95" stroke="#161a33" strokeWidth="4" />
        <circle r="30" fill="#fbf6ea" stroke="#c0392b" strokeWidth="7" />
        <path d="M-8 14 V-4 a8 8 0 0 1 16 0 V8 m-6 -5 l6 7 l6 -7" fill="none" stroke="#161a33" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="-20" y1="-20" x2="20" y2="20" stroke="#c0392b" strokeWidth="6" />
      </g>
      {/* Signpost to the future. */}
      <g transform="translate(70 70)">
        <line x1="20" y1="10" x2="20" y2="110" stroke="#161a33" strokeWidth="4" />
        <path d="M0 0 H70 L84 14 L70 28 H0 Z" fill="#161a33" />
        <text x="8" y="19" fill="#f3d38a" fontFamily="JetBrains Mono Variable, monospace" fontSize="12" fontWeight="700" letterSpacing="1.5">
          FUTURE
        </text>
      </g>
    </svg>
  )
}
