import { useMemo } from 'react'
import Decimal from 'decimal.js'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import type { DilationResult } from '../physics/types'
import { JULIAN_YEAR_SECONDS, DAY_SECONDS } from '../physics/constants'

interface Props {
  result: DilationResult
}

export function AgeChart({ result }: Props) {
  const { unit, divisor, label } = pickUnit(result.referenceProperTime)
  const data = useMemo(() => {
    const pts: { ref: number; home: number; traveler: number }[] = []
    const n = 40
    for (let i = 0; i <= n; i++) {
      const frac = i / n
      const refElapsed = result.referenceProperTime.times(frac)
      const travElapsed = result.travelerProperTime.times(frac)
      const refVal = refElapsed.div(divisor).toNumber()
      const travVal = travElapsed.div(divisor).toNumber()
      pts.push({ ref: refVal, home: refVal, traveler: travVal })
    }
    return pts
  }, [result, divisor])

  return (
    <div className="paper-card bg-paper-light p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="font-display text-sm uppercase tracking-widest text-ink">
            Years Accumulated ({unit})
          </div>
          <div className="text-[10px] text-ink-softer italic">
            Slope difference is the whole story — divergence = dilation.
          </div>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid stroke="#c9b584" strokeOpacity={0.4} />
            <XAxis
              dataKey="ref"
              type="number"
              domain={['dataMin', 'dataMax']}
              stroke="#6c7a8f"
              tick={{ fill: '#425066', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              label={{
                value: `Home-clock time (${label})`,
                position: 'insideBottom',
                offset: -8,
                fill: '#6c7a8f',
                fontSize: 11,
                fontFamily: 'Space Grotesk',
              }}
            />
            <YAxis
              stroke="#6c7a8f"
              tick={{ fill: '#425066', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              label={{
                value: `Age (${label})`,
                angle: -90,
                position: 'insideLeft',
                fill: '#6c7a8f',
                fontSize: 11,
                fontFamily: 'Space Grotesk',
              }}
            />
            <Tooltip
              contentStyle={{
                background: '#f8f0dc',
                border: '2px solid #1a2332',
                borderRadius: 2,
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
                color: '#1a2332',
              }}
              labelStyle={{ color: '#425066' }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 12,
                paddingTop: 8,
                fontFamily: 'Space Grotesk',
                color: '#425066',
              }}
            />
            <Line
              type="linear"
              dataKey="home"
              stroke="#2c4c7c"
              strokeWidth={2.5}
              dot={false}
              name="Home"
            />
            <Line
              type="linear"
              dataKey="traveler"
              stroke="#b5482d"
              strokeWidth={2.5}
              dot={false}
              name="Traveler"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function pickUnit(totalSeconds: Decimal): { unit: string; divisor: Decimal; label: string } {
  const abs = totalSeconds.abs()
  if (abs.gte(JULIAN_YEAR_SECONDS)) {
    return { unit: 'years', divisor: JULIAN_YEAR_SECONDS, label: 'yr' }
  }
  if (abs.gte(DAY_SECONDS)) {
    return { unit: 'days', divisor: DAY_SECONDS, label: 'days' }
  }
  if (abs.gte(3600)) {
    return { unit: 'hours', divisor: new Decimal(3600), label: 'hr' }
  }
  return { unit: 'seconds', divisor: new Decimal(1), label: 's' }
}
