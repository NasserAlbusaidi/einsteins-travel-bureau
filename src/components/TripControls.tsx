import Decimal from 'decimal.js'
import { useStore } from '../store'
import { BODY_IDS, getBody } from '../physics/bodies'
import { heightOf } from '../trip'
import { durationScale, logScale, speedScale } from '../scales'
import { DURATION_LANDMARKS, PLACES, SPEED_LANDMARKS } from '../copy/places'
import { durationText, humanDistance, humanSpeed, moonTripAt } from '../humanize'
import { ScaleSlider } from './ScaleSlider'

/** The four knobs: how fast, near what, how high, how long. */
export function TripControls() {
  const trip = useStore((s) => s.trip)
  const setSpeed = useStore((s) => s.setSpeed)
  const setPlace = useStore((s) => s.setPlace)
  const setHeight = useStore((s) => s.setHeight)
  const setDuration = useStore((s) => s.setDuration)

  const body = getBody(trip.place)
  const place = PLACES[trip.place]
  const height = heightOf(trip)
  const isHole = body.kind === 'black-hole'
  // Black holes have no surface to stand on, so the height slider starts at 1 m.
  const heightScale = logScale(new Decimal(1), body.maxHeight, isHole ? 0 : 0.03)
  const moon = moonTripAt(trip.speed)

  return (
    <div className="paper-card p-5 sm:p-6 flex flex-col gap-7">
      <div>
        <h3 className="font-display text-2xl text-ink">Adjust the trip</h3>
        <p className="text-ink-light mt-1">
          Drag anything. The boarding pass updates instantly.
        </p>
      </div>

      <Step n={1} title="How fast are you going?">
        <ScaleSlider
          label="Speed"
          value={trip.speed}
          scale={speedScale}
          onChange={setSpeed}
          readout={capitalise(humanSpeed(trip.speed))}
          hint={moon ? `At this speed you'd reach the Moon in ${moon}.` : 'Not moving at all.'}
          landmarks={SPEED_LANDMARKS}
        />
      </Step>

      <Step n={2} title="What are you near?">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Place">
          {BODY_IDS.map((id) => {
            const p = PLACES[id]
            const active = id === trip.place
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPlace(id)}
                className={`place-tile ${active ? 'place-tile-active' : ''}`}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {p.emoji}
                </span>
                <span className="text-sm font-semibold leading-tight">{p.name}</span>
              </button>
            )
          })}
        </div>
        <p className="text-sm text-ink-light">{place.blurb}</p>
        {body.kind !== 'empty' ? (
          <ScaleSlider
            label={place.heightLabel}
            value={height}
            scale={heightScale}
            onChange={setHeight}
            readout={height.isZero() ? 'On the surface' : humanDistance(height)}
            hint={
              isHole
                ? `The edge itself is ${humanDistance(body.floorRadius)} from the centre. Get closer, and time slows to a crawl.`
                : undefined
            }
            landmarks={place.heightLandmarks}
          />
        ) : null}
      </Step>

      <Step n={3} title="How long are you away?">
        <ScaleSlider
          label="Time that passes back home"
          value={trip.duration}
          scale={durationScale}
          onChange={setDuration}
          readout={durationText(trip.duration)}
          landmarks={DURATION_LANDMARKS}
        />
      </Step>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 min-w-0">
      <legend className="flex items-center gap-2.5 mb-3">
        <span className="step-dot" aria-hidden>
          {n}
        </span>
        <span className="font-display text-xl text-ink">{title}</span>
      </legend>
      {children}
    </fieldset>
  )
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
