import { useEffect, type RefObject } from 'react'

/** As the page scrolls through the Projects section, each `.proj-item`
 *  pins in place, shrinks slightly, and the next card slides over it —
 *  a deck of cards dealt down the page. Driven by native window scroll
 *  (no smooth-scroll library). Ported 1:1 from initScrollStack; the
 *  ReactBits ScrollStack component was tried first but pulls in Lenis
 *  (which hijacks page-wide scroll physics) and assumes fixed-height
 *  cards, neither of which fit these CMS-driven variable-length cards. */
export function useScrollStack(containerRef: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const container = containerRef.current
    if (!container) return

    const cards = Array.from(container.querySelectorAll<HTMLElement>('.proj-item'))
    const endEl = container.querySelector<HTMLElement>('.scroll-stack-end')
    if (!cards.length || !endEl) return

    const itemStackDistance = 22
    const itemScale = 0.025
    const baseScale = 0.9
    const blurAmount = 1.1
    const stackPositionRatio = 0.16
    const scaleEndRatio = 0.06

    function clampProgress(scrollTop: number, start: number, end: number) {
      if (scrollTop < start) return 0
      if (scrollTop > end) return 1
      return (scrollTop - start) / (end - start)
    }

    let ticking = false

    function update() {
      const vh = window.innerHeight
      const stackPositionPx = vh * stackPositionRatio
      const scaleEndPositionPx = vh * scaleEndRatio
      const scrollTop = window.scrollY
      const endTop = endEl!.getBoundingClientRect().top + window.scrollY

      let topCardIndex = 0
      cards.forEach((card, j) => {
        const jTop = card.getBoundingClientRect().top + window.scrollY
        const jTriggerStart = jTop - stackPositionPx - itemStackDistance * j
        if (scrollTop >= jTriggerStart) topCardIndex = j
      })

      cards.forEach((card, i) => {
        const cardTop = card.getBoundingClientRect().top + window.scrollY
        const triggerStart = cardTop - stackPositionPx - itemStackDistance * i
        const triggerEnd = cardTop - scaleEndPositionPx
        const pinStart = triggerStart
        const pinEnd = endTop - vh / 2

        const scaleProgress = clampProgress(scrollTop, triggerStart, triggerEnd)
        const targetScale = baseScale + i * itemScale
        const scale = 1 - scaleProgress * (1 - targetScale)

        let blur = 0
        if (i < topCardIndex) blur = (topCardIndex - i) * blurAmount

        let translateY = 0
        if (scrollTop >= pinStart && scrollTop <= pinEnd) {
          translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i
        }

        card.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
        card.style.filter = blur > 0 ? `blur(${blur.toFixed(1)}px)` : ''
        card.style.zIndex = String(100 + i)
      })

      ticking = false
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
