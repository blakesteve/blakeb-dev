import type { ReactNode } from "react";
import { StateToggle } from "@/components/state-toggle";

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
 */
export function TopBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-[6px]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-3 sm:px-8">
        {children}
        <StateToggle />
      </div>
    </div>
  );
}
