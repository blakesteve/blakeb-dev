/**
 * The work. `world` is the project's own accent — it shows up as a 2px rule
 * across the top of its card on the home page, and takes over the whole field
 * on its case-study page. Two values because a color that reads well on paper
 * usually needs to lift on the blueline.
 */
export type Project = {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  status: string;
  host: string;
  href: string | null;
  world: { press: string; blueline: string };
  props: { label: string; value: string; accent?: boolean }[];
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
    href: "https://gameverdict.app",
    world: { press: "#4b45c7", blueline: "#6d6bf2" },
    props: [
      { label: "Stack", value: "Next 16 · Supabase · Upstash" },
      { label: "Scale", value: "1,573 games · 822 commits", accent: true },
      { label: "Note", value: "Cut page egress 1.8 MB → 50 KB" },
    ],
  },
  {
    slug: "roster",
    name: "Roster",
    tagline: "The library this site is made of.",
    blurb:
      "A production-grade atomic component library — accessible, theme-aware, documented in Storybook, and imported by every project beside it.",
    status: "npm",
    host: "@blakesteve/roster",
    href: "https://www.npmjs.com/package/@blakesteve/roster",
    world: { press: "#0e9b74", blueline: "#12b886" },
    props: [
      { label: "Stack", value: "React 19 · TS · Tailwind v4" },
      { label: "Scale", value: "30 components · 298 commits", accent: true },
      { label: "Note", value: "Press ⌥X to see it on this page" },
    ],
  },
  {
    slug: "retrospect",
    name: "Retrospect",
    tagline: "Your music taste vs. the actual sky.",
    blurb:
      "Every scrobble you have ever logged, cross-referenced against real retrogrades, full moons, and eclipses computed from planetary positions. Astrology asks; a permutation test answers.",
    status: "MIT",
    host: "open source",
    href: "https://github.com/blakesteve/retrospect",
    world: { press: "#b98a12", blueline: "#d9a82c" },
    props: [
      { label: "Stack", value: "Next 16 · astronomy-engine · R2" },
      { label: "Scale", value: "25 sky × measure trials", accent: true },
      { label: "Note", value: "Read the math — the repo is public" },
    ],
  },
  {
    slug: "megasquad",
    name: "MegaSquad",
    tagline: "Pick'ems for your friend group.",
    blurb:
      "Ten leagues across five sports. Picks auto-lock at tip-off, and every settled pick answers back — “Bullseye!”, “So Fetch!”, “Gross, dude.”",
    status: "Private",
    host: "megasquad.org",
    href: "https://megasquad.org",
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
