import { useCallback, useEffect, useState } from 'react'
import { BootScreen } from '@/components/BootScreen'
import { MatrixRain } from '@/components/MatrixRain'
import { Terminal } from '@/components/Terminal'
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

type Mode = 'terminal' | 'gui'
const MODE_KEY = 'gv-mode'

/**
 * A shared link like /portfolio/#projects should land on the readable page,
 * not drop the visitor at a shell prompt.
 */
function initialMode(): Mode {
  if (typeof window === 'undefined') return 'terminal'
  if (window.location.hash.length > 1) return 'gui'
  try {
    return localStorage.getItem(MODE_KEY) === 'gui' ? 'gui' : 'terminal'
  } catch {
    return 'terminal'
  }
}

export default function App() {
  const [booted, setBooted] = useState(false)
  const [mode, setMode] = useState<Mode>(initialMode)

  const finishBoot = useCallback(() => setBooted(true), [])

  const switchTo = useCallback((next: Mode) => {
    setMode(next)
    try {
      localStorage.setItem(MODE_KEY, next)
    } catch {
      /* private mode — the preference just won't persist */
    }
    if (next === 'terminal') window.scrollTo({ top: 0 })
  }, [])

  const toGui = useCallback(() => switchTo('gui'), [switchTo])
  const toTerminal = useCallback(() => switchTo('terminal'), [switchTo])

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

      {mode === 'terminal' ? (
        <main id="main-content">
          <Terminal onLeave={toGui} />
        </main>
      ) : (
        <>
          <SiteNav onOpenTerminal={toTerminal} />
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
      )}
    </>
  )
}
