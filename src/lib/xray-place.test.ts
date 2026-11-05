import { describe, expect, it } from "vitest";
import { placeLabels, type Rect, type Scene, type Target, type TextRect } from "./xray-place";

const box = (left: number, top: number, width: number, height: number): Rect => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
});

let nextId = 0;
const target = (rect: Rect, extra: Partial<Target> = {}): Target => ({
  id: nextId++,
  name: "Badge",
  box: rect,
  width: 40,
  ancestors: [],
  ...extra,
});

const text = (rect: Rect, owners: number[] = []): TextRect => ({ ...rect, owners });

const scene = (targets: Target[], extra: Partial<Scene> = {}): Scene => ({
  targets,
  texts: [],
  width: 800,
  topLimit: 2,
  ...extra,
});

const only = (s: Scene) => {
  const [placement] = placeLabels(s);
  return placement;
};

describe("one label", () => {
  it("defaults to above, left-aligned, 3px off the box", () => {
    expect(only(scene([target(box(100, 200, 80, 30))]))).toMatchObject({
      x: 97,
      y: 184,
      side: "above",
      clear: true,
    });
  });

  it("flips below when above is off the page", () => {
    expect(only(scene([target(box(100, 10, 80, 30))]))).toMatchObject({
      x: 97,
      y: 43,
      side: "below",
      clear: true,
    });
  });

  it("refuses a slot above the limit even when it's otherwise clear", () => {
    const placed = only(scene([target(box(100, 70, 80, 30))], { topLimit: 54 + 1 }));
    expect(placed).toMatchObject({ y: 103, side: "below" });
  });

  it("slides right along the box when text blocks the left of it", () => {
    const words = text(box(90, 184, 60, 13));
    expect(only(scene([target(box(100, 200, 200, 30))], { texts: [words] }))).toMatchObject({
      x: 263,
      y: 184,
      side: "above",
      clear: true,
    });
  });

  it("slides to the center when text blocks both ends", () => {
    const texts = [text(box(90, 184, 60, 13)), text(box(250, 184, 60, 13))];
    expect(only(scene([target(box(100, 200, 200, 30))], { texts }))).toMatchObject({
      x: 180,
      y: 184,
      side: "above",
    });
  });

  it("flips when text blocks every slot above", () => {
    const texts = [text(box(0, 184, 800, 13))];
    expect(only(scene([target(box(100, 200, 200, 30))], { texts }))).toMatchObject({
      x: 97,
      y: 233,
      side: "below",
      clear: true,
    });
  });

  it("takes below on the right when only the left of it is blocked", () => {
    const texts = [text(box(0, 184, 800, 13)), text(box(90, 233, 60, 13))];
    expect(only(scene([target(box(100, 200, 200, 30))], { texts }))).toMatchObject({
      x: 263,
      y: 233,
      side: "below",
      clear: true,
    });
  });

  it("stacks a row up with a leader when above and below are both blocked", () => {
    const texts = [text(box(0, 184, 800, 13)), text(box(0, 233, 800, 13))];
    expect(only(scene([target(box(100, 200, 200, 30))], { texts }))).toMatchObject({
      x: 97,
      y: 170,
      side: "above",
      leader: { x: 100, y: 183, height: 14 },
      clear: true,
    });
  });

  it("stacks two rows up when one isn't enough", () => {
    const texts = [
      text(box(0, 170, 800, 27)),
      text(box(0, 233, 800, 13)),
    ];
    expect(only(scene([target(box(100, 200, 200, 30))], { texts }))).toMatchObject({
      y: 156,
      leader: { x: 100, y: 169, height: 28 },
      clear: true,
    });
  });

  it("clamps at the right edge, the 398px page at 375", () => {
    const toggle = target(box(330, 200, 30, 30), { width: 80 });
    expect(only(scene([toggle], { width: 375 }))).toMatchObject({ x: 293, y: 184 });
  });

  it("clamps at the left edge", () => {
    expect(only(scene([target(box(1, 200, 30, 30))]))).toMatchObject({ x: 2 });
  });

  it("holds 2px at the left when the name is wider than the page", () => {
    const wide = target(box(10, 200, 30, 30), { width: 400 });
    expect(only(scene([wide], { width: 320 }))).toMatchObject({ x: 2 });
  });

  it("ignores its own text, and only its own", () => {
    const card = target(box(100, 200, 200, 30));
    const inside = text(box(90, 184, 60, 13), [card.id]);
    expect(only(scene([card], { texts: [inside] }))).toMatchObject({ x: 97, y: 184 });

    const other = target(box(100, 200, 200, 30));
    const parents = text(box(90, 184, 60, 13), [card.id]);
    expect(only(scene([other], { texts: [parents] }))).toMatchObject({ x: 263 });
  });

  it("stays off the bar where it rests, though the bar is lower than the top", () => {
    const bar = box(0, 170, 800, 40);
    const placed = only(scene([target(box(100, 212, 80, 30))], { reserved: [bar] }));
    expect(placed).toMatchObject({ y: 245, side: "below" });
  });

  it("never drops a box above the top of the page", () => {
    expect(only(scene([target(box(100, -90, 80, 30))]))).toMatchObject({ x: 97, y: 2 });
  });
});

describe("when nothing is clear", () => {
  it("takes the slot with the least overlap and says so", () => {
    /* Text over every slot, with a 2px sliver in the row below. */
    const texts = [
      text(box(0, 150, 800, 47)),
      text(box(0, 244, 800, 2)),
    ];
    expect(only(scene([target(box(100, 200, 200, 30))], { texts }))).toMatchObject({
      y: 233,
      side: "below",
      clear: false,
    });
  });

  /* Every slot above is blocked solid, which leaves the two below: left at
     x 97, right at x 263, both at y 273. Each case puts a little of one
     obstacle on the left and a little text on the right. */
  const tall70 = () => target(box(100, 200, 200, 70));
  const wall = text(box(0, 156, 800, 41));
  const rightText = (area: number) => text(box(263, 273, area / 5, 5));
  const settle = (t: Target, s: Partial<Scene>, others: Target[] = []) =>
    placeLabels(scene([t, ...others], s)).find(({ id }) => id === t.id);

  it("weighs the bar at 4 to text's 1", () => {
    const s = { reserved: [box(97, 273, 40, 1)] };
    /* 40 of bar is 160, so 100 of text is cheaper. */
    expect(settle(tall70(), { ...s, texts: [wall, rightText(100)] })).toMatchObject({ x: 263, clear: false });
    /* 200 of text isn't. */
    expect(settle(tall70(), { ...s, texts: [wall, rightText(200)] })).toMatchObject({ x: 97, clear: false });
  });

  it("weighs a placed label at 4 to text's 1", () => {
    /* Its label lands at x 60 to 100, y 273: 39 of it on the left slot, 156. */
    const first = () => target(box(63, 289, 20, 1));
    expect(settle(tall70(), { texts: [wall, rightText(100)] }, [first()])).toMatchObject({ x: 263 });
    expect(settle(tall70(), { texts: [wall, rightText(200)] }, [first()])).toMatchObject({ x: 97 });
  });

  it("weighs a small box at 2 to text's 1", () => {
    /* 40 of small box is 80. */
    const neighbor = () => target(box(97, 273, 40, 1));
    expect(settle(tall70(), { texts: [wall, rightText(60)] }, [neighbor()])).toMatchObject({ x: 263 });
    expect(settle(tall70(), { texts: [wall, rightText(100)] }, [neighbor()])).toMatchObject({ x: 97 });
  });
});

describe("two labels", () => {
  it("lets the smaller box choose first, wherever it's listed", () => {
    const card = target(box(100, 200, 300, 100), { name: "Card" });
    const badge = target(box(100, 200, 30, 20), { name: "Badge", ancestors: [card.id] });
    const placed = placeLabels(scene([card, badge]));
    expect(placed.map(({ name, x, y }) => [name, x, y])).toEqual([
      ["Badge", 97, 184],
      ["Card", 363, 184],
    ]);
  });

  it("keeps a label off a small box beside it, but not off its own parent", () => {
    const neighbor = target(box(90, 170, 200, 26));
    const box2 = target(box(100, 200, 400, 40));
    const placed = placeLabels(scene([neighbor, box2]));
    expect(placed.find(({ id }) => id === box2.id)).toMatchObject({ x: 463, y: 184 });

    const parent = target(box(90, 170, 200, 26));
    const child = target(box(100, 200, 400, 40), { ancestors: [parent.id] });
    const nested = placeLabels(scene([parent, child]));
    expect(nested.find(({ id }) => id === child.id)).toMatchObject({ x: 97, y: 184 });
  });

  it("lets a label sit over a small box inside its own component", () => {
    const parent = target(box(100, 200, 400, 200));
    const child = target(box(100, 180, 60, 30), { ancestors: [parent.id] });
    const placed = placeLabels(scene([parent, child]));
    expect(placed.find(({ id }) => id === parent.id)).toMatchObject({ x: 97, y: 184 });
  });

  it("counts a box up to 64px tall as an obstacle, and no taller", () => {
    const inFront = () => target(box(100, 200, 100, 20));
    const at = (height: number) => {
      const t = inFront();
      const placed = placeLabels(scene([target(box(90, 196 - height, 200, height)), t]));
      return placed.find(({ id }) => id === t.id);
    };
    expect(at(64)).not.toMatchObject({ x: 97, y: 184 });
    expect(at(65)).toMatchObject({ x: 97, y: 184 });
  });
});

describe("a tall box", () => {
  it("gets a track down to its bottom, from the label's own position", () => {
    const tall = target(box(100, 200, 300, 500));
    expect(only(scene([tall], { pins: true }))).toMatchObject({ y: 184, track: 516 });
  });

  it("starts pinning just over the line", () => {
    expect(only(scene([target(box(100, 200, 300, 120))], { pins: true })).track).toBeUndefined();
    expect(only(scene([target(box(100, 200, 300, 121))], { pins: true })).track).toBe(137);
  });

  it("doesn't get one in the bar", () => {
    expect(only(scene([target(box(100, 200, 300, 500))])).track).toBeUndefined();
  });

  it("doesn't get one below, where it has nothing to travel in", () => {
    const placed = only(scene([target(box(100, 10, 300, 500))], { pins: true }));
    expect(placed).toMatchObject({ side: "below" });
    expect(placed.track).toBeUndefined();
  });
});

describe("the bar", () => {
  it("flips the toggle below the bar's edge, past the bar, with a 1px limit", () => {
    const toggle = target(box(320, 12, 30, 30), { width: 60 });
    expect(only(scene([toggle], { width: 375, topLimit: 1 }))).toMatchObject({
      x: 313,
      y: 45,
      side: "below",
    });
  });

  it("answers only to the text it's given, so a bar scene ignores the page's", () => {
    const link = target(box(100, 20, 40, 15), { width: 30 });
    const pageText = [text(box(0, 0, 800, 18))];
    expect(only(scene([link], { topLimit: 1, texts: pageText }))).toMatchObject({ side: "below" });
    expect(only(scene([link], { topLimit: 1 }))).toMatchObject({ y: 4, side: "above" });
  });
});

it("returns one label per target, whatever it had to do", () => {
  const targets = Array.from({ length: 12 }, () => target(box(100, 200, 30, 30)));
  const texts = [text(box(0, 0, 800, 600))];
  expect(placeLabels(scene(targets, { texts }))).toHaveLength(12);
});
