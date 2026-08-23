"use client";

import { useCallback, useSyncExternalStore } from "react";
import { RButton } from "@/lib/roster-ui";

/**
 * The third lens.
 *
 * The site already reads two ways — press sheet or blueline, and X-ray over the
 * top — and this adds a plain-language one. Every section carries a `dek`, one
 * sentence saying what it actually means, and this reveals them.
 *
 * It is a class on `<html>` rather than React state on purpose, the same as
 * `.dark` and `.xray`. The deks live inside statically rendered content
 * modules, so prop-drilling a flag through them would push the whole case study
 * across the client boundary for one sentence per heading. CSS does it for
 * free, and the deks stay in the markup either way, which means they are in the
 * page for a reader who never finds the button — and for a crawler.
 *
 * Built on Roster's Button at `size="xs"`, the same as the state toggle it sits
 * under, so the two match by construction rather than by a copied set of pixel
 * values that drifts the first time either is touched.
 *
 * Deliberately not a second copy of the prose. A parallel plain-English version
 * of the site would be fourteen thousand words that must be edited twice
 * forever, and this codebase has already shipped the same fact written two
 * different ways more than once.
 */

const STORAGE_KEY = "tldr";
const CLASS = "tldr";

/**
 * The class on `<html>` is the source of truth, so it is read through
 * `useSyncExternalStore` rather than mirrored into state on mount.
 *
 * The blocking script sets that class before paint, so a component that starts
 * `false` and catches up in an effect would be storing a second copy of a fact
 * the DOM already has — and doing it with a setState in an effect, which is
 * both a cascading render and a lint error. There is no `storage` event to
 * listen for either: this class only ever changes from the button below, so the
 * button announces its own writes.
 */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function readClass() {
  return document.documentElement.classList.contains(CLASS);
}

/* The server cannot know, and the blocking script has not run yet either. */
function readServer() {
  return false;
}

/**
 * `anchor` marks the in-page copy — the one beside the title. The bar watches
 * it and reveals its own copy once it scrolls away, exactly as the registration
 * mark yields to the folio's. Two buttons, no shared state to wire: both read
 * the class on `<html>`, so toggling either updates both.
 */
export function TldrToggle({ anchor = false }: { anchor?: boolean } = {}) {
  const on = useSyncExternalStore(subscribe, readClass, readServer);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains(CLASS);
    document.documentElement.classList.toggle(CLASS, next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* Safari private mode; the lens still works for this session. */
    }
    listeners.forEach((notify) => notify());
  }, []);

  return (
    <RButton
      type="button"
      {...(anchor ? { "data-tldr-anchor": "" } : {})}
      variant="outline"
      colorScheme="neutral"
      size="xs"
      onClick={toggle}
      aria-pressed={on}
      /* The control names what it does, not who is reading. "Plain English"
         asks someone to accept a simpler version; TL;DR just offers a faster
         one, and needs no explaining to anyone who has used the internet. */
      aria-label={
        on
          ? "Hide the plain-language summaries"
          : "Show a plain-language summary of each section"
      }
      /* Active, it takes the project's own accent for text, border and a 10%
         wash, the way every other figure on a case study page already does.
         `--world` is unset on /writing, so the fallback holds it to the site
         spot there.

         The wash is not decoration. Text and border already carry the exact
         accent the deks and the stat row use, but at 10px against a dark ground
         a hairline and a line of small caps lose apparent chroma next to a 36px
         bold number in the identical color, and the button read as a duller
         green than the panel it reveals. The dek gets its green from sitting on
         `bg-current/10`; this gives the button the same ground, which is also
         what `RCta` does. */
      className={
        /* The mono face comes from `RButton` now; only the folio sizing is local. */
        "!text-[10px] !uppercase !tracking-[0.14em] " +
        (on
          ? "!border-[var(--world,var(--spot))] !text-[var(--world,var(--spot))] " +
            "!bg-[var(--world,var(--spot))]/10"
          : "!text-ink-faint")
      }
    >
      <span aria-hidden="true" className="mr-[6px]">
        ¶
      </span>
      TL;DR
    </RButton>
  );
}
