import { useLayoutEffect, useRef } from 'react'

/** Survey footage with live fish tracking behind the lower half of the
 *  home page. It starts just above the folders and runs to the very
 *  bottom of the page (under the footer), fading in from the top so the
 *  intro stays clean. Where the folders sit depends on the screen, so
 *  the start line is measured rather than guessed.
 *
 *  offsetTop is in the page's own CSS pixels, so it stays correct under
 *  the large-screen zoom on .site (getBoundingClientRect would not). */
export function Sea() {
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const sea = ref.current
    const site = sea?.parentElement
    if (!sea || !site) return
    const place = () => {
      const folders = site.querySelector<HTMLElement>('.folders')
      if (!folders) return
      // walk up the offsetParent chain to get the folders' top within .site
      let top = 0
      for (let el: HTMLElement | null = folders; el && el !== site; el = el.offsetParent as HTMLElement | null) top += el.offsetTop
      sea.style.top = `${Math.max(0, top - 70)}px`
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(site)
    const home = site.querySelector('.home')
    if (home) ro.observe(home)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="sea" ref={ref} aria-hidden="true">
      {/* the 20 KB poster paints at once (it's preloaded from index.html);
          phones and tablets get a 540p encode at under half the size */}
      <video className="sea-video" autoPlay muted loop playsInline preload="auto" poster="/assets/video/posters/sea.jpg">
        <source src="/assets/video/sea-540.mp4" type="video/mp4" media="(max-width: 1100px)" />
        <source src="/assets/video/hero-bg.mp4" type="video/mp4" />
      </video>
      <p className="sea-caption">Underwater survey · automated fish tracking</p>
    </div>
  )
}
