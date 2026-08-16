import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads the installed @blakesteve/roster package at build time, so the numbers
 * and swatches on the page are the library's own rather than a copy of them.
 * Publish a component, and this page counts it on the next deploy.
 *
 * These are plain file reads rather than `require.resolve` on purpose: Roster's
 * exports map does not expose package.json, and Turbopack cannot place a CSS
 * file in an ESM chunk. Reading from node_modules sidesteps module resolution
 * entirely and stays a build-time-only concern.
 */

const ROSTER_DIR = join(process.cwd(), "node_modules", "@blakesteve", "roster");

function read(...segments: string[]): string {
  return readFileSync(join(ROSTER_DIR, ...segments), "utf8");
}

export function getRosterVersion(): string {
  const pkg = JSON.parse(read("package.json")) as { version: string };
  return pkg.version;
}

/**
 * Every component is re-exported as `./components/<tier>/<Name>/<Name>`. The
 * sibling `<name>-variants` modules are CVA config, not components, so the
 * matching folder-and-file name is what separates the two.
 *
 * Both entry points are read. As of Roster 4.0.0 DataTable ships from its own
 * entry so its TanStack peer stays optional, and reading only index.d.ts would
 * quietly undercount the library by one.
 */
export function getRosterComponents(): { tier: string; name: string }[] {
  const found = new Map<string, string>();

  for (const entry of ["index.d.ts", "data-table.d.ts"]) {
    let dts: string;
    try {
      dts = read("dist", entry);
    } catch {
      continue; // Entry points come and go between majors; skip what is absent.
    }

    for (const line of dts.split("\n")) {
      const match = line.match(
        /\.\/components\/(atoms|molecules|organisms)\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)['"]/,
      );
      if (match && match[2] === match[3]) found.set(match[3], match[1]);
    }
  }

  return [...found].map(([name, tier]) => ({ name, tier }));
}

export function getRosterComponentCount(): number {
  return getRosterComponents().length;
}

/** Pulls specific `--roster-*` declarations out of the shipped tokens.css. */
export function getRosterTokens(names: string[]): { name: string; value: string }[] {
  const css = read("dist", "tokens.css");

  return names.map((name) => {
    const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
    return { name: `--${name}`, value: match ? match[1] : "#000000" };
  });
}

/**
 * Every color family the shipped tokens.css declares, in the order Roster
 * declares them. Read rather than listed, so a new family appears on /system
 * the next time this site builds.
 */
export function getRosterTokenFamilies(): string[] {
  const css = read("dist", "tokens.css");
  const families = new Set<string>();

  for (const match of css.matchAll(/--roster-([a-z]+)-\d+\s*:/g)) {
    families.add(match[1]);
  }

  return [...families];
}

/**
 * One family's full ramp, with the hex Roster ships for each step.
 *
 * The shipped value is what matters here: the page renders each swatch twice,
 * once from this hex and once from `var(--roster-<family>-<step>)`, which this
 * site has remapped. Side by side, the override is the whole point — the same
 * component, two palettes, no fork.
 */
export function getRosterRamp(family: string): { step: number; shipped: string }[] {
  const css = read("dist", "tokens.css");
  const steps: { step: number; shipped: string }[] = [];

  for (const match of css.matchAll(
    new RegExp(`--roster-${family}-(\\d+)\\s*:\\s*(#[0-9a-fA-F]{3,8})`, "g"),
  )) {
    steps.push({ step: Number(match[1]), shipped: match[2] });
  }

  return steps.sort((a, b) => a.step - b.step);
}

/**
 * Every `--roster-*` token exactly as the package ships it.
 *
 * Used to render a component under Roster's own palette beside the same
 * component under this site's, on the same page, in real DOM. Applied as inline
 * styles on a wrapper rather than by importing `tokens.css` a second time: an
 * inline style cannot escape its subtree, so there is no way for this to leak
 * into the rest of the page and repaint the site.
 *
 * The shipped file is a single flat `:root` block with no dark variants, which
 * is what makes that safe.
 */
export function getRosterShippedTokens(): Record<string, string> {
  const css = read("dist", "tokens.css");
  const tokens: Record<string, string> = {};

  for (const match of css.matchAll(/(--roster-[a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
    tokens[match[1]] = match[2].trim();
  }

  return tokens;
}
