import { useEffect, useRef } from 'react'

/** Replaces the system pointer with a small swimming fish (ported from
 *  the legacy site's fish cursor, scoped there to just the hero -
 *  here it runs sitewide) that lags toward the real cursor and rotates
 *  to face its direction of travel, puffing up gold over any element
 *  carrying data-magnetic (which also gets the physical magnetic pull
 *  toward the cursor). Fine-pointer only; respects prefers-reduced-
 *  motion. Hidden over The Stack, which has its own TargetCursor
 *  (see StackCursorZone) via the body.stack-cursor-active class. */
export function CustomCursor() {
  const fishRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    if (reduced || !fine) return

    const fish = fishRef.current
    if (!fish) return

    document.body.classList.add('dc-nocursor')

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const target = { x: pos.x, y: pos.y }
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
        fish.classList.add('active')
      }
    }
    const onLeave = () => {
      active = false
      fish.classList.remove('active')
    }

    const tick = () => {
      const dx = target.x - pos.x
      const dy = target.y - pos.y
      pos.x += dx * 0.18
      pos.y += dy * 0.18

      const speed = Math.hypot(dx, dy)
      if (speed > 0.6) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI)
        let diff = targetAngle - angle
        diff = (((diff + 180) % 360) + 360) % 360 - 180
        angle += diff * 0.18
      }

      const scale = fish.classList.contains('hover') ? 1.35 : 1
      fish.style.transform = `translate(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px) translate(-50%,-50%) rotate(${angle.toFixed(1)}deg) scale(${scale})`
      rafId = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    rafId = requestAnimationFrame(tick)

    const hot = Array.from(document.querySelectorAll<HTMLElement>('a, [data-magnetic]'))
    const cleanups: Array<() => void> = []
    hot.forEach((el) => {
      const enter = () => fish.classList.add('hover')
      const move = (e: MouseEvent) => {
        if (!el.hasAttribute('data-magnetic')) return
        const s = parseFloat(el.getAttribute('data-magnetic') || '')
        const k = isNaN(s) ? 0.28 : s
        if (k <= 0) return
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * k
        const dy = (e.clientY - (r.top + r.height / 2)) * k
        el.style.transition = 'transform 0.35s cubic-bezier(.2,.7,.2,1)'
        el.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`
      }
      const leave = () => {
        fish.classList.remove('hover')
        if (el.hasAttribute('data-magnetic')) el.style.transform = 'translate(0,0)'
      }
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mousemove', move)
      el.addEventListener('mouseleave', leave)
      cleanups.push(() => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
      })
    })

    return () => {
      document.body.classList.remove('dc-nocursor')
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <div id="fish-cursor" ref={fishRef} aria-hidden="true">
      <svg viewBox="-16 -8 32 16" width="32" height="16">
        <path className="fc-body" d="M9 0 C4 -7 -7 -5.5 -11 -0.5 C-7 5.5 4 7 9 0 Z" />
        <path className="fc-tail" d="M-11 -0.5 C-14 -3.5 -16 -3 -16 -3 C-15 -1 -15 1 -16 3 C-16 3 -14 3.5 -11 0.5 Z" />
        <circle className="fc-eye" cx="5.5" cy="-1.2" r="0.9" />
      </svg>
    </div>
  )
}
