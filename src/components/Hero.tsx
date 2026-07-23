import { cn } from '@/lib/utils'
import { profile } from '@/data/content'
import { TypeGroup, Typed } from '@/components/Typed'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useCallback, useState } from 'react'

export function Hero({ started }: { started: boolean }) {
  const reduced = useReducedMotion()
  const [showLate, setShowLate] = useState(false)

  // The meta row and scroll cue arrive only once the role line has typed out.
  const revealLate = useCallback(() => setShowLate(true), [])

  return (
    <header
      id="top"
      className="mx-auto flex min-h-screen max-w-[920px] flex-col justify-center px-[6vw] pt-[110px] pb-[60px]"
    >
      <TypeGroup active={started} count={3} onComplete={revealLate}>
        <Typed
          order={0}
          as="div"
          className="mb-[22px] text-sm text-muted-foreground"
          segments={[
            { text: 'glenn@dev', className: 'text-foreground' },
            { text: ':~$ whoami' },
          ]}
        />

        <Typed
          order={1}
          as="h1"
          className="text-[clamp(2.6rem,9vw,6rem)] leading-[1.02] font-bold tracking-[-2px] whitespace-pre-line"
          segments={[{ text: 'GLENN B.\n' }, { text: 'VIOLA', className: 'text-muted-foreground' }]}
        />

        <Typed
          order={2}
          as="div"
          keepCaret
          className="mt-[18px] text-[clamp(1rem,3.5vw,1.5rem)] text-foreground"
          segments={[
            { text: 'const ', className: 'text-muted-foreground' },
            { text: 'role ' },
            { text: '= ', className: 'text-muted-foreground' },
            { text: `"${profile.role}"` },
          ]}
        />
      </TypeGroup>

      <div
        className={cn(
          'mt-[34px] flex flex-wrap items-center gap-x-[26px] gap-y-0.5 text-[13.5px] text-muted-foreground',
          !reduced && 'transition-all duration-500 ease-out',
          !reduced && (showLate ? 'translate-y-0 opacity-100' : 'translate-y-2.5 opacity-0'),
        )}
      >
        <span className="meta-item py-[11px]">{profile.degree}</span>
        <span className="meta-item py-[11px]">{profile.location}</span>
        <a
          href={`mailto:${profile.email}`}
          className="inline-block border-b border-dim py-[11px] text-foreground no-underline transition-colors hover:border-foreground focus-visible:border-foreground"
        >
          {profile.email}
        </a>
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-b border-dim py-[11px] text-foreground no-underline transition-colors hover:border-foreground focus-visible:border-foreground"
        >
          github/glenndork ↗
        </a>
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-b border-dim py-[11px] text-foreground no-underline transition-colors hover:border-foreground focus-visible:border-foreground"
        >
          résumé ↗
        </a>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'scrollcue mt-[46px] text-xs tracking-[2px] text-muted-foreground',
          !reduced && 'transition-opacity duration-500',
          !reduced && (showLate ? 'opacity-100' : 'opacity-0'),
        )}
      >
        ↓ scroll
      </div>
    </header>
  )
}
