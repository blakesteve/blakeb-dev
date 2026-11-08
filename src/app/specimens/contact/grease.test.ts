import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getRosterComponents, getRosterVersion } from "@/lib/roster";
import { DEPRECATED, NEWEST, greaseFor, greaseNote, greaseWords } from "./grease";

const semver = (v: string) => v.split(".").map(Number);
const atLeast = (a: string, b: string) => {
  const [x, y] = [semver(a), semver(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return true;
};

describe("the grease pencil's data", () => {
  const installed = getRosterComponents().map((c) => c.name);

  it("only names components the installed Roster ships", () => {
    for (const name of [...NEWEST.added, ...Object.keys(DEPRECATED), ...Object.values(DEPRECATED)]) {
      expect(installed, name).toContain(name);
    }
  });

  /* The record of the newest release that added a component. When a release
     adds or drops one, the count moves and this fails until the map says
     which release did it, so the circles move with it and can't pile up. */
  it("is about the library as installed", () => {
    expect(installed.length).toBe(NEWEST.total);
    expect(atLeast(getRosterVersion(), NEWEST.version)).toBe(true);
  });

  /* Spec 7.2's marks today, as literals. */
  it("circles only the newest release's additions, and crosses the deprecated", () => {
    const marked = Object.fromEntries(
      installed.flatMap((name) => {
        const grease = greaseFor(name);
        return grease ? [[name, grease]] : [];
      }),
    );
    expect(marked).toEqual({
      LiquidTabs: { kind: "deprecated", use: "Tabs" },
      RadioTileGroup: { kind: "new", version: "5.18.0" },
      Timeline: { kind: "new", version: "5.18.0" },
    });
    /* Tabs came in 5.15.0: an older addition, no circle. */
    expect(greaseFor("Tabs")).toBeNull();
  });

  it("puts the words the drawing can't say into the caption", () => {
    expect(greaseWords({ kind: "new", version: "5.18.0" })).toBe("new in 5.18.0");
    expect(greaseWords({ kind: "deprecated", use: "Tabs" })).toBe("deprecated, use Tabs");
    expect(greaseNote({ kind: "deprecated", use: "Tabs" })).toBe("use Tabs");
  });
});

/* Blake's rule: the note is never set in Comic Sans. Naming it is one way;
   a generic `cursive` is the other, which Chrome on Windows and Linux resolves
   to Comic Sans. The stack ends on this site's own face instead. */
describe("the grease pencil's note", () => {
  it("never falls to Comic Sans", () => {
    const css = readFileSync("src/app/specimens/contact/contact-sheet.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const rule = css.match(/\.cs-grease-note \{([^}]*)\}/)?.[1] ?? "";
    expect(rule.match(/font-family:\s*([^;]+);/)?.[1]).toBe('"Bradley Hand", "Segoe Print", var(--font-util)');
    /* Anywhere in the sheet's styles, not just this rule. */
    expect(css).not.toMatch(/comic sans|\bcursive\b/i);
  });
});
