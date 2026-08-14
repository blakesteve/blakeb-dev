import type { ReactNode } from "react";
import { Shot } from "@/components/shot";
import { REyebrow, RInlineCode, RPullquote } from "@/lib/roster-ui";

import ncaamDark from "@/images/megasquad/megasquad-ncaam-dark.png";
import ncaamLight from "@/images/megasquad/megasquad-ncaam-light.png";
import squidDark from "@/images/megasquad/megasquad-sad-squid-dark.png";
import squidLight from "@/images/megasquad/megasquad-sad-squid-light.png";
import mobileDark from "@/images/megasquad/megasquad-schedule-dark-mobile.png";
import mobileLight from "@/images/megasquad/megasquad-schedule-light-mobile.png";
import collapsedDark from "@/images/megasquad/megasquad-standings-collapsed-dark.png";
import collapsedLight from "@/images/megasquad/megasquad-standings-collapsed-light.png";
import expandedDark from "@/images/megasquad/megasquad-standings-expanded-dark.png";
import expandedLight from "@/images/megasquad/megasquad-standings-expanded-light.png";

import gvBrowse from "@/images/game-verdict/gameverdict-browsegames-filtered.png";
import gvCompare from "@/images/game-verdict/gameverdict-compare.png";
import gvDiscordCompare from "@/images/game-verdict/gameverdict-discord-compare.png";
import gvDiscordVerdict from "@/images/game-verdict/gameverdict-discord-verdict.png";
import gvDetail from "@/images/game-verdict/gameverdict-gamedetail-herocrop.png";
import gvContestedDesktop from "@/images/game-verdict/gameverdict-mostcontested-desktop.png";
import gvContestedMobile from "@/images/game-verdict/gameverdict-mostcontested-mobile.png";
import gvBadges from "@/images/game-verdict/gameverdict-profile-badgeshelf.png";
import gvQuickVote from "@/images/game-verdict/gameverdict-quickvote-desktop.png";
import gvQuickVoteLibrary from "@/images/game-verdict/gameverdict-quickvote-library.png";
import gvQuickVoteMobile from "@/images/game-verdict/gameverdict-quickvote-mobile.png";
import gvResults from "@/images/game-verdict/gameverdict-resultscard.png";
import gvVerdictCard from "@/images/game-verdict/gameverdict-verdictcard.png";
import gvCasting from "@/images/game-verdict/gameverdict-verdictcastingcard.png";
import gvCrtOff from "@/images/game-verdict/gameverdict-crt-off.png";
import gvCrtOn from "@/images/game-verdict/gameverdict-crt-on.png";
import gvKonami1p from "@/images/game-verdict/gameverdict-konami-1p.png";
import gvKonami2p from "@/images/game-verdict/gameverdict-konami-2p.png";
import gvRain from "@/images/game-verdict/gameverdict-konami-rain.png";
import gvSettings from "@/images/game-verdict/gameverdict-settings-steamimport-crt.png";

export type CaseStudyStat = { value: string; label: string; source: string };
export type Row = { k: string; v: string };

export type CaseStudy = {
  lede: string;
  stats: CaseStudyStat[];
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
      <REyebrow className="block pb-2">{eyebrow}</REyebrow>
      <h2 className="m-0 pb-[10px] font-[family-name:var(--font-display)] text-[1.375rem] font-bold tracking-[-0.028em]">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[0.96875rem] leading-[1.62] text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}

/**
 * `current` is what lets the project's accent reach the rule without Roster
 * knowing anything about this site's palette: the wrapper sets the color, the
 * rule inherits it, and the quote text stays at full contrast.
 */
function Pull({ children, cite }: { children: ReactNode; cite: string }) {
  return (
    <span className="block text-[var(--world)]">
      <RPullquote colorScheme="current" cite={cite}>
        <span className="text-ink">{children}</span>
      </RPullquote>
    </span>
  );
}

/**
 * The three states the vote queue degrades through. A table rather than prose
 * because the point is the comparison: each row is a different answer to the
 * same question, and they only read as a set side by side.
 */
function Tiers() {
  const rows: [string, string][] = [
    ["Signed in, library synced", "Your unplayed games, then popular ones"],
    ["Signed in, no library", "Popular games, minus voted and skipped"],
    ["Anonymous", "Popular games, minus what your fingerprint already voted"],
  ];

  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-rule pb-2 pr-4">
              <REyebrow weight="medium">State</REyebrow>
            </th>
            <th className="border-b border-rule pb-2">
              <REyebrow weight="medium">Queue order</REyebrow>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([state, order]) => (
            <tr key={state}>
              <td className="whitespace-nowrap border-b border-rule py-2 pr-4 font-[family-name:var(--font-util)] text-[11px] text-ink">
                {state}
              </td>
              <td className="border-b border-rule py-2 text-[0.9375rem] leading-snug text-ink-soft">
                {order}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <RInlineCode colorScheme="current" className="text-[var(--world)]">
      {children}
    </RInlineCode>
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
            Steam will tell you a game has “full controller support.” It won&rsquo;t tell you whether
            anyone actually <strong>prefers</strong> playing it that way. Game Verdict asks players
            directly, dedupes anonymous votes with a browser fingerprint, and surfaces the leading
            input method as a community badge.
          </p>
          <p>
            Games are searched across Steam and IGDB in parallel, deduped and relevance-ranked, with
            metadata, cover art, and Steam library hero images pulled in automatically when a game is
            added.
          </p>
          <Shot
            press={gvDetail}
            alt="A Game Verdict game page for The Binding of Isaac: Rebirth, showing cover art, a green Controller verdict badge, developer, release year, and genre tags."
            caption="A game page: verdict badge, metadata pulled from Steam and IGDB"
            priority
          />
        </Section>

        <Section eyebrow="The core loop" title="Free to vote, hard to fake">
          <p>
            The whole thing only works if voting is nearly free, and it only means anything if the votes
            can be trusted. Those pull against each other, and almost every decision in the app is an
            answer to that tension.
          </p>
          <p>
            Quick Vote takes the friction out: no account, one game at a time, skip anything you don&rsquo;t
            recognize. A browser fingerprint keeps it honest without putting the friction back,
            counting each voter once whether or not they ever sign up. Sign in later and the votes
            you already cast are claimed rather than lost.
          </p>
          <Shot
            press={gvQuickVote}
            alt="Game Verdict's Quick Vote screen: a queue counter, a session counter, and a single large game card showing Counter-Strike 2."
            caption="Quick Vote: one game at a time, no account required"
          />
          <p>
            A quarter of the traffic is on a phone, and the one-card-at-a-time shape was built for
            exactly that. Nothing about the loop changes on a small screen.
          </p>
          <Shot
            press={gvQuickVoteMobile}
            alt="Quick Vote on a phone: the same single-card layout, sized to a narrow screen."
            caption="The same loop, thumb-sized"
            frame="phone"
          />
          <Pull cite="The design constraint">
            How do you count a vote from someone who refuses to identify themselves, without letting
            them vote a hundred times?
          </Pull>
          <p>
            You can also vote from the game page itself, and the breakdown updates in place rather
            than sending you somewhere to see what you just did.
          </p>
          <Shot
            press={gvCasting}
            alt="The verdict casting card on a game page, offering Keyboard & Mouse, Controller, Both, and a smaller Other option."
            caption="Casting a verdict without leaving the page"
          />
          <Shot
            press={gvResults}
            alt="The results card showing a proportional tricolor bar with percentages for keyboard and mouse, controller, and both."
            caption="The breakdown, right after you vote"
          />
        </Section>

        <Section eyebrow="A small thing I like" title="The queue knows what you have played">
          <p>
            Asking someone to judge a control scheme only works if they have actually played the
            game, so the queue is ordered by <strong>Steam review count</strong> rather than by how
            many verdicts a game already has. Review count is a proxy for “have you actually played this?”.
            Verdict count would surface the games that are already well answered, which is backwards.
          </p>
          <p>
            On top of that it subtracts what you have voted on, skipped, watched, and owned — all
            resolved in a single parallel round trip — then promotes your own unplayed library games
            to the front while keeping them in popularity order. A stable partition, not a re-sort.
          </p>
          <p>
            The fingerprint does double duty here. Because the exclusion set is fingerprint-aware,
            an anonymous voter&rsquo;s queue shrinks as they vote. The queue gets personal for
            someone who never made an account.
          </p>
          <Tiers />
          <Shot
            press={gvQuickVoteLibrary}
            alt="Quick Vote with a synced Steam library: the top card is TUNIC, tagged 'In your library', with a queue of 378 and 535 skipped."
            caption="Library synced: your own games surface first, tagged in place"
          />
        </Section>

        <Section eyebrow="One sentence, two audiences" title="Prose generated from data, not from a model">
          <p>
            Every game page ends with a plain-language verdict: how many people voted, which way they
            leaned, and which controller they tend to use. It&rsquo;s written by a{" "}
            <Code>buildVerdictSummary()</Code> function, not by a language model. Four branches on the
            leading choice, an extra clause when the top two land within ten points of each other, and
            a controller-subtype sentence that only appears once at least two people have reported
            one.
          </p>
          <Shot
            press={gvVerdictCard}
            alt="The Verdict card for Cyberpunk 2077, reading: based on 28 community verdicts, Cyberpunk 2077 works well either way, 53% of players say both inputs feel good, 11% lean controller, and 36% lean keyboard and mouse. Among controller players, Xbox is the most common setup."
            caption="Deterministic prose: same data in, same sentence out"
          />
          <p>
            The same string is also emitted as the <Code>FAQPage</Code> answer in structured data. So
            roughly 1,600 pages that would otherwise be near-identical templates each carry unique
            text answering the literal thing people search for, and the reader and the crawler are
            served by one sentence rather than two systems.
          </p>
          <Pull cite="Why not an LLM">
            No latency, no per-call cost, no hallucinated percentages, and the same input always
            produces the same output. A model would have done this worse, slower, and for money.
          </Pull>
        </Section>

        <Section eyebrow="Then scale arrived" title="The bug that froze the front page">
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
          <Shot
            press={gvBrowse}
            alt="Game Verdict's browse page with platform and sort filters applied, showing a grid of games with verdict badges and vote counts."
            caption="Browse: filtering, sorting and counting all happen in SQL"
          />
        </Section>

        <Section eyebrow="Beyond the vote" title="Reasons to come back, and somewhere else to be">
          <p>
            Twenty badges across six categories are evaluated after every verdict, reaction, and
            library change, with the first unlock arriving as a toast. Profiles are public, with a
            verdict history and an input-method tendency bar you can click to filter.
          </p>
          <Shot
            press={gvBadges}
            alt="A public Game Verdict profile showing a shelf of earned achievement badges."
            caption="The badge shelf on a public profile"
          />
          <p>
            The Discord bot is the part that leaves the site entirely. Five slash commands run on a
            Cloudflare Worker that verifies Discord&rsquo;s Ed25519 signatures, returning rich embeds
            with cover art, the verdict color, and the bar breakdown, so an argument in a group chat
            can be settled without anyone opening a browser.
          </p>
          <Shot
            press={gvDiscordVerdict}
            alt="A Discord embed from the Game Verdict bot showing the verdict for Hades II, with cover art thumbnail and a vote breakdown."
            caption="/verdict in Discord"
          />
          <Shot
            press={gvDiscordCompare}
            alt="A Discord embed comparing two games side by side with their vote breakdowns."
            caption="/compare, side by side"
          />
          <p>
            And the home page keeps the most contested games up front, because a game the community
            cannot agree on is a better invitation to vote than one that is already settled.
          </p>
          <Shot
            press={gvContestedDesktop}
            alt="The Most Contested section of the Game Verdict home page, showing Steam hero art with the game logo composited on top, a tricolor vote bar, and inline vote buttons."
            caption="Most Contested, with Steam hero art and the logo composited on top"
          />
          <Shot
            press={gvContestedMobile}
            alt="The Most Contested card on a phone, with the hero art, vote bar and buttons stacked."
            caption="The same card, narrow"
            frame="phone"
          />
          <Shot
            press={gvCompare}
            alt="Game Verdict's compare view: Counter-Strike 2 against ELDEN RING, with mirrored bars showing 97 percent keyboard and mouse against 80 percent controller."
            caption="Compare: Counter-Strike 2 against ELDEN RING"
          />
        </Section>

        <Section eyebrow="The part nobody asked for" title="An easter egg you get to keep">
          <p>
            Type <Code>↑ ↑ ↓ ↓ ← → ← → B A</Code> and hit Enter or Space. Keyboards, mice, and
            controllers rain down the page, which is a nice five seconds and then it&rsquo;s over.
          </p>
          <Shot
            press={gvRain}
            alt="Game Verdict's Quick Vote page with keyboard, mouse and controller icons falling down the screen after entering the Konami code."
            caption="The icons that fall are the three things you are voting between"
          />
          <p>
            What&rsquo;s actually interesting is what survives the five seconds. The code unlocks{" "}
            <strong>CRT mode</strong>, and CRT mode isn&rsquo;t a moment: it&rsquo;s a real setting, saved to
            your profile and hydrated on the server, that you can turn back on whenever you like.
            Three fixed layers do the work, all of them <Code>pointer-events: none</Code> so nothing
            underneath stops being clickable.
          </p>
          <Shot
            press={gvCrtOff}
            blueline={gvCrtOn}
            alt="The browse page with CRT mode toggled on: scanlines, a vignette, and a subtle red and blue channel shift over the game grid."
            caption="Browse, with and without CRT. Flip the production state to compare"
          />
          <p>
            It also lives in Settings, next to the Steam library import, which is where an easter egg
            stops being a joke and becomes a feature somebody might actually prefer.
          </p>
          <Shot
            press={gvSettings}
            alt="Game Verdict's settings page showing the Steam library import panel and the CRT mode toggle."
            caption="Settings: Steam import, and CRT sitting there like it always belonged"
          />
          <p>
            There&rsquo;s a second code. Finish the sequence, tap <strong>Tab</strong> for Select,
            then hit Enter, and you get the Contra two-player variant. It greets you differently,
            keeps greeting you on every entry rather than only the first, and offers the most secret
            badge on the site.
          </p>
          <Shot
            press={gvKonami1p}
            alt="The first-time Konami dialog, titled with the arrow sequence, reading: the debate is settled."
            caption="1P: the debate is settled"
          />
          <Shot
            press={gvKonami2p}
            alt="The two-player Konami dialog, titled with the sequence plus Select and Start, reading: 30 lives. Player 2 has entered the game. You remembered the Contra 2-player code. Respect."
            caption="2P: 30 lives, and the most secret badge on the site"
          />
          <p>
            All of it works signed out. The rain falls, the CRT turns on, and the badge waits until
            you feel like claiming it. Which is the same idea as the voting, arrived at from a
            completely different direction: <strong>the good part should never be behind the
            account.</strong>
          </p>
          <Pull cite="Try it on this page">
            The code works here too. This page has been listening the whole time.
          </Pull>
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
          <Shot
            press={collapsedLight}
            blueline={collapsedDark}
            alt="A MegaSquad league leaderboard: six members ranked by record, the leader at 48-15 with a gold trophy and an Admin badge."
            caption="A league, settled — six members, 63 games, no arguing"
            priority
          />
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
          <Shot
            press={expandedLight}
            blueline={expandedDark}
            alt="An expanded MegaSquad standings row showing 76.19% win percentage and a per-round breakdown; the Sweet 16 row displays eight team logos, each badged with a green check or a red X."
            caption="The round breakdown — logos badged correct or incorrect"
          />
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
          <Shot
            press={ncaamLight}
            blueline={ncaamDark}
            alt="MegaSquad's NCAA tournament Round 1 schedule: matchup cards with team logos, seeds, and final scores, each outlined red or green with a result pill reading “Gross, dude.” or “Incredible!”"
            caption="Round 1, settled"
          />
          <p>
            All three signals survive the narrow layout. The schedule has exactly one breakpoint, so
            every phone width takes the same path — the card stacks, and the pill keeps its place.
          </p>
          <Shot
            press={mobileLight}
            blueline={mobileDark}
            alt="The same NCAA tournament schedule on a phone: matchup cards stacked vertically with the result pill centered above each pair of teams."
            caption="430 pt"
            frame="phone"
          />
          <p>
            When no league is in season, a dejected squid offers sports trivia instead. It is the
            kind of thing nobody asks for in a spec.
          </p>
          <Shot
            press={squidLight}
            blueline={squidDark}
            alt="MegaSquad's empty state: a cartoon squid with a tear, the message “No games found for Week 1, Season 2026,” and a sports trivia card with a Get Another Fact button."
            caption="No league in season"
          />
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
