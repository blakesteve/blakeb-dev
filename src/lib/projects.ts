import type { CSSProperties } from "react";
import { getRosterComponentCount } from "./roster";
import { STORYBOOK_URL } from "./storybook";
import type { GameVerdictStats } from "./game-verdict-stats";

/**
 * The work, in the order every page lists it: home, /work, the folio numbers
 * and each study's Next link read this one array. Reordering it changes which
 * colors touch, and `app/worlds.test.ts` fails if two that touch can't be told
 * apart.
 *
 * `world` is the project's own accent, and every value is a token in that app's
 * own stylesheet, so it can be checked against its repo. The marks (the card's
 * top edge, the dots, borders and washes, the header's gradient) take `press`
 * and `blueline`. The `*Ink` pair is the same palette for text: 4.5:1 or more on
 * the paper, the panel, RCta's 10% wash and the case-study header at 15% world.
 *
 *   Game Verdict    --roster-primary-700, 500, 700, 400
 *   Bragging Rocks  --br-vermilion, --roster-error-400, 700, 400
 *   Roster          its shipped gray-500, 400, 900, 200
 *   MegaSquad       --roster-primary-600, 400, 700, 400
 *   Retrospect      --roster-primary-700, 500, 900, 500
 *   Tehon           its light accent, night rule, light accent, night ruleStrong
 *
 * Roster's accent is none, on purpose: its mark is graphite, its words are its
 * darkest neutrals, and its card edge and header carry the color bar below.
 */
/**
 * Where a project can be reached. Several have more than one front door:
 * Roster is a package, a repo, and a deployed Storybook, and listing only the
 * npm page hides two thirds of it.
 *
 * The first entry is the primary — it is what the home page card links to and
 * what `host` labels. The rest appear on /work and in the case study sidebar.
 */
export type ProjectLink = {
  label: string;
  href: string;
  /** `site` is a project's own page about itself, where there's nothing to use yet. */
  kind: "live" | "site" | "source" | "package" | "docs";
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  /** The résumé's line, where the tagline only makes sense on this site. The
      résumé is printed and read away from here, so "this site" means nothing. */
  resumeLine?: string;
  blurb: string;
  status: string;
  /** Short label for the primary link, used on cards where space is tight. */
  host: string;
  links: ProjectLink[];
  world: { press: string; blueline: string; pressInk: string; bluelineInk: string };
  /** Runs on Roster, so its color is in Roster's bar. Read from the app's own `package.json`. */
  onRoster?: true;
  props: {
    label: string;
    value: string;
    accent?: boolean;
    /**
     * Rebuilds `value` from figures fetched at build time. Only called when
     * they resolved, so `value` stays the fallback for an unreachable API.
     */
    live?: (stats: GameVerdictStats) => string;
  }[];
};

export const projects: Project[] = [
  {
    slug: "game-verdict",
    name: "Game Verdict",
    tagline: "Controller, or keyboard and mouse?",
    blurb:
      "Players vote, the community decides, and the verdict lands as a live tricolor bar on every tracked game.",
    status: "Live",
    host: "gameverdict.app",
    /* No public repo: github.com/blakesteve/game-verdict is not reachable. */
    links: [
      { label: "gameverdict.app", href: "https://gameverdict.app", kind: "live" },
    ],
    world: { press: "#3730a3", blueline: "#6366f1", pressInk: "#3730a3", bluelineInk: "#818cf8" },
    onRoster: true,
    props: [
      { label: "Stack", value: "Next 16 · Supabase · Upstash" },
      /* Commit counts live in the case study stat row, which reads them from
         GitHub. Repeating one here is how Roster's ended up as 298 on the card
         and 310 in its case study while the repository said 313. */
      {
        label: "Scale",
        /* Re-check this whenever the case study twin is re-checked. It is the
           fallback for the same live figure, and unlike that one it carries no
           date, so a stale value here asserts itself as present tense. */
        /* api.gameverdict.app/api/stats, 15 Nov 2026. */
        value: "2,153 games tracked",
        accent: true,
        live: (stats) => `${stats.games?.toLocaleString("en-US")} games tracked`,
      },
      { label: "Note", value: "No login wall; one vote per browser" },
    ],
  },
  {
    slug: "bragging-rocks",
    name: "Bragging Rocks",
    tagline: "Show your rocks to collectors around the world.",
    resumeLine: "A community where rock collectors show off their collections, with community-sourced rock identification.",
    blurb:
      "Each member keeps a cabinet of their rocks, and each week everyone may bring one to the table. Members can help each other identify a rock.",
    status: "Live",
    host: "bragging.rocks",
    /* Private repo, so nothing here links to it. */
    links: [{ label: "bragging.rocks", href: "https://bragging.rocks", kind: "live" }],
    world: { press: "#ba220d", blueline: "#ed5741", pressInk: "#9f1200", bluelineInk: "#ed5741" },
    onRoster: true,
    props: [
      { label: "Stack", value: "Next 16 · Supabase · Cloudflare R2" },
      /* Its GitHub releases, 0.1.0 to 0.25.0 (9 Oct to 22 Nov 2026), read 24 Nov.
         No member figures here, on purpose. */
      { label: "Scale", value: "31 releases since October", accent: true },
      { label: "Note", value: "Photos never carry a location" },
    ],
  },
  {
    slug: "roster",
    name: "Roster",
    tagline: "The library this site is made of.",
    resumeLine: "An accessible React component library, published to npm.",
    blurb:
      "A production-grade atomic component library: accessible, theme-aware, documented in Storybook, and imported by every web app beside it.",
    status: "npm",
    host: "@blakesteve/roster",
    links: [
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@blakesteve/roster",
        kind: "package",
      },
      {
        /* Same deployment /specimens links component names into. */
        label: "Storybook",
        href: STORYBOOK_URL,
        kind: "docs",
      },
      { label: "GitHub", href: "https://github.com/blakesteve/roster", kind: "source" },
    ],
    world: { press: "#65635f", blueline: "#a8a29e", pressInk: "#1c1917", bluelineInk: "#e7e5e4" },
    props: [
      { label: "Stack", value: "React 19 · TS · Tailwind v4" },
      {
        label: "Scale",
        value: `${getRosterComponentCount()} components, read live`,
        accent: true,
      },
      { label: "Note", value: "Press ⌥X to see it on this page" },
    ],
  },
  {
    slug: "megasquad",
    name: "MegaSquad",
    tagline: "Pick'ems for your friend group.",
    /* Leagues and sports are already in the prop row below and in the lede. */
    blurb:
      "Pick the winners with your friends, lock it in before tip-off, and let the standings settle the trash talk. Every result talks back.",
    status: "Private",
    host: "megasquad.org",
    /* Private: the front end is mine, the API is my brother's. */
    links: [
      { label: "megasquad.org", href: "https://megasquad.org", kind: "live" },
    ],
    world: { press: "#0770da", blueline: "#52a8ff", pressInk: "#0b59a8", bluelineInk: "#52a8ff" },
    onRoster: true,
    props: [
      { label: "Stack", value: "Vite · React 19 · Zustand" },
      /* This card once said ten while the case study said thirteen: it
         repeated a figure the case study owns and drifted a month behind it, which is the exact failure the comment two
         entries above describes. Leagues are the hub's `SportLeague` registry
         on its main branch, playoff and tournament variants folded into their
         base league. Components are distinct Roster components, by Roster's
         own list, imported in mega-squad's `src` on its main branch, tests and
         stories excluded. Both checked 24 Nov 2026, at 97ad31d. */
      { label: "Scale", value: "14 leagues · 33 Roster components", accent: true },
      { label: "Note", value: "Front end mine, API my brother's" },
    ],
  },
  {
    slug: "retrospect",
    name: "Retrospect",
    tagline: "Your music taste vs. the actual sky.",
    /* The lede owns the scrobbles-against-the-sky sentence; this card leads
       with the standard instead, so the two do not read as one paragraph
       printed twice. */
    blurb:
      "Astrology makes a claim and never has to be right. Here it gets twelve fixed questions and a test against chance, and most of the time the answer comes back no.",
    status: "MIT",
    host: "retrospect-seven.vercel.app",
    links: [
      {
        label: "retrospect-seven.vercel.app",
        href: "https://retrospect-seven.vercel.app",
        kind: "live",
      },
      { label: "GitHub", href: "https://github.com/blakesteve/retrospect", kind: "source" },
    ],
    world: { press: "#96731a", blueline: "#d4af37", pressInk: "#684d1d", bluelineInk: "#d4af37" },
    onRoster: true,
    props: [
      { label: "Stack", value: "Next 16 · astronomy-engine · R2" },
      { label: "Scale", value: "12 questions · 2,000 fake skies each", accent: true },
      { label: "Note", value: "Read the math; the repo is public" },
    ],
  },
  {
    slug: "tehon",
    name: "Tehon",
    tagline: "An app for practicing written Japanese.",
    blurb:
      "An app for practicing written Japanese: hiragana, katakana and a bit of kanji. A page a day, with each stroke graded as you finish it. Coming soon to iPhone, iPad and Android.",
    status: "Coming soon",
    host: "tehon.app",
    /* Its own site, until it launches in a store. Nothing here says where to
       get it: no store badges, no store links (tehon.test.ts). */
    links: [{ label: "tehon.app", href: "https://tehon.app", kind: "site" }],
    world: { press: "#23604a", blueline: "#5c8b77", pressInk: "#23604a", bluelineInk: "#93bba8" },
    props: [
      { label: "Stack", value: "Expo 58 · React Native · Skia" },
      /* Jest's total in CI at 14ef879, 24 Nov 2026; the steps are ROADMAP's index there. */
      { label: "Scale", value: "2,843 tests · 9 of 12 steps", accent: true },
      { label: "Note", value: "Collects nothing, sends nothing" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/**
 * The résumé's projects, by slug and in this order, whatever the array does. It
 * used to print the first four with links, so a reorder rewrote the résumé.
 *
 * Tehon isn't here until it launches in a store. Its tehon.app link doesn't put
 * it on the résumé.
 */
export const RESUME_SLUGS = ["game-verdict", "bragging-rocks", "roster", "megasquad", "retrospect"] as const;

export function resumeProjects(list: Project[] = projects): Project[] {
  return RESUME_SLUGS.map((slug) => {
    const project = list.find((p) => p.slug === slug);
    if (!project) throw new Error(`the résumé names ${slug}, which isn't a project`);
    return project;
  });
}

/**
 * Roster's color bar: the color of every project that runs on Roster, in page
 * order, as equal hard-stopped segments, like a printer's control strip.
 * Computed, so it can't drift from the worlds. Roster itself has no segment.
 */
export function barColors(state: "press" | "blueline", list: Project[] = projects): string[] {
  return list.filter((project) => project.onRoster).map((project) => project.world[state]);
}

function strip(colors: string[]): string {
  const at = (n: number) => `${+((100 * n) / colors.length).toFixed(3)}%`;
  return `linear-gradient(to right, ${colors.map((color, i) => `${color} ${at(i)} ${at(i + 1)}`).join(", ")})`;
}

/** What `.roster-bar` declares; globals.css picks by state, as it does for a world. */
export function barStyle(): CSSProperties {
  return { "--bar-press": strip(barColors("press")), "--bar-blueline": strip(barColors("blueline")) } as CSSProperties;
}

/** The four values a `.world` element declares; globals.css picks by state. */
export function worldStyle(world: Project["world"]): CSSProperties {
  return {
    "--world-press": world.press,
    "--world-blueline": world.blueline,
    "--world-ink-press": world.pressInk,
    "--world-ink-blueline": world.bluelineInk,
  } as CSSProperties;
}
