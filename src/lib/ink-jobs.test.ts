import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildJobs } from "@/content/jobs";
import copied from "@/content/job-tokens.json";
import { jobInk } from "./ink-jobs";
import { getRosterShippedTokens } from "./roster";

const shipped = getRosterShippedTokens();
const jobs = buildJobs({
  version: "9.9.9",
  components: 70,
  tiers: { atoms: 30, molecules: 30, organisms: 10 },
  tests: 3000,
  hosts: { gv: "gameverdict.app", retrospect: "retrospect.test", megasquad: "megasquad.org" },
});
const job = (id: string) => {
  const found = jobs.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`no job ${id}`);
  return found;
};

describe("the jobs", () => {
  it("are the six, in order, starting at rest", () => {
    expect(jobs.map(({ id }) => id)).toEqual([
      "site",
      "shipped",
      "gv",
      "retrospect",
      "megasquad",
      "br",
    ]);
    expect(jobs[0].scheme).toBe("page");
  });

  it("read Roster's numbers live where they're about Roster", () => {
    expect(job("shipped").pill).toBe("9.9.9");
    expect(job("shipped").stats[0]).toEqual({ value: "70", label: "Components" });
    expect(job("site").stats.map(({ value }) => value)).toEqual(["70", "3,000", "8"]);
    expect(job("site").segments.map(({ value }) => value)).toEqual([30, 30, 10]);
  });

  it("leaves out the tests stat when there's no figure to print", () => {
    const [site] = buildJobs({
      version: "9.9.9",
      components: 70,
      tiers: {},
      tests: null,
      hosts: { gv: "a", retrospect: "b", megasquad: "c" },
    });
    expect(site.stats.map(({ label }) => label)).toEqual(["Components", "Apps"]);
  });

  it("takes each slug line's count from the copied file", () => {
    for (const [id, tokens] of Object.entries(copied.jobs)) {
      expect(job(id).source).toBe(`${Object.keys(tokens).length} overrides · 0 components changed`);
    }
  });

  it("says whose tokens a reprint is in, for a screen reader", () => {
    expect(jobs.map(({ whose }) => whose)).toEqual([
      "this site's",
      "Roster's shipped",
      "Game Verdict's",
      "Retrospect's",
      "MegaSquad's",
      "Bragging Rocks'",
    ]);
  });

  it("carries the words Blake ruled on", () => {
    expect(job("gv").select).toEqual({
      label: "How you play it",
      options: ["Controller", "Keyboard and mouse", "Both"],
    });
    expect(job("megasquad").alert.body).toBe("Unpicked games count as losses.");
    expect(job("retrospect").alert.body).toContain("The meaning is yours.");
  });

  /* Hardness isn't a percent and an orb is degrees. A range that can't hold its
     own starting value draws a thumb at the wrong end. */
  it("gives every slider a value inside its own range", () => {
    for (const { id, slider } of jobs) {
      expect(slider.value, id).toBeGreaterThanOrEqual(slider.min);
      expect(slider.value, id).toBeLessThanOrEqual(slider.max);
    }
  });
});

describe("jobInk", () => {
  it("sets nothing of Roster's for the sheet at rest", () => {
    const { vars, dark, scoped } = jobInk(job("site"), shipped, true);
    expect(dark).toBe(false);
    expect(scoped).toBe(false);
    expect(Object.keys(vars).filter((name) => name.startsWith("--roster-"))).toEqual([
      "--roster-tabs-text",
    ]);
  });

  it("starts from the shipped tokens, so this site's remap can't show through", () => {
    const { vars } = jobInk(job("gv"), shipped, false);
    for (const name of ["--roster-amber-500", "--roster-teal-300", "--roster-purple-700"]) {
      expect(vars[name]).toBe(copied.jobs.gv[name as keyof typeof copied.jobs.gv] ?? shipped[name]);
    }
    expect(vars["--roster-card-bg"]).toBe("#1a1f2e");
  });

  it("applies the app's overrides over shipped", () => {
    expect(jobInk(job("br"), shipped, false).vars["--roster-gray-950"]).toBe("#26201a");
    expect(jobInk(job("shipped"), shipped, false).vars["--roster-gray-950"]).toBe(
      shipped["--roster-gray-950"],
    );
  });

  it("gives every job a card that hides the timeline's line behind a step", () => {
    for (const { id, card } of jobs) expect(card, id).not.toBe("transparent");
  });

  it("sets the job's card surface, which not every app declares as a token", () => {
    expect(jobInk(job("shipped"), shipped, false).vars["--roster-card-bg"]).toBe("#fafaf9");
  });

  it("keeps a printed job's fills as the app wrote them, in either state", () => {
    for (const pageDark of [false, true]) {
      const { vars } = jobInk(job("br"), shipped, pageDark);
      expect(vars["--job-print-ink"]).toBe("#332c26");
      expect(vars["--job-print-on-ink"]).toBe("#f5ead5");
      expect(vars["--job-print-wash"]).toBe("#e8dcca");
      expect(vars["--job-print-on-wash"]).toBe("#4f463f");
    }
    expect(jobInk(job("gv"), shipped, false).vars["--job-print-ink"]).toBeUndefined();
  });

  it("scopes every job but the sheet at rest", () => {
    for (const { id } of jobs.slice(1)) {
      expect(jobInk(job(id), shipped, false).scoped, id).toBe(true);
    }
  });

  /* A scope with no `.dark` of its own resets to light inside a dark page. */
  it("puts .dark on a dark job in either state, and on a light job on the blueline", () => {
    expect(jobInk(job("gv"), shipped, false).dark).toBe(true);
    expect(jobInk(job("gv"), shipped, true).dark).toBe(true);
    expect(jobInk(job("br"), shipped, false).dark).toBe(false);
    expect(jobInk(job("br"), shipped, true).dark).toBe(true);
  });

  it("leaves a dark job's ramps alone on the blueline", () => {
    const { vars } = jobInk(job("gv"), shipped, true);
    expect(vars["--roster-gray-50"]).toBe(jobInk(job("gv"), shipped, false).vars["--roster-gray-50"]);
    expect(vars["--roster-gray-50"]).toBe("#f8fafc");
  });

  it("leaves a light job's ramps alone on the press sheet", () => {
    const { vars } = jobInk(job("br"), shipped, false);
    expect(vars["--roster-gray-50"]).toBe("#efe4d0");
    expect(vars["--roster-gray-950"]).toBe("#26201a");
  });

  describe("a light job on the blueline", () => {
    const ramp = (family: string) =>
      Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step, at) => [
          `--roster-${family}-${step}`,
          `#${String(at).padStart(2, "0")}${family === "gray" ? "aaaa" : "bbbb"}`,
        ]),
      );
    const light = { ...job("br"), tokens: {}, ink: "#000000", ground: "#ffffff" };
    const { vars } = jobInk(light, { ...ramp("gray"), ...ramp("primary") }, true);

    it("reverses neutrals end to end", () => {
      expect(vars["--roster-gray-50"]).toBe("#10aaaa");
      expect(vars["--roster-gray-500"]).toBe("#05aaaa");
      expect(vars["--roster-gray-950"]).toBe("#00aaaa");
    });

    it("swaps a color family's ends, keeps 500, and puts 600 on 400 and 600", () => {
      expect(vars["--roster-primary-50"]).toBe("#10bbbb");
      expect(vars["--roster-primary-300"]).toBe("#07bbbb");
      expect(vars["--roster-primary-400"]).toBe("#06bbbb");
      expect(vars["--roster-primary-500"]).toBe("#05bbbb");
      expect(vars["--roster-primary-600"]).toBe("#06bbbb");
      expect(vars["--roster-primary-700"]).toBe("#03bbbb");
      expect(vars["--roster-primary-950"]).toBe("#00bbbb");
    });

    /* Roster's error, success and info ramps have ten steps. */
    it("keeps 500 and puts 600 on 400 on a ramp of ten steps too", () => {
      const ten = Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [
          `--roster-error-${step}`,
          `#${String(step).padStart(3, "0")}000`,
        ]),
      );
      const turned = jobInk(light, ten, true).vars;
      expect(turned["--roster-error-50"]).toBe("#900000");
      expect(turned["--roster-error-400"]).toBe("#600000");
      expect(turned["--roster-error-500"]).toBe("#500000");
      expect(turned["--roster-error-600"]).toBe("#600000");
      expect(turned["--roster-error-900"]).toBe("#050000");
    });

    it("chooses each ink again, by the fill it now sits on", () => {
      const dark = jobInk({ ...light }, { "--roster-gray-50": "#ffffff", "--roster-gray-950": "#000000" }, true);
      expect(dark.vars["--roster-gray-50"]).toBe("#000000");
      expect(dark.vars["--roster-gray-50-ink"]).toBe("#ffffff");
      expect(dark.vars["--roster-gray-950-ink"]).toBe("#000000");
    });

    it("turns Bragging Rocks' real neutrals over", () => {
      const turned = jobInk(job("br"), shipped, true).vars;
      expect(turned["--roster-gray-50"]).toBe("#26201a");
      expect(turned["--roster-gray-950"]).toBe("#efe4d0");
    });
  });
});

/* What only a browser would otherwise catch, read from source. */
describe("the sheet", () => {
  const source = readFileSync("src/app/specimens/ink-swap.tsx", "utf8");

  it("tells a screen reader what it reprinted", () => {
    expect(source).toMatch(/role="status"/);
    expect(source).toContain("Reprinted in ${whose} tokens.");
  });

  it("seats the registration marks while a job has the pointer or the keyboard", () => {
    const css = readFileSync("src/app/specimens/ink-swap.css", "utf8");
    expect(css).toMatch(
      /@media \(hover: hover\) \{\s+\.ink-swap:has\(\[role="radio"\]:hover, \.ink-sheet:hover\) \.ink-reg \.reg-plate/,
    );
    expect(css).toContain(
      '.ink-swap:has([role="radio"]:focus-visible, .ink-sheet :focus-visible) .ink-reg .reg-plate',
    );
  });

  /* Roster's ring is a box-shadow, and an unlayered `box-shadow: none` beats it. */
  it("leaves a printed control its focus ring", () => {
    const css = readFileSync("src/app/specimens/ink-swap.css", "utf8");
    const printed = css.slice(css.indexOf(".ink-print-ink,"), css.indexOf("/* And its timeline"));
    expect(printed).toContain("isolation: isolate;");
    expect(printed).not.toContain("box-shadow");
  });

  it("gives only a printed job its seals", () => {
    expect(source).toContain("...(job.printed && {");
    expect(source).toContain("<JobSeal");
  });

  it("stays out of every other route", () => {
    const importers = readdirSync("src", { recursive: true, encoding: "utf8" })
      .filter((path) => /\.tsx?$/.test(path) && !path.includes(".test."))
      .filter((path) => /from "[^"]*ink-swap"/.test(readFileSync(join("src", path), "utf8")));
    expect(importers).toEqual(["app/specimens/page.tsx"]);
  });
});
