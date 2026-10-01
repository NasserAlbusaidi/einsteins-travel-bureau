import { useEffect, useState } from 'react'
import { Starfield } from './components/Starfield'
import { TwinClocks } from './components/TwinClocks'
import { HowItWorks } from './components/HowItWorks'
import { Departures } from './components/Departures'
import { TripScene } from './components/TripScene'
import { TripControls } from './components/TripControls'
import { BoardingPass } from './components/BoardingPass'
import { MiniResult } from './components/MiniResult'
import { TimeMachine } from './components/TimeMachine'
import { Faq } from './components/Faq'
import { Reveal } from './components/Reveal'
import { Icon } from './components/art/Icons'

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Starfield />
      <a
        href="#planner"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn-gold"
      >
        Skip to the trip planner
      </a>
      <Header />
      <main className="flex-1">
        <Hero />
        <Ticker />

        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-24 sm:gap-32 py-20 sm:py-28">
          <Section id="how" kicker="Before you book" title="Time travel," italic="the real kind." intro="Two rules and one catch. That’s the whole thing.">
            <HowItWorks />
          </Section>

          <Section
            id="departures"
            kicker="Step 1 · Choose"
            title="Pick a"
            italic="flight."
            intro="Every trip on the board is real physics. A few of them have actually happened."
          >
            <Reveal>
              <Departures />
            </Reveal>
          </Section>

          <Section
            id="planner"
            kicker="Step 2 · Adjust"
            title="Make it"
            italic="your trip."
            intro="Change how fast you go, what you’re near and how long you’re away. Your boarding pass updates as you drag."
          >
            <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-[minmax(0,11fr)_minmax(0,10fr)] items-start">
              <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
                <TripScene />
                <div className="lg:overflow-y-auto lg:min-h-0 rounded-[18px] [scrollbar-width:thin] [scrollbar-color:rgba(227,176,75,0.4)_transparent]">
                  <TripControls />
                </div>
                <MiniResult />
              </div>
              <div id="boarding-pass" className="scroll-mt-24">
                <BoardingPass />
              </div>
            </div>
          </Section>

          <Section
            id="time-machine"
            kicker="Bonus · One-way tickets"
            title="The time"
            italic="machine."
            intro="Tell us when you want to arrive and how long you’re willing to spend getting there. We’ll work out the trip."
          >
            <Reveal>
              <TimeMachine />
            </Reveal>
          </Section>

          <Section id="faq" kicker="Questions at the counter" title="Frequently asked" italic="questions.">
            <Faq />
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-night-950/75 backdrop-blur-md shadow-[0_1px_0_rgba(227,176,75,0.18)]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 min-w-0 group">
          <Emblem className="w-9 h-9 shrink-0 transition-transform duration-500 group-hover:rotate-[20deg]" />
          <span className="min-w-0 leading-none">
            <span className="block font-display text-[15px] sm:text-lg text-cream leading-tight">
              Einstein’s <br className="sm:hidden" />
              Travel Bureau
            </span>
            <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.3em] text-gold/80 mt-1">
              Est. 1905 · Future only
            </span>
          </span>
        </a>
        <nav aria-label="Sections" className="hidden md:flex items-center gap-7 text-[15px] text-mist-200">
          <a href="#how" className="hover:text-gold-300 transition-colors">How it works</a>
          <a href="#departures" className="hover:text-gold-300 transition-colors">Departures</a>
          <a href="#time-machine" className="hover:text-gold-300 transition-colors">Time machine</a>
          <a href="#faq" className="hover:text-gold-300 transition-colors">FAQ</a>
        </nav>
        <a href="#departures" className="btn-gold !py-2 !px-4 text-sm shrink-0">
          Book a trip
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative -mt-16 pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      <HeroSunburst />
      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[1.05fr_1fr] items-center">
        <div>
          <Reveal>
            <span className="kicker">Licensed by the laws of physics</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-[56px] sm:text-[84px] xl:text-[100px] leading-[0.92] tracking-[-0.02em] text-cream mt-6">
              Travel into
              <br />
              the <em className="gold-text italic pr-2">future.</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-xl sm:text-[22px] text-mist-100 mt-8 max-w-xl leading-relaxed">
              Time doesn’t pass at the same speed for everyone. Move fast enough, or sit close enough to something
              heavy, and your clock slows down. Come home, and everyone else is older than you.
            </p>
            <p className="text-lg text-mist-300 mt-4 max-w-xl">
              It isn’t science fiction. It’s Einstein, it’s been measured, and we’ll show you exactly how much, in
              plain English.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-wrap gap-3 mt-9">
              <a href="#departures" className="btn-gold text-lg">
                See departures <Icon name="arrow" size={20} />
              </a>
              <a href="#how" className="btn-ghost text-lg">
                How does this work?
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <dl className="grid grid-cols-3 gap-4 mt-12 max-w-xl border-t border-gold/20 pt-6">
              <Proof value="1971" label="Atomic clocks flown on airliners. Einstein was right." />
              <Proof value="38 μs" label="GPS clocks drift every day. Engineers fix it." />
              <Proof value="7 yrs" label="Per hour on Miller’s planet, from Interstellar." />
            </dl>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <TwinClocks />
        </Reveal>
      </div>
    </section>
  )
}

function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl sm:text-3xl text-gold-300 leading-none">{value}</dt>
      <dd className="text-[13px] sm:text-sm text-mist-400 mt-2 leading-snug">{label}</dd>
    </div>
  )
}

/** Giant Deco sunburst rising behind the hero. */
function HeroSunburst() {
  return (
    <svg
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 w-full h-[120%] pointer-events-none opacity-70"
      aria-hidden
    >
      <defs>
        <radialGradient id="hero-glow" cx="0.72" cy="1" r="0.75">
          <stop offset="0" stopColor="#e3b04b" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#ff7b54" stopOpacity="0.06" />
          <stop offset="1" stopColor="#090d20" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-ray" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e3b04b" stopOpacity="0.16" />
          <stop offset="1" stopColor="#e3b04b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#hero-glow)" />
      <g fill="url(#hero-ray)">
        {Array.from({ length: 23 }, (_, i) => {
          const a = ((-88 + i * 8) * Math.PI) / 180
          const b = ((-86 + i * 8) * Math.PI) / 180
          const cx = 860
          const cy = 720
          const L = 1100
          return (
            <path
              key={i}
              d={`M${cx} ${cy} L${cx + L * Math.sin(a)} ${cy - L * Math.cos(a)} L${cx + L * Math.sin(b)} ${cy - L * Math.cos(b)} Z`}
            />
          )
        })}
      </g>
      <g fill="none" stroke="#e3b04b" strokeOpacity="0.14">
        <circle cx="860" cy="720" r="180" />
        <circle cx="860" cy="720" r="260" strokeDasharray="2 6" />
        <circle cx="860" cy="720" r="380" />
      </g>
    </svg>
  )
}

const TICKER = [
  'Now boarding: Alpha Centauri',
  'GPS orbit: in orbit',
  'Miller’s planet: one way only',
  'Tau Ceti: on time',
  'Space station: departing hourly',
  'Kelly twins: landed 2016',
  'SFO to Tokyo: final call',
  'No refunds beyond the event horizon',
]

/** The airport-style announcements strip under the hero. */
function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="relative border-y border-gold/25 bg-night-950/70 overflow-hidden" aria-hidden>
      <div className="marquee flex w-max gap-10 py-3 font-mono text-[12px] uppercase tracking-[0.3em] text-gold-300/90 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <Icon name="sparkle" size={12} className="text-you" />
          </span>
        ))}
      </div>
    </div>
  )
}

function Section(props: {
  id: string
  kicker: string
  title: string
  italic: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <section id={props.id} className="scroll-mt-20 flex flex-col gap-10" aria-labelledby={`${props.id}-title`}>
      <Reveal className="max-w-3xl">
        <span className="kicker">{props.kicker}</span>
        <h2
          id={`${props.id}-title`}
          className="font-display text-[44px] sm:text-[64px] leading-[0.98] tracking-[-0.015em] text-cream mt-4"
        >
          {props.title} <em className="gold-text italic pr-1">{props.italic}</em>
        </h2>
        {props.intro ? <p className="text-lg sm:text-xl text-mist-300 mt-5 leading-relaxed">{props.intro}</p> : null}
      </Reveal>
      {props.children}
    </section>
  )
}

function Emblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="#090d20" stroke="#e3b04b" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="25.5" fill="none" stroke="#e3b04b" strokeOpacity="0.4" strokeWidth="0.75" />
      <ellipse cx="32" cy="32" rx="25" ry="8" fill="none" stroke="#ff7b54" strokeWidth="2.2" transform="rotate(-24 32 32)" />
      <circle cx="32" cy="32" r="11" fill="#e3b04b" />
      <path d="M32 25.5v6.5l4.5 2.8" stroke="#090d20" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="relative border-t border-gold/25 bg-night-950/80 mt-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr] items-end">
        <div>
          <Emblem className="w-14 h-14" />
          <p className="font-display text-3xl sm:text-5xl text-cream mt-6 leading-[1.05]">
            No refunds beyond <em className="gold-text italic">the event horizon.</em>
          </p>
        </div>
        <div className="text-sm text-mist-400 leading-relaxed md:text-right">
          <p>
            Real physics: Einstein’s equations at 50-digit precision. Constants from CODATA 2018 and IAU 2015.
          </p>
          <p className="mt-2">
            <a
              className="text-gold-300 hover:text-gold underline decoration-gold/40 underline-offset-4"
              href="https://github.com/NasserAlbusaidi/einsteins-travel-bureau"
            >
              Source on GitHub
            </a>
            <span className="mx-2 text-mist-500">·</span>
            Travel responsibly. Time is not refundable.
          </p>
        </div>
      </div>
    </footer>
  )
}
