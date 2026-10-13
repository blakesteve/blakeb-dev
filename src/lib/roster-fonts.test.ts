import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Roster's mono components (Eyebrow, InlineCode, Stat's source line,
 * DescriptionList's terms) set themselves in `var(--roster-font-mono, …)` and
 * fall back to `ui-monospace`. This site never set that variable, so on
 * production they rendered in the system mono beside the page's Plex Mono,
 * and nothing failed: the fallback is a perfectly good font.
 *
 * So this pins both halves. Roster still reads the variable (a rename there
 * would strand the declaration here), and this site still sets it, to the
 * Plex Mono stack, in a plain top-level `:root` rule where Roster's layered CSS
 * can't outrank it.
 */

const GLOBALS = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
const ROSTER_CSS = readFileSync(
  join(process.cwd(), "node_modules", "@blakesteve", "roster", "dist", "roster.css"),
  "utf8",
);

/**
 * Every value a custom property gets in a top-level rule with exactly this
 * prelude (`:root`, `@theme inline`): not nested inside `@layer` or `@media`,
 * and `:root` doesn't match `:root.dark`. Comments are removed first, so a
 * property named in prose doesn't count.
 */
function declarations(css: string, block: string, property: string): string[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found: string[] = [];
  const stack: string[] = [];
  let prelude = "";

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") {
      stack.push(prelude.trim());
      prelude = "";
    } else if (ch === "}") {
      stack.pop();
      prelude = "";
    } else if (ch === ";") {
      if (stack.length === 1 && stack[0] === block) {
        const [name, ...value] = prelude.split(":");
        if (name.trim() === property) found.push(value.join(":").trim());
      }
      prelude = "";
    } else {
      prelude += ch;
    }
  }
  return found;
}

describe("Roster's mono face", () => {
  it("is read by Roster from --roster-font-mono", () => {
    expect(ROSTER_CSS).toContain(".rst\\:font-mono{font-family:var(--roster-font-mono,");
  });

  it("is set by this site, at the top level, to the Plex Mono stack", () => {
    expect(declarations(GLOBALS, ":root", "--roster-font-mono")).toEqual(["var(--font-util)"]);
    /* --font-util lives in the theme, which Tailwind emits on :root. */
    expect(declarations(GLOBALS, "@theme inline", "--font-util")).toHaveLength(1);
    expect(declarations(GLOBALS, "@theme inline", "--font-util")[0]).toMatch(/^var\(--font-plex-mono\)/);
  });

  it("would fail without the declaration", () => {
    /* The twin: the same stylesheet with the one line taken out reads as unset,
       so the check above can't pass on a file that doesn't set it. */
    const without = GLOBALS.replace(/^\s*--roster-font-mono:[^;]*;\n/m, "");
    expect(without).not.toBe(GLOBALS);
    expect(declarations(without, ":root", "--roster-font-mono")).toEqual([]);
  });

  it("doesn't count a declaration inside a layer or the dark theme", () => {
    const p = "--roster-font-mono";
    expect(declarations("@layer roster { :root { --roster-font-mono: x; } }", ":root", p)).toEqual([]);
    expect(declarations(":root.dark { --roster-font-mono: x; }", ":root", p)).toEqual([]);
    expect(declarations(":root { --roster-font-mono: x; }", ":root", p)).toEqual(["x"]);
  });
});
