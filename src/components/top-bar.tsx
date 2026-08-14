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
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-y-3 px-6 py-3 sm:px-8">
        <TopBarMark yieldsToFolio={yieldsToFolio} />
        {children}
        <div className="ml-auto">
          <StateToggle />
        </div>
      </div>
    </div>
  );
}
