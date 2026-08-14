import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import {
  RCta,
  RDescriptionList,
  REyebrow,
  RStat,
} from "@/lib/roster-ui";
import { CrtEasterEgg } from "@/components/crt-easter-egg";
import { caseStudies } from "@/content/case-studies";
import { getProject, projects } from "@/lib/projects";
import { getGameVerdictStats } from "@/lib/game-verdict-stats";
import type { CaseStudyStat } from "@/content/case-studies";

/**
 * Swaps in figures fetched at build time for the stats that declare one, and
 * leaves the rest exactly as written. A figure only gets to claim it is live
 * once it actually resolved; otherwise the hand-written fallback stands with
 * its own dated source, so an unreachable API degrades to an honest snapshot.
 */
async function resolveStats(stats: CaseStudyStat[]): Promise<CaseStudyStat[]> {
  if (!stats.some((stat) => stat.live)) return stats;

  const live = await getGameVerdictStats();

  return stats.map((stat) => {
    const value = stat.live ? live[stat.live] : null;
    if (value === null) return stat;

    return {
      ...stat,
      value: value.toLocaleString("en-US"),
      source: "live · /api/stats",
    };
  });
}

/** The two metadata panels in the sidebar. Same shape, same treatment. */
function SidebarPanel({ label, rows }: { label: string; rows: { k: string; v: string }[] }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
      <REyebrow>{label}</REyebrow>
      <RDescriptionList
        items={rows.map((row) => ({ term: row.k, description: row.v }))}
        className="text-[10.5px] [&>div>dt]:normal-case [&>div>dt]:tracking-normal"
      />
    </div>
  );
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: caseStudies[slug]?.lede ?? project.blurb,
  };
}

export default async function CaseStudyPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  const study = caseStudies[slug];
  if (!project || !study) notFound();

  const stats = await resolveStats(study.stats);
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <main
      className="world flex min-h-full flex-col"
      style={
        {
          "--world-press": project.world.press,
          "--world-blueline": project.world.blueline,
        } as CSSProperties
      }
    >
      <TopBar>
        {/* Roster's Breadcrumbs, routed through next/link by RBreadcrumbs so
            the hop back stays client-side. The typography comes from the same
            Eyebrow class list the rest of the folio uses. */}
        <RBreadcrumbs
          items={[
            { label: "Work", href: "/" },
            { label: project.name },
          ]}
          currentClassName="!text-[var(--world)]"
        />
      </TopBar>

      {/* The project's own world, mixed from its accent so it holds in both
          production states without authoring two gradients. */}
      <header
        className="w-full"
        style={{
          background:
            "radial-gradient(120% 150% at 10% 0%," +
            " color-mix(in oklab, var(--world) 26%, var(--paper)) 0%," +
            " color-mix(in oklab, var(--world) 9%, var(--paper)) 46%," +
            " var(--paper) 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1180px] px-6 py-11 sm:px-8">
          <h1 className="m-0 pb-[14px] font-[family-name:var(--font-display)] text-[clamp(2.125rem,6vw,4rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">
            {project.name}
          </h1>
          <p className="m-0 max-w-[52ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
            {study.lede}
          </p>

          {/* `current` lets each project's accent reach the figures without
              Roster knowing anything about this site's palette. The display
              face is the one thing Stat does not offer, so it rides along. */}
          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-6 border-t border-rule pt-4 text-[var(--world)]">
            {stats.map((stat) => (
              <RStat
                key={stat.label}
                colorScheme="current"
                value={stat.value}
                label={stat.label}
                source={stat.source}
                className="[&>dd]:font-[family-name:var(--font-display)]"
              />
            ))}
          </dl>
        </div>
      </header>

      {/* The page describes Game Verdict's CRT easter egg, so it also has one.
          Scoped to this slug: the egg belongs where its story is. */}
      {slug === "game-verdict" && <CrtEasterEgg />}

      <div className="mx-auto grid w-full max-w-[1180px] gap-7 px-6 pt-8 sm:px-8 lg:grid-cols-[1.5fr_0.95fr] lg:gap-12">
        {/* Capped for the stacked layout — above lg the grid column does it. */}
        <div className="max-w-[68ch]">{study.body}</div>

        <aside className="flex flex-col gap-3">
          <SidebarPanel label="Stack" rows={study.stack} />
          <SidebarPanel label="Also shipped" rows={study.also} />

          {project.href ? (
            <RCta href={project.href} external tint="var(--world)" showExternalIcon={false}>
              Visit {project.host} →
            </RCta>
          ) : null}
        </aside>
      </div>

      <SiteFooter
        pageLinks={
          <>
            <Link href="/" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">← Back to work</REyebrow>
            </Link>
            <Link href={`/work/${next.slug}`} className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">
                Next: {next.name} →
              </REyebrow>
            </Link>
          </>
        }
      />
    </main>
  );
}
