"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@blakesteve/roster";

/**
 * What a tier chunk gives the sheet for one frame. `C` is the specimen as the
 * grid shows it. `bench` renders it again from the loupe's knobs, for a frame
 * whose index entry has knobs.
 */
export type FrameSpec = {
  C: ComponentType;
  bench?: (props: Record<string, string>) => ReactNode;
};

/** Roster's Button in this site's control face, the class `RButton` adds. */
export const CONTROL = "font-[family-name:var(--control-face,var(--font-util))]";

/** A small round crest for a matchup's teams: Roster rings the winner's logo
    in a green circle, which a shield didn't fill and a green crest hid. */
export const crest = (fill: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${fill}"/><text x="24" y="30.5" font-family="Arial" font-weight="700" font-size="17" text-anchor="middle" fill="#fff">${letter}</text></svg>`,
  )}`;

export const LOGO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4" fill="none" stroke="#d6006d" stroke-width="1.9"/><path d="M12 0v24M0 12h24" stroke="#8a8c84" stroke-width="1.2"/></svg>`,
)}`;

export const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0090ce"/><stop offset=".55" stop-color="#d6006d"/><stop offset="1" stop-color="#f5d400"/></linearGradient></defs><rect width="320" height="200" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-opacity=".5"><circle cx="160" cy="100" r="58"/><path d="M160 20v160M60 100h200"/></g></svg>`,
)}`;

export const STOCKS = [
  { value: "uncoated", label: "Uncoated 100#" },
  { value: "gloss", label: "Gloss text" },
  { value: "newsprint", label: "Newsprint" },
];

export const APPS = ["Roster", "Game Verdict", "Retrospect", "MegaSquad", "Bragging Rocks", "BB's Grove"].map(
  (label) => ({ value: label, label }),
);

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A button that opens something the frame owns, a Dialog or a Sheet. */
export function Opener({
  label,
  children,
}: {
  label: string;
  children: (open: boolean, setOpen: (open: boolean) => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" colorScheme="neutral" className={CONTROL} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {children(open, setOpen)}
    </>
  );
}

/** A frame that says something rather than showing it: DataTable, ThemeToggle. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="cs-say">{children}</p>;
}
