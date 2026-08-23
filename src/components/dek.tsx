import type { ReactNode } from "react";
import { RAlert } from "@/lib/roster-ui";

/**
 * The plain-language summary that sits under a section heading, revealed by the
 * TL;DR toggle.
 *
 * Shared by case studies and posts, which were building the same Alert twice.
 *
 * Roster's Alert renders everything in the UI face, which is right for an alert
 * and wrong here: this one is not a notice, it is a sentence of prose wearing a
 * label. So the two halves take the two faces this site already uses everywhere
 * else — the label in the folio mono that eyebrows, figcaptions and the
 * breadcrumb trail use, and the summary itself in the reading face, because it
 * is read rather than scanned and sits directly among paragraphs set the same
 * way.
 *
 * The color still arrives from the wrapper via `colorScheme="current"`, so a
 * case study tints this with its own accent. The body drops back to ink: a
 * whole paragraph in the project accent is harder to read than the thing it is
 * summarizing.
 */
export function Dek({ children }: { children: ReactNode }) {
  return (
    <RAlert
      colorScheme="current"
      title="TL;DR"
      icon={null}
      /* The title is Alert's own `<p>`. These land in the `utilities` layer,
         which outranks `roster`, so no `!important` is needed to beat the
         component's `font-semibold`.

         No opacity on the label. It carries the same accent as the TL;DR toggle
         that reveals it, and dimming it to 80% composited against the panel read
         as a second, slightly-off green sitting next to the button. */
      className={
        "[&_p]:font-[family-name:var(--font-util)] [&_p]:text-[9.5px] " +
        "[&_p]:font-normal [&_p]:uppercase [&_p]:tracking-[0.14em] " +
        "[&_p]:leading-none [&_p]:pt-[3px]"
      }
    >
      <span className="block font-[family-name:var(--font-read)] text-[0.9375rem] leading-[1.6] text-ink-soft">
        {children}
      </span>
    </RAlert>
  );
}
