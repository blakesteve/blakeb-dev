"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Pill,
  SegmentBar,
  Spinner,
  Switch,
  Input,
} from "@blakesteve/roster";
import { RButton, REyebrow, RStat, RPullquote, RInlineCode } from "@/lib/roster-ui";

/**
 * Live components, not screenshots.
 *
 * Every specimen is annotated so X-ray outlines it, which is the point: the
 * page can be checked rather than believed. A client component because half of
 * these are interactive, and a specimen sheet where nothing responds would be
 * a picture of a specimen sheet.
 *
 * Deliberately not exhaustive. The catalog above lists all of them; this shows
 * the ones whose behavior is worth seeing, and skips the ones that only make
 * sense inside a page that has something to say (Navbar, Footer, DataTable).
 */

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
      <REyebrow>{label}</REyebrow>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Specimens() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Cell label="Button">
        <RButton size="sm" colorScheme="primary">
          Primary
        </RButton>
        <RButton size="sm" variant="soft" colorScheme="primary">
          Soft
        </RButton>
        <RButton size="sm" variant="outline" colorScheme="neutral">
          Outline
        </RButton>
        <RButton size="sm" variant="ghost" colorScheme="neutral">
          Ghost
        </RButton>
      </Cell>

      <Cell label="Badge">
        <span data-roster="Badge">
          <Badge variant="primary">Primary</Badge>
        </span>
        <span data-roster="Badge">
          <Badge variant="success">Shipped</Badge>
        </span>
        <span data-roster="Badge">
          <Badge variant="error">Broken</Badge>
        </span>
      </Cell>

      <Cell label="Pill">
        <span data-roster="Pill">
          <Pill dot colorScheme="success">
            2,334 verdicts
          </Pill>
        </span>
        <span data-roster="Pill">
          <Pill dot pulse colorScheme="error">
            Live now
          </Pill>
        </span>
        <span data-roster="Pill">
          <Pill variant="outline" colorScheme="neutral">
            Filtered
          </Pill>
        </span>
      </Cell>

      <Cell label="Avatar">
        <span data-roster="Avatar">
          <Avatar initials="BB" />
        </span>
        <span data-roster="Avatar">
          <Avatar initials="GV" size="sm" />
        </span>
        <span data-roster="Avatar">
          <Avatar initials="MS" size="lg" />
        </span>
      </Cell>

      <Cell label="Switch">
        <span data-roster="Switch">
          <Switch
            checked={checked}
            onChange={setChecked}
            label="Actually toggles"
            ariaLabel="Specimen switch"
          />
        </span>
      </Cell>

      <Cell label="Spinner">
        <span data-roster="Spinner">
          <Spinner size="sm" />
        </span>
        <span data-roster="Spinner">
          <Spinner animation="dashed" />
        </span>
        <span data-roster="Spinner">
          <Spinner animation="dotted" variant="neutral" />
        </span>
      </Cell>

      <Cell label="Input">
        <span data-roster="Input" className="w-full">
          <Input label="With a label" placeholder="Type here" />
        </span>
      </Cell>

      <Cell label="SegmentBar">
        {/* The verdict bar, which is what Game Verdict prints on every game. */}
        <span data-roster="SegmentBar" className="w-full">
          <SegmentBar
            showLegend
            segments={[
              { key: "controller", label: "Controller", value: 64, color: "var(--roster-primary-500)" },
              { key: "kbm", label: "Keyboard", value: 29, color: "var(--roster-teal-500)" },
              { key: "either", label: "Either", value: 7, color: "var(--roster-gray-400)" },
            ]}
          />
        </span>
      </Cell>

      <Cell label="Alert">
        <span data-roster="Alert" className="w-full">
          <Alert colorScheme="amber" title="Tokens are remapped here">
            The swatches above show it: same component, this site&rsquo;s palette.
          </Alert>
        </span>
      </Cell>

      <Cell label="Stat">
        <dl className="m-0 flex flex-wrap gap-x-8 gap-y-4">
          <RStat size="sm" value="40" label="Components" source="live · package exports" />
          <RStat size="sm" value="2" label="States" source="press, blueline" />
        </dl>
      </Cell>

      <Cell label="Pullquote">
        <RPullquote colorScheme="current" cite="The whole idea" className="text-spot">
          <span className="text-ink">
            A component library that hardcodes its palette is a library you can use
            exactly once.
          </span>
        </RPullquote>
      </Cell>

      <Cell label="InlineCode">
        <p className="m-0 text-sm leading-relaxed text-ink-soft">
          Wrapped in <RInlineCode colorScheme="current" className="text-spot">@layer roster</RInlineCode>,
          between <RInlineCode colorScheme="current" className="text-spot">components</RInlineCode> and{" "}
          <RInlineCode colorScheme="current" className="text-spot">utilities</RInlineCode>.
        </p>
      </Cell>
    </div>
  );
}
