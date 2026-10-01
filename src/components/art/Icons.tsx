/** Line icons in the bureau's house style: 24×24, round caps, currentColor. */

type IconName =
  | 'rocket'
  | 'satellite'
  | 'station'
  | 'plane'
  | 'twins'
  | 'blackhole'
  | 'compass'
  | 'clock'
  | 'weight'
  | 'arrow'
  | 'link'
  | 'check'
  | 'sparkle'
  | 'globe'

interface Props {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 24, className = '', strokeWidth = 1.6 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}

const PATHS: Record<IconName, React.ReactNode> = {
  rocket: (
    <>
      <path d="M12 2.5c2.8 2.2 4.2 5.4 4.2 9.3v3.7H7.8v-3.7c0-3.9 1.4-7.1 4.2-9.3z" />
      <circle cx="12" cy="9.3" r="1.7" />
      <path d="M7.8 12.6 5 15.4v3.1l2.8-1.4M16.2 12.6l2.8 2.8v3.1l-2.8-1.4" />
      <path d="M10.2 18.2c0 1.6.8 2.6 1.8 3.4 1-.8 1.8-1.8 1.8-3.4" />
    </>
  ),
  satellite: (
    <>
      <rect x="9.5" y="9" width="5" height="6" rx="1" />
      <path d="M2.5 10.2h5v3.6h-5zM16.5 10.2h5v3.6h-5zM5 10.2v3.6M19 10.2v3.6M7.5 12h2M14.5 12h2" />
      <path d="M12 9V6.5M10 5.5a2.8 2.8 0 0 0 4 0" />
    </>
  ),
  station: (
    <>
      <path d="M2.5 12h19" />
      <path d="M4.5 4.5h4v5h-4zM4.5 14.5h4v5h-4zM15.5 4.5h4v5h-4zM15.5 14.5h4v5h-4z" />
      <rect x="9.6" y="10" width="4.8" height="4" rx="1" />
    </>
  ),
  plane: (
    <path d="M12 2.5c.8 0 1.4.8 1.4 2v4.6l7.6 4.6v2l-7.6-2.4v4.2l2.4 1.9v1.6L12 20l-3.8 1v-1.6l2.4-1.9v-4.2L3 15.7v-2l7.6-4.6V4.5c0-1.2.6-2 1.4-2z" />
  ),
  twins: (
    <>
      <circle cx="8" cy="7.5" r="2.8" />
      <circle cx="16" cy="7.5" r="2.8" />
      <path d="M3 20c0-3.4 2.2-6 5-6s5 2.6 5 6M11 20c0-3.4 2.2-6 5-6s5 2.6 5 6" />
    </>
  ),
  blackhole: (
    <>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-14 12 12)" />
      <circle cx="12" cy="12" r="6" strokeDasharray="1.5 2.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" />
    </>
  ),
  weight: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12c3 2 6 3 9.5 3s6.5-1 9.5-3M5 6.5c2 1.3 4.4 2 7 2s5-.7 7-2" />
    </>
  ),
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0L5 13.3A4 4 0 0 0 10.7 19l1-1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.6 2.6 3.8 5.8 3.8 9.5s-1.2 6.9-3.8 9.5c-2.6-2.6-3.8-5.8-3.8-9.5s1.2-6.9 3.8-9.5z" />
    </>
  ),
}

export type { IconName }
