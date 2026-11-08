"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Accordion,
  Alert,
  Breadcrumbs,
  Button,
  CallToAction,
  Carousel,
  CheckboxGroup,
  DescriptionList,
  EmptyState,
  ErrorState,
  FileUpload,
  LiquidTabs,
  MatchupCard,
  MediaPreview,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
  Pagination,
  ProgressField,
  Pullquote,
  RadioGroup,
  RadioTileGroup,
  RangeSlider,
  SkeletonAvatar,
  Slider,
  StepProgress,
  Tabs,
  Timeline,
  Toaster,
  toast,
} from "@blakesteve/roster";
import type { FrameName } from "./frames";
import { CONTROL, PHOTO, crest, wait, type FrameSpec } from "./kit";

type Props = Record<string, string>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const as = (props: Props) => props as any;

function CheckboxGroupFrame() {
  const [inks, setInks] = useState(["c", "m"]);
  return (
    <CheckboxGroup
      options={[
        { value: "c", label: "Cyan" },
        { value: "m", label: "Magenta" },
        { value: "y", label: "Yellow" },
      ]}
      value={inks}
      onChange={setInks}
      columns={1}
      size="sm"
      className="w-full"
    />
  );
}

function LiquidTabsFrame() {
  const [tab, setTab] = useState("v");
  return (
    <LiquidTabs
      tabs={[
        { id: "v", label: "Verdict" },
        { id: "c", label: "Crew" },
      ]}
      activeTab={tab}
      onChange={setTab}
      aria-label="Sections"
    />
  );
}

/* A tap opens the game in MegaSquad. Here it opens the result line, so the
   button does something, and it gets the pointer Roster's card leaves off.
   Sized to its content, as it sits in a schedule: stretched, its hover ran on
   past the second crest. Round crests, since Roster rings the winner's logo. */
function MatchupCardFrame() {
  const [open, setOpen] = useState(false);
  return (
    <div className="cs-col items-center">
      <MatchupCard
        awayTeam={{ id: 1, logoSrc: crest("#b4361f", "A"), name: "Austin", score: 24, isWinner: true }}
        homeTeam={{ id: 2, logoSrc: crest("#1f4e9c", "D"), name: "Denver", score: 17 }}
        isCompleted
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
      />
      {open && <p className="cs-say">Final. Austin by 7.</p>}
    </div>
  );
}

function PaginationFrame() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} pageCount={9} onPageChange={setPage} layout="compact" />;
}

function RadioGroupFrame() {
  const [state, setState] = useState("press");
  return (
    <RadioGroup
      options={[
        { value: "press", label: "Press sheet" },
        { value: "blue", label: "Blueline" },
      ]}
      value={state}
      onChange={setState}
      size="sm"
    />
  );
}

function RadioTileGroupFrame() {
  const [stock, setStock] = useState("a");
  return (
    <RadioTileGroup
      label="Stock"
      value={stock}
      onChange={setStock}
      columns={3}
      className="w-full"
      options={[
        { value: "a", label: "Cool", picture: <i className="cs-tile bg-[#e7e8e3]" /> },
        { value: "b", label: "Warm", picture: <i className="cs-tile bg-[#f5ead5]" /> },
        { value: "c", label: "Proof", picture: <i className="cs-tile bg-[#0a0c11]" /> },
      ]}
    />
  );
}

function RangeSliderFrame() {
  const [range, setRange] = useState<[number, number]>([20, 75]);
  return <RangeSlider value={range} onChange={setRange} label="Tone curve" className="w-full" />;
}

function SliderFrame() {
  const [density, setDensity] = useState<number | null>(62);
  return (
    <Slider value={density} onChange={setDensity} label="Ink density" className="w-full" formatValue={(n) => `${n}%`} />
  );
}

const TAB_ITEMS = [
  { id: "a", label: "Plates", count: 4 },
  { id: "m", label: "Proofs", count: 2 },
];

function TabsStrip({ variant, liquidStyle, label }: { variant?: string; liquidStyle?: string; label: string }) {
  const [tab, setTab] = useState("a");
  const strip = { tabs: TAB_ITEMS, activeTab: tab, onChange: setTab, "aria-label": label };
  return variant === "liquid" ? (
    <Tabs {...strip} variant="liquid" liquidStyle={liquidStyle === "filled" ? "filled" : "pill"} />
  ) : (
    <Tabs {...strip} />
  );
}

/* Both variants, since the liquid one is what LiquidTabs' cross points to. */
function TabsFrame() {
  return (
    <div className="cs-col w-full">
      <TabsStrip label="Job" />
      <TabsStrip label="Job, liquid" variant="liquid" />
    </div>
  );
}

/* The Toaster mounts on the first toast rather than with the page: it's a
   viewport-wide layer nobody needs until a toast exists. One host, which the
   sheet renders once, so the grid's frame and the loupe's copy of it can't
   mount two. A toast raised before it mounts waits in react-hot-toast's store
   and shows when it does. */
let toasted = false;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function ToasterHost() {
  const show = useSyncExternalStore(subscribe, () => toasted, () => false);
  return show ? <Toaster /> : null;
}

function ToastFrame() {
  return (
    <Button
      size="sm"
      variant="outline"
      colorScheme="neutral"
      className={CONTROL}
      onClick={() => {
        toast.success("Plate burned");
        if (!toasted) {
          toasted = true;
          listeners.forEach((listener) => listener());
        }
      }}
    >
      Burn a plate
    </Button>
  );
}

export const MOLECULES = {
  Accordion: {
    C: () => (
      <Accordion
        className="w-full"
        variant="ghost"
        items={[
          { id: 1, title: "Why tokens?", content: "So a consuming app repaints by overriding custom properties." },
          { id: 2, title: "Why no Tailwind?", content: "A consumer shouldn't need it installed." },
        ]}
      />
    ),
  },
  Alert: {
    C: () => (
      <Alert colorScheme="amber" title="Tokens are remapped here" className="w-full">
        Same component, this site&rsquo;s palette.
      </Alert>
    ),
    bench: (p) => (
      <Alert title="Tokens are remapped here" {...as(p)}>
        Same component, this site&rsquo;s palette.
      </Alert>
    ),
  },
  Breadcrumbs: {
    C: () => (
      <Breadcrumbs
        items={[{ label: "Blake Ball", href: "/" }, { label: "Work", href: "/work" }, { label: "Roster" }]}
        separator={<span aria-hidden="true">/</span>}
        currentClassName="text-spot"
      />
    ),
  },
  CallToAction: {
    C: () => (
      <CallToAction variant="primary" title="Take the proof home" description="Every part is on npm." className="w-full" />
    ),
    bench: (p) => <CallToAction title="Take the proof home" description="Every part is on npm." {...as(p)} />,
  },
  Carousel: {
    C: () => (
      <Carousel aria-label="Palettes" itemWidth={92} gap={8} arrows="none" className="w-full">
        {["#d6006d", "#0090ce", "#f5d400", "#0b7d5d", "#e2571f"].map((color) => (
          <div key={color} className="cs-swatch" style={{ background: color }} />
        ))}
      </Carousel>
    ),
  },
  CheckboxGroup: { C: CheckboxGroupFrame },
  DescriptionList: {
    C: () => (
      <DescriptionList
        layout="split"
        className="w-full"
        items={[
          { term: "Stock", description: "Uncoated 100#" },
          { term: "Inks", description: "Four, and a varnish" },
        ]}
      />
    ),
  },
  EmptyState: {
    C: () => <EmptyState variant="simple" title="No plates yet" description="Make one to run the job." className="w-full" />,
    bench: (p) => <EmptyState title="No plates yet" description="Make one to run the job." {...as(p)} />,
  },
  ErrorState: {
    C: () => (
      <ErrorState
        variant="card"
        title="The plate slipped"
        description="Registration drifted 0.4mm."
        onRetry={() => {}}
        className="w-full"
      />
    ),
  },
  FileUpload: {
    /* Nothing leaves the page: the upload is a timer that reports progress. */
    C: () => (
      <FileUpload
        label="Artwork"
        upload={async (_file, control) => {
          for (let i = 1; i <= 5; i++) {
            await wait(180);
            control.onProgress(i / 5);
          }
          return true;
        }}
        maxFiles={1}
        className="w-full"
      />
    ),
  },
  LiquidTabs: { C: LiquidTabsFrame },
  MatchupCard: { C: MatchupCardFrame },
  MediaPreview: {
    C: () => (
      <div className="w-[150px]">
        <MediaPreview src={PHOTO} alt="A proof of the registration mark in process inks" />
      </div>
    ),
  },
  Menu: {
    C: () => (
      <Menu>
        <MenuButton size="sm" variant="outline" colorScheme="neutral" className={CONTROL}>
          Plate actions
        </MenuButton>
        <MenuItems aria-label="Plate actions">
          <MenuItem>Burn a new plate</MenuItem>
          <MenuItem>Check registration</MenuItem>
          <MenuSeparator />
          <MenuItem destructive>Scrap this run</MenuItem>
        </MenuItems>
      </Menu>
    ),
  },
  Pagination: { C: PaginationFrame },
  ProgressField: {
    C: () => <ProgressField label="Sheets printed" value={1840} max={2500} valueText="1,840 of 2,500" className="w-full" />,
  },
  Pullquote: {
    C: () => (
      <span className="text-spot">
        <Pullquote colorScheme="current" cite="The whole idea">
          <span className="cs-quote">
            A token is a promise that the same component can belong to a different product.
          </span>
        </Pullquote>
      </span>
    ),
  },
  RadioGroup: { C: RadioGroupFrame },
  RadioTileGroup: { C: RadioTileGroupFrame },
  RangeSlider: { C: RangeSliderFrame },
  SkeletonPresets: { C: () => <SkeletonAvatar withName /> },
  Slider: { C: SliderFrame },
  StepProgress: { C: () => <StepProgress steps={["Plate", "Proof", "Press"]} current={2} className="w-full" /> },
  Tabs: {
    C: TabsFrame,
    /* Both strips, as on the sheet, until a knob picks one. */
    bench: (p) =>
      p.variant ? <TabsStrip label="Job" variant={p.variant} liquidStyle={p.liquidStyle} /> : <TabsFrame />,
  },
  Timeline: {
    C: () => (
      <Timeline
        label="Job"
        current={2}
        className="w-full"
        steps={[
          { id: "1", title: "Plates burned", when: "Mon" },
          { id: "2", title: "On press", when: "Tue" },
          { id: "3", title: "Bindery", when: "Wed" },
        ]}
      />
    ),
  },
  Toast: { C: ToastFrame },
} satisfies Record<FrameName<"molecules">, FrameSpec>;
