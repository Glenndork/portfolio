/**
 * Smoke test: mounts the production bundle in jsdom and asserts the page
 * actually renders. Run after `npm run build`.
 *
 * There is no browser in CI, so this is the guard that catches a bundle that
 * builds fine but throws on mount — which for an SPA means a blank page.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distAssets = path.join(root, 'dist/assets')

if (!fs.existsSync(distAssets)) {
  console.error('No dist/ found — run `npm run build` first.')
  process.exit(1)
}

const bundle = fs
  .readdirSync(distAssets)
  .find((f) => f.startsWith('index-') && f.endsWith('.js'))
if (!bundle) {
  console.error('No dist/assets/index-*.js bundle found.')
  process.exit(1)
}
const code = fs.readFileSync(path.join(distAssets, bundle), 'utf8')

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  url: 'https://glenndork.github.io/portfolio/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
})
const { window } = dom

/* --- browser APIs jsdom doesn't implement ------------------------------- */
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  onchange: null,
  dispatchEvent: () => false,
})

const ctxStub = new Proxy({}, { get: () => () => {}, set: () => true })
window.HTMLCanvasElement.prototype.getContext = () => ctxStub

window.IntersectionObserver = class {
  constructor(cb) {
    this.cb = cb
  }
  observe(el) {
    // Report everything as visible so section content renders.
    this.cb([{ isIntersecting: true, target: el }], this)
  }
  unobserve() {}
  disconnect() {}
}

// Stand in for the contributions API with two weeks of known data.
const days = []
const start = new Date('2025-07-27T00:00:00') // a Sunday
for (let i = 0; i < 14; i++) {
  const d = new Date(start)
  d.setDate(start.getDate() + i)
  days.push({ date: d.toISOString().slice(0, 10), count: i, level: Math.min(4, i % 5) })
}
let fetchedUrl = null
window.fetch = (url) => {
  fetchedUrl = String(url)
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ total: { lastYear: 91 }, contributions: days }),
  })
}
window.AbortController = globalThis.AbortController

const errors = []
window.addEventListener('error', (e) => errors.push(e.message))
window.console.error = (...args) => errors.push(args.map(String).join(' '))

/* --- run ---------------------------------------------------------------- */
try {
  const el = window.document.createElement('script')
  el.textContent = code
  // Into <head>, so the source text never pollutes what we assert on.
  window.document.head.appendChild(el)
} catch (err) {
  console.error('BUNDLE THREW ON EVAL:', err)
  process.exit(1)
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(300)

// Dismiss the boot overlay the way a user would.
const skip = [...window.document.querySelectorAll('button')].find((b) =>
  b.textContent.includes('skip intro'),
)
if (skip) skip.click()

const rootEl = window.document.getElementById('root')

// Text arrives progressively (the typewriter reveals a character at a time),
// so poll until everything has settled rather than guessing a sleep.
const checks = [
  ['react mounted', () => rootEl.children.length > 0],
  ['hero name', (t) => t.includes('GLENN B.')],
  ['nav brand', (t) => t.includes('glenn.viola')],
  ['about section', (_t, h) => h.includes('id="about"')],
  ['experience', (t) => t.includes('Information Systems Analyst')],
  ['project iClinicSys', (t) => t.includes('iClinicSys')],
  ['project VAWC', (t) => t.includes('VAWC')],
  ['project Bastion', (t) => t.includes('Bastion')],
  ['project NIO', (t) => t.includes('NIO')],
  ['contributions fetched', () => /github-contributions-api/.test(fetchedUrl ?? '')],
  ['contributions total rendered', (t) => t.includes('91')],
  [
    'contributions cells',
    () => window.document.querySelectorAll('[title*="contribution"]').length > 0,
  ],
  ['skills marquee', (t) => t.includes('Laravel')],
  ['education', (t) => t.includes('Bicol University')],
  ['contact heading', (t) => t.includes('build')],
  ['resume link', (_t, h) => h.includes('/portfolio/assets/resume.pdf')],
  ['linkedin link', (_t, h) => h.includes('linkedin.com/in/glenn-viola')],
  ['footer', (t) => t.includes('Glenn B. Viola')],
  ['boot overlay dismissed', (t) => !t.includes('verifying credentials')],
  ['skip link', (t) => t.includes('Skip to main content')],
]

const DEADLINE = Date.now() + 20000
let results = []
while (true) {
  const text = rootEl.textContent
  const html = rootEl.innerHTML
  results = checks.map(([name, fn]) => [name, Boolean(fn(text, html))])
  if (results.every(([, ok]) => ok) || Date.now() > DEADLINE) break
  await wait(250)
}

let failed = 0
for (const [name, ok] of results) {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
}

const realErrors = errors.filter((e) => !/not wrapped in act|Not implemented/i.test(e))
if (realErrors.length) {
  console.log('\nCONSOLE ERRORS:')
  for (const e of realErrors) console.log('  ' + e.slice(0, 300))
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed`)
process.exit(failed || realErrors.length ? 1 : 0)
