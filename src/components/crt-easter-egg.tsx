"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { KONAMI_CODE, useKeySequence } from "@blakesteve/roster";

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
 * There are two ways to get the toggle, because the code alone left it
 * unreachable on a phone: no arrow keys, no easter egg, on the device the
 * section is most likely to be read on. Reaching the end of the case study
 * reveals it as well, which turns finishing the page into the discovery. The
 * control pulses once on arrival so the reveal is not spent on a reader whose
 * eyes are on the last paragraph.
 *
 * Only the 1P code is ported. The original also has a 2P variant, where Tab
 * (Select) is tapped after the sequence and before the finalizer, but that one
 * awards a server-side badge, which this page has nothing to award.
 *
 * The key handling now comes from Roster's `useKeySequence`, which started life
 * as this exact handler. Space and Enter both finish the code the way the
 * arcade original took Start, so the sequence is registered twice — once per
 * finalizer — rather than reimplementing the matcher to accept a set.
 *
 * Deliberately scoped to this page rather than the whole site: the egg belongs
 * where its story is.
 */

/** `KONAMI_CODE` ends on Enter; this page also takes Space, as the game does. */
const WITH_ENTER = [...KONAMI_CODE];
const WITH_SPACE = [...KONAMI_CODE.slice(0, -1), " "];

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

/**
 * True once the reader has reached the end of the document, and true from then
 * on.
 *
 * Latched on purpose. This gates a reveal, and a control that appeared at the
 * bottom and disappeared on the way back up would read as a rendering bug
 * rather than a reward. Once it fires, the listeners come off.
 *
 * The first measurement waits for a frame rather than running during the
 * commit: `scrollHeight` read too early can be short enough to look like the
 * bottom of the page, which would hand out the secret on arrival.
 */
function useReachedBottom(threshold = 96) {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    if (reached) return;

    let frame = 0;

    const check = () => {
      frame = 0;
      const seen = window.scrollY + window.innerHeight;
      if (seen >= document.documentElement.scrollHeight - threshold) {
        setReached(true);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    /* A page too short to scroll has already shown the reader its end. */
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reached, threshold]);

  return reached;
}

/**
 * A one-shot flag for the frame the control becomes visible, so the CSS pulse
 * runs once and is then removed from the class list.
 *
 * Kept off the first commit deliberately. A returning visitor's stored value
 * arrives after hydration, which flips visibility from false to true a beat
 * into the page; without the ref that transition would pulse a toggle they had
 * already found, on every single visit.
 */
function useRevealGlow(visible: boolean, ms = 1500) {
  const [glow, setGlow] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    if (!visible || seen.current) return;
    seen.current = true;
    setGlow(true);
    const timer = window.setTimeout(() => setGlow(false), ms);
    return () => window.clearTimeout(timer);
  }, [visible, ms]);

  return glow;
}

export function CrtEasterEgg() {
  const [justUnlocked, setJustUnlocked] = useState(false);
  const stored = useSyncExternalStore(subscribe, readStored, readServer);
  const reachedBottom = useReachedBottom();

  const unlocked = stored !== null;
  const on = stored === "on";

  /* Two ways in. Entering the code is the one the page describes, and it is
     also the one a phone cannot perform — there is no arrow key to press —
     which left the toggle unreachable on the device where it matters most.
     Reading to the end of the case study is the other, and it earns the same
     reward: getting to the bottom is how you find out there was something
     here. Anyone who already unlocked it keeps the toggle from the top. */
  const visible = unlocked || reachedBottom;
  const glow = useRevealGlow(visible);

  const activate = useCallback(() => {
    writeStored("on");
    setJustUnlocked(true);
    window.setTimeout(() => setJustUnlocked(false), 6000);
  }, []);

  // preventDefault so the arrows do not scroll the page out from under the
  // sequence, and no timeout because this one is meant to be discovered.
  useKeySequence(WITH_ENTER, activate, { preventDefault: true, timeout: 0 });
  useKeySequence(WITH_SPACE, activate, { preventDefault: true, timeout: 0 });

  function toggle() {
    writeStored(on ? "off" : "on");
  }

  return (
    <>
      {on && <CrtLayers />}

      {visible && (
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={on}
            className={
              "rounded-full border border-rule bg-panel px-3 py-2 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.14em] text-ink-faint shadow-sm transition-colors hover:border-spot hover:text-spot" +
              (glow ? " crt-reveal" : "")
            }
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
