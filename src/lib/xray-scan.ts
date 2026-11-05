import { placeLabels, type Placement, type Rect, type Target, type TextRect } from "./xray-place";

/**
 * What X-ray reads off the page: which components to name, and the rectangles
 * the solver needs to name them. Browser only, and everything it decides is in
 * `xray-place.ts`.
 */

export type Found = { name: string; count: number };

export type Scan = {
  found: Found[];
  page: Placement[];
  bar: Placement[];
  barHost: HTMLElement | null;
  barHeight: number;
};

/**
 * X-ray's own chrome, and popups. A popup counts as part of its trigger, and
 * Headless UI puts every one in this root at the end of `<body>`.
 */
const NOT_THE_PAGE = "[data-xray-ui],[data-xray-layer],#headlessui-portal-root";

/* Clipped to nothing, but its text keeps a full rect, so it would hold labels
   off space that looks empty. */
const SCREEN_READER_ONLY = ".sr-only,.rst\\:sr-only";

/* Plain visibility, on purpose. Roster's Dialog marks the page behind it with
   `aria-hidden` and `inert`, and a test using those loses every label the
   moment one opens. `?.` for browsers older than `checkVisibility`. */
const isVisible = (element: Element) =>
  element.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false;

/** The one test for both the labels and the legend's count. */
export function rosterElements() {
  return [...document.querySelectorAll<HTMLElement>("[data-roster]")].filter((element) => {
    if (element.closest(NOT_THE_PAGE) || !isVisible(element)) return false;
    const { width, height } = element.getBoundingClientRect();
    return width > 1 && height > 1;
  });
}

let context: CanvasRenderingContext2D | null = null;

/** 9px Plex Mono, uppercase, `0.1em` tracking, padded 5px each side. */
function labelWidth(name: string, font: string) {
  context ??= document.createElement("canvas").getContext("2d");
  if (!context) return name.length * 7 + 10;
  context.font = `9px ${font}`;
  return Math.ceil(context.measureText(name.toUpperCase()).width + name.length * 0.9 + 10);
}

const offset = (rect: DOMRect, x: number, y: number): Rect => ({
  left: rect.left - x,
  top: rect.top - y,
  right: rect.right - x,
  bottom: rect.bottom - y,
});

/** The annotated components an element sits inside, itself included. */
function ownersOf(element: Element | null, ids: Map<Element, number>) {
  const owners: number[] = [];
  for (let node = element; node; node = node.parentElement) {
    const id = ids.get(node);
    if (id !== undefined) owners.push(id);
  }
  return owners;
}

function textRects(root: Element, ids: Map<Element, number>, x: number, y: number, skip?: Element | null) {
  const rects: TextRect[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const readable = new Map<Element, boolean>();

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || !node.textContent?.trim()) continue;

    let keep = readable.get(parent);
    if (keep === undefined) {
      keep =
        !parent.closest(`${NOT_THE_PAGE},${SCREEN_READER_ONLY},script,style`) &&
        !skip?.contains(parent) &&
        isVisible(parent);
      readable.set(parent, keep);
    }
    if (!keep) continue;

    range.selectNodeContents(node);
    const owners = ownersOf(parent, ids);
    for (const rect of range.getClientRects()) {
      if (rect.width > 0) rects.push({ ...offset(rect, x, y), owners });
    }
  }
  return rects;
}

function targetsFrom(
  elements: HTMLElement[],
  ids: Map<Element, number>,
  font: string,
  x: number,
  y: number,
): Target[] {
  return elements.map((element) => {
    const name = element.getAttribute("data-roster") ?? "";
    return {
      id: ids.get(element) as number,
      name,
      box: offset(element.getBoundingClientRect(), x, y),
      width: labelWidth(name, font),
      ancestors: ownersOf(element.parentElement, ids),
    };
  });
}

export function scan(): Scan {
  const elements = rosterElements();
  const ids = new Map<Element, number>(elements.map((element, id) => [element, id]));

  const counts = new Map<string, number>();
  for (const element of elements) {
    const name = element.getAttribute("data-roster") ?? "";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const found = [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const root = document.documentElement;
  const font = getComputedStyle(root).getPropertyValue("--font-util");
  const barHost = document.querySelector<HTMLElement>("[data-top-bar]");
  const barBox = barHost?.getBoundingClientRect();
  const barHeight = barHost?.offsetHeight ?? 0;
  const inBar = elements.filter((element) => barHost?.contains(element));
  const onPage = elements.filter((element) => !barHost?.contains(element));

  /* Document coordinates: the page layer sits at the document's origin, so a
     label scrolls with what it names and no listener has to move it. */
  const x = -window.scrollX;
  const y = -window.scrollY;
  const width = root.clientWidth;

  /* Where the bar rests, not where it is now: it's stuck over something else
     once you scroll, and that mustn't change where a label goes. */
  const sentinel = document.querySelector("[data-bar-rest]")?.getBoundingClientRect();
  const restTop = sentinel ? sentinel.top - y : 0;
  const reserved = barHost
    ? [{ left: 0, top: restTop, right: width, bottom: restTop + barHeight }]
    : [];

  const page = placeLabels({
    targets: targetsFrom(onPage, ids, font, x, y),
    texts: textRects(document.body, ids, x, y, barHost),
    width,
    /* The bar's bottom edge is the ceiling, except on the home page, where
       the bar rests further down and the folio above it is page too. */
    topLimit: restTop < 1 ? restTop + barHeight : 2,
    reserved,
    pins: true,
  });

  const bar =
    barHost && barBox
      ? placeLabels({
          targets: targetsFrom(inBar, ids, font, barBox.left, barBox.top),
          texts: textRects(barHost, ids, barBox.left, barBox.top),
          width: barBox.width,
          topLimit: 1,
        })
      : [];

  return { found, page, bar, barHost: barHost ?? null, barHeight };
}

/** Whether Esc belongs to something on top of the page, rather than to X-ray. */
export function isTopLayerOpen() {
  return [...document.querySelectorAll('[role="dialog"],[role="alertdialog"],[role="listbox"],[role="menu"]')].some(
    isVisible,
  );
}
