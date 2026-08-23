import hero from '@/content/site/hero.json'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { CvDemo } from '@/components/sections/CvDemo'
import { Education } from '@/components/sections/Education'
import { Publications } from '@/components/sections/Publications'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { News } from '@/components/sections/News'
import { Contact } from '@/components/sections/Contact'
import { useScrollDepthEffects } from '@/hooks/useScrollDepthEffects'

function App() {
  useScrollDepthEffects()

  return (
    <>
      <Nav logo={hero.profileName} />
      <Hero />
      <About />
      <CvDemo />
      <Education />
      <Publications />
      <Projects />
      <Skills />
      <News />
      <Contact />
      <Footer />
    </>
  )
}

export default App
