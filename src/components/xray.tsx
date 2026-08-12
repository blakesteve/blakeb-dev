"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { storyHref } from "@/lib/roster-ui";

type Found = { name: string; count: number };

/** Pure read of the DOM — no state, so it can be called from an event handler. */
function scanDom(): Found[] {
  const counts = new Map<string, number>();
  document.querySelectorAll("[data-roster]").forEach((el) => {
    const name = el.getAttribute("data-roster");
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * X-ray mode. Alt+X outlines every Roster component on the page, names it, and
 * lists what it found — so the claim that this site is built out of the library
 * is inspectable rather than asserted.
 *
 * `tiers` comes from the installed package at build time, so the panel can link
 * each component to its Storybook story without a hand-kept lookup table.
 */
export function XRay({ tiers }: { tiers: Record<string, string> }) {
  const [on, setOn] = useState(false);
  const [found, setFound] = useState<Found[]>([]);
  const onRef = useRef(false);

  /* Everything happens here rather than in an effect: the DOM class, the scan,
     and the state all change together at the moment the user asks for it. */
  const setMode = useCallback((next: boolean) => {
    onRef.current = next;
    document.documentElement.classList.toggle("xray", next);
    setFound(next ? scanDom() : []);
    setOn(next);
  }, []);

  useEffect(() => {
    // e.key is unreliable here: Option+X emits "≈" on macOS. e.code is physical.
    function onKey(event: KeyboardEvent) {
      if (event.altKey && event.code === "KeyX") {
        event.preventDefault();
        setMode(!onRef.current);
      } else if (event.key === "Escape" && onRef.current) {
        setMode(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("xray");
    };
  }, [setMode]);

  const total = found.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      {/* Always available, and the only hint on the page for touch users. */}
      <button
        type="button"
        onClick={() => setMode(!on)}
        aria-pressed={on}
        className="fixed bottom-4 right-4 z-[60] rounded-full border border-rule bg-panel px-3 py-2 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.14em] text-ink-faint shadow-sm transition-colors hover:border-spot hover:text-spot"
      >
        <span aria-hidden="true" className="text-spot">
          ⌥X
        </span>{" "}
        X-ray
      </button>

      {on ? (
        <aside
          aria-label="Roster components on this page"
          className="fixed bottom-16 right-4 z-[60] max-h-[60vh] w-[232px] overflow-y-auto rounded-[3px] border border-spot bg-panel p-3 shadow-lg"
        >
          <p className="u m-0 pb-2 !text-spot">
            {found.length} components · {total} instances
          </p>

          <ul className="m-0 flex list-none flex-col gap-[3px] p-0">
            {found.map((item) => {
              const href = storyHref(item.name, tiers[item.name] ?? "atoms");
              return (
                <li key={item.name} className="flex items-baseline justify-between gap-2">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-[family-name:var(--font-util)] text-[11px] text-ink no-underline hover:text-spot"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <span className="font-[family-name:var(--font-util)] text-[11px] text-ink">
                      {item.name}
                    </span>
                  )}
                  <span className="font-[family-name:var(--font-util)] text-[10px] tabular-nums text-ink-faint">
                    ×{item.count}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="u m-0 pt-2 !text-[9px] leading-relaxed">
            {storyHref("Button", "atoms")
              ? "Names link to Storybook"
              : "Storybook not deployed yet"}
            {" · Esc to close"}
          </p>
        </aside>
      ) : null}
    </>
  );
}
