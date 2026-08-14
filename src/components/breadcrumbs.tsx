"use client";

import { Breadcrumbs } from "@blakesteve/roster";
import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Roster's Breadcrumbs, routed through next/link and set in the folio style.
 *
 * This lives in its own client module rather than in `roster-ui.tsx` because
 * `linkComponent` is a function, and functions cannot cross the server/client
 * boundary — a server component passing `NextLink` into a client component
 * fails the prerender with "Functions cannot be passed directly to Client
 * Components". Binding it here, inside the boundary, keeps the pages that use
 * it server-rendered.
 *
 * The typography lives here too. Roster's breadcrumb is a 14px semibold text
 * trail; this site's is a 10px tracked-out mono label, the same eyebrow that
 * carries the folio. That override is long, and it was going to be pasted at
 * every call site, so it is applied once here and the pages just pass items.
 *
 * `currentClassName` defaults to the spot colour and is overridden on a case
 * study, where the last crumb takes that project's own accent instead.
 */

const FOLIO_TYPE =
  "items-center min-w-0 " +
  /* The trail never wraps: it shrinks, and the current crumb ellipses. A post
     title is a whole sentence, and wrapping it doubled the bar's height. */
  "[&_ol]:min-w-0 [&_ol]:flex-nowrap " +
  "[&_li]:min-w-0 [&_li]:shrink-0 [&_li:last-child]:shrink " +
  "[&_[aria-current]]:block [&_[aria-current]]:truncate " +
  "[&_*]:!font-[family-name:var(--font-util)] [&_*]:!text-[0.625rem] " +
  "[&_*]:!uppercase [&_*]:!tracking-[0.16em] [&_*]:!font-normal " +
  "[&_a]:!text-ink-faint [&_a:hover]:!text-spot [&_a]:!no-underline";

export function RBreadcrumbs({
  className = "",
  currentClassName = "!text-spot",
  ...props
}: Omit<ComponentProps<typeof Breadcrumbs>, "linkComponent">) {
  return (
    /* `block min-w-0`, not `inline-block`: an inline-block sizes to its content
       and refuses to shrink, so the trail overflowed the bar and pushed the
       state toggle off the right edge of a phone. */
    <span data-roster="Breadcrumbs" className="block min-w-0">
      <Breadcrumbs
        linkComponent={NextLink}
        separator={<span aria-hidden="true">/</span>}
        currentClassName={currentClassName}
        className={`${FOLIO_TYPE} ${className}`}
        {...props}
      />
    </span>
  );
}
