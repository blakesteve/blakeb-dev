import { BarSlot, type RunningHead } from "@/components/bar-slot";
import { StateToggle } from "@/components/state-toggle";
import { TopBarMark } from "@/components/top-bar-mark";
import { TopBarTldr } from "@/components/top-bar-tldr";
import type { NavSection } from "@/lib/nav";

/**
 * The bar that carries wayfinding and the state toggle, on every page.
 *
 * Sticky because both halves are things you want mid-page rather than at the
 * top of it: the way back, and the switch between production states. Judging a
 * color decision means flipping states while looking at the thing you are
 * judging, and a toggle that scrolls away makes you hunt for it every time.
 *
 * Translucent over `--paper` with a small blur so content reads as passing
 * underneath rather than colliding with it. `z-40` keeps it under X-ray's
 * panel (`z-60`) and well under the CRT overlay, both of which are supposed to
 * sit on top of everything including this.
 *
 * One row on every page: mark, slot, TL;DR handoff, state toggle. The slot
 * (`bar-slot.tsx`) holds the nav, and on a deep page the running head.
 *
 * The mark leads, and it is a link home. That gives the logo a spot on every
 * page and, more usefully, gives the snap a hover target people will actually
 * find — nobody hovers a decorative glyph on purpose, but everybody hovers the
 * thing in the top-left corner that looks like it goes home.
 */
export function TopBar({
  section,
  within,
  runningHead,
  yieldsToFolio = false,
  tldr = false,
}: {
  /** The nav item this page is. Unset lights nothing, as on the 404. */
  section?: NavSection;
  /** The nav item this page sits under: a deep page, or `/resume` under About. */
  within?: NavSection;
  /** On a deep page, what the bar shows once the title has gone. */
  runningHead?: RunningHead;
  /** Set on any page that already prints the mark above this bar. */
  yieldsToFolio?: boolean;
  /**
   * Set on the pages that carry section deks — case studies and posts. Every
   * other route has nothing for the lens to reveal, so the control would sit
   * there inert.
   */
  tldr?: boolean;
}) {
  return (
    <div data-top-bar className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-[6px]">
      {/* Deliberately no wrapping. With `flex-wrap` a long title pushed the
          toggle onto its own row and the bar doubled in height on a phone. The
          running head shrinks and truncates instead; the mark and the toggle
          are fixed. */}
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-x-3 px-6 py-3 sm:gap-x-4 sm:px-8">
        <TopBarMark yieldsToFolio={yieldsToFolio} />
        <BarSlot section={section} within={within} runningHead={runningHead} />
        <div className="flex shrink-0 items-center">
          {tldr && <TopBarTldr />}
          <StateToggle />
        </div>
      </div>
    </div>
  );
}
