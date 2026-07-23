/**
 * Writes public/contributions.json — the contribution calendar INCLUDING
 * private repositories.
 *
 * Private contributions are only exposed through GitHub's GraphQL API, and
 * only to a token owned by the user themselves. A public static site can't
 * hold that token, so the fetch happens here at build time and only the
 * resulting daily counts are published. No repository names, no commit
 * messages — the same information GitHub's own "include private
 * contributions" profile setting reveals.
 *
 * With no token the script exits cleanly and the site falls back to the
 * public proxy (public contributions only).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LOGIN = 'Glenndork'
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/contributions.json',
)

const token = process.env.GH_CONTRIB_TOKEN
if (!token) {
  console.log(
    'No GH_CONTRIB_TOKEN set — skipping. The site will show public contributions only.',
  )
  process.exit(0)
}

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

const query = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'glenndork-portfolio-build',
  },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
})

if (!res.ok) {
  console.error(`GitHub API returned ${res.status} ${res.statusText}`)
  process.exit(1)
}

const payload = await res.json()
if (payload.errors?.length) {
  console.error('GraphQL errors:', JSON.stringify(payload.errors, null, 2))
  process.exit(1)
}

const collection = payload.data?.user?.contributionsCollection
const calendar = collection?.contributionCalendar
if (!calendar?.weeks?.length) {
  console.error('No calendar data in response.')
  process.exit(1)
}

const contributions = calendar.weeks.flatMap((week) =>
  week.contributionDays.map((day) => ({
    date: day.date,
    count: day.contributionCount,
    level: LEVELS[day.contributionLevel] ?? 0,
  })),
)

const snapshot = {
  total: calendar.totalContributions,
  privateCount: collection.restrictedContributionsCount ?? 0,
  includesPrivate: true,
  generatedAt: new Date().toISOString(),
  contributions,
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(snapshot))

console.log(
  `Wrote ${contributions.length} days, ${snapshot.total} total contributions ` +
    `(${snapshot.privateCount} from private repos) to public/contributions.json`,
)
