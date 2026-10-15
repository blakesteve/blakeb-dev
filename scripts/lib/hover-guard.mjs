/**
 * Finds `:hover` rules that apply on a touch screen.
 *
 * A phone has no pointer to rest anywhere, so a browser that sees a tap fires
 * `:hover` on the tapped element and leaves it there until the next tap lands
 * somewhere else. Any hover style outside `@media (hover: hover)` can stick
 * like that. Tailwind 4 already wraps its own `hover:` variant in that query,
 * which covers most of this site, but it does not wrap an arbitrary selector
 * variant (`[&_a:hover]:…`), and nothing wraps CSS written by hand. Those are
 * what this looks for, in the CSS the build actually emitted.
 *
 * Read with a small scanner rather than a CSS parser, because the only parser
 * on disk is a transitive dependency of Tailwind's, and this runs on every
 * build. It tracks comments, strings and nested blocks, which is all a
 * minified stylesheet needs.
 */

/** `:hover` as a pseudo-class, not the escaped `\:hover` in a class name. */
const HOVER = /(?<!\\):hover/;

/** The `(hover: hover)` feature, with or without spaces. */
const HOVER_FEATURE = /\(\s*hover\s*:\s*hover\s*\)/;

/**
 * Whether an at-rule prelude is a real hover guard: `@media` where every
 * query in the list requires `(hover: hover)`. `@media not (hover: hover)` is
 * the opposite (it's Tailwind's `not-hover:`), and `@media (hover: hover),
 * print` still applies wherever the second query does, so neither counts.
 *
 * `any-hover` doesn't count either. It matches a phone with a mouse paired, or
 * a touch laptop, where taps are still the main input and still stick.
 */
function isGuard(prelude) {
  if (!prelude.startsWith("@media")) return false;
  const queries = splitTopLevel(prelude.slice("@media".length), ",");
  return (
    queries.length > 0 &&
    queries.every((q) => HOVER_FEATURE.test(q) && !/^not\b/i.test(q) && !/\bor\b/i.test(q))
  );
}

/**
 * Hover rules that apply everywhere on purpose. Each needs a reason, and each
 * must still match something, or the check fails as stale.
 */
export const HOVER_ALLOW = [
  {
    selector: ".reg-mark:hover .reg-plate",
    reason:
      "The registration mark. How it behaves on phones is its own ticket " +
      "(86e3aqtu6), so it is left exactly as it was.",
  },
  {
    selector: ".group:hover .reg-mark .reg-plate",
    reason: "The registration mark, snapping when the link around it is hovered. Same ticket.",
  },
];

/**
 * Splits a list at its top-level separators, not those inside `:is()` or
 * brackets, and not escaped ones: Tailwind writes `[a,b]` in a class name as
 * `\[a\,b\]`, and `\(` doesn't open anything.
 */
function splitTopLevel(list, separator) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < list.length; i += 1) {
    const ch = list[i];
    if (ch === "\\") {
      current += ch + (list[i + 1] ?? "");
      i += 1;
      continue;
    }
    if (ch === "(" || ch === "[") depth += 1;
    if (ch === ")" || ch === "]") depth -= 1;
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * Every selector that carries `:hover` and has at least one declaration, with
 * whether a hover guard encloses it. "Encloses" counts both ways a stylesheet
 * nests: the rule inside `@media (hover: hover)`, or the media query nested
 * inside the rule, which is how Tailwind 4 writes its variant before it is
 * flattened.
 *
 * Each entry is one selector from a list, so a list that mixes a hover
 * selector with a focus one reports only the hover one.
 */
export function hoverRules(css) {
  const found = new Map();
  /** Open blocks, outermost first: their preludes. */
  const stack = [];
  let prelude = "";
  let quote = null;

  const record = () => {
    const guarded = stack.some(isGuard);
    for (const block of stack) {
      if (block.startsWith("@")) continue;
      for (const selector of splitTopLevel(block, ",")) {
        if (!HOVER.test(selector)) continue;
        const key = `${selector}\u0000${guarded}`;
        if (!found.has(key)) found.set(key, { selector, guarded });
      }
    }
  };

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];

    if (quote) {
      prelude += ch;
      if (ch === "\\") {
        prelude += css[i + 1] ?? "";
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    /* An escape outside a string belongs to an identifier: Tailwind writes
       `content-['']` as `.content-\[\'\'\]`, and reading that quote as the
       start of a string swallows the rest of the stylesheet. */
    if (ch === "\\") {
      prelude += ch + (css[i + 1] ?? "");
      i += 1;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      prelude += ch;
      continue;
    }
    if (ch === "{") {
      stack.push(prelude.replace(/\s+/g, " ").trim());
      prelude = "";
    } else if (ch === "}") {
      if (stack.length === 0) {
        throw new Error(`hover-guard found a closing brace with no block open, at character ${i}.`);
      }
      /* A declaration closed by the brace rather than a semicolon. */
      if (prelude.trim()) record();
      stack.pop();
      prelude = "";
    } else if (ch === ";") {
      if (prelude.trim() && stack.length > 0) record();
      prelude = "";
    } else {
      prelude += ch;
    }
  }
  /* A brace inside an unquoted `url(data:…)` is legal CSS and would throw the
     block tracking off without a sound. Every guard state after it would be
     wrong, so losing track fails loudly instead. */
  if (stack.length !== 0 || quote) {
    throw new Error(
      `hover-guard lost track of the stylesheet: ${stack.length} block(s) left open` +
        (quote ? `, inside a ${quote} string` : "") +
        ". Every result after that point would be unreliable.",
    );
  }
  return [...found.values()];
}

/**
 * The hover rules a touch screen would apply, minus the allow-list, plus any
 * allow-list entry that no longer matches anything.
 */
export function checkHover(css, allow = HOVER_ALLOW) {
  const rules = hoverRules(css);
  const allowed = new Set(allow.map((a) => a.selector));
  const unguarded = rules.filter((r) => !r.guarded && !allowed.has(r.selector)).map((r) => r.selector);
  const present = new Set(rules.filter((r) => !r.guarded).map((r) => r.selector));
  const stale = allow.filter((a) => !present.has(a.selector)).map((a) => a.selector);
  return { unguarded, stale, guarded: rules.filter((r) => r.guarded).length };
}
