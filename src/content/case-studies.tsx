import type { ReactNode } from "react";

export type Stat = { value: string; label: string; source: string };
export type Row = { k: string; v: string };

export type CaseStudy = {
  lede: string;
  stats: Stat[];
  stack: Row[];
  also: Row[];
  body: ReactNode;
};

/* Shared prose primitives. Kept here so every case study reads in one voice. */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <span className="u block pb-2">{eyebrow}</span>
      <h2 className="m-0 pb-[10px] font-[family-name:var(--font-display)] text-[1.375rem] font-bold tracking-[-0.028em]">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[0.96875rem] leading-[1.62] text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}

function Pull({ children, cite }: { children: ReactNode; cite: string }) {
  return (
    <figure className="my-1 border-l-2 border-[var(--world)] py-[2px] pl-4">
      <blockquote className="m-0 max-w-[48ch] text-[1.03125rem] leading-[1.5] text-ink">
        {children}
      </blockquote>
      <figcaption className="u mt-[7px] !tracking-[0.14em]">{cite}</figcaption>
    </figure>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="font-[family-name:var(--font-util)] text-[0.8125rem] text-[var(--world)]">
      {children}
    </code>
  );
}

export const caseStudies: Record<string, CaseStudy> = {
  "game-verdict": {
    lede: "A crowdsourced answer to an argument PC gamers have been having forever: is this game better with a controller, or with a keyboard and mouse?",
    stats: [
      { value: "1,573", label: "Games tracked", source: "live · /api/stats" },
      { value: "822", label: "Commits", source: "GitHub API" },
      { value: "35", label: "Test files", source: "build time" },
      { value: "50 KB", label: "Per browse page", source: "was 1.8 MB" },
    ],
    stack: [
      { k: "Framework", v: "Next.js 16, App Router" },
      { k: "Data", v: "Supabase / PostgreSQL" },
      { k: "Cache", v: "unstable_cache + tags" },
      { k: "Limits", v: "Upstash Redis" },
      { k: "Bots", v: "Turnstile + FingerprintJS" },
      { k: "Email", v: "Resend" },
      { k: "Sources", v: "Steam Store + IGDB" },
      { k: "Extra", v: "Discord bot (CF Worker)" },
    ],
    also: [
      { k: "Badges", v: "20 achievements, 6 categories" },
      { k: "Social", v: "Threads, reactions, profiles" },
      { k: "Compare", v: "Head-to-head dueling bars" },
      { k: "Digest", v: "Weekly email, cron" },
    ],
    body: (
      <>
        <Section eyebrow="The problem" title="Everyone has an opinion, nobody has data">
          <p>
            Steam will tell you a game has “full controller support.” It will not tell you whether
            anyone actually <strong>prefers</strong> playing it that way. Game Verdict asks players
            directly, dedupes anonymous votes with a browser fingerprint, and surfaces the leading
            input method as a community badge.
          </p>
          <p>
            Games are searched across Steam and IGDB in parallel, deduped and relevance-ranked, with
            metadata, cover art, and Steam library hero images pulled in automatically when a game is
            added.
          </p>
        </Section>

        <Section eyebrow="The hard thing" title="The bug that froze the front page">
          <p>
            Home page stats stopped moving. Not wrong — <strong>frozen</strong>, at a number that
            looked perfectly plausible. The cause was that <Code>getAllGames()</Code> ran an
            unbounded <Code>SELECT *</Code> against the verdicts table, and PostgREST silently caps
            responses at 1,000 rows. Everything worked exactly right until the site crossed its
            thousandth verdict, and then it quietly stopped counting.
          </p>
          <Pull cite="Why it took a while to spot">
            The failure mode was not an error. It was a number that stayed believable while it
            stopped being true.
          </Pull>
          <p>
            The fix was a <Code>game_vote_summary</Code> aggregate view doing the counting in
            Postgres. Which raised the more interesting question: why was the browse page shipping
            the entire games table to the client at all?
          </p>
        </Section>

        <Section eyebrow="What it cost" title="1.8 MB → 50 KB per pageview">
          <p>
            Browse was slicing a full table read. It became a <Code>games_browse</Code> Postgres view
            with filtering, sorting, and counting pushed into SQL behind <Code>LIMIT/OFFSET</Code>,
            fed by a route handler driving infinite scroll. A 24-row page costs about 50 KB. The old
            one cost about 1.8 MB — <strong>every single pageview</strong>, and worst during crawler
            bursts, when concurrent requests each independently pulled the whole list.
          </p>
        </Section>
      </>
    ),
  },

  roster: {
    lede: "A production-grade atomic component library — and the thing this site is built out of. Thirty components, organized as atoms, molecules, and organisms, each documented in Storybook.",
    stats: [
      { value: "30", label: "Components", source: "live · package exports" },
      { value: "298", label: "Commits", source: "GitHub API" },
      { value: "30", label: "Test files", source: "build time" },
      { value: "5", label: "Apps consuming it", source: "including this one" },
    ],
    stack: [
      { k: "Runtime", v: "React 19" },
      { k: "Language", v: "TypeScript, strict" },
      { k: "Styling", v: "Tailwind CSS v4" },
      { k: "Build", v: "Vite — ES + UMD + d.ts" },
      { k: "A11y", v: "Headless UI + Radix" },
      { k: "Docs", v: "Storybook" },
      { k: "Tests", v: "Vitest + Playwright" },
      { k: "License", v: "MIT" },
    ],
    also: [
      { k: "Atoms", v: "17 — Button, Input, Tooltip…" },
      { k: "Molecules", v: "6 — Accordion, EmptyState…" },
      { k: "Organisms", v: "7 — DataTable, Navbar…" },
      { k: "Ships", v: '"use client" pre-bundled' },
    ],
    body: (
      <>
        <Section eyebrow="The problem" title="Four apps, four sets of the same button">
          <p>
            Game Verdict, Retrospect, MegaSquad, and BB&rsquo;s Grove are unrelated products with
            unrelated palettes. What they share is the substrate: a button that handles its own
            loading state, an input that knows how to be wrong, a dialog that traps focus properly.
            Rebuilding that four times is how you end up with four subtly different definitions of
            &ldquo;disabled.&rdquo;
          </p>
          <p>
            Roster is that substrate, published to npm and versioned like the dependency it is. It
            ships pre-compiled CSS, so a consuming app does not need Tailwind installed to use it.
          </p>
        </Section>

        <Section eyebrow="The hard thing" title="Theme-aware without being theme-locked">
          <p>
            A component library that hardcodes its palette is a library you can use exactly once.
            Roster&rsquo;s classes compile down to <Code>var(--roster-*)</Code>, so a consuming app
            can repaint every component at once by overriding custom properties — no forks, no
            wrapper components, no <Code>!important</Code>.
          </p>
          <Pull cite="This page, right now">
            The site you are reading remaps those tokens twice: once for the press sheet, once for
            the blueline. Same components, two production states.
          </Pull>
          <p>
            Dark mode is class-based rather than tied to the OS preference, which is what makes a
            manual toggle possible at all.
          </p>
        </Section>

        <Section eyebrow="Eating the dogfood" title="The count on this page is not typed">
          <p>
            The component number in the system strip on the home page is read at build time from the
            installed package&rsquo;s own type definitions — every module re-exported as{" "}
            <Code>components/&lt;tier&gt;/&lt;Name&gt;/&lt;Name&gt;</Code>. The swatches are parsed
            out of the shipped <Code>tokens.css</Code>. Publish a component, redeploy, and this site
            counts it without anyone editing a file.
          </p>
        </Section>
      </>
    ),
  },

  retrospect: {
    lede: "Your Last.fm history against the actual sky. Every scrobble you have ever logged, cross-referenced with real retrogrades, full moons, and eclipses — and then held to a standard astrology never asks for.",
    stats: [
      { value: "25", label: "Sky × measure trials", source: "5 phenomena, 5 measures" },
      { value: "1000s", label: "Scrambled calendars", source: "per claim" },
      { value: "$0", label: "Hosting cost", source: "by design" },
      { value: "MIT", label: "License", source: "public repo" },
    ],
    stack: [
      { k: "Framework", v: "Next.js 16" },
      { k: "Ephemeris", v: "astronomy-engine" },
      { k: "Source", v: "Last.fm API" },
      { k: "Storage", v: "Cloudflare R2" },
      { k: "Hosting", v: "Vercel Hobby" },
      { k: "Tests", v: "Vitest" },
    ],
    also: [
      { k: "Phenomena", v: "Mercury, Venus, Mars, moons, eclipses" },
      { k: "Measures", v: "Nostalgia, Old Flames, Intensity…" },
      { k: "Charts", v: "Sun, moon, rising — computed client-side" },
      { k: "Privacy", v: "Birth data never leaves the browser" },
    ],
    body: (
      <>
        <Section eyebrow="The problem" title="Astrology never has to be right">
          <p>
            &ldquo;Mercury retrograde makes you revisit the past&rdquo; is unfalsifiable as usually
            stated. But it is not unfalsifiable in principle — you just need a record of what someone
            actually did, and a real calendar of when the sky did the thing. A Last.fm history is the
            first. An ephemeris is the second.
          </p>
        </Section>

        <Section eyebrow="The hard thing" title="Making it possible to be wrong">
          <p>
            Any large listening history will show <em>some</em> difference during retrograde, because
            any two arbitrary buckets of days differ. The question is whether the difference is
            bigger than chance produces on its own.
          </p>
          <p>
            So every claim faces a <strong>circular permutation test</strong>: the real event calendar
            is rotated to thousands of fake positions against the same listening data, and the real
            effect only counts when it beats what the scrambled calendars produce. Seasonality and
            listening-volume trends survive the rotation, which is the point — the null keeps the
            structure of your actual life.
          </p>
          <Pull cite="The design constraint">
            Astrology is the question. Statistics is the answer. If the sky is innocent, the app has
            to be willing to say so.
          </Pull>
          <p>
            Verdicts are written in plain language — &ldquo;Does a full moon keep you up past
            midnight? No, just +2%&rdquo; — with a grip meter standing in for the p-value, and the
            real numbers available in a skeptic&rsquo;s panel for anyone who wants them.
          </p>
        </Section>

        <Section eyebrow="What it cost" title="Built to cost nothing, on purpose">
          <p>
            Retrospect runs on Vercel&rsquo;s free tier with Cloudflare R2 for storage. R2 was chosen
            specifically because it has <strong>zero egress fees</strong>, so a read-heavy access
            pattern cannot generate a surprise bill. Histories are stored as gzipped blobs — a
            500,000-scrobble library is about 7 MB.
          </p>
        </Section>
      </>
    ),
  },

  megasquad: {
    lede: "Multi-sport pick’ems for your friend group. Ten leagues across five sports, picks that auto-lock at tip-off, and standings that settle the trash talk. I built the front end; my brother built the API.",
    stats: [
      { value: "10", label: "Leagues supported", source: "five sports" },
      { value: "18", label: "Roster components", source: "across 40 files" },
      { value: "76.19%", label: "Best bracket", source: "48–15, NCAAM" },
      { value: "30 s", label: "Poll interval", source: "idle after 5 min" },
    ],
    stack: [
      { k: "Build", v: "Vite" },
      { k: "Runtime", v: "React 19" },
      { k: "State", v: "Zustand, slice pattern" },
      { k: "Forms", v: "React Hook Form" },
      { k: "Tables", v: "TanStack Table" },
      { k: "UI", v: "@blakesteve/roster" },
      { k: "API", v: "Python — my brother's" },
      { k: "Deploy", v: "Vercel" },
    ],
    also: [
      { k: "Leagues", v: "NFL, NBA, MLB, NCAAM/W/F, WNBA, WBC, World Cup" },
      { k: "Squads", v: "Private groups, invites, admin roles" },
      { k: "InnerSquad", v: "The internal ops tool, also mine" },
      { k: "Themes", v: "Full light and dark" },
    ],
    body: (
      <>
        <Section eyebrow="The problem" title="The group chat is a bad database">
          <p>
            Every friend group already runs a pick&rsquo;em. It lives in a group chat, the scoring is
            done from memory, and someone always claims they had the upset. MegaSquad is that, with a
            source of truth — squads, leagues, weekly picks that lock the moment a game starts, and
            standings nobody can argue with.
          </p>
        </Section>

        <Section eyebrow="The hard thing" title="Showing you how your bracket fell apart">
          <p>
            A record of 48&ndash;15 tells you almost nothing. The interesting question is{" "}
            <em>where</em> it went wrong. So standings expand into a per-round breakdown, and each
            round shows the actual team logos you picked, badged correct or incorrect.
          </p>
          <Pull cite="One bracket, read at a glance">
            Round 1 at 26&ndash;6. Round 2 at 11&ndash;5. Then the Sweet 16 goes 4&ndash;4, and you
            can see exactly which four teams did it.
          </Pull>
          <p>
            None of those numbers are stored twice. The record, the win percentage, the per-round
            tallies, and the completed-game count all derive from the same picks — which is why they
            reconcile exactly, and why they cannot drift apart.
          </p>
        </Section>

        <Section eyebrow="The delight" title="Every settled pick answers back">
          <p>
            Getting a pick right returns <strong>&ldquo;Bullseye!&rdquo;</strong>, or
            &ldquo;Nailed It!&rdquo;, or &ldquo;A Prophet!&rdquo; Getting one wrong returns
            &ldquo;Narp.&rdquo;, &ldquo;Whiff.&rdquo;, or &ldquo;Gross, dude.&rdquo; State is encoded
            three ways at once — border color, a result pill, and the score — so an entire week reads
            without parsing anything.
          </p>
          <p>
            When no league is in season, a dejected squid offers sports trivia instead. It is the
            kind of thing nobody asks for in a spec.
          </p>
        </Section>

        <Section eyebrow="Working to someone else's contract" title="Two languages, one product">
          <p>
            The API is my brother&rsquo;s, in Python. That makes the front end a consumer of a
            contract it does not control, which is its own discipline: the app polls invitations
            every 30 seconds but stops after five minutes of inactivity, so a tab left open for three
            days is not quietly hammering his server.
          </p>
        </Section>
      </>
    ),
  },
};
