import type { CSSProperties } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { AlsoSeparately } from "@/components/also-separately";
import { REyebrow, RLabeledDivider, RCta } from "@/lib/roster-ui";
import { projects } from "@/lib/projects";
import { caseStudies } from "@/content/case-studies";
import { getGameVerdictStats } from "@/lib/game-verdict-stats";

export const metadata = {
  title: "Work",
  description:
    "Every project, with its stack, its scale, and where to read about it.",
};

/**
 * The contents page.
 *
 * The home page is a pitch you scroll through: hero, then the system strip,
 * then the projects. This is the direct answer for someone who only wants the
 * work — one row per project, dense, complete, no preamble.
 *
 * It reads `projects.ts` and `case-studies.tsx`, the same two sources the home
 * page and the case studies read, so the three cannot drift into describing the
 * same project differently. Nothing here is transcribed.
 */
export default async function WorkIndexPage() {
  /* One fetch for the page; only Game Verdict's row has a live figure. */
  const liveStats = await getGameVerdictStats();

  return (
    <main className="flex min-h-full flex-col">
      <TopBar>
        <RBreadcrumbs items={[{ label: "Blake Ball", href: "/" }, { label: "Work" }]} />
      </TopBar>

      <header className="mx-auto w-full max-w-[1180px] px-6 pt-11 sm:px-8">
        <h1 className="m-0 pb-[14px] font-[family-name:var(--font-display)] text-[clamp(2.125rem,6vw,4rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">
          The work
        </h1>
        <p className="m-0 max-w-[56ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
          Four things I built and still run. Each one has a case study covering
          what it does, the decision that was actually hard, and what it cost.
        </p>
      </header>

      <section className="mx-auto w-full max-w-[1180px] px-6 pt-9 sm:px-8">
        <RLabeledDivider
          label="Contents"
          trailing={String(projects.length).padStart(2, "0")}
          className="[&>[role=presentation]]:bg-rule"
        />

        <ol className="m-0 flex list-none flex-col p-0">
          {projects.map((project, index) => {
            const study = caseStudies[project.slug];

            return (
              <li
                key={project.slug}
                className="world border-b border-rule"
                style={
                  {
                    "--world-press": project.world.press,
                    "--world-blueline": project.world.blueline,
                  } as CSSProperties
                }
              >
                <div className="grid gap-x-8 gap-y-3 py-6 lg:grid-cols-[auto_1fr_300px]">
                  {/* The folio number, set in the project's own ink. */}
                  <span
                    aria-hidden="true"
                    className="font-[family-name:var(--font-display)] text-[2.25rem] font-bold leading-none tracking-[-0.04em] text-[var(--world)] lg:text-[2.75rem]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.5rem] font-bold uppercase leading-none tracking-[-0.03em]">
                        <Link
                          href={`/work/${project.slug}`}
                          className="text-ink no-underline transition-colors hover:text-[var(--world)]"
                        >
                          {project.name}
                        </Link>
                      </h2>
                      <REyebrow>{project.status}</REyebrow>
                    </div>

                    <p className="m-0 max-w-[58ch] text-[0.9375rem] leading-[1.55] text-ink-soft">
                      {study?.lede ?? project.blurb}
                    </p>

                    <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 pt-1">
                      {project.props.map((row) => (
                        <div key={row.label} className="flex items-baseline gap-2">
                          <dt>
                            <REyebrow>{row.label}</REyebrow>
                          </dt>
                          <dd
                            className={
                              "m-0 font-[family-name:var(--font-util)] text-[10.5px] tabular-nums " +
                              (row.accent ? "text-[var(--world)]" : "text-ink")
                            }
                          >
                            {row.live && liveStats.games !== null
                              ? row.live(liveStats)
                              : row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Always stacked above lg, never side by side: the host
                      labels vary enough in width that wrapping is decided by
                      the project name, which reads as an accident. */}
                  <div className="flex flex-wrap items-start gap-2 lg:flex-col lg:items-end">
                    <RCta href={`/work/${project.slug}`} tint="var(--world)">
                      Case study →
                    </RCta>
                    {project.links.map((link) => (
                      <RCta
                        key={link.href}
                        href={link.href}
                        external
                        showExternalIcon={false}
                        tint="var(--world)"
                        className="!bg-transparent"
                      >
                        {link.label} →
                      </RCta>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <AlsoSeparately />
      </section>

      <SiteFooter
        pageLinks={
          <>
            <Link href="/" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">← Home</REyebrow>
            </Link>
            <Link href="/system" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">The system →</REyebrow>
            </Link>
          </>
        }
      />
    </main>
  );
}
