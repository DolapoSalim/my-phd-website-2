import type { CSSProperties } from 'react'
import {
  BookOpen,
  Bookmark,
  Clapperboard,
  Compass,
  Dumbbell,
  Gamepad2,
  Heart,
  Joystick,
  HeartPulse,
  Library,
  Lightbulb,
  Mail,
  MessageCircleHeart,
  Mic,
  Music,
  Palette,
  PenLine,
  PenTool,
  Piano,
  Shapes,
  Sprout,
  Timer,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { isVideo, type InterestArtwork, type InterestEntry } from '@/lib/content'

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
  gaming: [
    { icon: Trophy, bg: '#f4c95d', fg: '#3b2a05' },
    { icon: Joystick, bg: '#5b4bd6', fg: '#efeaff' },
    { icon: Gamepad2, bg: '#15171c', fg: '#9ef0c2' },
  ],
  love: [
    { icon: Mail, bg: '#fde2e7', fg: '#8a1f3d' },
    { icon: MessageCircleHeart, bg: '#fff1a8', fg: '#7a4b00' },
    { icon: Heart, bg: '#e4405f', fg: '#fff0f3' },
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

/** A photo or a short looping clip, filling its cover/sheet. Videos with a
 *  poster show the still instead (lighter, and no black first frames). */
export function MediaThumb({ file, poster }: { file: string; poster?: string }) {
  if (poster) return <img src={poster} alt="" loading="lazy" decoding="async" />
  return isVideo(file) ? (
    <video src={file} muted autoPlay loop playsInline preload="metadata" />
  ) : (
    <img src={file} alt="" loading="lazy" decoding="async" />
  )
}

/** Three fanned covers. Added photos/videos sit on top (front first);
 *  any gap behind them is filled with the interest's drawn artwork. */
export function InterestCovers({ interest }: { interest: InterestEntry }) {
  const media = (interest.media ?? []).filter((m) => m.file).slice(0, 3)
  const art = (ARTWORK[interest.artwork] ?? ARTWORK.reading).slice(0, 3 - media.length)
  return (
    <div className="covers" aria-hidden="true">
      {art.map((c, i) => (
        <span className="cover" key={`art-${i}`}>
          <DrawnCoverFace cover={c} />
        </span>
      ))}
      {media
        .slice()
        .reverse()
        .map((m) => (
          <span className="cover" key={m.file}>
            <MediaThumb file={m.file} poster={m.poster} />
          </span>
        ))}
    </div>
  )
}
