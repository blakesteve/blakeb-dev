import type { ReactNode } from "react";
import { REyebrow } from "@/lib/roster-ui";

/**
 * The foot of every page: the four process inks, then the links.
 *
 * All three pages were rolling their own version of the CMYK rule with
 * different wrappers and different padding. This is that rule, plus the
 * contact links, which previously lived nowhere — the site linked out to four
 * projects and offered no way to reach the person who built them.
 *
 * `pageLinks` is the optional per-page pair (back, next). The contact row is
 * the same everywhere, which is the point of putting it here.
 */

export const CONTACT = {
  email: "hi@blakeb.dev",
  github: "https://github.com/blakesteve",
  linkedin: "https://www.linkedin.com/in/blake-ball-35845845/",
} as const;

const LINKS = [
  { label: "GitHub", href: CONTACT.github, external: true },
  { label: "LinkedIn", href: CONTACT.linkedin, external: true },
  { label: CONTACT.email, href: `mailto:${CONTACT.email}`, external: false },
];

export function SiteFooter({ pageLinks }: { pageLinks?: ReactNode }) {
  return (
    <footer className="mx-auto mt-auto w-full max-w-[1180px] px-6 pt-12 sm:px-8">
      <div className="flex h-[6px]" aria-hidden="true">
        <i className="flex-1 bg-[var(--process-c)]" />
        <i className="flex-1 bg-[var(--process-m)]" />
        <i className="flex-1 bg-[var(--process-y)]" />
        <i className="flex-1 bg-ink" />
      </div>

      {pageLinks && (
        <div className="flex flex-wrap justify-between gap-3 border-b border-rule pb-3 pt-2">
          {pageLinks}
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pb-8 pt-3">
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
          {LINKS.map(({ label, href, external }) => (
            <li key={label}>
              <REyebrow
                as="a"
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="no-underline transition-colors hover:!text-spot"
              >
                {label}
              </REyebrow>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <REyebrow>Set in Archivo, Source Serif &amp; IBM Plex Mono</REyebrow>
          <REyebrow>© 2026 Blake Ball</REyebrow>
        </div>
      </div>
    </footer>
  );
}
