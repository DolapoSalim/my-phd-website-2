import { useRef, useState, type ReactNode } from 'react'
import { TargetCursor } from '@/components/effects/TargetCursor'
import { useTheme } from '@/hooks/useTheme'

const ACCENT = { dark: '#e1ad66', light: '#b5793a' } as const

/** Mounts TargetCursor only while the pointer is inside this zone, so
 *  the rest of the site keeps the ambient magnetic ring cursor
 *  (CustomCursor) and only The Stack gets the bracket-target treatment.
 *  Fine-pointer only - touch devices never toggle this on. */
export function StackCursorZone({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const { theme } = useTheme()
  const fineRef = useRef<boolean | null>(null)

  const isFinePointer = () => {
    if (fineRef.current === null) fineRef.current = window.matchMedia('(any-pointer: fine)').matches
    return fineRef.current
  }

  return (
    <div
      onMouseEnter={() => {
        if (!isFinePointer()) return
        document.body.classList.add('stack-cursor-active')
        setActive(true)
      }}
      onMouseLeave={() => {
        document.body.classList.remove('stack-cursor-active')
        setActive(false)
      }}
    >
      {active && <TargetCursor targetSelector=".stack-tag" spinDuration={2.4} hoverDuration={0.2} parallaxOn cursorColor={ACCENT[theme]} />}
      {children}
    </div>
  )
}
