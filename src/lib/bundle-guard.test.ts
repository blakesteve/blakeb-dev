import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { ROUTE_FIRST_LOAD, ROUTE_SLACK } from "../../scripts/route-budgets.mjs";

/**
 * The bundle guard, run as a child process against synthetic build trees, so
 * these exercise the shipped script rather than a copy of its logic.
 *
 * Every case comes in a pair: something that must fail, and the healthy build
 * it is derived from, which must pass. A guard is only as trustworthy as its
 * negative control. The budgets are imported from the file the guard reads,
 * because a fixture that has to straddle a cap can't hardcode a number on
 * either side of it: a straddle that stops straddling passes for the wrong
 * reason.
 */

const PAGES = Object.keys(ROUTE_FIRST_LOAD);
const capOf = (page: string) => ROUTE_FIRST_LOAD[page] + ROUTE_SLACK;
const PKG = "@blakesteve/roster";
const SCRIPTS = join(process.cwd(), "scripts");
const BARREL_PIN = "barrel pin(s) in the client reference manifests";
/** The ceiling the whole-build total had, for the cases it got wrong. */
const OLD_TOTAL_CEILING = 963_413;

/* Read from the script for the same reason: this figure moves with Roster. */
const CSS_CEILING = Number(
  /const CLIENT_CSS_CEILING = ([\d_]+);/
    .exec(readFileSync(join(SCRIPTS, "check-bundle-shape.mjs"), "utf8"))![1]
    .replaceAll("_", ""),
);

/* A healthy page's first load: the root file, the shared layout, its own page.
   The layout is big enough to clear the guard's floor on entry bytes. */
const ROOT = 1_000;
const LAYOUT = 150_000;
const PAGE = 1_000;
const BASE = ROOT + LAYOUT + PAGE;

type Fixture = {
  /** Bytes of JS no page loads first, which only the total sees. */
  unloadedJs?: number;
  /** Extra files on a page's entry. A name two pages share is one file. */
  pageChunks?: Record<string, Record<string, number>>;
  layoutBytes?: number;
  rootMain?: Record<string, number>;
  polyfills?: Record<string, number>;
  pages?: string[];
  css?: string;
  cssBytes?: number;
  clientModules?: Record<string, object>;
  fillerCount?: number;
  pinCount?: number;
  /** Where chunks live, which the manifests name as a real build's do. */
  chunkDir?: string;
  /** Files listed in a manifest but never written. */
  unwritten?: string[];
  /** Replaces part of one page's entry in the manifest. */
  entryOverride?: Record<string, unknown>;
  buildManifest?: object;
  manifestPrelude?: string;
};

const roots: string[] = [];

afterEach(() => {
  while (roots.length) rmSync(roots.pop()!, { recursive: true, force: true });
});

const pad = (bytes: number) => "//" + "x".repeat(bytes - 2);

const ALLOWED_HOVER = ".reg-mark:hover .reg-plate{color:red}.group:hover .reg-mark .reg-plate{color:red}";
const GUARDED_HOVER = Array.from(
  { length: 120 },
  (_, i) => `@media (hover:hover){.h-${i}:hover{color:red}}`,
).join("");
const HEALTHY_CSS = ALLOWED_HOVER + GUARDED_HOVER;

function buildFixture({
  unloadedJs = 400_000,
  pageChunks = {},
  layoutBytes = LAYOUT,
  rootMain = { "root-main.js": ROOT },
  polyfills = { "polyfills.js": 1_000 },
  pages = PAGES,
  css = HEALTHY_CSS,
  cssBytes = 200_000,
  clientModules = {},
  fillerCount = 160,
  pinCount = 45,
  chunkDir = "static/chunks",
  unwritten = [],
  entryOverride = {},
  buildManifest,
  manifestPrelude = "",
}: Fixture = {}) {
  const root = mkdtempSync(join(tmpdir(), "bundle-guard-"));
  roots.push(root);

  mkdirSync(join(root, "node_modules", PKG), { recursive: true });
  writeFileSync(
    join(root, "node_modules", PKG, "package.json"),
    JSON.stringify({
      name: PKG,
      version: "5.0.0",
      exports: { ".": { import: "./dist/roster.js" } },
    }),
  );

  const dist = join(root, ".next");
  mkdirSync(join(dist, chunkDir), { recursive: true });
  mkdirSync(join(dist, "server", "app"), { recursive: true });
  writeFileSync(join(dist, "BUILD_ID"), "test-build");
  writeFileSync(join(dist, chunkDir, "unloaded.js"), pad(unloadedJs));
  writeFileSync(
    join(dist, chunkDir, "app.css"),
    css + "/*" + "x".repeat(Math.max(0, cssBytes - css.length - 4)) + "*/",
  );

  const chunkBytes: Record<string, number> = {};
  const listed = (files: Record<string, number>) =>
    Object.entries(files).map(([name, bytes]) => {
      chunkBytes[name] = bytes;
      return `${chunkDir}/${name}`;
    });
  writeFileSync(
    join(dist, "build-manifest.json"),
    JSON.stringify(
      buildManifest ?? { polyfillFiles: listed(polyfills), rootMainFiles: listed(rootMain) },
    ),
  );

  /* Enough to clear the guard's floors: 150 client modules, 40 Roster pins. */
  const modules: Record<string, object> = { ...clientModules };
  for (let i = 0; i < fillerCount; i += 1) {
    modules[`[project]/src/components/filler-${i}.tsx`] = { id: i, name: "*" };
  }
  for (let i = 0; i < pinCount; i += 1) {
    modules[`[project]/node_modules/${PKG}/dist/components/C${i}.js`] = { id: i, name: "*" };
  }

  const routes: Record<string, unknown> = {};
  pages.forEach((page, i) => {
    const name = `${page === "/" ? "" : page}/page`;
    routes[name] = {
      clientModules: i === 0 ? modules : {},
      entryJSFiles: {
        "[project]/src/app/layout": listed({ "layout.js": layoutBytes }),
        [`[project]/src/app${name}`]: listed({ [`page-${i}.js`]: PAGE, ...pageChunks[page] }),
      },
      ...(entryOverride[page] as object),
    };
  });
  routes["/opengraph-image/route"] = { clientModules: {}, entryJSFiles: {} };

  for (const [name, bytes] of Object.entries(chunkBytes)) {
    if (!unwritten.includes(name)) writeFileSync(join(dist, chunkDir, name), pad(bytes));
  }
  writeFileSync(
    join(dist, "server", "app", "page_client-reference-manifest.js"),
    `${manifestPrelude}globalThis.__RSC_MANIFEST = ${JSON.stringify(routes)};`,
  );

  /* Into `scripts/`, not the fixture root: the guard takes its own parent as
     the repo root, so at the top it would grade the temp directory. */
  mkdirSync(join(root, "scripts", "lib"), { recursive: true });
  for (const file of ["check-bundle-shape.mjs", "route-budgets.mjs", "lib/hover-guard.mjs"]) {
    copyFileSync(join(SCRIPTS, file), join(root, "scripts", file));
  }
  return root;
}

function run(root: string, env: Record<string, string> = {}) {
  try {
    const stdout = execFileSync("node", [join(root, "scripts", "check-bundle-shape.mjs")], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...env },
    });
    return { code: 0, out: stdout };
  } catch (error) {
    const e = error as { status: number; stdout: string; stderr: string };
    return { code: e.status, out: `${e.stdout}${e.stderr}` };
  }
}

/** The page's first-load figure from the success line's table. */
function firstLoadOf(out: string, page: string) {
  const line = out.split("\n").find((l) => l.trim().startsWith(`${page} `));
  return Number(line?.trim().split(/\s+/)[1].replaceAll(",", ""));
}

/** What the old check summed: every .js the fixture emitted. */
function totalJs(root: string) {
  const chunks = join(root, ".next", "static", "chunks");
  return readdirSync(chunks)
    .filter((file) => file.endsWith(".js"))
    .reduce((sum, file) => sum + statSync(join(chunks, file)).size, 0);
}

describe("the bundle guard", () => {
  it("passes a healthy build, and reports what it measured", () => {
    const root = buildFixture();
    const { code, out } = run(root);
    expect(out).toContain("first-load JS within budget");
    expect(out).toContain(`client JS ${totalJs(root).toLocaleString("en-US")} bytes across every emitted file`);
    expect(code).toBe(0);
    expect(firstLoadOf(out, "/about")).toBe(BASE);
  });

  it("still fails a barrel pin, decorated or not", () => {
    const barrel = `[project]/node_modules/${PKG}/dist/roster.js`;
    for (const key of [barrel, `${barrel} <module evaluation>`]) {
      const { code, out } = run(buildFixture({ clientModules: { [key]: { id: 1, name: "*" } } }));
      expect(code, key).toBe(1);
      expect(out, key).toContain(BARREL_PIN);
    }
  });

  it("still fails a Roster key in a shape it doesn't recognize", () => {
    const key = `[project]/node_modules/${PKG}/elsewhere/thing.js`;
    const { code, out } = run(buildFixture({ clientModules: { [key]: { id: 1, name: "*" } } }));
    expect(code).toBe(1);
    expect(out).toContain("in a shape this check does not recognize");
  });

  it("evaluates a manifest that reads process.env, as a deployed build's does", () => {
    const manifestPrelude = "const deployment = process.env.NEXT_DEPLOYMENT_ID;\n";
    expect(run(buildFixture({ manifestPrelude })).code).toBe(0);
  });

  it("still fails when too few routes, client modules or Roster pins were read", () => {
    expect(run(buildFixture({ pages: PAGES.slice(0, 5) })).out).toContain("routes found, below the floor of 8");
    expect(run(buildFixture({ fillerCount: 0 })).out).toContain("client modules found, below the floor of 150");
    expect(run(buildFixture({ pinCount: 0 })).out).toContain("component pins found, below the floor of 40");
  });

  it("still fails CSS over its ceiling, and passes it at the ceiling's edge", () => {
    expect(run(buildFixture({ cssBytes: CSS_CEILING })).code).toBe(0);
    const { code, out } = run(buildFixture({ cssBytes: CSS_CEILING + 1 }));
    expect(code).toBe(1);
    expect(out).toContain(`client CSS is ${(CSS_CEILING + 1).toLocaleString("en-US")} bytes`);
  });

  it("still fails CSS it didn't find", () => {
    const { code, out } = run(buildFixture({ cssBytes: 10_000 }));
    expect(code).toBe(1);
    expect(out).toContain("under the 60,000 floor");
  });

  it("still fails an unguarded hover rule", () => {
    const { code, out } = run(buildFixture({ css: `${HEALTHY_CSS}.a:hover{color:red}` }));
    expect(code).toBe(1);
    expect(out).toContain("hover selector(s) apply on touch screens");
  });

  it("still fails a hover scan that read almost nothing, and a stale allow-list", () => {
    expect(run(buildFixture({ css: ALLOWED_HOVER })).out).toContain("guarded hover selector(s) in the emitted CSS");
    expect(run(buildFixture({ css: GUARDED_HOVER })).out).toContain("HOVER_ALLOW lists selector(s)");
  });

  it("still fails a build whose JS wasn't found, though no ceiling remains", () => {
    const { code, out } = run(buildFixture({ unloadedJs: 10, layoutBytes: 100_000 }));
    expect(code).toBe(1);
    expect(out).toContain("under the 300,000 floor");
  });

  it("refuses an override that isn't a build, rather than grading .next", () => {
    const { code, out } = run(buildFixture(), { BUNDLE_GUARD_DIST_DIR: "/not/a/build" });
    expect(code).toBe(1);
    expect(out).toContain("BUNDLE_GUARD_DIST_DIR is set");
  });
});

describe("the bundle guard's first load per route", () => {
  it("passes a split that adds copies without moving any page's first load", () => {
    /* The defect this replaced. One chunk three pages share, then a copy each:
       nobody downloads more, and the copies alone cross the old ceiling. */
    const pages = ["/about", "/work", "/resume"];
    const sharedRoot = buildFixture({
      pageChunks: Object.fromEntries(pages.map((page) => [page, { "dialog.js": 200_000 }])),
    });
    const splitRoot = buildFixture({
      pageChunks: Object.fromEntries(pages.map((page, i) => [page, { [`dialog-${i}.js`]: 200_000 }])),
    });
    const shared = run(sharedRoot);
    const split = run(splitRoot);
    expect(shared.code).toBe(0);
    expect(split.code).toBe(0);
    expect(totalJs(sharedRoot)).toBeLessThan(OLD_TOTAL_CEILING);
    expect(totalJs(splitRoot)).toBeGreaterThan(OLD_TOTAL_CEILING);
    for (const page of pages) expect(firstLoadOf(split.out, page)).toBe(firstLoadOf(shared.out, page));
  });

  it("fails a page past its cap, though the build's total is under the old ceiling", () => {
    const page = "/about";
    const root = buildFixture({ unloadedJs: 10, pageChunks: { [page]: { "big.js": capOf(page) - BASE + 1 } } });
    const { code, out } = run(root);
    expect(code).toBe(1);
    expect(out).toContain(`${page} loads`);
    expect(out).toContain("over its cap");
    expect(totalJs(root)).toBeLessThan(OLD_TOTAL_CEILING);
  });

  it("passes a page at exactly its cap", () => {
    const page = "/about";
    const { code, out } = run(buildFixture({ pageChunks: { [page]: { "big.js": capOf(page) - BASE } } }));
    expect(code).toBe(0);
    expect(firstLoadOf(out, page)).toBe(capOf(page));
  });

  it("counts a shared chunk in each page's first load, once per page", () => {
    const both = { "shared.js": 10_000 };
    const { out } = run(buildFixture({ pageChunks: { "/about": both, "/work": both } }));
    expect(firstLoadOf(out, "/about")).toBe(BASE + 10_000);
    expect(firstLoadOf(out, "/work")).toBe(BASE + 10_000);
    expect(firstLoadOf(out, "/resume")).toBe(BASE);
  });

  it("counts a file both the root and a page list once", () => {
    const { out } = run(buildFixture({ rootMain: { "layout.js": LAYOUT }, pageChunks: { "/": { "own.js": 120_000 } } }));
    expect(firstLoadOf(out, "/about")).toBe(LAYOUT + PAGE);
  });

  it("leaves polyfills out, and counts the same bytes as a root main file", () => {
    const polyfills = run(buildFixture({ polyfills: { "polyfills.js": 100_000 } }));
    const root = run(buildFixture({ rootMain: { "root-main.js": ROOT, "extra.js": 100_000 } }));
    expect(firstLoadOf(polyfills.out, "/about")).toBe(BASE);
    expect(firstLoadOf(root.out, "/about")).toBe(BASE + 100_000);
  });

  it("measures chunks where the manifests say they are, in an immutable layout", () => {
    const { code, out } = run(buildFixture({ chunkDir: "static/immutable/chunks" }));
    expect(code).toBe(0);
    expect(firstLoadOf(out, "/about")).toBe(BASE);
  });

  it("counts a symlinked chunk at its target's size", () => {
    const root = buildFixture();
    const chunks = join(root, ".next", "static", "chunks");
    renameSync(join(chunks, "layout.js"), join(chunks, "layout-target.js"));
    symlinkSync("layout-target.js", join(chunks, "layout.js"));
    expect(firstLoadOf(run(root).out, "/about")).toBe(BASE);
  });

  it("doesn't budget a route handler, which sends no JS", () => {
    const { code, out } = run(buildFixture());
    expect(code).toBe(0);
    expect(out).not.toContain("/opengraph-image");
  });

  it("fails a page with no budget", () => {
    const { code, out } = run(buildFixture({ pages: [...PAGES, "/new"] }));
    expect(code).toBe(1);
    expect(out).toContain("/new has no first-load budget");
  });

  it("fails a budget whose page isn't in the build", () => {
    const { code, out } = run(buildFixture({ pages: PAGES.filter((page) => page !== "/about") }));
    expect(code).toBe(1);
    expect(out).toContain("/about has a first-load budget but no page in this build");
  });

  it("fails a file a page loads that isn't in the build", () => {
    const { code, out } = run(buildFixture({ unwritten: ["layout.js"] }));
    expect(code).toBe(1);
    expect(out).toContain("are not in the build");
  });

  it("fails when the build manifest lists no root main files", () => {
    const { code, out } = run(buildFixture({ buildManifest: { polyfillFiles: [], rootMainFiles: [] } }));
    expect(code).toBe(1);
    expect(out).toContain("lists no rootMainFiles");
  });

  it("fails a page with no entryJSFiles object", () => {
    const { code, out } = run(buildFixture({ entryOverride: { "/about": { entryJSFiles: undefined } } }));
    expect(code).toBe(1);
    expect(out).toContain("has no entryJSFiles object");
  });

  it("fails a page whose entry files are empty, which would read low and pass", () => {
    const { code, out } = run(buildFixture({ entryOverride: { "/about": { entryJSFiles: {} } } }));
    expect(code).toBe(1);
    expect(out).toContain("/about lists no entry files");
  });

  it("fails manifests that lost the pages' own files, though every route is under its cap", () => {
    const { code, out } = run(buildFixture({ layoutBytes: 1_000 }));
    expect(code).toBe(1);
    expect(out).toContain("beyond the root files, under the floor of 100,000");
  });

  it("doesn't count the root files toward that floor when a page lists them too", () => {
    const { code, out } = run(buildFixture({ rootMain: { "layout.js": LAYOUT } }));
    expect(code).toBe(1);
    expect(out).toContain("beyond the root files, under the floor of 100,000");
  });
});

describe("the route table", () => {
  it("caps each page at its measured first load plus 25,000 bytes", () => {
    expect(ROUTE_SLACK).toBe(25_000);
    expect(PAGES.length).toBeGreaterThan(0);
    for (const page of PAGES) {
      expect(Number.isInteger(ROUTE_FIRST_LOAD[page]), page).toBe(true);
      expect(ROUTE_FIRST_LOAD[page], page).toBeGreaterThan(300_000);
    }
  });
});
