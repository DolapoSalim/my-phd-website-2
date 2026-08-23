import about from '@/content/site/about.json'
import { richText } from '@/lib/richtext'
import { Reveal } from '@/components/effects/Reveal'
import { SectionTitle } from '@/components/effects/SectionTitle'

export function About() {
  const [headingLine1, headingLine2] = about.heading.split('\n')

  return (
    <section id="about">
      <div className="container">
        <div className="about-grid">
          <Reveal>
            <div className="sec-label">About</div>
            <SectionTitle>
              {headingLine1}
              <br />
              {headingLine2}
            </SectionTitle>
            <div className="about-text">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{richText(p)}</p>
              ))}
            </div>
            <div className="about-actions">
              {about.links.map((l) => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  {l.label}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="award-block">
              <div className="award-label">Academic Awards</div>
              {about.awards.map((a, i) => (
                <div className="award-item" key={i}>
                  {richText(a)}
                </div>
              ))}
            </div>
            <div className="affils">
              <div className="sec-label" style={{ marginBottom: '0.7rem' }}>
                Affiliations
              </div>
              <div className="affil-row">
                {about.affiliations.map((a) => (
                  <div className="affil" key={a}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
