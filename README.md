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

The dev server prefers port 3003. `NEXT_PUBLIC_STORYBOOK_URL` overrides where
Storybook links point; `lib/storybook.ts` falls back to the deployed URL, so
nothing has to be configured for the links to work. Set it to an empty string to
switch them off deliberately.

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

Some values can't live in `@theme inline`: Roster imports Tailwind's theme
inside `@layer roster`, which sits above this app's `theme` layer, so a
declaration there loses. `--font-mono` and the `--roster-*` overrides are
declared unlayered, where they beat both.

`--roster-font-ui` is one of those overrides and is mapped to Archivo. Roster
4.5.0 added it because its components previously set no `font-family` at all
and inherited `body`, which here is Source Serif — so buttons, badges, inputs
and table cells all rendered in a reading face. Two components opt back out on
purpose: `RButton` takes the mono control face through `--control-face`, and
`BothPalettes` rebinds both variables in its "as Roster ships it" column so that
column shows the untouched library rather than this site's type.

## Live data

| Figure | Source |
|---|---|
| Roster version, component count, tier split | the installed package's own `.d.ts` and `package.json` |
| Employment durations, years shipping | computed from dates in `lib/career.ts`, never written down |
| Token ramps | the shipped `tokens.css` |
| Game Verdict games and verdicts | `GET https://api.gameverdict.app/api/stats`, hourly |
| Roster commits | the GitHub API, via `commitsFrom` on the stat |

**Game Verdict's commit count is the one figure here that can not be live**,
because that repo is private and there is nothing for the GitHub reader to
reach. It is therefore the only number on these cards that goes stale silently,
and it had drifted twelve commits before anyone looked. It is counted off
`origin/main` rather than the repo's actual default branch, `dev`, so it counts
shipped work rather than whatever is in flight. Re-check it whenever you touch
that card.

`lib/roster.ts` reads `node_modules` directly rather than resolving the module,
because Roster's exports map does not expose `package.json` and Turbopack can't
place a CSS file in an ESM chunk.

`lib/game-verdict-stats.ts` degrades rather than throws: an unreachable endpoint
falls back to the written figure, relabels it as a dated snapshot instead of as
live, and warns in the build log. A portfolio deploy should not fail because
another app hiccuped, but it should not quietly stop updating either.

## Where the case-study screenshots come from

`src/images/<app>/` holds 75 frames across three apps, and until 14 Sept 2026
exactly one app had a repeatable way to refresh them.

MegaSquad's are captured by `scripts/capture-case-study.mjs` **in the mega-squad
repo**, not here. It drives a real browser over that app's dev server and writes
straight into `src/images/megasquad`. It does not seed demo data: it captures
real dev-API records and aliases the people in them, which is why the case study
shows a league nobody has heard of. Six checks refuse to write a file rather
than warn, and a blocked frame exits non-zero rather than leaving the previous
run's file here, where this repo imports it. That repo's README has the
invocation and the list.

**Frames in here are evidence, so check them by opening them.** A run reported
"No failures" on twenty-four frames that carried a navbar avatar hardcoded to
the string `"AR"` above a row reading "Blake Ball", a display name sitting in a
handle slot, and a real employer's name in a squad description. All three had
already shipped. None of them is a name the guards look for, which is the whole
reason they passed.

game-verdict's 26 frames and retrospect's 15 have no such script yet. They will
go stale the same way MegaSquad's did, which is to say silently, two days after
somebody changes a color. Generalizing that script is on the portfolio roadmap.

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
can not.

## The TL;DR lens

Case studies and posts are written for someone who knows what a cascade layer
is. The lens is for everyone else: every section carries a `dek`, one plain
sentence saying what the section actually means, and the TL;DR toggle reveals
them all.

`dek` is a required prop on `Section` and on a post's `H`, so a section can't
ship without one. The alternative was a test that greps for missing summaries,
which finds the gap a commit later; the type finds it before the build.

The deks are always in the markup. `.dek` collapses them with a `0fr` → `1fr`
grid row, so the lens only decides whether they are shown — which means they are
there for a crawler, and for a reader who never finds the button. The state is a
class on `<html>`, set before paint by the same blocking script that sets the
theme, and read through `useSyncExternalStore` rather than mirrored into React
state.

`components/dek.tsx` renders one. It is a Roster `Alert` at
`colorScheme="current"`, so it inherits the project accent from its wrapper, and
it overrides Alert's UI face in both halves: the label takes the folio mono that
eyebrows and figcaptions use, and the summary itself takes the reading face,
because it is prose sitting among paragraphs rather than a notice. Those
overrides need no `!important` — the `utilities` layer already outranks
`roster`.

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
can't describe a project differently.

## The résumé

`/resume` and the `/about` timeline read one source, `lib/career.ts`, because a
résumé that disagrees with the about page is worse than having neither. Every
duration is computed from its dates.

The browser's print dialog is the PDF export, so the page and the downloadable
file can't drift apart. `@media print` forces the press sheet regardless of
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

`npm run check:bundle` fails if Roster's barrel got pinned as a client
reference, or if client JS crosses a byte ceiling. It runs on `postbuild`,
because unlike the ramp check it reads build output rather than source.

It exists because Roster 4.13.0 regressed a sibling app by 18.49% and every
gate passed identically on the good build and the bad one: vitest resolves
Roster through Node and gets the unshaken barrel, eslint never reads build
output, and `tsc` cares about types. The barrel is derived from the installed
package's `exports` on every run rather than named, and the manifests are
parsed rather than grepped. Both shortcuts have already produced a check that
reported zero problems on a build full of them.

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
swap, because a favicon is a separate document and can't see the page's
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

The panel links each name to its Storybook story. It used to fall back to
declaring "Storybook not deployed yet" — a claim it has no way to verify, and
one that was false in production for as long as the URL defaulted to an empty
string. It now reports only what it can know: whether it was given a link.

## The CRT easter egg

The Game Verdict case study describes an easter egg you get to keep, so the page
has one: the Konami code turns the page into a CRT, and the toggle persists in
`localStorage` under `gv-crt`.

There are two ways to reach the toggle, because the code alone can't be entered
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
npm run typecheck # tsc --noEmit
```

`.github/workflows/ci.yml` runs tests, lint, type check and build on every pull
request. It was added late: for most of this repo's life the only thing running
automatically was `prebuild`, which fires the ramp check on every Vercel deploy.
So a non-monotonic color ramp blocked a release and a red test suite did not,
which is a strange place to have drawn the line.

`typecheck` is `next typegen && tsc --noEmit`, and the typegen half is not
decoration. `next-env.d.ts` and `.next/types/` are both generated and both
gitignored, so a fresh checkout has neither, and `tsc` alone fails with 61
errors: 56 image imports with no module declaration, and five uses of the global
`PageProps` and `LayoutProps`. None of that is visible on a machine with
`next dev` running, because the dev server rewrites both files the moment they
go missing.

Once typegen has run, `tsc --noEmit` is meaningful here, verified by injecting a
type error and watching it fail. Do not carry that command to mega-squad, whose
root config is solution-style: there the same invocation resolves to an empty
program and passes on anything.

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
| `content/deks.test.ts` | that every section in both content files has a dek, that each is long enough to say something and short enough to read, that none repeats another, and that none smuggles in the jargon the lens exists to avoid |
| `lib/storybook.ts` | that the Storybook URL falls back to a real deployment rather than an empty string, which is only observable in a build without `.env.local` |
| `content/case-study-images.test.ts` | that every image a case study renders is imported from that study's own folder, that no slice is silently skipped, and that each illustrated study renders at least one of its own screenshots |
| `content/voice.test.ts` | that the prose in the two `content/` files uses American spellings and never the closed form "cannot", and that the extractor feeding both checks is still reading all of it |

Six things are worth knowing about how these are written.

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

The case-study image test exists because of a real paste. A section written for
the MegaSquad study landed in Roster's, carrying its screenshots with it, and
nothing caught it: the types were fine, the build was fine, and the dek count
was fine, because every one of those checks is blind to which study a section
belongs to. The test slices `case-studies.tsx` by study key, resolves each image
identifier back to the folder it was imported from, and fails if a study renders
another study's folder.

Its own first draft had the hole the tests above exist to shame. A slice whose
key it did not recognize returned early, so any change that split the file
differently would have switched the check off for a whole study and stayed
green — verified by reformatting a nested key to two-space indent, which
truncated the MegaSquad slice to nothing and passed. Two assertions close it:
an unrecognized key now fails, and each study that ships screenshots has to
render at least one of its own. What the test still can't see is a paste that
carries no image, which is a narrower gap than the one it was written for but
not no gap.

The voice test checks the writing, not the code. Two preferences kept slipping
into published copy: British spellings, and the closed form "cannot" where
"can't" or "can not" belongs. Neither is visible to anything else here:
both are valid TypeScript, both render without complaint, and both read as
correct to anyone who does not already know the preference. It scans the prose
with the comments stripped out, because working notes are not published writing.

Its scope is `content/case-studies.tsx` and `content/posts.tsx`, which is where
the writing lives. Copy that renders from `app/` or `components/` is not
scanned; if prose starts accumulating there, widen `FILES` rather than assuming
it is covered.

Its third assertion is aimed at itself. A guard that reads its input wrongly
reports success just as loudly as one that passes honestly, so the extraction
has to prove it still contains a known sentence from each file and has still
dropped a known comment. Without that, a one-character change to the stripper
would turn both real checks into `[] === []` and they would stay green forever.

Nothing covers the pages, the layout, or the X-ray overlay. That is still a
gap, just a smaller and more deliberate one than before.

`check:ramps` and `check:bundle` are the other automated checks, and each
guards one narrow thing: color ordering, and the shape and size of the emitted
bundle. They run on `prebuild` and `postbuild`; the tests do not, so a red
suite will not block a deploy.

## Deploying

Vercel, on push. The build fetches gameverdict.app, so it has a network
dependency; the fallback covers an outage, and the build log says when it fired.
