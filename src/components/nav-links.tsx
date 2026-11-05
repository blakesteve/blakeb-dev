"use client";

import { useLayoutEffect, useRef } from "react";
import NextLink from "next/link";
import { Link } from "@blakesteve/roster";
import { NAV_ITEMS, ariaCurrentFor, tabSlide, type NavPlace } from "@/lib/nav";

/* Which item was last lit. Outside the component because each page draws its
   own bar, so a hop mounts a new one and nothing inside it survives. The href
   and not a position: a resize or a late font moves the row, and a position
   kept from before it would read as a different item. */
let lastLit: string | null = null;

function boxOf(element: Element | null | undefined) {
  if (!element) return null;
  const { left, width } = element.getBoundingClientRect();
  return { left, width };
}

/**
 * The site's four sections, as Roster links routed through next/link.
 *
 * A client module of its own for the same reason as `breadcrumbs.tsx`: `as` is
 * a function, and a function can't cross the server boundary.
 *
 * The type is this site's, set with utilities, which outrank Roster's layer.
 * The lit item is `--ink` with a tab on the bar's rule, drawn in `globals.css`,
 * rather than spot text: `--spot` on `--paper` is 4.18:1 at 11px, and color
 * alone wouldn't say which item is lit.
 *
 * The gap closes on a narrow screen so the row fits on one line down to 320px,
 * where the text drops a size too. The focus ring is in `globals.css` too,
 * since Roster's turns the outline off in a way a utility can't undo.
 *
 * The tab slides from the last lit item to this one, both measured in this
 * bar. It's still the `::before` the server drew, so with no script it's simply there, and the animation only
 * starts it somewhere else. Before paint, so it's never seen at its destination
 * first. On mount only, since a hop always mounts a new bar and a resize
 * shouldn't slide it. Not cancelled on cleanup: Strict Mode runs this twice, and
 * the second run finds nothing to slide.
 */
export function NavLinks(place: NavPlace) {
  const list = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const lit = list.current?.querySelector("[aria-current]");
    const was = lastLit ? list.current?.querySelector(`a[href="${lastLit}"]`) : null;
    const keyframes = tabSlide(boxOf(was), boxOf(lit));
    lastLit = lit?.getAttribute("href") ?? null;
    if (!lit || !keyframes) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lit.animate(keyframes, {
      duration: 280,
      easing: "cubic-bezier(0.3, 1.2, 0.5, 1)",
      pseudoElement: "::before",
    });
  }, []);

  return (
    <nav aria-label="Primary">
      <ul
        ref={list}
        className="m-0 flex list-none gap-[clamp(6px,calc((100vw_-_322px)/3),20px)] p-0"
      >
        {NAV_ITEMS.map(({ section, label, href }) => (
          <li key={section}>
            <Link
              as={NextLink}
              href={href}
              data-roster="Link"
              underline="none"
              aria-current={ariaCurrentFor(section, place)}
              className={
                "nav-link relative -my-[5px] block py-[5px] font-[family-name:var(--font-util)] " +
                "text-[11px] font-normal leading-[15px] tracking-[0.06em] text-ink transition-colors hover:text-spot " +
                "max-[341px]:text-[10px]"
              }
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
