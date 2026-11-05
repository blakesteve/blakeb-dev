/**
 * Where X-ray's labels go, from rectangles alone: nothing here touches the DOM,
 * so the rule can be tested with literal numbers.
 *
 * Above by default, below when there's no room, decided from the measured box.
 * Text counts as an obstacle, because specimens sit closer under their eyebrows
 * than a label is tall, and "above" alone lands on those eyebrows. The smallest
 * boxes choose first: they have the fewest places to go, and a Card can put its
 * label anywhere along its edge.
 */

/** Label height, and the gap between a label and its box. */
export const LABEL_HEIGHT = 13;
export const LABEL_OFFSET = 3;
/** A box taller than this gets its label pinned under the bar. */
export const TALL = 120;
/** A box this short or shorter is an obstacle to other components' labels. */
export const SMALL = 64;
/** How far a label stays inside the edges of the page. */
export const EDGE = 2;

const ROW = LABEL_HEIGHT + 1;
const WEIGHT = { label: 4, reserved: 4, small: 2, text: 1 };

export type Rect = { left: number; top: number; right: number; bottom: number };

export type Target = {
  id: number;
  name: string;
  box: Rect;
  /** The label's measured width. */
  width: number;
  /** Every annotated component this one sits inside. */
  ancestors: readonly number[];
};

/** A line of text, and the annotated components it sits inside. */
export type TextRect = Rect & { owners: readonly number[] };

export type Scene = {
  targets: readonly Target[];
  texts: readonly TextRect[];
  /** The width of the page or bar these coordinates are in. */
  width: number;
  /** A label starting above this line is refused outright. */
  topLimit: number;
  /** Space a label shouldn't take, like the bar where it rests. */
  reserved?: readonly Rect[];
  /** Whether a tall box's label pins. The page's do; the bar's never would. */
  pins?: boolean;
};

export type Placement = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  side: "above" | "below";
  /** From a label stacked rows up, down to its box. */
  leader?: { x: number; y: number; height: number };
  /** The height of the track a pinned label travels in. */
  track?: number;
  /** Whether it had to settle for overlapping something. */
  clear: boolean;
};

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

const areaOf = ({ box }: Target) => (box.right - box.left) * (box.bottom - box.top);

export function placeLabels({ targets, texts, width, topLimit, reserved = [], pins = false }: Scene) {
  const small = targets.filter(({ box }) => box.bottom - box.top <= SMALL);
  const taken: Rect[] = [];
  const placements: Placement[] = [];

  for (const target of [...targets].sort((a, b) => areaOf(a) - areaOf(b))) {
    const { box, id, name } = target;
    const w = target.width;
    const clampX = (x: number) => Math.max(EDGE, Math.min(x, width - w - EDGE));

    const left = clampX(box.left - LABEL_OFFSET);
    const right = clampX(box.right + LABEL_OFFSET - w);
    const center = clampX(box.left + (box.right - box.left - w) / 2);
    const above = box.top - LABEL_OFFSET - LABEL_HEIGHT;
    const below = box.bottom + LABEL_OFFSET;
    const candidates = [
      { x: left, y: above },
      { x: right, y: above },
      { x: center, y: above },
      { x: left, y: below },
      { x: right, y: below },
      { x: left, y: above - ROW },
      { x: left, y: above - 2 * ROW },
    ];

    const cost = (rect: Rect) => {
      let sum = 0;
      for (const label of taken) sum += overlap(rect, label) * WEIGHT.label;
      for (const space of reserved) sum += overlap(rect, space) * WEIGHT.reserved;
      for (const other of small) {
        if (other.ancestors.includes(id) || target.ancestors.includes(other.id)) continue;
        sum += overlap(rect, other.box) * WEIGHT.small;
      }
      for (const text of texts) {
        if (!text.owners.includes(id)) sum += overlap(rect, text) * WEIGHT.text;
      }
      return sum;
    };

    const rectAt = ({ x, y }: { x: number; y: number }) => ({
      left: x,
      top: y,
      right: x + w,
      bottom: y + LABEL_HEIGHT,
    });

    /* Nothing is ever dropped: if every slot is above the limit, the box is
       off the top of the page and the label waits at the limit for it. */
    let best = { x: left, y: Math.max(topLimit, below) };
    let lowest = Infinity;
    for (const candidate of candidates) {
      if (candidate.y < topLimit) continue;
      const score = cost(rectAt(candidate));
      if (score < lowest) {
        best = candidate;
        lowest = score;
      }
      if (score === 0) break;
    }

    taken.push(rectAt(best));

    const isBelow = best.y >= box.bottom;
    const placement: Placement = {
      id,
      name,
      x: best.x,
      y: best.y,
      width: w,
      side: isBelow ? "below" : "above",
      clear: lowest === 0,
    };
    if (best.y < above) {
      const y = best.y + LABEL_HEIGHT;
      placement.leader = { x: best.x + LABEL_OFFSET, y, height: box.top - LABEL_OFFSET - y };
    }
    if (pins && !isBelow && box.bottom - box.top > TALL) placement.track = box.bottom - best.y;
    placements.push(placement);
  }

  return placements;
}
