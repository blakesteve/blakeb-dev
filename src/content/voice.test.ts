import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Two house rules about prose, enforced on the prose rather than remembered.
 *
 * Both have been broken more than once, and both are invisible to every other
 * check here: a British spelling and the word "cannot" are perfectly valid
 * TypeScript, render without complaint, and read as correct to anyone who does
 * not already know the preference. The only thing that catches them is looking
 * for them, which is what this file is.
 *
 * Scope is deliberately the reader-facing text only. Code comments are working
 * notes, not published writing, and holding them to a voice rule would produce
 * churn in files nobody reads for style.
 */

const FILES = ["case-studies.tsx", "posts.tsx"] as const;

/**
 * The prose, with the code stripped out.
 *
 * Block comments go first, then line comments, then anything that reads as an
 * identifier rather than a sentence: imports, JSX tag names, className strings,
 * and the props whose values are class lists rather than copy. What survives is
 * body text plus the handful of attributes that are genuinely read aloud on the
 * page - `dek`, `caption`, `alt`, `title`, `cite`, `lede`, `label`, `source`.
 */
/**
 * Whether a `/*` at this index really opens a comment.
 *
 * Being outside a string is not enough: `src/components/*` is prose, and
 * treating it as an opener swallows the rest of the file. Every block comment
 * in these two files starts a line, or follows the `{` of a JSX expression
 * container. Nothing else counts.
 */
function opensAComment(raw: string, at: number): boolean {
  let i = at - 1;
  while (i >= 0 && (raw[i] === " " || raw[i] === "\t")) i -= 1;
  return i < 0 || raw[i] === "\n" || raw[i] === "{";
}

function proseIn(file: string): string {
  const raw = readFileSync(join(process.cwd(), "src", "content", file), "utf8");

  /* Comments are stripped character by character rather than with a regex,
     because `/\*` is a sequence that appears in prose. A file glob is the
     obvious case, and this post prints two of them. A whole-file
     `replace(/\/\*[\s\S]*?\*\//g, " ")` treats the first one it meets as the
     start of a comment and eats everything up to the next real `*\/` - which
     measured at 36% of the extracted text when tried, with the guard still
     green, because the anchors below all sat ahead of the damage.

     So: walk the file, track whether we are inside a string or a template
     literal, and only honor a comment opener when we are not. */
  let out = "";
  let i = 0;
  let quote: string | null = null;

  while (i < raw.length) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (quote) {
      if (ch === "\\") {
        out += ch + (next ?? "");
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*" && opensAComment(raw, i)) {
      const end = raw.indexOf("*/", i + 2);
      i = end === -1 ? raw.length : end + 2;
      out += " ";
      continue;
    }

    if (ch === "/" && next === "/") {
      const end = raw.indexOf("\n", i);
      i = end === -1 ? raw.length : end;
      out += " ";
      continue;
    }

    out += ch;
    i += 1;
  }

  /* className and its relatives carry utility names, and a utility like
     `text-center` would read as a British spelling forever. */
  const noClasses = out.replace(
    /\b(?:className|class|tint|style)=(?:"[^"]*"|\{[^}]*\})/g,
    " ",
  );

  /* Inline code and code blocks quote identifiers, class names and compiler
     output verbatim. A post that quotes `Type 'X' cannot be assigned` is not
     making a style mistake, and failing the build over it would teach everyone
     to work around the guard. */
  const noCode = noClasses
    .replace(/<RInlineCode>[\s\S]*?<\/RInlineCode>/g, " ")
    .replace(/<Code>[\s\S]*?<\/Code>/g, " ")
    .replace(/<code[^>]*>[\s\S]*?<\/code>/g, " ");

  return noCode.replace(/^import[\s\S]*?from\s+"[^"]+";$/gm, " ");
}

const PROSE = FILES.map((f) => [f, proseIn(f)] as const);

describe("prose voice", () => {
  it("never uses the closed form cannot", () => {
    /* Blake writes "can't", or "can not" as two words. The closed form reads as
       someone else's register, and it had accumulated eight times across these
       two files before anyone went looking. */
    for (const [file, prose] of PROSE) {
      const hits = [...prose.matchAll(/\bcannot\b/g)].map((m) =>
        prose.slice(Math.max(0, m.index - 50), m.index + 50).replace(/\s+/g, " "),
      );
      expect(hits, `${file}: use can't or can not`).toEqual([]);
    }
  });

  it("uses American spellings", () => {
    /* Never in the code, always in the prose about the code, which is why a
       linter has never once caught one of these. */
    /* Stems with open affixes on both sides, not a list of exact words. The
       first version listed `favour` but not `favoured`, `organise` but not
       `organising`, and missed `grey`, `optimise`, `catalogue` and
       `customise` outright - so it would have passed the words most likely to
       turn up in writing about a design system. */
    const BRITISH = new RegExp(
      String.raw`\b\w*(?:` +
        [
          "colour",
          "behaviour",
          "favour",
          "honour",
          "labour",
          "rumour",
          /* not `organism`, which is a real word in a repo that talks about
             atoms and molecules. */
          "organis(?!m)",
          "realis",
          "analys",
          "optimis",
          "customis",
          "normalis",
          "serialis",
          "initialis",
          "minimis",
          "maximis",
          "summaris",
          "emphasis[ei]d",
          "standardis",
          "prioritis",
          "recognis",
          "apologis",
          "centre",
          "centred",
          "defence",
          "licence",
          "offence",
          "pretence",
          "catalogue",
          "dialogue",
          "programme",
          "manoeuvre",
          "aluminium",
          "judgement",
          "sceptic",
          "whilst",
          "amongst",
          "labelled",
          "labelling",
          "modelled",
          "modelling",
          "cancelled",
          "cancelling",
          "travelled",
          "travelling",
          "fulfil\\b",
          "grey",
          "learnt",
          "spelt",
          "dreamt",
          "practise",
        ].join("|") +
        String.raw`)\w*\b`,
      "gi",
    );

    for (const [file, prose] of PROSE) {
      const hits = [...prose.matchAll(BRITISH)].map((m) => m[0]);
      expect([...new Set(hits)], `${file}: American spellings only`).toEqual([]);
    }
  });

  it("reads the prose it claims to read, all the way to the end", () => {
    /* The two assertions above are only as good as the extraction, and a guard
       that reads less than it thinks reports success exactly as loudly as one
       that passes honestly.

       The first version of this check anchored on a sentence from the middle of
       each file, which is the mistake worth naming: a stripper that swallowed
       everything after the anchor left both anchors intact and both real checks
       passing on an empty tail. So the anchors are the LAST section of each
       file, and the extracted length is pinned to within a wide but finite band
       of the raw file. Anything that quietly eats a third of the prose fails
       here first. */
    for (const [file, prose] of PROSE) {
      const raw = readFileSync(
        join(process.cwd(), "src", "content", file),
        "utf8",
      );
      const ratio = prose.length / raw.length;
      expect(ratio, `${file}: extraction kept ${Math.round(ratio * 100)}%`)
        .toBeGreaterThan(0.55);
    }

    const [[, caseStudies], [, posts]] = PROSE;

    /* Opening of each file, and then the closing paragraph of its last
       section. Both ends have to survive. */
    expect(caseStudies).toContain("Multi-sport pick");
    expect(caseStudies).toContain("That makes the front end a consumer of a");

    expect(posts).toContain("Tailwind v4 generates utilities from theme tokens");
    expect(posts).toContain("was the smaller half of that day");

    /* Both files open with a block comment; neither phrase should survive. */
    expect(caseStudies).not.toContain("Read from source: the bodies are JSX");
    expect(posts).not.toContain("No reading-time estimate");
  });
});
