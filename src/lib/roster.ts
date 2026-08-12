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
 */
export function getRosterComponents(): { tier: string; name: string }[] {
  const dts = read("dist", "index.d.ts");
  const found = new Map<string, string>();

  for (const line of dts.split("\n")) {
    const match = line.match(
      /\.\/components\/(atoms|molecules|organisms)\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)['"]/,
    );
    if (match && match[2] === match[3]) found.set(match[3], match[1]);
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
