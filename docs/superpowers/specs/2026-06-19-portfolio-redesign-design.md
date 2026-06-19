# Glenn Viola Portfolio Redesign

## Objective

Redesign Glenn Viola's portfolio as a professional, single-page full-stack developer portfolio that speaks equally well to recruiters, prospective clients, and other developers. The experience should feel technically confident, visually restrained, and memorable without relying on excessive effects.

## Audience and Positioning

The site positions Glenn as a full-stack developer who can carry software from interface through infrastructure. It should communicate engineering depth, product awareness, and practical experience across healthcare systems, desktop security, and applied machine learning.

The site serves three audiences:

- Recruiters should quickly understand Glenn's role, capabilities, and strongest work.
- Clients should see clear evidence of useful systems built around real needs.
- Developers should recognize credible technical choices and implementation depth.

## Selected Visual Direction

The approved direction is **Carbon Precision**: a dark, editorial-technical aesthetic informed by contemporary professional portfolio work.

- Carbon-black page and elevated surfaces
- Warm off-white primary text
- Acid-lime accent used sparingly for focus, status, and calls to action
- Fine neutral borders and controlled contrast between sections
- Large, compact display typography with disciplined spacing
- A visible grid and alignment system rather than decorative card clutter

The typography uses Fontshare families:

- Clash Display for major headings and display statements
- Satoshi for body copy, navigation, labels, and controls

Fallback font stacks must preserve legibility if remote fonts fail.

## Information Architecture

The redesign remains a single page with concise anchored navigation:

1. Sticky navigation: Work, Profile, Contact, and Résumé
2. Hero: role, positioning statement, profile photo, location, and primary work CTA
3. Selected work: iClinicSys, VAWC, Bastion, and NIO
4. Profile and capabilities: short biography, technical strengths, and technology groups
5. Contact close: email, GitHub, LinkedIn, and résumé
6. Compact footer

There will be no placeholder projects, contact form, or separate case-study routes.

## Hero

The hero should immediately communicate the full-stack positioning. The primary statement will focus on building dependable products from interface to infrastructure. Supporting copy will mention healthcare, security, and applied machine learning without overstating experience.

The existing profile photo remains, but receives an editorial treatment that fits the Carbon Precision system: deliberate crop, restrained tonal treatment, stable aspect ratio, and a clear alt description. The hero must remain strong when the image is unavailable.

Availability language remains neutral. Location may be shown as Manila or Philippines without implying active job availability.

## Selected Work

Only four substantial projects appear:

- iClinicSys
- VAWC
- Bastion
- NIO: Speech Analysis

Each project remains concise on the main page rather than opening a separate case study. A project section includes:

- Sequence number and project category
- Project name
- One focused description of the problem and Glenn's contribution
- Technology list
- Available project imagery or a designed typographic visual

Project presentation alternates composition to create rhythm while preserving a consistent information hierarchy. iClinicSys, Bastion, and NIO use existing assets. VAWC uses a typographic system panel because the current HTML references a logo asset that is absent from the repository.

Existing unsupported or placeholder projects are removed.

## Profile and Capabilities

The profile section uses a short professional biography rather than fabricated metrics. It should explain Glenn's interest in maintainable systems and clear product experiences.

Capabilities are grouped by purpose instead of shown as a wall of logos:

- Frontend
- Backend
- Data and databases
- Desktop and applied machine learning
- Developer tools

Existing technology icons may support these groups, but text labels remain the primary accessible representation.

## Contact

The contact experience is intentionally simple. It contains a clear email CTA plus GitHub, LinkedIn, and résumé links. There is no contact form, submission state, or third-party integration.

External links open safely with appropriate `rel` attributes. The résumé remains a direct local PDF link.

## Motion and Interaction

Motion borrows selectively from Skiper UI's image-reveal and hover-detail patterns without copying its visual identity.

- Hero content enters with a short staged reveal.
- Project media reveals when it enters the viewport.
- Project details gain restrained hover and focus feedback.
- Navigation indicates the current section.
- The mobile menu exposes clear expanded and collapsed states.

Motion duration stays primarily between 150 and 300 milliseconds and uses opacity and transforms to avoid layout shift. All effects degrade cleanly under `prefers-reduced-motion: reduce`. Content and actions never depend on hover or animation.

## Responsive Behavior

The layout is mobile-first.

- At small widths, hero content stacks with text before the image.
- Project sections become single-column and preserve the same reading order.
- Navigation changes to an accessible menu with a minimum 44-pixel trigger.
- Long display text scales with `clamp()` and does not create horizontal overflow.
- Desktop content uses a consistent maximum width and controlled text measure.

The design will be checked at 375 pixels and common tablet and desktop widths.

## Accessibility

- Semantic landmarks and sequential heading hierarchy
- Skip link to main content
- Visible keyboard focus states
- Minimum 44-by-44-pixel interactive targets
- Normal text contrast of at least 4.5:1
- Descriptive image alternative text
- Menu state exposed with `aria-expanded` and `aria-controls`
- Current navigation state conveyed by more than color alone
- Reduced-motion behavior
- No information communicated exclusively through imagery, color, or hover

## Technical Architecture

The project remains a lightweight static site.

- `index.html` contains the semantic page structure and portfolio content.
- `assets/styles.css` owns the design tokens, responsive layout, component styling, and motion.
- `assets/script.js` owns mobile navigation, active-section state, and progressive reveal behavior.

The redesign removes dependence on Tailwind's CDN runtime. CSS custom properties provide semantic tokens for color, spacing, typography, motion, and layering. JavaScript is progressive enhancement: navigation links and all content remain usable if scripts fail.

## Failure and Edge Handling

- Missing project imagery falls back to a stable typographic media panel.
- Font loading failure uses local system fallbacks without layout collapse.
- JavaScript failure leaves all sections visible and anchor navigation functional.
- Unsupported intersection observation leaves reveal targets visible.
- External links and local résumé/image paths are verified before delivery.

## Verification

Implementation verification covers:

- Visual inspection at 375-pixel mobile, tablet, and desktop widths
- No horizontal scrolling or fixed-element overlap
- Keyboard traversal and visible focus treatment
- Mobile menu open, close, escape, and link-selection behavior
- Reduced-motion behavior
- Project reveal behavior with and without JavaScript support
- Image, font, résumé, email, GitHub, and LinkedIn links
- Semantic heading and landmark structure
- Browser console errors

## Out of Scope

- New project case-study pages
- Contact form or backend service
- Blog, CMS, analytics dashboard, or admin interface
- Fabricated project metrics or testimonials
- Three-dimensional effects, cursor trails, or motion that competes with content

