import { CurvedLoop } from '@/components/effects/CurvedLoop'

interface MarqueeBandProps {
  items: string[]
}

/** Full-width CurvedLoop banner between About and Research, replacing
 *  the old CSS-scroll ticker. Always scrolling (per feedback, a small
 *  ambient loop like this should keep moving regardless of reduced-
 *  motion, same call as the hero video); dragging still works too. */
export function MarqueeBand({ items }: MarqueeBandProps) {
  return (
    <div className="marquee-band">
      <CurvedLoop marqueeText={items.join(' ✦ ')} className="marquee-loop-text" speed={1} curveAmount={12} viewBoxHeight={64} />
    </div>
  )
}
