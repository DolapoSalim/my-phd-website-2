import cvDemo from '@/content/site/cv-demo.json'
import { richText } from '@/lib/richtext'
import { Reveal } from '@/components/effects/Reveal'
import { WavesBackground } from '@/components/effects/WavesBackground'

export function CvDemo() {
  const [headingLine1, headingLine2] = cvDemo.heading.split('\n')

  return (
    <section id="cv-demo">
      <WavesBackground />
      <div className="container">
        <div className="sec-label">Computer Vision in Action</div>
        <div className="demo-grid">
          <Reveal className="demo-text">
            <h3>
              {headingLine1}
              <br />
              {headingLine2}
            </h3>
            {cvDemo.paragraphs.map((p, i) => (
              <p key={i}>{richText(p)}</p>
            ))}
            <div className="demo-tags">
              {cvDemo.tags.map((t) => (
                <span className="demo-tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="demo-video-wrap">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                src={cvDemo.video}
                onError={(e) => {
                  const wrap = e.currentTarget.parentElement as HTMLElement
                  wrap.innerHTML = '<div style="padding:3rem;text-align:center;color:var(--text3);font-size:0.85rem">Place demo.mp4 in assets/video/</div>'
                }}
              />
              <div className="demo-overlay">
                <div className="demo-badge">{cvDemo.badge}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
