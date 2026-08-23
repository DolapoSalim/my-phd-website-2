import { useEffect, useRef } from 'react'

/** Replaces the system pointer with a small swimming fish while inside
 *  #hero. Position is lerped toward the real cursor each frame, and the
 *  sprite rotates to face its direction of travel. Hovering a link/button
 *  puffs it up and shifts it gold. Ported 1:1 from initFishCursor. */
export function FishCursor() {
  const fcRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fc = fcRef.current
    const hero = document.getElementById('hero')
    if (!hero || !fc) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const pos = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let angle = 0
    let active = false
    let rafId = 0

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!active) {
        pos.x = target.x
        pos.y = target.y
        active = true
        fc.classList.add('fc-active')
      }
    }
    const onLeave = () => {
      active = false
      fc.classList.remove('fc-active')
    }

    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)

    const hoverables = hero.querySelectorAll('a, button, .btn')
    const onEnter = () => fc.classList.add('fc-hover')
    const onHoverLeave = () => fc.classList.remove('fc-hover')
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onHoverLeave)
    })

    function tick() {
      const dx = target.x - pos.x,
        dy = target.y - pos.y
      pos.x += dx * 0.18
      pos.y += dy * 0.18

      const speed = Math.hypot(dx, dy)
      if (speed > 0.6) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI)
        let diff = targetAngle - angle
        diff = (((diff + 180) % 360) + 360) % 360 - 180
        angle += diff * 0.18
      }

      fc!.style.left = pos.x + 'px'
      fc!.style.top = pos.y + 'px'
      if (!fc!.classList.contains('fc-hover')) {
        fc!.style.transform = `translate(-50%,-50%) rotate(${angle.toFixed(1)}deg)`
      } else {
        fc!.style.transform = `translate(-50%,-50%) rotate(${angle.toFixed(1)}deg) scale(1.35)`
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
      hoverables.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onHoverLeave)
      })
    }
  }, [])

  return (
    <div id="fish-cursor" ref={fcRef} aria-hidden="true">
      <svg viewBox="-16 -8 32 16" width="32" height="16">
        <path className="fc-body" d="M9 0 C4 -7 -7 -5.5 -11 -0.5 C-7 5.5 4 7 9 0 Z" />
        <path className="fc-tail" d="M-11 -0.5 C-14 -3.5 -16 -3 -16 -3 C-15 -1 -15 1 -16 3 C-16 3 -14 3.5 -11 0.5 Z" />
        <circle className="fc-eye" cx="5.5" cy="-1.2" r="0.9" />
      </svg>
    </div>
  )
}
