import type { ReactNode } from 'react'

interface SectionHeaderProps {
  index: string
  label: string
  heading: ReactNode
  aside?: ReactNode
}

/** The repeating "01 — Label" kicker + big Archivo heading pattern used
 *  to open every numbered section (Research, Publications, CV, Awards,
 *  Expertise) in the reference design, with an optional right-aligned
 *  aside (a short blurb or a link). */
export function SectionHeader({ index, label, heading, aside }: SectionHeaderProps) {
  return (
    <header className="sec-header">
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
