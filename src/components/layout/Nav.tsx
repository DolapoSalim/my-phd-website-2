import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import hero from '@/content/site/hero.json'
import { useTheme } from '@/hooks/useTheme'

const NAV_LINKS = [
  { href: '#news', label: 'News' },
  { href: '#publications', label: 'Publications' },
  { href: '#cv', label: 'CV' },
  { href: '#awards', label: 'Awards' },
  { href: '#software', label: 'Expertise' },
]

export function Nav() {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav>
        <a href="#top" data-magnetic="1" className="nav-logo">
          <b>{hero.navShortName}</b>
          <span className="nav-logo-tagline">{hero.navTagline}</span>
        </a>
        <div className="nav-right">
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} data-magnetic="1">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={`mailto:${hero.email}`} data-magnetic="1" className="nav-cta">
            Get in touch
          </a>
          <button className="theme-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
          </button>
          <button className={`hbg ${open ? 'open' : ''}`} aria-label="menu" onClick={() => setOpen((o) => !o)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
      <div className={`mob-nav ${open ? 'open' : ''}`}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href={`mailto:${hero.email}`} onClick={() => setOpen(false)}>
          Get in touch
        </a>
      </div>
    </>
  )
}
