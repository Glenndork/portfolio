/**
 * Smoke test: mounts the production bundle in jsdom, drives the terminal with
 * real commands, then switches to the scrolling page and checks it too.
 *
 * There is no browser in CI, so this is the guard that catches a bundle which
 * builds fine but throws on mount — which for an SPA means a blank page.
 *
 * Set LIVE_BUNDLE=<path> to run these assertions against a downloaded copy of
 * the deployed bundle instead of the local dist/ build.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let code
if (process.env.LIVE_BUNDLE) {
  code = fs.readFileSync(process.env.LIVE_BUNDLE, 'utf8')
} else {
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
  code = fs.readFileSync(path.join(distAssets, bundle), 'utf8')
}

const dom = new JSDOM(
  '<!doctype html><html><head></head><body><div id="root"></div></body></html>',
  {
    url: 'https://glenndork.github.io/portfolio/',
    pretendToBeVisual: true,
    runScripts: 'dangerously',
  },
)
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
window.HTMLElement.prototype.scrollIntoView = () => {}
window.scrollTo = () => {}
window.open = () => null

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

// Stand in for the contributions endpoints with two weeks of known data.
const days = []
const start = new Date('2025-07-27T00:00:00') // a Sunday
for (let i = 0; i < 14; i++) {
  const d = new Date(start)
  d.setDate(start.getDate() + i)
  days.push({ date: d.toISOString().slice(0, 10), count: i, level: Math.min(4, i % 5) })
}
const fetched = []
window.fetch = (url) => {
  const href = String(url)
  fetched.push(href)
  // Pretend the build-time snapshot isn't there, exercising the proxy path.
  if (href.includes('contributions.json')) {
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) })
  }
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
const el = window.document.createElement('script')
el.textContent = code
// Into <head>, so the source text never pollutes what we assert on.
window.document.head.appendChild(el)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const rootEl = window.document.getElementById('root')
const text = () => rootEl.textContent
const html = () => rootEl.innerHTML

async function waitFor(predicate, timeout = 8000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (predicate()) return true
    await wait(100)
  }
  return false
}

/** Type a command into the prompt and press Enter, the way a visitor would. */
async function type(command) {
  const input = window.document.querySelector('input')
  if (!input) throw new Error(`no terminal input available (typing "${command}")`)
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  ).set
  setValue.call(input, command)
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  input.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
  )
  await wait(150)
}

const results = []
const check = (name, ok) => results.push([name, Boolean(ok)])

await wait(300)

// Dismiss the boot overlay the way a user would.
const skip = [...window.document.querySelectorAll('button')].find((b) =>
  b.textContent.includes('skip intro'),
)
if (skip) skip.click()

check('react mounted', rootEl.children.length > 0)
check('boot overlay dismissed', await waitFor(() => !text().includes('verifying credentials')))

/* --- terminal mode ------------------------------------------------------ */
check('terminal banner', await waitFor(() => text().includes('GLENN B. VIOLA')))
check('terminal prompt', text().includes('glenn@portfolio'))
check('skip link', text().includes('Skip to main content'))

await type('help')
check('help lists commands', text().includes('list every command'))

await type('ls')
check('ls lists files', text().includes('about.md') && text().includes('projects'))

await type('cat about.md')
check('cat prints about', await waitFor(() => text().includes('Computer Science')))

await type('projects')
check(
  'section shortcut prints projects',
  await waitFor(
    () =>
      text().includes('iClinicSys') &&
      text().includes('VAWC') &&
      text().includes('Bastion') &&
      text().includes('NIO'),
  ),
)

await type('cd projects')
check('cd lists project dir', await waitFor(() => text().includes('iclinicsys')))
check('prompt reflects cwd', text().includes('~/projects'))

await type('cat vawc')
check('cat single project', text().includes('case records'))

await type('cd ..')
await type('tree')
check('tree prints filesystem', text().includes('education.md'))

await type('whoami')
check('whoami prints email', text().includes('glennviola32@gmail.com'))

await type('activity')
check(
  'activity renders graph',
  await waitFor(
    () =>
      text().includes('91') &&
      window.document.querySelectorAll('[title*="contribution"]').length > 0,
  ),
)
check(
  'contributions snapshot tried first',
  fetched.some((u) => u.includes('contributions.json')) &&
    fetched.some((u) => u.includes('github-contributions-api')),
)

await type('experience')
check('experience prints job', await waitFor(() => text().includes('Information Systems Analyst')))

await type('skills')
check('skills print', await waitFor(() => text().includes('Laravel')))

await type('education')
check('education prints school', await waitFor(() => text().includes('Bicol University')))

await type('contact')
check('contact prints links', await waitFor(() => html().includes('linkedin.com/in/glenn-viola')))
check('resume link', html().includes('/portfolio/assets/resume.pdf'))

await type('notacommand')
check('unknown command errors', text().includes('command not found'))

await type('clear')
check('clear empties the screen', await waitFor(() => !text().includes('command not found')))

/* --- gui mode ----------------------------------------------------------- */
await type('gui')
check('gui mode renders hero', await waitFor(() => text().includes('GLENN B.')))
check('gui nav present', text().includes('glenn.viola'))
check(
  'gui sections render',
  await waitFor(
    () => text().includes('Information Systems Analyst') && text().includes('Bicol University'),
    12000,
  ),
)
check('gui has shell toggle', text().includes('$ shell'))

/* --- report ------------------------------------------------------------- */
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

console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed || realErrors.length ? 1 : 0)
