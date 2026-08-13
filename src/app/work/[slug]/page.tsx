import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StateToggle } from "@/components/state-toggle";
import { CrtEasterEgg } from "@/components/crt-easter-egg";
import { caseStudies } from "@/content/case-studies";
import { getProject, projects } from "@/lib/projects";

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
      <div className="mx-auto w-full max-w-[1180px] px-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule py-3">
          <nav aria-label="Breadcrumb" className="u flex items-center gap-2">
            <Link href="/" className="text-ink-faint no-underline hover:text-spot">
              Work
            </Link>
            <span aria-hidden="true">/</span>
            <span className="!text-[var(--world)]" aria-current="page">
              {project.name}
            </span>
          </nav>
          <StateToggle />
        </div>
      </div>

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

          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-6 border-t border-rule pt-4">
            {study.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-[3px]">
                <dd className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.6vw,2.25rem)] font-bold leading-none tracking-[-0.04em] tabular-nums text-[var(--world)]">
                  {stat.value}
                </dd>
                <dt className="u !tracking-[0.14em]">{stat.label}</dt>
                <span className="font-[family-name:var(--font-util)] text-[8.5px] tracking-[0.06em] text-ink-faint opacity-75">
                  {stat.source}
                </span>
              </div>
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
          <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
            <span className="u">Stack</span>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-[5px] font-[family-name:var(--font-util)] text-[10.5px]">
              {study.stack.map((row) => (
                <div key={row.k} className="contents">
                  <dt className="text-ink-faint">{row.k}</dt>
                  <dd className="m-0 text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
            <span className="u">Also shipped</span>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-[5px] font-[family-name:var(--font-util)] text-[10.5px]">
              {study.also.map((row) => (
                <div key={row.k} className="contents">
                  <dt className="whitespace-nowrap text-ink-faint">{row.k}</dt>
                  <dd className="m-0 text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {project.href ? (
            <a
              href={project.href}
              className="rounded-[3px] border border-[var(--world)] bg-[var(--world)]/10 px-[15px] py-3 text-center font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.14em] text-[var(--world)] no-underline transition-opacity hover:opacity-80"
            >
              Visit {project.host} →
            </a>
          ) : null}
        </aside>
      </div>

      <div className="mx-auto mt-auto w-full max-w-[1180px] px-6 pt-8 sm:px-8">
        <div className="flex h-[6px]" aria-hidden="true">
          <i className="flex-1 bg-[var(--process-c)]" />
          <i className="flex-1 bg-[var(--process-m)]" />
          <i className="flex-1 bg-[var(--process-y)]" />
          <i className="flex-1 bg-ink" />
        </div>
        <div className="flex flex-wrap justify-between gap-3 pb-8 pt-2">
          <Link href="/" className="u no-underline hover:!text-spot">
            ← Back to work
          </Link>
          <Link href={`/work/${next.slug}`} className="u no-underline hover:!text-spot">
            Next: {next.name} →
          </Link>
        </div>
      </div>
    </main>
  );
}
