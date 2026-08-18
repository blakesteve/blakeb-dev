import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { STORYBOOK_URL } from "./storybook";
import {
  Accordion,
  Badge,
  Button,
  Card,
  DescriptionList,
  Eyebrow,
  InlineCode,
  LabeledDivider,
  Link as RosterLink,
  Pullquote,
  Stat,
  ThemeToggle,
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

export { STORYBOOK_URL } from "./storybook";

/**
 * Storybook derives a story id from its `title` with `sanitize()`, which
 * lowercases and swaps punctuation for dashes but does NOT split camelCase.
 * `ErrorState` becomes `errorstate`, not `error-state`.
 *
 * This used to insert the dash, which quietly broke every multi-word component
 * link in both the X-ray panel and /system. Storybook is a single-page app and
 * answers 200 to any path, rendering "story not found" client-side, so a bad id
 * looks fine to anything that only checks the status code. Verified against the
 * deployed `index.json` instead.
 */
export function storyHref(name: string, tier: string) {
  if (!STORYBOOK_URL) return null;
  return `${STORYBOOK_URL}/?path=/docs/${tier}-${name.toLowerCase()}--docs`;
}

export function RCard(props: ComponentProps<typeof Card>) {
  return <Card data-roster="Card" {...props} />;
}

/**
 * Roster's Button sets no font-family, so it inherits the host's body font.
 * This site reads in Source Serif, which made every button on the site serif,
 * including the specimens on /system. Controls are chrome here, so they take
 * the utility face. Passing a font class through `className` still wins.
 */
export function RButton({ className = "", ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      data-roster="Button"
      className={`font-[family-name:var(--font-util)] ${className}`}
      {...props}
    />
  );
}

export function RBadge(props: ComponentProps<typeof Badge>) {
  return <Badge data-roster="Badge" {...props} />;
}

export function RLink(props: ComponentProps<typeof RosterLink>) {
  return <RosterLink data-roster="Link" {...props} />;
}

/**
 * The bordered call to action: "Visit gameverdict.app →", "Email →".
 *
 * A Roster `Link` rather than a `Button`, because it navigates. Roster's Button
 * is typed to `HTMLButtonElement` with no `as` or `href`, so it cannot render
 * an anchor at all — a CTA built from it would be a button that fakes a link,
 * which loses middle-click, open-in-new-tab, and the right role. `Link` is
 * polymorphic and already knows about `external`.
 *
 * The press-sheet CTA shape is this site's, not Roster's: 3px radius, mono
 * caps, a 10% wash of whatever ink the context supplies. `tint` defaults to
 * `--spot` and takes `--world` on a case study so the button carries that
 * project's accent.
 */
export function RCta({
  tint = "var(--spot)",
  className = "",
  ...props
}: ComponentProps<typeof RosterLink> & { tint?: string }) {
  return (
    <RosterLink
      data-roster="Link"
      underline="none"
      style={{ "--cta": tint } as React.CSSProperties}
      className={
        "inline-block rounded-[3px] border border-[var(--cta)] bg-[var(--cta)]/10 " +
        "px-4 py-[10px] text-center font-[family-name:var(--font-util)] text-[10px] " +
        "uppercase tracking-[0.14em] !text-[var(--cta)] no-underline " +
        "transition-opacity hover:opacity-80 " +
        className
      }
      {...props}
    />
  );
}

/* RBreadcrumbs lives in components/breadcrumbs.tsx instead: it has to bind
   next/link, and a function prop cannot cross the server/client boundary. */

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

/**
 * The site's old `.u` class, now a component. Roster's `xs` size is the same
 * 0.625rem at 0.16em tracking the class shipped, and `faint` lands on
 * --ink-faint in both states, so this is a straight pass-through.
 */
export function REyebrow<E extends React.ElementType = "span">(
  props: ComponentProps<typeof Eyebrow<E>>,
) {
  return <Eyebrow data-roster="Eyebrow" {...props} />;
}

export function RStat(props: ComponentProps<typeof Stat>) {
  return <Stat data-roster="Stat" {...props} />;
}

export function RInlineCode(props: ComponentProps<typeof InlineCode>) {
  return <InlineCode data-roster="InlineCode" {...props} />;
}

export function RLabeledDivider(props: ComponentProps<typeof LabeledDivider>) {
  return <LabeledDivider data-roster="LabeledDivider" {...props} />;
}

export function RDescriptionList(props: ComponentProps<typeof DescriptionList>) {
  return <DescriptionList data-roster="DescriptionList" {...props} />;
}

export function RPullquote(props: ComponentProps<typeof Pullquote>) {
  return <Pullquote data-roster="Pullquote" {...props} />;
}

export function RThemeToggle(props: ComponentProps<typeof ThemeToggle>) {
  return <ThemeToggle data-roster="ThemeToggle" {...props} />;
}

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
