/**
 * What a job is on Ink swap, and how it becomes CSS variables. Pure, so the rules
 * can be tested with literals. The words are in `content/jobs.ts`.
 *
 * A job is Roster as shipped plus that app's overrides. It starts from the
 * shipped tokens rather than the page's, or this site's remap would show through
 * every family the app doesn't override and the reprint wouldn't be that app's.
 */

export type Job = {
  id: string;
  name: string;
  host: string;
  /** "page" sets nothing and inherits the page: it's the sheet at rest. */
  scheme: "light" | "dark" | "page";
  /** How the slug line and the tile describe where the tokens came from. */
  source: string;
  /** Whose tokens, for the screen reader's line: "Reprinted in ___ tokens." */
  whose: string;
  /** The app's own overrides, as copied. Empty for the two that have none. */
  tokens: Record<string, string>;
  ground: string;
  ink: string;
  soft: string;
  card: string;
  rule: string;
  display: string;
  ui: string;
  mono: string;
  /** Bragging Rocks prints its buttons and pills with a cut edge and a grain. */
  printed?: boolean;
  displayCase: "uppercase" | "none";
  displayTrack: string;
  displayWeight: number;
  kicker: string;
  title: string;
  lede: string;
  segments: { label: string; value: number; color: string }[];
  stats: { value: string; label: string }[];
  primary: string;
  secondary: string;
  pill: string;
  alert: { title: string; body: string };
  tabs: [string, string, string];
  /** What the schedule card's list is, for a screen reader. */
  timeline: string;
  steps: { title: string; when: string }[];
  input: { label: string; value: string };
  select: { label: string; options: string[] };
  slider: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    decimals: number;
    unit: string;
  };
  toggle: string;
  progress: { label: string; value: number };
  accordion: { title: string; body: string };
  badges: [string, string, string];
  people: string[];
};

const FAMILIES = ["gray", "primary", "error", "success", "amber", "info", "teal", "orange", "purple"];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function luminance(hex: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return 0.5;
  const [r, g, b] = [0, 2, 4]
    .map((at) => parseInt(match[1].slice(at, at + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Whichever of the job's ink and ground reads better on this fill. */
function inkOn(fill: string, job: Pick<Job, "ink" | "ground">) {
  const on = luminance(fill);
  return contrast(on, luminance(job.ink)) >= contrast(on, luminance(job.ground))
    ? job.ink
    : job.ground;
}

/**
 * A light job on the blueline. `.dark` on `<html>` can't be undone below it, so
 * `dark:` variants fire in the sheet whatever it sets. Instead the sheet takes
 * `.dark` too and the ramps turn over, so those variants land on light values.
 *
 * Neutrals reverse end to end. A color family swaps its ends, keeps 500, and puts
 * 600's value on both 400 and 600: `dark:` variants put text on 400 and fills on
 * 500 and 600, and those have to stay dark on a light sheet. The rules for those
 * steps are explicit because reversal alone only keeps 500 on an eleven-step ramp,
 * and three shipped families have ten. Ink tokens are keyed by fill, so each is
 * chosen again.
 */
function turnOver(tokens: Record<string, string>, job: Pick<Job, "ink" | "ground">) {
  const turned = { ...tokens };
  for (const family of FAMILIES) {
    const steps = STEPS.filter((step) => tokens[`--roster-${family}-${step}`] !== undefined);
    const ramp = steps.map((step) => tokens[`--roster-${family}-${step}`]);
    steps.forEach((step, at) => {
      let value = ramp[ramp.length - 1 - at];
      if (family !== "gray") {
        if (step === 500) value = tokens[`--roster-${family}-500`];
        if (step === 400 || step === 600) value = tokens[`--roster-${family}-600`];
      }
      turned[`--roster-${family}-${step}`] = value;
      turned[`--roster-${family}-${step}-ink`] = inkOn(value, job);
    });
  }
  return turned;
}

export type JobInk = {
  vars: Record<string, string>;
  /** `.dark` on the sheet. */
  dark: boolean;
  /** `data-roster-scope` on the sheet, so Roster's semantic tokens derive there. */
  scoped: boolean;
};

export function jobInk(job: Job, shipped: Record<string, string>, pageDark: boolean): JobInk {
  const surfaces = {
    "--job-ground": job.ground,
    "--job-ink": job.ink,
    "--job-soft": job.soft,
    "--job-card": job.card,
    "--job-rule": job.rule,
    "--job-display": job.display,
    "--job-ui": job.ui,
    "--roster-tabs-text": job.soft,
  };
  if (job.scheme === "page") {
    /* Timeline's upcoming digits sit on the skeleton, which this site's remap darkens
       to under 4.5:1 in both states. The rail keeps its color: it's set at `:root`. */
    return {
      vars: { ...surfaces, "--roster-skeleton": "var(--paper)" },
      dark: false,
      scoped: false,
    };
  }

  const tokens = { ...shipped, ...job.tokens };
  /* From the ramps as the app wrote them. A printed fill is the app's own at any
     page state, so it can't read a ramp that's been turned over. */
  const printed: Record<string, string> = job.printed
    ? {
        "--job-print-ink": tokens["--roster-primary-600"],
        "--job-print-ink-hover": tokens["--roster-primary-700"],
        "--job-print-on-ink": tokens["--roster-white"],
        "--job-print-on-wash": tokens["--roster-gray-700"],
        "--job-print-wash": tokens["--roster-gray-100"],
        "--job-print-wash-hover": tokens["--roster-gray-200"],
      }
    : {};
  return {
    vars: {
      ...(pageDark && job.scheme === "light" ? turnOver(tokens, job) : tokens),
      ...printed,
      "--roster-card-bg": job.card,
      "--roster-font-ui": job.ui,
      "--roster-font-mono": job.mono,
      "--control-face": job.ui,
      ...surfaces,
    },
    dark: job.scheme === "dark" || pageDark,
    scoped: true,
  };
}
