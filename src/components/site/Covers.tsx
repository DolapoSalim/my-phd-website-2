import type { CSSProperties } from 'react'
import {
  BookOpen,
  Bookmark,
  Clapperboard,
  Compass,
  Dumbbell,
  HeartPulse,
  Library,
  Lightbulb,
  Mic,
  Music,
  Palette,
  PenLine,
  PenTool,
  Piano,
  Shapes,
  Sprout,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import type { InterestArtwork, InterestEntry } from '@/lib/content'

interface DrawnCover {
  icon?: LucideIcon
  bg: string
  fg: string
  /** book = spine + title bars, keys = piano keyboard */
  pattern?: 'book' | 'keys'
}

/** Drawn stand-ins for each interest, used until photos are added in the
 *  CMS — three per interest, fanned like the reference site's book covers. */
const ARTWORK: Record<InterestArtwork, DrawnCover[]> = {
  reading: [
    { icon: Library, bg: '#e3c98f', fg: '#5a4524', pattern: 'book' },
    { icon: Bookmark, bg: '#b5562f', fg: '#fbe9dc', pattern: 'book' },
    { icon: BookOpen, bg: '#1f4e5a', fg: '#e6f2f0', pattern: 'book' },
  ],
  fitness: [
    { icon: Timer, bg: '#d9e4d3', fg: '#2c3b2f' },
    { icon: HeartPulse, bg: '#f08a4b', fg: '#fff4ea' },
    { icon: Dumbbell, bg: '#23302a', fg: '#e8f0e4' },
  ],
  content: [
    { icon: PenLine, bg: '#e7e3dc', fg: '#2a2a2a' },
    { icon: Mic, bg: '#f2c94c', fg: '#2b2410' },
    { icon: Clapperboard, bg: '#1d1f24', fg: '#f4f4f4' },
  ],
  piano: [
    { icon: Music, bg: '#efe7da', fg: '#2b2620' },
    { bg: '#fdfdfb', fg: '#111', pattern: 'keys' },
    { icon: Piano, bg: '#1c1c1c', fg: '#f1ece2' },
  ],
  growth: [
    { icon: Compass, bg: '#7fb7a3', fg: '#10302a' },
    { icon: Lightbulb, bg: '#f1e7c7', fg: '#4e4320' },
    { icon: Sprout, bg: '#2f5d46', fg: '#e6f3ea' },
  ],
  design: [
    { icon: Shapes, bg: '#f3d9c4', fg: '#5d3524' },
    { icon: PenTool, bg: '#23395d', fg: '#e5ecf7' },
    { icon: Palette, bg: '#e86f5c', fg: '#fff1ec' },
  ],
}

export function DrawnCoverFace({ cover }: { cover: DrawnCover }) {
  const Icon = cover.icon
  return (
    <span
      className={`cover-face${cover.pattern ? ` cover-${cover.pattern}` : ''}`}
      style={{ '--cover-bg': cover.bg, '--cover-fg': cover.fg } as CSSProperties}
    >
      {Icon && <Icon strokeWidth={1.6} />}
    </span>
  )
}

/** The front (top) drawn cover for an interest — used on the home folder. */
export function frontCover(artwork: InterestArtwork): DrawnCover {
  const set = ARTWORK[artwork] ?? ARTWORK.reading
  return set[set.length - 1]
}

/** Three fanned covers: the interest's photos if it has any, else its artwork. */
export function InterestCovers({ interest }: { interest: InterestEntry }) {
  const photos = (interest.images ?? []).map((i) => i.image).filter(Boolean).slice(0, 3)
  return (
    <div className="covers" aria-hidden="true">
      {photos.length
        ? photos.map((src) => (
            <span className="cover" key={src}>
              <img src={src} alt="" loading="lazy" />
            </span>
          ))
        : (ARTWORK[interest.artwork] ?? ARTWORK.reading).map((c, i) => (
            <span className="cover" key={i}>
              <DrawnCoverFace cover={c} />
            </span>
          ))}
    </div>
  )
}
