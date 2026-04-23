# Einstein's Travel Bureau

> Relativistic Itineraries & Bespoke Expeditions.
> Licensed since 1905 · Lightspeed never exceeded, always approached.

A high-precision time-dilation sandbox disguised as a vintage cosmic travel agency. Every control is a booking form. Every result is a boarding pass. The real physics lives one click away under **How the Trip Was Calculated**.

Built with Vite · React 19 · TypeScript · Tailwind · decimal.js at 50-digit precision.

## Run it

```bash
npm install
npm run dev        # → http://localhost:5173
npm run typecheck
npm test           # 68 physics tests
npm run build
```

## What you can do

**Book a preset trip.** Seven curated destinations — GPS orbit, the ISS, a Pacific flight, twin paradox to Alpha Centauri, Miller's planet, Hail Mary at 0.92c, Scott Kelly's year in orbit. Each one is a real, tested physical scenario.

**Tweak any parameter.** Every slider on the booking form is live. Adjust velocity, altitude, gravity well, or trip duration — the trip report recomputes on every keystroke.

**Drag the spacetime diagram.** The traveler's worldline endpoint is a handle. Grab it, slide it horizontally, watch velocity change everywhere in sync. Works on mouse and touch.

**Fork a trip.** Any configuration can be frozen into a fork. Keep tweaking the live itinerary while a second column shows the snapshot you walked away from — plus a **Δ of Δ** readout telling you exactly how much your changes moved the outcome.

**Share a link.** The full state lives in the URL hash. Copy-paste the address, send it to anyone, and they open to the same configuration. "Stamp & Share" in the boarding pass header does the copying for you.

**Design your own.** Dial in any settings you like, then the "Design Your Own" card in the destination grid captures them as a named brochure with your chosen hazard level and palette. Saved to localStorage, reusable across sessions.

**Run the Laboratory.** Section V is a multi-observer workbench: place 1–5 observers in a common gravity well, each with their own velocity/radius sliders, watch an animated clock race and a proper-time bar chart show how their wristwatches diverge. No trip, no destination — pure physics playground.

**Solve backwards.** The Custom Itinerary Builder takes "1 of my years = X years back home" and hands you two ways to get there: cruise at a specific speed, or loiter at a specific altitude above a chosen mass.

## What's inside

```
src/
├── physics/                  ← the science (don't touch this for UI work)
│   ├── constants.ts          CODATA 2018 + IAU 2015 constants
│   ├── relativity.ts         γ, Schwarzschild radius, combined dilation
│   ├── scenarios.ts          7 real-world scenarios
│   ├── solver.ts             closed-form inverse: "I want ratio X, find v or r"
│   └── *.test.ts             68 tests across 3 files
│
├── copy/                     ← travel-bureau narrative layer
│   ├── destinations.ts       brochure blurbs + palette per scenario
│   └── funFacts.ts           delta-seconds → "you missed X World Cups"
│
├── components/               ← presentation layer
│   ├── SpaceMap.tsx            vintage wall-chart of all destinations
│   ├── DestinationPicker.tsx   brochure grid + "Design Your Own" card
│   ├── BookingForm.tsx         reskinned sliders
│   ├── TripReport.tsx          boarding pass, headline, fun facts, share/fork
│   ├── MathDrawer.tsx          collapsible: real formulas, real values
│   ├── CustomItinerary.tsx     solver as "Cruise Package vs. Gravity Resort"
│   ├── Laboratory.tsx          multi-observer workbench + clock race
│   ├── SpacetimeDiagram.tsx    SVG worldlines, paper-theme, draggable handle
│   ├── AgeChart.tsx            recharts aging timeline
│   ├── GammaReadout.tsx        γ coefficient card
│   ├── DominantBadge.tsx       stamp: Speed/Gravity/Balanced
│   ├── Stamp.tsx               reusable rubber-stamp component
│   └── LogSlider.tsx           log-scale Decimal slider
│
├── customBrochures.ts        localStorage store for user-designed brochures
├── format.ts                 human-readable formatters (γ, time, mass, …)
├── store.ts                  zustand + URL hash sync
├── App.tsx                   bureau layout: map → picker → booking → lab
└── index.css                 paper-grain background, stamps, range inputs
```

## Design contract

**Two layers, clean seam.** The `physics/` folder knows nothing about travel agencies. The `copy/` and `components/` folders can be reskinned without touching a single formula. Change the theme, change the narrative — the numbers never move.

**Hard science stays visible.** The math drawer on every trip report exposes γ, β, r_s, the combined τ ratio equation, and every intermediate Decimal. No hand-waving. No rounding away the interesting bits — including a `formatGamma` that surfaces "1 + 3.336e-10" instead of flattening everyday speeds to "1.000000".

**Headline adapts to the effect.**
- Big effect (twin paradox): *"You aged 4.233 years. Home aged 9.711 years."*
- Small effect (GPS, ISS): *"After 1 day, your clock runs 38.44 μs ahead of home."*

The switch happens when both values render to the same string at display precision.

**URL is the source of truth.** Any observable parameter change writes to `window.location.hash`. On load, the hash hydrates the store. Back/forward navigation works. Shareable deep-links include custom brochures.

## Scenarios

| id | package | hazard | expected |
|---|---|---|---|
| `gps` | Low-Orbit Express | SAFE | +38 μs/day (satellite runs fast) |
| `iss` | Orbital Weekender | CAUTION | −25 μs/day (astronaut loses time) |
| `scott-kelly` | Year-Long Orbital Retreat | CAUTION | −8 ms over 340 days |
| `flight` | Pacific Business Class | SAFE | +tens of ns on SF→Tokyo |
| `twin-paradox` | Alpha Centauri Round-Trip | EXTREME | 4.23 yr younger after 9.71 yr home |
| `millers-planet` | Gargantua Resort & Spa | FATAL | 1 hr there = 7 yr outside |
| `hail-mary` | Hail Mary Cruise | EXTREME | 3.92 yr per 10 Earth years at 0.92c |

Add one by appending to `SCENARIOS` in `physics/scenarios.ts` *and* `DESTINATIONS` in `copy/destinations.ts`.

## Status

Playground. Physics is real; UI is for fun. No refunds beyond the event horizon.
