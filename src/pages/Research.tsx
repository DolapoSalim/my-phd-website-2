import about from '@/content/site/about.json'
import hero from '@/content/site/hero.json'
import research from '@/content/site/research.json'
import { researchProjectEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead, SectionLabel } from '@/components/site/PageHead'

export function Research() {
  return (
    <main className="page" id="content">
      <PageHead no="01" kicker="Research" title={research.heading}>
        <p>{richText(about.copy)}</p>
      </PageHead>

      <dl className="facts rise" style={{ '--d': 1 } as React.CSSProperties}>
        {hero.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      <SectionLabel>Projects</SectionLabel>
      <ol className="rp-list">
        {researchProjectEntries.map((p, i) => (
          <li className="rp card rise" key={p.title} style={{ '--d': i + 1 } as React.CSSProperties}>
            <p className="meta-row">
              <span>{p.years}</span>
              <span>{p.role}</span>
            </p>
            <h3>{p.title}</h3>
            <p className="rp-desc">{p.desc}</p>
            {p.url && (
              <a className="pill-link" href={p.url} target="_blank" rel="noreferrer">
                {p.urlLabel || 'Learn more'} ↗
              </a>
            )}
          </li>
        ))}
      </ol>

      <SectionLabel>Research interests</SectionLabel>
      <ul className="tag-cloud rise">
        {research.interests.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </main>
  )
}
