import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link, type Route } from '@/lib/router'
import { useTheme } from '@/hooks/useTheme'

const localTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

interface Place {
  city: string | null
  latitude: number | null
  longitude: number | null
}

/** "Europe/Rome" → "Rome": a no-network fallback for the visitor's city. */
function cityFromTimeZone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz?.includes('/') ? tz.split('/').pop()!.replace(/_/g, ' ') : null
  } catch {
    return null
  }
}

const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`

/** The visitor's own "station": their city and approximate coordinates
 *  (Netlify geo via /api/where, cached for the session) and local time. */
function VisitorStation() {
  const [now, setNow] = useState(() => new Date())
  const [place, setPlace] = useState<Place>(() => {
    try {
      const cached = sessionStorage.getItem('ods-where')
      if (cached) return JSON.parse(cached)
    } catch {
      /* storage unavailable */
    }
    return { city: cityFromTimeZone(), latitude: null, longitude: null }
  })

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (place.latitude !== null) return
    let cancelled = false
    fetch('/api/where')
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => {
        if (cancelled || !g || typeof g.latitude !== 'number') return
        const next = { city: g.city || cityFromTimeZone(), latitude: g.latitude, longitude: g.longitude }
        setPlace(next)
        try {
          sessionStorage.setItem('ods-where', JSON.stringify(next))
        } catch {
          /* storage unavailable */
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [place.latitude])

  return (
    <p className="station" title="Your location and local time">
      {place.city && <span>{place.city}</span>}
      {place.latitude !== null && place.longitude !== null && (
        <span className="station-coords">
          {coord(place.latitude, 'N', 'S')} {coord(place.longitude, 'E', 'W')}
        </span>
      )}
      <time dateTime={now.toISOString()}>{localTime.format(now)}</time>
    </p>
  )
}

export function Header({ path }: { path: Route }) {
  const { theme, toggle } = useTheme()
  const backTo: Route = path === '/notes' ? '/about' : '/'
  return (
    <header className="site-header">
      <div className="site-header-left">
        <Link to="/" className="avatar" aria-label="Home" aria-current={path === '/' ? 'page' : undefined}>
          <img src="/assets/images/passport photo.jpg" width="38" height="38" alt="" />
        </Link>
        {path !== '/' && (
          <Link to={backTo} className="back-link" aria-keyshortcuts="Escape">
            ← Back
          </Link>
        )}
      </div>
      <div className="site-header-right">
        <VisitorStation />
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
