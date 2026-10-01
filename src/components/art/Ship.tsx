import { useId } from 'react'

/** The bureau's rocket liner, side-on, nose to the right, in a 120×40 box. */
export function ShipShape() {
  const uid = useId().replace(/:/g, '')
  return (
    <g>
      <defs>
        <linearGradient id={`hull-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset="1" stopColor="#c9bc9d" />
        </linearGradient>
        <linearGradient id={`flame-${uid}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="0.5" stopColor="#ff7b54" />
          <stop offset="1" stopColor="#ff7b54" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M2 20 L26 14 L26 26 Z" fill={`url(#flame-${uid})`} />
      <path d="M26 12 h48 c18 0 34 4 42 8 c-8 4 -24 8 -42 8 h-48 z" fill={`url(#hull-${uid})`} />
      <path d="M38 12 l-8 -9 h12 l10 9 z M38 28 l-8 9 h12 l10 -9 z" fill="#ff7b54" />
      <circle cx="90" cy="20" r="3.4" fill="#1b2550" stroke="#e3b04b" strokeWidth="1.2" />
      <circle cx="78" cy="20" r="3.4" fill="#1b2550" stroke="#e3b04b" strokeWidth="1.2" />
      <path d="M26 20 h88" stroke="#b88a2c" strokeWidth="0.8" />
    </g>
  )
}

export function Ship({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden>
      <ShipShape />
    </svg>
  )
}
