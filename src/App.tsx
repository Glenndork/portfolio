import { useCallback, useEffect, useState } from 'react'
import { BootScreen } from '@/components/BootScreen'
import { MatrixRain } from '@/components/MatrixRain'
import { SiteNav } from '@/components/SiteNav'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Experience } from '@/components/Experience'
import { Projects } from '@/components/Projects'
import { Contributions } from '@/components/Contributions'
import { Skills } from '@/components/Skills'
import { Education } from '@/components/Education'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'

export default function App() {
  const [booted, setBooted] = useState(false)
  const finishBoot = useCallback(() => setBooted(true), [])

  // Keep the page from scrolling underneath the boot overlay.
  useEffect(() => {
    document.body.style.overflow = booted ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [booted])

  return (
    <>
      <a
        href="#main-content"
        className="absolute top-0 -left-[9999px] z-[1100] bg-foreground px-[18px] py-3 text-[13px] text-background no-underline focus:left-0"
      >
        Skip to main content
      </a>

      {!booted && <BootScreen onDone={finishBoot} />}

      <MatrixRain />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,.35) 0%, rgba(0,0,0,.8) 100%)',
        }}
      />

      <SiteNav />

      <main id="main-content" className="relative z-[2]">
        <Hero started={booted} />
        <About />
        <Experience />
        <Projects />
        <Contributions />
        <Skills />
        <Education />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
