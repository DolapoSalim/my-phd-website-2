import { skillGroupEntries } from '@/lib/content'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { Reveal } from '@/components/effects/Reveal'

export function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <div className="sec-label">Skills</div>
        <SectionTitle>Technical Expertise</SectionTitle>
        <p className="sec-sub">A cross-disciplinary stack spanning AI engineering and field marine science.</p>
        <div className="skills-layout">
          {skillGroupEntries.map((group, i) => (
            <Reveal as="div" className="sg" delay={i * 0.05} key={group.title}>
              <div className="sg-title">{group.title}</div>
              <div className="tags">
                {group.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
