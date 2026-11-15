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
 * Measured 15 November 2026 on Next 16.4.5 and Roster 5.19.4, a clean copy with
 * `.env.local` beside it. Against `main` at 7746913 (Roster 5.19.0), Roster
 * 5.19.4 alone moved `/specimens` up by 1,727 bytes, its Sheet and Dialog
 * changes reaching the Contact sheet, and no other route. This branch's own
 * code added 101 to every route but `/_global-error` (109 on `/work/[slug]`,
 * 176 on `/specimens`): the text inks in the client components every page
 * carries (the theme toggle, the nav, X-ray, the CRT toggle, breadcrumbs, the
 * TL;DR toggle), RCta's ink, and on `/specimens` Ink swap unsetting the site's
 * inks for each job. The world inks themselves ship as HTML, not first-load JS.
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
  "/": 648_067,
  "/_global-error": 458_409,
  "/_not-found": 648_067,
  "/about": 663_026,
  "/resume": 648_402,
  "/specimens": 868_515,
  "/work": 665_645,
  "/work/[slug]": 669_541,
  "/writing": 665_645,
  "/writing/[slug]": 665_645,
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
