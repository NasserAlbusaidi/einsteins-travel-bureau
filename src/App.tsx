import { HowItWorks } from './components/HowItWorks'
import { TripPicker } from './components/TripPicker'
import { TripControls } from './components/TripControls'
import { BoardingPass } from './components/BoardingPass'
import { MiniResult } from './components/MiniResult'
import { TimeMachine } from './components/TimeMachine'
import { Faq } from './components/Faq'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 flex flex-col gap-16 sm:gap-20">
        <Hero />

        <Section id="how" kicker="Before you book" title="How time travel works (the real kind)">
          <HowItWorks />
        </Section>

        <Section
          id="trips"
          kicker="Step 1"
          title="Pick a trip"
          intro="Every trip here is real physics. Some of them have actually happened."
        >
          <TripPicker />
        </Section>

        <Section
          id="your-trip"
          kicker="Step 2"
          title="See what happens to your clock"
          intro="Your boarding pass shows how much younger (or older) you come back — and why. Change anything you like."
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
            <div id="boarding-pass" className="scroll-mt-4 lg:order-2">
              <BoardingPass />
            </div>
            <div id="adjust" className="scroll-mt-4 lg:order-1 flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <TripControls />
              <MiniResult />
            </div>
          </div>
        </Section>

        <Section
          id="time-machine"
          kicker="Bonus"
          title="Time machine: book a one-way ticket to the future"
          intro="Tell us when you want to arrive and how long you’re willing to spend getting there. We’ll work out the trip."
        >
          <TimeMachine />
        </Section>

        <Section id="faq" kicker="Questions at the counter" title="Frequently asked questions">
          <Faq />
        </Section>
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper-light">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <BureauSeal />
          <span className="font-display text-lg sm:text-xl text-ink leading-tight">Einstein’s Travel Bureau</span>
        </a>
        <nav aria-label="Sections" className="hidden md:flex items-center gap-5 text-[15px] font-semibold text-ink-light">
          <a href="#how" className="hover:text-terracotta-dark">How it works</a>
          <a href="#trips" className="hover:text-terracotta-dark">Trips</a>
          <a href="#time-machine" className="hover:text-terracotta-dark">Time machine</a>
          <a href="#faq" className="hover:text-terracotta-dark">FAQ</a>
        </nav>
        <a href="#trips" className="btn-primary md:hidden !py-1.5 !px-3 text-sm">
          Book a trip
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="pt-10 sm:pt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-ink-softer">
          Licensed since 1905 · Lightspeed never exceeded
        </div>
        <h1 className="font-display text-[44px] sm:text-6xl leading-[1.02] text-ink mt-3">
          Travel into the future.
          <br />
          <span className="text-terracotta">It’s real.</span>
        </h1>
        <p className="text-lg sm:text-xl text-ink-light mt-5 max-w-2xl leading-relaxed">
          Einstein worked out that time doesn’t pass at the same speed for everyone. Move fast enough, or sit close
          enough to something heavy, and your clock slows down. Come home, and everyone else is older than you.
        </p>
        <p className="text-lg text-ink-light mt-3 max-w-2xl">
          Pick a trip and we’ll show you exactly how much — with the real maths, in plain English.
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <a href="#trips" className="btn-primary text-lg">Pick a trip →</a>
          <a href="#how" className="btn-secondary text-lg">How does this work?</a>
        </div>
      </div>
      <ol className="paper-card p-5 sm:p-6 flex flex-col gap-4" aria-label="How to use the bureau">
        <HeroStep n={1} title="Pick a trip" text="From a long-haul flight to a black hole." />
        <HeroStep n={2} title="Adjust it" text="How fast, near what, and for how long." />
        <HeroStep n={3} title="Get your boarding pass" text="How much younger you come back, and why." />
      </ol>
    </section>
  )
}

function HeroStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="step-dot mt-0.5" aria-hidden>{n}</span>
      <span>
        <span className="block font-display text-xl text-ink">{title}</span>
        <span className="block text-ink-light">{text}</span>
      </span>
    </li>
  )
}

function Section(props: { id: string; kicker: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={props.id} className="scroll-mt-4 flex flex-col gap-6" aria-labelledby={`${props.id}-title`}>
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-terracotta-dark">{props.kicker}</div>
        <h2 id={`${props.id}-title`} className="font-display text-3xl sm:text-[40px] leading-tight text-ink mt-1">
          {props.title}
        </h2>
        {props.intro ? <p className="text-lg text-ink-light mt-2 max-w-3xl">{props.intro}</p> : null}
      </div>
      {props.children}
    </section>
  )
}

function BureauSeal() {
  return (
    <span
      className="stamp-circle w-11 h-11 text-[6px] text-terracotta-dark border-terracotta-dark shrink-0"
      style={{ lineHeight: 1.1 }}
      aria-hidden
    >
      <span>E·T·B</span>
      <span className="font-display text-[14px]">γ</span>
      <span>1905</span>
    </span>
  )
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper-light">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between text-sm text-ink-softer flex-wrap gap-3">
        <div>Real physics: Einstein’s equations at 50-digit precision · constants from CODATA 2018 + IAU 2015.</div>
        <div className="font-display uppercase tracking-widest">No refunds beyond the event horizon.</div>
      </div>
    </footer>
  )
}
