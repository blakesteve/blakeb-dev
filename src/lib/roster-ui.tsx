import type { ComponentProps, ReactNode } from "react";
import {
  Accordion,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Link as RosterLink,
  Tooltip,
} from "@blakesteve/roster";

/**
 * Roster's compiled classes are not uniquely prefixed, so there is no
 * dependable way to detect its components in the DOM. X-ray mode therefore
 * relies on deliberate annotation: every Roster component the site renders
 * goes through this module, which stamps `data-roster="<Name>"` onto it.
 *
 * That keeps the marker honest — if something is outlined, it really is a
 * Roster component — and it keeps the annotation next to the usage rather
 * than in a lookup table that will drift.
 */

export const STORYBOOK_URL = process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "";

/** Storybook's story ids are kebab-cased: `atoms-button--docs`. */
export function storyHref(name: string, tier: string) {
  if (!STORYBOOK_URL) return null;
  const slug = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  return `${STORYBOOK_URL}/?path=/docs/${tier}-${slug}--docs`;
}

export function RCard(props: ComponentProps<typeof Card>) {
  return <Card data-roster="Card" {...props} />;
}

export function RButton(props: ComponentProps<typeof Button>) {
  return <Button data-roster="Button" {...props} />;
}

export function RBadge(props: ComponentProps<typeof Badge>) {
  return <Badge data-roster="Badge" {...props} />;
}

export function RLink(props: ComponentProps<typeof RosterLink>) {
  return <RosterLink data-roster="Link" {...props} />;
}

export function RBreadcrumbs(props: ComponentProps<typeof Breadcrumbs>) {
  return (
    <span data-roster="Breadcrumbs" className="inline-block">
      <Breadcrumbs {...props} />
    </span>
  );
}

export function RAccordion(props: ComponentProps<typeof Accordion>) {
  return (
    <div data-roster="Accordion">
      <Accordion {...props} />
    </div>
  );
}

/* DataTable is generic over two type params, which a pass-through wrapper
   cannot express cleanly — wrap it with <Marked name="DataTable"> at the
   usage site instead. */

export function RTooltip({ children, ...props }: ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip {...props}>
      <span data-roster="Tooltip">{children}</span>
    </Tooltip>
  );
}

/** Wraps arbitrary children so a component without a pass-through prop still gets marked. */
export function Marked({ name, children }: { name: string; children: ReactNode }) {
  return <div data-roster={name}>{children}</div>;
}
