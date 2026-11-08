import { describe, expect, it } from "vitest";
import { getRosterComponents } from "@/lib/roster";
import { FRAME_INDEX, TIERS, turnKnob } from "./frames";
import { ATOMS } from "./atoms";
import { MOLECULES } from "./molecules";
import { ORGANISMS } from "./organisms";
import type { FrameSpec } from "./kit";

const CHUNKS: Record<string, Record<string, FrameSpec>> = { atoms: ATOMS, molecules: MOLECULES, organisms: ORGANISMS };

/**
 * The Contact sheet promises every part of the library, and the library is
 * read from the installed package. So the frames are held to that package, not
 * to a count: a Roster release that adds, drops or renames a component fails
 * here until its frame is written, rather than shipping a sheet that skips one.
 */

const key = (tier: string, name: string) => `${tier}/${name}`;

/** What the installed package has that the index doesn't, and the other way around. */
function compare(index: readonly { n: string; t: string }[], installed: { name: string; tier: string }[]) {
  const framed = new Set(index.map((f) => key(f.t, f.n)));
  const shipped = new Set(installed.map((c) => key(c.tier, c.name)));
  return {
    unframed: [...shipped].filter((k) => !framed.has(k)).sort(),
    stale: [...framed].filter((k) => !shipped.has(k)).sort(),
  };
}

describe("the Contact sheet's frames", () => {
  it("are exactly the components the installed Roster ships, each in its tier", () => {
    expect(compare(FRAME_INDEX, getRosterComponents())).toEqual({ unframed: [], stale: [] });
  });

  it("name each component once", () => {
    const names = FRAME_INDEX.map((f) => f.n);
    expect(new Set(names).size).toBe(names.length);
  });

  /* The comparison itself, so the check above can't pass by comparing nothing. */
  it("catch a component a release adds, drops or moves", () => {
    const installed = getRosterComponents();
    expect(compare(FRAME_INDEX, [...installed, { name: "Stamp", tier: "atoms" }])).toEqual({
      unframed: ["atoms/Stamp"],
      stale: [],
    });
    expect(compare(FRAME_INDEX, installed.filter((c) => c.name !== "Timeline"))).toEqual({
      unframed: [],
      stale: ["molecules/Timeline"],
    });
    expect(
      compare(
        FRAME_INDEX,
        installed.map((c) => (c.name === "Sheet" ? { ...c, tier: "molecules" } : c)),
      ),
    ).toEqual({ unframed: ["molecules/Sheet"], stale: ["organisms/Sheet"] });
  });

  /* `tsc` already holds each chunk to the index's names. This holds them at
     runtime too, and proves the chunks are the three the sheet loads. */
  it("each have a live specimen in their tier's chunk, and nothing else is there", () => {
    for (const tier of TIERS) {
      const expected = FRAME_INDEX.filter((f) => f.t === tier).map((f) => f.n).sort();
      expect(Object.keys(CHUNKS[tier]).sort(), tier).toEqual(expected);
      for (const name of expected) {
        expect(typeof CHUNKS[tier][name].C, name).toBe("function");
      }
    }
  });

  it("have a bench for every frame with knobs, so the knobs change something", () => {
    const knobbed = FRAME_INDEX.filter((f) => "knobs" in f).map((f) => f.n);
    expect(knobbed).toEqual([
      "Avatar",
      "Badge",
      "Button",
      "Card",
      "Chip",
      "Eyebrow",
      "Input",
      "Pill",
      "Alert",
      "CallToAction",
      "EmptyState",
      "Tabs",
    ]);
    for (const frame of FRAME_INDEX.filter((f) => "knobs" in f)) {
      expect(typeof CHUNKS[frame.t][frame.n].bench, frame.n).toBe("function");
    }
  });

  /* Spec 7.3's provenance: Blake confirmed it on 7 Nov 2026, FileUpload's pending him. */
  it("say where a component came from only where the record does", () => {
    const from = Object.fromEntries(
      FRAME_INDEX.filter((f) => "from" in f).map((f) => [f.n, (f as { from: string }).from]),
    );
    expect(from).toEqual({
      AvatarStrip: "Game Verdict",
      SegmentBar: "Game Verdict",
      LiquidTabs: "Game Verdict",
      Eyebrow: "this site",
      MatchupCard: "MegaSquad",
      Slider: "MegaSquad",
      FileUpload: "Bragging Rocks",
      RadioTileGroup: "Bragging Rocks",
      Timeline: "Bragging Rocks",
      ModerationQueue: "BB's Grove",
    });
  });
});

describe("The loupe's knobs", () => {
  const TABS = { liquidStyle: ["variant", "liquid"] } as const;

  it("only ever need a knob and a value the frame offers", () => {
    for (const frame of FRAME_INDEX) {
      if (!("needs" in frame)) continue;
      for (const [knob, [dep, value]] of Object.entries(frame.needs)) {
        expect(Object.keys(frame.knobs), frame.n).toContain(knob);
        expect(frame.knobs[dep as keyof typeof frame.knobs], frame.n).toContain(value);
      }
    }
  });

  it("set the knob a choice needs, and clear the choice when that knob moves off", () => {
    expect(turnKnob({}, null, "variant", "soft", true)).toEqual({ variant: "soft" });
    expect(turnKnob({ variant: "soft" }, null, "variant", "soft", false)).toEqual({});
    expect(turnKnob({}, TABS, "liquidStyle", "filled", true)).toEqual({ liquidStyle: "filled", variant: "liquid" });
    expect(turnKnob({ variant: "liquid", liquidStyle: "filled" }, TABS, "variant", "plain", true)).toEqual({
      variant: "plain",
    });
    expect(turnKnob({ variant: "liquid", liquidStyle: "filled" }, TABS, "variant", "liquid", false)).toEqual({});
    expect(turnKnob({ variant: "liquid", liquidStyle: "pill" }, TABS, "liquidStyle", "pill", false)).toEqual({
      variant: "liquid",
    });
  });

  it("follow a chain of needs, and clear a knob whose need another choice took away", () => {
    const chain = { a: ["b", "x"], b: ["c", "y"] } as const;
    expect(turnKnob({}, chain, "a", "1", true)).toEqual({ a: "1", b: "x", c: "y" });
    expect(turnKnob({ a: "1", b: "x", c: "y" }, chain, "c", "y", false)).toEqual({});
    const shared = { a: ["c", "x"], b: ["c", "y"] } as const;
    expect(turnKnob({ a: "1", c: "x" }, shared, "b", "1", true)).toEqual({ b: "1", c: "y" });
    const loop = { a: ["b", "1"], b: ["a", "1"] } as const;
    expect(turnKnob({}, loop, "a", "1", true)).toEqual({ a: "1", b: "1" });
  });
});
