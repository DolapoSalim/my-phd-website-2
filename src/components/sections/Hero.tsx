import hero from '@/content/site/hero.json'
import { richText } from '@/lib/richtext'
import { MarineCanvas } from '@/components/effects/MarineCanvas'
import { FishCursor } from '@/components/effects/FishCursor'
import { HeroNameReveal } from '@/components/effects/HeroNameReveal'
import { MagneticButton } from '@/components/effects/MagneticButton'
import StarBorder from '@/components/reactbits/StarBorder'
import DecryptedText from '@/components/reactbits/DecryptedText'
import GlareHover from '@/components/reactbits/GlareHover'

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
      <GlareHover
        width="100%"
        height="100%"
        background="transparent"
        borderColor="transparent"
        borderRadius="16px"
        glareColor="#c9aa6e"
        glareOpacity={0.3}
        glareAngle={-30}
        glareSize={220}
        transitionDuration={900}
        className="absolute inset-0 z-[3] cursor-default"
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
              <DecryptedText
                text={hero.kicker}
                animateOn="view"
                sequential
                revealDirection="center"
                speed={28}
                encryptedClassName="text-[var(--text3)] opacity-70"
              />
            </div>
            <HeroNameReveal>
              {hero.nameLine1}
              <br />
              <em>{hero.nameLine2}</em>
            </HeroNameReveal>
            <p className="hero-tagline">{richText(hero.tagline)}</p>
            <p className="hero-bio">{richText(hero.bio)}</p>
            <div className="hero-ctas">
              {hero.ctas.map((cta) =>
                cta.style === 'star' ? (
                  <StarBorder
                    key={cta.label}
                    as="a"
                    href={cta.url}
                    target={cta.url.startsWith('#') ? undefined : '_blank'}
                    color="#c9aa6e"
                    speed="4s"
                    thickness={2}
                  >
                    {cta.label}
                  </StarBorder>
                ) : (
                  <MagneticButton
                    key={cta.label}
                    href={cta.url}
                    target={cta.url.startsWith('#') ? undefined : '_blank'}
                    className={`btn ${cta.style === 'fill' ? 'btn-fill' : 'btn-ghost'}`}
                  >
                    {cta.label}
                  </MagneticButton>
                ),
              )}
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
