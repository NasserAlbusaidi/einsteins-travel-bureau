import { useStore } from '../store'
import { BODY_IDS, getBody } from '../physics/bodies'
import { heightOf } from '../trip'
import { durationScale, heightScale, speedScale } from '../scales'
import { DURATION_LANDMARKS, PLACES, SPEED_LANDMARKS } from '../copy/places'
import { durationText, humanDistance, humanSpeed, moonTripAt } from '../humanize'
import { ScaleSlider } from './ScaleSlider'
import { BodyGlyph } from './art/Bodies'

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
  const moon = moonTripAt(trip.speed)

  return (
    <div className="panel p-5 sm:p-7 flex flex-col gap-8">
      <Step n={1} title="How fast are you going?">
        <ScaleSlider
          label="Speed"
          value={trip.speed}
          scale={speedScale}
          onChange={setSpeed}
          readout={capitalise(humanSpeed(trip.speed))}
          hint={moon ? `Fast enough to reach the Moon in ${moon}.` : 'Not moving at all.'}
          landmarks={SPEED_LANDMARKS}
        />
      </Step>

      <Step n={2} title="What are you near?">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2" role="radiogroup" aria-label="Place">
          {BODY_IDS.map((id) => {
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
                <BodyGlyph id={id} size={40} />
                <span className="text-[11px] sm:text-xs font-medium leading-tight">{PLACES[id].name}</span>
              </button>
            )
          })}
        </div>
        <p className="text-sm text-mist-300">{place.blurb}</p>
        {body.kind !== 'empty' ? (
          <ScaleSlider
            label={place.heightLabel}
            value={height}
            scale={heightScale(body)}
            onChange={setHeight}
            readout={height.isZero() ? 'On the surface' : humanDistance(height)}
            hint={
              isHole
                ? `The edge itself is ${humanDistance(body.floorRadius)} from the centre. Get closer and time slows to a crawl.`
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
      <legend className="flex items-center gap-3 mb-3">
        <span
          className="grid place-items-center w-8 h-8 rounded-full ring-1 ring-gold/60 font-display text-gold-300 text-lg"
          aria-hidden
        >
          {n}
        </span>
        <span className="font-display text-2xl text-cream">{title}</span>
      </legend>
      {children}
    </fieldset>
  )
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
