"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RegistrationMark } from "@/components/registration-mark";

/**
 * The mark in the sticky bar, which yields to the one in the folio.
 *
 * The home page prints the mark beside the name at the top of the sheet, so a
 * second one in the bar three centimeters below is just the same logo twice.
 * This one stays out of the way until the folio's copy has scrolled off, then
 * takes over. Pages without a folio pass nothing and it is simply always there.
 *
 * Width animates alongside opacity so the nav does not sit behind a 19px hole
 * while the mark is hidden; the margin goes with it, since a `gap` would hold
 * the space open regardless.
 */
export function TopBarMark({ yieldsToFolio = false }: { yieldsToFolio?: boolean }) {
  /* Starts hidden only when something above it is expected to be showing. That
     matches what the server rendered, so there is no flash either way. */
  const [shown, setShown] = useState(!yieldsToFolio);
  const observed = useRef<Element | null>(null);

  useEffect(() => {
    if (!yieldsToFolio) return;

    const folioMark = document.querySelector("[data-folio-mark]");
    observed.current = folioMark;

    /* Defensive: if the folio is ever removed, the bar should still carry the
       logo rather than silently losing it. Deferred so this is not a setState
       during the effect body. */
    if (!folioMark) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting),
      /* A sliver still counts as visible: the handoff should happen as the
         folio mark leaves, not once it is comfortably gone. */
      { threshold: 0.01 },
    );
    observer.observe(folioMark);
    return () => observer.disconnect();
  }, [yieldsToFolio]);

  return (
    <Link
      href="/"
      aria-label="Blake Ball, home"
      tabIndex={shown ? undefined : -1}
      aria-hidden={shown ? undefined : true}
      className={
        "group -my-1 inline-flex shrink-0 items-center overflow-hidden py-1 " +
        "transition-all duration-300 ease-out " +
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spot " +
        (shown ? "mr-4 w-[19px] opacity-100" : "pointer-events-none mr-0 w-0 opacity-0")
      }
    >
      <RegistrationMark size={19} />
    </Link>
  );
}
