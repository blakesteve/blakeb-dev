/**
 * Sixteen years, structured once.
 *
 * Two pages read this: the arc on /about and the document at /resume. It lives
 * here rather than in either of them because a résumé that disagrees with the
 * about page is worse than having neither.
 *
 * Durations are computed from the dates, never written down. "Five and a half
 * years at IBM" was in the home page copy as prose, and prose like that is only
 * true until it isn't.
 */

export type Track = "design" | "engineering";

export type Role = {
  title: string;
  /** `YYYY-MM`. */
  start: string;
  /** `YYYY-MM`, or null for present. */
  end: string | null;
};

export type Position = {
  org: string;
  location?: string;
  track: Track;
  /** Most recent first. More than one when the title changed in place. */
  roles: Role[];
  /** Shown on /about. One line, no bullet list. */
  note: string;
  /** Shown on /resume. Omitted for the early roles, which do not need them. */
  highlights?: string[];
};

export const EDUCATION = {
  school: "Texas State University",
  degree: "BFA, Communication Design",
  graduated: "2008-12",
  honors: "Cum laude",
} as const;

export const positions: Position[] = [
  {
    org: "Revmatics",
    track: "engineering",
    roles: [{ title: "Lead Front End Engineer", start: "2025-01", end: null }],
    note: "Leading the front end.",
  },
  {
    org: "findhelp",
    track: "engineering",
    roles: [{ title: "Senior Staff Engineer", start: "2024-01", end: "2025-01" }],
    note: "Social care software, at the staff level.",
  },
  {
    org: "Cart.com",
    track: "engineering",
    roles: [
      { title: "Lead Front End Engineer", start: "2023-02", end: "2023-11" },
      { title: "Senior Front End Engineer", start: "2021-10", end: "2023-02" },
    ],
    note: "Unified Analytics: AI-driven visualizations for brands, and the shared component library several teams built on.",
    highlights: [
      "Led the front end for Unified Analytics, surfacing AI-driven visualizations and optimization suggestions to brands.",
      "Built a reusable shared UI component library adopted by several teams across the company.",
      "Worked every phase, from roadmap planning with product and design through implementation and support.",
      "Mentored junior developers.",
      "TypeScript, React, Apollo, GraphQL, Auth0, Tailwind, Material UI, Playwright, Jest, Tableau, Nivo.",
    ],
  },
  {
    org: "Moblize",
    location: "Austin, Texas",
    track: "engineering",
    roles: [{ title: "Software Engineer", start: "2020-04", end: "2021-10" }],
    note: "Real-time drilling dashboards, and an AngularJS migration that had to keep running throughout.",
    highlights: [
      "Built real-time data visualization for oil drilling operators, including anonymized comparison against competitors' wells.",
      "Maintained the front end of two major repositories through an ongoing AngularJS to modern Angular migration.",
    ],
  },
  {
    org: "The Karis Group",
    location: "Austin, Texas",
    track: "engineering",
    roles: [{ title: "Senior Software Engineer", start: "2019-07", end: "2020-04" }],
    note: "A member portal that turned form input into pre-populated medical assistance PDFs.",
    highlights: [
      "Built a member services portal in React and Apollo GraphQL to automate medical bill renegotiation.",
      "Wrote a system that recursively maps a nested JSON object to form inputs and writes user input back, to pre-populate PDF forms.",
      "Integrated Auth0 into the front end applications.",
      "Mentored junior developers.",
    ],
  },
  {
    org: "IBM",
    track: "engineering",
    roles: [{ title: "Staff Software Engineer", start: "2013-12", end: "2019-07" }],
    note: "The long one. Cloud dashboards, native Android, the Watson SDKs, and a CMS built from scratch.",
    highlights: [
      "Contributed to the IBM Cloud developer experience dashboard in React and Redux.",
      "Developed native Android applications for the IBM ReadyApp program and IBM CSync.",
      "Contributed to and maintained the IBM Watson Android and Java SDKs, resolving public repo issues and converting the Java SDK from Maven to Gradle.",
      "Built nested web views in AngularJS and D3 for native Android and iOS apps.",
      "Implemented the IBM Mobile Innovation Lab site from scratch as a CMS on Node.js, MongoDB, and Keystone.js.",
    ],
  },
  {
    org: "TAVHealth",
    track: "engineering",
    roles: [{ title: "Developer", start: "2012-09", end: "2013-11" }],
    note: "Groovy on Grails, helping hospital staff track outpatients.",
    highlights: [
      "Built a web application on Groovy on Grails for hospital employees tracking outpatients.",
      "Implemented Bootstrap, custom CSS, and jQuery; customized a PHP-based Sugar CRM.",
    ],
  },
  {
    org: "AllClear ID",
    location: "Austin, Texas",
    track: "engineering",
    roles: [{ title: "Web Developer", start: "2010-11", end: "2012-08" }],
    note: "Rebuilt the site through a corporate rebrand, and started the internal style guide. The first component library, before anyone called it that.",
    highlights: [
      "Recreated the majority of the company's PHP site during a corporate rebrand.",
      "Maintained distinct consumer and corporate designs, and started the internal style guide.",
      "Worked directly from designers' files and introduced HTML5 to the Java engineers.",
    ],
  },
  {
    org: "Texas A&M University-Commerce",
    track: "design",
    roles: [{ title: "Graphic Designer", start: "2010-06", end: "2010-09" }],
    note: "Logos and collateral, plus a twenty-page brochure start to finish.",
  },
  {
    org: "Murillo Design",
    track: "design",
    roles: [{ title: "Graphic Design Intern", start: "2009-02", end: "2009-05" }],
    note: "Logos, branding, email, stationery. Where the whole thing starts.",
  },
];

/** Months between two `YYYY-MM` marks; `end` of null means now. */
export function monthsBetween(start: string, end: string | null): number {
  const [sy, sm] = start.split("-").map(Number);
  const now = new Date();
  const [ey, em] = end
    ? end.split("-").map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  return (ey - sy) * 12 + (em - sm);
}

/** "5 yrs 8 mos", "10 mos". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  if (rest) parts.push(`${rest} mo${rest === 1 ? "" : "s"}`);
  return parts.join(" ") || "under a month";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Dec 2013". */
export function formatMark(mark: string): string {
  const [y, m] = mark.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** The span a position covers, oldest role start to newest role end. */
export function positionSpan(position: Position): { start: string; end: string | null } {
  const starts = position.roles.map((r) => r.start).sort();
  const ends = position.roles.map((r) => r.end);
  return {
    start: starts[0],
    end: ends.includes(null) ? null : ends.filter(Boolean).sort().at(-1)!,
  };
}

/** First mark on the timeline, so the arc can scale itself. */
export const CAREER_START = positions
  .flatMap((p) => p.roles.map((r) => r.start))
  .sort()[0];

/** Years shipping, counted from the first engineering role rather than the first job. */
export const ENGINEERING_START = positions
  .filter((p) => p.track === "engineering")
  .flatMap((p) => p.roles.map((r) => r.start))
  .sort()[0];

/**
 * Rounded, not floored. Nov 2010 to now is 15 years and 9 months, which every
 * human on earth calls sixteen years, and which the home page had hardcoded as
 * "Sixteen" while this rounded down to 15. Two numbers for one fact is the bug
 * this site keeps finding in itself; both pages now call this.
 */
export function yearsShipping(): number {
  return Math.round(monthsBetween(ENGINEERING_START, null) / 12);
}

/** "sixteen", for prose that should not be numerals. */
export function yearsShippingWords(): string {
  const words = ["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
                 "seventeen","eighteen","nineteen","twenty"];
  const n = yearsShipping();
  return words[n - 10] ?? String(n);
}

/**
 * "Sixteen", for the several places the figure opens a sentence.
 *
 * Four metadata strings had it typed out as a literal, which is the same bug
 * the note above describes, still live in the one place nobody looks at: the
 * search result and the link preview.
 */
export function yearsShippingWordsCapitalized(): string {
  const words = yearsShippingWords();
  return words[0].toUpperCase() + words.slice(1);
}

/**
 * Skills, grouped the way a reader scans them rather than alphabetically.
 *
 * The test for inclusion is "would I want the next job to involve this", not
 * "have I ever shipped it". Those are different lists, and only the first one
 * is useful to a reader — everything here is a thing worth being called about.
 *
 * So Groovy is gone despite a year of it at TAVHealth, and Java and MongoDB
 * went the same way: real, done, not sought. The 2023 résumé led with Styled
 * Components and Webpack, which is how a skills list quietly becomes a record
 * of what you used to do.
 *
 * Order carries meaning inside a group. Redux stays because plenty of roles
 * still run on it, but it sits behind TanStack Query, which is what the work
 * reaches for now. A reader scanning left to right should hit the current
 * answer first.
 *
 * The history below still carries all of it. That is the honest place for it:
 * TAVHealth says Groovy on Grails, and it is dated 2012.
 */
export const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "SQL", "HTML", "CSS"],
  },
  {
    group: "Front end",
    items: [
      "React 19",
      "Next.js App Router",
      "React Server Components",
      "TanStack Query",
      "Redux",
      "Zustand",
      "Angular",
    ],
  },
  {
    group: "Styling",
    items: ["Tailwind CSS v4", "Design tokens", "Cascade layers", "Sass"],
  },
  {
    group: "Back end and data",
    items: ["Node.js", "Postgres", "Supabase", "GraphQL", "Apollo", "Redis"],
  },
  {
    group: "Testing",
    items: ["Vitest", "Playwright", "Storybook", "Jest", "Cypress"],
  },
  {
    group: "Design",
    items: ["Figma", "Adobe CS", "Typography", "Accessibility"],
  },
];

/** A one-paragraph summary, used at the top of the résumé. */
export function summary(): string {
  return (
    `Front end leader with a design degree and ${yearsShippingWords()} years shipping software, ` +
    "from IBM's cloud dashboards to a component library four production apps run on. " +
    "Comfortable owning the whole path: schema and caching underneath, tokens and " +
    "type on top, and the argument with design in the middle."
  );
}
