import { CurvedLoop } from '@/components/effects/CurvedLoop'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MarqueeBandProps {
  items: string[]
}

/** Full-width CurvedLoop banner between About and Research, replacing
 *  the old CSS-scroll ticker. Auto-scroll pauses for
 *  prefers-reduced-motion; dragging still works either way. */
export function MarqueeBand({ items }: MarqueeBandProps) {
  const reduced = useReducedMotion()
  return (
    <div className="marquee-band">
      <CurvedLoop marqueeText={items.join(' ✦ ')} className="marquee-loop-text" speed={reduced ? 0 : 1.1} curveAmount={64} />
    </div>
  )
}
