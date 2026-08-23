import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  as?: ElementType
  className?: string
  delay?: number
  style?: CSSProperties
  children: ReactNode
  [key: string]: unknown
}

/** Fades an element in once it crosses the viewport, mirroring the
 *  original site's global `.fi` + IntersectionObserver pattern. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`fi ${className}`} style={{ ...style, transitionDelay: delay ? `${delay}s` : undefined }} {...rest}>
      {children}
    </Tag>
  )
}
