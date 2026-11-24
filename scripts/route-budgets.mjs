/**
 * First-load client JS per route, in bytes: what a visitor downloads to open
 * that page, and the figure `check-bundle-shape.mjs` budgets.
 *
 * Counted the way Next loads it: the build manifest's `rootMainFiles` plus
 * every file in the route's client-reference `entryJSFiles` (its layouts, its
 * page and the boundaries Next lists with them), each file once. Polyfills are left out: `polyfillFiles` loads
 * only in browsers without module support, it's the same file on every route,
 * and no change in this app moves it.
 *
 * Each route's cap is its figure here plus `ROUTE_SLACK`. A route the build
 * has and this table doesn't, or the other way round, fails the guard rather
 * than going unbudgeted: add or remove its row, measured.
 *
 * Why per route, and not the total it replaced: Turbopack writes shared code
 * once per group of routes, so the whole-build total counted a chunk once for
 * every copy. A regrouping nobody downloads twice could fail the build, and
 * real growth could hide behind a chunk that happened to merge. A route's
 * first load is what its visitor pays, whichever way the chunks fall.
 *
 * Measured 23 November 2026 on Next 16.4.5 and Roster 5.23.0, a clean copy with
 * `.env.local` beside it. Against `main` at f57bab0 (Roster 5.19.4), 5.23.0 alone
 * moved every route but `/_global-error` up by 1,417 bytes, and `/specimens` by
 * 4,169. This branch's own code took 108 back on each, most of it `REyebrow`'s
 * `wraps` prop, which 5.20.0 made needless. The worlds, the color bar
 * and the focus styles ship as HTML and CSS.
 *
 * On 8 November, on Roster 5.19.0, the Contact sheet had moved `/specimens` up
 * by 26,568: about 8.9 kB the sheet, the rest Turbopack keeping one copy of
 * each shared module with every export the lazy tier chunks use, which also
 * moved every other route but `/_global-error` by 3,198.
 *
 * Re-measure when you change one: a figure carried forward from an older tree
 * stops being a measurement. Run `npm run check:bundle` on a fresh build; it
 * prints every route's first load.
 */
export const ROUTE_FIRST_LOAD = {
  "/": 649_376,
  "/_global-error": 458_409,
  "/_not-found": 649_376,
  "/about": 664_335,
  "/resume": 649_711,
  "/specimens": 872_576,
  "/work": 666_954,
  "/work/[slug]": 670_850,
  "/writing": 666_954,
  "/writing/[slug]": 666_954,
};

/**
 * What a change can add to one route's first load without saying so: the same
 * on every route, because a visitor's download grows by bytes, not by a share
 * of the page.
 *
 * 25,000 is BB's Grove's figure, kept here because its argument is about what
 * a component costs rather than about that app: it clears an ordinary Roster
 * control and fails the heavy ones that should be argued for. A barrel pin, the
 * regression this guard was written for, ships every Roster component to the
 * routes that pin it, well past this. About 3.8% of a typical route here, under
 * the 4.76% the old total's ceiling carried.
 */
export const ROUTE_SLACK = 25_000;
