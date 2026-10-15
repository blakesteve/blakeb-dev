import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { HOVER_ALLOW, checkHover, hoverRules } from "../../scripts/lib/hover-guard.mjs";

/**
 * A phone fires `:hover` on whatever was tapped and leaves it on until the
 * next tap lands elsewhere, so a hover style outside `@media (hover: hover)`
 * can stay lit after the finger lifts. The build's own check
 * (`scripts/check-bundle-shape.mjs`) reads the emitted CSS for that. These
 * pin the scanner it uses, each case beside the twin that must fail, and check
 * the two places a new unguarded rule can come from in source, so a mistake
 * shows up in `npm test` before anything is built.
 */

const NO_ALLOW: { selector: string; reason: string }[] = [];

describe("the hover scanner", () => {
  it("passes a rule inside the hover guard, and fails the same rule outside it", () => {
    expect(checkHover("@media (hover:hover){.a:hover{color:red}}", NO_ALLOW).unguarded).toEqual([]);
    expect(checkHover(".a:hover{color:red}", NO_ALLOW).unguarded).toEqual([".a:hover"]);
  });

  it("counts a guard nested inside the rule, the way Tailwind writes its variant", () => {
    expect(checkHover(".a{&:hover{@media (hover: hover){color:red}}}", NO_ALLOW).unguarded).toEqual([]);
    expect(checkHover(".a{&:hover{color:red}}", NO_ALLOW).unguarded).toEqual(["&:hover"]);
  });

  it("doesn't count a different media query as the guard", () => {
    expect(checkHover("@media (min-width:40rem){.a:hover{color:red}}", NO_ALLOW).unguarded).toEqual([".a:hover"]);
    expect(checkHover("@media (min-width:40rem) and (hover:hover){.a:hover{color:red}}", NO_ALLOW).unguarded).toEqual([]);
  });

  it("doesn't count a negated or widened guard", () => {
    /* `not (hover: hover)` is Tailwind's not-hover:, the touch-only case. A
       list applies wherever any query does, so `, print` widens it. */
    for (const media of ["not (hover:hover)", "not all and (hover:hover)", "(hover:hover),print", "(hover:hover) or (pointer:coarse)"]) {
      expect(checkHover(`@media ${media}{.a:hover{color:red}}`, NO_ALLOW).unguarded).toEqual([".a:hover"]);
    }
  });

  it("doesn't count any-hover, which a phone with a paired mouse matches", () => {
    expect(checkHover("@media (any-hover:hover){.a:hover{color:red}}", NO_ALLOW).unguarded).toEqual([".a:hover"]);
  });

  it("reports only the hover selector from a list that mixes in focus", () => {
    expect(checkHover(".a:hover,.a:focus-visible{color:red}", NO_ALLOW).unguarded).toEqual([".a:hover"]);
    expect(checkHover(".a:focus-visible,.a:active{color:red}", NO_ALLOW).unguarded).toEqual([]);
  });

  it("finds hover inside :has() and :is()", () => {
    expect(checkHover(".s:has(a:hover) .p{color:red}", NO_ALLOW).unguarded).toEqual([".s:has(a:hover) .p"]);
    expect(checkHover(":is(:where(.g):hover *){color:red}", NO_ALLOW).unguarded).toHaveLength(1);
  });

  it("ignores an escaped :hover in a class name", () => {
    expect(hoverRules(String.raw`.any-\[\@media\(any-hover\:hover\)\]\:flex{display:flex}`)).toEqual([]);
  });

  it("doesn't split a selector list at an escaped comma or open on an escaped paren", () => {
    const css = String.raw`.a\(:hover,.b:hover{color:red}.c-\[x\,y\]:hover{color:red}`;
    expect(checkHover(css, NO_ALLOW).unguarded).toEqual([String.raw`.a\(:hover`, ".b:hover", String.raw`.c-\[x\,y\]:hover`]);
  });

  it("fails loudly rather than misreading a stylesheet it lost track of", () => {
    expect(() => hoverRules(".a:hover{color:red")).toThrow(/lost track/);
    expect(() => hoverRules(".a{color:red}}")).toThrow(/closing brace/);
    expect(() => hoverRules('.a{content:"x}')).toThrow(/lost track/);
  });

  it("isn't thrown by an escaped quote in a class name", () => {
    /* Tailwind writes `content-['']` as `.content-\[\'\'\]`. Reading that
       quote as a string's start swallowed the rest of the real stylesheet and
       left 1 of 179 hover selectors found, so the case is pinned with a hover
       rule after it that must still be seen. */
    const css = String.raw`.c-\[\'\'\]:before{content:""}.a:hover{color:red}`;
    expect(checkHover(css, NO_ALLOW).unguarded).toEqual([".a:hover"]);
  });

  it("ignores hover named in a comment or a string", () => {
    expect(hoverRules(`/* .a:hover{color:red} */ .b{content:".a:hover{"}`)).toEqual([]);
  });

  it("lets an allow-listed rule through, and calls an unused entry stale", () => {
    const allow = [{ selector: ".a:hover", reason: "on purpose" }];
    expect(checkHover(".a:hover{color:red}", allow)).toMatchObject({ unguarded: [], stale: [] });
    expect(checkHover(".b{color:red}", allow).stale).toEqual([".a:hover"]);
  });
});

describe("this site's source", () => {
  it("guards every :hover in globals.css, apart from the allow-list", () => {
    const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    expect(checkHover(css)).toMatchObject({ unguarded: [], stale: [] });
  });

  it("would fail if a guard came off", () => {
    /* The twin: the same stylesheet with the 404's guard unwrapped. */
    const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    const unwrapped = css.replace(
      /@media \(hover: hover\) \{\s*(\.group\\\/sheet:has\(a:hover\) \.misplate \{[^}]*\})\s*\}/,
      "$1",
    );
    expect(unwrapped).not.toBe(css);
    expect(checkHover(unwrapped).unguarded).toEqual([".group\\/sheet:has(a:hover) .misplate"]);
  });

  it("gives every allow-list entry a reason", () => {
    for (const entry of HOVER_ALLOW) expect(entry.reason.length).toBeGreaterThan(20);
  });

  /* Tailwind wraps its `hover:` variant, and named ones like `group-hover:`,
     `peer-hover:` and `has-hover:`, in the guard. A variant whose bracket
     holds `:hover` (`[&_a:hover]:`, `has-[a:hover]:`, `group-[:hover]/sheet:`)
     is copied through as written and isn't. Write `[&_a]:hover:` instead.
     One level of nested brackets, for `[&_[aria-current]:hover]:`; and the
     `hover` before `:hover` in a media query (`(hover:hover)`,
     `any-hover:hover`) isn't a pseudo-class. */
  const INNER = String.raw`(?:[^\[\]\s"'\x60]|\[[^\[\]\s"'\x60]*\])*`;
  const ARBITRARY_HOVER = new RegExp(
    String.raw`\[` + INNER + String.raw`(?<!hover):hover` + INNER + String.raw`\](?:\/[\w-]+)?:`,
    "g",
  );

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return sourceFiles(path);
      return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
    });
  }

  it("uses no arbitrary variant with :hover inside it", () => {
    const hits = sourceFiles(join(process.cwd(), "src")).flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(ARBITRARY_HOVER)].map((m) => `${file}: ${m[0]}`),
    );
    expect(hits).toEqual([]);
  });

  it("would catch one", () => {
    /* No utility after the variant, so Tailwind, which scans every file
       including this one, can't read any of these as a class and emit the
       very rule the build check rejects. That happened: the first version of
       this test wrote a whole class and failed the build. */
    for (const variant of ["[&_a:hover]:", "has-[a:hover]:", "group-[:hover]/sheet:", "group-has-[a:hover]/sheet:", "[&_[aria-current]:hover]:"]) {
      expect(` ${variant} `.match(ARBITRARY_HOVER), variant).toEqual([variant.replace(/^[\w-]+(?=\[)/, "")]);
    }
    for (const fine of ["[&_a]:hover:", "hover:", "group-hover/sheet:", "[@media(hover:hover)]:", "[@media(any-hover:hover)]:"]) {
      expect(` ${fine} `.match(ARBITRARY_HOVER), fine).toBeNull();
    }
  });
});
