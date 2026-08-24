import { useEffect, useRef } from 'react'
import hero from '@/content/site/hero.json'
import { richText } from '@/lib/richtext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTheme } from '@/hooks/useTheme'
import { WarpText } from '@/components/effects/WarpText'

const NAME_COLOR = { dark: '#f3f2f2', light: '#17140f' } as const

export function Hero() {
  const bgRef = useRef<HTMLDivElement | null>(null)
  const nameRef = useRef<HTMLHeadingElement | null>(null)
  const reduced = useReducedMotion()
  const { theme } = useTheme()

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY || 0
        if (nameRef.current) nameRef.current.style.transform = `translate3d(0,${(y * -0.13).toFixed(2)}px,0)`
        if (bgRef.current) bgRef.current.style.transform = `translate3d(0,${(y * 0.24).toFixed(2)}px,0)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  return (
    <section id="top">
      <div id="hero-bg" ref={bgRef}>
        <video className="hero-bg-video" autoPlay muted loop playsInline preload="auto">
          <source src="/assets/video/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero-bg-tint" />
        <div className="hero-bg-glow" />
      </div>

      <div className="hero-kicker-row">
        <span className="idx">01</span>
        <span className="rule" />
        <span>{hero.kicker}</span>
        <span className="status">
          <span className="dot-live" />
          {hero.status}
        </span>
      </div>

      <h1 className="hero-name" ref={nameRef}>
        <WarpText
          text={`${hero.nameLine1}\n${hero.nameLine2}`}
          color={NAME_COLOR[theme]}
          fontFamily="Archivo, Helvetica, sans-serif"
          fontWeight={600}
          fontSize="clamp(4rem, 14vw, 15rem)"
          letterSpacing="-0.045em"
          lineHeight={0.86}
          textAlign="left"
          warpStrength={0.06}
          warpScale={1.4}
          speed={0.4}
          pointerInfluence={0.36}
          pointerStrength={0.3}
          refraction={0.014}
          style={{ height: 'clamp(170px, 27vw, 430px)' }}
        />
      </h1>

      <div className="hero-facts">
        <p className="hero-tagline">{richText(hero.tagline)}</p>
        <div className="hero-table">
          {hero.facts.map((f) => (
            <div className="hero-table-row" key={f.label}>
              <span className="k">{f.label}</span>
              <span className="v">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-cta-row">
        <div className="hero-ctas">
          {hero.ctas.map((cta) => (
            <a
              key={cta.label}
              href={cta.url}
              target={cta.url.startsWith('#') ? undefined : '_blank'}
              rel={cta.url.startsWith('#') ? undefined : 'noreferrer'}
              data-magnetic="1"
              className={`btn ${cta.style === 'fill' ? 'btn-fill' : 'btn-ghost'}`}
            >
              {cta.label}
            </a>
          ))}
        </div>
        <div className="hero-scroll">
          Scroll
          <span className="line" />
        </div>
      </div>
    </section>
  )
}
