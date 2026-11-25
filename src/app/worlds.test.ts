import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { apart, mixLab, ratio, rgb } from "@/lib/color-math";
import { barColors, barStyle, projects, resumeProjects, type Project } from "@/lib/projects";
import { RStat } from "@/lib/roster-ui";

/**
 * Each project's world: the set, as marks, and beside its neighbors. Every
 * value is a token in that app's own stylesheet. `text-ink.test.ts` holds the
 * inks as text.
 */

const STATES = ["press", "blueline"] as const;
const GROUNDS = {
  press: [rgb("#e7e8e3"), rgb("#f2f3ef")],
  blueline: [rgb("#0a0c11"), rgb("#121620")],
} as const;

const read = (...path: string[]) => readFileSync(join(process.cwd(), "src", ...path), "utf8");

/** The lower of a color's contrast on the paper and on the panel. */
const onGrounds = (hex: string, state: (typeof STATES)[number]) =>
  Math.min(...GROUNDS[state].map((ground) => ratio(rgb(hex), ground)));

describe("the worlds", () => {
  it("are these, in the order the site lists them", () => {
    expect(projects.map((p) => [p.slug, p.world])).toEqual([
      ["game-verdict", { press: "#3730a3", blueline: "#6366f1", pressInk: "#3730a3", bluelineInk: "#818cf8" }],
      ["bragging-rocks", { press: "#ba220d", blueline: "#ed5741", pressInk: "#9f1200", bluelineInk: "#ed5741" }],
      ["roster", { press: "#65635f", blueline: "#a8a29e", pressInk: "#1c1917", bluelineInk: "#e7e5e4" }],
      ["megasquad", { press: "#0770da", blueline: "#52a8ff", pressInk: "#0b59a8", bluelineInk: "#52a8ff" }],
      ["retrospect", { press: "#96731a", blueline: "#d4af37", pressInk: "#684d1d", bluelineInk: "#d4af37" }],
      ["tehon", { press: "#23604a", blueline: "#5c8b77", pressInk: "#23604a", bluelineInk: "#93bba8" }],
    ]);
  });

  it("read as marks, 3:1 or more on the paper and the panel", () => {
    for (const { slug, world } of projects)
      for (const state of STATES) expect(onGrounds(world[state], state), `${slug}, ${state}`).toBeGreaterThanOrEqual(3);
  });

  it("twin: Retrospect's old gold didn't", () => {
    expect(onGrounds("#b98a12", "press")).toBeCloseTo(2.54, 2);
  });

  it("sets Roster's words in its darkest neutrals, 12:1 or more, so they never read as dimmed", () => {
    const { pressInk, bluelineInk } = projects.find((p) => p.slug === "roster")!.world;
    expect(onGrounds(pressInk, "press")).toBeGreaterThanOrEqual(12);
    expect(onGrounds(bluelineInk, "blueline")).toBeGreaterThanOrEqual(12);
  });

  it("twin: the mid grays first drafted didn't", () => {
    expect(onGrounds("#57534e", "press")).toBeCloseTo(6.19, 2);
    expect(onGrounds("#a8a29e", "blueline")).toBeCloseTo(7.17, 2);
  });
});

/** The pairs that touch: each with the next in a list, and with the one below in two columns. */
const touching = (count: number): [number, number][] => [
  ...Array.from({ length: Math.max(0, count - 1) }, (_, i): [number, number] => [i, i + 1]),
  ...Array.from({ length: Math.max(0, count - 2) }, (_, i): [number, number] => [i, i + 2]),
];
type Marks = { slug: string; world: { press: string; blueline: string } };
const closest = (list: readonly Marks[], state: (typeof STATES)[number]) =>
  touching(list.length)
    .map(([a, b]) => ({ pair: `${list[a].slug} and ${list[b].slug}`, apart: apart(list[a].world[state], list[b].world[state]) }))
    .sort((x, y) => x.apart - y.apart)[0];

describe("neighbors", () => {
  it("knows which pairs touch", () => {
    expect(touching(4)).toEqual([[0, 1], [1, 2], [2, 3], [0, 2], [1, 3]]);
    expect(touching(6)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [1, 3], [2, 4], [3, 5]]);
  });

  it.each(STATES)("can be told apart in normal, deutan and protan vision, on the %s", (state) => {
    const worst = closest(projects, state);
    expect(worst.apart, worst.pair).toBeGreaterThanOrEqual(10);
  });

  /* The twin: the values before 23 Nov 2026, in this order. The two new apps'
     are the ones their first entries were drafted in. */
  it("twin: the old values in this order couldn't", () => {
    const old: Marks[] = [
      { slug: "game-verdict", world: { press: "#4b45c7", blueline: "#6d6bf2" } },
      { slug: "bragging-rocks", world: { press: "#ba220d", blueline: "#f0654a" } },
      { slug: "roster", world: { press: "#0e9b74", blueline: "#12b886" } },
      { slug: "megasquad", world: { press: "#c62828", blueline: "#e23b3b" } },
      { slug: "retrospect", world: { press: "#b98a12", blueline: "#d9a82c" } },
      { slug: "tehon", world: { press: "#23604a", blueline: "#ecd68c" } },
    ];
    for (const [state, figure] of [["press", 2.9], ["blueline", 6.9]] as const) {
      const worst = closest(old, state);
      expect(worst.apart, worst.pair).toBeCloseTo(figure, 1);
    }
  });
});

describe("Roster's color bar", () => {
  const PRESS = ["#3730a3", "#ba220d", "#0770da", "#96731a"];
  const BLUELINE = ["#6366f1", "#ed5741", "#52a8ff", "#d4af37"];

  it("is every project that runs on Roster, in page order, in both states", () => {
    expect(barColors("press")).toEqual(PRESS);
    expect(barColors("blueline")).toEqual(BLUELINE);
  });

  it("twin: with Tehon in it, which doesn't run on Roster, it isn't", () => {
    const withTehon = projects.map((p): Project => (p.slug === "tehon" ? { ...p, onRoster: true } : p));
    expect(barColors("press", withTehon)).toEqual([...PRESS, "#23604a"]);
    expect(projects.filter((p) => !p.onRoster).map((p) => p.slug)).toEqual(["roster", "tehon"]);
  });

  it("is equal segments with hard stops, under the names the CSS reads", () => {
    const strip = ([a, b, c, d]: string[]) =>
      `linear-gradient(to right, ${a} 0% 25%, ${b} 25% 50%, ${c} 50% 75%, ${d} 75% 100%)`;
    expect(barStyle()).toEqual({ "--bar-press": strip(PRESS), "--bar-blueline": strip(BLUELINE) });
    const css = read("app", "globals.css");
    expect(css).toMatch(/\n\.roster-bar \{[^}]*background: var\(--bar-press\);/);
    expect(css).toMatch(/\n\.dark \.roster-bar \{[^}]*background: var\(--bar-blueline\);/);
  });

  it("keeps the segments that touch apart", () => {
    for (const colors of [barColors("press"), barColors("blueline")])
      for (let i = 1; i < colors.length; i++) expect(apart(colors[i - 1], colors[i]), colors.join()).toBeGreaterThanOrEqual(10);
  });

  it("is laid over the top edge, inside its box, so it moves nothing", () => {
    const rule = /\n\.roster-bar \{([^}]*)\}/.exec(read("app", "globals.css"))?.[1] ?? "";
    for (const line of ["position: absolute;", "inset: 0 0 auto;", "height: 4px;", "pointer-events: none;"])
      expect(rule).toContain(line);
    /* The header has to be its box, or the bar goes to the top of the page. */
    expect(read("app", "work", "[slug]", "page.tsx")).toContain('className={slug === "roster" ? "relative isolate w-full" : "w-full"}');
  });

  it("is on Roster's card and Roster's header, and nowhere else", () => {
    const uses = ["app/page.tsx", "app/work/page.tsx", "app/work/[slug]/page.tsx"].map(
      (file) => read(...file.split("/")).match(/<RosterBar \/>/g)?.length ?? 0,
    );
    expect(uses).toEqual([1, 0, 1]);
    expect(read("app", "page.tsx")).toContain('{project.slug === "roster" && <RosterBar />}');
    expect(read("app", "work", "[slug]", "page.tsx")).toContain('{slug === "roster" && <RosterBar />}');
  });
});

describe("the résumé's five", () => {
  const FIVE = ["game-verdict", "bragging-rocks", "roster", "megasquad", "retrospect"];

  it("are named, in the site's order, and Tehon isn't one until it launches in a store", () => {
    expect(resumeProjects().map((p) => p.slug)).toEqual(FIVE);
    expect(projects.map((p) => p.slug)).toContain("tehon");
  });

  /* The list matches the array's first five today, so only a reorder can tell
     a list by slug from a list by place. */
  it("twin: the first five of an array with Tehon at the front aren't the five", () => {
    const tehon = projects.find((p) => p.slug === "tehon")!;
    const moved = [tehon, ...projects.filter((p) => p !== tehon)];
    expect(moved.slice(0, 5).map((p) => p.slug)).not.toEqual(FIVE);
    expect(resumeProjects(moved).map((p) => p.slug)).toEqual(FIVE);
    expect(read("app", "resume", "page.tsx")).toContain("const SELECTED = resumeProjects();");
  });
});

/* Small gray text on a case study header's gradient. The faint ink misses AA
   there, and so did a source Roster faded to 75% before 5.20.0. */
describe("the case study header's small text", () => {
  const page = read("app", "work", "[slug]", "page.tsx");
  const header = page.slice(page.indexOf("<header"), page.indexOf("</header>"));
  const toggle = read("components", "tldr-toggle.tsx");
  const FADED = /\bopacity-\d+/;

  it("reaches the header", () => {
    expect(header).toContain("<RStat");
    expect(header).toContain("<TldrToggle anchor />");
  });

  it("is never the faint ink", () => {
    expect(header).not.toContain("ink-faint");
    expect(toggle).not.toContain("ink-faint");
    expect(toggle).toContain("!text-ink-soft");
    expect(header).toContain("style={FIGURE_GRAYS}");
    expect(page).toMatch(/FIGURE_GRAYS = \{\s*"--roster-gray-400": "var\(--ink-soft\)",\s*"--roster-gray-500": "var\(--ink-soft\)",\s*\}/);
  });

  /* Where the gradient is darkest under small text: on a phone's press sheet the
     TL;DR control wraps under a title as long as Game Verdict's, into the corner.
     Its first glyph, at 320 wide, sits 34px across and 101.8px down a 546.8px
     header (MegaSquad's and Retrospect's, 673px). The stops are OKLab, so the
     world's share falls in a line to 9% at 46% of the way out. Within one 8-bit
     level of the pixels sampled there, 23 Nov 2026. */
  const softInkAt = (corner: number, slug: string, height: number) => {
    const out = Math.hypot((34 - 0.1 * 320) / (1.2 * 320), 101.8 / (1.5 * height));
    const share = (corner + (9 - corner) * (out / 0.46)) / 100;
    const { press } = projects.find((p) => p.slug === slug)!.world;
    return ratio(rgb("#54564d"), mixLab(rgb(press), share, GROUNDS.press[0]));
  };
  const corner = Number(/color-mix\(in oklab, var\(--world\) (\d+)%, var\(--paper\)\) 0%/.exec(header)?.[1]);

  it("keeps the soft ink readable in the gradient's corner, where a phone puts the TL;DR control", () => {
    expect(header).toContain("radial-gradient(120% 150% at 10% 0%");
    expect(header).toContain("color-mix(in oklab, var(--world) 9%, var(--paper)) 46%");
    expect(read("app", "globals.css")).toContain("--ink-soft: #54564d;");
    for (const [slug, height] of [["game-verdict", 546.8], ["megasquad", 673], ["retrospect", 673]] as const)
      expect(softInkAt(corner, slug, height), slug).toBeGreaterThanOrEqual(4.5);
    expect(softInkAt(corner, "game-verdict", 546.8)).toBeCloseTo(4.52, 2);
  });

  it.each([[21, 4.47], [22, 4.43]])("twin: a corner of %i%% reads %f on Game Verdict's", (percent, figure) => {
    expect(softInkAt(percent, "game-verdict", 546.8)).toBeCloseTo(figure, 2);
    expect(figure).toBeLessThan(4.5);
  });

  /* On, the control's words sat on the accent's wash over the gradient: the
     accent's own ink read 4.12 there, and full ink reads 9.5 or more. */
  const WORLD_INK = /text-\[[^\]]*--world-ink/;

  it("gives the TL;DR control full ink when it's on, never the accent's", () => {
    expect(toggle).not.toMatch(WORLD_INK);
    expect(toggle).toContain('"!border-[var(--world,var(--spot))] !text-ink "');
    expect(toggle).toContain('"!bg-[var(--world,var(--spot))]/10"');
  });

  it("twin: it did, until 23 Nov", () => {
    expect("!border-[var(--world,var(--spot))] !text-[var(--world-ink,var(--spot-ink))] ").toMatch(WORLD_INK);
  });

  it("draws a stat's source at full strength, in the two grays the header sets", () => {
    const html = renderToStaticMarkup(createElement(RStat, { value: "64", label: "Components", source: "live", colorScheme: "current" }));
    const source = /<span class="([^"]*)">live<\/span>/.exec(html)?.[1] ?? "";
    expect(source).toContain("text-gray-500");
    expect(source).toContain("dark:text-gray-400");
    expect(source).not.toMatch(FADED);
  });

  it("twin: Roster 5.19.4's source was faded", () => {
    expect("rst:text-gray-500 rst:opacity-75 rst:dark:text-gray-400").toMatch(FADED);
  });
});

/* The keyboard gets what the pointer gets. */
describe("focus on a project", () => {
  it("is drawn on the card, in the project's ink, with its mark on the border", () => {
    const css = read("app", "globals.css");
    expect(css).toMatch(/\.world-card:has\(h2 a:focus-visible\) \{\s*border-color: var\(--world\);/);
    expect(css).toMatch(/\.world-card:has\(h2 a:focus-visible\),\s*\.world-focus:focus-visible \{\s*outline: 2px solid var\(--world-ink\);\s*outline-offset: 2px;/);
    expect(css).toMatch(/\.world-card h2 a:focus-visible \{\s*color: var\(--world-ink\);\s*outline: none;/);
    expect(read("app", "page.tsx")).toContain("world world-card flex flex-col");
    /* The same column lines the prop rows up across a row of cards. */
    expect(read("app", "page.tsx")).toContain('className="mt-auto border-t border-rule px-4 pt-[10px]"');
  });

  it("is on the card's host link and /work's title", () => {
    expect(read("app", "page.tsx").match(/world-focus /g)).toHaveLength(1);
    expect(read("app", "work", "page.tsx").match(/world-focus /g)).toHaveLength(1);
  });

  it("rings a CTA in its own ink", () => {
    expect(read("lib", "roster-ui.tsx")).toContain('"--roster-ring": "var(--cta-ink)"');
  });

  it("underlines a title under the pointer, so no hover rests on hue", () => {
    for (const file of [["app", "page.tsx"], ["app", "work", "page.tsx"]])
      expect(read(...file)).toMatch(/decoration-2 underline-offset-4 [^"]*hover:text-\[var\(--world-ink\)\] hover:underline"/);
  });
});
