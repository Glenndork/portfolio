import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { profile } from '@/data/content'
import { SectionOutput } from '@/components/SectionOutput'
import {
  FS,
  HOME,
  completions,
  listDir,
  promptPath,
  resolve,
  type Entry,
  type SectionId,
} from '@/lib/filesystem'

type Line = { id: number; prompt?: string; input?: string; node: ReactNode }

const COMMANDS: { name: string; usage: string; desc: string }[] = [
  { name: 'help', usage: 'help', desc: 'list every command' },
  { name: 'ls', usage: 'ls [path]', desc: 'list directory contents' },
  { name: 'cd', usage: 'cd <path>', desc: 'change directory and print it' },
  { name: 'cat', usage: 'cat <file>', desc: 'print a file' },
  { name: 'tree', usage: 'tree', desc: 'show the whole filesystem' },
  { name: 'pwd', usage: 'pwd', desc: 'print working directory' },
  { name: 'whoami', usage: 'whoami', desc: 'print the current user' },
  { name: 'open', usage: 'open <target>', desc: 'open github | linkedin | resume | email' },
  { name: 'history', usage: 'history', desc: 'show command history' },
  { name: 'echo', usage: 'echo <text>', desc: 'write text to output' },
  { name: 'date', usage: 'date', desc: 'print the current date' },
  { name: 'clear', usage: 'clear', desc: 'clear the screen  [ctrl+l]' },
  { name: 'gui', usage: 'gui', desc: 'leave the shell for the scrolling page' },
]

const SHORTCUTS: Record<string, string> = {
  about: 'about.md',
  experience: 'experience.log',
  work: 'experience.log',
  projects: 'projects',
  skills: 'skills.json',
  activity: 'activity.gh',
  contributions: 'activity.gh',
  education: 'education.md',
  contact: 'contact.sh',
}

const OPEN_TARGETS: Record<string, string> = {
  github: profile.github,
  linkedin: profile.linkedin,
  resume: profile.resume,
  cv: profile.resume,
  email: `mailto:${profile.email}`,
}

const BANNER = String.raw`
 ██████╗ ██╗     ███████╗███╗   ██╗███╗   ██╗
██╔════╝ ██║     ██╔════╝████╗  ██║████╗  ██║
██║  ███╗██║     █████╗  ██╔██╗ ██║██╔██╗ ██║
██║   ██║██║     ██╔══╝  ██║╚██╗██║██║╚██╗██║
╚██████╔╝███████╗███████╗██║ ╚████║██║ ╚████║
 ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝`

const Muted = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('text-muted-foreground', className)}>{children}</span>
)

const Err = ({ children }: { children: ReactNode }) => (
  <span className="text-destructive">{children}</span>
)

function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      {entries.map((entry) => (
        <div key={entry.name} className="contents">
          <span
            className={cn(
              entry.kind === 'dir' && 'font-bold text-foreground',
              entry.kind === 'exec' && 'text-foreground',
              entry.kind === 'file' && 'text-body',
            )}
          >
            {entry.name}
            {entry.kind === 'dir' ? '/' : entry.kind === 'exec' ? '*' : ''}
          </span>
          <Muted>{entry.summary}</Muted>
        </div>
      ))}
    </div>
  )
}

function Tree({ entries, depth = 0 }: { entries: Entry[]; depth?: number }) {
  return (
    <>
      {entries.map((entry, i) => {
        const last = i === entries.length - 1
        return (
          <div key={entry.name}>
            <div>
              <Muted>{'    '.repeat(depth) + (last ? '└── ' : '├── ')}</Muted>
              <span className={entry.kind === 'dir' ? 'font-bold' : ''}>
                {entry.name}
                {entry.kind === 'dir' ? '/' : ''}
              </span>
            </div>
            {entry.children && <Tree entries={entry.children} depth={depth + 1} />}
          </div>
        )
      })}
    </>
  )
}

export function Terminal({ onLeave }: { onLeave: () => void }) {
  const [cwd, setCwd] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [commandLog, setCommandLog] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(-1)

  const nextId = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const cwdRef = useRef(cwd)
  cwdRef.current = cwd

  const push = useCallback((node: ReactNode, echo?: { prompt: string; input: string }) => {
    setLines((prev) => [
      ...prev,
      { id: nextId.current++, node, prompt: echo?.prompt, input: echo?.input },
    ])
  }, [])

  // Welcome banner.
  useEffect(() => {
    push(
      <div>
        <pre className="hidden overflow-x-auto text-[10px] leading-[1.15] font-bold sm:block">
          {BANNER}
        </pre>
        <p className="text-xl font-bold sm:hidden">GLENN B. VIOLA</p>
        <p className="mt-2 text-muted-foreground">
          {profile.role} · {profile.location}
        </p>
        <p className="mt-4">
          <Muted>Type</Muted> <span className="font-bold">help</span>{' '}
          <Muted>to list commands,</Muted> <span className="font-bold">ls</span>{' '}
          <Muted>to look around, or</Muted> <span className="font-bold">gui</span>{' '}
          <Muted>for the scrolling page.</Muted>
        </p>
      </div>,
    )
  }, [push])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const run = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      const echo = { prompt: promptPath(cwdRef.current), input: raw }

      if (!trimmed) {
        push(null, echo)
        return
      }

      setCommandLog((prev) => [...prev, trimmed])
      setLogIndex(-1)

      const [rawCmd, ...args] = trimmed.split(/\s+/)
      const cmd = rawCmd.toLowerCase()
      const arg = args.join(' ')

      // Bare section names and ./contact.sh style invocations.
      const shortcut = SHORTCUTS[cmd] ?? (cmd.startsWith('./') ? cmd.slice(2) : undefined)
      const effective = shortcut ? 'cat' : cmd
      const target = shortcut ?? arg

      const printSection = (entry: Entry) => {
        push(<SectionOutput section={entry.section as SectionId} project={entry.project} />, echo)
      }

      switch (effective) {
        case 'help':
        case 'man': {
          push(
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              {COMMANDS.map((c) => (
                <div key={c.name} className="contents">
                  <span className="font-bold whitespace-nowrap">{c.usage}</span>
                  <Muted>{c.desc}</Muted>
                </div>
              ))}
              <div className="col-span-2 mt-3">
                <Muted>
                  Section names work on their own too — try{' '}
                  <span className="text-foreground">projects</span> or{' '}
                  <span className="text-foreground">contact</span>. Tab completes, ↑/↓ recalls
                  history.
                </Muted>
              </div>
            </div>,
            echo,
          )
          return
        }

        case 'ls': {
          const spot = target ? resolve(cwdRef.current, target) : { path: cwdRef.current, entry: null, isRoot: false }
          if (!spot) {
            push(<Err>ls: {target}: No such file or directory</Err>, echo)
            return
          }
          if (spot.entry && spot.entry.kind !== 'dir') {
            push(<EntryList entries={[spot.entry]} />, echo)
            return
          }
          const entries = listDir(spot.path)
          push(entries ? <EntryList entries={entries} /> : <Err>ls: cannot access</Err>, echo)
          return
        }

        case 'cd': {
          if (!target || target === '~' || target === '/') {
            setCwd([])
            push(null, echo)
            return
          }
          const spot = resolve(cwdRef.current, target)
          if (!spot) {
            push(<Err>cd: {target}: No such file or directory</Err>, echo)
            return
          }
          if (spot.entry && spot.entry.kind !== 'dir') {
            // cd onto a file is a shell error, but printing it is friendlier.
            printSection(spot.entry)
            return
          }
          setCwd(spot.path)
          const entries = listDir(spot.path)
          push(entries ? <EntryList entries={entries} /> : null, echo)
          return
        }

        case 'cat': {
          if (!target) {
            push(<Err>cat: missing operand</Err>, echo)
            return
          }
          const spot = resolve(cwdRef.current, target)
          if (!spot?.entry) {
            push(<Err>cat: {target}: No such file or directory</Err>, echo)
            return
          }
          printSection(spot.entry)
          return
        }

        case 'tree':
          push(
            <div>
              <div className="font-bold">{HOME}</div>
              <Tree entries={FS} />
            </div>,
            echo,
          )
          return

        case 'pwd':
          push(<span>{promptPath(cwdRef.current)}</span>, echo)
          return

        case 'whoami':
          push(
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              <Muted>name</Muted>
              <span>{profile.name}</span>
              <Muted>role</Muted>
              <span>{profile.role}</span>
              <Muted>degree</Muted>
              <span>{profile.degree}</span>
              <Muted>location</Muted>
              <span>{profile.location}</span>
              <Muted>email</Muted>
              <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>,
            echo,
          )
          return

        case 'open': {
          const url = OPEN_TARGETS[target.toLowerCase()]
          if (!url) {
            push(
              <Err>open: unknown target — try {Object.keys(OPEN_TARGETS).join(', ')}</Err>,
              echo,
            )
            return
          }
          window.open(url, '_blank', 'noopener,noreferrer')
          push(
            <span>
              <Muted>opening</Muted> {url}
            </span>,
            echo,
          )
          return
        }

        case 'history':
          push(
            <div className="flex flex-col">
              {commandLog.map((entry, i) => (
                <span key={i}>
                  <Muted>{String(i + 1).padStart(3, ' ')} </Muted>
                  {entry}
                </span>
              ))}
            </div>,
            echo,
          )
          return

        case 'echo':
          push(<span>{arg}</span>, echo)
          return

        case 'date':
          push(<span>{new Date().toString()}</span>, echo)
          return

        case 'clear':
          setLines([])
          return

        case 'gui':
        case 'exit':
        case 'quit':
          push(<Muted>switching to the scrolling page…</Muted>, echo)
          window.setTimeout(onLeave, 260)
          return

        case 'sudo':
          push(<Muted>nice try. {profile.name.split(' ')[0]} is not in the sudoers file.</Muted>, echo)
          return

        default:
          push(
            <Err>
              {cmd}: command not found — type <span className="text-foreground">help</span>
            </Err>,
            echo,
          )
      }
    },
    [push, onLeave, commandLog],
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
      return
    }

    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!commandLog.length) return
      const next = logIndex < 0 ? commandLog.length - 1 : Math.max(0, logIndex - 1)
      setLogIndex(next)
      setInput(commandLog[next])
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (logIndex < 0) return
      const next = logIndex + 1
      if (next >= commandLog.length) {
        setLogIndex(-1)
        setInput('')
      } else {
        setLogIndex(next)
        setInput(commandLog[next])
      }
      return
    }

    if (e.key === 'Tab') {
      // Only hijack Tab mid-command; an empty prompt must still move focus.
      if (!input) return
      e.preventDefault()

      const parts = input.split(/\s+/)
      const last = parts[parts.length - 1]
      const options =
        parts.length === 1
          ? [...COMMANDS.map((c) => c.name), ...Object.keys(SHORTCUTS)].filter((n) =>
              n.startsWith(last),
            )
          : completions(cwd, last)

      if (options.length === 1) {
        parts[parts.length - 1] = options[0]
        setInput(parts.join(' '))
      } else if (options.length > 1) {
        push(<Muted>{options.join('    ')}</Muted>)
      }
    }
  }

  return (
    <div
      className="relative z-[2] flex min-h-screen flex-col px-[4vw] py-6"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col border border-[#242424] bg-[#060606]/85 backdrop-blur-[2px]">
        <div className="flex items-center gap-[7px] border-b border-[#1a1a1a] px-3.5 py-[11px]">
          <i className="inline-block h-[9px] w-[9px] rounded-full border border-[#3a3a3a]" />
          <i className="inline-block h-[9px] w-[9px] rounded-full border border-[#3a3a3a]" />
          <i className="inline-block h-[9px] w-[9px] rounded-full border border-[#3a3a3a]" />
          <span className="ml-auto text-xs tracking-[0.5px] text-[#777]">
            glenn@portfolio — bash
          </span>
          <button
            type="button"
            onClick={onLeave}
            className="ml-3 cursor-pointer border border-[#3a3a3a] px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            classic view
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 text-[13.5px] leading-[1.75] sm:px-5">
          <div role="log" aria-live="polite" aria-label="Terminal output">
            {lines.map((line) => (
              <div key={line.id} className="mb-1">
                {line.prompt !== undefined && (
                  <div className="break-all">
                    <span className="font-bold text-foreground">glenn@portfolio</span>
                    <Muted>:{line.prompt}$</Muted> {line.input}
                  </div>
                )}
                {line.node && <div className="mb-2">{line.node}</div>}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 break-all">
            <span className="sr-only">Terminal command input</span>
            <span className="font-bold whitespace-nowrap text-foreground">glenn@portfolio</span>
            <Muted className="whitespace-nowrap">:{promptPath(cwd)}$</Muted>
            <input
              ref={inputRef}
              value={input}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 border-none bg-transparent text-foreground caret-white outline-none"
            />
          </label>
          <div ref={endRef} />
        </div>

        {/* Tapping beats typing on a phone. */}
        <div className="flex flex-wrap gap-2 border-t border-[#1a1a1a] px-4 py-3 sm:px-5">
          {['help', 'ls', 'about', 'projects', 'activity', 'contact', 'gui'].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                run(cmd)
                setInput('')
                inputRef.current?.focus()
              }}
              className="min-h-9 cursor-pointer border border-[#2a2a2a] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
