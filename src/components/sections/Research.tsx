import { useRef } from 'react'
import { researchEntries, type ResearchEntry } from '@/lib/content'
import { SectionHeader } from '@/components/effects/SectionHeader'
import { useReveal } from '@/hooks/useReveal'

function ResearchCard({ entry }: { entry: ResearchEntry }) {
  const ref = useRef<HTMLElement | null>(null)
  useReveal(ref)

  const body = (
    <>
      <div className="article-idx">
        <span>
          {String(entry.order).padStart(2, '0')} — {entry.kind}
        </span>
        <span className="yr">{entry.yearRange}</span>
      </div>
      <h3 className={`article-title ${entry.featured ? 'lg' : ''}`}>{entry.title}</h3>
      <div className="article-subtitle">{entry.subtitle}</div>
      <p className={`article-body ${entry.featured ? 'lg' : ''}`}>{entry.desc}</p>
      {entry.tags.length > 0 && (
        <div className="article-tags">
          {entry.tags.map((t) => (
            <span className="article-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      )}
      {entry.ctaLabel && (
        <a
          href={entry.ctaUrl}
          target="_blank"
          rel="noreferrer"
          data-magnetic="1"
          className={entry.featured ? 'btn btn-accent' : 'article-foot'}
          style={entry.featured ? { marginTop: '26px', width: 'fit-content' } : undefined}
        >
          {entry.ctaLabel}
        </a>
      )}
      {entry.foot && <div className="article-foot">{entry.foot}</div>}
    </>
  )

  if (entry.featured) {
    return (
      <article className="article-card featured" ref={ref}>
        <div>
          <div className="article-idx">
            <span>
              {String(entry.order).padStart(2, '0')} — {entry.kind}
            </span>
            <span className="yr">{entry.yearRange}</span>
          </div>
          <h3 className="article-title lg">{entry.title}</h3>
          <div className="article-subtitle" style={{ paddingTop: '12px' }}>
            {entry.subtitle}
          </div>
          {entry.ctaLabel && (
            <a href={entry.ctaUrl} target="_blank" rel="noreferrer" data-magnetic="1" className="btn btn-accent" style={{ marginTop: '26px' }}>
              {entry.ctaLabel}
            </a>
          )}
        </div>
        <div>
          <p className="article-body lg">{entry.desc}</p>
          {entry.tags.length > 0 && (
            <div className="article-tags">
              {entry.tags.map((t) => (
                <span className="article-tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="article-card" ref={ref}>
      {body}
    </article>
  )
}

export function Research() {
  return (
    <section className="sect" id="research">
      <SectionHeader
        index="02"
        label="Research areas & projects"
        heading={
          <>
            Projects <span>&amp;</span> tools
          </>
        }
        aside={
          <p style={{ maxWidth: '46ch' }}>
            Currently contributing to the EU Horizon projects <strong style={{ color: 'var(--text)' }}>BioEcoOcean</strong> and{' '}
            <strong style={{ color: 'var(--text)' }}>BioBoost+</strong> — all of it pointing at one question: what holds a marine community
            steady.
          </p>
        }
      />
      <div className="card-grid">
        {researchEntries.map((entry) => (
          <ResearchCard entry={entry} key={entry.title} />
        ))}
      </div>
    </section>
  )
}
