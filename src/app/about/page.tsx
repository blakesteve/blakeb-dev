import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter, CONTACT } from "@/components/site-footer";
import { Portrait } from "@/components/portrait";
import {
  RCta,
  RDescriptionList,
  REyebrow,
  RLabeledDivider,
  RPullquote,
} from "@/lib/roster-ui";
import { getRosterComponentCount, getRosterVersion } from "@/lib/roster";
import {
  CAREER_START,
  EDUCATION,
  formatDuration,
  formatMark,
  monthsBetween,
  positions,
  positionSpan,
  yearsShippingWords,
} from "@/lib/career";
import pedernales from "@/images/blake/pedernales.jpg";

export const metadata = {
  title: "About",
  description:
    "Sixteen years of interfaces, a BFA in communication design, and the colophon for the site you are reading.",
};

const OFF_THE_CLOCK = [
  { k: "Outside", v: "Hiking, and a camera that comes along" },
  { k: "Hands", v: "Carpentry, drawing" },
  { k: "Ears", v: "Making music, and a great deal of consuming it" },
  { k: "Household", v: "Passionate about dogs, on the record" },
];

const TYPEFACES = [
  {
    name: "Archivo",
    role: "Display",
    className: "font-[family-name:var(--font-display)] font-bold uppercase tracking-[-0.03em]",
  },
  {
    name: "Source Serif 4",
    role: "Reading",
    className: "font-[family-name:var(--font-read)]",
  },
  {
    name: "IBM Plex Mono",
    role: "Utility",
    className: "font-[family-name:var(--font-util)] uppercase tracking-[0.1em] text-[0.8em]",
  },
];

export default function AboutPage() {
  const totalMonths = monthsBetween(CAREER_START, null);

  return (
    <main className="flex min-h-full flex-col">
      <TopBar>
        <RBreadcrumbs
          items={[{ label: "Blake Ball", href: "/" }, { label: "About" }]}
        />
      </TopBar>

      {/* ---- Lede and portrait ---- */}
      <header className="mx-auto w-full max-w-[1180px] px-6 pt-11 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div>
            <h1 className="m-0 pb-[14px] font-[family-name:var(--font-display)] text-[clamp(2.125rem,6vw,4rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">
              Howdy.
            </h1>
            <p className="m-0 max-w-[54ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
              I&rsquo;m Blake, an engineer in Austin, Texas. I have a BFA in
              communication design and {yearsShippingWords()} years of shipping software,
              which is a combination that sounds like a detour and turned out to be
              the whole point: I spent four years learning why a layout works before
              I ever learned how to make one run.
            </p>
            <p className="m-0 max-w-[54ch] pt-4 text-[1.0625rem] leading-[1.58] text-ink-soft">
              That is mostly useful for one thing now. Design partners figure out
              quickly that I will speak their language, argue in it, and go to bat
              for the details worth fighting for. The rest of the time I&rsquo;m
              building the layers underneath, which these days means schemas,
              caching, and the occasional bot.
            </p>
          </div>

          <Portrait
            src={pedernales}
            alt="Blake Ball outdoors at Pedernales Falls"
            caption="Pedernales Falls · printed in one ink · toggle the state to re-run it"
          />
        </div>
      </header>

      {/* ---- The arc ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-14 sm:px-8">
        <RLabeledDivider
          label="The run"
          trailing={`${formatDuration(totalMonths)}, ${positions.length} stops`}
          className="pb-1 [&>[role=presentation]]:bg-rule"
        />
        <p className="m-0 max-w-[64ch] pb-6 pt-3 text-[0.96875rem] leading-[1.62] text-ink-soft">
          Every duration below is computed from its dates rather than written
          down. The first two stops are the design ones; everything after
          November 2010 is engineering. The strip is the whole run to scale.
        </p>

        {/* The press run: one continuous bar, segmented by stop. */}
        <div
          className="flex h-3 w-full overflow-hidden rounded-[2px] border border-rule"
          role="img"
          aria-label={`Career timeline, ${formatMark(CAREER_START)} to present`}
        >
          {[...positions].reverse().map((position) => {
            const span = positionSpan(position);
            const months = monthsBetween(span.start, span.end);
            return (
              <i
                key={position.org}
                title={`${position.org} · ${formatDuration(months)}`}
                style={{ flexGrow: months }}
                className={
                  position.track === "design"
                    ? "bg-[var(--second)]"
                    : "bg-spot even:opacity-70"
                }
              />
            );
          })}
        </div>
        <div className="flex justify-between pt-1">
          <REyebrow>{formatMark(CAREER_START)}</REyebrow>
          <REyebrow>Now</REyebrow>
        </div>

        <ol className="m-0 mt-7 flex list-none flex-col p-0">
          {positions.map((position) => {
            const span = positionSpan(position);
            const months = monthsBetween(span.start, span.end);

            return (
              <li
                key={position.org}
                className="grid gap-x-6 gap-y-1 border-t border-rule py-4 sm:grid-cols-[168px_1fr]"
              >
                <div className="flex flex-col gap-[3px]">
                  <REyebrow tone={position.track === "design" ? "primary" : "faint"}>
                    {formatMark(span.start)} – {span.end ? formatMark(span.end) : "Present"}
                  </REyebrow>
                  <REyebrow>{formatDuration(months)}</REyebrow>
                </div>

                <div className="flex flex-col gap-[5px]">
                  <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.35rem] font-bold uppercase leading-none tracking-[-0.03em]">
                    {position.org}
                  </h2>
                  <div className="flex flex-col gap-[2px]">
                    {position.roles.map((role) => (
                      <span
                        key={role.title}
                        className="font-[family-name:var(--font-util)] text-[11px] text-ink"
                      >
                        {role.title}
                        {position.roles.length > 1 && (
                          <span className="text-ink-faint">
                            {" "}
                            · {formatMark(role.start)} – {role.end ? formatMark(role.end) : "Present"}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="m-0 max-w-[62ch] text-[0.9375rem] leading-[1.55] text-ink-soft">
                    {position.note}
                  </p>
                </div>
              </li>
            );
          })}

          <li className="grid gap-x-6 gap-y-1 border-y border-rule py-4 sm:grid-cols-[168px_1fr]">
            <div className="flex flex-col gap-[3px]">
              <REyebrow tone="primary">{formatMark(EDUCATION.graduated)}</REyebrow>
              <REyebrow>{EDUCATION.honors}</REyebrow>
            </div>
            <div className="flex flex-col gap-[5px]">
              <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.35rem] font-bold uppercase leading-none tracking-[-0.03em]">
                {EDUCATION.school}
              </h2>
              <span className="font-[family-name:var(--font-util)] text-[11px] text-ink">
                {EDUCATION.degree}
              </span>
              <p className="m-0 max-w-[62ch] text-[0.9375rem] leading-[1.55] text-ink-soft">
                Four years of typography, grids, and critique. It is the reason
                this site is measured in picas and the reason I know what a
                colophon is.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* ---- Off the clock ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-14 sm:px-8">
        <RLabeledDivider
          label="Off the clock"
          className="pb-1 [&>[role=presentation]]:bg-rule"
        />
        <div className="grid gap-8 pt-5 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <RDescriptionList
            layout="stacked"
            size="md"
            dividers
            items={OFF_THE_CLOCK.map(({ k, v }) => ({ term: k, description: v }))}
          />

          <div className="flex flex-col gap-4">
            <RPullquote cite="The thing I will talk your ear off about" colorScheme="current" className="text-spot">
              <span className="text-ink">
                I am fascinated by fungus, and by the mycelial networks running
                under most of the world without anyone noticing.
              </span>
            </RPullquote>
            <p className="m-0 max-w-[54ch] text-[0.96875rem] leading-[1.62] text-ink-soft">
              It is not lost on me that I now spend my working hours building a
              shared substrate that other things quietly grow out of, and that
              nobody notices it either until it stops working. I was into the
              metaphor well before I had a component library to justify it.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Colophon ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-14 sm:px-8">
        <RLabeledDivider
          label="Colophon"
          trailing="how this page is set"
          className="pb-1 [&>[role=presentation]]:bg-rule"
        />
        <p className="m-0 max-w-[64ch] pb-6 pt-3 text-[0.96875rem] leading-[1.62] text-ink-soft">
          A colophon is the note at the back of a printed book naming the
          typefaces, the paper, and the press. This site is a print job that
          runs in a browser, so it gets one.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {TYPEFACES.map((face) => (
            <div
              key={face.name}
              className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]"
            >
              <REyebrow>{face.role}</REyebrow>
              <span className={`text-[1.6rem] leading-none text-ink ${face.className}`}>
                Aa Bb Cc
              </span>
              <span className="font-[family-name:var(--font-util)] text-[10.5px] text-ink-faint">
                {face.name}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
            <REyebrow>Pressed with</REyebrow>
            <RDescriptionList
              items={[
                { term: "Framework", description: "Next.js 16, App Router" },
                { term: "Components", description: `@blakesteve/roster ${getRosterVersion()}` },
                { term: "Catalog", description: `${getRosterComponentCount()} components, read live` },
                { term: "Styling", description: "Tailwind CSS v4, cascade layers" },
                { term: "Host", description: "Vercel" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
            <REyebrow>Two states, one design</REyebrow>
            <RDescriptionList
              items={[
                { term: "Press sheet", description: "Cool stock, ink black, process magenta" },
                { term: "Blueline", description: "The proof stage, printed in blue" },
                { term: "Palette", description: "Nine families, derived from one anchor each" },
                { term: "Proof it", description: "Press ⌥X to outline every component" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ---- Contact ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-14 sm:px-8">
        <RLabeledDivider label="Reach me" className="pb-1 [&>[role=presentation]]:bg-rule" />
        <div className="flex flex-wrap items-end justify-between gap-6 pt-5">
          <p className="m-0 max-w-[46ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
            Open to talking about front end leadership, design systems, and
            anything where the interface and the thing underneath it are the same
            job.
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-2 p-0">
            {[
              { label: "Email", href: `mailto:${CONTACT.email}`, external: false },
              { label: "GitHub", href: CONTACT.github, external: true },
              { label: "LinkedIn", href: CONTACT.linkedin, external: true },
              { label: "Résumé", href: "/resume", external: false },
            ].map(({ label, href, external }) => (
              <li key={label}>
                <RCta href={href} external={external} showExternalIcon={false}>
                  {label} →
                </RCta>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter
        pageLinks={
          <>
            <Link href="/" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">← Back to work</REyebrow>
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
