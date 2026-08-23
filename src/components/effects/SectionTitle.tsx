import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SectionTitleProps {
  children: ReactNode
}

/** h2.sec-title that splits its text into word spans and reveals them
 *  with a staggered tilt-up as the section enters the viewport, while
 *  preserving any <br> in the children (see initSectionTitles in the
 *  legacy script.js). */
export function SectionTitle({ children }: SectionTitleProps) {
  const ref = useRef<HTMLHeadingElement | null>(null)
  const didSplit = useRef(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const title = ref.current
    if (!title || didSplit.current) return
    didSplit.current = true

    const original = Array.from(title.childNodes)
    title.innerHTML = ''
    let wordIndex = 0

    original.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = (node.textContent ?? '').trim().split(/\s+/).filter(Boolean)
        words.forEach((w) => {
          const span = document.createElement('span')
          span.className = 'st-word'
          span.textContent = w
          span.style.transitionDelay = reduced ? '0ms' : `${wordIndex * 70}ms`
          title.appendChild(span)
          title.appendChild(document.createTextNode(' '))
          wordIndex++
        })
      } else {
        title.appendChild(node.cloneNode(true))
      }
    })

    if (title.lastChild && title.lastChild.nodeType === Node.TEXT_NODE) {
      title.removeChild(title.lastChild)
    }

    if (reduced) {
      title.classList.add('st-ready')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('st-ready')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3, rootMargin: '0px 0px -60px 0px' },
    )
    io.observe(title)
    return () => io.disconnect()
  }, [reduced])

  return (
    <h2 className="sec-title" ref={ref}>
      {children}
    </h2>
  )
}
