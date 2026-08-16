import type { CSSProperties, ReactNode } from "react";
import { REyebrow } from "@/lib/roster-ui";
import { getRosterShippedTokens } from "@/lib/roster";

/**
 * The same component, twice, under two palettes, live on the page.
 *
 * This is the claim the whole library rests on, and it is the one thing a
 * screenshot cannot prove: that a Roster component is not theme-locked, and
 * that repainting it takes an override rather than a fork. Both columns render
 * the identical element from the identical package. Only the custom properties
 * differ.
 *
 * The left column carries Roster's shipped tokens, read from the installed
 * `dist/tokens.css` and applied as INLINE STYLES. That matters: an inline style
 * is scoped to its own subtree and cannot escape, so there is no path by which
 * this repaints the rest of the site. Importing `tokens.css` a second time
 * would have put a competing `:root` block in the cascade and broken the page's
 * own palette. The shipped file is a single flat `:root` with no dark variants,
 * which is what makes the inline approach complete rather than partial.
 *
 * The right column inherits from the page, so it changes when the reader flips
 * the production state. The left one does not move, because it is pinned to
 * what npm actually ships.
 */
export function BothPalettes({
  children,
  note,
}: {
  children: ReactNode;
  note?: string;
}) {
  const shipped = getRosterShippedTokens() as CSSProperties;

  return (
    <figure className="my-5 flex w-full flex-col gap-[7px]">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
          <REyebrow>As Roster ships it</REyebrow>
          {/* Pinned to the package's own values. Does not follow the toggle. */}
          <div style={shipped} className="flex flex-wrap items-center gap-2">
            {children}
          </div>
        </div>

        <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
          <REyebrow tone="primary">As this page remaps it</REyebrow>
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
      </div>

      <figcaption className="font-[family-name:var(--font-util)] text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {note ??
          "Same component, same package, same page. Only the colour tokens differ."}
      </figcaption>
    </figure>
  );
}
