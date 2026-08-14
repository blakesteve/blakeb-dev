import type { CSSProperties } from "react";
import Link from "next/link";
import {
  RCard,
  RDescriptionList,
  REyebrow,
  RLabeledDivider,
} from "@/lib/roster-ui";
import { RegistrationMark } from "@/components/registration-mark";
import { StateToggle } from "@/components/state-toggle";
import { projects } from "@/lib/projects";
import { getRosterComponentCount, getRosterTokens, getRosterVersion } from "@/lib/roster";

const TOKEN_STRIP = [
  "roster-primary-500",
  "roster-teal-500",
  "roster-success-500",
  "roster-amber-500",
  "roster-error-500",
  "roster-orange-500",
  "roster-gray-500",
  "roster-gray-800",
];

const META = [
  { k: "Now", v: "Revmatics" },
  { k: "Role", v: "Lead Front End Eng." },
  { k: "Stack", v: "React 19 · Next 16 · TS" },
  { k: "Ships", v: "@blakesteve/roster" },
  { k: "Since", v: "2010" },
];

export default function Home() {
  const version = getRosterVersion();
  const componentCount = getRosterComponentCount();
  const tokens = getRosterTokens(TOKEN_STRIP);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 sm:px-8">
      {/* Folio — the running head of a printed sheet. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-ink pb-2 pt-3">
        <span className="inline-flex items-center gap-2">
          <RegistrationMark />
          <REyebrow tone="strong" weight="semibold" className="!tracking-[0.1em]">
            Blake Ball
          </REyebrow>
        </span>
        <REyebrow>Austin, Texas · Front End Engineer · Est. 2010</REyebrow>
      </div>

      <nav className="flex flex-wrap items-center justify-between gap-4 pt-3">
        <ul className="flex gap-5">
          {["Work", "System", "About", "Writing"].map((item) => (
            <li key={item}>
              <a
                href={`/${item.toLowerCase()}`}
                className="font-[family-name:var(--font-util)] text-[11px] tracking-[0.06em] text-ink no-underline transition-colors hover:text-spot"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <StateToggle />
      </nav>

      {/* Hero */}
      <section className="pt-12 sm:pt-16">
        <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(2.5rem,7.4vw,6rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em] text-balance">
          Front end
          <br />
          engineer.
          <br />
          Fluent in <span className="text-spot">designer.</span>
        </h1>

        <div className="mt-8 grid gap-6 border-t border-rule pt-6 sm:grid-cols-[1.55fr_1fr] sm:gap-12">
          <p className="m-0 max-w-[48ch] text-[1.0625rem] leading-relaxed">
            Sixteen years building interfaces — currently Lead Front End Engineer at{" "}
            <strong className="font-bold">Revmatics</strong>, before that findhelp, Cart.com, and
            five and a half years at <strong className="font-bold">IBM</strong>. I came up in
            graphic design, which is mostly useful now for one thing: design partners know I will
            speak their language and go to bat for the details worth fighting for.
          </p>

          {/* `split` is exactly this shape: term left, value right-aligned and
              tabular. The dotted rule is the one thing Roster does not offer,
              so it rides in on className. */}
          <RDescriptionList
            layout="split"
            size="md"
            items={META.map(({ k, v }) => ({ term: k, description: v }))}
            className="gap-y-2 [&>div]:border-b [&>div]:border-dotted [&>div]:border-rule [&>div]:pb-[5px]"
          />
        </div>
      </section>

      {/* System strip — read from the installed package, not transcribed. */}
      <section className="mt-10 overflow-hidden rounded-[3px] border border-rule bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-2">
          <REyebrow>Built with @blakesteve/roster</REyebrow>
          <REyebrow>
            v{version} · {componentCount} components · tokens read live
          </REyebrow>
        </div>
        {/* Fixed columns rather than auto-fit: eight tokens divide evenly into
            2 and 4, so no row ever ends with an orphaned swatch. */}
        <div className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
          {tokens.map((token) => (
            <div key={token.name} className="flex flex-col gap-[6px] bg-panel px-[10px] py-[9px]">
              <div
                className="h-5 w-full rounded-[2px]"
                style={{ backgroundColor: token.value }}
              />
              <b className="truncate font-[family-name:var(--font-util)] text-[9px] font-medium text-ink">
                {token.name}
              </b>
              <span className="font-[family-name:var(--font-util)] text-[8.5px] text-ink-faint">
                {token.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Instances */}
      <section className="pt-10">
        <RLabeledDivider
          label="Instances"
          trailing={String(projects.length).padStart(2, "0")}
          className="pb-3 [&>[role=presentation]]:bg-rule"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project, i) => (
            <RCard
              key={project.slug}
              branded
              brandColorTop="var(--world)"
              brandColorBottom="transparent"
              padding="none"
              className={
                "world relative overflow-hidden rounded-[3px] !border !border-rule !bg-panel " +
                "pb-[13px] transition-colors hover:!border-[var(--world)]"
              }
              style={
                {
                  "--world-press": project.world.press,
                  "--world-blueline": project.world.blueline,
                } as CSSProperties
              }
            >
              <div className="flex flex-col gap-[9px] px-4 pt-[15px]">
                <div className="flex items-baseline justify-between gap-3">
                  <REyebrow className="!tracking-[0.14em]">
                    {String(i + 1).padStart(2, "0")} / {project.status}
                  </REyebrow>
                  {/* z-10 keeps this above the stretched card link below.
                      Eyebrow sits inside the anchor rather than becoming it:
                      its props type does not carry `href`, so the hover moves
                      to a group instead. */}
                  <a
                    href={project.href ?? undefined}
                    className="group relative z-10 inline-flex items-center gap-[5px] no-underline"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block size-[5px] rounded-full bg-[var(--world)]"
                    />
                    <REyebrow className="transition-colors group-hover:!text-[var(--world)]">
                      {project.host}
                    </REyebrow>
                  </a>
                </div>

                <h2 className="m-0 font-[family-name:var(--font-display)] text-2xl font-bold uppercase leading-none tracking-[-0.03em]">
                  {/* Stretched so the whole card is the target; the host link
                      above sits on z-10 to stay independently clickable. */}
                  <Link
                    href={`/work/${project.slug}`}
                    className="no-underline transition-colors before:absolute before:inset-0 before:content-[''] hover:text-[var(--world)]"
                  >
                    {project.name}
                  </Link>
                </h2>

                <p className="m-0 text-sm leading-[1.55] text-ink-soft">{project.blurb}</p>
              </div>

              <RDescriptionList
                className="mt-[2px] border-t border-rule px-4 pt-[10px]"
                items={project.props.map((row) => ({
                  term: row.label,
                  description: (
                    <span
                      className={
                        "tabular-nums " + (row.accent ? "text-[var(--world)]" : "text-ink")
                      }
                    >
                      {row.value}
                    </span>
                  ),
                }))}
              />
            </RCard>
          ))}
        </div>
      </section>

      {/* Outside the numbered set, and deliberately so. */}
      <section className="mt-5 flex flex-col gap-[7px] rounded-[3px] border border-dashed border-rule px-[18px] py-4">
        <REyebrow>Also, and separately</REyebrow>
        <h2 className="m-0 text-[1.1875rem] font-semibold tracking-[-0.01em]">BB&rsquo;s Grove</h2>
        <p className="m-0 max-w-[62ch] text-sm leading-[1.55] text-ink-soft">
          A memorial for my older brother, where everyone who knew him can share memories, photos,
          and his BBisms. The homepage grows a grove of Texas trees — one per story. It is not a
          case study and there is nothing to measure; if you would like to see it, it is at{" "}
          <a
            href="https://who-bb.com"
            className="text-ink underline decoration-rule underline-offset-2 transition-colors hover:decoration-spot"
          >
            who-bb.com
          </a>
          .
        </p>
      </section>

      {/* The four process inks, in order. */}
      <div className="mt-8 flex h-[6px]" aria-hidden="true">
        <i className="flex-1 bg-[var(--process-c)]" />
        <i className="flex-1 bg-[var(--process-m)]" />
        <i className="flex-1 bg-[var(--process-y)]" />
        <i className="flex-1 bg-ink" />
      </div>
      <footer className="flex flex-wrap justify-between gap-3 pb-8 pt-2">
        <REyebrow>© 2026 Blake Ball</REyebrow>
        <REyebrow>Set in Archivo, Source Serif &amp; IBM Plex Mono</REyebrow>
      </footer>
    </main>
  );
}
