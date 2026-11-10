import { useEffect } from 'react'
import { navigate, redirectLegacyHash, usePath, type Route } from '@/lib/router'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { Home } from '@/pages/Home'
import { Research } from '@/pages/Research'
import { Publications } from '@/pages/Publications'
import { Cv } from '@/pages/Cv'
import { News } from '@/pages/News'

redirectLegacyHash()

const PAGES: Record<Route, { title: string; render: () => React.ReactNode }> = {
  '/': { title: 'Olatoye Dolapo Salim — Computer Vision for Marine Ecology', render: () => <Home /> },
  '/research': { title: 'Research & tools — Olatoye Dolapo Salim', render: () => <Research /> },
  '/publications': { title: 'Publications — Olatoye Dolapo Salim', render: () => <Publications /> },
  '/cv': { title: 'CV — Olatoye Dolapo Salim', render: () => <Cv /> },
  '/news': { title: 'News — Olatoye Dolapo Salim', render: () => <News /> },
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
    <div className="site">
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
  )
}

export default App
