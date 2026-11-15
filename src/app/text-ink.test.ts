import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { projects, worldStyle } from "@/lib/projects";
import { SITE_ROSTER_INKS } from "@/lib/site-inks";

/**
 * The spot as text. `--spot` (#d6006d) is the site's mark: rules, tabs, the
 * registration mark, swatches. As small text it was 4.18:1 on the press
 * sheet's paper, and RCta's default, spot words on a 10% spot wash, was 3.54:1.
 * `--spot-ink` is the same hue taken darker for text. These read the tokens
 * out of globals.css, so a new value is measured rather than trusted.
 */

const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

/** A custom property's value in the first block that opens with `selector {`. */
function token(selector: string, name: string): string {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const value = new RegExp(`\\n\\s*${name}:\\s*([^;]+);`).exec(block)?.[1].trim();
  if (start < 0 || !value) throw new Error(`${name} isn't set in ${selector}`);
  return value;
}

type Rgb = [number, number, number];
const rgb = (hex: string): Rgb => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a six-digit hex: ${hex}`);
  return [0, 2, 4].map((at) => parseInt(m[1].slice(at, at + 2), 16)) as Rgb;
};
const lum = (c: Rgb) => {
  const [r, g, b] = c.map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** `fg` at `alpha` laid over `bg`, as `bg-[var(--cta)]/10` paints it. */
const wash = (fg: Rgb, alpha: number, bg: Rgb): Rgb => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as Rgb;

const LOOKS = {
  "the press sheet": ":root",
  "the blueline": ":root.dark",
} as const;

function look(selector: string) {
  const spot = rgb(token(selector, "--spot"));
  const inkValue = token(selector, "--spot-ink");
  const ink = inkValue === "var(--spot)" ? spot : rgb(inkValue);
  const paper = rgb(token(selector, "--paper"));
  const panel = rgb(token(selector, "--panel"));
  return { spot, ink, paper, panel };
}

describe("the spot's text ink", () => {
  for (const [name, selector] of Object.entries(LOOKS)) {
    it(`reads at 4.5:1 or more on ${name}'s paper, panel and RCta's wash`, () => {
      const { spot, ink, paper, panel } = look(selector);
      const pairs = {
        paper: ratio(ink, paper),
        panel: ratio(ink, panel),
        "wash on paper": ratio(ink, wash(spot, 0.1, paper)),
        "wash on panel": ratio(ink, wash(spot, 0.1, panel)),
      };
      for (const [on, k] of Object.entries(pairs)) expect(k, `${name}, ${on}`).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const [name, selector] of Object.entries(LOOKS)) {
    it(`gives the second color a text ink that reads at 4.5:1 or more on ${name}, and on its wash`, () => {
      const { paper, panel } = look(selector);
      const second = rgb(token(selector, "--second"));
      const ink = rgb(token(selector, "--second-ink"));
      for (const [on, ground] of Object.entries({ paper, panel, "wash on paper": wash(second, 0.1, paper), "wash on panel": wash(second, 0.1, panel) }))
        expect(ratio(ink, ground), `${name}, ${on}`).toBeGreaterThanOrEqual(4.5);
    });
  }

  /* The twin: the spot itself as text is what failed, and the fix leaves the
     spot alone. If a later change darkens `--spot` instead, this says so. */
  it("is needed: the press sheet's spot as text is under AA, as it was", () => {
    const { spot, paper } = look(":root");
    expect(token(":root", "--spot")).toBe("#d6006d");
    expect(ratio(spot, paper)).toBeCloseTo(4.18, 2);
    expect(ratio(spot, wash(spot, 0.1, paper))).toBeCloseTo(3.54, 2);
  });

  it("is the 15 Nov value", () => {
    expect(token(":root", "--spot-ink")).toBe("#b10159");
    expect(token(":root.dark", "--spot-ink")).toBe("var(--spot)");
  });
});

/**
 * Where the spot still colors text. Every small text that used `text-spot`
 * now uses `text-spot-ink`; what's left is large type, which only needs 3:1,
 * and marks. A new `text-spot` fails here until it's one of those, on purpose.
 */
const STILL_SPOT = [
  "src/app/page.tsx: Fluent in <span className=\"text-spot\">designer.</span>",
  "src/app/resume/page.tsx: before:text-spot before:content-['—']",
  "src/app/writing/page.tsx: group-hover:text-spot",
  "src/app/about/page.tsx: <RPullquote cite=\"The thing I will talk your ear off about\" colorScheme=\"current\" className=\"text-spot\">",
  "src/app/specimens/contact/molecules.tsx: <span className=\"text-spot\">",
];

function sources(dir: string): string[] {
  return readdirSync(join(process.cwd(), dir), { recursive: true, encoding: "utf8" })
    .filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.ts$/.test(f))
    .map((f) => join(dir, f));
}

describe("spot as text", () => {
  const files = sources("src");

  it("reaches the files that print it", () => {
    expect(files).toContain(join("src", "components", "nav-links.tsx"));
    expect(files).toContain(join("src", "app", "specimens", "contact", "contact-sheet.css"));
  });

  it("is only large type and marks", () => {
    const found: string[] = [];
    for (const file of files) {
      const lines = readFileSync(join(process.cwd(), file), "utf8").split("\n");
      for (const line of lines) {
        if (
          /(?<![\w-])text-spot(?![\w-])/.test(line) ||
          /text-\[var\(--spot[,)]/.test(line) ||
          /(?<![\w-])color:\s*var\(--spot\)/.test(line)
        ) {
          const hit = STILL_SPOT.find((entry) => {
            const [where, what] = entry.split(": ");
            return file === where && line.includes(what);
          });
          found.push(hit ?? `${file}: ${line.trim()}`);
        }
      }
    }
    expect(found.sort()).toEqual([...STILL_SPOT].sort());
  });

  it("gives RCta's default words the ink, and a passed tint all three unless it brings an ink", () => {
    const ui = readFileSync(join(process.cwd(), "src", "lib", "roster-ui.tsx"), "utf8");
    expect(ui).toContain('const ink = inkProp ?? (tint ? tint : "var(--spot-ink)");');
    expect(ui).toContain("!text-[var(--cta-ink)]");
    expect(ui).not.toContain("!text-[var(--cta)]");
  });
});

/* `color-mix(in oklab, world N%, paper)`, as the case-study header paints it. */
const toLab = (c: Rgb) => {
  const [r, g, b] = c.map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};
const fromLab = ([L, a, b]: number[]): Rgb => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)))) as Rgb;
};
const mixLab = (fg: Rgb, share: number, bg: Rgb): Rgb => {
  const [a, b] = [toLab(fg), toLab(bg)];
  return fromLab(a.map((v, i) => v * share + b[i] * (1 - share)));
};

/**
 * Each project's world, as text. The world itself stays on rules, dots, the
 * card's top edge and the header's gradient; text takes its ink. Measured on
 * everything world text sits on: the paper, the panel, RCta's 10% wash, and the
 * case-study header at 15% world, the most any of its text sits on (13.7%,
 * sampled under every header figure and link at 320, 375 and 1280, 15 Nov 2026).
 * Large text is held to 4.5 too, so one token serves both sizes.
 */
describe("each world's text ink", () => {
  const press = look(":root");
  const blueline = look(":root.dark");

  for (const project of projects) {
    for (const [name, ground, world, ink] of [
      ["the press sheet", press, project.world.press, project.world.pressInk],
      ["the blueline", blueline, project.world.blueline, project.world.bluelineInk],
    ] as const) {
      it(`${project.slug} reads at 4.5:1 or more on ${name}`, () => {
        const [w, k] = [rgb(world), rgb(ink)];
        const pairs = {
          paper: ratio(k, ground.paper),
          panel: ratio(k, ground.panel),
          "wash on paper": ratio(k, wash(w, 0.1, ground.paper)),
          "wash on panel": ratio(k, wash(w, 0.1, ground.panel)),
          "header at 15%": ratio(k, mixLab(w, 0.15, ground.paper)),
        };
        for (const [on, r] of Object.entries(pairs)) expect(r, `${project.slug}, ${name}, ${on}`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  /* The inks are pinned above, but a value only reaches the page through
     worldStyle() and the .world rules. A worldStyle() that put the world under
     the ink's name passed every other test here. */
  it("reaches the page: worldStyle declares each value under its name, and .world picks the ink by state", () => {
    for (const project of projects) {
      expect(worldStyle(project.world), project.slug).toEqual({
        "--world-press": project.world.press,
        "--world-blueline": project.world.blueline,
        "--world-ink-press": project.world.pressInk,
        "--world-ink-blueline": project.world.bluelineInk,
      });
    }
    const rule = (selector: string) => {
      const start = css.indexOf(`\n${selector} {`);
      return start < 0 ? "" : css.slice(start, css.indexOf("}", start));
    };
    expect(rule(".world")).toContain("--world-ink: var(--world-ink-press);");
    expect(rule(".dark .world")).toContain("--world-ink: var(--world-ink-blueline);");
    for (const page of [["page.tsx"], ["work", "page.tsx"], ["work", "[slug]", "page.tsx"]]) {
      const source = readFileSync(join(process.cwd(), "src", "app", ...page), "utf8");
      expect(source, page.join("/")).toContain("style={worldStyle(project.world)}");
    }
  });

  it("is the 15 Nov set", () => {
    expect(Object.fromEntries(projects.map((p) => [p.slug, p.world]))).toEqual({
      "game-verdict": { press: "#4b45c7", blueline: "#6d6bf2", pressInk: "#4b45c7", bluelineInk: "#7879ff" },
      roster: { press: "#0e9b74", blueline: "#12b886", pressInk: "#006b4f", bluelineInk: "#12b886" },
      retrospect: { press: "#b98a12", blueline: "#d9a82c", pressInk: "#7a5900", bluelineInk: "#d9a82c" },
      megasquad: { press: "#c62828", blueline: "#e23b3b", pressInk: "#b50f18", bluelineInk: "#f04a47" },
    });
  });

  /* The twin: the worlds themselves, as text, are what failed. */
  it("is needed: the worlds as text are under AA where they changed", () => {
    const at = (slug: string) => projects.find((p) => p.slug === slug)!.world;
    expect(ratio(rgb(at("roster").press), press.paper)).toBeCloseTo(2.86, 2);
    expect(ratio(rgb(at("retrospect").press), press.paper)).toBeCloseTo(2.54, 2);
    expect(ratio(rgb(at("megasquad").press), wash(rgb(at("megasquad").press), 0.1, press.paper))).toBeLessThan(4.5);
    expect(ratio(rgb(at("game-verdict").blueline), blueline.panel)).toBeLessThan(4.5);
    expect(ratio(rgb(at("megasquad").blueline), blueline.panel)).toBeLessThan(4.5);
  });
});

/**
 * Where the world still colors text. Only the pullquote's wrapper, which sets
 * the color its rule inherits while the quote inside is ink. A world RCta
 * always passes its ink with its tint.
 */
describe("the world as text", () => {
  const files = sources("src");

  it("is only the pullquote's rule", () => {
    const found: string[] = [];
    for (const file of files) {
      for (const line of readFileSync(join(process.cwd(), file), "utf8").split("\n")) {
        if (/text-\[var\(--world[,)]/.test(line)) found.push(`${file}: ${line.trim()}`);
      }
    }
    expect(found).toEqual([`${join("src", "content", "case-studies.tsx")}: <span className="block text-[var(--world)]">`]);
  });

  it("gives every world RCta its ink", () => {
    let tints = 0;
    for (const file of files) {
      for (const line of readFileSync(join(process.cwd(), file), "utf8").split("\n")) {
        if (line.includes('tint="var(--world)"')) {
          tints += 1;
          expect(line, file).toContain('ink="var(--world-ink)"');
        }
      }
    }
    expect(tints).toBe(4);
  });
});

/* The site sets some of Roster's text-on-fill inks for its own fills. The
   "As Roster ships it" column has to unset each one, or it shows this site's
   ink on Roster's shipped colors, which is neither. */
describe("the inks the site sets for Roster", () => {
  it("are the list the shipped views unset", () => {
    const set = [...css.matchAll(/(--roster-[a-z0-9-]+-ink)\s*:/g)].map((m) => m[1]);
    expect(set).toEqual([...SITE_ROSTER_INKS]);
    expect(SITE_ROSTER_INKS).toEqual(["--roster-primary-500-ink"]);
  });

  it("are unset in the shipped column", () => {
    const shipped = readFileSync(join(process.cwd(), "src", "components", "both-palettes.tsx"), "utf8");
    expect(shipped).toContain('...Object.fromEntries(SITE_ROSTER_INKS.map((ink) => [ink, "initial"])),');
  });
});

/* The TL;DR summary sits on its accent's 10% wash. Its words are ink: the soft
   ink there was under 4.5:1 on every summary on the press sheet. */
describe("the TL;DR summary", () => {
  it("sets its words in full ink", () => {
    const dek = readFileSync(join(process.cwd(), "src", "components", "dek.tsx"), "utf8");
    expect(dek).toContain("text-[0.9375rem] leading-[1.6] text-ink\">");
    const { paper } = look(":root");
    const ink = rgb(token(":root", "--ink"));
    for (const project of projects) expect(ratio(ink, wash(rgb(project.world.pressInk), 0.1, paper)), project.slug).toBeGreaterThanOrEqual(4.5);
    expect(ratio(ink, wash(rgb(token(":root", "--spot-ink")), 0.1, paper))).toBeGreaterThanOrEqual(4.5);
  });
});

