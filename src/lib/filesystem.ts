/**
 * The virtual filesystem the terminal navigates. Every "file" maps to a
 * section of the portfolio, so `cat about.md` prints the about section and
 * `cd projects` walks into the project list.
 */

export type SectionId =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'activity'
  | 'education'
  | 'contact'

export type Entry = {
  name: string
  kind: 'dir' | 'file' | 'exec'
  /** Section rendered by `cat`/`cd`; project leaves filter to one project. */
  section?: SectionId
  project?: string
  summary: string
  children?: Entry[]
}

export const HOME = '~'

export const FS: Entry[] = [
  { name: 'about.md', kind: 'file', section: 'about', summary: 'who I am' },
  {
    name: 'experience.log',
    kind: 'file',
    section: 'experience',
    summary: 'where I have worked',
  },
  {
    name: 'projects',
    kind: 'dir',
    section: 'projects',
    summary: 'four things I built',
    children: [
      {
        name: 'iclinicsys',
        kind: 'file',
        section: 'projects',
        project: 'iClinicSys',
        summary: 'clinic information system',
      },
      {
        name: 'vawc',
        kind: 'file',
        section: 'projects',
        project: 'VAWC',
        summary: 'case management platform',
      },
      {
        name: 'bastion',
        kind: 'file',
        section: 'projects',
        project: 'Bastion',
        summary: 'desktop malware detection',
      },
      {
        name: 'nio',
        kind: 'file',
        section: 'projects',
        project: 'NIO',
        summary: 'speech analysis app',
      },
    ],
  },
  { name: 'skills.json', kind: 'file', section: 'skills', summary: 'languages and tools' },
  { name: 'activity.gh', kind: 'file', section: 'activity', summary: 'github contributions' },
  { name: 'education.md', kind: 'file', section: 'education', summary: 'schooling' },
  { name: 'contact.sh', kind: 'exec', section: 'contact', summary: 'how to reach me' },
]

/** Entries visible at a path, e.g. [] for home or ['projects']. */
export function listDir(path: string[]): Entry[] | null {
  let entries = FS
  for (const part of path) {
    const next = entries.find((e) => e.name === part && e.kind === 'dir')
    if (!next?.children) return null
    entries = next.children
  }
  return entries
}

/** Resolve a user-typed path against the current directory. */
export function resolve(
  cwd: string[],
  input: string,
): { path: string[]; entry: Entry | null; isRoot: boolean } | null {
  const cleaned = input.trim().replace(/^\.\//, '')
  if (cleaned === '' || cleaned === '.') {
    return { path: cwd, entry: null, isRoot: cwd.length === 0 }
  }

  const absolute = cleaned.startsWith('~') || cleaned.startsWith('/')
  const parts = cleaned
    .replace(/^[~/]+/, '')
    .split('/')
    .filter(Boolean)

  let path = absolute ? [] : [...cwd]
  let entry: Entry | null = null

  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      path = path.slice(0, -1)
      entry = null
      continue
    }
    const here = listDir(path)
    if (!here) return null
    const found = here.find((e) => e.name === part)
    if (!found) return null
    entry = found
    if (found.kind === 'dir') path = [...path, part]
  }

  return { path, entry, isRoot: path.length === 0 && !entry }
}

export const promptPath = (cwd: string[]) => [HOME, ...cwd].join('/')

/** Every path a user could tab-complete to, for the current directory. */
export function completions(cwd: string[], fragment: string): string[] {
  const slash = fragment.lastIndexOf('/')
  const dirPart = slash >= 0 ? fragment.slice(0, slash) : ''
  const namePart = slash >= 0 ? fragment.slice(slash + 1) : fragment

  const base = dirPart ? resolve(cwd, dirPart) : { path: cwd, entry: null, isRoot: false }
  if (!base) return []

  const entries = listDir(base.path)
  if (!entries) return []

  return entries
    .filter((e) => e.name.startsWith(namePart))
    .map((e) => (dirPart ? `${dirPart}/${e.name}` : e.name))
}
