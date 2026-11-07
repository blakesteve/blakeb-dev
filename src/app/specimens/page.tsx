import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { REyebrow, RLabeledDivider, storyHref } from "@/lib/roster-ui";
import { SPECIMENS_PAGE } from "@/lib/nav";
import { getProject } from "@/lib/projects";
import {
  ROSTER_APPS,
  getRosterComponents,
  getRosterMeta,
  getRosterRamp,
  getRosterShippedTokens,
  getRosterTokenFamilies,
  getRosterVersion,
} from "@/lib/roster";
import { JOB_TOKENS_COPIED, buildJobs } from "@/content/jobs";
import { InkSwap } from "./ink-swap";
import { JOB_FONTS } from "./job-fonts";

export const metadata = {
  title: SPECIMENS_PAGE.label,
  description: `One set of components, ${ROSTER_APPS.words} apps. Pick a job and the sheet reprints in that product's own tokens, with every part of the library below it.`,
};

/** A project's site, for a job's slug line, from the one list of them. */
function hostOf(slug: string, fallback: string) {
  const live = getProject(slug)?.links.find((link) => link.kind === "live");
  return live ? new URL(live.href).host : fallback;
}

const TIER_ORDER = ["atoms", "molecules", "organisms"] as const;

export default function SpecimensPage() {
  const version = getRosterVersion();
  const components = getRosterComponents();
  const families = getRosterTokenFamilies();

  const shipped = getRosterShippedTokens();
  const jobs = buildJobs({
    version,
    components: components.length,
    tiers: Object.fromEntries(
      TIER_ORDER.map((tier) => [tier, components.filter((item) => item.tier === tier).length]),
    ),
    tests: getRosterMeta()?.tests ?? null,
    hosts: {
      gv: hostOf("game-verdict", "gameverdict.app"),
      retrospect: hostOf("retrospect", "retrospect-seven.vercel.app"),
      megasquad: hostOf("megasquad", "megasquad.org"),
      br: hostOf("bragging-rocks", "bragging.rocks"),
    },
  });

  const byTier = TIER_ORDER.map((tier) => ({
    tier,
    items: components
      .filter((component) => component.tier === tier)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <main className="flex min-h-full flex-col">
      <TopBar section="specimens" />

      <header className="mx-auto w-full max-w-[1180px] px-6 pb-2 pt-11 sm:px-8">
        <h1 className="m-0 pb-[14px] font-[family-name:var(--font-display)] text-[clamp(2.125rem,6vw,4rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">
          {SPECIMENS_PAGE.label}
        </h1>
        <p className="m-0 max-w-[56ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
          One set of components, {ROSTER_APPS.words} apps. Pick a job and this sheet reprints in
          that product&rsquo;s own tokens. Nothing below is a picture.
        </p>
      </header>

      {/* ---- Ink swap ---- */}
      <section className={`mx-auto w-full max-w-[1180px] px-6 pt-8 sm:px-8 ${JOB_FONTS}`}>
        <InkSwap jobs={jobs} shipped={shipped} fonts={JOB_FONTS} />
        <p className="m-0 max-w-[64ch] pt-6 text-[0.96875rem] leading-[1.62] text-ink-soft">
          Press{" "}
          <kbd className="font-[family-name:var(--font-util)] text-[0.9em] text-spot">⌥X</kbd> and
          every one of them is outlined and named, which is also how you can check that this page
          is not drawing pictures of buttons.
        </p>
        <p className="m-0 max-w-[64ch] pt-3 font-[family-name:var(--font-util)] text-[11px] leading-[1.6] text-ink-faint">
          Tokens copied from each app&rsquo;s stylesheet, {JOB_TOKENS_COPIED}. Words invented in
          each product&rsquo;s register. The numbers in a reprint are samples, not that app&rsquo;s
          real figures.
        </p>
      </section>

      {/* ---- Catalog ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-12 sm:px-8">
        <RLabeledDivider
          label="Catalog"
          trailing={`${components.length} components · v${version}`}
          className="pb-1 [&>[role=presentation]]:bg-rule"
        />
        <p className="m-0 max-w-[64ch] pb-5 pt-3 text-[0.96875rem] leading-[1.62] text-ink-soft">
          Parsed from the package&rsquo;s own type definitions, so nothing here is
          transcribed. Names link to their Storybook page where one is deployed.
        </p>

        <div className="grid gap-7 sm:grid-cols-3">
          {byTier.map(({ tier, items }) => (
            <div key={tier} className="flex flex-col gap-[10px]">
              <RLabeledDivider
                label={tier}
                trailing={String(items.length)}
                className="[&>[role=presentation]]:bg-rule"
              />
              <ul className="m-0 flex list-none flex-col gap-[3px] p-0">
                {items.map(({ name }) => {
                  const href = storyHref(name, tier);
                  return (
                    <li key={name}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-[family-name:var(--font-util)] text-[11px] text-ink no-underline transition-colors hover:text-spot"
                        >
                          {name}
                        </a>
                      ) : (
                        <span className="font-[family-name:var(--font-util)] text-[11px] text-ink">
                          {name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Tokens ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-10 sm:px-8">
        <RLabeledDivider
          label="Tokens"
          trailing={`${families.length} families`}
          className="pb-1 [&>[role=presentation]]:bg-rule"
        />
        <p className="m-0 max-w-[64ch] pb-5 pt-3 text-[0.96875rem] leading-[1.62] text-ink-soft">
          Each swatch is shown twice. The top half is the hex Roster ships; the
          bottom half is what{" "}
          <code className="font-[family-name:var(--font-util)] text-[0.9em] text-spot">
            var(--roster-*)
          </code>{" "}
          resolves to on this page, after this site remaps it. Where the two
          halves differ, that is an override doing its job: same library, this
          site&rsquo;s palette, no fork. Toggle the state above and the lower half
          repaints while the upper half holds still.
        </p>

        <div className="flex flex-col gap-4">
          {families.map((family) => (
            <div key={family} className="flex flex-col gap-[6px]">
              <REyebrow>{family}</REyebrow>
              <div className="flex overflow-hidden rounded-[3px] border border-rule">
                {getRosterRamp(family).map(({ step, shipped }) => (
                  <div key={step} className="flex flex-1 flex-col">
                    {/* Shipped: a literal hex, unaffected by this site. */}
                    <div className="h-7" style={{ backgroundColor: shipped }} />
                    {/* Resolved: whatever this site's state maps it to. */}
                    <div
                      className="h-7"
                      style={{ backgroundColor: `var(--roster-${family}-${step})` }}
                    />
                    <span className="bg-panel py-1 text-center font-[family-name:var(--font-util)] text-[8.5px] text-ink-faint">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter
        pageLinks={
          <>
            <Link href="/" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">← Back to work</REyebrow>
            </Link>
            <Link href="/work/roster" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">
                How it got built →
              </REyebrow>
            </Link>
          </>
        }
      />
    </main>
  );
}
