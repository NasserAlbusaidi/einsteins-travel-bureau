import { useId } from 'react'
import type { BodyId } from '../../physics/bodies'

/**
 * Hand-drawn SVG for every place a traveller can go. `BodyShape` draws the body
 * centred on (0, 0) with radius `r`, for use inside a bigger scene; `BodyGlyph`
 * wraps it in its own little <svg> for tiles and buttons.
 */
export function BodyShape({ id, r }: { id: BodyId; r: number }) {
  const uid = useId().replace(/:/g, '')
  switch (id) {
    case 'earth':
      return <Earth r={r} uid={uid} />
    case 'sun':
      return <Sun r={r} uid={uid} />
    case 'white-dwarf':
      return <WhiteDwarf r={r} uid={uid} />
    case 'neutron-star':
      return <NeutronStar r={r} uid={uid} />
    case 'sgr-a':
      return <BlackHole r={r} uid={uid} variant="sgr" />
    case 'gargantua':
      return <BlackHole r={r} uid={uid} variant="gargantua" />
    case 'none':
      return <Galaxy r={r} uid={uid} />
  }
}

/** Visual radius each body gets inside a 100×100 glyph, tuned so they read as a family. */
const GLYPH_R: Record<BodyId, number> = {
  none: 34,
  earth: 30,
  sun: 26,
  'white-dwarf': 12,
  'neutron-star': 8,
  'sgr-a': 18,
  gargantua: 15,
}

export function BodyGlyph({ id, size = 48, className = '' }: { id: BodyId; size?: number; className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} className={className} aria-hidden>
      <BodyShape id={id} r={GLYPH_R[id]} />
    </svg>
  )
}

function Earth({ r, uid }: { r: number; uid: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`ea-${uid}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#6ec3ff" />
          <stop offset="0.55" stopColor="#2c6fc0" />
          <stop offset="1" stopColor="#123a73" />
        </radialGradient>
        <radialGradient id={`eg-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#4fd1c5" stopOpacity="0" />
          <stop offset="0.9" stopColor="#7fe3ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#4fd1c5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`et-${uid}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0.45" stopColor="#05070f" stopOpacity="0" />
          <stop offset="1" stopColor="#05070f" stopOpacity="0.75" />
        </linearGradient>
        <clipPath id={`ec-${uid}`}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.22} fill={`url(#eg-${uid})`} />
      <circle r={r} fill={`url(#ea-${uid})`} />
      {/* Clip first, then scale: the clip circle must stay in the body's own units. */}
      <g clipPath={`url(#ec-${uid})`}>
        <g fill="#5fbf7f" opacity="0.92" transform={`scale(${r / 50})`}>
          <path d="M-38 -22c8-10 22-14 30-8 6 4 2 12 8 16 7 5 4 14-4 16-9 2-10 12-18 12-6 0-6-8-10-12-6-6-12-14-6-24z" />
          <path d="M10 -40c10-4 24 0 30 8 4 6-2 10 2 16 4 7 0 14-8 12-6-2-8 4-14 2-8-3-4-12-10-16-6-5-8-16 0-22z" />
          <path d="M14 18c8-2 16 4 18 10 2 7-4 14-10 16-7 2-12-4-12-10 0-5-2-14 4-16z" />
          <ellipse cx="0" cy="-50" rx="26" ry="7" fill="#eef6ff" />
          <ellipse cx="0" cy="51" rx="30" ry="7" fill="#eef6ff" />
        </g>
      </g>
      <g clipPath={`url(#ec-${uid})`} fill="none" stroke="#fff" strokeOpacity="0.35" strokeLinecap="round">
        <path d={`M${-r * 0.8} ${-r * 0.1}q${r * 0.5} ${-r * 0.2} ${r * 1.1} ${r * 0.05}`} strokeWidth={r * 0.06} />
        <path d={`M${-r * 0.5} ${r * 0.45}q${r * 0.4} ${-r * 0.15} ${r * 0.9} 0`} strokeWidth={r * 0.05} />
      </g>
      <circle r={r} fill={`url(#et-${uid})`} />
    </g>
  )
}

function Sun({ r, uid }: { r: number; uid: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`sc-${uid}`}>
          <stop offset="0.3" stopColor="#ffb347" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff7b2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sb-${uid}`} cx="0.4" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.35" stopColor="#ffd56b" />
          <stop offset="0.8" stopColor="#ff9a3c" />
          <stop offset="1" stopColor="#e8611f" />
        </radialGradient>
      </defs>
      <circle r={r * 1.9} fill={`url(#sc-${uid})`} />
      <g stroke="#ffc861" strokeOpacity="0.5" strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={-r * 1.12}
            x2="0"
            y2={-r * (i % 2 ? 1.35 : 1.55)}
            strokeWidth={r * 0.05}
            transform={`rotate(${i * 22.5})`}
          />
        ))}
      </g>
      <circle r={r} fill={`url(#sb-${uid})`} />
      <g fill="#e8611f" opacity="0.35">
        <circle cx={r * 0.3} cy={-r * 0.2} r={r * 0.08} />
        <circle cx={r * 0.42} cy={-r * 0.1} r={r * 0.05} />
        <circle cx={-r * 0.35} cy={r * 0.35} r={r * 0.06} />
      </g>
    </g>
  )
}

function WhiteDwarf({ r, uid }: { r: number; uid: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`wg-${uid}`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#bfe3ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7fb6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={r * 3.4} fill={`url(#wg-${uid})`} />
      <g stroke="#dff1ff" strokeOpacity="0.7" strokeLinecap="round" strokeWidth={r * 0.14}>
        <line x1={-r * 2.6} y1="0" x2={r * 2.6} y2="0" />
        <line x1="0" y1={-r * 2.6} x2="0" y2={r * 2.6} />
      </g>
      <circle r={r} fill="#ffffff" />
    </g>
  )
}

function NeutronStar({ r, uid }: { r: number; uid: string }) {
  const beam = r * 5.5
  return (
    <g>
      <defs>
        <radialGradient id={`ng-${uid}`}>
          <stop offset="0" stopColor="#e9e2ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8c7bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`nb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7b8ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#c7b8ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="spin" style={{ animationDuration: '3s', transformBox: 'view-box', transformOrigin: '0 0' }}>
        <g transform="rotate(25)">
          <path d={`M0 0 L${-r * 1.1} ${-beam} L${r * 1.1} ${-beam} Z`} fill={`url(#nb-${uid})`} />
          <path d={`M0 0 L${-r * 1.1} ${-beam} L${r * 1.1} ${-beam} Z`} fill={`url(#nb-${uid})`} transform="rotate(180)" />
        </g>
      </g>
      <g fill="none" stroke="#a99bff" strokeOpacity="0.45" strokeWidth={r * 0.12}>
        <ellipse rx={r * 2.4} ry={r * 1.3} transform="rotate(25)" />
        <ellipse rx={r * 3.4} ry={r * 1.8} transform="rotate(25)" />
      </g>
      <circle r={r * 2.4} fill={`url(#ng-${uid})`} />
      <circle r={r} fill="#ffffff" />
    </g>
  )
}

function BlackHole({ r, uid, variant }: { r: number; uid: string; variant: 'sgr' | 'gargantua' }) {
  const warm = variant === 'gargantua'
  const hot = warm ? '#fff1c9' : '#ffd08a'
  const mid = warm ? '#f3b64e' : '#ff7b2e'
  const cool = warm ? '#b86a1e' : '#8f2a10'
  if (variant === 'sgr') {
    // The Event Horizon Telescope look: a lopsided glowing doughnut.
    return (
      <g>
        <defs>
          <radialGradient id={`hg-${uid}`}>
            <stop offset="0.45" stopColor={mid} stopOpacity="0" />
            <stop offset="0.62" stopColor={hot} stopOpacity="0.95" />
            <stop offset="0.75" stopColor={mid} stopOpacity="0.8" />
            <stop offset="1" stopColor={cool} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`hs-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#05070f" stopOpacity="0.55" />
            <stop offset="1" stopColor="#05070f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle r={r * 2.3} fill={`url(#hg-${uid})`} />
        <circle r={r * 2.3} fill={`url(#hs-${uid})`} />
        <circle r={r} fill="#000" />
      </g>
    )
  }
  // Gargantua: the Interstellar look. Disk behind, shadow, lensed halo, disk in front.
  return (
    <g>
      <defs>
        <radialGradient id={`hg-${uid}`}>
          <stop offset="0.3" stopColor={mid} stopOpacity="0.35" />
          <stop offset="1" stopColor={cool} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`hd-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={cool} stopOpacity="0" />
          <stop offset="0.2" stopColor={mid} />
          <stop offset="0.5" stopColor={hot} />
          <stop offset="0.8" stopColor={mid} />
          <stop offset="1" stopColor={cool} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle r={r * 3.2} fill={`url(#hg-${uid})`} />
      {/* Far side of the disk, bent up and over the shadow by gravity. */}
      <circle r={r * 1.28} fill="none" stroke={`url(#hd-${uid})`} strokeWidth={r * 0.32} opacity="0.9" />
      <ellipse rx={r * 3} ry={r * 0.42} fill="none" stroke={`url(#hd-${uid})`} strokeWidth={r * 0.22} opacity="0.6" />
      <circle r={r * 1.02} fill="#000" />
      <circle r={r * 1.06} fill="none" stroke={hot} strokeWidth={r * 0.05} opacity="0.9" />
      {/* Near side of the disk, in front of the shadow. */}
      <path
        d={`M${-r * 3} 0 A${r * 3} ${r * 0.42} 0 0 0 ${r * 3} 0`}
        fill="none"
        stroke={`url(#hd-${uid})`}
        strokeWidth={r * 0.3}
      />
    </g>
  )
}

function Galaxy({ r, uid }: { r: number; uid: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`gx-${uid}`}>
          <stop offset="0" stopColor="#fff3d6" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#c3b5ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3e4a83" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="rotate(-25) scale(1 0.45)">
        <circle r={r} fill={`url(#gx-${uid})`} />
        <g fill="none" stroke="#c3c9e6" strokeOpacity="0.5" strokeWidth={r * 0.05} strokeLinecap="round">
          <path d={`M0 0 C${r * 0.4} ${-r * 0.5} ${r * 0.9} ${-r * 0.2} ${r * 0.85} ${r * 0.25}`} />
          <path d={`M0 0 C${-r * 0.4} ${r * 0.5} ${-r * 0.9} ${r * 0.2} ${-r * 0.85} ${-r * 0.25}`} />
        </g>
      </g>
      <g fill="#f4ead4">
        <circle cx={-r * 0.7} cy={-r * 0.6} r={r * 0.04} />
        <circle cx={r * 0.65} cy={-r * 0.75} r={r * 0.03} />
        <circle cx={r * 0.8} cy={r * 0.6} r={r * 0.035} />
      </g>
    </g>
  )
}
