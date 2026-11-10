import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'
// v2: the redesign defaults to light, so ignore choices saved under the old dark-first key
const STORAGE_KEY = 'ods-theme-v2'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    const attr = document.documentElement.getAttribute('data-theme')
    return attr === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => {
      const attr = el.getAttribute('data-theme')
      const next: Theme = attr === 'dark' ? 'dark' : 'light'
      setThemeState((prev) => (prev === next ? prev : next))
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { theme, toggle }
}
