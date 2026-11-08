"use client";

import { useState } from "react";
import { Chip, Dialog, Sheet } from "@blakesteve/roster";
import { RButton, REyebrow, RLink } from "@/lib/roster-ui";
import { Live, type LoadState, type SheetFrame } from "./contact-sheet";
import { turnKnob } from "./frames";
import type { FrameSpec } from "./kit";

export type LoupeProps = {
  frame: SheetFrame;
  spec: FrameSpec | undefined;
  state: LoadState;
  open: boolean;
  /** Below 640px the loupe is a Sheet, full size, and that's where you play. */
  phone: boolean;
  /** The status line, which names the frame a step landed on. */
  said: string;
  onStep: (by: number) => void;
  onClose: () => void;
  onAfterClose: () => void;
};

const SINGULAR: Record<SheetFrame["t"], string> = { atoms: "atom", molecules: "molecule", organisms: "organism" };

/**
 * One frame, larger and live, with knobs where it has them. Loaded on demand,
 * since nobody needs it until a caption is pressed.
 */
export function Loupe({ frame, spec, state, open, phone, said, onStep, onClose, onAfterClose }: LoupeProps) {
  /* The knobs belong to a frame: stepping to another clears them. */
  const [props, setProps] = useState<Record<string, string>>({});
  const [propsFor, setPropsFor] = useState(frame.n);
  if (propsFor !== frame.n) {
    setPropsFor(frame.n);
    setProps({});
  }

  /* In the knobs' order, so the line reads the same however they were pressed. */
  const set = Object.keys(frame.knobs ?? {}).filter((k) => props[k] !== undefined);
  const code = `<${frame.n}${set.map((k) => ` ${k}="${props[k]}"`).join("")} />`;

  const bench = frame.knobs && spec?.bench;

  const body = (
    <div className="loupe">
      {/* Keyed by frame, so each one starts fresh. */}
      <div className="loupe-stage" key={frame.n} data-roster={state === "ready" ? frame.n : undefined}>
        <div className="loupe-live">
          <Live
            frame={frame}
            spec={spec}
            state={state}
            resetKey={code}
            render={(s) => (bench ? bench(props) : <s.C />)}
          />
        </div>
      </div>

      {frame.knobs && (
        <div className="loupe-knobs">
          {Object.entries(frame.knobs).map(([knob, values]) => (
            <div key={knob} role="group" aria-label={knob} className="loupe-knob">
              <REyebrow>{knob}</REyebrow>
              <div className="cs-row">
                {values.map((value) => (
                  <Chip
                    key={value}
                    size="sm"
                    colorScheme="primary"
                    variant={props[knob] === value ? "solid" : "outline"}
                    selected={props[knob] === value}
                    onSelectedChange={(on) => setProps(turnKnob(props, frame.needs, knob, value, on))}
                  >
                    {value}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="loupe-code">
        <code>{code}</code>
      </p>

      <div className="loupe-meta">
        <REyebrow>
          {SINGULAR[frame.t]} · frame {frame.num}
          {frame.from ? ` · came from ${frame.from}` : ""}
        </REyebrow>
        {frame.story && (
          <RLink href={frame.story} external className="loupe-story">
            Storybook →
          </RLink>
        )}
      </div>

      <div className="loupe-nav">
        <RButton size="xs" variant="ghost" colorScheme="neutral" onClick={() => onStep(-1)}>
          ← Previous
        </RButton>
        <RButton size="xs" variant="ghost" colorScheme="neutral" onClick={() => onStep(1)}>
          Next →
        </RButton>
      </div>
      {/* The Sheet treats a new title as a content swap and moves focus to it,
          which says the frame's name, so the line stays quiet there. */}
      <p role="status" className="sr-only">
        {phone ? "" : said}
      </p>
    </div>
  );

  return phone ? (
    <Sheet
      isOpen={open}
      onClose={onClose}
      onAfterClose={onAfterClose}
      title={frame.n}
      dragToDismiss
      className="loupe-panel"
    >
      {body}
    </Sheet>
  ) : (
    <Dialog
      isOpen={open}
      onClose={onClose}
      onAfterClose={onAfterClose}
      title={frame.n}
      size="xl"
      className="loupe-panel"
    >
      {body}
    </Dialog>
  );
}
