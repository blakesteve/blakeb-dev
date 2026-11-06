"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  Accordion,
  Alert,
  AvatarStrip,
  Badge,
  Card,
  Dialog,
  Input,
  Pill,
  Progress,
  RadioTileGroup,
  SegmentBar,
  Select,
  Slider,
  Switch,
  Tabs,
  Timeline,
} from "@blakesteve/roster";
import { RegistrationMark } from "@/components/registration-mark";
import { jobInk, type Job, type JobInk } from "@/lib/ink-jobs";
import { RButton, REyebrow, RStat } from "@/lib/roster-ui";
import { PORTAL_ROOT } from "@/lib/xray-scan";
import { JobSeal } from "./job-seal";
import "./ink-swap.css";
import "./ink-print.css";

const SNAP_MS = 620;

/* A hand-set seal never sits square, and no two in a row sit alike. */
const SEAL_TILTS = [-3, 2, -2, 3];

function subscribeToPage(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isPageDark = () => document.documentElement.classList.contains("dark");

/**
 * `Select`, `Dialog`, `Menu` and `Tooltip` render at `<body>`, past the sheet's
 * variables, so they'd open in the page's ink. While the sheet has the pointer or
 * focus, its job is copied onto Headless UI's portal root. That root is a Headless
 * UI internal, which is why a test watches for it.
 */
function usePortalInk(
  sheet: React.RefObject<HTMLElement | null>,
  ink: JobInk,
  font: string,
  fonts: string,
  job: string,
) {
  const inSheet = useRef(false);

  useEffect(() => {
    const clear = (root: HTMLElement) => {
      root.removeAttribute("style");
      root.removeAttribute("data-roster-scope");
      root.removeAttribute("data-job");
      root.removeAttribute("class");
    };

    const apply = () => {
      const root = document.getElementById(PORTAL_ROOT);
      if (!root) return;
      clear(root);
      if (!inSheet.current || !ink.scoped) return;
      /* The job's faces are variables on the section around the sheet, which a
         portal is outside of too. */
      root.className = ink.dark ? `dark ${fonts}` : fonts;
      root.setAttribute("data-roster-scope", "");
      root.setAttribute("data-job", job);
      for (const [name, value] of Object.entries(ink.vars)) root.style.setProperty(name, value);
      root.style.fontFamily = font;
    };

    const track = (event: Event) => {
      const target = event.target as Element;
      if (target.closest?.(`#${PORTAL_ROOT}`)) return;
      inSheet.current = !!sheet.current?.contains(target);
      apply();
    };

    /* Headless UI makes the root the first time something opens. */
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true });
    window.addEventListener("pointerdown", track, true);
    window.addEventListener("focusin", track, true);
    apply();

    return () => {
      observer.disconnect();
      window.removeEventListener("pointerdown", track, true);
      window.removeEventListener("focusin", track, true);
      const root = document.getElementById(PORTAL_ROOT);
      if (root) clear(root);
    };
  }, [sheet, ink, font, fonts, job]);
}

/* Not every Roster component forwards `data-roster`, so X-ray's stamp goes on a
   wrapper the size of the component. These stay out of `roster-ui.tsx` on purpose:
   every route loads that module, and a component it starts using goes with it. */
function Stamp({ name, children, className }: { name: string; children: ReactNode; className?: string }) {
  return (
    <div data-roster={name} className={className}>
      {children}
    </div>
  );
}

function ColorBar() {
  return (
    <div className="ink-colorbar" aria-hidden="true">
      {["primary", "teal", "amber", "error", "gray"].flatMap((family) =>
        [300, 500, 700].map((step) => (
          <i key={`${family}${step}`} style={{ background: `var(--roster-${family}-${step})` }} />
        )),
      )}
      <i style={{ background: "var(--job-ink)" }} />
      <i style={{ background: "var(--job-ground)", boxShadow: "inset 0 0 0 1px var(--job-rule)" }} />
    </div>
  );
}

function JobSheet({ job, ink, fonts }: { job: Job; ink: JobInk; fonts: string }) {
  const sheet = useRef<HTMLElement>(null);
  usePortalInk(sheet, ink, job.ui, fonts, job.id);

  const [tab, setTab] = useState("0");
  const [picked, setPicked] = useState<string | number>(job.select.options[0]);
  const [level, setLevel] = useState<number | null>(job.slider.value);
  const [toggled, setToggled] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const cardClass = job.scheme === "page" ? "press-card ink-card" : "ink-card";

  return (
    <section
      ref={sheet}
      aria-label={job.name}
      className={ink.dark ? "ink-sheet dark" : "ink-sheet"}
      data-job={job.id}
      data-roster-scope={ink.scoped ? "" : undefined}
      style={ink.vars as CSSProperties}
    >
      <ColorBar />

      <div className="ink-grid">
        <div className="ink-hero">
          <div className="ink-kicker">
            <REyebrow className="ink-eyebrow">{job.kicker}</REyebrow>
            <Stamp name="Pill">
              <Pill
                dot={!job.printed}
                pulse={!job.printed}
                colorScheme={job.printed ? "neutral" : "primary"}
                size="sm"
                className={job.printed ? "ink-print-wash" : undefined}
              >
                {job.pill}
              </Pill>
            </Stamp>
          </div>
          <h2
            className="ink-title"
            style={{
              textTransform: job.displayCase,
              letterSpacing: job.displayTrack,
              fontWeight: job.displayWeight,
            }}
          >
            {job.title}
          </h2>
          <p className="ink-lede">{job.lede}</p>
          <Stamp name="SegmentBar" className="ink-gap">
            <SegmentBar
              showLegend
              segments={job.segments.map(({ label, value, color }) => ({ key: label, label, value, color }))}
            />
          </Stamp>
          <div className="ink-actions">
            <RButton
              onClick={() => setDialogOpen(true)}
              className={job.printed ? "ink-print-ink" : undefined}
            >
              {job.primary}
            </RButton>
            <RButton
              variant="soft"
              colorScheme={job.printed ? "neutral" : "primary"}
              className={job.printed ? "ink-print-wash" : undefined}
            >
              {job.secondary}
            </RButton>
          </div>
        </div>

        <Card data-roster="Card" padding="none" className={`${cardClass} ink-schedule`}>
          <Stamp name="Tabs" className="ink-tabs">
            <Tabs
              tabs={job.tabs.map((label, at) => ({ id: String(at), label }))}
              activeTab={tab}
              onChange={setTab}
              aria-label="Sections"
            />
          </Stamp>
          <Stamp name="Timeline" className="ink-gap">
            <Timeline
              label={job.timeline}
              current={Number(tab) + 1}
              className={job.printed ? "ink-print-timeline" : undefined}
              whenClassName="ink-when"
              steps={job.steps.map(({ title, when }, at) => ({
                id: String(at),
                title,
                when,
                ...(job.printed && {
                  marker: <JobSeal text={String(at + 1)} tilt={SEAL_TILTS[at % SEAL_TILTS.length]} />,
                }),
              }))}
            />
          </Stamp>
        </Card>

        <Card data-roster="Card" padding="none" className={`${cardClass} ink-form`}>
          <Stamp name="Input">
            <Input label={job.input.label} defaultValue={job.input.value} size="sm" />
          </Stamp>
          <Stamp name="Select">
            <Select
              label={job.select.label}
              options={job.select.options.map((option) => ({ value: option, label: option }))}
              value={picked}
              onChange={setPicked}
              size="sm"
            />
          </Stamp>
          <Stamp name="Slider">
            <Slider
              label={job.slider.label}
              value={level}
              onChange={setLevel}
              min={job.slider.min}
              max={job.slider.max}
              step={job.slider.step}
              formatValue={(value) => `${value.toFixed(job.slider.decimals)}${job.slider.unit}`}
            />
          </Stamp>
          <Stamp name="Switch">
            <Switch checked={toggled} onChange={setToggled} label={job.toggle} ariaLabel={job.toggle} />
          </Stamp>
        </Card>

        <div className="ink-stack">
          <dl className="ink-stats">
            {job.stats.map(({ value, label }) => (
              <RStat key={label} size="md" colorScheme="primary" value={value} label={label} />
            ))}
          </dl>
          <Stamp name="Alert">
            <Alert colorScheme="primary" title={job.alert.title}>
              {job.alert.body}
            </Alert>
          </Stamp>
        </div>

        <div className="ink-stack">
          <Stamp name="AvatarStrip">
            <AvatarStrip
              items={job.people.map((label, at) => ({ key: String(at), label }))}
              maxDisplay={job.people.length}
            />
          </Stamp>
          <div className="ink-badges">
            <span data-roster="Badge">
              <Badge variant="primary">{job.badges[0]}</Badge>
            </span>
            <span data-roster="Badge">
              <Badge variant="primary" fill="solid">
                {job.badges[1]}
              </Badge>
            </span>
            <span data-roster="Badge">
              <Badge variant="neutral" fill="outline">
                {job.badges[2]}
              </Badge>
            </span>
          </div>
          <Stamp name="Progress">
            <Progress value={job.progress.value} label={job.progress.label} />
          </Stamp>
          <Stamp name="Accordion">
            <Accordion
              variant="ghost"
              items={[{ id: 1, title: job.accordion.title, content: job.accordion.body }]}
            />
          </Stamp>
        </div>
      </div>

      <div className="ink-slug">
        <span>{job.name}</span>
        <span>{job.host}</span>
        <span className="ink-slug-end">{job.source}</span>
      </div>
      <i className="ink-press-line" aria-hidden="true" />

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={job.primary}
        description={job.lede}
      >
        <div className="ink-dialog-actions">
          <RButton
            size="sm"
            onClick={() => setDialogOpen(false)}
            className={job.printed ? "ink-print-ink" : undefined}
          >
            Close
          </RButton>
        </div>
      </Dialog>
    </section>
  );
}

/**
 * Ink swap: one sheet of live components, reprinted in a product's tokens, fonts
 * and words. The page around it doesn't change.
 *
 * The jobs arrive as a prop, from the server, so their words and tokens ride in
 * the page and never reach a client chunk. The sheet takes a `key` from the job
 * and its `.dark`, because `Select` and its kin read a scoped `.dark` once, when
 * they mount.
 */
export function InkSwap({
  jobs,
  shipped,
  fonts,
}: {
  jobs: Job[];
  shipped: Record<string, string>;
  fonts: string;
}) {
  const pageDark = useSyncExternalStore(subscribeToPage, isPageDark, () => false);
  const [id, setId] = useState(jobs[0].id);
  /* The tile moves at once and the sheet a frame later, inside the transition. The
     tiles compare a key press against their own value, so a stale one loses it. */
  const [picked, setPicked] = useState(jobs[0].id);
  const [snapping, setSnapping] = useState(false);
  const [said, setSaid] = useState("");
  const snapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrap = useRef<HTMLDivElement>(null);
  /* The last pick, ahead of the render it causes. A key pressed before a wipe's
     update has run is judged against this, or it would be lost. */
  const wanted = useRef(jobs[0].id);
  const reprints = useRef(0);

  const job = jobs.find((candidate) => candidate.id === id) ?? jobs[0];
  const ink = useMemo(() => jobInk(job, shipped, pageDark), [job, shipped, pageDark]);

  useEffect(() => () => clearTimeout(snapTimer.current), []);

  const reprint = useCallback(
    (next: string) => {
      if (next === wanted.current) return;
      wanted.current = next;
      setPicked(next);
      reprints.current += 1;
      const mine = reprints.current;

      /* The last pick, not this one: a replaced transition's update can run after
         the one that replaced it. */
      const update = () => {
        const whose = jobs.find((candidate) => candidate.id === wanted.current)?.whose;
        setId(wanted.current);
        setSaid(`Reprinted in ${whose} tokens.`);
      };
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const snap = () => {
        /* A wipe replaced by a newer pick finishes too, and it hasn't landed. */
        if (reduced || mine !== reprints.current) return;
        document.documentElement.style.removeProperty("--ink-sheet-width");
        setSnapping(true);
        clearTimeout(snapTimer.current);
        snapTimer.current = setTimeout(() => setSnapping(false), SNAP_MS);
      };

      if (reduced || !document.startViewTransition) {
        update();
        snap();
        return;
      }

      document.documentElement.style.setProperty(
        "--ink-sheet-width",
        `${wrap.current?.offsetWidth ?? 800}px`,
      );
      const transition = document.startViewTransition(() => flushSync(update));
      /* A second pick replaces this one mid-wipe, which rejects `ready`. */
      transition.ready.catch(() => {});
      void transition.finished.then(snap, snap);
    },
    [jobs],
  );

  const tiles = jobs.map((candidate) => ({
    value: candidate.id,
    label: candidate.name,
    description: candidate.source.split(" · ")[0],
    picture: (
      <span className="ink-tile" aria-hidden="true">
        <i style={{ background: candidate.scheme === "page" ? "var(--paper)" : candidate.ground }} />
        <i
          style={{
            background:
              candidate.scheme === "page"
                ? "var(--roster-primary-500)"
                : (candidate.tokens["--roster-primary-500"] ?? shipped["--roster-primary-500"]),
          }}
        />
        <i style={{ background: candidate.scheme === "page" ? "var(--ink)" : candidate.ink }} />
      </span>
    ),
  }));

  return (
    <div className="ink-swap">
      <Stamp name="RadioTileGroup">
        <RadioTileGroup
          label="Pick a job"
          value={picked}
          onChange={reprint}
          options={tiles}
          columns={{ base: 3, sm: 3, md: 6 }}
        />
      </Stamp>

      <div ref={wrap} className={snapping ? "ink-wrap ink-snap" : "ink-wrap"}>
        {(["top", "right", "bottom", "left"] as const).map((edge) => (
          <RegistrationMark key={edge} size={16} className={`ink-reg ink-reg-${edge}`} />
        ))}
        {[1, 2, 3, 4].map((corner) => (
          <i key={corner} className={`ink-crop ink-crop-${corner}`} />
        ))}
        <JobSheet key={`${job.id}-${ink.dark}`} job={job} ink={ink} fonts={fonts} />
      </div>

      <p className="sr-only" role="status">
        {said}
      </p>
    </div>
  );
}
