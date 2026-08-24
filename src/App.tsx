import marquee from '@/content/site/marquee.json'
import { Nav } from '@/components/layout/Nav'
import { CustomCursor } from '@/components/effects/CustomCursor'
import { Marquee } from '@/components/effects/Marquee'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Research } from '@/components/sections/Research'
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
      <Marquee items={marquee.items} />
      <Research />
      <Publications />
      <Cv />
      <Awards />
      <Expertise />
      <Contact />
    </>
  )
}

export default App
