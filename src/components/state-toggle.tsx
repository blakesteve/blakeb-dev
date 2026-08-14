"use client";

import { useSyncExternalStore } from "react";
import { RButton } from "@/lib/roster-ui";

/**
 * The production state lives on <html> as a class, because the blocking script
 * in the root layout has to set it before React exists. That makes the DOM the
 * source of truth, and useSyncExternalStore the honest way to read it — every
 * toggle on the page stays in sync, whoever flipped it.
 */

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/* The server cannot know the visitor's preference. The blocking script
   corrects the class before first paint; this only affects the label. */
function getServerSnapshot() {
  return false;
}

export function StateToggle() {
  const isBlueline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !isBlueline;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("state", next ? "blueline" : "press");
    } catch {
      /* Safari private mode throws on write; the toggle still works this session. */
    }
  }

  return (
    <RButton
      variant="ghost"
      colorScheme="neutral"
      size="xs"
      onClick={toggle}
      aria-label={`Switch to the ${isBlueline ? "press sheet" : "blueline proof"}`}
      /* Roster's ghost/neutral hover is `bg-gray-100`, and this site maps
         --roster-gray-100 to #e7e8e3 — the same value as --paper. On the press
         sheet that paints the page background onto the page background, so the
         hover is invisible; the blueline only worked by luck, since gray-800
         happens to contrast there. --hair is one step off paper in BOTH states
         (darker on the sheet, lighter on the proof), so it reads either way. */
      className="!font-[family-name:var(--font-util)] !text-[10px] !uppercase !tracking-[0.14em] hover:!bg-hair"
      startIcon={
        <span aria-hidden="true" className="text-spot">
          ◐
        </span>
      }
    >
      <span className="min-w-[68px] text-left">{isBlueline ? "Blueline" : "Press sheet"}</span>
    </RButton>
  );
}
