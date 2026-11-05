"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { RButton, REyebrow, storyHref } from "@/lib/roster-ui";
import { LABEL_HEIGHT, type Placement } from "@/lib/xray-place";
import { isTopLayerOpen, rosterElements, scan, type Scan } from "@/lib/xray-scan";

/** Under this, an open legend covers most of a phone, so it starts folded. */
const FOLDED_BELOW = 640;

/* What X-ray's own drawing does to the page, which mustn't measure itself. */
const OURS = "[data-xray-ui],[data-xray-layer]";

const isOurs = (node: Node) => node instanceof Element && node.matches(OURS);

const isInsideOurs = (node: EventTarget | Node | null) =>
  node instanceof Node &&
  !!(node instanceof Element ? node : node.parentElement)?.closest(OURS);

function isOurMutation(mutation: MutationRecord) {
  if (isInsideOurs(mutation.target)) return true;
  const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
  return nodes.length > 0 && nodes.every(isOurs);
}

function Labels({ placements }: { placements: Placement[] }) {
  return placements.map(({ id, name, x, y, width, side, leader, track }) => (
    <span key={id}>
      {leader ? (
        <i className="xray-leader" style={{ left: leader.x, top: leader.y, height: leader.height }} />
      ) : null}
      <span
        className={track ? "xray-track xray-pinned" : "xray-track"}
        style={{ left: x, top: y, width, height: track ?? LABEL_HEIGHT }}
      >
        <span className={side === "below" ? "xray-tab xray-below" : "xray-tab"}>{name}</span>
      </span>
    </span>
  ));
}

/**
 * X-ray mode. Alt+X outlines every Roster component on the page, names it, and
 * lists what it found — so the claim that this site is built out of the library
 * is inspectable rather than asserted.
 *
 * The names are placed from measured boxes (`lib/xray-place.ts`) in two layers.
 * The page's scroll with the document and slide under the bar, and the bar's
 * sit inside it, so nothing here moves a label on scroll. The layout keeps this
 * mounted across a client hop, so it stays on and measures the new page.
 *
 * `tiers` comes from the installed package at build time, so the panel can link
 * each component to its Storybook story without a hand-kept lookup table.
 */
export function XRay({ tiers }: { tiers: Record<string, string> }) {
  const [on, setOn] = useState(false);
  const [view, setView] = useState<Scan | null>(null);
  const [folded, setFolded] = useState(false);
  const [lit, setLit] = useState<string | null>(null);
  const onRef = useRef(false);
  const pathname = usePathname();

  const setMode = useCallback((next: boolean) => {
    onRef.current = next;
    document.documentElement.classList.toggle("xray", next);
    setFolded(window.innerWidth < FOLDED_BELOW);
    setLit(null);
    /* Here rather than waiting on the effect, so the legend never opens on 0. */
    setView(next ? scan() : null);
    setOn(next);
  }, []);

  useEffect(() => {
    /* Capture, so Esc is judged before a dialog handles it and starts closing.
       e.key is unreliable for the toggle: Option+X emits "≈" on macOS. e.code
       is physical. */
    function onKey(event: KeyboardEvent) {
      if (event.altKey && event.code === "KeyX") {
        event.preventDefault();
        setMode(!onRef.current);
      } else if (event.key === "Escape" && onRef.current && !isTopLayerOpen()) {
        setMode(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.documentElement.classList.remove("xray");
    };
  }, [setMode]);

  /* `pathname` is here for the hop itself: it re-runs this, and so re-measures,
     on the new page. */
  useEffect(() => {
    if (!on) return;

    let frame = 0;
    let stopped = false;
    const measure = () => {
      if (stopped) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setView(scan()));
    };
    const onScroll = (event: Event) => {
      /* The document's own scroll moves nothing a label is placed from. An
         inner scroller, like Tabs on a phone, does. */
      if (event.target !== document && !isInsideOurs(event.target)) measure();
    };
    const onTransitionEnd = (event: Event) => {
      if (!isInsideOurs(event.target)) measure();
    };

    const resizes = new ResizeObserver(measure);
    resizes.observe(document.body);
    const mutations = new MutationObserver((records) => {
      if (!records.every(isOurMutation)) measure();
    });
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "aria-selected", "aria-expanded"],
    });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, true);
    /* A hidden item only stops being visible after its transition's delay,
       which is how the bar's labels follow the running head. */
    window.addEventListener("transitionend", onTransitionEnd, true);
    document.fonts.addEventListener("loadingdone", measure);
    void document.fonts.ready.then(measure);
    measure();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      resizes.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("transitionend", onTransitionEnd, true);
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [on, pathname]);

  useEffect(() => {
    if (!lit) return;
    const elements = rosterElements().filter((element) => element.dataset.roster === lit);
    for (const element of elements) element.setAttribute("data-xray-lit", "");
    return () => {
      for (const element of elements) element.removeAttribute("data-xray-lit");
    };
  }, [lit]);

  const found = view?.found ?? [];
  const total = found.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      {on && view ? (
        <div
          data-xray-layer
          aria-hidden="true"
          className="xray-layer xray-layer-page"
          style={{ "--xray-bar-height": `${view.barHeight}px` } as CSSProperties}
        >
          <Labels placements={view.page} />
        </div>
      ) : null}
      {on && view?.barHost
        ? createPortal(
            <div data-xray-layer aria-hidden="true" className="xray-layer xray-layer-bar">
              <Labels placements={view.bar} />
            </div>,
            view.barHost,
          )
        : null}

      {/* Always available, and the only hint on the page for touch users. */}
      <button
        type="button"
        data-xray-ui
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
          data-xray-ui
          aria-label="Roster components on this page"
          className="fixed bottom-16 right-4 z-[60] max-h-[60vh] w-[232px] overflow-y-auto rounded-[3px] border border-spot bg-panel p-3 shadow-lg"
        >
          <RButton
            variant="ghost"
            size="sm"
            aria-expanded={!folded}
            aria-controls="xray-legend"
            onClick={() => setFolded(!folded)}
            className="xray-fold"
          >
            <span>
              {found.length} components · {total} instances
            </span>
            <span aria-hidden="true">{folded ? "▴" : "▾"}</span>
          </RButton>

          <div id="xray-legend" hidden={folded}>
            <ul className="m-0 flex list-none flex-col gap-[3px] p-0 pt-2">
              {found.map((item) => {
                const href = storyHref(item.name, tiers[item.name] ?? "atoms");
                return (
                  <li
                    key={item.name}
                    className="flex items-baseline justify-between gap-2"
                    onPointerEnter={() => setLit(item.name)}
                    onPointerLeave={() => setLit(null)}
                    onFocus={() => setLit(item.name)}
                    onBlur={() => setLit(null)}
                  >
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

            <REyebrow as="p" className="m-0 block pt-2 !text-[9px] !leading-relaxed">
              {storyHref("Button", "atoms")
                ? "Names link to Storybook"
                : "Storybook link not configured"}
              {" · Esc to close"}
            </REyebrow>
          </div>
        </aside>
      ) : null}
    </>
  );
}
