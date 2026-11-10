import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link, type Route } from '@/lib/router'
import { useTheme } from '@/hooks/useTheme'

const pisaTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Live local time at the field station — the research take on a
 *  portfolio's "where I am" clock, with the lab's coordinates beside it. */
function StationClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <p className="station">
      <span>Pisa</span>
      <span className="station-coords">43.72°N 10.40°E</span>
      <time dateTime={now.toISOString()}>{pisaTime.format(now)}</time>
    </p>
  )
}

export function Header({ path }: { path: Route }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="site-header">
      <div className="site-header-left">
        <Link to="/" className="avatar" aria-label="Home" aria-current={path === '/' ? 'page' : undefined}>
          <img src="/assets/images/passport photo.jpg" width="38" height="38" alt="" />
        </Link>
        <span className="crumb-divider" aria-hidden="true">
          /
        </span>
        <StationClock />
      </div>
      <div className="site-header-right">
        {path !== '/' && (
          <Link to="/" className="back-link" aria-keyshortcuts="Escape">
            ← Back
          </Link>
        )}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
        </button>
      </div>
    </header>
  )
}
