"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * A port of Game Verdict's CRT easter egg onto its own case study page.
 *
 * The page describes an easter egg that rewards you with something you get to
 * keep. Describing that is weaker than doing it, so the code works here too:
 * enter it and this page turns into a CRT, and the toggle stays for as long as
 * you keep it on.
 *
 * ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft
 * ArrowRight b a, then Enter or Space.
 *
 * Only the 1P code is ported. The original also has a 2P variant, where Tab
 * (Select) is tapped after the sequence and before the finalizer, but that one
 * awards a server-side badge, which this page has nothing to award.
 *
 * The sequence, the overlay layers, and the persistence all mirror the
 * original. Deliberately scoped to this page rather than the whole site: the
 * egg belongs where its story is.
 */

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** "Start" on a NES pad. */
const FINALIZERS = new Set(["Enter", " "]);
const STORAGE_KEY = "gv-crt";

/** The three layers from Game Verdict's CrtOverlay, same values. */
function CrtLayers() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9997]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9996]"
        style={{
          boxShadow:
            "inset 1px 0 0 rgba(255,0,0,0.06), inset -1px 0 0 rgba(0,0,255,0.06)",
        }}
      />
    </>
  );
}

/**
 * localStorage is the source of truth, so it is read through
 * useSyncExternalStore rather than mirrored into state on mount. Absence of the
 * key means never unlocked; "on"/"off" is the toggle. The listener set exists
 * because the `storage` event only fires in *other* tabs, so same-tab writes
 * have to announce themselves.
 */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // Safari private mode; the egg just will not persist.
  }
}

function writeStored(value: "on" | "off") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* Non-fatal: the toggle still works for this session. */
  }
  listeners.forEach((notify) => notify());
}

/* The server cannot know, and neither can the hydration pass. */
function readServer(): string | null {
  return null;
}

export function CrtEasterEgg() {
  const [justUnlocked, setJustUnlocked] = useState(false);
  const stored = useSyncExternalStore(subscribe, readStored, readServer);

  const unlocked = stored !== null;
  const on = stored === "on";

  const progress = useRef(0);

  const activate = useCallback(() => {
    writeStored("on");
    setJustUnlocked(true);
    window.setTimeout(() => setJustUnlocked(false), 6000);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { key } = event;

      if (progress.current === SEQUENCE.length) {
        if (FINALIZERS.has(key)) {
          progress.current = 0;
          activate();
        } else {
          progress.current = 0;
        }
        return;
      }

      if (key === SEQUENCE[progress.current]) {
        progress.current += 1;
      } else {
        // A wrong key still counts as a fresh start if it opens the sequence.
        progress.current = key === SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activate]);

  function toggle() {
    writeStored(on ? "off" : "on");
  }

  return (
    <>
      {on && <CrtLayers />}

      {unlocked && (
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={on}
            className="rounded-full border border-rule bg-panel px-3 py-2 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.14em] text-ink-faint shadow-sm transition-colors hover:border-spot hover:text-spot"
          >
            <span aria-hidden="true" className="text-spot">
              ▚
            </span>{" "}
            CRT {on ? "on" : "off"}
          </button>

          {justUnlocked && (
            <span
              role="status"
              className="max-w-[16rem] rounded-[3px] border border-spot bg-panel px-3 py-2 font-[family-name:var(--font-util)] text-[10px] leading-relaxed text-ink"
            >
              The debate is settled. CRT mode is yours, same as on the real thing.
            </span>
          )}
        </div>
      )}
    </>
  );
}
