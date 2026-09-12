import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A case study may only show screenshots of its own app.
 *
 * This exists because it happened. A section about MegaSquad's picking mode
 * was inserted by anchoring on `eyebrow="The hard thing"` — a string three of
 * the four case studies use — so it landed in the Roster study, complete with
 * two MegaSquad screenshots and copy about tearing tickets.
 *
 * Nothing caught it. `tsc` passed, the build passed, the dek count passed:
 * the JSX was perfectly valid, it was just parented to the wrong object.
 * Every check in the suite was blind to WHICH study a section belonged to,
 * which is precisely the thing that went wrong.
 *
 * Read from source: the bodies are JSX, so there is no object to import and
 * inspect. Slice the file by top-level study key, then check that every image
 * identifier a slice references was imported from that study's own folder.
 */
const SOURCE = readFileSync(
  join(process.cwd(), "src", "content", "case-studies.tsx"),
  "utf8",
);

/** `import gvBrowse from "@/images/game-verdict/..."` -> gvBrowse: game-verdict */
const imageOwner = new Map(
  [...SOURCE.matchAll(/import (\w+) from "@\/images\/([a-z-]+)\//g)].map(
    (m) => [m[1], m[2]] as const,
  ),
);

/**
 * The folder each study's images live in, keyed as the study is keyed.
 *
 * `roster` maps to a folder that does not exist, and that is correct: the
 * Roster study is illustrated with live components, not screenshots. Mapping
 * it anyway means any image reference inside that slice resolves as foreign,
 * which is exactly the failure this file was written for.
 */
const FOLDER: Record<string, string> = {
  "game-verdict": "game-verdict",
  roster: "roster",
  retrospect: "retrospect",
  megasquad: "megasquad",
};

/** Studies that really do ship screenshots, and so must render some. */
const ILLUSTRATED = ["game-verdict", "retrospect", "megasquad"];

function slices(): { key: string; body: string }[] {
  /* Keys are a mix of bare and quoted - `roster:` but `"game-verdict":` -
     and a regex that only matched the bare form silently skipped the first
     study entirely. The coverage test above exists to catch exactly that. */
  const heads = [...SOURCE.matchAll(/^ {2}"?([a-z-]+)"?: \{$/gm)];
  return heads.map((h, i) => ({
    key: h[1],
    body: SOURCE.slice(h.index!, heads[i + 1]?.index ?? SOURCE.length),
  }));
}

describe("case study images", () => {
  it("covers every study that has a folder", () => {
    /* If a study is renamed or added, this fails rather than silently
       checking nothing. */
    const keys = slices().map((s) => s.key);
    for (const key of Object.keys(FOLDER)) expect(keys).toContain(key);
  });

  it.each(slices().map((s) => [s.key, s.body] as const))(
    "%s shows only its own screenshots",
    (key, body) => {
      /* Not `if (!folder) return`. A slice whose key is unrecognized used to
         pass silently, so anything that split the file differently - a nested
         object reformatted to two-space indent, a study renamed - disabled the
         check on a whole study while staying green. An unknown key is now the
         failure, not the excuse. */
      const folder = FOLDER[key];
      expect(Object.keys(FOLDER)).toContain(key);

      const foreign = [...body.matchAll(/\{(\w+)\}/g)]
        .map((m) => m[1])
        .filter((name) => imageOwner.has(name))
        .filter((name) => imageOwner.get(name) !== folder)
        .map((name) => `${name} (from ${imageOwner.get(name)})`);

      expect([...new Set(foreign)]).toEqual([]);
    },
  );

  it.each(ILLUSTRATED)("%s renders screenshots of its own", (key) => {
    /* The check above passes trivially on an empty slice, which is the shape
       every mis-slicing bug takes. This one fails instead. */
    const body = slices().find((s) => s.key === key)?.body ?? "";
    const own = [...body.matchAll(/\{(\w+)\}/g)]
      .map((m) => m[1])
      .filter((name) => imageOwner.get(name) === FOLDER[key]);

    expect(own.length).toBeGreaterThan(0);
  });
});
