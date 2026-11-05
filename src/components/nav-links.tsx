"use client";

import NextLink from "next/link";
import { Link } from "@blakesteve/roster";
import { NAV_ITEMS, ariaCurrentFor, type NavPlace } from "@/lib/nav";

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
 */
export function NavLinks(place: NavPlace) {
  return (
    <nav aria-label="Primary">
      <ul className="m-0 flex list-none gap-[clamp(6px,calc((100vw_-_322px)/3),20px)] p-0">
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
