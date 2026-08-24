import { useRef } from 'react'
import about from '@/content/site/about.json'
import { richText } from '@/lib/richtext'
import { useReveal } from '@/hooks/useReveal'

export function About() {
  const ref = useRef<HTMLParagraphElement | null>(null)
  useReveal(ref)

  return (
    <section className="sect" id="about">
      <p className="about-copy fi" ref={ref}>
        {richText(about.copy)}
      </p>
      <div className="about-stats">
        {about.stats.map((s) => (
          <div className="about-stat" key={s.label}>
            <div className="about-stat-num">{s.value}</div>
            <div>
              <div className="about-stat-label">{s.label}</div>
              <div className="about-stat-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
