import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'

const NAV_LINKS = [
  { href: '#about', label: 'about' },
  { href: '#cv-demo', label: 'research' },
  { href: '#education', label: 'education' },
  { href: '#publications', label: 'publications' },
  { href: '#projects', label: 'projects' },
  { href: '#skills', label: 'skills' },
  { href: '#news', label: 'news' },
  { href: '#contact', label: 'contact' },
]

export function Nav({ logo }: { logo: string }) {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <b>{logo}</b>
          </div>
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            <button className="theme-btn" onClick={toggle}>
              {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>
            <button className={`hbg ${open ? 'open' : ''}`} aria-label="menu" onClick={() => setOpen((o) => !o)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
      <div className={`mob-nav ${open ? 'open' : ''}`}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </div>
    </>
  )
}
