import { useRef } from 'react'
import { projectEntries, type ProjectEntry } from '@/lib/content'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { useReveal } from '@/hooks/useReveal'
import { useScrollStack } from '@/hooks/useScrollStack'
import { useGithubStars } from '@/hooks/useGithubStars'

const GITHUB_USERNAME = 'DolapoSalim'

function ProjItem({ entry, enrichment }: { entry: ProjectEntry; enrichment: ReturnType<typeof useGithubStars> extends (n: string) => infer R ? R : never }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  const url = enrichment?.url ?? entry.url

  return (
    <div className="proj-item" ref={ref}>
      <div className="proj-year">{entry.year}</div>
      <div className="proj-body">
        <div className="proj-title">
          <span className="proj-icon"></span>
          {entry.name}
        </div>
        <div className="proj-desc">{entry.desc}</div>
        <div className="proj-tags">
          {entry.tags.map((t) => (
            <span className="ptag" key={t}>
              •{t}{' '}
            </span>
          ))}
        </div>
        {enrichment && enrichment.stars > 0 && <span className="proj-stars">★ {enrichment.stars}</span>}
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="proj-link" aria-label={`View ${entry.name}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
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
          <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noreferrer" className="btn btn-ghost">
            View all on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  )
}
