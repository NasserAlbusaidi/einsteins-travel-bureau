import { Stamp } from './Stamp'

interface Props {
  effect: 'velocity' | 'gravity' | 'balanced'
}

const CONFIG: Record<Props['effect'], { label: string; color: 'red' | 'blue' | 'green' | 'ink' | 'terracotta' }> = {
  velocity: { label: 'Speed-Driven', color: 'terracotta' },
  gravity: { label: 'Gravity-Driven', color: 'blue' },
  balanced: { label: 'Balanced', color: 'ink' },
}

export function DominantBadge({ effect }: Props) {
  const { label, color } = CONFIG[effect]
  return (
    <Stamp color={color} rotate={4}>
      {label}
    </Stamp>
  )
}
