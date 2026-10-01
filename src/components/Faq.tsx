const QUESTIONS: readonly { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is this actually real, or just a sci-fi thing?',
    a: (
      <>
        Completely real, and measured many times. In 1971 physicists flew atomic clocks around the world on
        ordinary airliners and saw them fall out of step with clocks on the ground, by exactly the predicted
        amount. GPS satellites correct for it every day. Particle accelerators see fast-moving particles “live”
        far longer than slow ones.
      </>
    ),
  },
  {
    q: 'Why would moving fast slow down time?',
    a: (
      <>
        Light always travels at the same speed, no matter how fast you’re moving when you measure it. The only way
        that can be true for everyone at once is if distances and durations stretch depending on how you move. It
        sounds wrong because at everyday speeds the stretch is tiny.
      </>
    ),
  },
  {
    q: 'Why would gravity slow down time?',
    a: (
      <>
        Einstein’s big idea was that gravity isn’t really a force — it’s mass bending space <em>and</em> time
        around it. Near something heavy, time is “stretched”, so clocks there tick slower than clocks far away.
      </>
    ),
  },
  {
    q: 'Would I feel time slowing down?',
    a: (
      <>
        No. Everything on board slows down together — your watch, your heartbeat, your thoughts. One second still
        feels like one second. You only find out when you get back and compare.
      </>
    ),
  },
  {
    q: 'So in the twin paradox, why is the traveller the young one? Isn’t motion relative?',
    a: (
      <>
        From the traveller’s seat, Earth is the one moving away. But only the traveller turns around and comes
        back — they feel the engines fire and switch direction, while the twin at home never does. That breaks the
        symmetry, and the traveller ends up younger.
      </>
    ),
  },
  {
    q: 'Can I use this to go back in time?',
    a: <>No. Both effects only ever slow your clock down, so you can skip forward, never back. One-way tickets only.</>,
  },
  {
    q: 'Why can’t I just go faster than light?',
    a: (
      <>
        Each extra bit of speed costs more energy than the last, and getting all the way to light speed would take
        an infinite amount. That’s why the speed slider stops just short of 100%.
      </>
    ),
  },
  {
    q: 'How accurate are these numbers?',
    a: (
      <>
        The bureau uses Einstein’s real equations with 50-digit arithmetic — normal computer maths can’t see
        effects this small. It does simplify: it ignores the time spent speeding up and turning around, and it
        doesn’t check whether your speed would actually keep you in orbit. Open “Show the math” on any boarding
        pass to see every step.
      </>
    ),
  },
]

export function Faq() {
  return (
    <div className="grid gap-3 lg:grid-cols-2 items-start">
      {QUESTIONS.map(({ q, a }) => (
        <details key={q} className="group panel !rounded-2xl open:shadow-glow transition-shadow">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4">
            <span className="font-display text-lg sm:text-xl text-cream leading-snug">{q}</span>
            <span
              className="grid place-items-center w-8 h-8 shrink-0 rounded-full ring-1 ring-gold/50 text-gold-300 font-mono text-lg group-open:rotate-45 group-open:bg-gold group-open:text-night-900 transition-all"
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="px-5 pb-5 -mt-1 text-mist-200 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  )
}
