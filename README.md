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

## What's inside

```
src/
├── physics/            ← the science (don't touch this for UI work)
│   ├── constants.ts      CODATA 2018 constants
│   ├── relativity.ts     γ, Schwarzschild radius, combined dilation
│   ├── scenarios.ts      7 real-world scenarios (GPS, ISS, twin paradox, …)
│   ├── solver.ts         closed-form inverse: "I want ratio X, find v or r"
│   └── *.test.ts         68 tests across 3 files
│
├── copy/               ← travel-bureau narrative layer
│   ├── destinations.ts   brochure blurbs + palette per scenario
│   └── funFacts.ts       delta-seconds → "you missed X World Cups"
│
├── components/         ← presentation layer
│   ├── DestinationPicker.tsx   7-card brochure grid
│   ├── BookingForm.tsx         reskinned sliders
│   ├── TripReport.tsx          boarding pass + headline + fun facts
│   ├── MathDrawer.tsx          collapsible: real formulas, real values
│   ├── CustomItinerary.tsx     solver as "Cruise Package vs. Gravity Resort"
│   ├── SpacetimeDiagram.tsx    SVG worldlines, paper-theme
│   ├── AgeChart.tsx            recharts aging timeline
│   ├── GammaReadout.tsx        γ coefficient card
│   ├── DominantBadge.tsx       stamp: Speed/Gravity/Balanced
│   ├── Stamp.tsx               reusable rubber-stamp component
│   └── LogSlider.tsx           log-scale Decimal slider
│
├── format.ts           human-readable formatters (time, mass, velocity, length)
├── store.ts            zustand: scenarioId + observer/trip state
├── App.tsx             4-section layout
└── index.css           paper-grain background, stamps, range inputs
```

## Design contract

**Two layers, clean seam.** The `physics/` folder knows nothing about travel agencies. The `copy/` and `components/` folders can be reskinned without touching a single formula. Change the theme, change the narrative — the numbers never move.

**Hard science stays visible.** The math drawer on every trip report exposes γ, β, r_s, the combined τ ratio equation, and every intermediate Decimal. No hand-waving. No rounding away the interesting bits.

**Headline adapts to the effect.**
- Big effect (twin paradox): *"You aged 4.233 years. Home aged 9.711 years."*
- Small effect (GPS, ISS): *"After 1 day, your clock runs 38.44 μs ahead of home."*

The switch happens when both values render to the same string at display precision.

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

Playground. Physics is real; UI is for fun.
