import about from '@/content/site/about.json'
import { richText } from '@/lib/richtext'
import { SplitText } from '@/components/effects/SplitText'

export function About() {
  return (
    <section className="sect" id="about">
      <SplitText
        tag="p"
        className="about-copy"
        splitType="words"
        from={{ opacity: 0, y: 14 }}
        to={{ opacity: 1, y: 0 }}
        duration={0.6}
        delay={14}
        ease="power3.out"
        threshold={0.2}
        rootMargin="-80px"
        textAlign="justify"
      >
        {richText(about.copy)}
      </SplitText>
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
