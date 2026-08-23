import { useEffect, useRef } from 'react'

interface WavePoint {
  x: number
  y: number
  wave: { x: number; y: number }
  cursor: { x: number; y: number; vx: number; vy: number }
}

class Grad {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  dot2(x: number, y: number) {
    return this.x * x + this.y * y
  }
}

class Noise {
  grad3: Grad[]
  p: number[]
  perm: number[]
  gradP: Grad[]
  constructor(seed: number) {
    this.grad3 = [new Grad(1, 1), new Grad(-1, 1), new Grad(1, -1), new Grad(-1, -1), new Grad(1, 0), new Grad(-1, 0), new Grad(0, 1), new Grad(0, -1)]
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
      75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139,
      48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
      73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202,
      38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221,
      153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238,
      210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4,
      150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ]
    this.perm = new Array(512)
    this.gradP = new Array(512)
    this.seed(seed)
  }
  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536
    seed = Math.floor(seed)
    if (seed < 256) seed |= seed << 8
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255)
      this.perm[i] = this.perm[i + 256] = v
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 8]
    }
  }
  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b
  }
  perlin2(x: number, y: number) {
    let X = Math.floor(x),
      Y = Math.floor(y)
    x -= X
    y -= Y
    X &= 255
    Y &= 255
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y)
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1)
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y)
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1)
    const u = this.fade(x)
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y))
  }
}

/** A field of horizontal lines perturbed by 2D Perlin noise and gently
 *  pushed by the cursor, drawn behind the CV-Demo section. Pauses when
 *  off-screen. Ported 1:1 from initWavesBackground. */
export function WavesBackground() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = document.createElement('canvas')
    host.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const noise = new Noise(Math.random())

    const cfg = {
      waveSpeedX: 0.0125,
      waveSpeedY: 0.005,
      waveAmpX: 22,
      waveAmpY: 11,
      xGap: 26,
      yGap: 38,
      friction: 0.925,
      tension: 0.005,
      maxCursorMove: 80,
    }

    let W = 0,
      H = 0,
      lines: WavePoint[][] = []
    const bounding = { left: 0, top: 0 }
    const mouse = { x: -9999, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false }

    function lineColor() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(42,122,111,0.16)' : 'rgba(168,197,190,0.14)'
    }

    function setSize() {
      const rect = host!.getBoundingClientRect()
      bounding.left = rect.left
      bounding.top = rect.top
      W = canvas.width = rect.width
      H = canvas.height = rect.height
    }

    function setLines() {
      lines = []
      const oWidth = W + 200,
        oHeight = H + 40
      const totalLines = Math.ceil(oWidth / cfg.xGap)
      const totalPoints = Math.ceil(oHeight / cfg.yGap)
      const xStart = (W - cfg.xGap * totalLines) / 2
      const yStart = (H - cfg.yGap * totalPoints) / 2
      for (let i = 0; i <= totalLines; i++) {
        const pts: WavePoint[] = []
        for (let j = 0; j <= totalPoints; j++) {
          pts.push({ x: xStart + cfg.xGap * i, y: yStart + cfg.yGap * j, wave: { x: 0, y: 0 }, cursor: { x: 0, y: 0, vx: 0, vy: 0 } })
        }
        lines.push(pts)
      }
    }

    function movePoints(t: number) {
      lines.forEach((pts) => {
        pts.forEach((p) => {
          const move = noise.perlin2((p.x + t * cfg.waveSpeedX) * 0.0025, (p.y + t * cfg.waveSpeedY) * 0.0018) * 12
          p.wave.x = Math.cos(move) * cfg.waveAmpX
          p.wave.y = Math.sin(move) * cfg.waveAmpY

          const dx = p.x - mouse.sx,
            dy = p.y - mouse.sy
          const dist = Math.hypot(dx, dy),
            l = Math.max(160, mouse.vs)
          if (dist < l) {
            const s = 1 - dist / l
            const f = Math.cos(dist * 0.001) * s
            p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00055
            p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00055
          }
          p.cursor.vx += (0 - p.cursor.x) * cfg.tension
          p.cursor.vy += (0 - p.cursor.y) * cfg.tension
          p.cursor.vx *= cfg.friction
          p.cursor.vy *= cfg.friction
          p.cursor.x += p.cursor.vx * 2
          p.cursor.y += p.cursor.vy * 2
          p.cursor.x = Math.min(cfg.maxCursorMove, Math.max(-cfg.maxCursorMove, p.cursor.x))
          p.cursor.y = Math.min(cfg.maxCursorMove, Math.max(-cfg.maxCursorMove, p.cursor.y))
        })
      })
    }

    function moved(p: WavePoint, withCursor: boolean) {
      const x = p.x + p.wave.x + (withCursor ? p.cursor.x : 0)
      const y = p.y + p.wave.y + (withCursor ? p.cursor.y : 0)
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
    }

    function drawLines() {
      ctx!.clearRect(0, 0, W, H)
      ctx!.beginPath()
      ctx!.strokeStyle = lineColor()
      ctx!.lineWidth = 1
      lines.forEach((points) => {
        let p1 = moved(points[0], false)
        ctx!.moveTo(p1.x, p1.y)
        points.forEach((p, idx) => {
          const isLast = idx === points.length - 1
          p1 = moved(p, !isLast)
          const p2 = moved(points[idx + 1] || points[points.length - 1], !isLast)
          ctx!.lineTo(p1.x, p1.y)
          if (isLast) ctx!.moveTo(p2.x, p2.y)
        })
      })
      ctx!.stroke()
    }

    let rafId = 0
    let running = true

    function tick(t: number) {
      mouse.sx += (mouse.x - mouse.sx) * 0.1
      mouse.sy += (mouse.y - mouse.sy) * 0.1
      const dx = mouse.x - mouse.lx,
        dy = mouse.y - mouse.ly
      const d = Math.hypot(dx, dy)
      mouse.v = d
      mouse.vs += (d - mouse.vs) * 0.1
      mouse.vs = Math.min(100, mouse.vs)
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      mouse.a = Math.atan2(dy, dx)

      movePoints(t)
      drawLines()
      if (running) rafId = requestAnimationFrame(tick)
    }

    function updateMouse(x: number, y: number) {
      mouse.x = x - bounding.left
      mouse.y = y - bounding.top
      if (!mouse.set) {
        mouse.sx = mouse.x
        mouse.sy = mouse.y
        mouse.lx = mouse.x
        mouse.ly = mouse.y
        mouse.set = true
      }
    }

    const onResize = () => {
      setSize()
      setLines()
    }
    const onMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return
      updateMouse(e.touches[0].clientX, e.touches[0].clientY)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    const sectionIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          running = entry.isIntersecting
          if (running && !rafId) rafId = requestAnimationFrame(tick)
        })
      },
      { threshold: 0 },
    )
    sectionIO.observe(host.closest('section') || host)

    setSize()
    setLines()
    rafId = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      sectionIO.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      canvas.remove()
    }
  }, [])

  return <div id="waves-bg" ref={hostRef} />
}
