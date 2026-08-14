import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter, CONTACT } from "@/components/site-footer";
import { REyebrow, RCta } from "@/lib/roster-ui";
import { PrintButton } from "./print-button";
import {
  EDUCATION,
  SKILLS,
  formatDuration,
  formatMark,
  monthsBetween,
  positions,
  positionSpan,
  summary,
} from "@/lib/career";
import { projects } from "@/lib/projects";

export const metadata = {
  title: "Résumé",
  description: "Blake Ball — engineer, Austin, Texas. Sixteen years of shipping software.",
};

/**
 * A PDF, if one has been dropped in. Checked rather than assumed: linking a
 * file that is not there is the same class of bug as a stat that claims to be
 * live and is not.
 */
const PDF = "/blake-ball-resume.pdf";
function pdfExists(): boolean {
  return existsSync(join(process.cwd(), "public", PDF.replace(/^\//, "")));
}

/** Every project worth a line, newest first, with its own scale figure. */
const SELECTED = projects.filter((p) => p.href !== null).slice(0, 4);

export default function ResumePage() {
  const hasPdf = pdfExists();

  return (
    <main className="flex min-h-full flex-col">
      <TopBar>
          <RBreadcrumbs
          items={[{ label: "Blake Ball", href: "/" }, { label: "Résumé" }]}
        />
      </TopBar>

      {/* The sheet. `resume-sheet` is what the print rules target. */}
      <article className="resume-sheet mx-auto w-full max-w-[860px] px-6 pt-10 sm:px-8 print:max-w-none print:px-0 print:pt-0">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b-[1.5px] border-ink pb-3">
          <div>
            <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em]">
              Blake Ball
            </h1>
            <p className="m-0 pt-2 font-[family-name:var(--font-util)] text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              Engineer · Austin, Texas
            </p>
          </div>

          <ul className="m-0 flex list-none flex-col gap-[3px] p-0 text-right">
            {[
              { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
              { label: "blakeb.dev", href: "https://blakeb.dev" },
              { label: "github.com/blakesteve", href: CONTACT.github },
              { label: "linkedin.com/in/blake-ball-35845845", href: CONTACT.linkedin },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="font-[family-name:var(--font-util)] text-[10.5px] text-ink no-underline hover:text-spot"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <p className="m-0 max-w-[74ch] pt-5 text-[0.9375rem] leading-[1.6] text-ink-soft print:text-[10.5pt]">
          {summary()}
        </p>

        <div className="flex flex-wrap gap-2 pb-1 pt-5 print:hidden">
          <PrintButton />
          {hasPdf && (
            <RCta href={PDF} download>
              Download PDF
            </RCta>
          )}
        </div>

        {/* ---- Skills ---- */}
        <section className="pt-7">
          <h2 className="m-0 border-b border-rule pb-1 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Skills
          </h2>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-5 gap-y-[5px] pt-3 print:gap-y-[3px]">
            {SKILLS.map(({ group, items }) => (
              <div key={group} className="contents">
                <dt className="whitespace-nowrap font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                  {group}
                </dt>
                <dd className="m-0 text-[0.875rem] leading-[1.5] text-ink print:text-[9.5pt]">
                  {items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- Experience ---- */}
        <section className="pt-7">
          <h2 className="m-0 border-b border-rule pb-1 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Experience
          </h2>

          <ol className="m-0 flex list-none flex-col p-0">
            {positions
              .filter((p) => p.track === "engineering")
              .map((position) => {
                const span = positionSpan(position);
                const months = monthsBetween(span.start, span.end);

                return (
                  <li
                    key={position.org}
                    className="break-inside-avoid border-b border-hair py-3 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="m-0 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold uppercase leading-none tracking-[-0.02em] print:text-[11.5pt]">
                        {position.org}
                      </h3>
                      <span className="font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        {formatMark(span.start)} – {span.end ? formatMark(span.end) : "Present"}
                        {" · "}
                        {formatDuration(months)}
                      </span>
                    </div>

                    <div className="flex flex-col pt-1">
                      {position.roles.map((role) => (
                        <span
                          key={role.title}
                          className="font-[family-name:var(--font-util)] text-[10.5px] text-ink"
                        >
                          {role.title}
                          {position.roles.length > 1 && (
                            <span className="text-ink-faint">
                              {" · "}
                              {formatMark(role.start)} – {role.end ? formatMark(role.end) : "Present"}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>

                    {position.highlights ? (
                      <ul className="m-0 flex list-none flex-col gap-[3px] p-0 pt-2">
                        {position.highlights.map((line) => (
                          <li
                            key={line}
                            className="relative pl-4 text-[0.875rem] leading-[1.5] text-ink-soft before:absolute before:left-0 before:text-spot before:content-['—'] print:text-[9.5pt]"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="m-0 pt-2 text-[0.875rem] leading-[1.5] text-ink-soft print:text-[9.5pt]">
                        {position.note}
                      </p>
                    )}
                  </li>
                );
              })}
          </ol>
        </section>

        {/* ---- Selected work ---- */}
        <section className="break-inside-avoid pt-7">
          <h2 className="m-0 border-b border-rule pb-1 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Selected work
          </h2>
          <dl className="m-0 flex flex-col gap-[6px] pt-3">
            {SELECTED.map((project) => (
              <div key={project.slug} className="flex flex-wrap items-baseline gap-x-3">
                <dt className="font-[family-name:var(--font-display)] text-[0.9375rem] font-bold uppercase tracking-[-0.02em] print:text-[10.5pt]">
                  {project.name}
                </dt>
                <dd className="m-0 flex-1 text-[0.875rem] leading-[1.5] text-ink-soft print:text-[9.5pt]">
                  {project.tagline}{" "}
                  <span className="font-[family-name:var(--font-util)] text-[10px] text-ink-faint">
                    {project.host}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- Education ---- */}
        <section className="break-inside-avoid pt-7 pb-2">
          <h2 className="m-0 border-b border-rule pb-1 font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Education
          </h2>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-3">
            <h3 className="m-0 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold uppercase leading-none tracking-[-0.02em] print:text-[11.5pt]">
              {EDUCATION.school}
            </h3>
            <span className="font-[family-name:var(--font-util)] text-[10px] uppercase tracking-[0.1em] text-ink-faint">
              {formatMark(EDUCATION.graduated)} · {EDUCATION.honors}
            </span>
          </div>
          <p className="m-0 pt-1 text-[0.875rem] text-ink-soft print:text-[9.5pt]">
            {EDUCATION.degree}
          </p>
        </section>
      </article>

      <div className="print:hidden">
        <SiteFooter
          pageLinks={
            <>
              <Link href="/about" className="no-underline">
                <REyebrow className="transition-colors hover:!text-spot">← About</REyebrow>
              </Link>
              <Link href="/" className="no-underline">
                <REyebrow className="transition-colors hover:!text-spot">The work →</REyebrow>
              </Link>
            </>
          }
        />
      </div>
    </main>
  );
}
