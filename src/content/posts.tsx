import type { ReactNode } from "react";
import { REyebrow, RInlineCode, RPullquote } from "@/lib/roster-ui";

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

function H({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="pb-3 pt-7">
      <REyebrow tone="primary">{eyebrow}</REyebrow>
      <h2 className="m-0 pt-2 font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
        {children}
      </h2>
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

        <H eyebrow="The root cause">The default path ships everything</H>
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

        <H eyebrow="The fix">Three changes, none of them clever</H>
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

        <H eyebrow="The part I got wrong twice">
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

        <H eyebrow="What I would tell you">If you publish CSS</H>
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
