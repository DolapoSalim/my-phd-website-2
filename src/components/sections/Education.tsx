import { useRef } from 'react'
import { educationEntries, type EducationEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'

function TlItem({ entry }: { entry: EducationEntry }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  return (
    <div className="tl-item" ref={ref}>
      <div className="tl-year">{entry.years}</div>
      <div className="tl-degree">{entry.degree}</div>
      <div className="tl-inst">{entry.institution}</div>
      <div className="tl-note">{richText(entry.note)}</div>
    </div>
  )
}

export function Education() {
  return (
    <section id="education">
      <div className="container">
        <div className="sec-label">Education</div>
        <SectionTitle>Academic Journey</SectionTitle>
        <p className="sec-sub">From Nigeria to Italy — building the interdisciplinary foundation for AI-driven marine science.</p>
        <div className="tl" id="diveTimeline">
          <div className="tl-progress" id="diveProgress"></div>
          {educationEntries.map((entry) => (
            <TlItem entry={entry} key={entry.degree} />
          ))}
        </div>
      </div>
    </section>
  )
}
