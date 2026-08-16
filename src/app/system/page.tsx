import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { REyebrow, RLabeledDivider, RDescriptionList, storyHref } from "@/lib/roster-ui";
import {
  getRosterComponents,
  getRosterRamp,
  getRosterTokenFamilies,
  getRosterVersion,
} from "@/lib/roster";
import { Specimens } from "./specimens";

export const metadata = {
  title: "The system",
  description:
    "The component library this site is built from, read live from the installed package: every token, every component, and the two palettes they render in.",
};

const TIER_ORDER = ["atoms", "molecules", "organisms"] as const;

export default function SystemPage() {
  const version = getRosterVersion();
  const components = getRosterComponents();
  const families = getRosterTokenFamilies();

  const byTier = TIER_ORDER.map((tier) => ({
    tier,
    items: components
      .filter((component) => component.tier === tier)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <main className="flex min-h-full flex-col">
      <TopBar>
        <RBreadcrumbs
          items={[{ label: "Blake Ball", href: "/" }, { label: "System" }]}
        />
      </TopBar>

      <header className="mx-auto w-full max-w-[1180px] px-6 pb-2 pt-11 sm:px-8">
        <h1 className="m-0 pb-[14px] font-[family-name:var(--font-display)] text-[clamp(2.125rem,6vw,4rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">
          The system
        </h1>
        <p className="m-0 max-w-[56ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
          Everything below is read from the installed copy of{" "}
          <code className="font-[family-name:var(--font-util)] text-[0.9em] text-spot">
            @blakesteve/roster
          </code>{" "}
          at build time. The component list, the token ramps, and the specimens are
          the library itself, not a description of it. When a new version is
          published, this page reports it on the next deploy.
        </p>

        <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-6 border-t border-rule pt-4">
          <RDescriptionList
            layout="stacked"
            size="md"
            className="gap-x-10 sm:flex-row"
            items={[
              { term: "Version", description: version },
              { term: "Components", description: String(components.length) },
              { term: "Color families", description: String(families.length) },
              { term: "Production states", description: "2" },
            ]}
          />
        </dl>
      </header>

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

      {/* ---- Catalog ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-12 sm:px-8">
        <RLabeledDivider
          label="Catalog"
          trailing={`${components.length} components`}
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

      {/* ---- Specimens ---- */}
      <section className="mx-auto w-full max-w-[1180px] px-6 pt-12 sm:px-8">
        <RLabeledDivider
          label="Specimens"
          trailing="live"
          className="pb-1 [&>[role=presentation]]:bg-rule"
        />
        <p className="m-0 max-w-[64ch] pb-5 pt-3 text-[0.96875rem] leading-[1.62] text-ink-soft">
          Real components, rendered here rather than screenshotted. Press{" "}
          <kbd className="font-[family-name:var(--font-util)] text-[0.9em] text-spot">
            ⌥X
          </kbd>{" "}
          and every one of them is outlined and named, which is also how you can
          check that this page is not drawing pictures of buttons.
        </p>

        <Specimens componentCount={components.length} />
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
