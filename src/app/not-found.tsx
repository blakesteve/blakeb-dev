import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";
import { RBreadcrumbs } from "@/components/breadcrumbs";
import { REyebrow, RCta } from "@/lib/roster-ui";

export const metadata = {
  title: "Out of register",
  description: "That page is not on this sheet.",
};

/**
 * 404, as a misprint.
 *
 * A page that will not resolve is a page that did not line up, and this site
 * already has a mark whose entire job is showing you when things do not line
 * up. So the whole sheet is out of register: the number is printed four times,
 * once per process ink, each plate offset, exactly the way a press run looks
 * when the films are hung wrong.
 *
 * Hovering the way back snaps every plate into alignment at once. The recovery
 * link is what fixes the registration, which is the joke and also, briefly,
 * true.
 *
 * The whole thing is CSS on a `group`; nothing here needs to be a client
 * component. `motion-reduce` holds the plates still, in which case the page
 * reads as a plain misprint rather than an animated one, which is fine.
 */

/** The four process plates, in the order the footer prints them. */
const PLATES = [
  { ink: "var(--process-c)", rest: "translate(-13px, 7px)" },
  { ink: "var(--process-m)", rest: "translate(9px, -8px)" },
  { ink: "var(--process-y)", rest: "translate(4px, 12px)" },
  { ink: "var(--ink)", rest: "translate(0, 0)" },
];

export default function NotFound() {
  return (
    <main className="group/sheet flex min-h-full flex-col">
      <TopBar>
        <RBreadcrumbs
          items={[{ label: "Blake Ball", href: "/" }, { label: "404" }]}
        />
      </TopBar>

      <section className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-center px-6 py-16 sm:px-8">
        <REyebrow tone="primary" size="sm">
          Out of register
        </REyebrow>

        {/* Four plates of the same number, stacked. The black plate sits in
            register and carries the accessible text; the others are decoration
            offset around it. */}
        <div className="relative mt-4 select-none" aria-hidden="true">
          {PLATES.map(({ ink, rest }, i) => (
            <span
              key={ink}
              style={{ color: ink, "--rest": rest } as React.CSSProperties}
              className={
                "misplate block font-[family-name:var(--font-display)] " +
                "text-[clamp(6rem,26vw,18rem)] font-bold uppercase leading-[0.8] " +
                "tracking-[-0.06em] mix-blend-multiply dark:mix-blend-screen " +
                (i === 0 ? "" : "absolute inset-0")
              }
            >
              404
            </span>
          ))}
        </div>
        <h1 className="sr-only">404 — page not found</h1>

        <div className="mt-8 grid gap-8 border-t border-rule pt-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <p className="m-0 max-w-[52ch] text-[1.0625rem] leading-[1.58] text-ink-soft">
            That page is not on this sheet. Either it was trimmed, it never got
            past the proof, or the link that sent you here is pointing at
            something I moved.
          </p>

          <div className="flex flex-col gap-4">
            <p className="m-0 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ink-faint">
              On a press, you catch this at the registration mark: if the plates
              are off, the crosshair shows it before anything else does. Put the
              cursor on the way back and watch the sheet come into register.
            </p>
            <div className="flex flex-wrap gap-2">
              <RCta href="/">Back to work →</RCta>
              <RCta href="/system" tint="var(--second)">
                The system →
              </RCta>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter
        pageLinks={
          <>
            <Link href="/about" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">
                ← About
              </REyebrow>
            </Link>
            <Link href="/resume" className="no-underline">
              <REyebrow className="transition-colors hover:!text-spot">
                Résumé →
              </REyebrow>
            </Link>
          </>
        }
      />
    </main>
  );
}
