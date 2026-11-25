import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { projects } from "@/lib/projects";

/**
 * The résumé is printed to PDF and handed to parsers that read its text, not
 * its links. So what it prints has to stand on its own: a headline that says
 * what he does, on a line of its own, and every link written as a whole
 * address, since a relative one goes nowhere off the site.
 */

const page = readFileSync(join(process.cwd(), "src", "app", "resume", "page.tsx"), "utf8");

describe("the résumé's header", () => {
  it("puts the approved headline on its own line, apart from the city", () => {
    expect(page).toContain(
      "\n              Front-end engineer and design-systems lead: React, Next.js, TypeScript, component libraries\n",
    );
    expect(page).toContain("\n              Austin, Texas\n");
    expect(page).not.toContain("Engineer · Austin, Texas");
  });
});

describe("the résumé's selected work", () => {
  /* The résumé is read on paper and in parsers, away from this site, so a
     line that points at "this site" or "this page" says nothing there. */
  it("describes every project without pointing at this site", () => {
    expect(page).toContain("{project.resumeLine ?? project.tagline}");
    for (const project of projects) {
      expect(project.resumeLine ?? project.tagline, project.slug).not.toMatch(/this (site|page)|\b(here|above|below)\b/i);
    }
    expect(projects.find((p) => p.slug === "roster")!.tagline).toContain("this site");
  });

  it("links each project's case study by its whole address", () => {
    expect(page).toContain("[`https://blakeb.dev/work/${project.slug}`, project.links[0].href]");
  });

  it("has a whole https address for every project's first link", () => {
    for (const project of projects) expect(project.links[0].href, project.slug).toMatch(/^https:\/\/[^/]+\./);
  });

  it("prints the scheme in the text too", () => {
    expect(page).toContain('<span className="hidden print:inline">https://</span>');
  });
});

/* Chromium prints a variable font's instance as Type 3 glyphs, which a PDF's
   text layer rebuilds as "I BM" and "B ALL". In print the résumé's faces come
   from system fonts that embed as TrueType. */
describe("the résumé in print", () => {
  const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
  const print = css.slice(css.indexOf("@media print"));
  const sheet = print.slice(print.indexOf(".resume-sheet {"), print.indexOf("}", print.indexOf(".resume-sheet {")));

  it("sets its text in faces that embed whole", () => {
    expect(sheet).toContain('--font-read: Charter, "Iowan Old Style", Georgia, serif;');
    expect(sheet).toContain('--font-display: "Helvetica Neue", Helvetica, Arial, sans-serif;');
    expect(sheet).not.toMatch(/var\(--font-(source-serif|archivo)\)/);
    expect(sheet).toContain("font-variant-ligatures: none;");
    expect(sheet).toContain("font-family: var(--font-read);");
  });
});
