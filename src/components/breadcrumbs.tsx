"use client";

import { Breadcrumbs } from "@blakesteve/roster";
import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Roster's Breadcrumbs, routed through next/link.
 *
 * This lives in its own client module rather than in `roster-ui.tsx` because
 * `linkComponent` is a function, and functions cannot cross the server/client
 * boundary — a server component passing `NextLink` into a client component
 * fails the prerender with "Functions cannot be passed directly to Client
 * Components". Binding it here, inside the boundary, keeps the pages that use
 * it server-rendered.
 */
export function RBreadcrumbs(
  props: Omit<ComponentProps<typeof Breadcrumbs>, "linkComponent">,
) {
  return (
    <span data-roster="Breadcrumbs" className="inline-block">
      <Breadcrumbs linkComponent={NextLink} {...props} />
    </span>
  );
}
