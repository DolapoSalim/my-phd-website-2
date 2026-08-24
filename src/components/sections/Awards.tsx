import { useRef } from 'react'
import { awardEntries, type AwardEntry } from '@/lib/content'
import { SectionHeader } from '@/components/effects/SectionHeader'
import { useReveal } from '@/hooks/useReveal'

function AwardRow({ entry, index }: { entry: AwardEntry; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  return (
    <div className="award-row" ref={ref}>
      <span className="award-idx">{String(index + 1).padStart(2, '0')}</span>
      <h4 className="award-title">{entry.title}</h4>
      <div className="award-desc">{entry.desc}</div>
      <span className="award-year">{entry.year}</span>
    </div>
  )
}

export function Awards() {
  return (
    <section className="sect" id="awards">
      <SectionHeader
        index="05"
        label="Awards & grants"
        heading={
          <>
            Research <span>&amp;</span> academic awards
          </>
        }
        aside={<p style={{ maxWidth: '32ch', textAlign: 'right' }}>Competitive awards across three countries — doctoral funding, mobility grants and departmental prizes.</p>}
      />
      <div className="awards-list">
        {awardEntries.map((entry, i) => (
          <AwardRow entry={entry} index={i} key={entry.title} />
        ))}
      </div>
    </section>
  )
}
