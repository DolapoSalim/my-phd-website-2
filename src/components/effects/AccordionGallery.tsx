import { useRef, useEffect, useState, useCallback, type ReactNode, type KeyboardEvent } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Text-panel adaptation of React Bits' AccordionGallery: same expand/
 *  collapse interaction (hover or click grows one panel via GSAP-tweened
 *  flexGrow, the rest stay as slim spines), but panels hold prose instead
 *  of images, styled entirely off the site's own CSS custom properties
 *  so it tracks the light/dark theme automatically. */
export interface AccordionGalleryItem {
  key: string
  index: string
  title: string
  meta: string
  content: ReactNode
}

interface AccordionGalleryProps {
  items: AccordionGalleryItem[]
  defaultIndex?: number
  expandRatio?: number
  gap?: number
  height?: number
  duration?: number
  ease?: string
  trigger?: 'hover' | 'click'
}

export function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.52,
  gap = 14,
  height = 460,
  duration = 0.6,
  ease = 'power3.out',
  trigger = 'click',
}: AccordionGalleryProps) {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const firstRun = useRef(true)
  const reduced = useReducedMotion()
  const count = items.length
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1))

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current
      if (!panels.length) return
      const r = Math.min(Math.max(expandRatio, 0.2), 0.9)
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1
      tlRef.current?.kill()
      const dur = animate && !reduced ? duration : 0
      const tl = gsap.timeline()
      panels.forEach((panel, i) => {
        if (!panel) return
        tl.to(panel, { flexGrow: i === active ? grow : 1, duration: dur, ease }, 0)
      })
      tlRef.current = tl
    },
    [active, count, expandRatio, duration, ease, reduced],
  )

  useEffect(() => {
    applyLayout(!firstRun.current)
    firstRun.current = false
  }, [applyLayout])

  useEffect(() => () => { tlRef.current?.kill() }, [])

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i)
  }
  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i + 1) % count)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i - 1 + count) % count)
    }
  }

  return (
    <div className="ag-root" style={{ '--ag-gap': `${gap}px`, '--ag-height': `${height}px` } as React.CSSProperties} role="list" aria-label="Selected publications">
      {items.map((item, i) => {
        const isActive = i === active
        return (
          <div
            key={item.key}
            ref={(el) => { panelRefs.current[i] = el }}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => setActive(i)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          >
            <div className="ag-panel__spine" aria-hidden={isActive}>
              <span className="ag-panel__spine-index">{item.index}</span>
              <span className="ag-panel__spine-title">{item.title}</span>
              <span className="ag-panel__spine-meta">{item.meta}</span>
            </div>
            <div className="ag-panel__content" aria-hidden={!isActive}>
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
