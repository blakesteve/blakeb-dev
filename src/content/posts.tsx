import type { ReactNode } from "react";
import Link from "next/link";
import { REyebrow, RInlineCode, RPullquote } from "@/lib/roster-ui";
import { Dek } from "@/components/dek";
import { Shot } from "@/components/shot";
import { FocusRingDemo } from "@/components/focus-ring-demo";
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
          I maintain a component library that five of my own apps depend on and
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
          That wasn&rsquo;t a decision so much as a default. Point Vite&rsquo;s
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
          already have a reset and you import nothing; if it doesn&rsquo;t, you ask
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
          <RInlineCode>base</RInlineCode>, so a host preflight can&rsquo;t erase its
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
          A test suite that can&rsquo;t see the page will happily certify a page
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
          dek="Databases charge for data leaving them, not just for storing it. That charge is called egress, and it is the one line on a hosting bill that doesn’t track how popular you are, because it counts automated traffic exactly the same as people."
        >
          A bill for traffic I didn&rsquo;t have
        </H>
        <P>
          Egress is what it costs to move data out. Store a million rows and
          read none of them and you pay almost nothing; store ten and read them
          on every request and you pay for every copy that leaves. It is billed
          by the byte, it doesn&rsquo;t care who asked, and that last part is where
          this went wrong.
        </P>
        <P>
          The traffic wasn&rsquo;t people. Search engine crawlers were walking every
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
          dek="Caching means keeping a copy of an answer so the next person who asks gets the copy instead of a fresh database query. Prefetching is a browser quietly loading pages you haven’t clicked yet, in case you do. One of those was helping and one was not."
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
          dek="The uncomfortable part isn’t that I got a number wrong. It is that the reason I didn’t question it was the same experience that had made me good at this problem two months earlier."
        >
          The number agreed with me
        </H>
        <P>
          A claim that this database was hemorrhaging gigabytes wasn&rsquo;t
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
  {
    slug: "classes-that-compile-ship-and-do-nothing",
    title: "Classes that compile, ship, and do nothing",
    dek: "The focus ring on my most-used component was invisible on six of eight color schemes for months, and every check I had reported success the whole time.",
    date: "2026-09-12",
    tags: ["CSS", "Tailwind", "Testing"],
    body: (
      <>
        <P>
          Tailwind v4 generates utilities from theme tokens. If you write a
          class naming a token that doesn&rsquo;t exist, that is not an error. It is
          not a warning. The build succeeds, the class sits in your{" "}
          <RInlineCode>className</RInlineCode> looking exactly like the ones on
          either side of it, and it produces no CSS at all.
        </P>
        <P>
          Twelve of those had shipped in{" "}
          <Link
            href="/system"
            className="text-ink underline decoration-rule underline-offset-2 transition-colors hover:decoration-spot"
          >
            Roster
          </Link>
          , the component library I maintain and five of my own apps depend on.
          Two were the focus ring, on three different controls.
        </P>

        <H
          eyebrow="The bug"
          dek="A button’s focus outline was set to a color that was never defined, so the browser fell back to using the text color instead: white on white."
        >
          A focus ring the color of the text it surrounds
        </H>
        <P>
          <RInlineCode>Button</RInlineCode> asked for{" "}
          <RInlineCode>focus-visible:ring-ring</RInlineCode> and{" "}
          <RInlineCode>ring-offset-background</RInlineCode>; Badge and Input
          each carried one of the two. Reasonable-looking class names. Neither <RInlineCode>--color-ring</RInlineCode> nor{" "}
          <RInlineCode>--color-background</RInlineCode> was ever defined in the
          theme, so both utilities emitted zero rules.
        </P>
        <P>
          A ring with no color doesn&rsquo;t disappear. Tailwind&rsquo;s ring is
          drawn from <RInlineCode>var(--tw-ring-color, currentcolor)</RInlineCode>
          , and with nothing setting the first half, the fallback wins. The
          focus ring became the text color.
        </P>
        <P>
          On a solid button, the text is white. So the focus ring was white,
          drawn on a white page, around a control that had just received
          keyboard focus. The library ships eight color schemes; the solid teal
          and amber fills carry dark text, so their rings came out near-black
          and were merely wrong rather than absent. The other six vanished on
          any light background, which is where every app that installs Roster
          puts them.
        </P>
        <RPullquote cite="What the keyboard user saw">
          Focus moved. Nothing indicated where.
        </RPullquote>
        <P>
          This site runs on Roster, so that isn&rsquo;t a description. Both of these
          are the real component, drawn with the focus ring showing. The ring
          color is the only thing that differs between them:
        </P>
        <FocusRingDemo />

        <H
          eyebrow="Why nothing caught it"
          dek="Each of the three checks I rely on is structurally incapable of seeing this particular kind of mistake."
        >
          Three green checks, all blind in the same direction
        </H>
        <P>
          <strong>TypeScript can&rsquo;t read a class name.</strong> To the compiler
          a <RInlineCode>className</RInlineCode> is a string, and{" "}
          <RInlineCode>&quot;ring-ring&quot;</RInlineCode> is exactly as valid
          as <RInlineCode>&quot;ring-primary-500&quot;</RInlineCode>. There is
          nothing for it to check.
        </P>
        <P>
          <strong>The unit tests asserted presence, not effect.</strong> They
          checked that the button rendered with the class applied. It did. That
          assertion stays true for a class that does nothing, which is the
          entire problem. The test and the bug are compatible.
        </P>
        <P>
          <strong>Storybook looked fine,</strong> because a missing focus ring
          is not a visible defect. It is a missing one. Nothing is drawn in the
          wrong place, nothing overlaps, no color is off. You have to know to
          press Tab, and then you have to notice the absence of a thing you were
          not looking for.
        </P>
        <P>
          That last one generalizes past this bug. Visual review catches things
          that are drawn wrong. It is structurally poor at things that aren&rsquo;t
          drawn at all, and no amount of looking harder changes that.
        </P>

        <H
          eyebrow="The fix that wasn’t the fix"
          dek="Defining the missing colors was the small half of the job; the useful half was writing something that would catch the next one automatically."
        >
          Check the artifact, not the source
        </H>
        <P>
          Defining <RInlineCode>--color-ring</RInlineCode> was the easy half and
          worth almost nothing on its own, because the mistake isn&rsquo;t one I had
          made once. It is one the tooling permits, silently, every time.
        </P>
        <P>
          So the check has to compare what the components ask for against what
          the build actually produced. The class names come out of the component
          source; the rules come out of the compiled stylesheet. Anything
          referenced and not emitted fails the build.
        </P>
        <Code>{`# roster/package.json
"build": "tsc -b && vite build
  && node scripts/check-prefix.mjs
  && node scripts/check-classes-emit.mjs
  && node scripts/check-tokens.mjs"`}</Code>
        <P>
          It runs after <RInlineCode>vite build</RInlineCode> rather than
          instead of it, because the bug only exists in the artifact. Reading
          the source tells you what was requested. Only the stylesheet knows
          what was granted.
        </P>
        <P>
          Three classes are exempt, and the exemption list is where the check
          nearly went wrong. <RInlineCode>group</RInlineCode>,{" "}
          <RInlineCode>peer</RInlineCode> and <RInlineCode>dark</RInlineCode>{" "}
          are markers read by other selectors and legitimately emit nothing. I
          nearly added <RInlineCode>sr-only</RInlineCode> to it, which would
          have been wrong: it emits a real rule, so exempting it would have
          blinded the check to a regression in the one utility whose whole job
          is serving people who can&rsquo;t see the screen. An allowlist is where a
          guard goes quietly blind, so it is the one part of a check like this
          worth re-reading every time you add to it.
        </P>

        <H
          eyebrow="What it found"
          dek="Run for the first time, the check immediately turned up ten more dead classes in parts of the library I had no suspicions about."
        >
          The ring wasn&rsquo;t special
        </H>
        <P>
          I expected the check to sit there and earn its keep slowly. Its first
          run named ten more, across three files I had no reason to suspect.
        </P>
        <P>
          Seven were the tooltip&rsquo;s entire entrance animation:{" "}
          <RInlineCode>animate-in</RInlineCode>,{" "}
          <RInlineCode>fade-in-0</RInlineCode>,{" "}
          <RInlineCode>zoom-in-95</RInlineCode> and four directional slides. The
          tooltip had never animated. It appeared instantly, which reads as a
          deliberate choice rather than a broken one, and so had never been
          reported by anyone including me.
        </P>
        <P>
          Two were gradient stops on the countdown component, naming an{" "}
          <RInlineCode>accent</RInlineCode> color family that didn&rsquo;t exist. One
          was a scrollbar style on the textarea. Every one of them had shipped,
          in a published package, to every app that installs it.
        </P>
        <P>
          Twelve shipped classes, then, between the two rounds. Not one of them
          broke anything loudly enough to be noticed.
        </P>
        <P>
          There were two more, and they are the part worth keeping.{" "}
          <RInlineCode>fade-in</RInlineCode> and{" "}
          <RInlineCode>zoom-in</RInlineCode> were sitting in a stories file, and
          the check never saw them, because it skips{" "}
          <RInlineCode>*.stories.*</RInlineCode> and{" "}
          <RInlineCode>*.test.*</RInlineCode> on purpose, because documentation
          blurbs are full of CSS in code fences and scanning them produces
          nothing but false alarms. A deliberate exclusion, made for a good reason, and it
          is a hole. I found those two by hand.
        </P>
        <P>
          Which is the rule applying to itself. A check is a decision about what
          to look at, and every such decision draws a boundary somewhere. This
          one draws it at stories files, for a good reason, and the boundary is
          exactly where the next two were sitting. Knowing where your checks
          stop looking is the useful thing to know about them.
        </P>

        <H
          eyebrow="The shape"
          dek="Since writing that check I have hit the same kind of false green three more times, in tools with nothing to do with CSS."
        >
          A green check is a claim about what it can see
        </H>
        <P>
          This is not a Tailwind problem, which is what took me a while to
          understand. Tailwind is where I happened to meet it.
        </P>
        <P>
          <strong>A type check that passed because of a background process.</strong>{" "}
          My site&rsquo;s type check passed every time I ran it locally. On its
          first run in CI it produced sixty-one errors. Next generates the
          type declarations for routes and image imports into files that are
          also gitignored, and my development server had been quietly
          regenerating them the entire time. The check was real. Its
          prerequisites were being supplied by something nobody would think to
          list as a dependency.
        </P>
        <P>
          <strong>A test with an early return.</strong> I wrote a guard to stop
          one case study rendering another one&rsquo;s screenshots, after doing
          exactly that. It parsed the file into sections keyed by study, and for
          a key it didn&rsquo;t recognize it returned early rather than failing. A
          reformat that indented one nested key two spaces too few would have
          cut a study&rsquo;s section short and handed the remainder to a name
          the check didn&rsquo;t know, so most of that study would have gone
          unexamined with the suite still green. It came out in review before it
          shipped, which is the stage at which this class of fault is cheap to
          find. Once a check like that is green in CI, nothing downstream ever
          questions it again.
        </P>
        <P>
          <strong>A comment that argued its way out of a necessary clause.</strong>{" "}
          A comparator in another app was missing a rule. The comment where the
          rule should have been explained that it{" "}
          <em>could never change an answer the remaining rules did not already
          give</em>. That was wrong, and it made the comparator inconsistent:
          for two particular rows it claimed each should sort after the other,
          so the winner depended on the order the API happened to send them in.
          Every test written to prove that comparator was order-independent
          missed it, because all of them set one field that made the broken
          branch unreachable.
        </P>

        <H
          eyebrow="What I actually changed my mind about"
          dek="I used to read a passing check as evidence the code was right; it is only evidence about the specific thing the check looks at."
        >
          The question to ask a green check
        </H>
        <P>
          I had been treating my checks as a set that collectively covered the
          work. They do not collectively cover anything. Each one answers one
          narrow question, and the gaps between them aren&rsquo;t visible from
          inside any of them.
        </P>
        <P>
          The question worth asking is not whether a check passes. It is what
          would have to be true for this check to pass while the thing is
          broken. For the type checker, a wrong string. For the unit test, a
          class that exists and does nothing. For Storybook, an absence. Each
          answer is a specific, writable check.
        </P>
        <P>
          Defining the missing color was the smaller half of that day&rsquo;s
          work and the less useful one. The check is what found the other ten,
          within a minute of existing, in three files I would never have
          thought to open.
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
