/**
 * The decisions behind the CRT toggle's reveal, as pure functions.
 *
 * These live outside the component because both bugs this file exists to
 * prevent were decision bugs rather than rendering bugs, and neither needed a
 * DOM to reproduce — only the wrong predicate. Extracted, they are testable in
 * the node environment the rest of the suite runs in.
 *
 * The history is worth keeping, because both mistakes look reasonable:
 *
 *   1. Visibility was `stored !== null`, meaning "has this ever been
 *      unlocked". But every click writes to storage, turning the effect *off*
 *      included, so a single click pinned the control to every later visit and
 *      the reveal could never happen again.
 *
 *   2. The pulse was keyed on visibility. `useSyncExternalStore` serves the
 *      server snapshot during hydration and the stored value immediately
 *      after, so visibility flips false to true on every single load, and the
 *      control announced itself each time as though newly found.
 */

/** What `localStorage` holds: the effect's state, or nothing if never used. */
export type CrtStored = "on" | "off" | null;

/**
 * Whether the toggle is on screen.
 *
 * Gated on the effect being *on*, not on the key existing. While the scanlines
 * are running the control has to stay put, because it is the only way to stop
 * them. An "off" in storage is a record of the effect being dismissed, which
 * is not a reason to keep showing the control — it goes back to being
 * something you find at the end of the page.
 */
export function crtToggleVisible(
  stored: CrtStored,
  reachedBottom: boolean,
): boolean {
  return stored === "on" || reachedBottom;
}

/**
 * Whether the toggle should pulse to announce itself.
 *
 * Keyed on `reachedBottom`, which is component state that always starts false,
 * so a transition can only mean the reader got to the end during this session.
 * Silent when the control is already on screen, since there is nothing to
 * announce, and silent once `pulsed` has latched.
 */
export function crtTogglePulses(
  stored: CrtStored,
  reachedBottom: boolean,
  pulsed: boolean,
): boolean {
  return reachedBottom && stored !== "on" && !pulsed;
}

/**
 * Whether the viewport has reached the end of the document.
 *
 * A page shorter than the viewport satisfies this at rest, which is correct:
 * it has already shown the reader everything it has.
 */
export function hasReachedBottom(
  scrollY: number,
  innerHeight: number,
  scrollHeight: number,
  threshold = 96,
): boolean {
  return scrollY + innerHeight >= scrollHeight - threshold;
}
