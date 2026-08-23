import { useRef } from 'react'
import { newsEntries, type NewsEntry } from '@/lib/content'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useCardTilt } from '@/hooks/useCardTilt'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function NewsItem({ entry }: { entry: NewsEntry }) {
  const ref = useRef<HTMLAnchorElement | null>(null)
  useReveal(ref)
  useCardTilt(ref)
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noreferrer"
      className={cn('news-item flex flex-col gap-2 rounded-xl bg-card/90 ring-1 ring-border/60 transition-colors hover:ring-border', 'h-full')}
      ref={ref}
    >
      <CardContent className="flex h-full flex-col gap-2 py-4">
        <Badge variant="outline" className="w-fit font-mono text-[var(--accent)] border-[var(--border2)]">
          {entry.date}
        </Badge>
        <div className="news-title">{entry.title}</div>
        <div className="news-body flex-1">{entry.body}</div>
        <div className="news-arrow self-end">↗</div>
      </CardContent>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsEntries.map((entry) => (
            <NewsItem entry={entry} key={entry.title} />
          ))}
        </div>
      </div>
    </section>
  )
}
