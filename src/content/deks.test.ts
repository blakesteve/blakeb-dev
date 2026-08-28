import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The TL;DR lens is only worth having if the deks stay short and stay plain.
 *
 * That a dek *exists* is already guaranteed by the type — `Section` and `H`
 * both require it, so a heading without one fails the build rather than
 * shipping a hole in the lens. What a type cannot check is whether the sentence
 * is still a summary. A dek that grows to a paragraph, or that explains a
 * cascade layer using the words "cascade layer", has quietly become a second
 * copy of the prose, which is the exact thing this design refused to build.
 *
 * Read from the source rather than from exports because the deks are JSX props
 * inside a rendered body; there is no object to import.
 */

const FILES = ["case-studies.tsx", "posts.tsx"] as const;

function deksIn(file: string): { file: string; dek: string }[] {
  const src = readFileSync(join(process.cwd(), "src", "content", file), "utf8");
  return [...src.matchAll(/\bdek="([^"]+)"/g)].map((m) => ({ file, dek: m[1] }));
}

const ALL = FILES.flatMap(deksIn);

/* Jargon the lens exists to avoid. A reader who knows these words does not
   need the summary; a reader who does not is the one being written for. */
const JARGON = [
  "cascade layer",
  "permutation test",
  "custom propert",
  "peer dependency",
  "serverless",
  "preflight",
  "specificity",
  "ISR",
  "RSC",
];

describe("section deks", () => {
  it("exist in both content files", () => {
    expect(deksIn("case-studies.tsx").length).toBe(25);
    expect(deksIn("posts.tsx").length).toBe(4);
  });

  it.each(ALL.map((d) => [d.dek.slice(0, 45), d.dek] as const))(
    "%s… is one short summary",
    (_head, dek) => {
      expect(dek.trim()).not.toBe("");
      // Long enough to say something, short enough to still be a shortcut.
      expect(dek.length).toBeGreaterThan(60);
      expect(dek.length).toBeLessThanOrEqual(260);
    },
  );

  it.each(ALL.map((d) => [d.dek.slice(0, 45), d.dek] as const))(
    "%s… avoids the jargon the lens exists to translate",
    (_head, dek) => {
      const found = JARGON.filter((term) =>
        dek.toLowerCase().includes(term.toLowerCase()),
      );
      expect(found).toEqual([]);
    },
  );

  it("does not repeat a dek across sections", () => {
    const seen = ALL.map((d) => d.dek);
    expect(new Set(seen).size).toBe(seen.length);
  });
});
