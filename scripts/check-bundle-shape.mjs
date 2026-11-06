/**
 * Fails the build if Roster's barrel got pinned as a client reference, if a
 * route's first-load JS crossed its budget, if emitted CSS crossed its ceiling,
 * or if the emitted CSS has a hover rule a phone would apply.
 *
 * Roster 4.13.0 regressed a sibling app by 18.49% and nobody found out until
 * somebody measured by hand. Every gate this app has is blind to it: vitest
 * resolves Roster through Node and gets the unshaken barrel, eslint reads
 * source and never build output, and `tsc` cares about types. A build that
 * ships twice the JS is green four times over.
 *
 * Three assertions, because the failure has three shapes.
 *
 * SHAPE. The app imports Roster only through the root barrel. Since the
 * boundary moved, each component the app actually uses is pinned as its own
 * client module and the barrel itself stays bare. If any Roster barrel appears
 * in a client reference manifest, its whole namespace is a live root again and
 * every component ships whether imported or not. That is the 18.49%.
 *
 * SIZE. Shape is the known mechanism, not the only one. The per-route budgets
 * (`route-budgets.mjs`) and the CSS ceiling catch a regression that arrives
 * some other way, including from outside Roster.
 *
 * And one about what the stylesheet says rather than how big it is.
 *
 * HOVER. Every `:hover` rule in the emitted CSS sits inside
 * `@media (hover: hover)`, or a phone's tap leaves it lit. `lib/hover-guard.mjs`
 * says why, and holds the short allow-list of rules that apply everywhere.
 *
 * COVERAGE. Both of the above are upper bounds, and an upper bound is satisfied
 * by measuring nothing. Every count and every byte sum the success line prints
 * as evidence has a floor under it, because this check has reported health
 * while examining an empty set more than once. Zero is not a low enough floor:
 * relocating the chunks out of `static`, which is what an adapter has already
 * done once, leaves 447 bytes of Next build manifests behind, and that cleared
 * a zero floor and passed.
 *
 * Four things this gets right on purpose, each of which has been got wrong
 * once already:
 *
 * 1. The barrel path is DERIVED from the installed package, never hardcoded.
 *    It is `dist/roster.js` today and was `dist/roster.es.js` at 4.12.1. A
 *    check that hardcodes the current name fails OPEN against the old one:
 *    it reports zero pins and passes on a build full of them.
 *
 * 2. The manifests are PARSED, not grepped. Each one assigns an object to
 *    `globalThis.__RSC_MANIFEST`, so it is run in a vm context and walked as
 *    data. A regex over the text has already reported 0 on this app, which
 *    had 99 entries at the time.
 *
 * 3. A `name: "*"` entry against a COMPONENT module is correct and passes.
 *    It means that component is pinned whole, which is what a client component
 *    imported by a server component is supposed to be. Only a barrel matters.
 *
 * 4. A Roster key that is neither a barrel, a component nor a stylesheet is a
 *    FAILURE, not a component. The classifier used to count anything it did not
 *    recognize as healthy, so an unknown path shape did not merely slip past,
 *    it incremented the counter that exists as proof the check was looking.
 *
 * This reads build output, so it runs as `postbuild`, after `next build`.
 */

import { readFileSync, existsSync, readdirSync, statSync, lstatSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";
import { createContext, runInContext } from "node:vm";
import { HOVER_ALLOW, checkHover } from "./lib/hover-guard.mjs";
import { ROUTE_FIRST_LOAD, ROUTE_SLACK } from "./route-budgets.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = "@blakesteve/roster";

/**
 * Emitted client JS, in bytes: every .js anywhere under the build's `static`
 * directory, walked recursively. REPORTED, NOT GATED, since 4 November 2026.
 *
 * This total counts each route's copy of shared code once per copy, because
 * Turbopack writes shared code once per group of routes, and a visitor opens
 * one route and downloads one copy. So the sum moves when the grouping moves,
 * whether or not anyone's download did. What fails the build now is each
 * route's first load, budgeted in `route-budgets.mjs` and checked in section 4.
 * The total stays in the success line because a jump in it is still worth a
 * look, and it keeps its floor, which is about whether the output was found.
 * Its last ceiling was 963,413. The history below is that ceiling's.
 *
 * Recursive, and not the `static/chunks` subdirectory, because that name is not
 * guaranteed. Vercel's adapter relocates the client assets: a real deploy had a
 * `static` with no `chunks` in it, which failed this check twice. Summing every
 * emitted .js under `static` holds whatever the layout is, and is also what the
 * heading actually claims.
 *
 * Measured 13 October 2026 on Next 16.4.0 and Roster 5.9.0: 919,626 bytes
 * across 19 files. The ceiling allows 43,787 bytes of slack, 4.7614%, which is
 * room for the ordinary drift of adding posts and case studies between Roster
 * bumps and far below the 18.49% class of regression this exists to catch.
 * Raise it in a commit that says what grew and why, rather than to make a red
 * build green.
 *
 * What grew in this raise, from 900,763 on Next 16.3.0 and Roster 5.0.0: 16,914
 * bytes from Next 16.4.0 alone (built with Roster held at 5.0.0), 1,840 from
 * Roster 5.9.0, and 109 from the same branch's `REyebrow` `wraps` prop. The
 * first measurement, 18 September, was 897,277.
 */

/**
 * Ceiling on emitted client CSS, same walk, every .css under `static`.
 *
 * Raised 5 November 2026 for Ink swap, from 261,563. `main` at f564b7a on Roster
 * 5.19.0 measures 252,474. Ink swap's route stylesheet, Bragging Rocks' printed edges and the `@font-face`
 * rules take
 * that to 272,774, 11,211 over. It's wanted, and it's on `/specimens` alone: no
 * other route loads it. 285,762 keeps the 4.7614% slack.
 *
 * Raised 4 November 2026 for Roster 5.18.0, from 248,011. The same tree
 * measured 243,859 on 5.15.0 (c4d7fe7) and 249,675 on 5.18.0, 1,664 over. All
 * 5,816 bytes of that are Roster's stylesheet, 166,257 to 172,073 on disk: new
 * utilities and tokens for `Timeline`, `RadioTileGroup` and `FileUpload`'s
 * preview, none of which this app uses yet, because the stylesheet ships whole.
 * No rule in the 5.15.0 build was removed or changed. The app's own CSS didn't
 * move, and every JS chunk is byte-identical. 261,563 keeps the 4.7614% slack.
 *
 * The history below is the 248,011 ceiling's.
 *
 * Measured 13 October 2026 on Next 16.4.0 and Roster 5.9.0: 236,739 bytes
 * across 2 files. The ceiling allows 11,272 bytes of slack, 4.7614%.
 *
 * What grew, from 219,533: 17,246 bytes of Roster's stylesheet between 5.0.0
 * and 5.9.0, then -146 from Next 16.4.0 with the same branch's one-line font
 * fix, and 106 for the `leading-normal` that `REyebrow`'s `wraps` prop adds.
 * That crossed the old ceiling of 228,931 (set on 18 September at 218,526
 * bytes) by 7,808.
 *
 * That slack was set EQUAL to the JS ceiling's 4.7614%, on purpose, and not
 * tighter, while the JS total still had a ceiling. Equal to four decimal places
 * rather than approximately, which is why the numbers were 963,413 and 248,011
 * and not round ones: a round 248,000 comes out at 4.7567%, and a comment
 * claiming equality while printing two different figures is the exact defect
 * this paragraph existed to call out. Two other apps claimed their CSS budget
 * was "tighter than the JS budget on purpose" when in both it was looser. This
 * one was equal, because nothing about CSS here drifts more slowly than JS:
 * both grow when a post or a case study is added, and both are dominated by
 * the same dependency.
 *
 * Roster's stylesheet is 157,653 bytes, 66.6% of a 236,633-byte build of this
 * branch before the `wraps` prop, measured DIFFERENTIALLY: built once with the
 * two `@import` lines in `globals.css` and once without, and subtracted. 78,980
 * bytes without them. (On 18 September,
 * on Roster 5.0.0: 141,023 of 218,526, or 64.5%.)
 *
 * Do not re-derive that share by dividing `roster.css`'s on-disk size by the
 * total. On disk it is 159,415 plus 2,790 of `tokens.css`, which divides out to
 * 68.5% and is wrong in the loose direction here. It is wrong in the other
 * direction elsewhere: in a sibling app the stylesheet expands about 18,000
 * bytes through Tailwind and the on-disk figure understates its share by nine
 * points. The expansion is a property of the consuming app's Tailwind config,
 * not of Roster, so the only figure worth quoting is one measured this way in
 * this app.
 *
 * This is the ceiling that reports the day Roster's stylesheet changes shape.
 */
const CLIENT_CSS_CEILING = 285_762;

const problems = [];

/**
 * Every file under `dir`, recursively.
 *
 * `lstat`, so a dangling symlink is a leaf rather than a throw. `statSync`
 * follows the link and raises ENOENT on a broken one, which would replace this
 * file's carefully built diagnostics with a raw stack trace at the exact moment
 * somebody needs to read them.
 */
function walk(dir) {
  const out = [];
  if (!lstatSync(dir).isDirectory()) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (lstatSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function fail(message) {
  console.error(`[check-bundle-shape] ${message}`);
  process.exit(1);
}

/**
 * One level deeper than the failing directory's own listing.
 *
 * The first deploy failure said `.next not found` and taught nothing. The
 * second listed `.next` and showed a `static` with no `chunks`, which cost a
 * third build to see inside. A diagnostic that stops one level short of the
 * answer is a diagnostic that buys another red deploy.
 */
function subdirInventory(dir) {
  const lines = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (!lstatSync(full).isDirectory()) continue;
    lines.push(`    ${entry}/: ${readdirSync(full).sort().slice(0, 25).join(", ")}`);
  }
  return lines.length ? `\n  One level in:\n${lines.join("\n")}` : "";
}

/* Every unreadable input below is a hard exit rather than a skip. A guard that
   shrugs when it can not find its inputs is worse than no guard: it reports a
   pass nobody has any reason to doubt. */

/**
 * Find the build output, by marker rather than by name.
 *
 * `.next` is the default and is not a promise. An adapter can move it: Next
 * calls `modifyConfig` on any command that loads the config, the adapter
 * returns a whole `NextConfigComplete`, and `distDir` is one of the fields it
 * may change. Vercel supplies such an adapter through `config.adapterPath`,
 * and it ships in their build image rather than in `node_modules`, so what it
 * sets `distDir` to can not be read from here.
 *
 * Next exposes no environment variable naming the dist directory. There is no
 * `NEXT_DIST_DIR`, and `__NEXT_DIST_DIR` is a build-time DefinePlugin token
 * substituted into dev client bundles, never a variable in this process's
 * environment. An earlier version of this check read both and was inert for it.
 * So the override below is ours, and it is the lever to reach for once a deploy
 * log names the real path.
 *
 * Each candidate is confirmed by the `BUILD_ID` file Next writes into the dist
 * directory, rather than assumed from the directory name. That marker means
 * "a build finished here once", not "this build", so the success line reports
 * the build's age: a stale directory graded by accident should be visible
 * rather than silent.
 */
function resolveDistDir() {
  /* resolve, not join. `join(root, "/abs/path")` concatenates rather than
     honoring the absolute path, so an absolute override would miss and fall
     through to `.next`. A deploy log hands you an absolute path, so that is
     the likely input. */
  const override = process.env.BUNDLE_GUARD_DIST_DIR;

  /* A set override is AUTHORITATIVE, not a suggestion. If it names something
     that is not a build, that is an exit here rather than a fallthrough to
     `.next`.
   *
   * Falling through was a real defect, found in game-verdict and reproduced
   * here: `BUNDLE_GUARD_DIST_DIR=/tmp/not-a-build` printed a full green success
   * line and exited 0, having graded `.next` instead. The override exists to be
   * reached for when a deploy has gone wrong, so the person who trips this is
   * already debugging a red build, and the check answers by grading a different
   * directory and calling it healthy. Nothing in the output says which.
   *
   * There is no case where someone sets this variable and wants `.next`. */
  if (override) {
    const dir = resolve(root, override);
    if (existsSync(join(dir, "BUILD_ID"))) return dir;
    fail(
      `BUNDLE_GUARD_DIST_DIR is set to ${override} but that is not a build.\n` +
        `  Resolved to ${dir}, which has no BUILD_ID.\n` +
        `  Refusing to fall back to .next: an override that silently grades a ` +
        `different\n  directory is worse than no override, and you are ` +
        `presumably using it because\n  something is already wrong.\n` +
        `  ${
          existsSync(dir)
            ? `It holds: ${
                lstatSync(dir).isDirectory()
                  ? readdirSync(dir).sort().slice(0, 25).join(", ") || "(empty)"
                  : "(not a directory)"
              }`
            : "It does not exist."
        }`,
    );
  }

  const dir = resolve(root, ".next");
  return existsSync(join(dir, "BUILD_ID")) ? dir : null;
}

const distDir = resolveDistDir();

/* Name what was looked for and what is actually present. The first version of
   this check failed its first real deploy with "not found" and no inventory,
   which cost a whole build to learn nothing. */
if (!distDir) {
  const inventory = readdirSync(root)
    .filter((entry) => entry !== "node_modules" && entry !== ".git")
    .sort()
    .join(", ");
  const dotNextPath = join(root, ".next");
  /* lstat, and only list it if it really is a directory. A `.next` that is a
     file makes readdirSync throw ENOTDIR, which would replace the whole
     diagnostic with a stack trace in the one build you get to learn from. */
  let dotNext = "(absent)";
  if (existsSync(dotNextPath)) {
    dotNext = lstatSync(dotNextPath).isDirectory()
      ? readdirSync(dotNextPath).sort().join(", ")
      : `(not a directory)`;
  }
  fail(
    `no Next build found under ${root}.\n` +
      `  Looked in .next, confirmed by a BUILD_ID, and found none. ` +
      `BUNDLE_GUARD_DIST_DIR is unset;\n  a set one is authoritative and would ` +
      `have failed above rather than reaching here.\n` +
      `  Repo root holds: ${inventory}\n` +
      `  .next holds: ${dotNext}\n` +
      `  On a deploy this means the adapter moved the output. Set ` +
      `BUNDLE_GUARD_DIST_DIR to the path it moved it to; absolute is fine.`,
  );
}

const serverDir = join(distDir, "server");
const staticDir = join(distDir, "static");
for (const [label, dir] of [
  ["server", serverDir],
  ["static", staticDir],
]) {
  /* Not just existsSync: a `static` that is a FILE passes that and then throws
     ENOTDIR out of readdirSync further down, losing every diagnostic here.
     `.next` itself is already guarded this way; these two were not. */
  if (!existsSync(dir) || !lstatSync(dir).isDirectory()) {
    const what = existsSync(dir) ? "is not a directory" : "is missing";
    fail(
      `found a build at ${relative(root, distDir) || distDir} but ${label} ` +
        `${what}.\n  It holds: ${readdirSync(distDir).sort().join(", ")}` +
        subdirInventory(distDir),
    );
  }
}

/* ---- 1. Derive the barrel from the installed package ---------------------
   `exports` does not expose `package.json`, so this reads the file off disk
   rather than resolving the module. Same reason `lib/roster.ts` does. */

const pkgPath = join(root, "node_modules", PKG, "package.json");
if (!existsSync(pkgPath)) fail(`${PKG} is not installed — ${pkgPath} is missing.`);

let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch (error) {
  fail(`could not parse ${PKG}'s package.json: ${error.message}`);
}

/**
 * Every path the root entry point can resolve to.
 *
 * `exports["."]` is a string, or a condition map, or a condition map nested
 * inside a condition map, or an array of any of those. Rather than naming the
 * conditions, this walks the whole tree and takes every string it finds.
 *
 * Naming them is how this check failed its own review. An earlier version read
 * `import`, `require`, `default`, `node` and `browser` at one level only. Given
 * the ordinary modern shape:
 *
 *     "." : { "import": { "node": "...", "default": "./dist/roster.js" },
 *             "require": "./dist/roster.cjs" }
 *
 * it collected `dist/roster.cjs` alone, matched nothing against a real pin on
 * `dist/roster.js`, and reported that pin as a healthy component. The set was
 * not empty, so neither the fallback nor the exit below fired. That is the
 * hardcoded-filename bug moved up one level: still derived, derived wrongly,
 * and silent because a half-filled set looks exactly like a full one.
 *
 * `react-server` is the condition Next's server compiler actually resolves,
 * and it was not in that list either.
 *
 * So: collect everything, and take `module` and `main` as well rather than
 * only when nothing else turned up. Over-collecting costs nothing, because a
 * path the build never emits simply matches no manifest key. Under-collecting
 * is the whole failure mode. If the walk finds nothing at all, that is an exit
 * rather than an empty set to match against.
 */
function barrelPaths(manifest) {
  const found = new Set();

  const collect = (value) => {
    if (typeof value === "string") found.add(value.replace(/^\.\//, ""));
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };

  /* The WHOLE exports map, not `exports["."]`. Reading the root entry alone
     leaves Roster's other two namespace re-export barrels underived, `./
     data-table` and `./utils`. Pinning `./data-table` pulls TanStack the same
     way pinning the root pulls everything, and an underived path is not merely
     missed: it is counted as a healthy COMPONENT pin, so the success line gets
     more reassuring the more wrong it is. Verified before this change by
     pinning `dist/data-table.js`, which passed and moved the component counter
     from 99 to 100.

     This also collects the three stylesheet subpaths, which never appear as
     client module keys and so match nothing. That is the free over-collection
     the comment above describes. */
  collect(manifest.exports);
  collect(manifest.module);
  collect(manifest.main);
  return found;
}

const barrels = barrelPaths(pkg);
if (barrels.size === 0) {
  fail(
    `could not derive ${PKG}'s root entry point from its package.json.\n` +
      `  Checked exports["."], module and main. Without it this check would ` +
      `pass on every build, so it stops instead.`,
  );
}

/* What a manifest key looks like: "[project]/node_modules/<pkg>/<path>". Match
   on that suffix rather than the whole key, which carries a build-root prefix.
 *
 * A key is a resolved path that may carry a DECORATION after it, and `endsWith`
 * against the raw key matches no decorated form. Next emits client modules
 * under a plain path and under the same path plus " <module evaluation>";
 * Turbopack also writes a bracketed layer form, " [postcss] (ecmascript)", and
 * module ids can carry a "?" query.
 *
 * This build currently has 0 decorated keys out of 254 entries, so the guard is
 * not blind today. retrospect's build has 54 of 108, which is what this app is
 * one Next release away from. The miss is not neutral: a decorated barrel pin
 * increments the component-pin counter, so a missed barrel reads as evidence of
 * health. Verified before this change by pinning
 * "dist/roster.js <module evaluation>", which passed and moved the counter from
 * 99 to 100.
 *
 * Cutting at the first " [", " <", " (" or "?" handles every decoration Next
 * emits on this builder, rather than chasing them one release at a time. No
 * path inside node_modules contains a space, "[", "<", "(" or "?" at all, so
 * nothing legitimate is truncated.
 *
 * " (" is in that list because leaving it out was a live miss, not a
 * hypothetical one: the pattern originally cut at " [", " <" and "?" only, and
 * "roster.js (ecmascript) <module evaluation>" then split at the " <", leaving
 * "roster.js (ecmascript)", which matches no suffix. A decorated pin PASSED.
 * Turbopack writes the bracket and the paren together, so the bare paren form
 * may never be emitted, but the cost of covering it is nothing and the cost of
 * assuming was a false pass.
 *
 * It is not every decoration that exists. Next's webpack barrel loader glues
 * its own with an "@": "<path>@__barrel_optimize__?names=A,B". That one is not
 * handled, and can not be by adding "@" to the pattern, because the package
 * name itself starts with one. It needs the webpack builder AND the package
 * listed in `experimental.optimizePackageImports`, and this app has neither and
 * must not adopt the second: rewriting barrel imports to deep paths would reach
 * Roster modules that carry no client directive and throw at render. If that
 * ever changes, this is the form to handle. */
const DECORATION = /[ ][[<(]|\?/;
const normalizeKey = (key) => key.split(DECORATION)[0].trimEnd();
/* JS entry points only. `exports` also names three stylesheets, and those are
   not barrels: nothing can pin a namespace through them. Including them is not
   the free over-collection it looks like. Under the webpack builder a CSS
   resource IS an eligible client-module key, through the `css/mini-extract`
   branch of Next's flight-manifest plugin, so a build that imported
   `@blakesteve/roster/style.css` from a client component would be failed for a
   barrel pin that is really a stylesheet. Turbopack and the CSS `@import` in
   globals.css keep that unreachable today. Filtering is cheaper than relying on
   it staying unreachable. */
const barrelSuffixes = [...barrels]
  .filter((path) => /\.(js|cjs|mjs)$/.test(path))
  .map((path) => `${PKG}/${path}`);
const isBarrel = (key) =>
  barrelSuffixes.some((suffix) => normalizeKey(key).endsWith(suffix));

/* ---- 2. Parse every client reference manifest ---------------------------- */

const manifestFiles = walk(serverDir).filter((file) =>
  file.includes("client-reference-manifest"),
);
if (manifestFiles.length === 0) {
  fail(
    `no client reference manifests found under ${relative(root, serverDir) || serverDir}.\n` +
      `  It holds: ${readdirSync(serverDir).sort().join(", ")}`,
  );
}

let routeCount = 0;
let entryCount = 0;
let componentPins = 0;
const barrelPins = [];
/** Each page's entry files, by page, for section 4. */
const pageFiles = new Map();

/**
 * What a legitimate Roster component module key looks like.
 *
 * The `else` branch used to count ANY Roster key that was not the barrel as a
 * healthy component pin. So an unrecognized path shape was not merely missed,
 * it INFLATED the success line: the counter that exists as evidence the check
 * looked at something went up by one every time the check failed to understand
 * something. That is how a decorated barrel pin got reported as the hundredth
 * healthy component.
 *
 * Anything under Roster that is neither the barrel nor this shape is now a
 * failure. Unknown is a failure on purpose. All 11 distinct Roster keys in this
 * build match, verified, so the backstop is silent on a healthy build.
 */
const COMPONENT_SHAPE = /\/dist\/(components|hooks|internal|lib)\/.+\.(js|mjs|cjs)$/;
const STYLESHEET_SHAPE = /\.css$/i;
const unknownShapes = [];

for (const file of manifestFiles) {
  /* One context per file so a parse failure names the file that caused it.
   *
   * `process.env` is in the context because a manifest may read it. An empty
   * context broke retrospect's deploy with "process is not defined" on a single
   * route, and it failed only there: none of the manifests either app emits
   * locally touches `process`, so the guard was green on every local build and
   * red on the first deploy. The guard behaved correctly in that it hard-exited
   * rather than skipping the file, which is the point of every unreadable input
   * being an exit. It exited for the wrong reason.
   *
   * Scoped to `env` rather than the whole `process`, deliberately. A manifest
   * needs environment values and nothing else. One reaching for `process.exit`,
   * `process.cwd` or `process.argv` is doing something this check has not
   * accounted for, and should fail loudly here rather than work by accident and
   * quietly grade something unexpected.
   *
   * A copy, not the live object. Manifest code assigning to `process.env.X`
   * writes through a passed reference into this process's real environment.
   * Nothing here reads it afterwards, so there is no reachable consequence
   * today, but a guard should not let the thing it is grading edit its own
   * environment. */
  const context = createContext({ process: { env: { ...process.env } } });
  context.globalThis = context;
  try {
    runInContext(readFileSync(file, "utf8"), context);
  } catch (error) {
    fail(`could not evaluate ${relative(root, file)}: ${error.message}`);
  }

  const manifest = context.__RSC_MANIFEST;
  if (!manifest || typeof manifest !== "object") {
    fail(
      `${relative(root, file)} set no __RSC_MANIFEST.\n` +
        `  The manifest format changed and this check can no longer read it.`,
    );
  }

  for (const [route, entry] of Object.entries(manifest)) {
    routeCount += 1;
    /* Not `?? {}`. A route whose entry has no `clientModules` at all means the
       format moved, and defaulting to an empty object would walk nothing and
       call it clean. Every route in a real build has the key, empty or not. */
    if (!entry?.clientModules || typeof entry.clientModules !== "object") {
      fail(
        `${relative(root, file)} route ${route} has no clientModules object.\n` +
          `  The manifest format changed and this check can no longer read it.`,
      );
    }
    /* Pages only. A route handler (`/opengraph-image/route`) sends no JS, and
       its entry files are empty. A page with no `entryJSFiles` at all means the
       format moved, and measuring it as its root files alone would read low
       and pass. */
    if (route.endsWith("/page")) {
      if (!entry.entryJSFiles || typeof entry.entryJSFiles !== "object") {
        fail(
          `${relative(root, file)} route ${route} has no entryJSFiles object.\n` +
            `  The manifest format changed and this page's first load can no ` +
            `longer be measured.`,
        );
      }
      const page = route.slice(0, -"/page".length) || "/";
      const files = pageFiles.get(page) ?? new Set();
      for (const list of Object.values(entry.entryJSFiles)) {
        if (!Array.isArray(list)) {
          fail(
            `${relative(root, file)} route ${route} lists entry files that are ` +
              `not an array.\n  The manifest format changed and this check can ` +
              `no longer read it.`,
          );
        }
        for (const entryFile of list) files.add(entryFile);
      }
      pageFiles.set(page, files);
    }
    for (const [key, value] of Object.entries(entry.clientModules)) {
      entryCount += 1;
      /* Normalize before the package test too, not just before the barrel test.
         A decorated key is still a Roster key and must reach the branches. */
      const normalized = normalizeKey(key);
      if (!normalized.includes(`${PKG}/`)) continue;
      if (isBarrel(normalized)) {
        barrelPins.push({ route, key, name: value?.name, file });
      } else if (STYLESHEET_SHAPE.test(normalized)) {
        /* A stylesheet, which is recognized and benign: not a barrel, not a
           component, and not evidence of anything. Under the webpack builder a
           CSS resource is an eligible client-module key through the
           `css/mini-extract` branch of Next's flight-manifest plugin, so this
           is reachable without anything being wrong. Named explicitly rather
           than left to the backstop, which would fail a legitimate build. */
        continue;
      } else if (COMPONENT_SHAPE.test(normalized)) {
        /* A component module pinned whole. Correct, and counted so the success
           line can show the check was actually looking at something. */
        componentPins += 1;
      } else {
        unknownShapes.push({ route, key, name: value?.name });
      }
    }
  }
}

/**
 * Floors on what the check actually saw.
 *
 * Every assertion above is an upper bound, and an upper bound is satisfied by
 * measuring nothing. Stripping every Roster key from all 11 manifests left this
 * check printing "barrel unpinned across 11 routes" and exiting 0, having
 * examined nothing. Losing manifests to a rename would read identically: fewer
 * routes, fewer pins, same green tick.
 *
 * So the numbers the success line prints as evidence are asserted rather than
 * merely reported. Floors, not exact counts: adding a Roster component to a
 * server file legitimately raises `componentPins` and must not fail a build.
 *
 * Derived for THIS app on a clean build: 11 routes, 254 client modules, 99
 * component pins. The floors sit well below those, because their job is to
 * catch "the manifests were not read", which lands near zero, rather than to
 * police ordinary drift.
 *
 * The component-pin floor is app-specific and NOT portable. blakeb-dev reaches
 * Roster through the barrel from server components, so its components pin
 * individually. An app wrapping Roster behind its own `"use client"` boundary
 * legitimately pins zero, and retrospect is exactly that shape. Do not copy
 * this floor there.
 */
const ROUTE_FLOOR = 8;
const CLIENT_MODULE_FLOOR = 150;
const COMPONENT_PIN_FLOOR = 40;

for (const [what, got, floor] of [
  ["routes", routeCount, ROUTE_FLOOR],
  ["client modules", entryCount, CLIENT_MODULE_FLOOR],
  [`${PKG} component pins`, componentPins, COMPONENT_PIN_FLOOR],
]) {
  if (got < floor) {
    problems.push(
      `only ${got} ${what} found, below the floor of ${floor}.\n\n` +
        `  This check reports an upper bound, so measuring almost nothing ` +
        `passes every\n  other assertion in it. A number this low means the ` +
        `manifests were not read,\n  not that the app got smaller. Find out ` +
        `why before lowering the floor.`,
    );
  }
}

if (unknownShapes.length > 0) {
  const lines = unknownShapes.map(
    ({ route, key, name }) =>
      `  ${route}\n    ${key}\n    pinned as name: ${JSON.stringify(name)}`,
  );
  problems.push(
    `${unknownShapes.length} client reference(s) under ${PKG} in a shape this ` +
      `check does not recognize.\n\n` +
      lines.join("\n\n") +
      `\n\n  Not the barrel and not a component module. Either the package's ` +
      `layout changed\n  or a key is decorated in a way the normalizer misses. ` +
      `Unknown is a failure here\n  on purpose: counting it as healthy is how ` +
      `a barrel pin got reported as a component.`,
  );
}

if (barrelPins.length > 0) {
  const lines = barrelPins.map(
    ({ route, key, name }) =>
      `  ${route}\n    ${key}\n    pinned as name: ${JSON.stringify(name)}`,
  );
  problems.push(
    `${barrelPins.length} barrel pin(s) in the client reference manifests.\n\n` +
      lines.join("\n\n") +
      `\n\n  The root barrel is a client reference, so its whole namespace is a ` +
      `live root\n  and every component ships whether the app imports it or not.\n` +
      `  This is the shape that cost a sibling app 18.49%.`,
  );
}

/* ---- 3. Size budget ------------------------------------------------------ */

/**
 * Floors under the byte budgets, because zero is not a low enough bar.
 *
 * A zero-only floor is cleared by the debris. Moving `static/chunks` aside,
 * which is the exact adapter relocation the comment on the total above documents
 * as having happened on a real deploy, leaves three Next build manifests under
 * `static/<buildId>/` totalling 447 bytes. Verified: that measures
 * "client JS 447 of 940,000", clears a zero floor, sits under the ceiling, and
 * exits 0 on a build with no application JavaScript in it.
 *
 * Deliberately far below the 897,277 and 218,526 baselines rather than just
 * under them. These exist to catch "the output was not found", which lands
 * three orders of magnitude down, not to police the app getting smaller. The
 * next queued Roster work is specifically about making its JS and its
 * stylesheet shake, and a floor set just under today's numbers would fail the
 * build on exactly the improvement everyone is hoping for. The CSS floor sits
 * below 77,503, which is what this app emits with Roster's stylesheet removed
 * entirely, so even total elimination of Roster's CSS would not trip it.
 */
const SIZE_FLOORS = { JS: 300_000, CSS: 60_000 };

const emitted = walk(staticDir);
const totals = {};

for (const [label, extension, ceiling] of [
  /* No ceiling on JS: see the comment at the top of this file. */
  ["JS", ".js", null],
  ["CSS", ".css", CLIENT_CSS_CEILING],
]) {
  const files = emitted.filter((file) => file.endsWith(extension));
  /* lstat, matching walk: a dangling symlink has a size of its own and must not
     throw here. statSync follows the link and raises ENOENT, which replaces
     every diagnostic in this file with a stack trace. */
  const totalBytes = files.reduce((sum, file) => sum + lstatSync(file).size, 0);
  totals[label] = totalBytes;

  /* A ceiling with no floor under it is satisfied by an empty build, and this
     is not hypothetical here: the comment on the total records that Vercel's
     adapter has already relocated this app's client assets once. Have it
     relocate them OUT of `static` rather than into a differently named
     subdirectory, or turn on `experimental.inlineCss`, which moves the whole
     stylesheet into the HTML, and the sum goes to zero and every ceiling passes
     forever. Verified before this change: emptying `static` of .js reported
     "client JS 0 of 940,000 bytes" and exited 0.

     Zero is the only floor worth asserting. This app can not emit a build with
     no client JS or no stylesheet, so any zero means the assets are somewhere
     this check is not looking, which is the one thing a size guard must never
     report as a pass. A PARTIAL relocation would still slip through; Next has
     no behavior that produces one, so there is nothing better to assert. */
  if (totalBytes < SIZE_FLOORS[label]) {
    fail(
      `client ${label} is ${totalBytes.toLocaleString("en-US")} bytes, under the ` +
        `${SIZE_FLOORS[label].toLocaleString("en-US")} floor.\n` +
        `  Almost certainly this check did not find the build output rather than ` +
        `the app\n  shrinking that far. ${files.length} matching file(s) under ` +
        `static.\n` +
        `  static holds: ${readdirSync(staticDir).sort().join(", ")}` +
        subdirInventory(staticDir),
    );
  }

  if (ceiling !== null && totalBytes > ceiling) {
    const over = totalBytes - ceiling;
    const percent = ((totalBytes / ceiling - 1) * 100).toFixed(2);
    problems.push(
      `client ${label} is ${totalBytes.toLocaleString("en-US")} bytes, over the ` +
        `${ceiling.toLocaleString("en-US")} ceiling by ` +
        `${over.toLocaleString("en-US")} (${percent}%).\n\n` +
        `  Find what grew before raising the ceiling. If the growth is real and ` +
        `wanted,\n  raise it in a commit that says what grew.`,
    );
  }
}

/* ---- 4. First load per route --------------------------------------------- */

/**
 * What a visitor downloads to open each page, against its budget in
 * `route-budgets.mjs`: the build manifest's `rootMainFiles` plus the page's
 * own entry files, each file once. A file both lists counts once, because the
 * browser fetches it once, and a chunk two pages share counts in each of their
 * first loads, because each of their visitors downloads it.
 *
 * Polyfills are out: Next loads `polyfillFiles` with `noModule`, so a browser
 * that runs this app's modules never fetches them.
 *
 * The case this has to get right is the reason it replaced the total: a chunk
 * split into per-route copies leaves every route's first load where it was and
 * must pass, and a route that grows fails, whatever the total did.
 */
const buildManifestPath = join(distDir, "build-manifest.json");
let rootMainFiles;
try {
  rootMainFiles = JSON.parse(readFileSync(buildManifestPath, "utf8")).rootMainFiles;
} catch (error) {
  fail(`could not read ${relative(root, buildManifestPath)}: ${error.message}`);
}
if (!Array.isArray(rootMainFiles) || rootMainFiles.length === 0) {
  fail(
    `${relative(root, buildManifestPath)} lists no rootMainFiles.\n` +
      `  The manifest format changed. Measured without them, every route's ` +
      `first load would\n  read low by the framework and pass.`,
  );
}

/* A listed file that isn't on disk is a failure, not a zero: measuring around
   it reads low. The manifests move with the assets, so a build that writes
   `static/immutable/chunks` lists those paths and they resolve here as they
   are. `statSync` and not this file's usual `lstat`: a symlink's own size would
   read low, and a dangling one has already failed `existsSync`. */
const missingFiles = new Set();
function emittedSize(file) {
  const full = join(distDir, file);
  if (!existsSync(full)) {
    missingFiles.add(file);
    return 0;
  }
  return statSync(full).size;
}

const firstLoad = [...pageFiles]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([page, files]) => {
    let bytes = 0;
    for (const file of new Set([...rootMainFiles, ...files])) bytes += emittedSize(file);
    const measured = ROUTE_FIRST_LOAD[page];
    return {
      page,
      bytes,
      entries: files.size,
      cap: measured === undefined ? null : measured + ROUTE_SLACK,
    };
  });

if (missingFiles.size > 0) {
  const listed = [...missingFiles].sort();
  problems.push(
    `${listed.length} file(s) a page loads first are not in the build.\n\n` +
      listed.slice(0, 10).map((file) => `  ${file}`).join("\n") +
      (listed.length > 10 ? `\n  and ${listed.length - 10} more` : "") +
      `\n\n  Each page's first load reads low by what's missing, which looks ` +
      `like a lean build.`,
  );
}

/* The coverage rule again. A cap is an upper bound, so manifests that lost the
   pages' own files read low and pass every one. A floor per route can't catch
   that, because `/_global-error` honestly loads little past the root files, so
   this floors the unique bytes pages load beyond them: 361,301 on 4 November
   2026, far below which means the entries weren't read, not a smaller app. */
const ENTRY_BYTES_FLOOR = 100_000;
const entryFiles = new Set([...pageFiles.values()].flatMap((files) => [...files]));
for (const file of rootMainFiles) entryFiles.delete(file);
const entryBytes = [...entryFiles].reduce((sum, file) => sum + emittedSize(file), 0);
if (entryBytes < ENTRY_BYTES_FLOOR) {
  problems.push(
    `pages load only ${entryBytes.toLocaleString("en-US")} bytes beyond the root ` +
      `files, under the floor of ${ENTRY_BYTES_FLOOR.toLocaleString("en-US")}.\n` +
      `  The entry files probably weren't read, and every route would pass its cap.`,
  );
}

const n = (bytes) => bytes.toLocaleString("en-US");
for (const { page, bytes, entries, cap } of firstLoad) {
  /* Every page in a real build has a layout's files at the least. None means
     the entries weren't read, and root files alone would pass any cap. */
  if (entries === 0) {
    problems.push(
      `${page} lists no entry files, so its first load reads as the root files ` +
        `alone.\n  The manifest format changed.`,
    );
  }
  if (cap === null) {
    problems.push(
      `${page} has no first-load budget. It loads ${n(bytes)} bytes of JS first.\n\n` +
        `  Add it to scripts/route-budgets.mjs, measured on a clean build.`,
    );
  } else if (bytes > cap) {
    problems.push(
      `${page} loads ${n(bytes)} bytes of JS first, over its cap of ${n(cap)} ` +
        `(${n(cap - ROUTE_SLACK)} measured plus ${n(ROUTE_SLACK)} slack) by ` +
        `${n(bytes - cap)}.\n\n` +
        `  This is what a visitor to ${page} downloads, so no split or merge ` +
        `elsewhere moves it.\n  Find what grew on this route. If the growth is ` +
        `real and wanted, re-measure\n  its row in scripts/route-budgets.mjs in a ` +
        `commit that says what grew.`,
    );
  }
}
for (const page of Object.keys(ROUTE_FIRST_LOAD)) {
  if (!pageFiles.has(page)) {
    problems.push(
      `${page} has a first-load budget but no page in this build.\n\n` +
        `  If the page is gone, remove its row from scripts/route-budgets.mjs. ` +
        `If it isn't,\n  its manifest was not read.`,
    );
  }
}

/* HOVER. Read from the same emitted stylesheets the CSS ceiling summed. The
   floor is the coverage rule again: Tailwind guards every `hover:` variant, so
   a real build carries well over a hundred guarded hover selectors, nearly
   all of them Roster's. A scan that read nothing would find nothing unguarded
   and pass, so finding almost nothing guarded is a failure too. 175 on
   15 Oct 2026, when the check was added. */
const HOVER_GUARDED_FLOOR = 100;
const hover = checkHover(
  emitted
    /* lstat, as everywhere else here: a dangling symlink must not trade the
       diagnostics for a stack trace. */
    .filter((file) => file.endsWith(".css") && lstatSync(file).isFile())
    .map((file) => readFileSync(file, "utf8"))
    .join("\n"),
);
if (hover.guarded < HOVER_GUARDED_FLOOR) {
  problems.push(
    `only ${hover.guarded} guarded hover selector(s) in the emitted CSS, under the ` +
      `floor of ${HOVER_GUARDED_FLOOR}.\n  The scan is probably not reading the stylesheets.`,
  );
}
if (hover.unguarded.length > 0) {
  problems.push(
    `${hover.unguarded.length} hover selector(s) apply on touch screens, outside ` +
      `@media (hover: hover):\n` +
      hover.unguarded.map((selector) => `    ${selector}`).join("\n") +
      `\n\n  A tap leaves :hover on, so these stay lit on a phone. Use Tailwind's ` +
      `hover: variant,\n  or wrap the rule in @media (hover: hover). If one must ` +
      `apply everywhere,\n  add it to HOVER_ALLOW in scripts/lib/hover-guard.mjs ` +
      `with the reason.`,
  );
}
if (hover.stale.length > 0) {
  problems.push(
    `HOVER_ALLOW lists selector(s) the emitted CSS no longer has:\n` +
      hover.stale.map((selector) => `    ${selector}`).join("\n") +
      `\n\n  Remove them, so the allow-list can't quietly cover something new.`,
  );
}

if (problems.length > 0) {
  console.error(`[check-bundle-shape] ${problems.length} problem(s).\n`);
  console.error(problems.join("\n\n"));
  process.exit(1);
}

/* Age of the graded build. BUILD_ID says a build finished here, not that it is
   this one, so a stale directory graded by accident shows up as a large number
   here rather than passing quietly. */
const ageSeconds = Math.round(
  (Date.now() - statSync(join(distDir, "BUILD_ID")).mtimeMs) / 1000,
);
const age = ageSeconds < 120 ? `${ageSeconds}s old` : `${Math.round(ageSeconds / 60)}m old`;

/* The table is the evidence: the figures a re-measure copies into
   `route-budgets.mjs`, and what a reviewer reads a change's cost from. */
const tightest = firstLoad.reduce((a, b) => (b.cap - b.bytes < a.cap - a.bytes ? b : a));
const width = Math.max(...firstLoad.map(({ page }) => page.length));
console.log(
  `✓ bundle shape: ${PKG} barrel unpinned across ${routeCount} routes ` +
    `(${entryCount} client modules, ${componentPins} Roster components pinned ` +
    `individually), first-load JS within budget on ${firstLoad.length} pages ` +
    `(closest: ${tightest.page}, ${n(tightest.cap - tightest.bytes)} under), CSS ` +
    `${n(totals.CSS)} of ${n(CLIENT_CSS_CEILING)} bytes, ` +
    `${hover.guarded} hover selectors guarded and ${HOVER_ALLOW.length} allowed, ` +
    `build at ${relative(root, distDir) || distDir} ${age}\n` +
    `  client JS ${n(totals.JS)} bytes across every emitted file: reported, not ` +
    `budgeted, because it counts each route's copy of shared code\n` +
    firstLoad
      .map(({ page, bytes, cap }) => `  ${page.padEnd(width)}  ${n(bytes).padStart(9)} of ${n(cap)}`)
      .join("\n"),
);
