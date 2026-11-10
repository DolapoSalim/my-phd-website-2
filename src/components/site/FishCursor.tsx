import { useEffect, useRef } from 'react'

interface Bubble {
  x: number
  y: number
  r: number
  alpha: number
  drift: number
  age: number
}

const HOT = 'a, button, [role="button"]'

/** The swimming fish pointer with its bubble trail, ported from the old
 *  one-page site (effects/CustomCursor) for the multi-page redesign:
 *
 *  - Hover state uses event delegation instead of binding to the links
 *    present at mount, so it keeps working after client-side navigation.
 *  - Activates on the first *mouse* pointermove. Touch taps also fire
 *    synthetic mousemove events, but their pointerType is "touch", so
 *    phones and tablets keep their native behaviour while an iPad or a
 *    laptop with a real mouse gets the fish — at any screen width.
 *  - Not gated behind prefers-reduced-motion (see the always-animate
 *    preference for this site). */
export function FishCursor() {
  const fishRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const fish = fishRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!fish || !canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const target = { ...pos }
    let angle = 0
    let active = false
    let hovering = false
    let rafId = 0
    let lastBubbleAt = 0
    const bubbles: Bubble[] = []

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY
      if (!active) {
        pos.x = target.x
        pos.y = target.y
        active = true
        fish.classList.add('active')
        document.documentElement.classList.add('fish-cursor-on')
      }
    }
    const onLeave = () => {
      active = false
      fish.classList.remove('active')
    }
    const onOver = (e: Event) => {
      const el = e.target as Element | null
      hovering = !!el?.closest?.(HOT)
      fish.classList.toggle('hover', hovering)
      fish.classList.toggle('away', !!el?.closest?.('[data-native-cursor]'))
    }

    const tick = (now: number) => {
      const dx = target.x - pos.x
      const dy = target.y - pos.y
      pos.x += dx * 0.18
      pos.y += dy * 0.18

      const speed = Math.hypot(dx, dy)
      if (speed > 0.6) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI)
        const diff = ((((targetAngle - angle + 180) % 360) + 360) % 360) - 180
        angle += diff * 0.18
      }

      const scale = hovering ? 1.35 : 1
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
        ctx.strokeStyle = `rgba(80,150,170,${(b.alpha * 0.85).toFixed(2)})`
        ctx.lineWidth = 0.8
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(b.alpha * 0.6).toFixed(2)})`
        ctx.fill()
      }
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('fish-cursor-on')
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
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
