import marquee from '@/content/site/marquee.json'
import { Nav } from '@/components/layout/Nav'
import { CustomCursor } from '@/components/effects/CustomCursor'
import { MarqueeBand } from '@/components/effects/MarqueeBand'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { News } from '@/components/sections/News'
import { Publications } from '@/components/sections/Publications'
import { Cv } from '@/components/sections/Cv'
import { Awards } from '@/components/sections/Awards'
import { Expertise } from '@/components/sections/Expertise'
import { Contact } from '@/components/sections/Contact'

function App() {
  return (
    <>
      <CustomCursor />
      <Nav />
      <Hero />
      <About />
      <MarqueeBand items={marquee.items} />
      <News />
      <Publications />
      <Cv />
      <Awards />
      <Expertise />
      <Contact />
    </>
  )
}

export default App
