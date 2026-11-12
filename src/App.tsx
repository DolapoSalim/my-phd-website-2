import { useEffect } from 'react'
import { navigate, redirectLegacyHash, useNewsSlug, usePath, type Route } from '@/lib/router'
import { newsEntries } from '@/lib/content'
import { countView } from '@/lib/analytics'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { Home } from '@/pages/Home'
import { Research } from '@/pages/Research'
import { Tools } from '@/pages/Tools'
import { Publications } from '@/pages/Publications'
import { Cv } from '@/pages/Cv'
import { News } from '@/pages/News'
import { About } from '@/pages/About'
import { Notes } from '@/pages/Notes'
import { Privacy } from '@/pages/Privacy'
import { FishCursor } from '@/components/site/FishCursor'
import { Sea } from '@/components/site/Sea'

redirectLegacyHash()

const PAGES: Record<Route, { title: string; render: () => React.ReactNode }> = {
  '/': { title: 'Olatoye Dolapo Salim — Computer Vision for Marine Ecology', render: () => <Home /> },
  '/research': { title: 'Research — Olatoye Dolapo Salim', render: () => <Research /> },
  '/tools': { title: 'Tools & skills — Olatoye Dolapo Salim', render: () => <Tools /> },
  '/publications': { title: 'Publications — Olatoye Dolapo Salim', render: () => <Publications /> },
  '/cv': { title: 'CV — Olatoye Dolapo Salim', render: () => <Cv /> },
  '/news': { title: 'News — Olatoye Dolapo Salim', render: () => <News /> },
  '/about': { title: 'Outside the lab — Olatoye Dolapo Salim', render: () => <About /> },
  '/notes': { title: 'My love life — notes for Dolapo', render: () => <Notes /> },
  '/privacy': { title: 'Privacy — Olatoye Dolapo Salim', render: () => <Privacy /> },
}

function App() {
  const path = usePath()
  const page = PAGES[path]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  // tab title: the page's, or an open news post's own title (/news/<slug>)
  const slug = useNewsSlug()
  useEffect(() => {
    const post = path === '/news' && slug ? newsEntries.find((n) => n.slug === slug) : undefined
    document.title = post ? `${post.title} — Olatoye Dolapo Salim` : page.title
  }, [page, path, slug])

  useEffect(() => {
    countView(path)
  }, [path])

  useEffect(() => {
    if (path === '/') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(path === '/notes' ? '/about' : '/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [path])

  return (
    <>
      {/* outside .site, so the large-screen zoom on .site doesn't offset it */}
      <FishCursor />
      <div className={`site${path === '/' ? ' site-home' : ''}`}>
        {path === '/' && <Sea />}
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <Header path={path} />
        {/* keyed so each page replays its entrance */}
        <div className="view" key={path}>
          {page.render()}
        </div>
        <Footer />
      </div>
    </>
  )
}

export default App
