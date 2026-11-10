import about from '@/content/site/about.json'
import hero from '@/content/site/hero.json'
import expertise from '@/content/site/expertise.json'
import { builtItems, skillGroupEntries, type BuiltItem } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead, SectionLabel } from '@/components/site/PageHead'
import { AnnotateVisual, DetectionVisual, QuadratVisual } from '@/components/site/ProjectVisual'


function ProjectCard({ item, index }: { item: BuiltItem; index: number }) {
  const text = `${item.title} ${item.desc}`
  const media = item.image ? (
    <img src={item.image} alt="" loading="lazy" />
  ) : /quadrat|cover/i.test(text) ? (
    <QuadratVisual />
  ) : /annotat|label/i.test(text) ? (
    <AnnotateVisual />
  ) : (
    <DetectionVisual />
  )
  const body = (
    <>
      <div className="project-media">{media}</div>
      <div className="project-copy">
        <p className="meta-row">
          <span>{item.kind}</span>
          <span>{item.meta}</span>
        </p>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <span className={`project-cta${item.url ? ' is-link' : ''}`}>{item.cta}</span>
      </div>
    </>
  )
  const style = { '--d': index + 2 } as React.CSSProperties
  return item.url ? (
    <a className="project-card card rise" href={item.url} target="_blank" rel="noreferrer" style={style}>
      {body}
    </a>
  ) : (
    <article className="project-card card rise" style={style}>
      {body}
    </article>
  )
}

export function Research() {
  return (
    <main className="page" id="content">
      <PageHead no="01" kicker="Research" title="Research & tools">
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

      <SectionLabel>Built &amp; deployed</SectionLabel>
      <div className="project-grid">
        {builtItems.map((item, i) => (
          <ProjectCard item={item} index={i} key={item.title} />
        ))}
      </div>

      <SectionLabel>Toolkit</SectionLabel>
      <div className="toolkit">
        {skillGroupEntries.map((g) => (
          <div className="toolkit-row rise" key={g.title}>
            <h3>{g.title}</h3>
            <ul>
              {g.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="page-foot rise">
        <a className="text-link" href={expertise.githubUrl} target="_blank" rel="noreferrer">
          More on GitHub ↗
        </a>
      </p>
    </main>
  )
}
