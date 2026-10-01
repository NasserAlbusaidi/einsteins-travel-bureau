import { useInView } from '../hooks/motion'

interface Props {
  children: React.ReactNode
  className?: string
  /** Stagger in milliseconds. */
  delay?: number
  as?: 'div' | 'li' | 'article'
}

/** Fades its children up the first time they scroll into view. */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: Props) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={`${seen ? 'reveal-in' : 'reveal'} ${className}`}
      style={{ '--delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
