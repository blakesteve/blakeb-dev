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
 * Measured 4 November 2026 on `main` at c4d7fe7 (Next 16.4.0, Roster 5.15.0),
 * a clean copy with `.env.local` beside it, built twice with the same figures.
 * Roster 5.18.0 moved none of them: every JS chunk came out byte-identical.
 *
 * Re-measure when you change one: a figure carried forward from an older tree
 * stops being a measurement. Run `npm run check:bundle` on a fresh build; it
 * prints every route's first load.
 */
export const ROUTE_FIRST_LOAD = {
  "/": 659_503,
  "/_global-error": 457_165,
  "/_not-found": 633_828,
  "/about": 648_667,
  "/resume": 634_163,
  "/system": 725_030,
  "/work": 651_273,
  "/work/[slug]": 655_148,
  "/writing": 651_273,
  "/writing/[slug]": 651_273,
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
