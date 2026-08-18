# blakeb.dev

Portfolio for Blake Ball, built with **Next.js 16**, **React 19**, **Tailwind
CSS v4**, and [`@blakesteve/roster`](https://www.npmjs.com/package/@blakesteve/roster) —
the component library it also happens to be a case study about.

The organizing rule: **anything the site asserts, it should be able to prove.**
Component counts, token values, and Game Verdict's figures are read from their
sources at build time rather than typed. If a number appears without a source,
that is a bug.

## Getting started

```bash
npm install
npm run dev
```

The dev server prefers port 3003. `NEXT_PUBLIC_STORYBOOK_URL` in `.env.local`
points at the deployed Roster Storybook; without it, component names render as
plain text instead of links.

## Two production states

The site has one design in two inks, named after the stages of a print job.

| | Press sheet | Blueline proof |
|---|---|---|
| Role | light | dark |
| Paper | `#e7e8e3` | `#0a0c11` |
| Spot | process magenta | blueprint cyan |

Dark mode is class-based (`.dark` on `<html>`) rather than tied to the OS, so
the toggle can be manual. A blocking script in `app/layout.tsx` sets the class
before first paint; it accepts `"blueline"` alongside `"dark"` so visitors from
before the toggle became Roster's `ThemeToggle` keep their choice.

## The token layer

`app/globals.css` is the whole design system. Three things happen there, in
order, and the order matters:

1. **Cascade layers are declared up front** — `theme, base, components, roster,
   utilities`. Roster must sit above `base` or Tailwind's preflight erases its
   spacing and borders, and below `utilities` so this app's classes still win.
2. **Roster's tokens are remapped.** Each of its nine color families gets one
   `--anchor-*` per state, and the 50–950 ramp is derived from it with
   `color-mix` toward that state's light and dark poles. Move an anchor and the
   ramp moves with it. The anchors are the print shop: process cyan, magenta,
   and yellow take `info`, `primary`, and `amber`.
3. **Semantic steps reference their token** rather than repeating its hex.
   `--roster-gray-500: var(--ink-faint)`, not a copy of the value. Copying is
   how the dark ramp's 300 and 400 ended up swapped, which put every eyebrow one
   step too bright on the proof.

Some values cannot live in `@theme inline`: Roster imports Tailwind's theme
inside `@layer roster`, which sits above this app's `theme` layer, so a
declaration there loses. `--font-mono` and the `--roster-*` overrides are
declared unlayered, where they beat both.

## Live data

| Figure | Source |
|---|---|
| Roster version, component count, tier split | the installed package's own `.d.ts` and `package.json` |
| Employment durations, years shipping | computed from dates in `lib/career.ts`, never written down |
| Token ramps | the shipped `tokens.css` |
| Game Verdict games and verdicts | `GET https://www.gameverdict.app/api/stats`, hourly |

`lib/roster.ts` reads `node_modules` directly rather than resolving the module,
because Roster's exports map does not expose `package.json` and Turbopack cannot
place a CSS file in an ESM chunk.

`lib/game-verdict-stats.ts` degrades rather than throws: an unreachable endpoint
falls back to the written figure, relabels it as a dated snapshot instead of as
live, and warns in the build log. A portfolio deploy should not fail because
another app hiccuped, but it should not quietly stop updating either.

## Writing

Posts are content modules in `content/posts.tsx`, the same shape as the case
studies, so a post uses the site's own components rather than a parallel set of
markdown styles — the pullquotes and inline code are the real Roster ones, and
they repigment with the state and show up under X-ray.

There is no reading-time estimate. The body is JSX rather than text, so it would
have to be typed by hand, and a hand-typed "4 min read" is exactly the kind of
number this site refuses to print.

Hand-authored data that routing depends on gets checked rather than trusted: a
duplicated slug or a date typed `2026-8-14` fails quietly as a 404 or a
malformed byline, so `posts.test.ts` asserts the invariants the type system
cannot.

## Pages

- `/` — folio, hero, live system strip, project cards
- `/work` — the contents page: one dense row per project, no preamble
- `/work/[slug]` — case studies, statically generated per project
- `/system` — the library itself: token ramps shown shipped-versus-remapped, the
  full catalog linked into Storybook, and live component specimens
- `/about` — the arc, the two-ink portrait, and the colophon
- `/writing` and `/writing/[slug]` — posts, as content modules
- `/resume` — the same career data, print-shaped
- `not-found` — 404 as a misprint, the whole sheet out of register

`/work` earns its place beside the home page by answering a different question:
the home page is a pitch you scroll, this is the direct answer for someone who
only wants the work. Both read `projects.ts` and `case-studies.tsx`, so the two
cannot describe a project differently.

## The résumé

`/resume` and the `/about` timeline read one source, `lib/career.ts`, because a
résumé that disagrees with the about page is worse than having neither. Every
duration is computed from its dates.

The browser's print dialog is the PDF export, so the page and the downloadable
file cannot drift apart. `@media print` forces the press sheet regardless of
which state the visitor is in — printing a near-black page wastes a cartridge —
and drops the nav, the footer, and the print button itself.

Dropping a PDF at `public/blake-ball-resume.pdf` adds a download link. Its
presence is checked with `existsSync` at build time rather than assumed, so the
link only appears when the file is really there.

## Guards

`npm run check:ramps` fails if a color ramp is not monotonic — if a step is
lighter than the one before it. It runs on `prebuild`.

It exists because that rule was broken twice by hand, both times by assigning a
step according to what a color was *for* rather than how light it is: once with
`--ink-faint` at 300 and `--ink-soft` at 400, and once with a border color left
at 200 where it sat darker than 700 between two near-white neighbors. Both were
caught by a person looking at `/system`, which is not a process.

## The mark

The logo is a **registration mark** — the crosshair a printer uses to check
that the ink plates line up. This one is deliberately a hair out of register,
which is the only thing that turns a standard printer's symbol into a mark that
belongs to this site. Hover it and the plates snap into alignment.

The offsets are in viewBox units, so they scale with the rendered size. The
first version sat at 14px, where each plate moved about half a pixel and the
misregistration was invisible — fatal for a mark whose whole idea is that you
can see it. It renders at 24px in the folio and 19px in the bar.

It appears once per screen. The home page prints it beside the name, so the
copy in the sticky bar stays hidden until the folio's has scrolled away, handed
over by an `IntersectionObserver` on the folio mark itself. Pages without a
folio just show it. In both places it is a link home, which is also what makes
the snap discoverable: nobody hovers a decorative glyph, everybody hovers the
thing in the top-left corner.

`src/app/icon.svg` carries its own colors and its own `prefers-color-scheme`
swap, because a favicon is a separate document and cannot see the page's
tokens. `src/app/opengraph-image.tsx` generates the share card at build time
from color, crop marks, and the process bar rather than a typeface — loading a
font would put a network dependency on the one artifact with no fallback if the
fetch fails.

## X-ray

Press <kbd>⌥X</kbd> on any page to outline and name every Roster component on it.

Roster's compiled classes are not uniquely prefixed, so there is no dependable
way to detect its components in the DOM. X-ray relies on deliberate annotation
instead: everything the site renders from Roster goes through `lib/roster-ui.tsx`,
which stamps `data-roster="<Name>"`. That keeps the marker honest — if something
is outlined, it really is a Roster component — and keeps the annotation next to
the usage rather than in a table that will drift.

X-ray's own button and legend are built from Roster too, so they carry
`data-xray-ui` and are excluded from both the outlining and the count. Without
it the legend annotates itself, over the top of the list you are reading, and
reports its own Eyebrows as page content.

## The CRT easter egg

The Game Verdict case study describes an easter egg you get to keep, so the page
has one: the Konami code turns the page into a CRT, and the toggle persists in
`localStorage` under `gv-crt`.

There are two ways to reach the toggle, because the code alone cannot be entered
on a phone — no arrow keys — which is the device that section is most likely to
be read on. Reaching the end of the page reveals it as well, which turns
finishing the case study into the discovery. It pulses once on arrival so the
reveal is not spent on a reader looking at the last paragraph.

The two predicates behind that live in `components/crt-reveal.ts`, separated
from the component because both bugs they encode were decision bugs rather than
rendering bugs, and neither needed a DOM to reproduce:

- **Visibility is `on || reachedBottom`**, not "has this ever been unlocked".
  Every click writes to storage, turning the effect *off* included, so keying on
  the presence of the key pinned the control to every later visit and the reveal
  could never happen again. While the scanlines run the control has to stay, as
  it is the only way to stop them.
- **The pulse is keyed on `reachedBottom`**, not on visibility.
  `useSyncExternalStore` serves the server snapshot during hydration and the
  stored value straight after, so visibility flips false to true on every load —
  and the control announced itself each time as though newly found.

## Testing

```bash
npm test          # vitest run
npm run test:watch
```

Vitest, node environment, no jsdom. The suite covers the modules that have
behavior rather than markup, and stops there. The site is almost entirely static
composition, and a component test asserting that a heading renders a heading
buys nothing.

| Module | What is covered |
|---|---|
| `lib/career.ts` | month arithmetic, the open-ended role, singular versus plural units, a position whose title changed in place, and the rounding boundary in `yearsShipping` |
| `lib/game-verdict-stats.ts` | every degradation path: non-ok response, non-object body, unparseable body, both counts null, fetch throwing |
| `lib/roster.ts` | the `.d.ts` parse across both entry points, and the token and ramp readers against the shipped `tokens.css` |
| `content/posts.ts` | date formatting, lookup, sort order, and the data invariants routing depends on: unique slugs, URL-safe slugs, `YYYY-MM-DD` dates, and a dek short enough to survive as a meta description |
| `components/crt-reveal.ts` | when the CRT toggle is visible and when it pulses, across every combination of stored state, scroll position, and latch — including the two shipped regressions |

Three things are worth knowing about how these are written.

The career tests pin the clock. `monthsBetween(start, null)` reads the wall
clock in UTC, so anything asserting a duration to the present sets a fixed
system time first. The boundary case is the one that matters: Nov 2010 to Aug
2026 is 189 months, which is 15.75 years, which every human calls sixteen. That
disagreement between a floor and a reader is the bug the function was written
to fix, and the test holds it in place.

The stats tests assert that nothing throws. This module runs at build time on
Vercel, so a throw fails a deploy that has nothing to do with Game Verdict.
Each failure path has to resolve to `{ games: null, verdicts: null }` and warn.

The Roster tests run against the really installed package, not a fixture. The
failure they exist to catch is a Roster major moving a file so the parser
quietly returns fewer components, and a fixture would keep passing through
exactly that. So they assert shapes and invariants rather than an exact count,
which every minor bump would break for no reason. One of them checks that
`DataTable` is found and that `index.d.ts` does not contain it, which is the
whole argument for reading the second entry point.

The CRT reveal tests are written against extracted predicates rather than the
component, which is why they run in the node environment with everything else.
That was not an aesthetic choice: the reveal shipped broken twice, and both
faults were a wrong predicate rather than anything to do with rendering. Two
cases are named `regression:` and reproduce the reported bugs exactly — a
control pinned open by a single click, and one that re-announced itself on every
load. Each was checked by reintroducing the old expression and confirming the
suite goes red, because a test that passes against the bug it names is worse
than no test.

Nothing covers the pages, the layout, or the X-ray overlay. That is still a
gap, just a smaller and more deliberate one than before.

`check:ramps` is the other automated check, and it only guards color ordering.
It runs on `prebuild`; the tests do not, so a red suite will not block a
deploy.

## Deploying

Vercel, on push. The build fetches gameverdict.app, so it has a network
dependency; the fallback covers an outage, and the build log says when it fired.
