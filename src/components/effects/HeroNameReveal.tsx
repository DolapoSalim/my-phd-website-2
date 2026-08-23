import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface HeroNameRevealProps {
  children: ReactNode
}

/** h1.hero-name that splits every character into spans for a staggered
 *  reveal, then sweeps a gold "shine" gradient across the settled name
 *  once the reveal finishes (see initHeroName in the legacy script.js). */
export function HeroNameReveal({ children }: HeroNameRevealProps) {
  const ref = useRef<HTMLHeadingElement | null>(null)
  const didSplit = useRef(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const nameEl = ref.current
    if (!nameEl || didSplit.current) return
    didSplit.current = true

    if (reduced) {
      nameEl.classList.add('hn-ready')
      return
    }

    function splitChars(root: HTMLElement) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
      const textNodes: Text[] = []
      let n: Node | null
      while ((n = walker.nextNode())) textNodes.push(n as Text)

      let globalIndex = 0
      textNodes.forEach((node) => {
        const text = node.textContent ?? ''
        const frag = document.createDocumentFragment()
        for (const ch of text) {
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '))
            continue
          }
          const span = document.createElement('span')
          span.className = 'hn-char'
          span.textContent = ch
          span.style.transitionDelay = `${globalIndex * 28}ms`
          frag.appendChild(span)
          globalIndex++
        }
        node.parentNode?.replaceChild(frag, node)
      })
      return globalIndex
    }

    const charCount = splitChars(nameEl)

    let readyRaf1 = 0
    let readyRaf2 = 0
    readyRaf1 = requestAnimationFrame(() => {
      readyRaf2 = requestAnimationFrame(() => {
        nameEl.classList.add('hn-ready')
      })
    })

    const revealTime = 700 + charCount * 28
    const shineTimeout = window.setTimeout(() => {
      const shine = document.createElement('span')
      shine.className = 'hn-shine'
      while (nameEl.firstChild) shine.appendChild(nameEl.firstChild)
      nameEl.appendChild(shine)
    }, revealTime + 80)

    return () => {
      cancelAnimationFrame(readyRaf1)
      cancelAnimationFrame(readyRaf2)
      window.clearTimeout(shineTimeout)
    }
  }, [reduced])

  return (
    <h1 className="hero-name" ref={ref}>
      {children}
    </h1>
  )
}
