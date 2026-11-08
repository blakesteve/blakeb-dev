"use client";

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { Skeleton, Switch, Tabs } from "@blakesteve/roster";
import type { FrameMeta, Knobs, Tier } from "./frames";
import { greaseNote, greaseWords, type Grease } from "./grease";
import type { FrameSpec } from "./kit";
import type { LoupeProps } from "./loupe";
import "./contact-sheet.css";

/** One frame as the server hands it over: everything but the live specimen. */
export type SheetFrame = {
  n: string;
  t: Tier;
  /** Its place in the full sheet, two digits. Positional, so nothing should cite one. */
  num: string;
  plays: boolean;
  from: string | null;
  knobs: Knobs | null;
  needs: FrameMeta["needs"] | null;
  grease: Grease | null;
  story: string | null;
  /** False for a component Roster ships that has no frame here yet. */
  known: boolean;
  /** Room kept for a tall specimen before it arrives. */
  size: "md" | "lg" | "xl" | null;
};

export type LoadState = "idle" | "loading" | "ready" | "failed";
type TierModule = { specs: Record<string, FrameSpec>; Host?: ComponentType };

/* One chunk per tier, loaded when a frame of that tier nears the screen. Plain
   `import()` in a client component, so none of it is in the server render. */
const LOADERS: Record<Tier, () => Promise<TierModule>> = {
  atoms: () => import("./atoms").then((m) => ({ specs: m.ATOMS })),
  molecules: () => import("./molecules").then((m) => ({ specs: m.MOLECULES, Host: m.ToasterHost })),
  organisms: () => import("./organisms").then((m) => ({ specs: m.ORGANISMS })),
};

const loadLoupe = () => import("./loupe").then((m) => m.Loupe);

const NARROW = "(max-width: 639.98px)";
function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const useNarrow = () =>
  useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);

const TIER_TABS = [
  { id: "all", label: "All" },
  { id: "atoms", label: "Atoms" },
  { id: "molecules", label: "Molecules" },
  { id: "organisms", label: "Organisms" },
] as const;
type Filter = (typeof TIER_TABS)[number]["id"];

/** A specimen that throws takes its own frame down, not the sheet. */
class FrameBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function StoryLink({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="cs-story">
      {children}
    </a>
  );
}

/** What fills a frame's live area, before, during and after its tier loads. */
export function Live({
  frame,
  spec,
  state,
  render = (S) => <S.C />,
  resetKey,
}: {
  frame: SheetFrame;
  spec: FrameSpec | undefined;
  state: LoadState;
  render?: (spec: FrameSpec) => ReactNode;
  /** A change gives a specimen that threw another try: the loupe's knobs. */
  resetKey?: string;
}) {
  const failed = (
    <p className="cs-say">
      This one didn&rsquo;t load. <StoryLink href={frame.story}>See it in Storybook →</StoryLink>
    </p>
  );
  if (!frame.known) {
    return (
      <p className="cs-say">
        Not on this sheet yet. <StoryLink href={frame.story}>See it in Storybook →</StoryLink>
      </p>
    );
  }
  if (state === "failed") return failed;
  if (state === "ready" && spec) return (
      <FrameBoundary key={resetKey} fallback={failed}>
        {render(spec)}
      </FrameBoundary>
    );
  if (state === "loading") return <Skeleton shape="block" height={44} className="cs-wait" />;
  return null;
}

function GreaseMark({ grease }: { grease: Grease }) {
  return (
    <>
      <svg
        className={grease.kind === "new" ? "cs-grease" : "cs-grease cs-grease-x"}
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={
            grease.kind === "new"
              ? "M58 40C110 8 214 6 262 44c34 28 28 92-12 120-46 30-140 34-196 8C8 148 8 72 58 40c26-16 52-22 84-26"
              : "M22 18 278 182M280 20 20 180"
          }
        />
      </svg>
      <span className="cs-grease-note" aria-hidden="true">
        {greaseNote(grease)}
      </span>
    </>
  );
}

type LoupeState = { opener: string; at: string; open: boolean };

export function ContactSheet({ frames }: { frames: SheetFrame[] }) {
  const narrow = useNarrow();
  const [filter, setFilter] = useState<Filter>("all");
  const [playsOnly, setPlaysOnly] = useState(false);

  const [loads, setLoads] = useState<Record<Tier, LoadState>>({
    atoms: "idle",
    molecules: "idle",
    organisms: "idle",
  });
  const [mods, setMods] = useState<Partial<Record<Tier, TierModule>>>({});
  const started = useRef(new Set<Tier>());

  const [Loupe, setLoupe] = useState<ComponentType<LoupeProps> | null>(null);
  const loupeLoad = useRef<Promise<void> | null>(null);
  const [loupe, setLoupeState] = useState<LoupeState | null>(null);
  const [said, setSaid] = useState("");

  const items = useRef(new Map<string, HTMLLIElement>());
  const captions = useRef(new Map<string, HTMLButtonElement>());

  /* One load at a time, shared: a press while the chunk is on its way waits for
     it, and a failed load is forgotten so the next press tries again. */
  const fetchLoupe = useCallback(() => {
    loupeLoad.current ??= loadLoupe().then(
      (L) => setLoupe(() => L),
      (error) => {
        loupeLoad.current = null;
        throw error;
      },
    );
    return loupeLoad.current;
  }, []);

  /* A tier that's loading or loaded isn't asked for again. One that failed is,
     the next time a frame of it nears the screen. */
  const loadTier = useCallback(
    (tier: Tier) => {
      if (started.current.has(tier)) return;
      started.current.add(tier);
      setLoads((all) => ({ ...all, [tier]: "loading" }));
      LOADERS[tier]().then(
        (mod) => {
          setMods((all) => ({ ...all, [tier]: mod }));
          setLoads((all) => ({ ...all, [tier]: "ready" }));
          fetchLoupe().catch(() => {});
        },
        () => {
          started.current.delete(tier);
          setLoads((all) => ({ ...all, [tier]: "failed" }));
        },
      );
    },
    [fetchLoupe],
  );

  const shown = frames.filter((f) => (filter === "all" || f.t === filter) && (!playsOnly || f.plays));

  /* 600px ahead of the screen, so a tier is usually live by the time it's seen. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) loadTier((entry.target as HTMLElement).dataset.tier as Tier);
        }
      },
      { rootMargin: "600px 0px" },
    );
    for (const el of items.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [loadTier, filter, playsOnly]);

  /* The counts follow "Only what plays", so a tab says what it will show. */
  const count = (tier: Filter) =>
    frames.filter((f) => (tier === "all" || f.t === tier) && (!playsOnly || f.plays)).length;

  const open = (frame: SheetFrame) => {
    loadTier(frame.t);
    setSaid("");
    fetchLoupe().then(
      () => setLoupeState({ opener: frame.n, at: frame.n, open: true }),
      () => {
        if (frame.story) window.open(frame.story, "_blank", "noopener");
      },
    );
  };

  const step = useCallback(
    (by: number) => {
      if (!loupe || shown.length === 0) return;
      const from = Math.max(0, shown.findIndex((f) => f.n === loupe.at));
      const to = (from + by + shown.length) % shown.length;
      const next = shown[to];
      loadTier(next.t);
      const place = shown.length === frames.length ? "" : `, ${to + 1} of ${shown.length} shown`;
      setSaid(`${next.n}, frame ${next.num}${place}`);
      setLoupeState({ ...loupe, at: next.n });
    },
    [loupe, shown, frames.length, loadTier],
  );

  /* Left and Right step frames, but not from inside the stage or the knobs,
     where they belong to the specimen: a focused Slider moves, it doesn't jump
     to the next frame. And only while the loupe is the top layer, so a Dialog
     opened from a frame keeps its own keys. */
  useEffect(() => {
    if (!loupe?.open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const panel = document.querySelector(".loupe-panel");
      const target = event.target as Element | null;
      if (!panel || !target) return;
      if (!panel.contains(target) && !target.contains(panel)) return;
      if (target.closest(".loupe-stage, .loupe-knobs")) return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loupe?.open, step]);

  const current = loupe ? frames.find((f) => f.n === loupe.at) : undefined;
  const Host = mods.molecules?.Host;

  return (
    <div className="cs">
      <div className="cs-head">
        <div className="cs-tabs" data-roster="Tabs">
          <Tabs
            tabs={TIER_TABS.map((tab) => ({ ...tab, count: count(tab.id) }))}
            activeTab={filter}
            onChange={(id) => {
              const next = id as Filter;
              setFilter(next);
              if (next !== "all") loadTier(next);
            }}
            aria-label="Filter by tier"
          />
        </div>
        <span data-roster="Switch">
          <Switch checked={playsOnly} onChange={setPlaysOnly} label="Only what plays" size="sm" />
        </span>
      </div>

      <a href="#past-the-sheet" className="cs-skip">
        Skip past the sheet
      </a>

      {/* The role puts the list back for WebKit, which drops it from a list
          styled with no markers. */}
      <ol className="cs-grid" role="list">
        {shown.map((frame) => {
          const mod = mods[frame.t];
          const ready = loads[frame.t] === "ready" && frame.known;
          return (
            <li
              key={frame.n}
              data-tier={frame.t}
              data-size={frame.size ?? undefined}
              className="cs-frame"
              ref={(el) => {
                if (el) items.current.set(frame.n, el);
                else items.current.delete(frame.n);
              }}
            >
              <button
                type="button"
                className="cs-cap"
                aria-label={`Open ${frame.n} under the loupe${frame.grease ? `, ${greaseWords(frame.grease)}` : ""}`}
                onClick={() => open(frame)}
                ref={(el) => {
                  if (el) captions.current.set(frame.n, el);
                  else captions.current.delete(frame.n);
                }}
              >
                <span className="cs-num">{frame.num}</span>
                <span className="cs-name">{frame.n}</span>
                <span className="cs-loupe" aria-hidden="true">
                  ⊕
                </span>
              </button>
              <div
                className={frame.n === "Navbar" ? "cs-live cs-live-nav" : "cs-live"}
                data-roster={ready ? frame.n : undefined}
                inert={narrow || frame.n === "Navbar" || undefined}
              >
                <Live frame={frame} spec={mod?.specs[frame.n]} state={loads[frame.t]} />
              </div>
              {frame.grease && <GreaseMark grease={frame.grease} />}
            </li>
          );
        })}
      </ol>
      <span id="past-the-sheet" tabIndex={-1} className="cs-past" />

      {Loupe && loupe && current && (
        <Loupe
          frame={current}
          spec={mods[current.t]?.specs[current.n]}
          state={loads[current.t]}
          open={loupe.open}
          phone={narrow}
          said={said}
          onStep={step}
          onClose={() => setLoupeState((s) => (s ? { ...s, open: false } : s))}
          onAfterClose={() => {
            const opener = loupe.opener;
            setLoupeState(null);
            captions.current.get(opener)?.focus();
          }}
        />
      )}
      {Host && <Host />}
    </div>
  );
}
