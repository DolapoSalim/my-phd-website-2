import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from 'react'

interface MagneticButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  className: string
  children: ReactNode
}

const STRENGTH = 3.2 // higher = less travel for the same cursor distance

/** Hero CTA buttons gently pull toward the cursor when nearby, and ease
 *  back when it moves away. Ported 1:1 from initMagneticButtons. */
export function MagneticButton({ className, children, ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const btn = ref.current
    if (!btn) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    btn.style.willChange = 'transform'
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect()
      const cx = r.left + r.width / 2,
        cy = r.top + r.height / 2
      const dx = e.clientX - cx,
        dy = e.clientY - cy
      btn.style.transition = 'transform 0.25s cubic-bezier(0.2,0.8,0.2,1)'
      btn.style.transform = `translate(${dx / STRENGTH}px, ${dy / STRENGTH}px)`
    }
    const onLeave = () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'
      btn.style.transform = 'translate(0,0)'
    }

    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    return () => {
      btn.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <a ref={ref} className={className} {...rest}>
      {children}
    </a>
  )
}
