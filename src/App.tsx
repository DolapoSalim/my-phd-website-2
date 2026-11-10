import { useEffect } from 'react'
import { navigate, redirectLegacyHash, usePath, type Route } from '@/lib/router'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { Home } from '@/pages/Home'
import { Research } from '@/pages/Research'
import { Publications } from '@/pages/Publications'
import { Cv } from '@/pages/Cv'
import { News } from '@/pages/News'
import { About } from '@/pages/About'
import { FishCursor } from '@/components/site/FishCursor'
import { Sea } from '@/components/site/Sea'
import { FontPicker } from '@/components/site/FontPicker'

redirectLegacyHash()

const PAGES: Record<Route, { title: string; render: () => React.ReactNode }> = {
  '/': { title: 'Olatoye Dolapo Salim — Computer Vision for Marine Ecology', render: () => <Home /> },
  '/research': { title: 'Research & tools — Olatoye Dolapo Salim', render: () => <Research /> },
  '/publications': { title: 'Publications — Olatoye Dolapo Salim', render: () => <Publications /> },
  '/cv': { title: 'CV — Olatoye Dolapo Salim', render: () => <Cv /> },
  '/news': { title: 'News — Olatoye Dolapo Salim', render: () => <News /> },
  '/about': { title: 'About me — Olatoye Dolapo Salim', render: () => <About /> },
}

function App() {
  const path = usePath()
  const page = PAGES[path]

  useEffect(() => {
    document.title = page.title
    window.scrollTo(0, 0)
  }, [page])

  useEffect(() => {
    if (path === '/') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [path])

  return (
    <>
      {/* outside .site, so the large-screen zoom on .site doesn't offset it */}
      <FishCursor />
      <FontPicker />
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
