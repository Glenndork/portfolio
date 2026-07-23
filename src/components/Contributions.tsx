import { useEffect, useMemo, useState } from 'react'
import { Section } from '@/components/Section'
import { profile } from '@/data/content'

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type Snapshot = {
  total: number
  contributions: Day[]
  includesPrivate: boolean
  generatedAt?: string
}
type State = { status: 'loading' } | ({ status: 'ready' } & Snapshot) | { status: 'error' }

/**
 * Contribution data comes from two places, in order:
 *
 * 1. `contributions.json`, generated during CI by scripts/fetch-contributions.mjs
 *    using a token held as a repo secret. This is the only way to include
 *    PRIVATE contributions — GitHub exposes them via GraphQL only, and a
 *    public static site can't hold a token to ask for them at runtime.
 * 2. A public token-free proxy, which sees public activity only. Used when the
 *    snapshot is missing (e.g. the secret isn't configured yet).
 *
 * If both fail the section degrades to a plain profile link.
 */
const SNAPSHOT_URL = `${import.meta.env.BASE_URL}contributions.json`
const PROXY_URL = `https://github-contributions-api.jogruber.de/v4/${profile.githubUser}?y=last`

const LEVEL_STYLE: Record<Day['level'], string> = {
  0: 'rgba(255,255,255,0.06)',
  1: 'rgba(255,255,255,0.25)',
  2: 'rgba(255,255,255,0.45)',
  3: 'rgba(255,255,255,0.7)',
  4: 'rgba(255,255,255,1)',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parse = (iso: string) => new Date(`${iso}T00:00:00`)

async function loadSnapshot(signal: AbortSignal): Promise<Snapshot> {
  const snap = await fetch(SNAPSHOT_URL, { signal }).catch(() => null)
  if (snap?.ok) {
    const data = (await snap.json()) as Snapshot
    if (data?.contributions?.length) {
      return { ...data, includesPrivate: Boolean(data.includesPrivate) }
    }
  }

  const res = await fetch(PROXY_URL, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as {
    total?: Record<string, number>
    contributions?: Day[]
  }
  const contributions = data.contributions ?? []
  if (!contributions.length) throw new Error('empty')

  return {
    contributions,
    total: data.total?.lastYear ?? contributions.reduce((sum, d) => sum + d.count, 0),
    includesPrivate: false,
  }
}

/** Chunk the flat day list into Sunday-started week columns. */
function toWeeks(days: Day[]) {
  const weeks: (Day | null)[][] = []
  let current: (Day | null)[] = []

  days.forEach((day, i) => {
    const dow = parse(day.date).getDay()
    if (i === 0 && dow !== 0) current = Array<Day | null>(dow).fill(null)
    current.push(day)
    if (dow === 6) {
      weeks.push(current)
      current = []
    }
  })

  if (current.length) {
    while (current.length < 7) current.push(null)
    weeks.push(current)
  }
  return weeks
}

export function ContributionsBody() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    loadSnapshot(controller.signal)
      .then((snap) => setState({ status: 'ready', ...snap }))
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [])

  const weeks = useMemo(
    () => (state.status === 'ready' ? toWeeks(state.contributions) : []),
    [state],
  )

  // Empty placeholder grid keeps the section from collapsing while loading.
  const grid: (Day | null)[][] = weeks.length
    ? weeks
    : Array.from({ length: 53 }, () => Array<Day | null>(7).fill(null))

  // One label per week column, printed only when the month rolls over.
  const monthLabels = useMemo(() => {
    let last = -1
    return grid.map((week) => {
      const first = week.find((d): d is Day => d !== null)
      if (!first) return ''
      const month = parse(first.date).getMonth()
      if (month === last) return ''
      last = month
      return MONTHS[month]
    })
  }, [grid])

  if (state.status === 'error') {
    return (
      <p className="text-[0.95rem] text-muted-foreground">
        Couldn&apos;t load the contribution graph right now —{' '}
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-dim text-foreground no-underline transition-colors hover:border-foreground"
        >
          view it on GitHub ↗
        </a>
      </p>
    )
  }

  return (
    <>
      <p className="mb-4 text-[0.95rem] text-muted-foreground">
        {state.status === 'loading' ? (
          <span className="caret">fetching commit history</span>
        ) : (
          <>
            <span className="font-bold text-foreground">{state.total}</span> contributions in the
            last year
            <span className="text-dim">
              {' '}
              · {state.includesPrivate ? 'public + private' : 'public only'}
            </span>
          </>
        )}
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          <div
            aria-hidden="true"
            className="mb-1 grid gap-[3px] text-[10px] text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${Math.max(grid.length, 1)}, 11px)` }}
          >
            {monthLabels.map((label, i) => (
              <span key={i} className="whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>

          <div
            role="img"
            aria-label={
              state.status === 'ready'
                ? `GitHub contribution graph: ${state.total} contributions in the last year`
                : 'Loading GitHub contribution graph'
            }
            className="grid grid-flow-col gap-[3px]"
            style={{ gridTemplateRows: 'repeat(7, 11px)' }}
          >
            {grid.map((week, wi) =>
              week.map((day, di) => (
                <span
                  key={`${wi}-${di}`}
                  title={
                    day
                      ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`
                      : undefined
                  }
                  className="h-[11px] w-[11px] border border-border"
                  style={{
                    backgroundColor: day ? LEVEL_STYLE[day.level] : 'transparent',
                    borderColor: day && day.level > 0 ? 'transparent' : undefined,
                    visibility: day ? 'visible' : 'hidden',
                  }}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-dim text-foreground no-underline transition-colors hover:border-foreground"
        >
          github.com/{profile.githubUser} ↗
        </a>
        <div className="flex items-center gap-1.5">
          <span>less</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <span
              key={level}
              className="h-[11px] w-[11px] border border-border"
              style={{
                backgroundColor: LEVEL_STYLE[level],
                borderColor: level > 0 ? 'transparent' : undefined,
              }}
            />
          ))}
          <span>more</span>
        </div>
      </div>
    </>
  )
}

export function Contributions() {
  return (
    <Section id="contributions" heading="github activity">
      <ContributionsBody />
    </Section>
  )
}
