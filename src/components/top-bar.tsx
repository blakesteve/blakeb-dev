import type { ReactNode } from "react";
import { StateToggle } from "@/components/state-toggle";
import { TopBarMark } from "@/components/top-bar-mark";

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
 * The mark leads, and it is a link home. That gives the logo a spot on every
 * page and, more usefully, gives the snap a hover target people will actually
 * find — nobody hovers a decorative glyph on purpose, but everybody hovers the
 * thing in the top-left corner that looks like it goes home.
 */
export function TopBar({
  children,
  yieldsToFolio = false,
}: {
  children: ReactNode;
  /** Set on any page that already prints the mark above this bar. */
  yieldsToFolio?: boolean;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-[6px]">
      {/* Deliberately no wrapping. With `flex-wrap` a long breadcrumb pushed
          the toggle onto its own row and the bar doubled in height on a phone.
          The trail shrinks and truncates instead; the mark and the toggle are
          fixed. */}
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-x-3 px-6 py-3 sm:gap-x-4 sm:px-8">
        <TopBarMark yieldsToFolio={yieldsToFolio} />
        <div className="min-w-0 flex-1">{children}</div>
        <div className="shrink-0">
          <StateToggle />
        </div>
      </div>
    </div>
  );
}
