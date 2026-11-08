/**
 * The Contact sheet's index: one entry per Roster component, with what the
 * server needs to print a caption and what the loupe needs before the live
 * frame arrives. No React and no Roster here, so the page can read it on the
 * server and the grid's captions are in the HTML.
 *
 * The specimens themselves are in `atoms.tsx`, `molecules.tsx` and
 * `organisms.tsx`, one chunk per tier, each typed against this list, so a name
 * here without a specimen there fails `tsc`. `frames.test.ts` holds this list
 * to the installed package: a Roster release that adds, drops or renames a
 * component fails it until the frame is written.
 */

export const TIERS = ["atoms", "molecules", "organisms"] as const;
export type Tier = (typeof TIERS)[number];

/** A prop the loupe can set, and the values its Chips offer, in order. */
export type Knobs = Readonly<Record<string, readonly string[]>>;

export type FrameMeta = {
  /** The component's export name, as `getRosterComponents()` reads it. */
  n: string;
  t: Tier;
  /** Takes input: kept by "Only what plays". */
  plays?: boolean;
  /** The app it came out of, where the record says so. Blake confirmed the list on
      7 Nov 2026, and FileUpload's, BB's Grove, on 8 Nov. */
  from?: "Game Verdict" | "this site" | "MegaSquad" | "Bragging Rocks" | "BB's Grove";
  knobs?: Knobs;
  /** A knob that only means something beside another knob's value, as
      `liquidStyle` needs `variant="liquid"`. Choosing it sets that value, and
      moving that knob off it clears this one, so the props on the code line are
      always a combination the component's types accept. */
  needs?: Readonly<Record<string, readonly [knob: string, value: string]>>;
  /** Room the frame keeps before its specimen arrives, for the tall ones, so a
      tier landing doesn't push the rows below it down. */
  size?: "md" | "lg" | "xl";
};

export const FRAME_INDEX = [
  { n: "Avatar", t: "atoms", knobs: { size: ["sm", "md", "lg"] } },
  { n: "AvatarStrip", t: "atoms", from: "Game Verdict" },
  {
    n: "Badge",
    t: "atoms",
    knobs: {
      variant: ["primary", "teal", "amber", "success", "error", "neutral"],
      fill: ["soft", "solid", "outline"],
    },
  },
  {
    n: "Button",
    t: "atoms",
    plays: true,
    knobs: {
      variant: ["solid", "soft", "outline", "ghost", "link"],
      colorScheme: ["primary", "teal", "amber", "error", "neutral"],
      size: ["xs", "sm", "default", "lg"],
    },
  },
  { n: "Card", t: "atoms", knobs: { variant: ["primary", "soft", "outline", "ghost", "slate"] } },
  { n: "Checkbox", t: "atoms", plays: true },
  {
    n: "Chip",
    t: "atoms",
    plays: true,
    knobs: {
      colorScheme: ["primary", "amber", "success", "info", "neutral"],
      variant: ["soft", "solid", "outline"],
    },
  },
  { n: "CollapsibleSection", t: "atoms", plays: true },
  { n: "Combobox", t: "atoms", plays: true },
  { n: "Disclosure", t: "atoms", plays: true },
  {
    n: "Eyebrow",
    t: "atoms",
    from: "this site",
    knobs: { size: ["xs", "sm"], tone: ["faint", "strong", "primary"] },
  },
  { n: "InlineCode", t: "atoms" },
  {
    n: "Input",
    t: "atoms",
    plays: true,
    knobs: { variant: ["outline", "soft", "ghost"], size: ["sm", "default", "lg"] },
  },
  { n: "LabeledDivider", t: "atoms" },
  { n: "Link", t: "atoms", plays: true },
  { n: "LoadingDots", t: "atoms" },
  { n: "MultiSelect", t: "atoms", plays: true },
  { n: "PasswordInput", t: "atoms", plays: true },
  {
    n: "Pill",
    t: "atoms",
    knobs: {
      colorScheme: ["primary", "amber", "success", "error", "info", "neutral"],
      variant: ["soft", "solid", "outline"],
    },
  },
  { n: "Progress", t: "atoms" },
  { n: "SegmentBar", t: "atoms", from: "Game Verdict" },
  { n: "Select", t: "atoms", plays: true },
  { n: "Skeleton", t: "atoms" },
  { n: "Spinner", t: "atoms" },
  { n: "Stat", t: "atoms" },
  { n: "Switch", t: "atoms", plays: true },
  { n: "Textarea", t: "atoms", plays: true },
  { n: "ThemeToggle", t: "atoms" },
  { n: "Tooltip", t: "atoms", plays: true },

  { n: "Accordion", t: "molecules", plays: true },
  { n: "Alert", t: "molecules", knobs: { colorScheme: ["amber", "info", "success", "error", "neutral"] } },
  { n: "Breadcrumbs", t: "molecules" },
  { n: "CallToAction", t: "molecules", knobs: { variant: ["primary", "neutral", "info", "warning"] } },
  { n: "Carousel", t: "molecules", plays: true },
  { n: "CheckboxGroup", t: "molecules", plays: true },
  { n: "DescriptionList", t: "molecules" },
  { n: "EmptyState", t: "molecules", knobs: { variant: ["simple", "dashed"] } },
  { n: "ErrorState", t: "molecules", size: "xl", plays: true },
  { n: "FileUpload", t: "molecules", size: "md", plays: true, from: "BB's Grove" },
  { n: "LiquidTabs", t: "molecules", plays: true, from: "Game Verdict" },
  { n: "MatchupCard", t: "molecules", plays: true, from: "MegaSquad" },
  { n: "MediaPreview", t: "molecules" },
  { n: "Menu", t: "molecules", plays: true },
  { n: "Pagination", t: "molecules", plays: true },
  { n: "ProgressField", t: "molecules" },
  { n: "Pullquote", t: "molecules" },
  { n: "RadioGroup", t: "molecules", plays: true },
  { n: "RadioTileGroup", t: "molecules", plays: true, from: "Bragging Rocks" },
  { n: "RangeSlider", t: "molecules", plays: true },
  { n: "SkeletonPresets", t: "molecules" },
  { n: "Slider", t: "molecules", plays: true, from: "MegaSquad" },
  { n: "StepProgress", t: "molecules" },
  {
    n: "Tabs",
    t: "molecules",
    plays: true,
    knobs: { variant: ["plain", "liquid"], liquidStyle: ["pill", "filled"] },
    needs: { liquidStyle: ["variant", "liquid"] },
  },
  { n: "Timeline", t: "molecules", size: "lg", from: "Bragging Rocks" },
  { n: "Toast", t: "molecules", plays: true },

  { n: "ActionBar", t: "organisms" },
  { n: "Countdown", t: "organisms" },
  { n: "DataTable", t: "organisms" },
  { n: "Dialog", t: "organisms", plays: true },
  { n: "Footer", t: "organisms" },
  { n: "ModerationQueue", t: "organisms", size: "md", plays: true, from: "BB's Grove" },
  { n: "Navbar", t: "organisms" },
  { n: "Sheet", t: "organisms", plays: true },
  { n: "Table", t: "organisms", size: "md" },
] as const satisfies readonly FrameMeta[];

/** The names in one tier, which that tier's chunk must cover exactly. */
export type FrameName<T extends Tier> = Extract<(typeof FRAME_INDEX)[number], { t: T }>["n"];

const BY_NAME = new Map<string, FrameMeta>(FRAME_INDEX.map((frame) => [frame.n, frame]));

export function frameMeta(name: string): FrameMeta | undefined {
  return BY_NAME.get(name);
}

/**
 * The knobs after one Chip is pressed: `on` sets `knob` to `value`, off clears
 * it, and `needs` keeps every pair legal. Choosing a knob sets what it needs,
 * and what that needs in turn. Then any knob whose need isn't met is cleared,
 * repeatedly, since clearing one can unmeet another's.
 */
export function turnKnob(
  props: Readonly<Record<string, string>>,
  needs: FrameMeta["needs"] | null | undefined,
  knob: string,
  value: string,
  on: boolean,
): Record<string, string> {
  const next = { ...props };
  if (on) next[knob] = value;
  else delete next[knob];
  const rules = needs ?? {};
  /* Follow the chain from the knob just chosen, once round at most. */
  for (let k = on ? knob : "", seen = new Set<string>(); rules[k] && !seen.has(k); k = rules[k][0]) {
    seen.add(k);
    next[rules[k][0]] = rules[k][1];
  }
  /* Only deletes, so it ends. */
  for (let changed = true; changed; ) {
    changed = false;
    for (const [k, [dep, needed]] of Object.entries(rules)) {
      if (next[k] !== undefined && next[dep] !== needed) {
        delete next[k];
        changed = true;
      }
    }
  }
  return next;
}
