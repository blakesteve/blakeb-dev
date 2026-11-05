"use client";

import { useEffect, useRef, useState } from "react";
import { TldrToggle } from "@/components/tldr-toggle";
import { BELOW_THE_FOLD, isPastTitle } from "@/lib/nav";

/**
 * The TL;DR control in the sticky bar, which yields to the one beside the title.
 *
 * Same arrangement as `TopBarMark` and for the same reason: the page already
 * prints this control next to the heading, and a second one in the bar a
 * centimeter below is just the same button twice. This one stays out of the way
 * until the page's copy has scrolled off, then takes over so the lens is still
 * reachable eight sections into a case study.
 *
 * Sticky was the obvious alternative and does not work here. A sticky element
 * unpins the moment its own container scrolls past, so a button beside the `h1`
 * would come loose with the header — keeping it reachable meant either moving
 * it out of the header entirely or handing off, and handing off is the pattern
 * this site already uses.
 *
 * There is no state to share between the two copies. Both read the `tldr` class
 * on `<html>` through `useSyncExternalStore`, so pressing either updates both.
 *
 * Width animates alongside opacity so the bar does not hold an empty gap open
 * while the button is hidden; a `gap` would reserve the space regardless.
 * Hidden is `invisible`, not `aria-hidden` and opacity, because an invisible
 * button leaves the tab order and a transparent one doesn't. `transition-all`
 * holds that back until the fade has finished.
 */
export function TopBarTldr() {
  /* Starts hidden: the page's own copy is on screen at the top, which is what
     the server rendered, so there is no flash on arrival. */
  const [shown, setShown] = useState(false);

  const seen = useRef(false);

  useEffect(() => {
    const anchor = document.querySelector("[data-tldr-anchor]");

    /* Defensive: a page that opts into the bar control but renders no anchor
       should still get a working button rather than silently losing it.
       Deferred so this is not a setState in the effect body. */
    if (!anchor) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        seen.current = true;
        /* Above the screen, not just off it. On a very short screen the page's
           copy starts below the fold, and showing this there put it over the
           nav. */
        setShown(
          isPastTitle({ isIntersecting: entry.isIntersecting, top: entry.boundingClientRect.top }, 0),
        );
      },
      /* A sliver still counts as visible, so the handoff happens as the page's
         copy leaves rather than once it is comfortably gone. */
      { rootMargin: `0px 0px ${BELOW_THE_FOLD} 0px`, threshold: 0.01 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={
        "inline-flex shrink-0 items-center " +
        "transition-all duration-300 ease-out " +
        /* Clipped only while hidden: shown, it would cut the button's focus ring. */
        (shown
          ? "mr-2 w-[86px] opacity-100"
          : "pointer-events-none invisible mr-0 w-0 overflow-hidden opacity-0")
      }
    >
      <TldrToggle />
    </div>
  );
}
