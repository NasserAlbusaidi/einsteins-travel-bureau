import { DestinationPicker } from './components/DestinationPicker'
import { BookingForm } from './components/BookingForm'
import { TripReport } from './components/TripReport'
import { CustomItinerary } from './components/CustomItinerary'
import { SpaceMap } from './components/SpaceMap'
import { Laboratory } from './components/Laboratory'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
        <SpaceMap />

        <DestinationPicker />

        <div id="booking-form" className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-8 scroll-mt-6">
          <BookingForm />
          <TripReport />
        </div>

        <CustomItinerary />

        <Laboratory />
      </main>

      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper-light">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          <BureauSeal />
          <div>
            <div className="font-display text-[11px] tracking-[0.35em] uppercase text-ink-softer">
              Einstein's Travel Bureau
            </div>
            <div className="font-display text-3xl md:text-4xl leading-none text-ink">
              Relativistic Itineraries &amp; Bespoke Expeditions
            </div>
            <div className="text-xs text-ink-light italic mt-1">
              Licensed since 1905 · Lightspeed never exceeded, always approached
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="stamp-rect text-stamp-blue border-stamp-blue">Office Hours · Always Open</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-softer">
            Today's quote: c = 299,792,458 m/s
          </span>
        </div>
      </div>
    </header>
  )
}

function BureauSeal() {
  return (
    <div
      className="stamp-circle w-20 h-20 text-[8px] text-terracotta-dark border-terracotta-dark"
      style={{ lineHeight: 1.1 }}
    >
      <div className="mt-1">E · T · B</div>
      <div className="font-display text-[16px] tracking-tight">γ</div>
      <div className="mb-1">est 1905</div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper-light">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-ink-softer flex-wrap gap-3">
        <div>
          Physics engine: decimal.js @ 50-digit precision · constants from CODATA 2018 + IAU 2015.
        </div>
        <div className="font-display uppercase tracking-widest">
          No refunds beyond the event horizon.
        </div>
      </div>
    </footer>
  )
}
