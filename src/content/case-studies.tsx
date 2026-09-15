import type { ReactNode } from "react";
import { Shot } from "@/components/shot";
import { Clip } from "@/components/clip";
import { BothPalettes } from "@/components/both-palettes";
import { ReleaseHistory } from "@/components/release-history";
import { Dek } from "@/components/dek";
import {
  RBadge,
  RButton,
  REyebrow,
  RInlineCode,
  RPullquote,
} from "@/lib/roster-ui";
import { getRosterComponentCount, getRosterComponents, getRosterMeta } from "@/lib/roster";

/* Counted from the installed package's own type definitions, so the tier
   breakdown in the Roster sidebar cannot drift from the count in its stat row.
   Both come from the same read. */
const rosterTiers = getRosterComponents().reduce<Record<string, number>>(
  (acc, { tier }) => ({ ...acc, [tier]: (acc[tier] ?? 0) + 1 }),
  {},
);

import rsHero from "@/images/retrospect/retrospect-hero-desktop.png";
import rsHeroMobile from "@/images/retrospect/retrospect-hero-mobile.png";
import rsSkyNow from "@/images/retrospect/retrospect-skycurrently-countdown.png";
import rsScale from "@/images/retrospect/retrospect-reveal-scale.png";
import rsVerdict from "@/images/retrospect/retrospect-verdict-desktop.png";
import rsVerdictMobile from "@/images/retrospect/retrospect-verdict-reveal-mobile.png";
import rsSweepRun from "@/images/retrospect/retrospect-trial-sweep-mid-run.png";
import rsSweepResults from "@/images/retrospect/retrospect-trial-sweep-results.png";
import rsSkeptic from "@/images/retrospect/retrospect-skeptics-panel.png";
import rsSkepticMobile from "@/images/retrospect/retrospect-skeptics-panel-mobile.png";
import rsFingerprints from "@/images/retrospect/retrospect-fingerprints.png";
import rsFingerprintsMobile from "@/images/retrospect/retrospect-fingerprints-mobile.png";
import rsAnthem from "@/images/retrospect/retrospect-anthem-nostalgic-day.png";
import rsYearChart from "@/images/retrospect/retrospect-year-chart.png";
import rsBirthChart from "@/images/retrospect/retrospect-birthchart-panel.png";

import ncaamDark from "@/images/megasquad/megasquad-2.0-ncaam-dark.png";
import ncaamLight from "@/images/megasquad/megasquad-2.0-ncaam-light.png";
import squidDark from "@/images/megasquad/megasquad-2.0-sad-squid-dark.png";
import squidLight from "@/images/megasquad/megasquad-2.0-sad-squid-light.png";
import mobileDark from "@/images/megasquad/megasquad-2.0-schedule-mobile-dark.png";
import mobileLight from "@/images/megasquad/megasquad-2.0-schedule-mobile-light.png";
import pickingDark from "@/images/megasquad/megasquad-2.0-picking-dark.png";
import pickingLight from "@/images/megasquad/megasquad-2.0-picking-light.png";
import pickingMobileDark from "@/images/megasquad/megasquad-2.0-picking-mobile-dark.png";
import pickingMobileLight from "@/images/megasquad/megasquad-2.0-picking-mobile-light.png";
import collapsedDark from "@/images/megasquad/megasquad-2.0-standings-collapsed-dark.png";
import collapsedLight from "@/images/megasquad/megasquad-2.0-standings-collapsed-light.png";
import expandedDark from "@/images/megasquad/megasquad-2.0-standings-expanded-dark.png";
import expandedLight from "@/images/megasquad/megasquad-2.0-standings-expanded-light.png";

import gvBrowse from "@/images/game-verdict/gameverdict-browsegames-filtered.png";
import gvCompare from "@/images/game-verdict/gameverdict-compare.png";
import gvCommunityBoards from "@/images/game-verdict/gameverdict-community-boards.png";
import gvCommunityComposer from "@/images/game-verdict/gameverdict-community-composer.png";
import gvCommunityTeaser from "@/images/game-verdict/gameverdict-community-teaser.png";
import gvCommunityThread from "@/images/game-verdict/gameverdict-community-thread.png";
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

/**
 * `source` is a claim about where the figure came from, so it has to stay true.
 * "live · …" is reserved for values computed at build time from the thing they
 * describe; anything measured by hand is pinned to a version or a date instead.
 * Two figures used to say "live" while being literals — one of them naming an
 * endpoint that does not exist — which is the sort of detail this site is
 * supposed to be careful about.
 */
export type CaseStudyStat = {
  /** The fallback. Used verbatim unless `live` names a figure that resolved. */
  value: string;
  label: string;
  source: string;
  /**
   * Names a figure fetched at build time. When it resolves, it replaces
   * `value` and the source becomes the endpoint it came from; when it does
   * not, `value` and `source` stand as written, so an unreachable API degrades
   * to an honest snapshot rather than a blank or a stale "live" claim.
   */
  live?: "games" | "verdicts";
  /**
   * A public GitHub repository whose commit count replaces `value` at build
   * time. Only set it where the repository is actually public: Game Verdict's
   * is private and answers 404, so its count stays a written snapshot and says
   * so, rather than printing a stale number under the words "GitHub API".
   */
  commitsFrom?: string;
};
export type Row = { k: string; v: string };

export type CaseStudy = {
  lede: string;
  stats: CaseStudyStat[];
  stack: Row[];
  also: Row[];
  body: ReactNode;
};

/* Shared prose primitives. Kept here so every case study reads in one voice. */

/**
 * `dek` is required, not optional, so a section cannot ship without one. The
 * alternative was a test that greps this file for sections missing a summary,
 * which finds the gap a commit later; the type finds it before the build.
 *
 * The dek is one plain sentence, written for a reader who does not know what a
 * cascade layer or a permutation test is. It is not a second version of the
 * prose — it is the answer to "so what", which the prose does not always give
 * up in its first line.
 */
function Section({
  eyebrow,
  title,
  dek,
  children,
}: {
  eyebrow: string;
  title: string;
  dek: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <REyebrow className="block pb-2">{eyebrow}</REyebrow>
      <h2 className="m-0 pb-[10px] font-[family-name:var(--font-display)] text-[1.375rem] font-bold tracking-[-0.028em]">
        {title}
      </h2>
      {/* Always rendered; the `.tldr` class on <html> decides if it is shown.

          An Alert rather than a bare left rule: the rule *was* the pullquote's
          own signature — `border-l-2` in the accent — so a summary and a quote
          pulled from the prose looked identical while meaning opposite things.
          The label is what separates them, and a labeled accent panel is what
          Alert already is.

          The wrapper carries the color so `colorScheme="current"` can inherit
          it; the body drops back to ink, because a whole paragraph in the
          project accent is harder to read than the thing it is summarizing. */}
      <div className="dek">
        <div>
          <div className="pb-3 text-[var(--world,var(--spot))]">
            <Dek>{dek}</Dek>
          </div>
        </div>
      </div>
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
      /* Verdicts leads: games tracked is inventory that was imported, verdicts
         cast is people turning up to settle the argument, which is the whole
         premise. Both are live; the values here are only the fallback. */
      { value: "2,590", label: "Verdicts cast", source: "14 Sept 2026 snapshot", live: "verdicts" },
      { value: "1,757", label: "Games tracked", source: "14 Sept 2026 snapshot", live: "games" },
      /* Counted off `origin/main`. That is NOT this repo's default branch -
         game-verdict releases from `dev` - but `main` is its release line, so
         this counts shipped work rather than whatever `dev` is carrying, and it
         matches how the Roster card counts. No live path for this one: the repo
         is private, so there is nothing for the GitHub reader to reach, which
         makes it the only number on this card that can go stale silently. */
      { value: "974", label: "Commits", source: "14 Sept 2026 snapshot · private repo" },
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
        <Section
          eyebrow="The problem"
          title="Everyone has an opinion, nobody has data"
          dek="Game Verdict is a community-built database where PC players cast verdicts on the best way to play their favorite games. Every data point is a real opinion from a real player, with no algorithms, no review farming, and no editorial bias."
        >
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

        <Section
          eyebrow="The core loop"
          title="Free to vote, hard to fake"
          dek="Voting takes one click and no account, but each browser only counts once; easy to vote, but hard to spam."
        >
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

        <Section
          eyebrow="A small thing I like"
          title="The queue knows what you have played"
          dek="It offers you games you have probably played, and stops offering ones you already answered, even if you never signed up."
        >
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

        <Section
          eyebrow="One sentence, two audiences"
          title="Prose generated from data, not from a model"
          dek="The plain-English verdict on each game page is assembled from the actual vote counts, not written by AI, so it can never invent a number."
        >
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

        <Section
          eyebrow="Then scale arrived"
          title="The bug that froze the front page"
          dek="The homepage counts quietly stopped rising after a thousand votes. Nothing broke or errored, but the number just lingered at 1,000 while it stopped being true. Believable at first, but quickly stood out as time passed."
        >
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

        <Section
          eyebrow="What it cost"
          title="1.8 MB → 50 KB per pageview"
          dek="The browse page used to download the entire game list on every single visit. Now it loads only the games you can actually see and fetches more as you scroll, which costs about a thirtieth as much."
        >
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

        <Section
          eyebrow="Beyond the vote"
          title="Reasons to come back, and somewhere else to be"
          dek="Twenty badges to earn, public profiles, and comment threads on every game where the best replies get voted to the top. A Discord bot covers the rest, so an argument in a group chat gets settled without anyone opening the site."
        >
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
            can&rsquo;t agree on is a better invitation to vote than one that is already settled.
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

        <Section
          eyebrow="The empty room"
          title="Invite-only, on purpose"
          dek="A forum with boards, markdown posts, direct messages, reporting and a moderation queue, opened to a handful of people first so it would have something in it before anyone was invited to look."
        >
          <p>
            Comment threads on game pages were the small version of this. The community hub is the
            large one: four boards, markdown posts with a real formatting toolbar, threaded replies,
            reactions on both, emoji with shortcode typeahead, GIFs, friend requests, and direct
            messages. Replies are voted Reddit-style, so the best answer to &ldquo;is this one
            better on a pad?&rdquo; rises to the top of the game it is about instead of sitting
            wherever it landed chronologically.
          </p>
          <Shot
            press={gvCommunityBoards}
            alt="The Game Verdict community index: four boards down the left with unread badges, and a 'Hot right now' feed showing a pinned welcome post and a thread with an embedded game verdict."
            caption="Four boards, with unread counts and whatever is busiest on the right"
          />
          <p>
            A post can attach a game, which embeds its cover and its live verdict split into the
            thread. That is what makes this the site&rsquo;s forum rather than a forum bolted onto
            it. An argument about Oblivion carries the current breakdown for Oblivion, moving as
            people vote, so the discussion and the data it is arguing about can&rsquo;t drift apart.
            Author names carry the badges you earned voting, so the identity you build casting
            verdicts is the one you turn up with.
          </p>
          <Shot
            press={gvCommunityThread}
            alt="A Game Verdict community thread titled 'Oblivion remastered is such a nostalgia vibe', with the game's cover art and a live KBM verdict bar embedded under the title, moderator actions reading Delete, Pin, Lock and Report, and two replies below, one of them an animated GIF."
            caption="A thread carries the live verdict for the game it is arguing about"
          />
          <p>
            It is invite-only, and that was the plan rather than a limitation. A forum nobody has
            posted in is worse than no forum, so early access went to the most active voters to seed
            real threads before the doors opened. Everyone else gets a warming-up animation and an
            honest note about what it is. Making something feel worth getting into is a nicer
            problem to have than making an empty room look busy.
          </p>
          <Shot
            press={gvCommunityTeaser}
            alt="Game Verdict's community teaser: a chat icon inside a slowly rotating tricolor ring, headed 'The community hub is warming up', with buttons to cast verdicts or sign in, and a note that early access invites go to top voters."
            caption="What everyone else sees, until an invite arrives"
          />
          <p>
            Every post and comment carries a report button with four reasons, alerting mods and
            admins into a queue that gets worked by hand. Moderators pin and lock inline. Deletes
            are soft, so a removed post is still there to look at when someone asks why it went.
            Blocking is mutual and filters the feed rather than just hiding replies. None of that
            was asked for by the fifteen or so accounts currently in there. It exists because the
            first person who needs reporting shows up before the first moderator does, and that is
            not something you can add in a hurry.
          </p>
          <Shot
            press={gvCommunityComposer}
            alt="Writing a post in Game Verdict: a title field, Write and Preview tabs, a markdown formatting toolbar, a body field, and an attached game showing that its live verdict breakdown will be embedded."
            caption="Markdown, a formatting toolbar, and a game attached to the post"
          />
          <p>
            The GIF picker got a harder problem than it deserved. Google shut off the Tenor API on
            30 June 2026, taking GIF support out of Discord, X, WhatsApp and Bluesky with it, and
            Giphy had already moved off free access. GIFs landed here two weeks later on Klipy,
            built by ex-Tenor engineers as a deliberate near-clone of the thing everyone had just
            lost. Rendering is restricted to an allowlist of CDN hosts rather than trusting whatever
            URL ends up in a post, and Tenor&rsquo;s CDN stayed on that list, because its servers
            outlived its API.
          </p>
        </Section>

        {/* Retrospect already uses "The part nobody asked for"; two case
            studies reaching for the same bespoke eyebrow makes neither of
            them sound bespoke. */}
        <Section
          eyebrow="Undocumented"
          title="An easter egg you get to keep"
          dek="Type the old Konami cheat code and controllers rain down the page. It also unlocks a retro CRT screen effect that’s yours to keep, to turn on whenever you want it."
        >
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
    lede: "The component library this site is built out of, with exactly one real customer: me. Six apps, one substrate, published to npm and versioned like the dependency it is, which turns out to be a different engineering problem than shipping one to strangers.",
    stats: [
      {
        value: String(getRosterComponentCount()),
        label: "Components",
        source: "live · package exports",
      },
      {
        /* Matches `git rev-list --count origin/main` after a fetch, which is
           the same count the GitHub API reports and the same thing the live
           path above renders. Not a local working copy, which drifts ahead.
           Last checked 14 Sept 2026. */
        value: "344",
        label: "Commits",
        source: "since Feb 2026",
        commitsFrom: "blakesteve/roster",
      },
      /* Live once the installed Roster carries `dist/meta.json`, which it
         writes from a real `vitest run` at publish. The literal below is the
         fallback for a version published before that existed, and it is dated
         so a stale number cannot pass itself off as a live one. */
      ((meta) =>
        meta
          ? {
              value: meta.tests.toLocaleString("en-US"),
              label: "Tests",
              source: `live · roster @ ${meta.version}`,
            }
          : { value: "1,332", label: "Tests", source: "roster @ 4.11.0" })(
        getRosterMeta(),
      ),
      { value: "6", label: "Apps consuming it", source: "including this one" },
    ],
    stack: [
      { k: "Runtime", v: "React 19" },
      { k: "Language", v: "TypeScript, strict" },
      { k: "Styling", v: "Tailwind CSS v4" },
      { k: "Build", v: "Vite, ES + UMD + d.ts" },
      { k: "A11y", v: "Headless UI + Radix" },
      { k: "Docs", v: "Storybook" },
      { k: "Tests", v: "Vitest + Playwright" },
      { k: "License", v: "MIT" },
    ],
    also: [
      { k: "Atoms", v: `${rosterTiers.atoms} — Button, Input, Tooltip…` },
      { k: "Molecules", v: `${rosterTiers.molecules} — Accordion, EmptyState…` },
      { k: "Organisms", v: `${rosterTiers.organisms} — DataTable, Navbar…` },
      { k: "Ships", v: '"use client" pre-bundled' },
    ],
    body: (
      <>
        <Section
          eyebrow="The problem"
          title="Four apps, four sets of the same button"
          dek="Four of my own apps kept needing the same button, the same input, the same dialog. Building each one four times is how you end up with four slightly different versions of the same thing."
        >
          <p>
            Game Verdict, Retrospect, MegaSquad, and BB&rsquo;s Grove are unrelated products with
            unrelated palettes. What they share is the substrate: a button that handles its own
            loading state, an input that knows how to be wrong, a dialog that traps focus properly.
            Rebuilding that four times is how you end up with four subtly different definitions of
            &ldquo;disabled.&rdquo;
          </p>
          <p>
            I had just finished building a shared component library at work when it became obvious I
            could do the same for myself in a fraction of the time. Roster was never a bid for
            stars. It was a refusal to rebuild the same button on a Saturday.
          </p>
          <p>
            It ships pre-compiled CSS, so a consuming app doesn&rsquo;t need Tailwind installed to use
            it, and it is versioned like the dependency it is.
          </p>
        </Section>

        <Section
          eyebrow="The hard thing"
          title="Theme-aware without being theme-locked"
          dek="The components had to look at home in four apps with four different color schemes, without keeping a separate copy of the code for each one."
        >
          <p>
            A component library that hardcodes its palette is a library you can use exactly once.
            Roster&rsquo;s classes compile down to <Code>var(--roster-*)</Code>, so a consuming app
            repaints every component at once by overriding custom properties. No forks, no wrapper
            components, no <Code>!important</Code>.
          </p>
          <p>
            That claim is easy to make and annoying to prove, so here it is running. Both columns
            below render the same component from the same installed package. The left one is pinned
            to the tokens npm actually ships, read out of <Code>dist/tokens.css</Code> at build time.
            The right one inherits this page&rsquo;s. Flip the production state at the top and watch
            which one moves.
          </p>
          <BothPalettes>
            <RButton size="sm" colorScheme="primary">
              Primary
            </RButton>
            <RButton size="sm" variant="soft" colorScheme="primary">
              Soft
            </RButton>
            <RButton size="sm" variant="outline" colorScheme="primary">
              Outline
            </RButton>
            <RBadge variant="primary">Badge</RBadge>
          </BothPalettes>
          <Pull cite="Why it is inline, not imported">
            The shipped palette is applied as inline styles on a wrapper. Importing tokens.css a
            second time would have put a competing :root block in the cascade and repainted the
            whole site.
          </Pull>
          <p>
            Dark mode is class-based rather than tied to the OS preference, which is what makes a
            manual toggle possible at all, and is why this page can have two production states
            instead of one.
          </p>
        </Section>

        <Section
          eyebrow="Shipping in public"
          title="Two majors in one day, one of them broken"
          dek="I published a release that broke every app that installed it, replaced it hours later, and left the public warning up rather than quietly deleting the evidence."
        >
          <p>
            Roster is on its fourth major. Three of those went out roughly as planned. One did not:
            3.0.0 shipped with <Code>DataTable</Code> exported from the main entry while statically
            importing <Code>@tanstack/react-table</Code>, an optional peer. Every consumer that had
            not installed TanStack, which was most of them, would fail to build on import.
          </p>
          <p>
            4.0.0 went out the same day with <Code>DataTable</Code> moved to its own entry point, and
            3.0.0 was deprecated with a note explaining exactly what was wrong with it. That note is
            still on npm. It seemed more useful there than quietly unpublished.
          </p>
          <ReleaseHistory />
          <Pull cite="The rule I settled on">
            An optional peer dependency that is statically imported is not optional. It is a
            required dependency with a misleading label.
          </Pull>
        </Section>

        <Section
          eyebrow="How it grows"
          title="The library changes when an app hits a wall"
          dek="Necessity breeds innovation. Nothing gets added on a hunch. When one of my apps needs the same piece twice, that’s my signal to move it into the library."
        >
          <p>
            Roster doesn&rsquo;t get planned so much as discovered. Something gets built twice in a
            consuming app, that is the signal, and it moves into the library. This site alone
            produced most of a release:
          </p>
          <p>
            <strong>A CSS class used 26 times became a component.</strong> The small tracked-out
            uppercase label carrying the folio, the prop rows, and the token strip was a hand-rolled{" "}
            <Code>.u</Code> class before anyone asked what it was. A utility class used that often is
            a component nobody has named yet. It is <Code>Eyebrow</Code> now.
          </p>
          <p>
            <strong>A bordered call to action written twice became <Code>RCta</Code>.</strong> Once
            on the contact block, once on a case study sidebar, identical markup both times.
          </p>
          <p>
            <strong>And one gap is still open.</strong> Roster&rsquo;s <Code>Button</Code> is typed
            to <Code>HTMLButtonElement</Code> with no <Code>as</Code> and no <Code>href</Code>, so
            the most common control on a portfolio, a button-shaped thing that navigates, can&rsquo;t be
            built from it. Every workaround is bad: a button with an <Code>onClick</Code> router push
            loses middle-click and the right role, and hand-rolling it is how the two above got
            written twice. It is logged, not fixed.
          </p>
        </Section>

        <Section
          eyebrow="What it costs"
          title="One customer, no cover"
          dek="Roster has exactly one real user right now, and it is me. It is still built like something strangers will depend on: open source, released in numbered versions, and every change has to pass its tests before it can be merged."
        >
          <p>
            A library with one customer is not a smaller version of a library with many. It is a
            different job. There is no roadmap, because there is no one to ask for anything. Nothing
            gets built speculatively, because speculation has no payer. Every feature in Roster
            exists because something I was building stopped and waited for it.
          </p>
          <p>
            One customer <em>for now</em>, though, and it is built as though that won&rsquo;t hold. It
            is MIT licensed and developed in the open, with <Code>CODEOWNERS</Code> on the
            repository, a pull request template nobody gets to skip, and CI that runs the unit
            suite, the Storybook interaction tests and a full build before anything merges. None of
            that is necessary for an audience of one. It is the difference between a library that
            could take a second contributor and one that would have to be rebuilt first.
          </p>
          <p>
            The flip side is that mistakes arrive immediately and personally. A bad major doesn&rsquo;t
            generate issues, it breaks four apps I was going to work on that weekend. That is a
            tighter feedback loop than most libraries get, and it is the only reason a packaging bug
            that had been quietly wrong for months finally got found.
          </p>
          <Pull cite="The part that surprised me">
            Nobody would have noticed if I had quietly unpublished the broken major. That is exactly
            why the tombstone is still there.
          </Pull>
          <p>
            Two things this page deliberately doesn&rsquo;t do: it doesn&rsquo;t list the components, because{" "}
            <Code>/system</Code> reads them live from the installed package along with every token
            ramp and a set of working specimens. And it doesn&rsquo;t walk through the CSS packaging
            failure in detail, because that one earned its own post.
          </p>
          <p>
            What it does instead: press <Code>⌥X</Code> and every Roster component on this page
            outlines itself and says its own name, including the buttons two sections up and the
            breadcrumb you arrived through. The claim and the evidence are the same object.
          </p>
        </Section>
      </>
    ),
  },

  retrospect: {
    lede: "Your Last.fm history against the actual sky. Every scrobble you have ever logged, cross-referenced with real retrogrades, full moons, and eclipses, then held to a standard astrology never asks for.",
    stats: [
      { value: "25", label: "Trials per sweep", source: "5 skies × 5 measures" },
      { value: "2,000", label: "Scrambled skies", source: "per trial" },
      { value: "495k", label: "Scrobbles in the test library", source: "17 years, one account" },
      { value: "$0", label: "Hosting cost", source: "by design" },
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
      { k: "Charts", v: "Sun, moon, rising, computed client-side" },
      { k: "Privacy", v: "Birth data never leaves the browser" },
    ],
    body: (
      <>
        <Section
          eyebrow="The problem"
          title="Astrology never has to be right"
          dek="The familiar astrology claims are never actually checked against anything. Retrospect makes them measurable, by testing each one against a real almanac of the sky and the music you actually played."
        >
          <p>
            &ldquo;Mercury retrograde makes you revisit the past&rdquo; is unfalsifiable as usually
            stated. It is not unfalsifiable in principle, though. You need two things: a record of
            what someone actually did, and a real calendar of when the sky did the thing. A Last.fm
            history is the first. An ephemeris is the second.
          </p>
          <Shot
            press={rsHero}
            alt="Retrospect's landing page: a gold Saturn mark on deep navy, the wordmark, and a single field asking for a Last.fm username."
            caption="One question, one field. The almanac styling is doing real work: this is not a horoscope app."
            priority
          />
          <p>
            Every window is computed, not looked up. Retrograde periods, full moons, and eclipses
            come from planetary positions via <RInlineCode>astronomy-engine</RInlineCode>, down to
            the minute and the zodiac sign. The landing page proves it before you have typed
            anything, by showing what the sky is doing right now and counting down to the next
            event.
          </p>
          <Shot
            press={rsSkyNow}
            alt="Four cards showing current sky events with date ranges and zodiac signs, above a live countdown reading 11 days, 16 hours, 34 minutes to the next full moon."
            caption="Computed from positions, not scraped from a horoscope column"
          />
          <Shot
            press={rsHeroMobile}
            alt="Retrospect's landing page on a phone: the Saturn mark, wordmark, and username field stacked to a narrow screen."
            caption="The same front door on a phone"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="The hard thing"
          title="What if the answer is no?"
          dek="Often the honest answer is that the cosmos didn’t move your listening in any meaningful way, which is a hard thing to hand someone who just waited for half a million songs to load."
        >
          <p>
            The honest version of this app returns a null result most of the time. That is the whole
            premise, and it is also a product problem, because &ldquo;we checked, nothing happened&rdquo;
            is a terrible thing to show someone who just waited for half a million scrobbles to
            sync.
          </p>
          <p>
            Almost everything else in Retrospect exists to answer that. Five skies instead of one.
            Five measures that can be mixed freely. A listening profile that has nothing to do with
            astronomy. If the planets are innocent, there is still something to read.
          </p>
          <Pull cite="The design constraint">
            Astrology is the question. Statistics is the answer. If the sky is innocent, the app has
            to be willing to say so, and still be worth the wait.
          </Pull>
          <p>
            The reveal is paced like a story rather than dropped as a dashboard. Scale first, then
            how often the sky did its thing, then the verdict. Every figure from here on is one real
            library, mine: 17 years and roughly 495,000 scrobbles. Someone else&rsquo;s numbers will
            be different, and that is the entire point of the thing.
          </p>
          <Shot
            press={rsScale}
            alt="A full-screen slide reading: 17 years. 494,589 songs. We read your entire listening diary. Every play, timestamped."
            caption="One idea per screen, before any conclusion is offered"
          />
          <Shot
            press={rsVerdict}
            alt="Retrospect's verdict screen. The question 'Does Mercury retrograde send you running back to old favorites?' answered with a large 'No, just +2%', a grip meter reading 'No measurable grip', and rows of sky and measure options."
            caption="The payoff of a five-screen build-up is a null result, in plain language"
          />
        </Section>

        <Section
          eyebrow="The math"
          title="Rotate the calendar, do not reshuffle it"
          dek="Your result is re-run against two thousand fake skies, each made by sliding the real calendar of events to a random date. Sliding rather than shuffling keeps your weekly and seasonal habits intact, so an effect has to beat plain chance to count."
        >
          <p>
            Any large listening history shows <em>some</em> difference during retrograde, because
            any two arbitrary buckets of days differ. The question is whether the difference beats
            what chance produces on its own.
          </p>
          <p>
            So every claim faces a <strong>circular permutation test</strong>. The real event
            calendar is rotated to 2,000 random offsets against the same listening data, and the
            real effect only counts when it beats the scrambled ones. Rotation matters more than it
            sounds: a plain reshuffle would destroy the structure of both the calendar and the
            listening, and hand back a null that is easy to beat. Rotating preserves seasonality,
            weekly rhythm, and the fact that people listen in streaks. The null keeps the shape of
            your actual life.
          </p>
          <p>
            The seed is fixed, so the same library returns the same p-value every time. A verdict
            that changed on refresh wouldn&rsquo;t be a verdict.
          </p>
          <Shot
            press={rsSkeptic}
            alt="The skeptic's panel: a histogram of 2,000 scrambled skies with the real result marked on it, reading '989 of 2,000 scrambled skies beat yours, p=0.494'."
            caption="989 of 2,000 scrambled skies beat the real one. The pile is chance; the line is you."
          />
          <Shot
            press={rsSkepticMobile}
            alt="The skeptic's panel on a phone, with the same histogram and p-value."
            caption="The nerd numbers survive the trip to a small screen"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="The payoff"
          title="Mercury is innocent. The full moon is not."
          dek="Within my own listening trends, Mercury retrograde was a negligible bump, not high enough to consider an impact. Full moons, it turns out, really do keep me up past midnight."
        >
          <p>
            Mercury retrograde is the famous claim, and the one the whole app is framed around. On
            my library it comes back at 1.02×, which is nothing.
          </p>
          <p>
            So the sweep runs every sky against every measure, 25 trials, and surfaces only what
            survives the scramble test. For me, exactly one did: <strong>Full Moon × Night Owl, an
            iron grip.</strong> Not the claim anyone makes at parties.
          </p>
          <p>
            That result is mine, not a finding about full moons. Another account runs the same 25
            trials and gets its own answer, or more often no answer at all, which is a perfectly
            good outcome and one the app is built to report. The sweep exists precisely because
            there is no way to guess in advance which combination, if any, is yours.
          </p>
          <Shot
            press={rsSweepRun}
            alt="The sweep running, showing 'trial 2 of 25, Mercury Retrograde by Old Flame' in progress."
            caption="25 trials, each one a full permutation test, served and cached individually"
          />
          <Shot
            press={rsSweepResults}
            alt="Sweep results: Full Moon by Night Owl at plus 33 percent marked 'an iron grip', with Mars by Discovery, Venus by Discovery, and Venus by Nostalgia marked 'a lead'."
            caption="One conviction, three leads. The magnifying glass means chance could still fake it."
          />
          <p>
            Opened up, that trial reads: <em>Does a full moon keep you up past midnight? Oh yes,
            +33%.</em> Index 1.33× for me, and the grip meter that sat empty for Mercury lights all four
            bars. Same component, opposite ends of the same scale, which is the point of having a
            grip meter instead of a p-value in the headline.
          </p>
          <Shot
            press={rsVerdictMobile}
            alt="The full moon verdict on a phone: 'Does a full moon keep you up past midnight?' answered 'Oh yes, +33%', with a four-bar grip meter reading 'An iron grip' and index 1.33×."
            caption="The one that survived on my library. Another account gets its own answer, or none."
            frame="phone"
          />
          <p>
            Running 25 tests at p&nbsp;&lt;&nbsp;0.05 means roughly one false positive is expected
            from chance alone, and exactly one conviction came back. Retrospect doesn&rsquo;t correct the
            threshold for that. It labels instead: a conviction survived its scramble test, a lead
            is large but unconfirmed and says so on its face. For a tool whose tagline is
            entertainment with error bars, saying which tier a result lives in seemed more honest
            than a quieter number nobody would read.
          </p>
        </Section>

        <Section
          eyebrow="When the sky is innocent"
          title="Your habits leave fingerprints anyway"
          dek="Even when the planets did nothing, your listening still says plenty: the hour you play most, your longest unbroken streak, your single most nostalgic day."
        >
          <p>
            The listening profile needs no astronomy at all. Archetypes, golden hour, best streak,
            loudest month: all computed from the same timestamps, all there whether or not the
            planets did anything.
          </p>
          <Shot
            press={rsFingerprints}
            alt="Listening fingerprints: Comfort Creature at 66 percent, Crate Digger at 13 percent, Daylight Listener at 2.9 percent, with golden hour, best day, loudest month, and pace."
            caption="Comfort Creature, 66%. Best streak: 1,180 days straight."
          />
          <Shot
            press={rsFingerprintsMobile}
            alt="The same listening fingerprints stacked on a phone screen."
            caption="Dense figures that still hold their shape on a narrow screen"
            frame="phone"
          />
          <p>
            The specifics land harder than the statistics. A retrograde anthem, a single most
            nostalgic day, and NASA&rsquo;s picture of the sky on that exact date.
          </p>
          <Shot
            press={rsAnthem}
            alt="Two cards: a retrograde anthem showing Into Your Eyes by Lucero with album art, and a most nostalgic day of February 7, 2015 with NASA's Astronomy Picture of the Day for that date."
            caption="258 old favorites in one day, and the sky above them that night"
          />
          <p>
            Ambient tracks were the quiet threat to all of this. Rain, static, and sleep playlists
            run for hours unattended, and those plays add up to counts that can dwarf anything you
            actually chose that week, so sleep and noise artists can be excluded in one click. It is
            a data-quality switch wearing a friendly label.
          </p>
          <Shot
            press={rsYearChart}
            alt="A bar chart of scrobbles per year from 2009 to 2026, with thin ochre stripes marking Mercury retrograde periods."
            caption="Every year of listening, with retrograde windows striped over it"
          />
        </Section>

        <Section
          eyebrow="The part nobody asked for"
          title="A loading screen worth waiting through"
          dek="The first load can take quite some time, especially for Last.fm accounts that have many years of listening history, because the music service only hands over so much at a time. That wait got a small solar system to watch instead of a spinner."
        >
          <p>
            The first sync of a large library takes minutes, because Last.fm is rate limited and the
            history is pulled page by page. That wait wasn&rsquo;t going away, so it got a planetary
            system instead of a spinner: planets spawn, orbit, occasionally collide, and explode,
            while the scrobble counter climbs behind them.
          </p>
          <p>
            The sync itself is built for serverless. Each invocation pulls pages for a fixed time
            budget at roughly five requests a second, flushes once at the end, and dedupes on read,
            because new scrobbles landing mid-backfill shift the page boundaries underneath you.
          </p>
          <Clip
            src="/video/retrospect-loading.mp4"
            poster="/video/retrospect-loading-poster.jpg"
            alt="Retrospect's loading screen: planets spawn and orbit a gold sun on a dark field, occasionally colliding and exploding, while a progress bar fills and a scrobble counter climbs beneath the words 'Consulting the ephemeris'."
            caption="The wait, with something to watch. Planets spawn, orbit, and occasionally collide."
          />
        </Section>

        <Section
          eyebrow="What it cost"
          title="Built to cost nothing, on purpose"
          dek="It runs entirely on free tiers, and the storage was chosen so that a sudden rush of visitors can’t produce a surprise bill."
        >
          <p>
            Retrospect runs on Vercel&rsquo;s free tier with Cloudflare R2 for storage. R2 was chosen
            specifically because it has <strong>zero egress fees</strong>, so a read-heavy access
            pattern can&rsquo;t generate a surprise bill, and Vercel Hobby pauses rather than charges when
            limits are hit. Histories are stored as gzipped blobs, so a 500,000-scrobble library is
            about 7 MB and the free tier holds roughly a thousand of them.
          </p>
          <p>
            Birth charts are the one thing that never touches a server. Sun, moon, and rising sign
            are computed in the browser and saved only on that device, because birth date, time, and
            location is a more sensitive payload than anything else the app handles.
          </p>
          <Shot
            press={rsBirthChart}
            alt="The birth chart panel: fields for birth date, local time, UTC offset, and optional coordinates, with a note that everything is computed in the browser."
            caption="Computed client-side and stored locally. The server never sees it."
          />
        </Section>
      </>
    ),
  },

  megasquad: {
    lede: "Multi-sport pick’ems for your friend group. Thirteen leagues across five sports, picks that auto-lock at tip-off, and standings that settle the trash talk. I built the front end; my brother built the API.",
    stats: [
      { value: "13", label: "Leagues supported", source: "five sports, 21 competitions" },
      { value: "284", label: "Games in one season", source: "scored, reconciled, settled" },
      { value: "32", label: "Ways it answers back", source: "13 hits, 12 misses, 7 scoldings" },
      { value: "30 s", label: "Poll interval", source: "idle after 5 min" },
    ],
    stack: [
      { k: "Build", v: "Vite" },
      { k: "Runtime", v: "React 19" },
      { k: "State", v: "Zustand, slice pattern" },
      { k: "Forms", v: "React Hook Form" },
      { k: "Routing", v: "React Router 7" },
      { k: "UI", v: "@blakesteve/roster" },
      { k: "API", v: "Python, my brother's" },
      { k: "Deploy", v: "Vercel" },
    ],
    also: [
      { k: "Leagues", v: "NFL, NBA, MLB, NHL, NCAAM/W/F, WNBA, World Cup" },
      { k: "Squads", v: "Private groups, invites, admin roles" },
      { k: "InnerSquad", v: "The internal ops tool, also mine" },
      { k: "Themes", v: "Full light and dark" },
    ],
    body: (
      <>
        <Section
          eyebrow="The problem"
          title="The group chat is a bad database"
          dek="My brother and I got tired of running our pick’em on a spreadsheet and chasing everyone in the group chat before kickoff. MegaSquad is that job handed to software: picks lock themselves and standings settle themselves."
        >
          <p>
            Run by hand, a pick&rsquo;em is mostly admin. Somebody has to collect everyone&rsquo;s
            picks before kickoff, score them afterwards, and settle it when two people remember the
            same result differently. MegaSquad is that arrangement with a source of truth: squads,
            leagues, weekly picks that lock the moment a game starts, and standings nobody can argue
            with.
          </p>
          <Shot
            press={collapsedLight}
            blueline={collapsedDark}
            alt="A MegaSquad league page: nine members ranked by record with the viewer first at 7-3, beside a This Week panel showing five settled games and four won picks."
            caption="Ten games in. Nine members, and a leader"
            priority
          />
        </Section>

        <Section
          eyebrow="The craft"
          title="Cards become tickets"
          dek="Making picks isn’t a separate screen. The schedule you were reading turns into the thing you fill in. The cards tear along a perforation and stay exactly where they were."
        >
          <p>
            The obvious build is a picking page: leave the schedule, go somewhere else, come back.
            That loses your place and makes choosing feel like paperwork. So picking happens in
            place: the same cards, transformed. A dashed tear line opens down the middle, notches
            punch through both edges, and the card you were reading becomes the ticket you hand in.
          </p>
          <p>
            It only reads as a transformation because nothing moves. An earlier attempt put the
            controls in a right-hand rail, which reserved its width the moment picking started and
            shoved every card sideways, 602px to 422px. The tickets stopped looking like the
            cards becoming something and started looking like a re-render.
          </p>
          <Shot
            press={pickingLight}
            blueline={pickingDark}
            alt="MegaSquad in picking mode: a sticky bar reading 5 of 16 with Cancel and Save Picks, a segmented progress strip showing five team crests, an active slot and ten question marks, and schedule cards rendered as perforated tickets with dashed tear lines, punched notches and lock-in countdowns."
            caption="Picking: the schedule, torn into tickets"
          />
          <p>
            The bar above tracks the week without you counting: a segment per game, a crest for every
            team you&rsquo;ve taken, a question mark for the ones you haven&rsquo;t, and a padlock once a game
            locks. It scrolls horizontally on a phone rather than wrapping, so the
            week stays one line you can read at a glance.
          </p>
          <Shot
            press={pickingMobileLight}
            blueline={pickingMobileDark}
            alt="Picking mode on a phone: the sticky bar and its scrolling crest row above a single column of perforated ticket cards."
            caption="390 pt"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="The hard thing"
          title="Showing you where the season got away from you"
          dek="A win-loss record tells you nothing about where it went wrong, so every row opens into the weeks, with each team you picked badged green for a win and red for a loss."
        >
          <p>
            A record of 181&ndash;103 tells you almost nothing. The interesting question is{" "}
            <em>where</em> it went wrong. So standings expand into a per-week breakdown, and each
            week shows the actual team logos you picked, badged correct or incorrect.
          </p>
          <Pull cite="One season, read at a glance">
            63.7% across 284 games. The playoffs alone go 11 of 13: Wild Card 5 of 6,
            Divisional 3 of 4, Conference 2 of 2, the Super Bowl called. Divisional is the round
            that slipped, and now it has a name.
          </Pull>
          <Shot
            press={expandedLight}
            blueline={expandedDark}
            alt="An expanded MegaSquad standings row at 181-103 and 63.7% correct, opening into per-week results (Super Bowl 1 of 1, Conference 2 of 2, Divisional 3 of 4, Wild Card 5 of 6) with Week 18 open below them, showing sixteen team crests each outlined green for a correct pick or red for a wrong one."
            caption="A season, opened week by week"
          />
          <p>
            None of those numbers are stored twice. The record, the win percentage, the per-week
            tallies, and the completed-game count all derive from the same picks, which is why they
            reconcile exactly, and why they can&rsquo;t drift apart.
          </p>
        </Section>

        <Section
          eyebrow="The delight"
          title="Every settled pick answers back"
          dek="Settled picks talk back, pulling from a set of phrases for a hit and another for a miss, so the same outcome never reads quite the same way twice."
        >
          <p>
            Getting a pick right returns <strong>&ldquo;Bullseye!&rdquo;</strong>, or
            &ldquo;Nailed It!&rdquo;, or &ldquo;A Prophet!&rdquo; Getting one wrong returns
            &ldquo;Narp.&rdquo;, &ldquo;Whiff.&rdquo;, or &ldquo;Gross, dude.&rdquo; State is encoded
            three ways at once (border color, a result pill, and the score), so an entire week reads
            without parsing anything.
          </p>
          <Shot
            press={ncaamLight}
            blueline={ncaamDark}
            alt="MegaSquad's NCAA tournament Round 1 schedule: matchup cards with team logos, seeds, and final scores, each outlined red or green and topped with a result pill: a short phrase of praise for a hit, of commiseration for a miss."
            caption="Round 1, settled"
          />
          <p>
            All three signals survive the narrow layout. The schedule has exactly one breakpoint, so
            every phone width takes the same path: the card stacks, and the pill keeps its place.
          </p>
          <Shot
            press={mobileLight}
            blueline={mobileDark}
            alt="The same NCAA tournament schedule on a phone: matchup cards stacked vertically with the result pill centered above each pair of teams."
            caption="390 pt"
            frame="phone"
          />
          <p>
            When no league is in season, a sleeping squid offers sports trivia instead. It&rsquo;s the
            kind of thing nobody asks for in a spec.
          </p>
          <Shot
            press={squidLight}
            blueline={squidDark}
            alt="MegaSquad's empty state: a cartoon squid asleep, the message “No games found for Week 1, Season 2026,” and a sports trivia card with a Get Another Fact button."
            caption="No league in season"
          />
        </Section>

        <Section
          eyebrow="Working to someone else's contract"
          title="Two languages, one product"
          dek="Half of this app is my brother’s and I can&rsquo;t change it. Building on someone else’s system means behaving like a guest: ask for only what you need, and stop asking once nobody is looking."
        >
          <p>
            The API is my brother&rsquo;s, in Python. That makes the front end a consumer of a
            contract it doesn&rsquo;t control, which is its own discipline: the app polls invitations
            every 30 seconds but stops after five minutes of inactivity, so a tab left open for three
            days isn&rsquo;t quietly hammering his server.
          </p>
        </Section>
      </>
    ),
  },
};
