import { useEffect } from 'react'

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

/** Drives three continuous, scroll-linked effects themed around
 *  descending through ocean depth: a body-wide depth tint, per-paragraph
 *  "surfacing" sharpening on .about-text p, and the education timeline's
 *  "dive gauge" fill. Ported 1:1 from initScrollDepthEffects. */
export function useScrollDepthEffects() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function update() {
      const vh = window.innerHeight
      const docH = document.documentElement.scrollHeight - vh

      const pageProgress = docH > 0 ? clamp01(window.scrollY / docH) : 0
      document.body.style.setProperty('--depth', String(Math.pow(pageProgress, 0.7).toFixed(3)))

      document.querySelectorAll<HTMLElement>('.about-text p').forEach((p) => {
        const r = p.getBoundingClientRect()
        const bandTop = vh * 0.85
        const bandBottom = vh * 0.35
        const center = r.top + r.height / 2
        let t: number
        if (center >= bandTop) t = 0
        else if (center <= bandBottom) t = 1
        else t = (bandTop - center) / (bandTop - bandBottom)
        p.style.setProperty('--surface', t.toFixed(3))
      })

      const diveTrack = document.getElementById('diveTimeline')
      const diveBar = document.getElementById('diveProgress')
      if (diveTrack && diveBar) {
        const r = diveTrack.getBoundingClientRect()
        const start = vh * 0.8
        const end = r.height * 0.15
        const traveled = start - r.top
        const total = r.height - end + start
        const t = clamp01(traveled / Math.max(1, total))
        diveTrack.style.setProperty('--dive-progress', t.toFixed(3))
      }
    }

    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
}
