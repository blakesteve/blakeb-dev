import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { REyebrow } from "@/lib/roster-ui";
import { getPost, posts, postsByDate, formatPostDate } from "@/content/posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/writing/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.dek,
    openGraph: { type: "article", publishedTime: post.date },
  };
}

export default async function PostPage(props: PageProps<"/writing/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const index = postsByDate.findIndex((p) => p.slug === slug);
  const next = postsByDate[index + 1];

  return (
    <main className="flex min-h-full flex-col">
      <TopBar>
        <RBreadcrumbs
          items={[
            { label: "Blake Ball", href: "/" },
            { label: "Writing", href: "/writing" },
            { label: post.title },
          ]}
          /* The title is a whole sentence; let it wrap rather than blow the
             bar's height out on a phone. */
          className="[&_[aria-current]]:!line-clamp-1"
        />
      </TopBar>

      {/* One column, capped at a reading measure. Prose is the whole job here,
          so nothing sits beside it competing for attention. */}
      <article className="mx-auto w-full max-w-[720px] px-6 pt-11 sm:px-8">
        <header className="border-b border-rule pb-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-3">
            <REyebrow>{formatPostDate(post.date)}</REyebrow>
            {post.tags.map((tag) => (
              <REyebrow key={tag} tone="primary">
                {tag}
              </REyebrow>
            ))}
          </div>

          <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.875rem,5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            {post.title}
          </h1>
          <p className="m-0 max-w-[52ch] pt-4 text-[1.125rem] leading-[1.55] text-ink-faint">
            {post.dek}
          </p>
        </header>

        <div className="pt-7">{post.body}</div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
          <Link href="/writing" className="no-underline">
            <REyebrow className="transition-colors hover:!text-spot">
              ← All writing
            </REyebrow>
          </Link>
          {next && (
            <Link href={`/writing/${next.slug}`} className="max-w-[52%] no-underline">
              <REyebrow className="transition-colors hover:!text-spot">
                Next: {next.title} →
              </REyebrow>
            </Link>
          )}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
