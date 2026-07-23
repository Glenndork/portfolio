import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COMMAND = [
  { text: 'portfolio', className: 'text-foreground font-bold' },
  { text: ' open', className: 'text-body' },
  { text: ' -u ', className: 'text-muted-foreground' },
  { text: '"Glenn Viola"', className: 'text-foreground border-b border-[#2e2e2e]' },
  { text: ' -p ', className: 'text-muted-foreground' },
  { text: '"*****************"', className: 'text-foreground border-b border-[#2e2e2e]' },
]

const LOG = [
  { key: '[auth]', text: ' verifying credentials ............ ', ok: 'granted' },
  { key: '[init]', text: ' compiling assets ................. ', ok: 'done' },
  { key: '[load]', text: ' modules: hero · about · work · projects · skills', ok: '' },
  { key: '[boot]', text: ' launching interface ', ok: '✓' },
]

const COMMAND_LENGTH = COMMAND.reduce((n, seg) => n + seg.text.length, 0)

/**
 * Fake terminal login shown once on first paint. It always has three ways
 * out: the sequence finishing, the skip control (button or Escape), and a
 * 10s failsafe — the page must never stay hidden behind it.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState(0)
  const [lines, setLines] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const finishing = useRef(false)

  const finish = useRef(() => {
    if (finishing.current) return
    finishing.current = true
    setLeaving(true)
    window.setTimeout(onDone, 550)
  }).current

  // Skip controls + failsafe.
  useEffect(() => {
    if (reduced) {
      onDone()
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    document.addEventListener('keydown', onKey)
    const failsafe = window.setTimeout(finish, 10000)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(failsafe)
    }
  }, [reduced, finish, onDone])

  // Type the command, then stream the log lines, then hand over.
  useEffect(() => {
    if (reduced || finishing.current) return

    if (typed < COMMAND_LENGTH) {
      const t = window.setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 450 : 34)
      return () => window.clearTimeout(t)
    }
    if (lines < LOG.length) {
      const t = window.setTimeout(() => setLines((n) => n + 1), lines === 0 ? 380 : 240)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(finish, 520)
    return () => window.clearTimeout(t)
  }, [typed, lines, reduced, finish])

  if (reduced) return null

  let remaining = typed
  const commandSpans = COMMAND.map((seg, i) => {
    const take = Math.max(0, Math.min(seg.text.length, remaining))
    remaining -= take
    return (
      <span key={i} className={seg.className}>
        {seg.text.slice(0, take)}
      </span>
    )
  })

  return (
    <div
      className={cn(
        'fixed inset-0 z-[1000] flex items-center justify-center bg-black p-[6vw] transition-opacity duration-500',
        leaving && 'pointer-events-none opacity-0',
      )}
    >
      <div className="w-full max-w-[660px]">
        <div className="border border-[#242424] bg-[#060606]">
          <div className="flex items-center gap-[7px] border-b border-[#1a1a1a] px-3.5 py-[11px]">
            <i className="inline-block h-[9px] w-[9px] rounded-full border border-[#3a3a3a]" />
            <i className="inline-block h-[9px] w-[9px] rounded-full border border-[#3a3a3a]" />
            <i className="inline-block h-[9px] w-[9px] rounded-full border border-[#3a3a3a]" />
            <span className="ml-auto text-xs tracking-[0.5px] text-[#777]">
              glenn@portfolio — bash
            </span>
          </div>

          <div className="min-h-[190px] px-[18px] py-5 text-[clamp(12px,3.2vw,14.5px)] leading-[2] text-[#dedede]">
            <div className="break-words whitespace-pre-wrap">
              <span className="font-bold text-foreground">glenn@portfolio</span>
              <span className="text-muted-foreground">:~$</span>&nbsp;
              {commandSpans}
              {typed < COMMAND_LENGTH && <span className="bcursor" />}
            </div>

            <div className="mt-2">
              {LOG.slice(0, lines).map((line) => (
                <div key={line.key} className="bootline text-[#c7c7c7]">
                  <span className="font-bold text-muted-foreground">{line.key}</span>
                  {line.text}
                  {line.ok && <span className="font-bold text-foreground">{line.ok}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={finish}
          className="mt-4 w-full cursor-pointer p-3 text-xs tracking-[1px] text-muted-foreground transition-colors hover:text-foreground"
        >
          skip intro [esc]
        </button>
      </div>
    </div>
  )
}
