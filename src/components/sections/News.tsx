import { useRef } from 'react'
import { newsEntries, type NewsEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { SectionHeader } from '@/components/effects/SectionHeader'
import { useReveal } from '@/hooks/useReveal'

function NewsCard({ entry }: { entry: NewsEntry }) {
  const ref = useRef<HTMLElement | null>(null)
  useReveal(ref)
  return (
    <article className="article-card" ref={ref}>
      <div className="article-idx">
        <span>{entry.tag || 'Update'}</span>
        <span className="yr">{entry.date}</span>
      </div>
      <h3 className="article-title">{entry.title}</h3>
      <p className="article-body">{richText(entry.body)}</p>
      {entry.url && (
        <a href={entry.url} target="_blank" rel="noreferrer" data-magnetic="1" className="article-foot">
          {entry.urlLabel || 'Read more ↗'}
        </a>
      )}
    </article>
  )
}

export function News() {
  return (
    <section className="sect" id="news">
      <SectionHeader
        index="02"
        label="Notes & updates"
        heading="News"
        aside={<p style={{ maxWidth: '40ch' }}>Short updates on new tools, papers and conferences — posted as they happen.</p>}
      />
      <div className="card-grid">
        {newsEntries.map((entry) => (
          <NewsCard entry={entry} key={entry.title} />
        ))}
      </div>
    </section>
  )
}
