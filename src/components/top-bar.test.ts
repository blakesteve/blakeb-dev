import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Two rules about the bar that live in markup, read from source because this
 * suite has no DOM. What they do in a browser needs a browser. These keep the
 * rule from quietly coming back undone.
 */

const read = (...path: string[]) => readFileSync(join(process.cwd(), "src", ...path), "utf8");

describe("a hidden control in the bar", () => {
  /* `aria-hidden` and opacity 0 left the TL;DR button in the tab order: Tab
     reached a button nobody could see. */
  it.each(["top-bar-tldr.tsx", "top-bar-mark.tsx"])("is invisible in %s, not just transparent", (file) => {
    const source = read("components", file);
    expect(source).toMatch(/pointer-events-none invisible /);
    expect(source).not.toMatch(/aria-hidden=/);
    expect(source).not.toMatch(/tabIndex=/);
  });

  it("is the half the slot isn't showing, by visibility", () => {
    const css = read("app", "globals.css");
    const hidden = (selector: string) =>
      new RegExp(`${selector.replaceAll(".", "\\.")} \\{[^}]*visibility: hidden;`).test(css);
    expect(hidden(".bar-slot-head")).toBe(true);
    expect(hidden(".bar-slot-past .bar-slot-nav")).toBe(true);
    /* The twin: a rule that only fades doesn't count. */
    expect(hidden(".bar-slot")).toBe(false);
  });
});

describe("the TL;DR handoff", () => {
  /* On a short screen the page's copy starts below the fold. Not intersecting
     isn't enough there, and the button landed on top of the nav. */
  it("waits for the page's copy to go above the screen, not just off it", () => {
    expect(read("components", "top-bar-tldr.tsx")).toMatch(/isPastTitle\(/);
    expect(read("components", "top-bar-tldr.tsx")).not.toMatch(/setShown\(!entry\.isIntersecting\)/);
  });
});

describe("the observers on the title and the TL;DR anchor", () => {
  /* On a short screen both can start below the fold, and a jump straight past
     changes nothing an observer with the usual root would report. */
  it.each(["bar-slot.tsx", "top-bar-tldr.tsx"])("reach below the fold in %s", (file) => {
    expect(read("components", file)).toMatch(/rootMargin: `[^`]*\$\{BELOW_THE_FOLD\}/);
  });
});

describe("the running head", () => {
  /* Roster's line height left it 0.6px above the nav beside it. */
  it("sets the nav's line height, so the two share a baseline", () => {
    expect(read("components", "nav-links.tsx")).toContain("leading-[15px]");
    expect(read("components", "breadcrumbs.tsx")).toContain("[&_*]:leading-[15px]");
  });
});

describe("the lit nav item", () => {
  /* X-ray's label is every annotated component's `::after`. A tab drawn there
     blanked the label on the lit link and pulled the tab off the rule. */
  it("draws its tab on ::before, leaving ::after to X-ray", () => {
    const css = read("app", "globals.css");
    expect(css).toMatch(/\.nav-link\[aria-current\]::before \{/);
    expect(css).not.toMatch(/\.nav-link\[aria-current\]::after/);
    expect(css).toMatch(/\.xray \[data-roster\]::after \{/);
  });

  it("scales from its left edge, which the slide's keyframes assume", () => {
    expect(read("app", "globals.css")).toMatch(
      /\.nav-link\[aria-current\]::before \{[^}]*transform-origin: left;/,
    );
  });
});

describe("the pages", () => {
  function pages(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return pages(path);
      return /^(page|not-found)\.tsx$/.test(name) ? [path] : [];
    });
  }
  const all = pages(join(process.cwd(), "src", "app"));

  it("all render the bar, so the scan below has something to read", () => {
    expect(all.length).toBeGreaterThanOrEqual(9);
    for (const file of all) expect(readFileSync(file, "utf8"), file).toContain("<TopBar");
  });

  it("draw no breadcrumb of their own: the lit nav item and the h1 already say it", () => {
    for (const file of all) expect(readFileSync(file, "utf8"), file).not.toContain("RBreadcrumbs");
  });

  it("mark the title on the two deep routes, which is what the running head watches", () => {
    for (const route of ["work", "writing"]) {
      expect(read("app", route, "[slug]", "page.tsx")).toMatch(/<h1 data-page-title/);
    }
  });
});
