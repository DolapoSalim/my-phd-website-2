import { useRef } from 'react'
import { publicationEntries, type PublicationEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useCardTilt } from '@/hooks/useCardTilt'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function PubCard({ entry }: { entry: PublicationEntry }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  useCardTilt(ref)
  return (
    <Card className="pub border-border/60 bg-card/90" ref={ref}>
      <CardHeader className="flex-row items-center gap-2">
        <Badge variant="outline" className="font-mono text-[var(--accent)] border-[var(--border2)]">
          {entry.year}
        </Badge>
        <Badge variant="secondary" className="uppercase tracking-wide text-[0.68rem]">
          {entry.type}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="pub-title !mb-2">{entry.title}</div>
        <div className="pub-authors">{richText(entry.authors)}</div>
        <div className="pub-journal !mb-0">{entry.journal}</div>
      </CardContent>
      {entry.doiUrl && (
        <CardFooter className="border-t-0 bg-transparent pt-0">
          <Button asChild size="sm" variant="outline" className="rounded-full font-mono">
            <a href={entry.doiUrl} target="_blank" rel="noreferrer">
              DOI {entry.doi} ↗
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export function Publications() {
  return (
    <section id="publications">
      <div className="container">
        <div className="sec-label">Publications</div>
        <SectionTitle>Research Output</SectionTitle>
        <p className="sec-sub">Peer-reviewed articles and conference contributions, newest first.</p>
        <div className="flex flex-col gap-4">
          {publicationEntries.map((entry) => (
            <PubCard entry={entry} key={entry.title} />
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <a href="https://www.researchgate.net/profile/Dolapo-Olatoye/research" target="_blank" rel="noreferrer">
              Full list on ResearchGate ↗
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
