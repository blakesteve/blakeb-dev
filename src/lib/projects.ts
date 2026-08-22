import { getRosterComponentCount } from "./roster";
import { STORYBOOK_URL } from "./storybook";
import type { GameVerdictStats } from "./game-verdict-stats";

/**
 * The work. `world` is the project's own accent — it shows up as a 2px rule
 * across the top of its card on the home page, and takes over the whole field
 * on its case-study page. Two values because a color that reads well on paper
 * usually needs to lift on the blueline.
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
  kind: "live" | "source" | "package" | "docs";
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  status: string;
  /** Short label for the primary link, used on cards where space is tight. */
  host: string;
  links: ProjectLink[];
  world: { press: string; blueline: string };
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
    world: { press: "#4b45c7", blueline: "#6d6bf2" },
    props: [
      { label: "Stack", value: "Next 16 · Supabase · Upstash" },
      /* Commit counts live in the case study stat row, which reads them from
         GitHub. Repeating one here is how Roster's ended up as 298 on the card
         and 310 in its case study while the repository said 313. */
      {
        label: "Scale",
        value: "1,580 games tracked",
        accent: true,
        live: (stats) => `${stats.games?.toLocaleString("en-US")} games tracked`,
      },
      { label: "Note", value: "No login wall; one vote per browser" },
    ],
  },
  {
    slug: "roster",
    name: "Roster",
    tagline: "The library this site is made of.",
    blurb:
      "A production-grade atomic component library: accessible, theme-aware, documented in Storybook, and imported by every project beside it.",
    status: "npm",
    host: "@blakesteve/roster",
    links: [
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@blakesteve/roster",
        kind: "package",
      },
      {
        /* Same deployment /system links component names into. */
        label: "Storybook",
        href: STORYBOOK_URL,
        kind: "docs",
      },
      { label: "GitHub", href: "https://github.com/blakesteve/roster", kind: "source" },
    ],
    world: { press: "#0e9b74", blueline: "#12b886" },
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
    slug: "retrospect",
    name: "Retrospect",
    tagline: "Your music taste vs. the actual sky.",
    /* The lede owns the scrobbles-against-the-sky sentence; this card leads
       with the standard instead, so the two do not read as one paragraph
       printed twice. */
    blurb:
      "Astrology makes a claim and never has to be right. Here it gets a permutation test, and most of the time the answer comes back no.",
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
    world: { press: "#b98a12", blueline: "#d9a82c" },
    props: [
      { label: "Stack", value: "Next 16 · astronomy-engine · R2" },
      { label: "Scale", value: "25 sky × measure trials", accent: true },
      { label: "Note", value: "Read the math; the repo is public" },
    ],
  },
  {
    slug: "megasquad",
    name: "MegaSquad",
    tagline: "Pick'ems for your friend group.",
    /* Leagues and sports are already in the prop row below and in the lede;
       what only this card says is how it talks back. */
    blurb:
      "Every settled pick answers back: “Bullseye!”, “So Fetch!”, or “Gross, dude.” Underneath the jokes, a scoreboard that always adds up.",
    status: "Private",
    host: "megasquad.org",
    /* Private: the front end is mine, the API is my brother's. */
    links: [
      { label: "megasquad.org", href: "https://megasquad.org", kind: "live" },
    ],
    world: { press: "#c62828", blueline: "#e23b3b" },
    props: [
      { label: "Stack", value: "Vite · React 19 · Zustand" },
      { label: "Scale", value: "10 leagues · 18 Roster components", accent: true },
      { label: "Note", value: "Front end mine, API my brother's" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
