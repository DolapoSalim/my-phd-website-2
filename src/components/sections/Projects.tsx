import { useRef } from 'react'
import { projectEntries, type ProjectEntry } from '@/lib/content'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useScrollStack } from '@/hooks/useScrollStack'
import { useGithubStars } from '@/hooks/useGithubStars'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const GITHUB_USERNAME = 'DolapoSalim'

function ProjItem({ entry, enrichment }: { entry: ProjectEntry; enrichment: ReturnType<typeof useGithubStars> extends (n: string) => infer R ? R : never }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  const url = enrichment?.url ?? entry.url

  return (
    <Card className="proj-item flex-row items-start gap-4 border-border/60 bg-card/90 p-5" ref={ref}>
      <div className="proj-year shrink-0">{entry.year}</div>
      <CardContent className="flex-1 px-0">
        <div className="proj-title !mb-2">{entry.name}</div>
        <div className="proj-desc">{entry.desc}</div>
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <Badge key={t} variant="outline" className="h-auto rounded-full px-2.5 py-0.5 text-[0.72rem] font-normal">
              {t}
            </Badge>
          ))}
          {enrichment && enrichment.stars > 0 && (
            <Badge variant="secondary" className="h-auto rounded-full px-2.5 py-0.5 text-[0.72rem] text-[var(--gold)]">
              ★ {enrichment.stars}
            </Badge>
          )}
        </div>
      </CardContent>
      <Button asChild size="icon-sm" variant="outline" className="rounded-full shrink-0" aria-label={`View ${entry.name}`}>
        <a href={url} target="_blank" rel="noreferrer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </Button>
    </Card>
  )
}

export function Projects() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const getEnrichment = useGithubStars(GITHUB_USERNAME)
  useScrollStack(wrapRef, [projectEntries.length])

  return (
    <section id="projects">
      <div className="container">
        <div className="sec-label">Projects</div>
        <SectionTitle>Code &amp; Repositories</SectionTitle>
        <p className="sec-sub">Tools, pipelines, and experiments in computer vision and marine data science.</p>
        <div ref={wrapRef}>
          <div className="scroll-stack-inner" id="projectsList">
            {projectEntries.map((entry) => (
              <ProjItem entry={entry} enrichment={getEnrichment(entry.name)} key={entry.name} />
            ))}
          </div>
          <div className="scroll-stack-end"></div>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noreferrer">
              View all on GitHub ↗
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
