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
  RLink,
  RPullquote,
} from "@/lib/roster-ui";
import { SPECIMENS_PAGE } from "@/lib/nav";
import {
  ROSTER_APPS,
  getRosterComponentCount,
  getRosterComponents,
  getRosterMeta,
} from "@/lib/roster";
import { REPRINTED_APPS } from "./jobs";


/* Counted from the installed package's own type definitions, so the tier
   breakdown in the Roster sidebar cannot drift from the count in its stat row.
   Both come from the same read. */
const rosterTiers = getRosterComponents().reduce<Record<string, number>>(
  (acc, { tier }) => ({ ...acc, [tier]: (acc[tier] ?? 0) + 1 }),
  {},
);

import brCabinet from "@/images/bragging-rocks/bragging-rocks-cabinet.webp";
import brEdit from "@/images/bragging-rocks/bragging-rocks-edit-mobile.png";
import brNames from "@/images/bragging-rocks/bragging-rocks-names.webp";
import brPass from "@/images/bragging-rocks/bragging-rocks-pass-mobile.png";
import brPhone from "@/images/bragging-rocks/bragging-rocks-table-mobile.png";
import brRock from "@/images/bragging-rocks/bragging-rocks-rock.webp";
import brShelves from "@/images/bragging-rocks/bragging-rocks-what-is-it.webp";
import brWall from "@/images/bragging-rocks/bragging-rocks-wall.webp";

import thContentsDark from "@/images/tehon/tehon-contents-ipad-dark.png";
import thContentsLight from "@/images/tehon/tehon-contents-ipad-light.png";
import thCoverDark from "@/images/tehon/tehon-cover-dark.png";
import thCoverLight from "@/images/tehon/tehon-cover-light.png";
import thHeldDark from "@/images/tehon/tehon-held-line-dark.png";
import thHeldLight from "@/images/tehon/tehon-held-line-light.png";
import thSiteDark from "@/images/tehon/tehon-site-dark.png";
import thSitePageDark from "@/images/tehon/tehon-site-first-page-dark.png";
import thSitePageLight from "@/images/tehon/tehon-site-first-page-light.png";
import thSiteLight from "@/images/tehon/tehon-site-light.png";
import thTodayDark from "@/images/tehon/tehon-today-dark.png";
import thTodayLight from "@/images/tehon/tehon-today-light.png";
import thWatchedDark from "@/images/tehon/tehon-watched-line-mobile-dark.png";
import thWatchedLight from "@/images/tehon/tehon-watched-line-mobile-light.png";

import rsLanding from "@/images/retrospect/retrospect-landing.png";
import rsLandingMobile from "@/images/retrospect/retrospect-landing-mobile.png";
import rsSamples from "@/images/retrospect/retrospect-samples.png";
import rsReveal from "@/images/retrospect/retrospect-reveal-mobile.png";
import rsTonight from "@/images/retrospect/retrospect-tonight.png";
import rsTonightMobile from "@/images/retrospect/retrospect-tonight-mobile.png";
import rsNights from "@/images/retrospect/retrospect-every-night.png";
import rsSky from "@/images/retrospect/retrospect-sky.png";
import rsPairing from "@/images/retrospect/retrospect-pairing-mobile.png";
import rsQuestions from "@/images/retrospect/retrospect-questions.png";
import rsFullMoon from "@/images/retrospect/retrospect-full-moon.png";
import rsFullMoonMobile from "@/images/retrospect/retrospect-full-moon-mobile.png";
import rsHabits from "@/images/retrospect/retrospect-habits.png";
import rsHabitsMobile from "@/images/retrospect/retrospect-habits-mobile.png";
import rsBirthChart from "@/images/retrospect/retrospect-birth-chart-mobile.png";

import ncaamDark from "@/images/megasquad/megasquad-2.0-ncaam-dark.png";
import ncaamLight from "@/images/megasquad/megasquad-2.0-ncaam-light.png";
import decemberDark from "@/images/megasquad/megasquad-2.0-december-dark.png";
import decemberLight from "@/images/megasquad/megasquad-2.0-december-light.png";
import decemberMobileDark from "@/images/megasquad/megasquad-2.0-december-mobile-dark.png";
import decemberMobileLight from "@/images/megasquad/megasquad-2.0-december-mobile-light.png";
import squidDark from "@/images/megasquad/megasquad-2.0-december-squid-dark.png";
import squidLight from "@/images/megasquad/megasquad-2.0-december-squid-light.png";
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
import gvCommunityBoards from "@/images/game-verdict/gameverdict-community-boards.png";
import gvCommunityComposer from "@/images/game-verdict/gameverdict-community-composer.png";
import gvCommunityTeaser from "@/images/game-verdict/gameverdict-community-teaser.png";
import gvCommunityThread from "@/images/game-verdict/gameverdict-community-thread.png";
import gvDiscordCompare from "@/images/game-verdict/gameverdict-discord-compare.png";
import gvDiscordVerdict from "@/images/game-verdict/gameverdict-discord-verdict.png";
import gvDetail from "@/images/game-verdict/gameverdict-gamedetail-herocrop.png";
import gvBadges from "@/images/game-verdict/gameverdict-profile-badgeshelf.png";
import gvQuickVote from "@/images/game-verdict/gameverdict-quickvote-desktop.png";
import gvQuickVoteLibrary from "@/images/game-verdict/gameverdict-quickvote-library.png";
import gvQuickVoteMobile from "@/images/game-verdict/gameverdict-quickvote-mobile.png";
import gvResults from "@/images/game-verdict/gameverdict-resultscard.png";
import gvTie from "@/images/game-verdict/gameverdict-tie.png";
import gvVerdictCard from "@/images/game-verdict/gameverdict-verdictcard.png";
import gvCasting from "@/images/game-verdict/gameverdict-verdictcastingcard.png";
import gvFiveReveal from "@/images/game-verdict/gameverdict-weekly-five-reveal.png";
import gvFiveSealed from "@/images/game-verdict/gameverdict-weekly-five-sealed.png";
import gvFiveSealedMobile from "@/images/game-verdict/gameverdict-weekly-five-sealed-mobile.png";
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
  /** The `also` panel's heading, for a project that hasn't shipped anything. */
  alsoLabel?: string;
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
          <div className="pb-3 text-[var(--world-ink,var(--spot-ink))]">
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
    <RInlineCode colorScheme="current" className="text-[var(--world-ink)]">
      {children}
    </RInlineCode>
  );
}

/** A link inside a paragraph, in the paragraph's own size. */
function StudyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <RLink
      href={href}
      underline="always"
      className="text-[length:inherit] leading-[inherit]"
      {...(href.startsWith("http") ? { external: true, showExternalIcon: false } : {})}
    >
      {children}
    </RLink>
  );
}

export const caseStudies: Record<string, CaseStudy> = {
  "game-verdict": {
    lede: "A crowdsourced answer to an argument PC gamers have been having forever: is this game better with a controller, or with a keyboard and mouse?",
    stats: [
      /* Verdicts leads: games tracked is inventory that was imported, verdicts
         cast is people turning up to settle the argument, which is the whole
         premise. Both are live; the values here are only the fallback. */
      /* api.gameverdict.app/api/stats, read once on 15 Nov 2026 at 09:59 CST. */
      { value: "3,569", label: "Verdicts cast", source: "Nov 2026 snapshot", live: "verdicts" },
      { value: "2,153", label: "Games tracked", source: "Nov 2026 snapshot", live: "games" },
      /* Counted off `origin/main`. That is NOT this repo's default branch -
         game-verdict releases from `dev` - but `main` is its release line, so
         this counts shipped work rather than whatever `dev` is carrying, and it
         matches how the Roster card counts. No live path for this one: the repo
         is private, so there is nothing for the GitHub reader to reach, which
         makes it the only number on this card that can go stale silently. */
      /* `git rev-list --count origin/main` after a fetch: main is dev plus its
         release merges. 1007395. */
      { value: "1,274", label: "Commits", source: "Nov 2026 snapshot · main · private repo" },
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
      { k: "Badges", v: "38 achievements, 7 categories" },
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
            directly, dedupes anonymous votes with a browser fingerprint, and surfaces the leading input method as a community badge. It&rsquo;s the most mature app here.
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
            alt="Game Verdict's Quick Vote screen: a queue counter, a session counter, and a single large card for Counter-Strike 2 with KBM, Both and Controller buttons."
            caption="Quick Vote: one game at a time, no account required"
          />
          <p>
            The one-card-at-a-time shape was built for a phone, and nothing about the loop changes on
            a small screen.
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
            alt="The verdict casting card with Controller chosen and Xbox picked from a row of controller types, above a Submit Verdict button."
            caption="Casting a verdict without leaving the page"
          />
          <Shot
            press={gvResults}
            alt="The results card after a vote: a tricolor bar, a controller types bar, and 29% KBM, 56% Both and 15% Controller from 41 votes."
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
            alt="Quick Vote with a synced Steam library: the top card is TUNIC, tagged 'In your library', with 135 in the queue and 13 skipped."
            caption="Library synced: your own games surface first, tagged in place"
          />
        </Section>

        <Section
          eyebrow="The front page"
          title="The answer stays sealed until you vote"
          dek="Anyone who sees the score first may just agree with it. The home page now offers a themed set of games each week, five at a time, and keeps each result hidden until you've cast your own vote."
        >
          <p>
            A score shown first is a nudge, and a nudge isn&rsquo;t an opinion. So the home page opens on{" "}
            <strong>the Weekly Five</strong>: five games, one at a time. Each card
            keeps its split sealed until you vote. Then it shows where you landed against everyone else,
            and the deck moves on by itself, or when you press Next game.
          </p>
          <Shot
            press={gvFiveSealed}
            alt="Game Verdict's Weekly Five, themed Steam Says Otherwise: game 1 of 5 is Baldur's Gate 3, with KBM, Both and Controller buttons, a Haven't played it link, and no result showing."
            caption="Sealed: vote first, then see the split"
          />
          <Shot
            press={gvFiveReveal}
            alt="The same card after a vote for KBM: 'You're with 64% of players', a bar split 64% KBM, 20% Both and 16% Controller, and a Next game button."
            caption="The split, once you've voted"
          />
          <Shot
            press={gvFiveSealedMobile}
            alt="The home page on a phone: the headline Controller or Keyboard & Mouse?, a search field, and a sealed Weekly Five card for Baldur's Gate 3 that fits on the first screen."
            caption="The same card, on the first screen"
            frame="phone"
          />
          <p>
            The server chooses all of it. The theme is a pure function of the ISO week, in UTC, so
            nothing is picked in the browser and the same games wait for everyone. A theme runs only
            when at least five games fit it. When too few do, the next one in the rotation is tried,
            and Most Contested goes last because it can always be filled.
          </p>
          <p>
            &ldquo;Haven&rsquo;t played it&rdquo; is a full answer, because a guess would be worse than
            no vote. After five, a last card shows what you did and offers five more.
          </p>
        </Section>

        <Section
          eyebrow="One sentence, two audiences"
          title="Prose generated from data, not from a model"
          dek="The plain-English verdict on each game page is assembled from the actual vote counts, not written by AI, so it can never invent a number. When a game is tied, it says so instead of picking a winner."
        >
          <p>
            Every game page ends with a plain-language verdict: how many people voted, which way they
            leaned, and which controller they tend to use. It&rsquo;s written by a{" "}
            <Code>buildVerdictSummary()</Code> function, not by a language model. Four branches, three
            for a leading choice and one for a tie, an extra clause once five people have voted and the
            top two land within ten points of each other, and a controller-subtype sentence that only
            appears once at least two people have reported one.
          </p>
          <p>
            The tie used to be a win. <Code>topChoice()</Code> handed an even split to whichever choice
            came first in line, so keyboard and mouse won every tie it was in. Now a tied
            game has no verdict, and every place that shows one says it&rsquo;s tied.
          </p>
          <Shot
            press={gvTie}
            alt="Stardew Valley's page with a gray Tied badge beside its genres, results of 40% KBM, 20% Both and 40% Controller, and a verdict card also marked Tied."
            caption="Tied at 40%, and marked that way"
          />
          <Shot
            press={gvVerdictCard}
            alt="The Verdict card for Cyberpunk 2077, reading: based on 40 community verdicts, Cyberpunk 2077 works well either way, 55% of players say both inputs feel good, 15% lean controller, and 30% lean keyboard and mouse. Among controller players, Xbox is the most common setup."
            caption="Deterministic prose: same data in, same sentence out"
          />
          <p>
            The same string is also emitted as the <Code>FAQPage</Code> answer in structured data. So
            every game with a verdict, whose page would otherwise be a near-identical template, carries
            unique text answering the literal thing people search for, and the reader and the crawler
            are served by one sentence rather than two systems.
          </p>
          <Pull cite="Why not an LLM">
            No latency, no per-call cost, no hallucinated percentages, and the same input always
            produces the same output. A model would have done this worse, slower, and for money.
          </Pull>
          <p>
            The game&rsquo;s description is a different job, and a model does do that one. Steam&rsquo;s
            page already shows its own text, so a copy of it gives a search engine no reason to send
            anyone here. Claude Haiku rewrites it, and no draft goes up unchecked. It has to keep every number in the original (&ldquo;12-gauge&rdquo; isn&rsquo;t
            &ldquo;a dozen&rdquo;), it can&rsquo;t pad the text out, and a second, stronger model goes
            through it claim by claim and fails it if Steam&rsquo;s text doesn&rsquo;t back one up. If
            three drafts in a row fail, none of them is used, and a game with no rewrite shows the
            original.
          </p>
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
            alt="Game Verdict's browse page filtered to games whose verdict is Both, on Windows, sorted by Most Contested: 20 of 160 games, with verdict badges and vote counts."
            caption="Browse: filtering, sorting and counting all happen in SQL"
          />
        </Section>

        <Section
          eyebrow="Beyond the vote"
          title="Reasons to come back, and somewhere else to be"
          dek="Thirty-eight badges to earn, public profiles, and comment threads on every game where the best replies get voted to the top. A Discord bot covers the rest, so an argument in a group chat gets settled without anyone opening the site."
        >
          <p>
            Thirty-eight badges across seven categories are evaluated after every verdict, reaction,
            and library change, with the first unlock arriving as a toast. Profiles are public, with a
            verdict history and an input-method tendency bar you can click to filter.
          </p>
          <Shot
            press={gvBadges}
            alt="A public Game Verdict profile with a shelf of 20 earned badges, above a row of contested games from the member's library."
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
        </Section>

        <Section
          eyebrow="The empty room"
          title="Invite-only, on purpose"
          dek="A forum with boards, markdown posts, direct messages, reporting and a moderation queue, opened to a handful of people first so it would have something in it before anyone was invited to look. Friends can start a private board of their own."
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
            alt="The Game Verdict community index: a Start a crew panel and four boards down the left, two marked new, and a 'Hot right now' feed with a pinned welcome post and threads carrying live verdicts."
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
            alt="A community thread titled 'Oblivion Remastered: I keep switching mid-dungeon', with the game and its live Controller verdict embedded under the title, and three replies below, one quoting another."
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
            A <strong>crew</strong> is the smaller room: a private board for a group of friends, run by
            whoever started it. One person can start up to ten, and each holds up to 50 people, members
            and pending invites together. Accepting an invite doesn&rsquo;t need early access, and it
            opens that crew and nothing else in the hub. A block in either direction stops an invite,
            and moderators see a crew&rsquo;s posts only when one is reported.
          </p>
          <p>
            Every post and comment carries a report button with four reasons, alerting mods and
            admins into a queue that gets worked by hand. Moderators pin and lock inline. Deletes
            are soft, so a removed post is still there to look at when someone asks why it went.
            Blocking is mutual and filters the feed rather than just hiding replies. None of that
            was asked for. It exists because the first person who needs reporting shows up before the
            first moderator does, and that is not something you can add in a hurry.
          </p>
          <Shot
            press={gvCommunityComposer}
            alt="Writing a post in Game Verdict: a title, Write and Preview tabs, a markdown toolbar, a body, and The Witcher 3 attached so its live verdict will be embedded."
            caption="Markdown, a formatting toolbar, and a game attached to the post"
          />
          <p>
            The GIF picker got a harder problem than it deserved. Google shut off the Tenor API in
            June 2026, taking GIF support out of Discord, X, WhatsApp and Bluesky with it, and
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
            It also lives in Settings, on the same page as the Steam library import, which is where an easter egg
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
    lede: `The component library this site is built out of, with exactly one real customer: me. ${ROSTER_APPS.words[0].toUpperCase()}${ROSTER_APPS.words.slice(1)} apps, one substrate, published to npm and versioned like the dependency it is, which turns out to be a different engineering problem than shipping one to strangers.`,
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
           Last checked 15 Nov 2026, at 8fd068d. */
        value: "411",
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
          : { value: "3,135", label: "Tests", source: "roster @ 5.23.0" })(
        getRosterMeta(),
      ),
      { value: String(ROSTER_APPS.count), label: "Apps consuming it", source: "including this one" },
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
          dek="The components had to look at home in apps with different color schemes, without keeping a separate copy of the code for each one."
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
            It goes further than two columns.{" "}
            <RLink
              href={SPECIMENS_PAGE.href}
              underline="always"
              className="text-[length:inherit] leading-[inherit]"
            >
              {SPECIMENS_PAGE.label}
            </RLink>{" "}
            reprints the same sheet in the palettes of {REPRINTED_APPS.words} of the apps Roster runs
            in, and since 5.19.0 an app can do that to a part of a page on its own. <Code>data-roster-scope</Code> on any
            element makes Roster&rsquo;s derived colors work themselves out again from the palette
            inside it, where before they were worked out once, at the top of the page.
          </p>
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
            Roster is on its fifth major. Four of those went out roughly as planned. One did not:
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
            <strong>A button-shaped link gets the button&rsquo;s classes.</strong> Roster&rsquo;s{" "}
            <Code>Button</Code> is typed to <Code>HTMLButtonElement</Code>, as of 5.23.0, and the most
            common control on a portfolio is a button-shaped thing that navigates. A button with an{" "}
            <Code>onClick</Code> router push loses middle-click and the right role, and hand-rolling
            the link is how the two above got written twice. So the library exports{" "}
            <Code>buttonVariants</Code>, the same classes to put on a real link.
          </p>
        </Section>

        <Section
          eyebrow="How it spreads"
          title="Building it isn't adopting it"
          dek="A component nobody imports hasn't fixed anything. So three of the apps now run a lint rule: hand-write a button the library already has, and the check fails."
        >
          <p>
            Publishing a component doesn&rsquo;t put it in an app. The library had the button for
            months while apps beside it went on writing their own: a native <Code>button</Code>, or a
            link wearing a button&rsquo;s classes. Nothing was wrong with either one. They just
            weren&rsquo;t the library, so they couldn&rsquo;t get a fix it shipped.
          </p>
          <p>
            So the rule moved out of my head and into the check. Three of the {ROSTER_APPS.words} run it:{" "}
            <StudyLink href="/work/game-verdict">Game Verdict</StudyLink>,{" "}
            <StudyLink href="/work/megasquad">MegaSquad</StudyLink>, and{" "}
            <StudyLink href="https://tehon.app">Tehon&rsquo;s site</StudyLink>, which had it from its
            first commit. It refuses a
            native <Code>button</Code>, and any link whose classes hand-write one: a solid fill, or
            rounded corners with padding and an edge or a fill. Classes kept in a constant hide from a
            check that reads strings, so a link styled from one fails too. The files older than the rule
            are on a list, each with its reason, and nothing is added to it.
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
            generate issues, it breaks {ROSTER_APPS.words} apps I was going to work on that weekend. That is a
            tighter feedback loop than most libraries get, and it is the only reason a packaging bug
            that had been quietly wrong for months finally got found.
          </p>
          <Pull cite="The part that surprised me">
            Nobody would have noticed if I had quietly unpublished the broken major. That is exactly
            why the tombstone is still there.
          </Pull>
          <p>
            Two things this page deliberately doesn&rsquo;t do: it doesn&rsquo;t list the components, because{" "}
            <RLink
              href={SPECIMENS_PAGE.href}
              underline="always"
              className="text-[length:inherit] leading-[inherit]"
            >
              {SPECIMENS_PAGE.label}
            </RLink>{" "}
            reads them live from the installed package along with every token
            ramp, and reprints itself in the palettes of {REPRINTED_APPS.words} of the apps Roster
            runs in. And it doesn&rsquo;t walk through the CSS packaging
            failure in detail, because that one earned its own post.
          </p>
          <p>
            What it does instead: press <Code>⌥X</Code> and every Roster component on this page
            outlines itself and says its own name, including the buttons under The hard thing and the
            nav you arrived through. The claim and the evidence are the same object.
          </p>
        </Section>
      </>
    ),
  },

  retrospect: {
    lede: "Your Last.fm history against the actual sky. Every song you’ve played, set against the real planets, moons, solar storms and eclipses of that night, then held to a standard astrology never asks for.",
    stats: [
      { value: "12", label: "Questions, the same for everyone", source: "corrected for asking 12" },
      { value: "7.1%", label: "Fake histories given a false yes", source: "1,000 with no sky in them" },
      { value: "500k", label: "Plays in my history", source: "since October 2009, one account" },
      { value: "$0", label: "Egress fees on storage", source: "Cloudflare R2, by design" },
    ],
    stack: [
      { k: "Framework", v: "Next.js 16" },
      { k: "Ephemeris", v: "astronomy-engine" },
      { k: "Source", v: "Last.fm API" },
      { k: "Space data", v: "NASA and JPL, no key" },
      { k: "Storage", v: "Cloudflare R2" },
      { k: "Hosting", v: "Vercel Pro" },
    ],
    also: [
      { k: "Questions", v: "Mercury, Venus, Mars, the Moon, the Sun" },
      { k: "Views", v: "Tonight, Every night, Sky" },
      { k: "Charts", v: "A birth chart, computed in the browser" },
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
            press={rsLanding}
            alt="Retrospect's landing page: a gold Saturn mark on deep navy, the headline 'Every song has a sky.', a field asking for a Last.fm username, and below it NASA's photo of Earth with the Moon's shadow over Texas during the April 2024 eclipse."
            caption="One field, and a real night underneath it: the 2024 eclipse, seen from a million miles out"
            priority
          />
          <p>
            Every planetary window is computed, not looked up. Retrogrades, full moons and the signs the
            planets sit in come from planetary positions via{" "}
            <RInlineCode>astronomy-engine</RInlineCode>. Solar storms, flares and photos come from
            NASA, and asteroid flybys from JPL. Below the field, the landing page shows the goods on a
            made-up listener&rsquo;s history: a sample song&rsquo;s sky, a sample night, tonight, and a
            sample set of answers.
          </p>
          <Shot
            press={rsSamples}
            alt="The four samples on Retrospect's landing page: a song's sky, a solar eclipse over Aquarius by Boards of Canada; a solar storm night in May 2024 under an aurora; tonight's wheel of planets; and twelve answers in four jars, 6 No, 3 Not clearly, 2 Too early and 1 Maybe."
            caption="Four samples to open, on a made-up listener's history"
          />
          <Shot
            press={rsLandingMobile}
            alt="Retrospect's landing page on a phone: the Saturn mark, the headline, and the username field stacked on a narrow screen."
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
            The honest version of this app answers no most of the time. That is the whole
            premise, and it is also a product problem, because &ldquo;we checked, nothing happened&rdquo;
            is a terrible thing to show someone who just waited for half a million plays to sync.
          </p>
          <p>
            So the first visit is paced like a story rather than dropped as a dashboard. Four
            screens: the scale of your history against the sky, your wildest night, the song with
            the strangest sky, and only then the answers. Every listening figure from here on is one
            real history, mine, as it stood in October 2026: 500,413 plays since October 2009,
            through 216 times Venus changed
            sign and 201 solar storms. Someone else&rsquo;s numbers will be different, and that is the
            entire point of the thing.
          </p>
          <Pull cite="The design constraint">
            Astrology is the question. Statistics is the answer. If the sky is innocent, the app has
            to be willing to say so, and still be worth the wait.
          </Pull>
          <p>
            My wildest night, by the sky, was the total solar eclipse of April 2024. I played 80
            songs. A usual Monday is 79. The last screen sorts the answers to twelve fixed
            questions, explained below, into jars. Mine came back zero Yes, three Maybe, two Not
            clearly and seven No.
          </p>
          <Shot
            press={rsReveal}
            alt="The last screen of the first visit on a phone: 'So, does the sky move you?' above five jars reading 0 Yes, 3 Maybe, 2 Not clearly, 7 No and 0 Too early, then 'Mostly no. Here's exactly how, and the three maybes.'"
            caption="The payoff of the build-up is mostly no, said plainly · October 2026"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="What it is"
          title="Tonight, every night, and the whole sky"
          dek="Three views of the same history: tonight’s real sky and what it has meant for you before, a calendar of every night you’ve listened, and a wheel you can turn through all of it."
        >
          <p>
            <strong>Tonight</strong> opens on the sky right now and lines it up with your own
            answers. On October 4 that was Venus, retrograde until November 13, and what Venus
            retrograde had looked like in my listening so far. <strong>Every night</strong> is a calendar of
            every night you&rsquo;ve listened, filterable down to the storm nights, the flare
            nights, the eclipses and the full moons. <strong>Sky</strong> is a wheel of the planets
            with a timeline of all your years under it.
          </p>
          <Shot
            press={rsTonight}
            alt="Retrospect's Tonight view: a Sunday night's date over a wheel of tonight's planets, then 'Tonight, for you' with rows for Venus retrograde marked Maybe, Venus in detriment marked Not clearly, and a solar storm marked Maybe."
            caption="Tonight's real sky, and how this listener's listening went under skies like it · October 2026"
          />
          <Shot
            press={rsNights}
            alt="The Every night view: filter chips for all nights, 243 storm nights, 132 X-flare nights, 76 eclipses and full moons, above a calendar of September 2026 where each night carries its moon phase."
            caption="Every night since 2009, each one a door · October 2026"
          />
          <Shot
            press={rsSky}
            alt="The Sky view: a large zodiac wheel with tonight's planets and the date in its center, above a timeline of plays since 2009 with markers for events along it."
            caption="Sixteen years on one timeline, and a wheel that turns with it · October 2026"
          />
          <p>
            Anything you open, whether a song, a night, a planet or one of the questions, opens as
            a sheet with its own address. A link to <RInlineCode>?q=fullmoon</RInlineCode> opens on
            that answer. A link that lands in a chat unfurls into a share card drawn from the
            answers already stored, never recomputed, so the card can&rsquo;t say something the page
            doesn&rsquo;t.
          </p>
          <p>
            Compare puts two listeners&rsquo; answers to the same twelve questions side by side, and
            stops there. The old version named one of them the more sky-ruled listener. That ranked
            two people on results that were mostly chance, so there is no winner and no score.
          </p>
          <Shot
            press={rsTonightMobile}
            alt="The Tonight view on a phone: the three view tabs, the night's date, the wheel of tonight's sky, and the first row of 'Tonight, for you'."
            caption="Built for a phone first · October 2026"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="The rule"
          title="Facts are free, claims are earned"
          dek="The app can tell you anything that’s simply true about the sky the night you first played a song. Only the twelve questions are allowed to say the sky changed what you played."
        >
          <p>
            One rule governs every line of copy. A pairing is a dated fact: I first played Twilight
            by Elliott Smith at 4:04 on a Wednesday afternoon in August 2012, under a full moon, with Mercury
            retrograde. I&rsquo;ve played it 148 times since. That is all true, and none of it says
            the moon did anything.
          </p>
          <p>
            Every pairing that touches a question links to it, in the same words every time:
            &ldquo;Coincidence or pattern?&rdquo; and which of the twelve has the answer, or needs
            more nights to give one. The fun stays, and the claim goes where it can be checked.
          </p>
          <Shot
            press={rsPairing}
            alt="A song sheet on a phone for Twilight: the night's space weather, NASA's picture of that day, 'You've played it 148 times since.', and a link reading 'Coincidence or pattern? Question 1, on Mercury retrograde, has the answer.'"
            caption="A fact, and a pointer to where the claim would be tested · October 2026"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="The math"
          title="Twelve questions, asked the same way for everyone"
          dek="Every result is re-run against two thousand fake skies, made by sliding the real calendar of events to random dates. There are twelve fixed questions, and the bar for a yes accounts for asking twelve at once."
        >
          <p>
            Any large listening history shows <em>some</em> difference during retrograde, because
            any two arbitrary buckets of days differ. The question is whether the difference beats
            what chance produces on its own.
          </p>
          <p>
            So every question is checked against fake skies, a <strong>circular permutation
            test</strong>. The real calendar of events is slid to 2,000 random start dates against
            the same listening, and the real result only counts when it beats most of them. Sliding
            matters more than it sounds: a plain reshuffle scrambles both the calendar and the
            listening, and hands back a version of chance that is easy to beat. Sliding keeps
            seasons, weekly rhythm and the streaks people listen in. The fake skies keep the shape
            of your actual life.
          </p>
          <p>
            The random slides are fixed per listener, per question and per version of the engine,
            so the same history gets the same answer every time. They&rsquo;re drawn as fractions
            of the history&rsquo;s length, so a new day of plays shifts them only slightly instead of
            drawing a fresh set.
          </p>
          <p>
            The twelve are fixed and the same for everyone. Each gets one word. <strong>Yes</strong> needs two things: it has to
            survive a correction for asking twelve questions at once (Benjamini-Hochberg, at 10%,
            for anyone checking), and chance alone has to produce a swing that big less than one time in twenty.{" "}
            <strong>Maybe</strong> is under one in ten, <strong>Not clearly</strong> is under about
            one in three, and anything weaker is <strong>No</strong>. Fewer than six events, or
            fewer than 500 plays inside them, is <strong>Too early</strong>. The size and direction of a
            swing go in the sentence, never in the word.
          </p>
          <Shot
            press={rsQuestions}
            alt="A grid of the twelve questions with their words: Mercury retrograde No, Full moon Maybe, New moon No, Venus at home No, Strong Moon No, Venus and Mars No, Solar storms Maybe, Big flares No, Mars in water Not clearly, Venus in detriment Not clearly, Venus retrograde Maybe, Mars retrograde No."
            caption="The same twelve for every listener. None of mine came back Yes · October 2026"
          />
        </Section>

        <Section
          eyebrow="The full moon"
          title="The one finding, asked again"
          dek="The previous version of Retrospect told me full moons kept me up late. Asked again with the correction, the swing is still there, but chance makes one that big too often to call it real."
        >
          <p>
            The previous version of Retrospect didn&rsquo;t have twelve questions. It had a sweep: five
            skies against five measures, 25 combinations, each with its own scramble test. On my
            history exactly one cleared the usual bar, a full moon keeping me up past midnight, at
            +33%. The app called it <em>an iron grip</em>.
          </p>
          <p>
            The old write-up of it named the catch: run 25 tests at the usual bar and about one
            false positive is expected from chance alone, and one came back. It chose to label
            results by strength rather than correct for that. The grip meter measured how big a
            swing was. Whether it was real rested on a single test that knew nothing about the
            other 24.
          </p>
          <p>
            The redesign asks the full moon once, in a fixed question, with the correction. It
            answers <strong>Maybe</strong>. Across 208 full moons, about a 40%
            bigger share of my plays came after midnight, so the swing held up. The evidence
            didn&rsquo;t: chance alone produces a swing that big about one time in eleven, and
            once the other eleven questions are allowed for, it isn&rsquo;t close to the bar for a
            yes. The likely
            range runs from 6% smaller to 108% bigger, which includes no effect at all.
          </p>
          <Shot
            press={rsFullMoon}
            alt="The full moon question sheet: 'Does a full moon change how late you listen?' answered Maybe, with 'a 40% bigger share of your plays came after midnight, which could be chance', a bar sitting at 'Could be chance', a range from 6% smaller to 108% bigger, 208 full moons, and the math: p = 0.091 from 2,000 shuffled skies, adjusted p 0.37."
            caption="The swing survived. The evidence for it didn't · October 2026"
          />
          <p>
            The method got better, and the one striking finding didn&rsquo;t survive it.
          </p>
          <Shot
            press={rsFullMoonMobile}
            alt="The same full moon question on a phone, reading Maybe with the chance bar and the range."
            caption="Plain words first. The p-value is behind a switch · October 2026"
            frame="phone"
          />
        </Section>

        <Section
          eyebrow="The proof"
          title="A thousand listeners with no sky in them"
          dek="To check the new bar, the app is run on a thousand made-up histories where the sky does nothing, and on two thousand more that are too young to say much. Fewer than one in ten get a false yes."
        >
          <p>
            The correction is only as good as its false alarms, so the repo tests it directly.{" "}
            <RInlineCode>npm run null-test</RInlineCode> builds 1,000 synthetic listening histories
            with no sky effect in them at all, runs all twelve questions on each, and counts how
            many get any Yes.
          </p>
          <p>
            On the current code it was 71 of 1,000, or 7.1%, against a ceiling of 13%: the 10% the
            correction aims for, plus room for chance. Without the correction, 385 of those 1,000
            histories, 38.5%, had at least one question that cleared the usual bar by chance. That
            is the failure the correction exists for: ask twelve questions of a sky that does
            nothing, and four histories in ten turn up something that looks real.
          </p>
          <p>
            Those thousand all run to about four years or more, and someone who joined Last.fm last
            spring is a different case: their history often has nothing to test yet. So the
            run adds two thousand younger ones, 500 in each of four bands from three months
            to just under five years, each band held to the same 13% among the histories that had
            anything tested. The worst of the four came to 9.6%, and the older thousand came to the
            same 71.
          </p>
          <p>
            The full run is in CI too, on every pull request that touches the engine or the answer
            rule, and every Monday. A quicker version, 100 smaller histories with a looser ceiling,
            runs with every other test,
            and it also checks that the same histories would break that ceiling without the
            correction. Drop the correction and the build goes red, which is what &ldquo;it
            can&rsquo;t happen again&rdquo; means here: not a promise, a check.
          </p>
        </Section>

        <Section
          eyebrow="When the sky is innocent"
          title="Your habits leave fingerprints anyway"
          dek="Even when the planets did nothing, your listening still says plenty: the hours you play most, the day of the week you lean on, your longest unbroken streak."
        >
          <p>
            The listening profile needs no astronomy at all, and it says so in its own subtitle:
            &ldquo;Not the sky.&rdquo; Archetypes, golden hour, the day you lean on, loudest month,
            pace and best streak, all computed from the same timestamps, all there whether or not
            the planets did anything.
          </p>
          <Shot
            press={rsHabits}
            alt="Your habits: Comfort Creature at 66 percent, Crate Digger at 13 percent, Daylight Listener at 2 percent after midnight, then golden hour 3 to 5 p.m., Fridays, December, 81 a day with a best streak of 715 days, above a bar chart of plays by hour."
            caption="Comfort Creature: 66% of my plays are songs I already knew · October 2026"
          />
          <Shot
            press={rsHabitsMobile}
            alt="The same listening habits stacked on a phone screen."
            caption="Dense figures that still hold their shape on a narrow screen · October 2026"
            frame="phone"
          />
          <p>
            Sleep sounds were the quiet threat to all of this. Rain, white noise and ASMR tracks
            run for hours unattended, and those plays add up to counts that can dwarf anything you
            actually chose that week. The previous version made filtering them a switch. Now they&rsquo;re left
            out of every measure automatically, because a data-quality fix shouldn&rsquo;t depend on
            someone finding the toggle.
          </p>
        </Section>

        <Section
          eyebrow="The part nobody asked for"
          title="A loading screen worth waiting through"
          dek="The first load can take quite some time, especially for Last.fm accounts that have many years of listening history, because the music service only hands over so much at a time. That wait got a small solar system to watch instead of a spinner."
        >
          <p>
            The first sync of a large history takes minutes, because Last.fm is rate limited and the
            history is pulled page by page. That wait wasn&rsquo;t going away, so it got a planetary
            system instead of a spinner. Every planet is a year of your history recovered so far:
            they spawn, orbit, occasionally collide and explode, while the count climbs underneath
            and the copy keeps you company (&ldquo;Mercury has never once hurried.&rdquo;).
          </p>
          <p>
            The sync is built for short server calls. Each one pulls pages for eight seconds, four
            at a time with a quarter-second pause between batches, to stay polite to Last.fm. It
            saves once at the end, because every save rewrites the stored history. And it throws
            out duplicates when reading, because new plays arriving mid-download shift which songs
            land on which page.
          </p>
          <Clip
            src="/video/retrospect-loading.mp4"
            poster="/video/retrospect-loading-poster.jpg"
            alt="Retrospect's loading screen: planets spawn and orbit a gold sun on a dark field, occasionally colliding, above the words 'Reading your sky…', a line of playful copy, and a progress bar with a count of scrobbles climbing toward half a million as it reaches back through the years."
            caption="The production screen, replayed with simulated progress so nothing had to re-sync"
          />
        </Section>

        <Section
          eyebrow="What it costs"
          title="Storage with no egress fees"
          dek="Every listening history lives in Cloudflare R2, which charges nothing for data leaving it, so reading a history back out of storage never carries an egress fee."
        >
          <p>
            Retrospect runs on Vercel with Cloudflare R2 for storage. R2 was chosen specifically
            because it has <strong>zero egress fees</strong>: pulling a stored history back out of
            storage carries no transfer charge, however many people come to look. Two daily jobs do the housekeeping: one fills and refreshes
            NASA&rsquo;s data, the other deletes any history nobody has looked at in 90 days. None of
            the NASA or JPL sources need a key.
          </p>
          <p>
            Birth charts are the one thing that never touches a server. The chart is a sheet on the
            Sky view: Sun, Moon, Mercury, Venus and Mars at the minute you were born, and a rising
            sign if you add a place, worked out in the browser and saved only on that device. Birth
            date, time and place are a more sensitive payload than anything else the app handles.
          </p>
          <Shot
            press={rsBirthChart}
            alt="The birth chart sheet on a phone: fields for birth date, local time, the birthplace's UTC offset and optional coordinates, with a note that everything is computed in the browser and saved only on the device."
            caption="Computed in the browser and stored there. The server never sees it."
            frame="phone"
          />
        </Section>
      </>
    ),
  },

  megasquad: {
    lede: "Multi-sport pick’ems for your friend group. Fourteen leagues across five sports, picks that auto-lock at tip-off, and standings that settle the trash talk. I built the front end; my brother built the API.",
    stats: [
      { value: "14", label: "Leagues supported", source: "five sports, 22 competitions" },
      { value: "285", label: "Games in one season", source: "scored, reconciled, settled" },
      /* mega-squad's `playfulStrings.ts` on main, 97ad31d, 24 Nov 2026: 13 hits
         and 12 misses all year, 8 Halloween and 8 Christmas lines that stand in
         for them in their month, and 7 scoldings. Commented-out lines aren't counted. */
      { value: "48", label: "Ways it answers back", source: "25 all year, 16 seasonal, 7 scoldings" },
      { value: "0", label: "Deploys to change season", source: "the date decides, in Central time" },
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
            with. It&rsquo;s the oldest app here.
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
            alt="MegaSquad in picking mode: a sticky bar reading 5 of 16 with Cancel and Save Picks, a segmented progress strip showing five team crests, an active slot and ten question marks, and schedule cards rendered as perforated tickets with dashed tear lines, punched notches and lock-in countdowns, a confidence tray under each pick made."
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
            A record of 182&ndash;103 tells you almost nothing. The interesting question is{" "}
            <em>where</em> it went wrong. So standings expand into a per-week breakdown, and each
            week shows the actual team logos you picked, badged correct or incorrect.
          </p>
          <Pull cite="One season, read at a glance">
            63.9% across 285 games. The playoffs alone go 11 of 13: Wild Card 5 of 6,
            Divisional 3 of 4, Conference 2 of 2, the Super Bowl called. Divisional is the round
            that slipped, and now it has a name.
          </Pull>
          <Shot
            press={expandedLight}
            blueline={expandedDark}
            alt="An expanded MegaSquad standings row at 182-103 and 63.9% correct, opening into per-week results (Super Bowl 1 of 1, Conference 2 of 2, Divisional 3 of 4, Wild Card 5 of 6) with Week 18 open below them, showing sixteen team crests each outlined green for a correct pick or red for a wrong one."
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
        </Section>

        <Section
          eyebrow="By the calendar"
          title="December moves nothing"
          dek="In October and December the app dresses for the season, and nobody deploys anything. The rule was that no box may change size or position, no color may get harder to read, and nothing may take a tap."
        >
          <p>
            A costume is easy to add and easy to regret. So the rules came first, and the date is the
            only switch: <Code>seasonFor(date)</Code> reads the month in Central time, and a month that
            isn&rsquo;t a season has none of this, not even the files. October is
            Halloween and December is Christmas, with no release to make it so and none to undo it.
          </p>
          <p>
            What a season brings is a tint at night, a tentacle along the nav, a scene behind the page
            head, hats on the MegaSquid, and its own result lines. What it can&rsquo;t touch is the longer
            list. Every tinted gray was solved to the luminance of the one it stands in for, so no pair
            of colors loses contrast. Marigold still means you owe picks, and red and green still mean
            lost and won. The art doesn&rsquo;t move, and it never takes a tap.
          </p>
          <Shot
            press={decemberLight}
            blueline={decemberDark}
            alt="MegaSquad's schedule in December: a snowy tentacle strung with lights along the nav, a goalpost and a moon behind the page head with the MegaSquid asleep on the crossbar in a Santa hat, and settled games carrying the season's own result lines, Naughty among them."
            caption="December, on the schedule"
          />
          <Shot
            press={decemberMobileLight}
            blueline={decemberMobileDark}
            alt="December on a phone, in another week: the tentacle curls around the header, the MegaSquid sleeps in its hat on the crossbar and again beside a notice that the week is locked, and two games with no picks on them stack below."
            caption="390 pt"
            frame="phone"
          />
          <p>
            The empty state belongs here, because even the MegaSquid dresses. When there are no games to
            show, the MegaSquid sleeps through it beside some sports trivia, and in December it
            sleeps in the hat.
          </p>
          <Shot
            press={squidLight}
            blueline={squidDark}
            alt="MegaSquad's empty state in December: the MegaSquid, a cartoon squid, asleep in a Santa hat, above the message “No games found for Week 2, Season 2026,” and a sports trivia card with a Get Another Fact button."
            caption="No games to show, so the MegaSquid sleeps in its hat"
          />
        </Section>

        <Section
          eyebrow="Working to someone else's contract"
          title="Send only what you changed"
          dek="Half of this app is my brother's, and I can't change it. A settings page that sent everything back when one switch moved could undo something his server had just done, so now each switch sends only itself."
        >
          <p>
            The API is my brother&rsquo;s, in Python, so the front end works to a contract it
            doesn&rsquo;t control. What I do control is what I send it.
          </p>
          <p>
            The settings page is where that mattered. Moving any switch sent the whole preferences
            object back. A tab
            left open since before an email bounced still believed email was on, so the next unrelated
            switch turned it back on and wiped the reason his server had recorded for turning it off.
            So each switch sends
            its own field now. The email one sends
            both of its contact flags together, because the server only drops someone from its list
            when a single request says both are off.
          </p>
        </Section>
      </>
    ),
  },

  "bragging-rocks": {
    lede: "A community where rock collectors around the world show off their collections. Each member keeps a cabinet, and each week the hosts set a theme and everyone may bring one rock to the table. Ask what a rock is, and the other members can help identify it.",
    stats: [
      /* Its GitHub releases, read 24 Nov 2026. */
      { value: "31", label: "Releases", source: "0.1.0 to 0.25.0, since October 2026" },
      { value: "0", label: "Location data in photos", source: "redrawn, then read back twice" },
      { value: "3", label: "Seals name a rock", source: "and over two thirds agree" },
      { value: "142 ms", label: "Hero paint", source: "production build, 4x throttle" },
    ],
    stack: [
      { k: "Framework", v: "Next.js 16, App Router" },
      { k: "Runtime", v: "React 19" },
      { k: "Data", v: "Supabase Postgres, 29 migrations" },
      { k: "Sign-in", v: "Emailed code or Google" },
      { k: "Photos", v: "Cloudflare R2, sharp" },
      { k: "UI", v: "@blakesteve/roster" },
      { k: "Tests", v: "Vitest, Playwright, PGlite" },
      { k: "Deploy", v: "Vercel, staged by GitHub Actions" },
    ],
    also: [
      { k: "Words", v: "In catalogs, never typed into a view" },
      { k: "Checks", v: "A pseudo-locale renders every view" },
      { k: "Bundle", v: "Nine rules on what ships to a browser" },
      { k: "Bell", v: "Love, comments, friends and names" },
    ],
    body: (
      <>
        <Section
          eyebrow="The idea"
          title="A table, not a feed"
          dek="A feed scrolls a rock away and rewards whoever posts most. This gives each member a cabinet that stays put, and one weekly table that everyone brings a single rock to."
        >
          <p>
            A feed rewards whoever posts most. A table doesn&rsquo;t. Each member keeps a cabinet of
            their rocks, and each week the hosts set a theme and everyone may bring one. One rock
            means choosing: you go through the cabinet and decide which rock answers the week.
          </p>
          <Shot
            press={brCabinet}
            alt="Blake B's cabinet: a printed landscape with the cabinet's name on a slip and a carved BB seal, a count of 8 rocks and 0 countries, since every origin is kept private, then all eight on printed tiles: Megalodon Tooth, Shamu, Smooth Labrador, mustard crackle, Malachi, Robin egg, Tigereye cicada and The beach."
            caption="My own cabinet"
            priority
          />
          <Shot
            press={brWall}
            alt="A week's table as a member sees it: six rocks on printed tiles, each with its name and a carved red seal of its owner's initials. Malachi, a polished green malachite, comes first, marked Yours, with its owner's words about it. Then Shamu, marked Friend, then Robin egg, Megalodon Tooth, Smooth Labrador and Tigereye cicada."
            caption="My rocks, shared out among invented members"
          />
          <p>
            There are no follower counts here, nothing trending, no streaks and no points. A wall is
            ordered by who you are to it, your own rock first and your friends&rsquo; next, and never
            by how many people pressed something.
          </p>
        </Section>

        <Section
          eyebrow="The hard thing"
          title="Midnight, wherever you are"
          dek="A week ends at midnight, wherever you are. That isn’t one moment but a day of them, and the rules have to hold for everyone the whole way through."
        >
          <p>
            A week runs from Monday to Monday, and it ends at your own midnight. Someone in Auckland
            and someone in Honolulu reach that midnight nearly a day apart, so &ldquo;this week&rdquo;
            is a question about the member and not about the server&rsquo;s clock. A week counts as
            past once it has ended everywhere. A member who moves zones keeps their current week and
            changes at the later of the two midnights, so nobody lands in a week that&rsquo;s already
            over for them.
          </p>
          <p>
            One rock per person per week is a primary key on the theme and the member, so the database
            refuses a second one whatever the app does. The close is the server&rsquo;s job, because
            it depends on the member&rsquo;s zone. And what the public sees never reads a zone or a
            time at all: a wall&rsquo;s order is a place number, so nothing on a table says when
            someone was awake.
          </p>
        </Section>

        <Section
          eyebrow="What is it?"
          title="Three seals name a rock"
          dek="Members ask what a rock is and others say what they think, and why. A name goes on it only when at least three agree and they're more than two thirds of everyone who answered, and it comes off again if that stops being true."
        >
          <p>
            A member who doesn&rsquo;t know what they have can ask. The others suggest a name from a
            list, or write one in, and say why. Each suggestion is a seal on the rock, and three
            seals that agree put the name on it, as long as they&rsquo;re over two thirds of the
            answers that count. A suggestion counts once the member behind it has been around for 14
            days. The owner&rsquo;s own doesn&rsquo;t count. They set a label instead, and the members
            who got it right are credited for it.
          </p>
          <p>
            None of it is stored as a verdict. The rule is worked out every time someone looks, so a
            name that stops being true comes off by itself, and nobody has to take it down.
            A near miss like agate and quartz is named as kin and never counted together.
          </p>
          <Shot
            press={brNames}
            alt="Smooth Labrador's page, with its photo of a polished gray stone flashing blue and gold at the edge, reading 'Community ID: labradorite, 3 of 4 agree', with plagioclase as its scientific name. Under What members think, labradorite has three carved seals with each member's reason, feldspar has one, and a line says labradorite is a kind of feldspar but they count as two names."
            caption="My labradorite, with invented members naming it"
          />
          <p>
            The questions wait on shelves sorted by what they need: nobody&rsquo;s looked yet, getting
            close, still split, lately named. Not by which rock is liked. And because a rock&rsquo;s scientific
            name is sometimes two names, an entry can list up to four, joined by &ldquo;or&rdquo; when
            it&rsquo;s either and &ldquo;and&rdquo; when it&rsquo;s a blend, with a formula borrowed
            from the nearest parent in the list that has one.
          </p>
          <Shot
            press={brShelves}
            alt="The What is it? page: a printed landscape, the line 'Rocks their owners can't place. Know one? Say what you think, and why.', and a shelf titled No one's looked yet with three rocks, The beach, Robin egg and mustard crackle, each asking what it is."
            caption="Three of mine, still asking"
          />
        </Section>

        <Section
          eyebrow="Privacy"
          title="Nothing travels with the photo"
          dek="A photo from a phone can carry the exact spot it was taken, and here a member decides how much of a rock's origin anyone sees. So every photo is redrawn from its pixels, then checked again."
        >
          <p>
            A member decides how much of where a rock is from anyone sees, and a phone photo can quietly
            overrule that with GPS. So the server doesn&rsquo;t clean metadata out of a file. It decodes
            the upload to raw pixels and encodes every version from those, which leaves nothing to
            carry a location over.
          </p>
          <Shot
            press={brEdit}
            frame="phone"
            alt="Editing Malachi on a phone: Bought it, the year 2022, then Where it's from, with Keep it private chosen over Country only, Region and The exact place. A note says the exact place is never shown unless it's picked."
            caption="How much of a rock's origin to share, its owner's choice"
          />
          <p>
            Then it doesn&rsquo;t trust that. Every file the server writes is read back through two
            separate readers and refused if it has EXIF, XMP or IPTC in it, and that check sits inside
            the server&rsquo;s storage writer, so none of its code can step around it. A lint rule and a source
            scan refuse the image library&rsquo;s calls that keep metadata, and the test fixtures embed
            fake GPS on purpose.
          </p>
          <Pull cite="The rule behind it">
            It&rsquo;s a stronger promise to have nothing to remove than to remember to remove it.
          </Pull>
          <p>
            The far end is the same idea. Photos are served from <Code>photos.bragging.rocks</Code>,
            where Cloudflare keeps each one for a week. So when one is taken down, or its rock or
            its account is deleted, the files go first and then Cloudflare&rsquo;s copies of it are
            purged by their exact addresses. A deletion that only reached the bucket would leave a
            photo up for days at an address somebody already has.
          </p>
        </Section>

        <Section
          eyebrow="Holding it to its word"
          title="A privacy page that can fail the build"
          dek="A privacy page is a list of claims about the code, and code changes. Tests pin what the page says to what the app does, so one can't move without the other."
        >
          <p>
            Privacy pages go stale quietly, because nothing connects the sentence to the code. Here
            34 tests at release 0.25.0 pin the page&rsquo;s facts to the code they describe: what
            analytics runs, how a photo is redrawn, how long a sign-in code lasts. Change one of those
            and the suite fails until
            the page says the new truth, so a true page can&rsquo;t drift false without anyone being
            told.
          </p>
        </Section>

        <Section
          eyebrow="Shipping"
          title="Staged, then promoted"
          dek="A release is built and tested on production's own setup before anyone can see it, then promoted and checked again, so a bad build fails where nobody is looking."
        >
          <p>
            Merging a change doesn&rsquo;t reach production by itself. A merge runs a light set of
            checks, migrates staging, deploys it and smoke-tests it. A release migrates production,
            builds it staged with no domain, smoke-tests that, promotes it, then smoke-tests the live
            site and checks it&rsquo;s serving that exact build. Release 0.25.0 passed
            36 of 36 checks staged and 37 of 37 live, a real round trip through photo storage among
            them.
          </p>
          <p>
            Migrations run before promotion, so the build still live has to work with the new schema.
            That one fact means every migration is written to add rather than replace.
          </p>
        </Section>

        <Section
          eyebrow="The look"
          title="Printed, not filtered"
          dek="The site looks block printed, with edges a hand-cut block didn't quite hold. Those edges are drawn as real shapes, because the easy way looked different in one browser."
        >
          <p>
            Buttons, photos and slips all have a printed edge, a rectangle that a hand-cut block
            didn&rsquo;t quite hold. The first version used a displacement filter, and WebKit drew it
            straight once a mask was stretched. So the tremor is now a seeded outline in the mask
            itself, one unit to one CSS pixel and never stretched, in two corner layers. Both engines
            draw the same edge.
          </p>
          <Shot
            press={brRock}
            alt="Malachi's page: a printed photo of a banded green malachite beside its name, its owner's carved seal, 'Labeled as malachite by the owner', its chemical formula, the story 'My first malachite', and its origin, kept private. Below, more from the same cabinet: Megalodon Tooth, Shamu and Smooth Labrador."
            caption="Malachi's page. It's my rock"
          />
          <Shot
            press={brPhone}
            frame="phone"
            alt="An invented week on a phone: a printed landscape with a made-up theme on a slip, its prompt, a block printed Bring a rock button, and a count of 6 rocks from 5 countries."
            caption="A week on a phone, its theme, dates and counts invented"
          />
          <p>
            The landscapes are generated too, seeded and drawn on the server, and a bundle check keeps
            the generator out of the browser. It&rsquo;s the biggest thing on the page, and it
            paints in 142 ms, the median of five traces of a production build in Chromium at 4x CPU
            throttling.
          </p>
        </Section>

        <Section
          eyebrow="Between members"
          title="Nothing here keeps score"
          dek="Love a rock, comment on it, help put a name to it. Each of those is something you do for its owner, and none of them adds up to a rank."
        >
          <p>
            A rock shows how many people love it, and its owner sees who. Comments go one reply deep.
            Friends are mutual, by request, and known to the two of them alone. A rock can be passed
            round the table, one at a time, from the wall. And a cabinet keeps a list of the rocks its
            owner helped name, which is as close as this gets to a trophy.
          </p>
          <Shot
            press={brPass}
            frame="phone"
            alt="A rock passed round the table on a phone: Robin egg, 3 of 6 at the table, with its photo, its owner's seal and words, Love, Open its page and Report, and at the bottom Back and Pass it on, which names the next rock, Megalodon Tooth."
            caption="My rock, passed round by invented members"
          />
          <p>
            None of those add up. There&rsquo;s no score to climb, no place to hold on to and nothing
            to lose by going quiet for a month.
          </p>
        </Section>
      </>
    ),
  },

  tehon: {
    lede: "An app for practicing written Japanese: a page a day, each stroke graded as it ends against the model it copies. It’s coming soon to iPhone, iPad and Android and isn’t out yet. Nine of its twelve build steps are done.",
    stats: [
      /* A development build: ROADMAP step 3, Part A (461b4fe), "120 frames a
         second of 120 Hz, 5 dropped of 463". It says "the Pixel", and the README
         names the one this app is tested on. The prototype's 119.9 is another
         measurement, so the study doesn't print it. */
      { value: "120 fps", label: "Ink on a 120 Hz phone", source: "Pixel 9 Pro, 120 Hz" },
      { value: "25 ms", label: "Opening a year's notebook", source: "Pixel, cold, median; was 495" },
      { value: "2,843", label: "Tests", source: "CI at 14ef879, Nov 2026 snapshot" },
      { value: "9 of 12", label: "Build steps done", source: "Nov 2026 snapshot" },
    ],
    stack: [
      { k: "Framework", v: "Expo 58, expo-router" },
      { k: "Runtime", v: "React Native 0.88, React 19" },
      { k: "Ink", v: "Skia, Reanimated, Gesture Handler" },
      { k: "Storage", v: "expo-sqlite" },
      { k: "Tests", v: "Jest" },
      { k: "CI", v: "GitHub Actions" },
      { k: "UI", v: "Its own, no Roster" },
      { k: "Site", v: "Next.js, static, with Roster" },
    ],
    alsoLabel: "So far",
    also: [
      { k: "Status", v: "Coming soon. Not on a store yet" },
      { k: "Writes", v: "Hiragana, katakana, 35 kanji" },
      { k: "Content", v: "96 words, 12 patterns, 11 particles" },
      { k: "Stroke models", v: "KanjiVG, by Ulrich Apel, CC BY-SA 3.0" },
    ],
    body: (
      <>
        <Section
          eyebrow="The question"
          title="Is ink in React Native good enough?"
          dek="Writing Japanese on a phone only works if the ink keeps up with your finger. Before building anything, I built a small prototype to find out whether it could, and measured it on three devices."
        >
          <p>
            Everything about this app depends on one feeling: ink that keeps up with your hand. If it
            lags, you stop writing and start waiting. So it began as a prototype called fude{" "}
            <span lang="ja">筆</span> that asked one question: does drawing ink in React Native feel
            good enough to build a Japanese handwriting app on? If it didn&rsquo;t, the alternative was
            to build the app natively.
          </p>
          <p>
            I wrote the 46 base hiragana on three devices, in Expo Go, and read the numbers. The Pixel 9 Pro
            kept up with its 120 Hz screen and missed about 1 frame in 400. The iPhone 12
            Pro held about 60 on its 60 Hz screen. The iPad Pro 9.7, on a chip from 2016, held 57.3 of its
            60. So the answer was yes.
          </p>
          <Shot
            press={thTodayLight}
            blueline={thTodayDark}
            frame="phone"
            alt="Tehon's page for the day on a phone, from a sample notebook: Lesson 44, page No. 303, line 1 waiting with empty boxes under 'One of those, please.', then four handed-in lines of Japanese with a red circle around each box that was right."
            caption="A day's page in a sample notebook"
            priority
          />
        </Section>

        <Section
          eyebrow="The hard thing"
          title="Ink that React never sees"
          dek="If every touch went through the app's normal update cycle, the ink would lag behind your finger. So the drawing happens on its own fast path, and the app hears about a stroke only once it ends."
        >
          <p>
            Touch samples go from the gesture handler to a Skia path in worklets on the UI thread.
            React doesn&rsquo;t see anything until the stroke ends, which is when it gets graded.
            That keeps React out of the way of the ink, and it means the interesting bugs live below
            where React&rsquo;s tools can see.
          </p>
          <Shot
            press={thWatchedLight}
            blueline={thWatchedDark}
            frame="phone"
            alt="A watched line in Tehon on a phone: the model あ above a row of five boxes, and on the large pad the third stroke of あ partway drawn, with 'Stroke 2: right.' under it."
            caption="With the model: the third stroke, still being drawn"
          />
          <p>
            Checking the debug overlay against the device&rsquo;s own logs caught three of its numbers
            misreading on the Pixel. And on iOS a finger&rsquo;s
            first 10 to 27 points of travel went unsampled, so a stroke began after it had really
            started. Sampling the raw touches fixed that. On the iPad, the second sample now arrives
            108 ms after the finger lands, where it had taken 242.
          </p>
        </Section>

        <Section
          eyebrow="The grader"
          title="Taught by a real hand"
          dek="The first grader was too strict: it passed 19 of 47 of my own honest tries. Loosening it was easy. Loosening it without letting a single planted mistake through took real handwriting on both sides of the line."
        >
          <p>
            The app already knows which character you&rsquo;re writing, so this isn&rsquo;t handwriting
            recognition. Each stroke is checked against KanjiVG&rsquo;s reference for direction, shape,
            placement, size and order as it ends. The first limits came from synthetic
            strokes, and real handwriting doesn&rsquo;t look like those: they passed 19 of 47 on the iPhone with a finger, and 16 of 46 on the iPad with the Pencil.
          </p>
          <p>
            So I wrote the 46 hiragana as I&rsquo;d really write them, at the size of a
            held line&rsquo;s box, and 13 mistakes on purpose on each device, one of which came out right and
            counts as a try. Loosened to fit the honest
            tries, the grader passes 28 of 47 on the iPhone and 24 of 46 on the iPad. All 25 planted
            mistakes are still wrong, in both. At about twice those tolerances,{" "}
            <span lang="ja">め</span> written for <span lang="ja">ぬ</span> would pass on one of them,
            and <span lang="ja">わ</span> for <span lang="ja">れ</span> and{" "}
            <span lang="ja">さ</span> for <span lang="ja">ち</span> on the other, so that&rsquo;s the
            line.
          </p>
          <p>
            About half of what&rsquo;s left to miss is a stroke order other than the taught one, which
            is the app disagreeing with my habits rather than failing to read them. And the particles
            it reads for one kind of line go wrong the safe way. It has never mistaken one particle for
            another, in either device&rsquo;s session. It just says none, and on the iPhone it reads{" "}
            <span lang="ja">は</span> as itself three times in five, where it was once.
          </p>
          <p>
            The limits are data, and every attempt keeps the set that graded it. So the next hand can
            teach the next set without changing a verdict already given.
          </p>
        </Section>

        <Section
          eyebrow="Held lines"
          title="Silent until you hand it in"
          dek="A line you write from memory gets no marks while you write. The result comes after, and if you disagree with it you can say so. The notebook keeps both answers."
        >
          <p>
            In a watched line the model is in front of you and each stroke is answered as it ends. In a
            held line there&rsquo;s no model and no answer. The grader runs as always, and only the ink
            shows: no note, no tool and no pad that depends on a grade, because a pad that behaved
            differently after a bad stroke would be a hint. There is one hint you can ask for, and a
            box you used it on is never counted as right.
          </p>
          <p>
            Hand it in and every box has its result, with the reason beside a wrong one. If you think
            it&rsquo;s wrong, press <strong>I wrote it right</strong>. The box is right from then on,
            everywhere, and you can undo it until you leave the result. Each of those is a record of
            its own, beside the grader&rsquo;s verdict rather than in place of it, so nothing anyone
            said about the box is lost.
          </p>
          <Shot
            press={thHeldLight}
            blueline={thHeldDark}
            frame="phone"
            alt="A held line's result in Tehon on a phone: 'It's sushi.', 1 of 2 boxes right. し is circled in red. す is uncircled, with the reason 'Stroke 1. Drawn the wrong way: start at the other end.' and an 'I wrote it right' button."
            caption="Handed in: a reason beside the wrong box, and a way to disagree"
          />
        </Section>

        <Section
          eyebrow="The architecture"
          title="Two things are hard to change"
          dek="Everything the app shows about your progress is worked out from a log of what you wrote. That made opening a year's notebook slow, half a second on a phone, until the app learned to remember what it had already worked out."
        >
          <p>
            The notebook is a log. Records are never updated or deleted, and database triggers refuse
            every attempt to. Everything shown about progress is derived from that log, so the rules
            for what counts can change later and the app just reworks it. Only two things
            can&rsquo;t change without migrating people&rsquo;s notebooks: the log&rsquo;s shape and the
            stroke encoding, which packs each sample into 6 or 7 bytes, 6.43 on my real strokes.
          </p>
          <p>
            Deriving everything has a price. On the Pixel&rsquo;s release build, opening a sample year
            took a median of 495 ms cold, so the app now keeps the last answer it worked out, and the
            same open is 25 ms. But an open just after a hand-in was 594 ms, since each hand-in changes
            what had been kept. Now the new work is folded in rather than rebuilt, and that open is 77 ms.
            Those are medians on a Pixel 9 Pro, over a year of synthetic writing.
          </p>
        </Section>

        <Section
          eyebrow="The book"
          title="One object, two places"
          dek="The app is a practice book, with a cover, a spine and numbered pages. Its site is the same book: the cover opens onto today's page, and privacy and support are pages further in."
        >
          <p>
            <span lang="ja">手本</span>, tehon, means the model you copy, and the app is built as
            the book you copy it into. A cover you write your name on, a spine, pages that count up from
            No. 1, and a seal that lands when a day is done.
          </p>
          <Shot
            press={thCoverLight}
            blueline={thCoverDark}
            frame="phone"
            alt="Tehon's cover on a phone: a label with 手本 in two boxes, 手 circled in red, TEHON · 練習帳 and an empty name line, above 'This is your practice book.' and an Open the book button."
            caption="The cover, before you sign it"
          />
          <p>
            tehon.app is that book again. It&rsquo;s a static site, and the cover is the first thing on
            it, name field and all. Opening it turns to today&rsquo;s page. The privacy policy and
            support are later pages, and the back cover closes every one. The mark and the stroke
            models come from the app&rsquo;s own files, so the two can&rsquo;t drift into different
            books.
          </p>
          <Shot
            press={thSiteLight}
            blueline={thSiteDark}
            alt="tehon.app's cover on a desktop: a green book with a label reading 手本, 手 circled in red, a field for your name and an Open the book button, beside 'A practice book for writing Japanese by hand.'"
            caption="tehon.app opens on the cover"
          />
          <Shot
            press={thSitePageLight}
            blueline={thSitePageDark}
            alt="tehon.app's first page: a ruled sheet with a name line, No. 1 and the date. Line 1 says what the app does beside 手本 with 手 circled, and line 2, 'Stroke by stroke', has an empty box that writes あ as you scroll."
            caption="Open the book and it turns to today's page"
          />
        </Section>

        <Section
          eyebrow="Where it stands"
          title="Nine steps of twelve"
          dek="Writing, reviewing, kanji, words, lessons and two quiet sounds are in. Three build steps are left before a beta. It's coming soon to both stores, and there's nothing to download yet."
        >
          <p>
            Nine of the twelve steps are done: the log, the look, watched and held lines, the particle
            check, the stroke data, the content, the book itself and its contents page. The tenth is
            under way. It gives a learner&rsquo;s own hand a page of its own, and postcards come next.
            Then racing your own ghost, and the way to take a notebook out and bring it back.
          </p>
          <Shot
            press={thContentsLight}
            blueline={thContentsDark}
            alt="Tehon's contents on an iPad: a grid of lessons 1 to 4 across with the fifth running off the edge, and rows for kana, pattern, particle, words, kanji, and listening and reading. Each tile is marked with a dot."
            caption="The contents page, on an iPad"
          />
          <p>
            After that is a beta on both platforms. Stroke order and models come from KanjiVG, by Ulrich
            Apel, under CC BY-SA 3.0.
          </p>
        </Section>
      </>
    ),
  },
};
