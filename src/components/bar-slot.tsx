"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { NavLinks } from "@/components/nav-links";
import { BELOW_THE_FOLD, isPastTitle, isShowingRunningHead, type NavPlace } from "@/lib/nav";

export type RunningHead = {
  parent: { label: string; href: string };
  current: string;
  /** Set on a case study, whose current item leads with a dot in `--world`. */
  world?: boolean;
};

/**
 * The bar's slot: the nav on every page and, on a deep page, a running head
 * once the page's title has gone up under the bar.
 *
 * Same handoff as `TopBarMark` and `TopBarTldr`, and they all read the page
 * rather than each other. The difference is the failure: a deep page with no
 * title to watch keeps the nav and never shows a running head, because losing
 * a running head costs nothing.
 *
 * Which half is on is a class, and CSS does the rest per breakpoint in
 * `globals.css`: side by side from 768px, swapped under it. The half that's off
 * is `visibility: hidden`, so it leaves the tab order and the accessibility
 * tree with no script deciding which half that is.
 */
export function BarSlot({ runningHead, ...place }: NavPlace & { runningHead?: RunningHead }) {
  const path = usePathname();
  const slot = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<{ path: string; past: boolean } | null>(null);
  const deep = runningHead !== undefined;

  useEffect(() => {
    if (!deep) return;
    const title = document.querySelector("[data-page-title]");
    const bar = slot.current?.closest<HTMLElement>("[data-top-bar]");
    if (!title || !bar) return;

    const barHeight = bar.offsetHeight;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setMeasured({
          path,
          past: isPastTitle(
            { isIntersecting: entry.isIntersecting, top: entry.boundingClientRect.top },
            barHeight,
          ),
        }),
      /* The bar's height off the top, so the swap comes as the title slides
         under the bar's bottom edge, not when it leaves the screen. */
      { rootMargin: `-${barHeight}px 0px ${BELOW_THE_FOLD} 0px`, threshold: 0.01 },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, [deep, path]);

  return (
    <div
      ref={slot}
      className={"bar-slot" + (isShowingRunningHead(measured, path) ? " bar-slot-past" : "")}
    >
      <div className="bar-slot-nav">
        <NavLinks {...place} />
      </div>
      {runningHead && (
        <div className={"bar-slot-head" + (runningHead.world ? " bar-slot-head-world" : "")}>
          <RBreadcrumbs
            items={[runningHead.parent, { label: runningHead.current }]}
            currentClassName="text-ink"
          />
        </div>
      )}
    </div>
  );
}
