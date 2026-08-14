import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { REyebrow, RLabeledDivider } from "@/lib/roster-ui";
import { postsByDate, formatPostDate } from "@/content/posts";

export const metadata = {
  title: "Writing",
  description: "Notes on CSS, design systems, and things that broke in ways worth writing down.",
};

/**
 * The index. Deliberately a list of rows rather than cards: there is no cover
 * art, and a card with nothing in it but a title is a title with extra chrome.
 */
export default function WritingIndexPage() {
  return (
    <main className="flex min-h-full flex-col">
      <TopBar>
        <RBreadcrumbs items={[{ label: "Blake Ball", href: "/" }, { label: "Writing" }]} />
      </TopBar>

      <header className="mx-auto w-full max-w-[1180px] px-6 pt-11 sm:px-8">
        <h1 className="m-0 pb-[14px] font-[family-name:var(--font-display)] text-[clamp(2.125rem,6vw,4rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">
          Writing
        </h1>
        <p className="m-0 max-w-[54ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
          Mostly post-mortems. Things that broke in ways that turned out to be
          about something larger than the bug, written down while the details
          were still exact.
        </p>
      </header>

      <section className="mx-auto w-full max-w-[1180px] px-6 pt-9 sm:px-8">
        <RLabeledDivider
          label="Posts"
          trailing={String(postsByDate.length).padStart(2, "0")}
          className="[&>[role=presentation]]:bg-rule"
        />

        <ol className="m-0 flex list-none flex-col p-0">
          {postsByDate.map((post) => (
            <li key={post.slug} className="border-b border-rule">
              <Link
                href={`/writing/${post.slug}`}
                className="group grid gap-x-8 gap-y-2 py-6 no-underline sm:grid-cols-[128px_1fr]"
              >
                <div className="flex flex-col gap-1">
                  <REyebrow>{formatPostDate(post.date)}</REyebrow>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="m-0 max-w-[36ch] font-[family-name:var(--font-display)] text-[1.4375rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink transition-colors group-hover:text-spot">
                    {post.title}
                  </h2>
                  <p className="m-0 max-w-[62ch] text-[0.9375rem] leading-[1.55] text-ink-soft">
                    {post.dek}
                  </p>
                  <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 pt-1">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <REyebrow>{tag}</REyebrow>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter
        pageLinks={
          <>
            <Link href="/" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">← Home</REyebrow>
            </Link>
            <Link href="/work" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">The work →</REyebrow>
            </Link>
          </>
        }
      />
    </main>
  );
}
