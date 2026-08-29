import type { ReactNode } from "react";
import { REyebrow, RInlineCode, RPullquote } from "@/lib/roster-ui";
import { Dek } from "@/components/dek";
import { Shot } from "@/components/shot";
import gvEgressJune from "@/images/game-verdict/gameverdict-egress-june-2026.png";
import gvEgressAugust from "@/images/game-verdict/gameverdict-egress-august-2026.png";

/**
 * Posts, as content modules rather than MDX.
 *
 * Same shape as the case studies, and for the same reason: a post can then use
 * the site's own components instead of a parallel set of markdown styles. The
 * pullquotes and inline code here are the real Roster components, so they
 * repigment with the state and show up under X-ray like everything else.
 *
 * No reading-time estimate. It would have to be typed by hand, since the body
 * is JSX rather than text, and a hand-typed "4 min read" is exactly the kind of
 * number this site keeps refusing to print.
 */

export type Post = {
  slug: string;
  title: string;
  /** The standfirst. One sentence, does the work of a subtitle. */
  dek: string;
  /** `YYYY-MM-DD`. */
  date: string;
  tags: string[];
  body: ReactNode;
};

function P({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 pb-4 text-[1.0625rem] leading-[1.68] text-ink-soft">{children}</p>
  );
}

/**
 * `dek` is required here for the same reason it is on a case study Section: a
 * heading without a plain-language summary is a hole in the TL;DR lens, and the
 * type finds it before the build rather than a reader finding it after.
 */
function H({
  eyebrow,
  dek,
  children,
}: {
  eyebrow: string;
  dek: string;
  children: ReactNode;
}) {
  return (
    <div className="pb-3 pt-7">
      <REyebrow tone="primary">{eyebrow}</REyebrow>
      <h2 className="m-0 pt-2 font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
        {children}
      </h2>
      <div className="dek">
        <div>
          {/* No `--world` on a post, so this falls back to the site spot. */}
          <div className="pt-3 text-[var(--world,var(--spot))]">
            <Dek>{dek}</Dek>
          </div>
        </div>
      </div>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="m-0 mb-4 overflow-x-auto rounded-[3px] border border-rule bg-panel px-4 py-3 font-[family-name:var(--font-util)] text-[12px] leading-[1.6] text-ink">
      <code>{children}</code>
    </pre>
  );
}

export const posts: Post[] = [
  {
    slug: "a-component-library-should-not-reset-your-document",
    title: "A component library has no business resetting your document",
    dek: "Three interlocking CSS bugs, one default nobody warns you about, and the reason it stayed invisible in my own Storybook.",
    date: "2026-08-14",
    tags: ["CSS", "Design systems", "Tailwind"],
    body: (
      <>
        <P>
          I maintain a component library that four of my own apps depend on and
          nobody else has a stake in. That makes me both the author and the
          person who finds out what shipping it actually costs. For a while,
          what it cost was a slow drip of styling bugs I could not account for.
        </P>
        <P>
          A button had a permanent border that no rule explained. A row of
          avatars lost its spacing when a wrapper was added.{" "}
          <RInlineCode>aspect-video</RInlineCode> silently did nothing. Every one
          of these looked like a bug in the consuming app. Every one of them was
          Roster.
        </P>

        <H
          eyebrow="The root cause"
          dek="The standard way to package a component library quietly bundles the entire styling framework inside it, so every app that installs it gets a second, competing copy."
        >
          The default path ships everything
        </H>
        <P>
          The compiled stylesheet was 100KB, which is a lot for forty
          components. Inside it was an entire Tailwind build: preflight, the
          theme layer, and every utility the library touched, all unlayered, all
          landing in the consuming app at whatever specificity they felt like.
        </P>
        <P>
          That was not a decision so much as a default. Point Vite&rsquo;s
          library mode at a CSS entry containing{" "}
          <RInlineCode>@import &quot;tailwindcss&quot;</RInlineCode> and it
          compiles the framework into your <RInlineCode>dist</RInlineCode>. The
          granular entrypoints that let you take only the parts you need —{" "}
          <RInlineCode>tailwindcss/theme.css</RInlineCode>,{" "}
          <RInlineCode>tailwindcss/utilities.css</RInlineCode> — exist and are
          documented, but nothing steers you toward them, and every library
          setup guide I had read did exactly what I did.
        </P>
        <P>
          What kept it alive is that the bug is invisible from the inside. In
          Storybook, the library <em>is</em> the app, so a bundled Tailwind
          build is simply correct there: preflight is doing its job, the
          utilities resolve, everything looks right. The failure only exists
          where the library meets an app that already has its own Tailwind,
          which is the one arrangement a component library&rsquo;s own tooling
          never reproduces.
        </P>
        <P>Three separate failures came out of that one default.</P>
        <P>
          <strong className="font-semibold text-ink">The reset.</strong>{" "}
          Preflight sets <RInlineCode>* {"{ margin: 0; padding: 0; border: 0 solid }"}</RInlineCode>.
          Unlayered, that outranks any layered utility. So the library&rsquo;s
          own padding and border utilities were being erased by the library&rsquo;s
          own reset. That was the permanent border: a button whose{" "}
          <RInlineCode>padding-left</RInlineCode> measured 0px no matter what
          the class list said.
        </P>
        <P>
          <strong className="font-semibold text-ink">The variables.</strong>{" "}
          Tailwind&rsquo;s utilities coordinate through{" "}
          <RInlineCode>--tw-*</RInlineCode> custom properties. Two copies of
          Tailwind in one document means two sets of those, and the second one
          to load wins. That was <RInlineCode>aspect-video</RInlineCode> doing
          nothing: the app set the variable, the library reset it.
        </P>
        <P>
          <strong className="font-semibold text-ink">The order.</strong> With
          everything unlayered, whether the library won or lost came down to
          import order in a file most consumers never think about.
        </P>

        <RPullquote cite="The tell I kept ignoring">
          Import order was load-bearing, which is another way of saying nobody
          had decided anything.
        </RPullquote>

        <H
          eyebrow="The fix"
          dek="Stop shipping a reset that rewrites the host app’s page, put the library’s styles in a labeled bucket the browser knows how to rank, and let colors be swapped from outside instead of baked in."
        >
          Three changes, none of them clever
        </H>
        <P>
          <strong className="font-semibold text-ink">Preflight became opt-in.</strong>{" "}
          It ships from its own entry point now. If your app runs Tailwind you
          already have a reset and you import nothing; if it does not, you ask
          for one explicitly.
        </P>
        <P>
          <strong className="font-semibold text-ink">
            Everything got wrapped in a cascade layer.
          </strong>{" "}
          The library imports Tailwind&rsquo;s theme and utilities inside{" "}
          <RInlineCode>@layer roster</RInlineCode>, and declares the full order
          up front:
        </P>
        <Code>{`@layer roster-preflight, theme, base, components, roster, utilities;`}</Code>
        <P>
          Layers are ranked by first declaration, not by specificity, so this
          one line settles every fight in advance. The library sits above{" "}
          <RInlineCode>base</RInlineCode>, so a host preflight cannot erase its
          spacing. It sits below <RInlineCode>utilities</RInlineCode>, so the
          app&rsquo;s own classes still win. Import order stopped mattering,
          which is the actual goal.
        </P>
        <P>
          <strong className="font-semibold text-ink">Tokens moved to</strong>{" "}
          <RInlineCode>@theme inline</RInlineCode>, so the library&rsquo;s
          utilities compile to{" "}
          <RInlineCode>var(--roster-primary-500, #0f6498)</RInlineCode> rather
          than to a hex. A consuming app can then repigment the whole library by
          redefining custom properties it already controls.
        </P>

        <H
          eyebrow="The part I got wrong twice"
          dek="Every automated test passed while the site was visibly broken in a browser, twice — the tests were checking the wrong layer, and I shipped on their word."
        >
          Green tests are not the same as a working page
        </H>
        <P>
          After dropping preflight, all 514 tests passed. Every component also
          rendered in Times New Roman with bulleted lists, which was an
          unpleasant surprise when I checked Storybook.
        </P>
        <P>
          The fix for <em>that</em> collapsed{" "}
          <RInlineCode>space-x-*</RInlineCode> spacing, and the suite stayed
          green through that too. Unit tests assert behavior and class names.
          Neither regression touched either one.
        </P>
        <RPullquote cite="The part worth keeping" colorScheme="amber">
          A test suite that cannot see the page will happily certify a page
          nobody can read.
        </RPullquote>
        <P>
          There is a version of this post where I claim I designed the layer
          order from first principles. What actually happened: I shipped a
          broken major version with bad advice attached, &ldquo;import the
          library before Tailwind,&rdquo; verified against a single class that
          happened to pass for unrelated reasons. The layer declaration exists
          because I got it wrong in a way a more careful check would have
          caught.
        </P>

        <H
          eyebrow="What I would tell you"
          dek="The short version for anyone shipping styles other people install: do not redecorate their page, make the ordering explicit, leave the colors swappable, and check the result with your eyes."
        >
          If you publish CSS
        </H>
        <P>
          Ship no reset. Wrap everything you emit in a named layer and declare
          the order in your own stylesheet, so a consumer inherits a working
          arrangement instead of debugging one. Compile to custom properties
          rather than values, so your palette is a suggestion instead of a
          decision. And look at the page, in both themes, before you believe
          your tests.
        </P>
      </>
    ),
  },
  {
    slug: "the-fire-was-out",
    title: "The fire was out. I kept smelling smoke.",
    dek: "I spent three weeks fixing a real database bill, won, and then believed a number claiming one query cost more than my whole monthly allowance.",
    date: "2026-08-29",
    tags: ["Measurement", "Postgres", "Caching"],
    body: (
      <>
        <P>
          In June my hosting provider emailed to say a site I run had used
          5.5GB of its 5GB monthly allowance. It was seeing ten to twenty real
          visitors a day at the time, which turned out to have almost nothing to
          do with the bill. I spent three weeks fixing it, and I did fix it. Then in August I wrote down a number about the same system
          that was wrong by a factor of five, and believed it for a while,
          because by then I was the kind of person who found that number
          plausible.
        </P>

        <H
          eyebrow="The warning"
          dek="Databases charge for data leaving them, not just for storing it. That charge is called egress, and it is the one line on a hosting bill that does not track how popular you are, because it counts automated traffic exactly the same as people."
        >
          A bill for traffic I did not have
        </H>
        <P>
          Egress is what it costs to move data out. Store a million rows and
          read none of them and you pay almost nothing; store ten and read them
          on every request and you pay for every copy that leaves. It is billed
          by the byte, it does not care who asked, and that last part is where
          this went wrong.
        </P>
        <P>
          The traffic was not people. Search engine crawlers were walking every
          game page and every social preview image, and each preview render was
          making five separate database calls. Multiply that by a catalog in the
          thousands and by every crawler that has ever found a sitemap, and a
          site with a modest audience becomes one that reads its own database all
          day on behalf of software.
        </P>
        <P>
          The provider gave me until <strong className="font-semibold text-ink">7 July</strong>{" "}
          before fair use enforcement began. That is a real deadline attached to
          a real number, and it focuses the mind.
        </P>
        <Shot
          press={gvEgressJune}
          alt="Supabase egress chart from 25 May to 24 June 2026, with daily bars mostly between 190MB and 380MB and one spike reaching 711MB on 28 May."
          caption="Supabase egress, 25 May to 24 June 2026"
        />

        <H
          eyebrow="Three weeks"
          dek="Caching means keeping a copy of an answer so the next person who asks gets the copy instead of a fresh database query. Prefetching is a browser quietly loading pages you have not clicked yet, in case you do. One of those was helping and one was not."
        >
          Eight pull requests, and the names tell the story
        </H>
        <P>
          The fixes were unglamorous. Cache the expensive queries so a thousand
          crawler hits collapse into one read. Collapse the five calls behind
          each preview image into one. Stop the browser from speculatively
          loading pages nobody had asked for. Block the worst-behaved crawler
          outright. Trim the columns nothing rendered.
        </P>
        <P>
          I can tell how that went by the branch names, which degrade in a way I
          recognize:
        </P>
        <Code>{`bb/egress-fix
bb/egress-fix2
bb/egress-hotfix
bb/egress-again
bb/egress-cont`}</Code>
        <P>
          Eight of those merged between 10 June and 1 July. It worked. By August
          the site was steady in the mid twenties of megabytes a day, comfortably
          inside an allowance that works out to about 170MB a day. The fire was
          out, and I had earned a fairly detailed mental model of how this
          particular system leaks.
        </P>
        <Shot
          press={gvEgressAugust}
          alt="The same Supabase egress chart from 30 July to 29 August 2026, with daily bars between roughly 9MB and 36MB."
          caption="The same dashboard, two months later"
        />

        <H
          eyebrow="The number"
          dek="Two months later, in a comment explaining why some code needed rewriting, I wrote down what one database query cost per month. I got it by measuring one row and multiplying. That is the right method, and I still got an answer that was not close."
        >
          800KB a refetch, seven gigabytes a month
        </H>
        <P>
          The query fetched the whole game catalog to build a voting queue. I
          measured one row at roughly 484 bytes, multiplied by 1,667 games, and
          multiplied again by how often the cache refreshes in a month. That
          gives about 788KB per refetch and roughly 6.5GB a month, which I
          rounded to seven.
        </P>
        <P>
          Seven gigabytes against a five gigabyte allowance. That number
          justified a rewrite, and I did the rewrite.
        </P>

        <H
          eyebrow="Two errors"
          dek="The first was measuring the wrong thing: data is usually squeezed smaller before it crosses the network, and I measured it before the squeeze. The second was subtler, and survived my correction of the first."
        >
          Wrong by 5x, and then still wrong
        </H>
        <P>
          <strong className="font-semibold text-ink">The compression.</strong>{" "}
          The database sends its responses gzipped, and the client asks it to.
          What I had measured was the size of the data sitting in memory, not
          the size of it going over the wire. The rows here are mostly long
          image URLs, which compress extremely well. Re-measured, a row costs
          about 96 bytes in transit rather than 484. Nearly five times smaller.
        </P>
        <P>
          <strong className="font-semibold text-ink">
            The trap in the correction.
          </strong>{" "}
          My first attempt to verify this was also wrong, and it was wrong in a
          way I want to record, because it looks exactly like success. Node
          decompresses responses for you and leaves the header saying it was
          compressed. So you check the header, see{" "}
          <RInlineCode>content-encoding: gzip</RInlineCode>, then measure the
          body and get the decompressed size:
        </P>
        <Code>{`content-encoding header : gzip
bytes handed to you     : 49,307
bytes actually on wire  : 10,161`}</Code>
        <P>
          Both readings are honest. The header is telling the truth about the
          transfer and the byte count is telling the truth about the buffer, and
          together they produce a confident wrong answer. Only asking for the
          raw bytes, with the decompression explicitly turned off, showed the
          real figure.
        </P>
        <P>
          <strong className="font-semibold text-ink">
            And the corrected number was still not a cost.
          </strong>{" "}
          Fixing the compression gave 1.29GB a month, and I wrote that down as
          the real figure. It is not. It assumes the cache expires and refetches
          every five minutes, continuously, all month, which requires somebody
          to be on the site in all 8,640 of those windows. At twenty visitors a
          day, most windows are empty. What I had actually produced was a less
          wrong ceiling, presented as a measurement.
        </P>

        <H
          eyebrow="The check"
          dek="There was a way to catch all of this without measuring anything, and it was available the entire time. It was one division, and then reading an email I had already received."
        >
          Seven gigabytes a month is 236 megabytes a day
        </H>
        <P>
          The claim was 6.9GB a month from a single query. Divided by thirty,
          that is 236MB a day. The whole site, every query it makes, peaked at
          35.6MB a day that month and typically ran around 26.
        </P>
        <P>
          It is worse than that, and better as a lesson. The allowance is 5GB a
          month, which is about 170MB a day. So the number I wrote down claimed
          that one query, on its own, exceeded my entire monthly allowance by
          forty percent. On a project that had spent June getting back under
          that exact limit.
        </P>
        <P>
          If it had been true, I would have been in violation again immediately,
          and I would have received a second warning email. I had not received a
          second warning email. The disproof was already in my inbox, and it
          required no tooling, no profiler, and no measurement at all.
        </P>
        <RPullquote cite="The part worth keeping" colorScheme="amber">
          A component estimate that is never reconciled against the bill can be
          wrong by any factor at all, and nothing in the system will object.
        </RPullquote>

        <H
          eyebrow="Why it survived"
          dek="The uncomfortable part is not that I got a number wrong. It is that the reason I did not question it was the same experience that had made me good at this problem two months earlier."
        >
          The number agreed with me
        </H>
        <P>
          A claim that this database was hemorrhaging gigabytes was not
          surprising to me in August. It was familiar. I had just spent three
          weeks proving that exact sentence true, and I had the branch names and
          the graphs and the deadline to show for it.
        </P>
        <P>
          So the number arrived pre-approved. It matched a shape I had learned
          the hard way, and things that match a hard-won shape do not get
          audited. The pattern recognition that made me fast at the real problem
          is the same thing that made me credulous about the fake one, and I do
          not think those can be separated. You get both or neither.
        </P>
        <P>
          The only defense I have found is mechanical rather than intellectual.
          A component estimate is a claim about a total, and the total is
          usually already printed somewhere. Go and look at it. If your estimate
          for one part exceeds the measured whole, you have learned something
          before writing any code, and the check takes about as long as reading
          this sentence.
        </P>

        <H
          eyebrow="The coda"
          dek="I did the rewrite anyway, and it was the right call. Not for the reason I wrote down at the time, and the difference matters more than the code does."
        >
          A good fix with a bad justification
        </H>
        <P>
          The original query read the entire catalog to show one card at a time.
          The rewrite reads a bounded page instead: about 47KB per refetch
          regardless of how large the catalog grows.
        </P>
        <P>
          That is worth having. But the benefit is not the number I claimed. It
          is that the old cost scaled with every game added and the new one does
          not. The problem was a ceiling that grew, not a bill that hurt.
        </P>
        <P>
          Which means the fix produced no visible drop in the graph, and should
          not have. If I had gone looking for one to prove the work mattered, I
          would have found nothing, and I would have been measuring the wrong
          thing for the third time in one project.
        </P>
      </>
    ),
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

/** Newest first, which is the only order an index like this should use. */
export const postsByDate = [...posts].sort((a, b) => b.date.localeCompare(a.date));

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "14 August 2026". */
export function formatPostDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
