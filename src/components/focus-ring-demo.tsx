import type { CSSProperties } from "react";

import { RButton } from "@/lib/roster-ui";

/**
 * The bug from "Classes that compile, ship, and do nothing", side by side.
 *
 * Both are the real Roster `Button`. The only difference between them is the
 * color the focus ring is drawn in, which is the whole subject: with
 * `--color-ring` undefined the utility emitted no rule, `--tw-ring-color` kept
 * its `initial` value, and `var(--tw-ring-color, currentcolor)` fell through to
 * the text color. On a solid fill that text is white.
 *
 * Three decisions worth keeping.
 *
 * **The ring is drawn at rest, not on focus.** The first version of this gated
 * both rings on `:focus-visible`, the way the real component does. That is
 * accurate and it is a useless demo: at rest the two buttons are identical, a
 * mouse click does not trigger `:focus-visible`, and a reader who does not
 * think to press Tab sees one picture twice. Accuracy about the mechanism is
 * worth nothing if the thing being demonstrated is invisible.
 *
 * **Both grounds are pinned white, in both themes.** The failure is a white
 * ring on a light background. On the site's dark theme a white ring is
 * perfectly visible, so a theme-following demo would disprove the post in half
 * the cases.
 *
 * **The offset stays white in both cells.** A ring offset is meant to be the
 * color behind the control, and here that is the white cell. Leaving it white
 * on both sides keeps the ring color as the single variable; letting the fixed
 * one take the site's dark offset would have made the comparison about two
 * things at once.
 */

const RING_OFFSET = "0 0 0 2px #fff";

/* What shipped: ring drawn in `currentColor`, which on a solid fill is white,
   sitting on a white ground. */
const DEAD: CSSProperties = {
  boxShadow: `${RING_OFFSET}, 0 0 0 4px currentColor`,
};

/* What it draws now, reading the same token the fixed utility reads. */
const LIVE: CSSProperties = {
  boxShadow: `${RING_OFFSET}, 0 0 0 4px var(--roster-ring, #0f6498)`,
};

function Cell({
  label,
  note,
  style,
}: {
  label: string;
  note: string;
  style: CSSProperties;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[3px] border border-rule bg-white p-5">
      <span className="font-[family-name:var(--font-util)] text-[11px] uppercase tracking-[0.08em] text-gray-600">
        {label}
      </span>
      {/* The focus indicator lives on this wrapper, not on the button.
          Roster's Button drops its outline and draws a ring on
          `:focus-visible`, and the inline style below overrides that ring - so
          with nothing else in play, tabbing to either button produced no visual
          change whatsoever. An unusable keyboard path on a page arguing that
          invisible focus indicators matter. The wrapper is outside the
          button's own classes, so it can say where focus is without touching
          what the demo is demonstrating. */}
      <span className="inline-flex rounded-[3px] py-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-gray-900">
        <RButton type="button" variant="solid" colorScheme="primary" size="sm" style={style}>
          Save changes
        </RButton>
      </span>
      <span className="text-[12px] leading-[1.5] text-gray-600">{note}</span>
    </div>
  );
}

export function FocusRingDemo() {
  return (
    <figure className="m-0 mb-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Cell
          label="As it shipped"
          style={DEAD}
          note="Ring color undefined, so it falls back to the text color. White ring, white page."
        />
        <Cell
          label="As it is now"
          style={LIVE}
          note="Ring color resolves to a real token, so the ring is drawn in it."
        />
      </div>
      <figcaption className="pt-3 text-[13px] leading-[1.6] text-ink-faint">
        Both are the real Roster{" "}
        <code className="font-[family-name:var(--font-util)]">Button</code>, with
        the focus ring drawn at rest so the difference does not depend on you
        pressing Tab. The ring color is the only thing that differs. Both cells
        are pinned white in either theme, because a white ring on a dark page is
        perfectly visible and would show you nothing. If you do tab through
        them, the square outline that appears is this page keeping focus
        visible, not part of the demonstration.
      </figcaption>
    </figure>
  );
}
