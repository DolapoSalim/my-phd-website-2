import { useState, type ReactNode } from 'react'
import { TargetCursor } from '@/components/effects/TargetCursor'
import { useTheme } from '@/hooks/useTheme'

const ACCENT = { dark: '#e1ad66', light: '#b5793a' } as const

/** Mounts TargetCursor only while the pointer is inside this zone, so
 *  the rest of the site keeps the ambient fish cursor (CustomCursor)
 *  and only The Stack gets the bracket-target treatment. Activates on
 *  a real mouseenter rather than gating on matchMedia('(any-pointer:
 *  fine)') first - that query has been observed reporting false on
 *  real desktops with a working mouse (see CustomCursor.tsx for the
 *  same fix), so a genuine hover event is the more reliable signal. */
export function StackCursorZone({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const { theme } = useTheme()

  return (
    <div
      onMouseEnter={() => {
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
