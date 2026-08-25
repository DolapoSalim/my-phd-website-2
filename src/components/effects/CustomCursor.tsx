import { useEffect, useRef } from 'react'

interface Bubble {
  x: number
  y: number
  r: number
  alpha: number
  drift: number
  age: number
}

/** Replaces the system pointer with a small swimming fish trailing a
 *  stream of bubbles (ported from the legacy site's #hero-only fish
 *  cursor, now running sitewide, with a canvas bubble trail added on
 *  top) - a nod to the marine-biologist-meets-AI theme. The fish lags
 *  toward the real cursor and rotates to face its direction of travel,
 *  puffing up gold over any element carrying data-magnetic (which also
 *  gets the physical magnetic pull toward the cursor).
 *
 *  Uses (any-pointer: fine) rather than (pointer: fine) - hybrid touch
 *  + mouse laptops often report a coarse *primary* pointer even while
 *  a mouse is actively in use, which silently disabled this (and
 *  TargetCursor) even on hardware with a perfectly good mouse.
 *
 *  Not gated behind prefers-reduced-motion - it's a pointer replacement,
 *  not an ambient loop (see the reduced-motion-preference-always-animate
 *  memory). Hidden over The Stack, which has its own TargetCursor (see
 *  StackCursorZone) via the body.stack-cursor-active class. */
export function CustomCursor() {
  const fishRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const fine = window.matchMedia('(any-pointer: fine)').matches
    if (!fine) return

    const fish = fishRef.current
    const canvas = canvasRef.current
    if (!fish || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    document.body.classList.add('dc-nocursor')

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const target = { x: pos.x, y: pos.y }
    let angle = 0
    let active = false
    let rafId = 0
    let lastBubbleAt = 0
    const bubbles: Bubble[] = []

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

    const tick = (now: number) => {
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

      if (active && speed > 1.2 && now - lastBubbleAt > 90 && bubbles.length < 40) {
        lastBubbleAt = now
        const rad = (angle * Math.PI) / 180
        const jitter = (Math.random() - 0.5) * 6
        bubbles.push({
          x: pos.x - Math.cos(rad) * 15 - Math.sin(rad) * jitter,
          y: pos.y - Math.sin(rad) * 15 + Math.cos(rad) * jitter,
          r: 1.4 + Math.random() * 1.8,
          alpha: 0.55 + Math.random() * 0.2,
          drift: Math.random() * Math.PI * 2,
          age: 0,
        })
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        b.age += 1
        b.y -= 0.55 + b.r * 0.12
        b.x += Math.sin(b.age * 0.08 + b.drift) * 0.35
        b.alpha -= 0.012
        b.r += 0.012
        if (b.alpha <= 0) {
          bubbles.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(190,220,235,${(b.alpha * 0.8).toFixed(2)})`
        ctx.lineWidth = 0.8
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(b.alpha * 0.5).toFixed(2)})`
        ctx.fill()
      }

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
      window.removeEventListener('resize', resizeCanvas)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <>
      <canvas id="fish-bubbles" ref={canvasRef} aria-hidden="true" />
      <div id="fish-cursor" ref={fishRef} aria-hidden="true">
        <svg viewBox="-16 -8 32 16" width="40" height="20">
          <path className="fc-body" d="M9 0 C4 -7 -7 -5.5 -11 -0.5 C-7 5.5 4 7 9 0 Z" />
          <path className="fc-tail" d="M-11 -0.5 C-14 -3.5 -16 -3 -16 -3 C-15 -1 -15 1 -16 3 C-16 3 -14 3.5 -11 0.5 Z" />
          <circle className="fc-eye" cx="5.5" cy="-1.2" r="0.9" />
        </svg>
      </div>
    </>
  )
}
