# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glenn Viola's personal portfolio: a single-page React app in the **"Terminal"** design — black canvas, system monospace, falling-code backdrop, boot sequence, typewriter reveals. Vite + React + Tailwind v4 + shadcn/ui. Deployed to GitHub Pages at <https://glenndork.github.io/portfolio/>.

## Development

```
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run smoke      # jsdom smoke test against dist/ (run build first)
npm run typecheck  # tsc --noEmit
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`: build → smoke test → upload `dist/` → deploy. The Pages source is **GitHub Actions**, not a branch — do not switch it back to branch-serving, since the repo root holds source, not the built site.

**`base: '/portfolio/'` in `vite.config.ts` is load-bearing.** The site is served from a repo subpath; without it every asset URL resolves at the domain root and the deployed page renders blank. Anything referencing a file in `public/` must go through `import.meta.env.BASE_URL` (see `profile.resume` in `src/data/content.ts`), never a bare `/assets/...`.

## Architecture

- `src/data/content.ts` — all copy: profile, about, experience, projects, skills, education, nav. Edit content here, not in components.
- `src/components/Typed.tsx` — `TypeGroup` + `Typed` drive the terminal typewriter. Children declare their position with an explicit `order` prop; **don't replace this with a mount-order registry**, since StrictMode's double-mount skews the count. `TypeGroup` takes `count` + `onComplete` for sequencing follow-on UI (the hero's meta row waits on it).
- `src/components/Section.tsx` — shared shell: scroll reveal, `aria-labelledby`, and the `TypeGroup` for its contents.
- `src/components/BootScreen.tsx` — the login overlay. It must always keep three ways out: the sequence completing, the skip control (button or Escape), and the 10s failsafe.
- `src/components/Contributions.tsx` — GitHub contribution graph. GitHub's own contribution data is GraphQL-only and needs a token a static site can't hold, so this reads a public token-free proxy (`github-contributions-api.jogruber.de`) and **must** degrade to a plain profile link when the request fails.
- `src/components/ui/` — shadcn components. Regenerate with `npx shadcn@latest add <name>`; don't hand-edit beyond what the CLI writes.
- `public/assets/` — images and `resume.pdf`, copied verbatim into the build. Old asset URLs still resolve.

Design tokens live in `:root` in `src/index.css`: a bespoke `--term-*` palette, with the shadcn variables (`--background`, `--border`, …) mapped onto it. There is no light mode, and all radii are `0`. Edit tokens rather than hardcoding values. Pseudo-element and keyframe pieces (`.tag`, `.entry`, `.marquee`, `.caret`) live in that file too — clearer there than as utility soup in components.

## Constraints

- Exactly four projects (iClinicSys, VAWC, Bastion, NIO); no placeholder projects, contact form, case-study pages, or fabricated metrics.
- Motion: opacity/transforms only. Everything degrades under `prefers-reduced-motion: reduce`, which also drops the rain canvas and stops the marquees.
- Accessibility is a hard requirement: semantic landmarks, skip link, visible focus states, 44px minimum touch targets, 4.5:1 text contrast, every section named via `aria-labelledby`.
- Verify at 375px mobile width plus tablet/desktop; no horizontal overflow.
- Being an SPA, the page needs JavaScript. `index.html` carries a `<noscript>` block with contact details and the résumé link — keep it in sync if those change.
- `npm run smoke` is the guard against a bundle that builds but throws on mount. Add a check there when adding a section.
