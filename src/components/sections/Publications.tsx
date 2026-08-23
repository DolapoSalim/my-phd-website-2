import { useRef } from 'react'
import { publicationEntries, type PublicationEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useCardTilt } from '@/hooks/useCardTilt'

function PubCard({ entry }: { entry: PublicationEntry }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  useCardTilt(ref)
  return (
    <div className="pub" ref={ref}>
      <div className="pub-year">{entry.year}</div>
      <div>
        <div className="pub-type">{entry.type}</div>
        <div className="pub-title">{entry.title}</div>
        <div className="pub-authors">{richText(entry.authors)}</div>
        <div className="pub-journal">{entry.journal}</div>
        {entry.doiUrl && (
          <a href={entry.doiUrl} target="_blank" rel="noreferrer" className="pub-doi">
            DOI {entry.doi} ↗
          </a>
        )}
      </div>
    </div>
  )
}

export function Publications() {
  return (
    <section id="publications">
      <div className="container">
        <div className="sec-label">Publications</div>
        <SectionTitle>Research Output</SectionTitle>
        <p className="sec-sub">Peer-reviewed articles and conference contributions, newest first.</p>
        <div className="pub-list">
          {publicationEntries.map((entry) => (
            <PubCard entry={entry} key={entry.title} />
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <a href="https://www.researchgate.net/profile/Dolapo-Olatoye/research" target="_blank" rel="noreferrer" className="btn btn-ghost">
            Full list on ResearchGate ↗
          </a>
        </div>
      </div>
    </section>
  )
}
