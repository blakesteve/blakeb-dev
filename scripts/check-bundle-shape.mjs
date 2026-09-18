/**
 * Fails the build if Roster's barrel got pinned as a client reference, or if
 * total client JS crossed its ceiling.
 *
 * Roster 4.13.0 regressed a sibling app by 18.49% and nobody found out until
 * somebody measured by hand. Every gate this app has is blind to it: vitest
 * resolves Roster through Node and gets the unshaken barrel, eslint reads
 * source and never build output, and `tsc` cares about types. A build that
 * ships twice the JS is green four times over.
 *
 * Two assertions, because the failure has two shapes.
 *
 * SHAPE. The app imports Roster only through the root barrel. Since the
 * boundary moved, each component the app actually uses is pinned as its own
 * client module and the barrel itself stays bare. If the barrel ever appears
 * in a client reference manifest, its whole namespace is a live root again and
 * every component ships whether imported or not. That is the 18.49%.
 *
 * SIZE. Shape is the known mechanism, not the only one. The ceiling catches a
 * regression that arrives some other way, including from outside Roster.
 *
 * Three things this gets right on purpose, each of which has been got wrong
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
 *    imported by a server component is supposed to be. Only the barrel matters.
 *
 * This reads build output, so it runs as `postbuild`, after `next build`.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { createContext, runInContext } from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = "@blakesteve/roster";

/**
 * Ceiling on emitted client JS, in bytes: every .js under .next/static/chunks.
 *
 * Measured 18 September 2026 on Roster 5.0.0: 896,830 bytes across 16 files.
 * That is not quite every byte the client receives. The three small manifests
 * under .next/static/<BUILD_ID>/ add 447 bytes and are not counted, because
 * nothing can migrate meaningful weight into them.
 * The ceiling allows 43,170 bytes of slack, 4.8%, which is room for the
 * ordinary drift of adding posts and case studies between Roster bumps and far
 * below the 18.49% class of regression this exists to catch. Raise it in a
 * commit that says what grew and why, rather than to make a red build green.
 */
const CLIENT_JS_CEILING = 940_000;

const problems = [];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function fail(message) {
  console.error(`[check-bundle-shape] ${message}`);
  process.exit(1);
}

/* Every unreadable input below is a hard exit rather than a skip. A guard that
   shrugs when it can not find its inputs is worse than no guard: it reports a
   pass nobody has any reason to doubt. */

const serverDir = join(root, ".next/server");
const staticDir = join(root, ".next/static/chunks");
if (!existsSync(serverDir) || !existsSync(staticDir)) {
  fail(".next not found. This reads build output — run the build first.");
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

  collect(manifest.exports?.["."]);
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
   on that suffix rather than the whole key, which carries a build-root prefix. */
const barrelSuffixes = [...barrels].map((path) => `${PKG}/${path}`);
const isBarrel = (key) => barrelSuffixes.some((suffix) => key.endsWith(suffix));

/* ---- 2. Parse every client reference manifest ---------------------------- */

const manifestFiles = walk(serverDir).filter((file) =>
  file.includes("client-reference-manifest"),
);
if (manifestFiles.length === 0) {
  fail("no client reference manifests found under .next/server.");
}

let routeCount = 0;
let entryCount = 0;
let componentPins = 0;
const barrelPins = [];

for (const file of manifestFiles) {
  /* One context per file so a parse failure names the file that caused it. */
  const context = createContext({});
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
    for (const [key, value] of Object.entries(entry.clientModules)) {
      entryCount += 1;
      if (!key.includes(`${PKG}/`)) continue;
      if (isBarrel(key)) {
        barrelPins.push({ route, key, name: value?.name, file });
      } else {
        /* A component module pinned whole. Correct, and counted so the success
           line can show the check was actually looking at something. */
        componentPins += 1;
      }
    }
  }
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

const clientJs = walk(staticDir).filter((file) => file.endsWith(".js"));
const totalBytes = clientJs.reduce(
  (sum, file) => sum + statSync(file).size,
  0,
);

if (totalBytes > CLIENT_JS_CEILING) {
  const over = totalBytes - CLIENT_JS_CEILING;
  const percent = ((totalBytes / CLIENT_JS_CEILING - 1) * 100).toFixed(2);
  problems.push(
    `client JS is ${totalBytes.toLocaleString("en-US")} bytes, over the ` +
      `${CLIENT_JS_CEILING.toLocaleString("en-US")} ceiling by ` +
      `${over.toLocaleString("en-US")} (${percent}%).\n\n` +
      `  Find what grew before raising the ceiling. If the growth is real and ` +
      `wanted,\n  raise it in a commit that says what grew.`,
  );
}

if (problems.length > 0) {
  console.error(`[check-bundle-shape] ${problems.length} problem(s).\n`);
  console.error(problems.join("\n\n"));
  process.exit(1);
}

console.log(
  `✓ bundle shape: ${PKG} barrel unpinned across ${routeCount} routes ` +
    `(${entryCount} client modules, ${componentPins} Roster components pinned ` +
    `individually), client JS ${totalBytes.toLocaleString("en-US")} of ` +
    `${CLIENT_JS_CEILING.toLocaleString("en-US")} bytes`,
);
