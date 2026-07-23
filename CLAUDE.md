# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glenn Viola's personal portfolio — a single-page static site with zero build tooling, no package manager, and no external dependencies (system monospace only, no webfonts). There are no tests or linters.

## Development

Open `index.html` directly in a browser, or serve locally:

```
python -m http.server 8000
```

## Architecture

Three files carry the whole site:

- `index.html` — semantic page structure and all content. Anchored sections: hero (`#top`), about (`#about`), experience (`#experience`), projects (`#projects`), skills (`#skills`), education (`#education`), contact (`#contact`).
- `assets/styles.css` — the single **"Terminal"** theme: black canvas, system monospace, hairline `#1e1e1e` rules, no color accent. Texture comes from the falling-code canvas and the vignette, not from hue.
- `assets/script.js` — progressive enhancement only: falling-code canvas, marquee duplication, scroll reveals, char-by-char typewriter, and the terminal boot sequence.

**Progressive enhancement is structural, not optional.** The inline head script adds `.js` to `<html>`; every hiding rule (`.type{visibility:hidden}`, `.reveal{opacity:0}`, `body.booting{overflow:hidden}`) is scoped under `.js`, and `html:not(.js) #boot{display:none}` keeps the boot overlay out of the way. Without that scoping the page renders blank with scripting off — do not write an unscoped hiding rule.

The boot overlay always has three ways out: the normal sequence, the skip button / <kbd>Esc</kbd> (`[data-boot-skip]`), and a 10s failsafe. Any change to the sequence must keep all three working.

JS and HTML are wired through classes the script owns (`.type`, `.reveal`, `.late`) plus `data-loop` / `data-boot-skip`; state is applied as classes (`typing`, `typed`, `in`, `show`, `gone`).

## Design System

All color/spacing/typography values live as tokens in `:root` of `assets/styles.css`. When changing visuals, edit tokens rather than hardcoding values. The prior design spec is `docs/superpowers/specs/2026-06-19-portfolio-redesign-design.md`; its visual direction is superseded, but its content and accessibility constraints still apply.

Constraints that future changes must preserve:

- Exactly four projects (iClinicSys, VAWC, Bastion, NIO); no placeholder projects, contact form, case-study pages, or fabricated metrics.
- Motion: opacity/transforms only (no layout shift); everything degrades under `prefers-reduced-motion: reduce`, which also drops the canvas and stops the marquees.
- Accessibility is a hard requirement: semantic landmarks, skip link, visible focus states, 44px minimum touch targets, 4.5:1 text contrast. Every section is named via `aria-labelledby` on its `.tag` heading.
- Verify at 375px mobile width plus tablet/desktop; no horizontal overflow.
