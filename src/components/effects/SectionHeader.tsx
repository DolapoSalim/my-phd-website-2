import { useRef, type ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface SectionHeaderProps {
  index: string
  label: string
  heading: ReactNode
  aside?: ReactNode
}

/** The repeating "01 — Label" kicker + big Archivo heading pattern used
 *  to open every numbered section (News, Publications, CV, Awards,
 *  Expertise) in the reference design, with an optional right-aligned
 *  aside (a short blurb or a link). Fades/slides in on scroll like the
 *  rest of each section's content. */
export function SectionHeader({ index, label, heading, aside }: SectionHeaderProps) {
  const ref = useRef<HTMLElement | null>(null)
  useReveal(ref)

  return (
    <header className="sec-header fi" ref={ref}>
      <div>
        <div className="sec-kicker">
          <span className="idx">{index}</span>
          <span className="rule" />
          <span>{label}</span>
        </div>
        <h2 className="sec-heading">{heading}</h2>
      </div>
      {aside}
    </header>
  )
}
