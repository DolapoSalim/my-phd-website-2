import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Sitewide inertia scrolling (eased, weighted, rather than the native
 *  instant jump) - the page-level "scroll effect" pass, distinct from
 *  the per-element .fi/.vis reveal-on-enter treatment already on every
 *  section. Driven through GSAP's ticker and synced to ScrollTrigger so
 *  the existing scroll-triggered effects (SplitText's word reveal) stay
 *  perfectly in step with the smoothed position. Also takes over
 *  in-page anchor links (nav, "back to top", CTAs) so they ease to
 *  their target instead of jumping, offset for the fixed nav bar.
 *  Renders nothing - side-effect only. */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      anchors: { offset: -76 },
      // This site keeps decorative/interactive motion on regardless of
      // prefers-reduced-motion (see the reduced-motion-preference-
      // always-animate memory) - Lenis defaults to disabling itself
      // under that setting, so that default is overridden here.
      respectReducedMotion: false,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerFn)
      lenis.destroy()
    }
  }, [])

  return null
}
