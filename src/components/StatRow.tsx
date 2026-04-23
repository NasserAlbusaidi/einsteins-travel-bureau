import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  hint?: string
  accent?: boolean
}

export function StatRow({ label, value, hint, accent = false }: Props) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-slate-800/60 last:border-b-0">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
        {hint ? <div className="text-[11px] text-slate-600 mt-0.5">{hint}</div> : null}
      </div>
      <div
        className={`font-mono tabular-nums text-right ${
          accent ? 'text-lg text-cyan-300' : 'text-sm text-slate-200'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
