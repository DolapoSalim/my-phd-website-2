import { useEffect, useRef } from 'react'

/** Replaces the system pointer with a lagging ring + a dot that snaps to
 *  the real cursor, and adds magnetic pull to any element carrying
 *  data-magnetic (optionally data-magnetic="0.28" for pull strength;
 *  omit the value to just grow the ring without moving the element).
 *  Fine-pointer only; respects prefers-reduced-motion. Ported from the
 *  reference design's componentDidMount cursor/magnetic logic. */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    if (reduced || !fine) return

    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    document.body.classList.add('dc-nocursor')

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let active = false
    let rafId = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!active) {
        active = true
        rx = mx
        ry = my
        ring.classList.add('active')
        dot.classList.add('active')
      }
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`
    }
    const tick = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      ring.style.transform = `translate(${rx.toFixed(2)}px,${ry.toFixed(2)}px) translate(-50%,-50%)`
      rafId = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    const hot = Array.from(document.querySelectorAll<HTMLElement>('a, [data-magnetic]'))
    const cleanups: Array<() => void> = []
    hot.forEach((el) => {
      const enter = () => ring.classList.add('hover')
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
        ring.classList.remove('hover')
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
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <>
      <div id="cursor-ring" ref={ringRef} />
      <div id="cursor-dot" ref={dotRef} />
    </>
  )
}
