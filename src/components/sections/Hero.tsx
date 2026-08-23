import hero from '@/content/site/hero.json'
import { richText } from '@/lib/richtext'
import { MarineCanvas } from '@/components/effects/MarineCanvas'
import { FishCursor } from '@/components/effects/FishCursor'
import { HeroNameReveal } from '@/components/effects/HeroNameReveal'
import { MagneticButton } from '@/components/effects/MagneticButton'

function Profile() {
  return (
    <div className="profile-img-wrap">
      <img
        src={hero.profileImage}
        alt={hero.profileName}
        onError={(e) => {
          const wrap = e.currentTarget.parentElement as HTMLElement
          wrap.style.background = 'var(--surface2)'
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}

export function Hero() {
  return (
    <section id="hero">
      <MarineCanvas />
      <FishCursor />

      <div className="container">
        <div className="hero-wrap">
          <div>
            <div className="hero-kicker">
              <span className="dot-live"></span>
              {hero.kicker}
            </div>
            <HeroNameReveal>
              {hero.nameLine1}
              <br />
              <em>{hero.nameLine2}</em>
            </HeroNameReveal>
            <p className="hero-tagline">{richText(hero.tagline)}</p>
            <p className="hero-bio">{richText(hero.bio)}</p>
            <div className="hero-ctas">
              {hero.ctas.map((cta) => (
                <MagneticButton
                  key={cta.label}
                  href={cta.url}
                  target={cta.url.startsWith('#') ? undefined : '_blank'}
                  className={`btn ${cta.style === 'fill' ? 'btn-fill' : 'btn-ghost'}`}
                >
                  {cta.label}
                </MagneticButton>
              ))}
            </div>

            <div className="hero-profile-mobile">
              <Profile />
              <div className="profile-meta">
                {hero.meta.map((m) => (
                  <div className="meta-row" key={m.label}>
                    {m.label} <span>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <Profile />
            <div className="profile-meta">
              {hero.meta.map((m) => (
                <div className="meta-row" key={m.label}>
                  {m.label} <span>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
