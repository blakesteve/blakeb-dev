"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarStrip,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  CollapsibleSection,
  Combobox,
  Disclosure,
  Eyebrow,
  InlineCode,
  Input,
  LabeledDivider,
  Link,
  LoadingDots,
  MultiSelect,
  PasswordInput,
  Pill,
  Progress,
  SegmentBar,
  Select,
  Skeleton,
  Spinner,
  Stat,
  Switch,
  Textarea,
  Tooltip,
  type MultiSelectValue,
} from "@blakesteve/roster";
import type { FrameName } from "./frames";
import { APPS, CONTROL, Note, STOCKS, type FrameSpec } from "./kit";

/* Knob values arrive as strings from the loupe's Chips. Each bench passes them
   straight through as the props they name, which is what the code line says. */
type Props = Record<string, string>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const as = (props: Props) => props as any;

function CheckboxFrame() {
  const [bleed, setBleed] = useState(true);
  const [marks, setMarks] = useState(false);
  return (
    <div className="cs-col">
      <label className="cs-lab">
        <Checkbox checked={bleed} onChange={setBleed} /> Bleed
      </label>
      <label className="cs-lab">
        <Checkbox checked={marks} onChange={setMarks} /> Crop marks
      </label>
    </div>
  );
}

function ChipFrame() {
  const [on, setOn] = useState(["Cyan", "Magenta"]);
  return (
    <div className="cs-row">
      {["Cyan", "Magenta", "Yellow", "Key"].map((ink) => (
        <Chip
          key={ink}
          size="sm"
          colorScheme="primary"
          variant={on.includes(ink) ? "solid" : "outline"}
          selected={on.includes(ink)}
          onSelectedChange={(picked) => setOn(picked ? [...on, ink] : on.filter((x) => x !== ink))}
        >
          {ink}
        </Chip>
      ))}
    </div>
  );
}

function ComboboxFrame() {
  const [app, setApp] = useState<string | number | null>("Game Verdict");
  return <Combobox options={APPS} value={app} onChange={setApp} placeholder="Search apps" size="sm" className="w-full" />;
}

function MultiSelectFrame() {
  const [apps, setApps] = useState<MultiSelectValue[]>(["Game Verdict", "Retrospect"]);
  return (
    <MultiSelect
      options={APPS}
      value={apps}
      onChange={setApps}
      display="count"
      size="sm"
      placeholder="Pick apps"
      className="w-full"
    />
  );
}

function SelectFrame() {
  const [stock, setStock] = useState<string | number>("uncoated");
  return <Select options={STOCKS} value={stock} onChange={setStock} size="sm" className="w-full" />;
}

function SwitchFrame() {
  const [on, setOn] = useState(true);
  return <Switch checked={on} onChange={setOn} label="Actually toggles" />;
}

export const ATOMS = {
  Avatar: {
    C: () => (
      <div className="cs-row">
        <Avatar initials="BB" />
        <Avatar initials="GV" size="sm" />
        <Avatar initials="MS" size="lg" />
      </div>
    ),
    bench: (p) => <Avatar initials="BB" {...as(p)} />,
  },
  AvatarStrip: {
    C: () => (
      <AvatarStrip
        items={["Blake Ball", "Sam Ortiz", "Jo Lee", "Ana Ruiz", "Max Hart", "Ty Bell", "Ivy Moss"].map(
          (label, i) => ({ key: String(i), label }),
        )}
        maxDisplay={4}
        totalCount={31}
        label="31 voted"
      />
    ),
  },
  Badge: {
    C: () => (
      <div className="cs-row">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Shipped</Badge>
        <Badge variant="error">Broken</Badge>
      </div>
    ),
    bench: (p) => <Badge {...as(p)}>On press</Badge>,
  },
  Button: {
    C: () => (
      <div className="cs-row">
        <Button size="sm" className={CONTROL}>
          Primary
        </Button>
        <Button size="sm" variant="soft" className={CONTROL}>
          Soft
        </Button>
        <Button size="sm" variant="outline" colorScheme="neutral" className={CONTROL}>
          Outline
        </Button>
      </div>
    ),
    bench: (p) => (
      <Button className={CONTROL} {...as(p)}>
        Send to press
      </Button>
    ),
  },
  Card: {
    C: () => (
      <Card padding="sm" className="press-card w-[170px]">
        <b className="cs-card-title">Instance 02</b>
        <p className="cs-card-body">A panel with a raised edge.</p>
      </Card>
    ),
    bench: (p) => (
      <Card padding="md" className="press-card" {...as(p)}>
        <b className="cs-card-title">Instance 02</b>
        <p className="cs-card-body">A panel with a raised edge.</p>
      </Card>
    ),
  },
  Checkbox: { C: CheckboxFrame },
  Chip: {
    C: ChipFrame,
    bench: (p) => <Chip {...as(p)}>Magenta</Chip>,
  },
  CollapsibleSection: {
    C: () => (
      <CollapsibleSection size="xs">
        <p className="cs-body">
          Roster doesn&rsquo;t get planned so much as discovered. Something gets built twice in a
          consuming app, that is the signal, and it moves into the library. This site alone produced
          most of a release.
        </p>
      </CollapsibleSection>
    ),
  },
  Combobox: { C: ComboboxFrame },
  Disclosure: {
    C: () => (
      <Disclosure title="What ships to the client" defaultOpen={false} className="w-full">
        <p className="cs-body">Pre-compiled CSS, so a consuming app doesn&rsquo;t need Tailwind.</p>
      </Disclosure>
    ),
  },
  Eyebrow: {
    C: () => <Eyebrow>Built with @blakesteve/roster</Eyebrow>,
    bench: (p) => <Eyebrow {...as(p)}>Built with @blakesteve/roster</Eyebrow>,
  },
  InlineCode: {
    C: () => (
      <span className="cs-body">
        Compiles to{" "}
        <InlineCode colorScheme="current" className="text-spot">
          var(--roster-*)
        </InlineCode>
      </span>
    ),
  },
  Input: {
    C: () => <Input label="Job name" placeholder="Fall catalog" size="sm" className="w-full" />,
    bench: (p) => <Input label="Job name" placeholder="Fall catalog" {...as(p)} />,
  },
  LabeledDivider: {
    C: () => (
      <LabeledDivider label="Instances" trailing="04" className="w-full [&>[role=presentation]]:bg-rule" />
    ),
  },
  Link: {
    C: () => (
      <div className="cs-col">
        <Link href="/work/roster">How it got built</Link>
        <Link href="https://www.npmjs.com/package/@blakesteve/roster">On npm</Link>
      </div>
    ),
  },
  LoadingDots: { C: () => <LoadingDots /> },
  MultiSelect: { C: MultiSelectFrame },
  PasswordInput: {
    C: () => <PasswordInput label="Pressroom code" defaultValue="registration" size="sm" className="w-full" />,
  },
  Pill: {
    C: () => (
      <div className="cs-row">
        <Pill dot colorScheme="success">
          Plates burned
        </Pill>
        <Pill dot pulse colorScheme="error">
          On press now
        </Pill>
      </div>
    ),
    bench: (p) => (
      <Pill dot {...as(p)}>
        Plates burned
      </Pill>
    ),
  },
  Progress: {
    C: () => (
      <div className="cs-col w-full">
        <Progress value={64} label="Plates made" />
        <Progress variant="segmented" segments={["done", "done", "current", "remaining"]} label="Press run" />
      </div>
    ),
  },
  SegmentBar: {
    C: () => (
      <SegmentBar
        showLegend
        className="w-full"
        segments={[
          { key: "c", label: "Controller", value: 64, color: "var(--roster-primary-500)" },
          { key: "k", label: "Keyboard", value: 29, color: "var(--roster-teal-500)" },
          { key: "e", label: "Either", value: 7, color: "var(--roster-gray-400)" },
        ]}
      />
    ),
  },
  Select: { C: SelectFrame },
  Skeleton: {
    C: () => (
      <div className="cs-col w-full">
        <Skeleton shape="line" lines={2} />
        <Skeleton shape="block" height={34} />
      </div>
    ),
  },
  Spinner: {
    C: () => (
      <div className="cs-row">
        <Spinner size="sm" />
        <Spinner animation="dashed" />
        <Spinner animation="dotted" variant="neutral" />
      </div>
    ),
  },
  Stat: {
    C: () => (
      <dl className="m-0">
        <Stat size="sm" value="2,500" label="Sheets" source="a sample, not a count" />
      </dl>
    ),
  },
  Switch: { C: SwitchFrame },
  Textarea: {
    C: () => <Textarea label="Notes to the pressman" rows={2} defaultValue="Hold the magenta." className="w-full" />,
  },
  ThemeToggle: {
    C: () => <Note>It&rsquo;s in the bar at the top of this page. A second one would fight it.</Note>,
  },
  Tooltip: {
    C: () => (
      <Tooltip content="Hover, focus or long-press" variant="themed">
        <Button size="sm" variant="outline" colorScheme="neutral" className={CONTROL}>
          Point at me
        </Button>
      </Tooltip>
    ),
  },
} satisfies Record<FrameName<"atoms">, FrameSpec>;
