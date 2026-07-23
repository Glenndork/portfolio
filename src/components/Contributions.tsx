import { useEffect, useMemo, useState } from 'react'
import { Section } from '@/components/Section'
import { profile } from '@/data/content'

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type ApiResponse = { total: Record<string, number>; contributions: Day[] }
type State =
  | { status: 'loading' }
  | { status: 'ready'; days: Day[]; total: number }
  | { status: 'error' }

// Public, token-free proxy for the contribution calendar. GitHub's own
// contribution data is GraphQL-only and needs a token, which a static site
// can't hold, so the graph degrades to a plain profile link if this is down.
const ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${profile.githubUser}?y=last`

const LEVEL_STYLE: Record<Day['level'], string> = {
  0: 'rgba(255,255,255,0.06)',
  1: 'rgba(255,255,255,0.25)',
  2: 'rgba(255,255,255,0.45)',
  3: 'rgba(255,255,255,0.7)',
  4: 'rgba(255,255,255,1)',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parse = (iso: string) => new Date(`${iso}T00:00:00`)

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

export function Contributions() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    fetch(ENDPOINT, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiResponse>
      })
      .then((data) => {
        const days = data.contributions ?? []
        if (!days.length) throw new Error('empty')
        const total =
          data.total?.lastYear ?? days.reduce((sum, d) => sum + d.count, 0)
        setState({ status: 'ready', days, total })
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [])

  const weeks = useMemo(
    () => (state.status === 'ready' ? toWeeks(state.days) : []),
    [state],
  )

  // Empty placeholder grid keeps the section from collapsing while loading.
  const grid: (Day | null)[][] = weeks.length
    ? weeks
    : Array.from({ length: 53 }, () => Array<Day | null>(7).fill(null))

  // One label per week column, printed only when the month rolls over.
  const monthLabels = useMemo(() => {
    let last = -1
    return weeks.map((week) => {
      const first = week.find((d): d is Day => d !== null)
      if (!first) return ''
      const month = parse(first.date).getMonth()
      if (month === last) return ''
      last = month
      return MONTHS[month]
    })
  }, [weeks])

  return (
    <Section id="contributions" heading="github activity">
      {state.status === 'error' ? (
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
      ) : (
        <>
          <p className="mb-4 text-[0.95rem] text-muted-foreground">
            {state.status === 'loading' ? (
              <span className="caret">fetching commit history</span>
            ) : (
              <>
                <span className="font-bold text-foreground">{state.total}</span>{' '}
                contributions in the last year
              </>
            )}
          </p>

          <div className="overflow-x-auto pb-2">
            <div className="inline-block min-w-max">
              <div
                aria-hidden="true"
                className="mb-1 grid gap-[3px] text-[10px] text-muted-foreground"
                style={{ gridTemplateColumns: `repeat(${Math.max(weeks.length, 1)}, 11px)` }}
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
      )}
    </Section>
  )
}
