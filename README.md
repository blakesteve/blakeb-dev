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

## Pages

- `/` — folio, hero, live system strip, project cards
- `/work/[slug]` — case studies, statically generated per project
- `/system` — the library itself: token ramps shown shipped-versus-remapped, the
  full catalog linked into Storybook, and live component specimens
- `/about` — the arc, the two-ink portrait, and the colophon
- `/resume` — the same career data, print-shaped

`/work` and `/writing` are linked from the nav and not yet built. `/work` may
end up redundant with the home page, which already lists every project.

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

## X-ray

Press <kbd>⌥X</kbd> on any page to outline and name every Roster component on it.

Roster's compiled classes are not uniquely prefixed, so there is no dependable
way to detect its components in the DOM. X-ray relies on deliberate annotation
instead: everything the site renders from Roster goes through `lib/roster-ui.tsx`,
which stamps `data-roster="<Name>"`. That keeps the marker honest — if something
is outlined, it really is a Roster component — and keeps the annotation next to
the usage rather than in a table that will drift.

## Testing

There is no test suite. The site is almost entirely static composition, and the
parts with real logic — the package reader, the stats fetcher and its fallback,
the date arithmetic in `lib/career.ts` — are verified by hand. That is a gap
rather than a position. The stats fallback and the duration formatting are the
two things most worth covering first.

`check:ramps` is the one automated check, and it only guards color ordering.

## Deploying

Vercel, on push. The build fetches gameverdict.app, so it has a network
dependency; the fallback covers an outage, and the build log says when it fired.
