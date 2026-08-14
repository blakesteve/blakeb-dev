"use client";

import { RThemeToggle } from "@/lib/roster-ui";

/**
 * The two production states, which are Roster's dark mode wearing this site's
 * vocabulary: the press sheet is light, the blueline proof is dark.
 *
 * This used to be a hand-rolled button with its own `useSyncExternalStore` over
 * the `.dark` class. Roster's `ThemeToggle` does exactly that, and now that its
 * visible label and icon are props rather than a hardcoded "Light"/"Dark", it
 * can say so in the site's own terms.
 *
 * The storage key stays `state`, matching the blocking script in the root
 * layout. Roster writes "dark"/"light" into it rather than the old
 * "blueline"/"press", so the script reads it as a plain dark-mode flag.
 */
export function StateToggle() {
  return (
    <RThemeToggle
      showLabel
      storageKey="state"
      lightLabel={<span className="min-w-[68px] text-left">Press sheet</span>}
      darkLabel={<span className="min-w-[68px] text-left">Blueline</span>}
      toDarkLabel="Switch to the blueline proof"
      toLightLabel="Switch back to the press sheet"
      lightIcon={
        <span aria-hidden="true" className="text-spot">
          ◐
        </span>
      }
      darkIcon={
        <span aria-hidden="true" className="text-spot">
          ◐
        </span>
      }
      variant="ghost"
      colorScheme="neutral"
      size="xs"
      className="!font-[family-name:var(--font-util)] !text-[10px] !uppercase !tracking-[0.14em]"
    />
  );
}
