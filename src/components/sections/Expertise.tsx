import { useRef, type RefObject } from 'react'
import expertise from '@/content/site/expertise.json'
import { skillGroupEntries } from '@/lib/content'
import { SectionHeader } from '@/components/effects/SectionHeader'
import { useReveal } from '@/hooks/useReveal'

function BuiltCard({ item }: { item: (typeof expertise.built)[number] }) {
  const ref = useRef<HTMLElement | null>(null)
  useReveal(ref)
  const content = (
    <>
      <div className="built-card-top">
        <span>{item.kind}</span>
        <span className="sub">{item.meta}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
      <span className="built-card-cta">{item.cta}</span>
    </>
  )
  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" data-magnetic="1" className="built-card" ref={ref as RefObject<HTMLAnchorElement>}>
        {content}
      </a>
    )
  }
  return (
    <div className="built-card" ref={ref as RefObject<HTMLDivElement>}>
      {content}
    </div>
  )
}

function StackGroup({ index, group }: { index: number; group: (typeof skillGroupEntries)[number] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)
  return (
    <div className="stack-group" ref={ref}>
      <div className="stack-group-head">
        <span className="n">{String(index + 1).padStart(2, '0')}</span>
        <span className="label">{group.title}</span>
      </div>
      <div className="stack-tags">
        {group.tags.map((t) => (
          <span className="stack-tag" key={t}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Expertise() {
  return (
    <section className="sect" id="software">
      <SectionHeader
        index="06"
        label="Technical expertise"
        heading={expertise.heading}
        aside={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '18px', maxWidth: '34ch' }}>
            <p style={{ textAlign: 'right' }}>{expertise.sub}</p>
            <a href={expertise.githubUrl} target="_blank" rel="noreferrer" data-magnetic="1" style={{ borderBottom: '1px solid var(--accent)', color: 'var(--accent)', paddingBottom: '5px', fontFamily: 'var(--sans-ui)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              github.com/DolapoSalim ↗
            </a>
          </div>
        }
      />

      <div className="rule-label">
        <span>Built &amp; deployed</span>
        <span className="rule" />
      </div>
      <div className="card-grid">
        {expertise.built.map((item) => (
          <BuiltCard item={item} key={item.title} />
        ))}
      </div>

      <div className="rule-label" style={{ marginTop: '64px', paddingTop: '36px', borderTop: '1px solid var(--border2)' }}>
        <span>The stack</span>
        <span className="rule" />
      </div>
      <div className="stack-grid">
        {skillGroupEntries.map((group, i) => (
          <StackGroup index={i} group={group} key={group.title} />
        ))}
      </div>
    </section>
  )
}
