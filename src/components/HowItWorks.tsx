import { DemoClock } from './DemoClock'

/** The whole idea in three cards. No equations. */
export function HowItWorks() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Rule
          n="Rule 1"
          title="Moving fast slows your clock."
          demo={
            <>
              <DemoClock period={4} label="Standing still" tone="blue" />
              <DemoClock period={8} label="Moving at 87% of light speed" tone="terracotta" />
            </>
          }
        >
          The faster you travel, the slower time passes for you compared with people standing still. At car or
          plane speeds the difference is billionths of a second. Close to the speed of light, it’s years.
        </Rule>
        <Rule
          n="Rule 2"
          title="Heavy things slow time down."
          demo={
            <>
              <DemoClock period={4} label="Far from everything" tone="blue" />
              <DemoClock period={8} label="Right next to a black hole" tone="terracotta" />
            </>
          }
        >
          The closer you are to something massive — a planet, a star, a black hole — the slower your clock runs.
          Even on Earth, your feet age a tiny bit slower than your head.
        </Rule>
        <Rule
          n="The catch"
          title="It only goes one way."
          demo={
            <div className="font-display text-4xl text-ink tracking-tight" aria-hidden>
              now <span className="text-terracotta">→</span> later
            </div>
          }
        >
          You can skip ahead into the future, but you can never come back. And you won’t feel a thing: your watch,
          your heartbeat and your thoughts all slow down together. You only notice when you compare clocks with
          someone who stayed behind.
        </Rule>
      </div>

      <div className="paper-card px-5 py-4 flex gap-4 items-start">
        <span className="text-3xl leading-none" aria-hidden>
          📍
        </span>
        <p className="text-ink">
          <strong>Is this real? Yes.</strong> The GPS satellites behind the map on your phone have to correct for
          both rules every single day. Without that fix, your location would drift by about 10 km a day. Every
          number on this page comes from Einstein’s actual equations.
        </p>
      </div>
    </div>
  )
}

function Rule(props: { n: string; title: string; demo: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="paper-card p-5 flex flex-col gap-3">
      <div className="text-sm font-semibold uppercase tracking-wider text-terracotta-dark">{props.n}</div>
      <h3 className="font-display text-2xl text-ink leading-tight">{props.title}</h3>
      <div className="flex items-center justify-center gap-6 py-2 min-h-[100px]">{props.demo}</div>
      <p className="text-ink-light">{props.children}</p>
    </article>
  )
}
