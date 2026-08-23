import { useEffect, useRef } from 'react'

interface Fish {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  wob: number
  alpha: number
  scatter: number
}
interface Bubble {
  x: number
  y: number
  r: number
  speed: number
  wob: number
  wobSpeed: number
  alpha: number
}
interface Dust {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
}
interface Bbox {
  targetIdx: number
  life: number
  dwell: number
}

/** A small school of procedurally-drawn fish swims with light boids
 *  behaviour (separation / alignment / cohesion), bubbles rise with a
 *  buoyant wobble, plankton dust drifts, and a few CV-style bounding
 *  boxes sparsely "track" a nearby fish. Fish startle and scatter away
 *  from the cursor, then drift back into loose schooling. Ported 1:1
 *  from initParticles in the legacy script.js. */
export function MarineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = 0
    let H = 0

    function resize() {
      const hero = document.getElementById('hero')
      W = canvas!.width = hero ? hero.offsetWidth : window.innerWidth
      H = canvas!.height = hero ? hero.offsetHeight : window.innerHeight
      updateRect()
    }

    function accentRGB() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? '106,92,214' : '139,124,246'
    }

    const mouse = { x: -9999, y: -9999, active: false }
    let canvasRect = { left: 0, top: 0 }

    function updateRect() {
      canvasRect = canvas!.getBoundingClientRect()
    }

    const onResize = () => resize()
    const onResize2 = () => updateRect()
    const onScroll = () => updateRect()
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX - canvasRect.left
      mouse.y = e.clientY - canvasRect.top
      mouse.active = true
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return
      mouse.x = e.touches[0].clientX - canvasRect.left
      mouse.y = e.touches[0].clientY - canvasRect.top
      mouse.active = true
    }
    const onTouchEnd = () => {
      mouse.active = false
    }
    const onDocMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('resize', onResize2)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    document.addEventListener('mouseleave', onDocMouseLeave)

    const FISH_COUNT = reduced ? 0 : 9
    const fish: Fish[] = []

    function makeFish(): Fish {
      const x = Math.random() * W
      const y = Math.random() * H
      const angle = Math.random() * Math.PI * 2
      const speed = 0.35 + Math.random() * 0.25
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 9 + Math.random() * 7,
        wob: Math.random() * Math.PI * 2,
        alpha: 0.4 + Math.random() * 0.3,
        scatter: 0,
      }
    }
    function initFish() {
      fish.length = 0
      for (let i = 0; i < FISH_COUNT; i++) fish.push(makeFish())
    }

    function stepFish() {
      const VIEW = 70
      const SEP_R = 26
      const MAX_SPD = 0.9
      const STARTLE_R = 110

      fish.forEach((f) => {
        let sepX = 0,
          sepY = 0,
          aliX = 0,
          aliY = 0,
          cohX = 0,
          cohY = 0,
          n = 0
        fish.forEach((o) => {
          if (o === f) return
          const dx = f.x - o.x,
            dy = f.y - o.y,
            d = Math.hypot(dx, dy)
          if (d < VIEW && d > 0.001) {
            n++
            aliX += o.vx
            aliY += o.vy
            cohX += o.x
            cohY += o.y
            if (d < SEP_R) {
              sepX += dx / d
              sepY += dy / d
            }
          }
        })
        if (n > 0) {
          aliX /= n
          aliY /= n
          cohX = cohX / n - f.x
          cohY = cohY / n - f.y
          f.vx += aliX * 0.012 + cohX * 0.0006 + sepX * 0.05
          f.vy += aliY * 0.012 + cohY * 0.0006 + sepY * 0.05
        }

        const mdx = f.x - mouse.x,
          mdy = f.y - mouse.y,
          mdist = Math.hypot(mdx, mdy)
        if (mouse.active && mdist < STARTLE_R && mdist > 0.001) {
          const k = 1 - mdist / STARTLE_R
          f.vx += (mdx / mdist) * k * 1.1
          f.vy += (mdy / mdist) * k * 1.1
          f.scatter = Math.min(1, f.scatter + k * 0.4)
        } else {
          f.scatter *= 0.96
        }

        f.wob += 0.12 + f.scatter * 0.15
        const heading = Math.atan2(f.vy, f.vx)
        const wobAmt = Math.sin(f.wob) * 0.18
        f.vx += Math.cos(heading + Math.PI / 2) * wobAmt * 0.05
        f.vy += Math.sin(heading + Math.PI / 2) * wobAmt * 0.05

        const spd = Math.hypot(f.vx, f.vy) || 0.001
        const target = Math.min(MAX_SPD, Math.max(0.28, spd))
        f.vx = (f.vx / spd) * target
        f.vy = (f.vy / spd) * target

        f.x += f.vx
        f.y += f.vy

        const m = 24
        if (f.x < -m) f.x = W + m
        if (f.x > W + m) f.x = -m
        if (f.y < -m) f.y = H + m
        if (f.y > H + m) f.y = -m
      })
    }

    function drawFish(f: Fish, c: string) {
      const heading = Math.atan2(f.vy, f.vx)
      ctx!.save()
      ctx!.translate(f.x, f.y)
      ctx!.rotate(heading)
      ctx!.globalAlpha = f.alpha
      ctx!.fillStyle = `rgb(${c})`
      const L = f.len,
        Wd = L * 0.42
      ctx!.beginPath()
      ctx!.moveTo(L * 0.55, 0)
      ctx!.quadraticCurveTo(L * 0.15, -Wd, -L * 0.5, -Wd * 0.35)
      ctx!.quadraticCurveTo(L * 0.15, Wd, L * 0.55, 0)
      ctx!.fill()
      const tailWag = Math.sin(f.wob * 1.6) * Wd * 0.32
      ctx!.beginPath()
      ctx!.moveTo(-L * 0.48, 0)
      ctx!.lineTo(-L * 0.82, -Wd * 0.5 + tailWag)
      ctx!.lineTo(-L * 0.82, Wd * 0.5 + tailWag)
      ctx!.closePath()
      ctx!.fill()
      ctx!.restore()
    }

    const BUBBLE_COUNT = reduced ? 0 : 16
    const bubbles: Bubble[] = []
    function makeBubble(): Bubble {
      return {
        x: Math.random() * W,
        y: H + Math.random() * 60,
        r: 1.2 + Math.random() * 3.2,
        speed: 0.18 + Math.random() * 0.5,
        wob: Math.random() * Math.PI * 2,
        wobSpeed: 0.01 + Math.random() * 0.02,
        alpha: 0.12 + Math.random() * 0.22,
      }
    }
    function initBubbles() {
      bubbles.length = 0
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        const b = makeBubble()
        b.y = Math.random() * H
        bubbles.push(b)
      }
    }
    function stepBubbles() {
      bubbles.forEach((b) => {
        b.wob += b.wobSpeed
        b.y -= b.speed
        b.x += Math.sin(b.wob) * 0.4
        if (b.y < -10) {
          Object.assign(b, makeBubble())
          b.y = H + 10
        }
      })
    }
    function drawBubble(b: Bubble, c: string) {
      ctx!.beginPath()
      ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgba(${c},${b.alpha})`
      ctx!.lineWidth = 1
      ctx!.stroke()
    }

    const DUST_COUNT = reduced ? 0 : 36
    const dust: Dust[] = []
    function makeDust(): Dust {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        r: 0.6 + Math.random() * 1.1,
        alpha: 0.08 + Math.random() * 0.16,
      }
    }
    function initDust() {
      dust.length = 0
      for (let i = 0; i < DUST_COUNT; i++) dust.push(makeDust())
    }
    function stepDust() {
      dust.forEach((d) => {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0) d.x = W
        if (d.x > W) d.x = 0
        if (d.y < 0) d.y = H
        if (d.y > H) d.y = 0
      })
    }
    function drawDust(d: Dust, c: string) {
      ctx!.beginPath()
      ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(${c},${d.alpha})`
      ctx!.fill()
    }

    const BBOX_COUNT = reduced ? 0 : 3
    const bboxes: Bbox[] = []
    function makeBbox(): Bbox {
      return { targetIdx: Math.floor(Math.random() * Math.max(1, fish.length)), life: 0, dwell: 90 + Math.random() * 120 }
    }
    function initBboxes() {
      bboxes.length = 0
      for (let i = 0; i < BBOX_COUNT; i++) bboxes.push(makeBbox())
    }
    function stepDrawBboxes(c: string) {
      if (!fish.length) return
      bboxes.forEach((b) => {
        b.life++
        if (b.life > b.dwell) {
          b.life = 0
          b.dwell = 90 + Math.random() * 150
          b.targetIdx = Math.floor(Math.random() * fish.length)
        }
        const f = fish[b.targetIdx]
        if (!f) return
        const s = f.len * 2.1
        const fadeIn = Math.min(1, b.life / 20)
        const fadeOut = Math.min(1, (b.dwell - b.life) / 20)
        const a = 0.22 * Math.min(fadeIn, fadeOut)
        if (a <= 0.005) return
        const arm = s * 0.22,
          lw = 1
        ctx!.save()
        ctx!.translate(f.x, f.y)
        ctx!.strokeStyle = `rgba(${c},${a})`
        ctx!.lineWidth = lw
        ctx!.beginPath()
        ctx!.moveTo(-s + arm, -s)
        ctx!.lineTo(-s, -s)
        ctx!.lineTo(-s, -s + arm)
        ctx!.moveTo(s - arm, -s)
        ctx!.lineTo(s, -s)
        ctx!.lineTo(s, -s + arm)
        ctx!.moveTo(s - arm, s)
        ctx!.lineTo(s, s)
        ctx!.lineTo(s, s - arm)
        ctx!.moveTo(-s + arm, s)
        ctx!.lineTo(-s, s)
        ctx!.lineTo(-s, s - arm)
        ctx!.stroke()
        ctx!.restore()
      })
    }

    let rafId = 0
    function frame() {
      ctx!.clearRect(0, 0, W, H)
      const c = accentRGB()

      stepDust()
      dust.forEach((d) => drawDust(d, c))
      stepBubbles()
      bubbles.forEach((b) => drawBubble(b, c))
      stepFish()
      fish.forEach((f) => drawFish(f, c))
      stepDrawBboxes(c)

      rafId = requestAnimationFrame(frame)
    }

    function initAll() {
      resize()
      initFish()
      initBubbles()
      initDust()
      initBboxes()
    }

    initAll()
    updateRect()
    if (reduced) {
      const c = accentRGB()
      dust.forEach((d) => drawDust(d, c))
    } else {
      rafId = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('resize', onResize2)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('mouseleave', onDocMouseLeave)
    }
  }, [])

  return <canvas id="marine-canvas" ref={canvasRef} />
}
