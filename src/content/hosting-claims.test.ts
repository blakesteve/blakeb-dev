import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Retrospect's hosting, as the site describes it to a visitor.
 *
 * Until 15 Nov 2026 the case study said it ran on Vercel Hobby, on free tiers,
 * built to cost nothing, with "$0 Hosting cost". Retrospect runs on Vercel Pro
 * with no spend cap, which bills overage rather than pausing, so none of that
 * was true. What stays true is the storage: Cloudflare R2 charges nothing for
 * egress. Reads are still billed operations past R2's allowance, so the words
 * say egress and bandwidth, never that serving is free.
 *
 * Read from source, sliced to Retrospect's own entries, with comments dropped:
 * the case study bodies are JSX, so there's no string to import. Each slice is
 * held to an anchor first, so a slice that came back empty, or cut short of
 * the cost section, fails rather than passing on nothing.
 */

const read = (...path: string[]) => readFileSync(join(process.cwd(), "src", ...path), "utf8");

/** The text between two markers, block and line comments removed. */
function slice(source: string, from: string, to: string): string {
  const start = source.indexOf(from);
  const end = source.indexOf(to, start + from.length);
  if (start < 0 || end < 0) return "";
  return source
    .slice(start, end)
    .replace(/\{?\/\*[\s\S]*?\*\/\}?/g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

const SLICES = {
  "the case study": {
    text: slice(read("content", "case-studies.tsx"), "\n  retrospect: {", "\n  megasquad: {"),
    anchor: "Cloudflare R2 for storage",
  },
  "the /work card": {
    text: slice(read("lib", "projects.ts"), 'slug: "retrospect"', 'slug: "megasquad"'),
    anchor: "astronomy-engine",
  },
};

/* Visitors get their bytes from Vercel, which reads R2 server-side, so nothing
   about bandwidth to listeners is free either; only R2's own egress is. */
const FALSE_CLAIMS = /hobby|free[\s-]+tiers?|costs?\s+nothing|hosting cost|bandwidth bill|nothing in bandwidth/i;

describe("what the site says Retrospect's hosting costs", () => {
  for (const [where, { text, anchor }] of Object.entries(SLICES)) {
    it(`reaches ${where}`, () => {
      expect(text).toContain(anchor);
    });

    it(`claims no Hobby plan, free tier or zero cost in ${where}`, () => {
      expect(text.match(FALSE_CLAIMS)?.[0] ?? null).toBeNull();
    });
  }

  it("says what is true instead", () => {
    const study = SLICES["the case study"].text;
    expect(study).toContain('{ k: "Hosting", v: "Vercel Pro" }');
    expect(study).toContain('{ value: "$0", label: "Egress fees on storage", source: "Cloudflare R2, by design" }');
  });
});
