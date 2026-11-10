import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/** A deliberately tiny pushState router: the site only has a handful of
 *  fixed pages, so a routing library would be more code than the routes.
 *  Netlify's `/* -> /index.html` rewrite (netlify.toml) serves every path. */
export const ROUTES = ['/', '/research', '/publications', '/cv', '/news', '/about'] as const
export type Route = (typeof ROUTES)[number]

const listeners = new Set<() => void>()

function normalize(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/'
  return (ROUTES as readonly string[]).includes(clean) ? (clean as Route) : '/'
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('popstate', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('popstate', cb)
  }
}

export function usePath(): Route {
  return useSyncExternalStore(subscribe, () => normalize(window.location.pathname))
}

export function navigate(to: Route) {
  if (normalize(window.location.pathname) === to) return
  window.history.pushState(null, '', to)
  listeners.forEach((l) => l())
}

/** Links from the old one-page site (e.g. dolaposalim.com/#publications)
 *  land on the matching page instead of the homepage. */
const LEGACY_HASHES: Record<string, Route> = {
  '#research': '/research',
  '#software': '/research',
  '#publications': '/publications',
  '#cv': '/cv',
  '#awards': '/cv',
  '#news': '/news',
  '#about': '/about',
}
export function redirectLegacyHash() {
  const to = LEGACY_HASHES[window.location.hash]
  if (to && normalize(window.location.pathname) === '/') window.history.replaceState(null, '', to)
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route }

export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handle} {...rest} />
}
