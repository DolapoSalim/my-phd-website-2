import { useRef } from 'react'
import { newsEntries, type NewsEntry } from '@/lib/content'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useCardTilt } from '@/hooks/useCardTilt'

function NewsItem({ entry }: { entry: NewsEntry }) {
  const ref = useRef<HTMLAnchorElement | null>(null)
  useReveal(ref)
  useCardTilt(ref)
  return (
    <a href={entry.url} target="_blank" rel="noreferrer" className="news-item" ref={ref}>
      <div className="news-date">{entry.date}</div>
      <div>
        <div className="news-title">{entry.title}</div>
        <div className="news-body">{entry.body}</div>
      </div>
      <div className="news-arrow">↗</div>
    </a>
  )
}

export function News() {
  return (
    <section id="news">
      <div className="container">
        <div className="sec-label">News &amp; Updates</div>
        <SectionTitle>Latest</SectionTitle>
        <p className="sec-sub">Research milestones, project updates, and field dispatches.</p>
        <div className="news-list">
          {newsEntries.map((entry) => (
            <NewsItem entry={entry} key={entry.title} />
          ))}
        </div>
      </div>
    </section>
  )
}
