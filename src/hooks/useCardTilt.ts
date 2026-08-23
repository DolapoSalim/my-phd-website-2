import { useEffect, type RefObject } from 'react'

const MAX_TILT = 5 // degrees — kept gentle for a research site
const LIFT = -4 // px translateY on hover

/** Publication/news cards track the cursor: a soft radial glow follows
 *  the pointer (via --mx/--my, wired in CSS) and the card tilts gently
 *  in 3D toward the cursor position. Skipped for reduced-motion and
 *  touch pointers, same as the legacy initCardTilt. */
export function useCardTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = ref.current
    if (!card) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onEnter = () => {
      card.style.transition = 'border-color var(--t) var(--ease), box-shadow var(--t) var(--ease)'
    }
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty('--mx', `${x}px`)
      card.style.setProperty('--my', `${y}px`)

      const cx = x / rect.width - 0.5
      const cy = y / rect.height - 0.5
      const rotY = cx * MAX_TILT * 2
      const rotX = -cy * MAX_TILT * 2
      card.style.transform = `translateY(${LIFT}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
    }
    const onLeave = () => {
      card.style.transition = 'border-color var(--t) var(--ease), box-shadow var(--t) var(--ease), transform 0.4s var(--ease)'
      card.style.transform = ''
    }

    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}
