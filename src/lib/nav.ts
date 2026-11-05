/**
 * The site's sections, and what the bar lights for each page.
 *
 * Pure, so the rules can be tested without a browser. The components that draw
 * them are `bar-slot.tsx` and `nav-links.tsx`.
 */

/**
 * The second nav item's label and path, in one place, because the name is
 * provisional. The rename to Specimens changes this and nothing else in the
 * bar. A new label has to fit the row at 375, 360, 340 and 320: nine characters
 * does, with under a pixel spare from 340 to 382, and ten doesn't.
 */
export const SPECIMENS_PAGE = { label: "System", href: "/system" } as const;

export type NavSection = "work" | "specimens" | "about" | "writing";

export const NAV_ITEMS: readonly { section: NavSection; label: string; href: string }[] = [
  { section: "work", label: "Work", href: "/work" },
  { section: "specimens", ...SPECIMENS_PAGE },
  { section: "about", label: "About", href: "/about" },
  { section: "writing", label: "Writing", href: "/writing" },
];

/** Where a page sits. `within` is for a page under a section rather than its own. */
export type NavPlace = { section?: NavSection; within?: NavSection };

/**
 * `aria-current` for one nav item. "page" on the section's own page, "true" on
 * the section a page sits under, and nothing otherwise, so a 404 lights nothing.
 */
export function ariaCurrentFor(item: NavSection, { section, within }: NavPlace) {
  if (item === section) return "page" as const;
  if (item === within) return "true" as const;
  return undefined;
}

/** Where the lit item's tab sits on screen. */
export type TabBox = { left: number; width: number };

/**
 * The keyframes that carry the tab from one nav item to the next, or null when
 * there's nothing to slide: no item was lit, none is lit now, or it's the same
 * item, as on a hop from a section to one of its deep pages.
 */
export function tabSlide(from: TabBox | null, to: TabBox | null) {
  if (!from || !to || (from.left === to.left && from.width === to.width)) return null;
  return [
    { transform: `translateX(${from.left - to.left}px) scaleX(${from.width / to.width})` },
    { transform: "none" },
  ];
}

/**
 * Reaches far below the screen, for the observers on the title and the TL;DR
 * anchor. Whatever's below the fold then counts as intersecting, so going from
 * there straight past it, as a jump does, is a change the observer reports. On
 * a screen short enough to start with it below the fold, it wouldn't be.
 */
export const BELOW_THE_FOLD = "1000000px";

/**
 * Whether the page's title has gone up past the bar.
 *
 * Not intersecting isn't enough: a title below the viewport isn't intersecting
 * either, and must not trigger the running head. So the title also has to be
 * above the bar's bottom edge.
 */
export function isPastTitle(
  entry: { isIntersecting: boolean; top: number },
  barHeight: number,
) {
  return !entry.isIntersecting && entry.top < barHeight;
}

/**
 * The running head's state, tied to the path it was measured on, so it can't
 * survive a client navigation: on any other path this reads as the top.
 */
export function isShowingRunningHead(
  measured: { path: string; past: boolean } | null,
  path: string,
) {
  return measured !== null && measured.path === path && measured.past;
}
