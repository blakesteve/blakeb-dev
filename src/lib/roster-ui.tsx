import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { STORYBOOK_URL } from "./storybook";
import {
  Accordion,
  Alert,
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
 * Roster's classes carry an `rst:` prefix, which says a class came from Roster
 * but not which component it belongs to. So X-ray mode relies on deliberate
 * annotation: every Roster component the site renders goes through this
 * module, which stamps `data-roster="<Name>"` onto it.
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

/**
 * Roster's Card in the press sheet's shape. `press-card` (globals.css) scopes
 * the 3px corner to the card itself; the colors come from `--roster-card-bg`
 * and `--roster-card-border` on `:root`. A hand-rolled panel moved onto RCard
 * also takes `press-panel`, which keeps it drawn exactly as it was.
 */
export function RCard({ className, ...props }: ComponentProps<typeof Card>) {
  return <Card data-roster="Card" className={className ? `press-card ${className}` : "press-card"} {...props} />;
}

/**
 * Every control on this site is mono caps — the breadcrumb trail, the state
 * toggle, the X-ray and CRT toggles, the CTAs. That is the press-sheet
 * vocabulary, so a Button in the site's own sans would be the odd one out, and
 * the specimens on /system would be advertising a button this site never
 * actually renders.
 *
 * This is a design decision, not the workaround it replaces. That one existed
 * because Roster set no font at all and inherited this site's Source Serif, so
 * forcing mono here fixed buttons while leaving badges and inputs serif. Roster
 * 4.5.0 ships `--roster-font-ui`, which this site maps to Archivo, so the
 * library now has a working sans default and this override is a deliberate step
 * away from it for one component.
 *
 * It reads `--control-face` rather than `--font-util` directly so a subtree can
 * opt back out. `BothPalettes` does exactly that: its "as Roster ships it"
 * column has to show the untouched library, and a site-wide font override would
 * have quietly made that column a lie.
 */
export function RButton({ className = "", ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      data-roster="Button"
      className={`font-[family-name:var(--control-face,var(--font-util))] ${className}`}
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
 *
 * `wraps` is for a block-level eyebrow that can run to a second line. From
 * Roster 5.8.0 Eyebrow sets `leading-none`, which trims a one-line label to
 * its cap height but stacks a wrapped block with no gap between its lines.
 * `wraps` puts the 1.5 line height back for those, and only those, so one-line
 * labels keep the tighter box. An inline eyebrow, like a screenshot caption or
 * a "Next:" link, takes its line spacing from its parent and doesn't need it.
 * Measured 13 Oct 2026: three block-level eyebrows wrap, the home page's
 * version line at 390 wide and two post dates on /writing at 1280.
 */
export function REyebrow<E extends React.ElementType = "span">(
  props: ComponentProps<typeof Eyebrow<E>> & { wraps?: boolean },
) {
  const { wraps = false, ...rest } = props;
  const eyebrowProps = rest as ComponentProps<typeof Eyebrow<E>>;
  const className =
    [wraps ? "leading-normal" : null, eyebrowProps.className].filter(Boolean).join(" ") || undefined;
  return <Eyebrow data-roster="Eyebrow" {...eyebrowProps} className={className} />;
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

export function RAlert(props: ComponentProps<typeof Alert>) {
  return <Alert data-roster="Alert" {...props} />;
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
