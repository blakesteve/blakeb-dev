import { describe, expect, it } from "vitest";

import {
  crtTogglePulses,
  crtToggleVisible,
  hasReachedBottom,
  type CrtStored,
} from "./crt-reveal";

/**
 * The CRT toggle shipped broken twice, and both times the failure was a
 * predicate rather than a rendering fault: the control pinned itself to every
 * visit after a single click, and it re-announced itself on every page load.
 * Neither needed a DOM to reproduce, so neither needs one to be caught.
 *
 * The cases named "regression" below are the exact reported bugs.
 */

const STATES: CrtStored[] = ["on", "off", null];

describe("crtToggleVisible", () => {
  it("hides the control before the reader reaches the end", () => {
    expect(crtToggleVisible(null, false)).toBe(false);
  });

  it("reveals it at the end of the page", () => {
    expect(crtToggleVisible(null, true)).toBe(true);
  });

  // The reported bug. Visibility was `stored !== null`, and turning the effect
  // OFF still writes a value, so one click pinned the control open forever.
  it("regression: an effect turned off does not pin the control open", () => {
    expect(crtToggleVisible("off", false)).toBe(false);
  });

  it("regression: no stored value survives as a reason to show it", () => {
    const pinned = STATES.filter((state) => crtToggleVisible(state, false));
    expect(pinned).toEqual(["on"]);
  });

  // The one case that must persist: with the scanlines running, this button is
  // the only way to stop them, so hiding it would strand the reader.
  it("keeps the control while the effect is running, wherever they are", () => {
    expect(crtToggleVisible("on", false)).toBe(true);
    expect(crtToggleVisible("on", true)).toBe(true);
  });

  it("shows it at the end regardless of what is stored", () => {
    for (const state of STATES) {
      expect(crtToggleVisible(state, true)).toBe(true);
    }
  });
});

describe("crtTogglePulses", () => {
  it("pulses when the reader reaches the end and finds it", () => {
    expect(crtTogglePulses(null, true, false)).toBe(true);
    expect(crtTogglePulses("off", true, false)).toBe(true);
  });

  it("stays silent until the end is reached", () => {
    for (const state of STATES) {
      expect(crtTogglePulses(state, false, false)).toBe(false);
    }
  });

  // The reported bug. Keyed on visibility, this fired on every load, because
  // the stored value arrives a beat after hydration and flips it true.
  it("regression: does not announce a control that is already on screen", () => {
    expect(crtTogglePulses("on", true, false)).toBe(false);
  });

  // Clicking mid-animation removes the class before `animationend` fires, so
  // the latch also has to close on click, or toggling off replays the pulse.
  it("regression: never pulses twice once the latch has closed", () => {
    for (const state of STATES) {
      expect(crtTogglePulses(state, true, true)).toBe(false);
    }
  });

  it("only ever pulses in the one state that earns it", () => {
    const pulsing = STATES.flatMap((state) =>
      [true, false].flatMap((reached) =>
        [true, false]
          .filter((latched) => crtTogglePulses(state, reached, latched))
          .map(() => ({ state, reached })),
      ),
    );
    expect(pulsing).toEqual([
      { state: "off", reached: true },
      { state: null, reached: true },
    ]);
  });
});

describe("hasReachedBottom", () => {
  const LONG_PAGE = 13_000;
  const VIEWPORT = 800;

  it("is false at the top of a long page", () => {
    expect(hasReachedBottom(0, VIEWPORT, LONG_PAGE)).toBe(false);
  });

  it("is false in the middle of one", () => {
    expect(hasReachedBottom(LONG_PAGE / 2, VIEWPORT, LONG_PAGE)).toBe(false);
  });

  it("is true at the foot of the document", () => {
    expect(hasReachedBottom(LONG_PAGE - VIEWPORT, VIEWPORT, LONG_PAGE)).toBe(true);
  });

  // The threshold is what lets it fire slightly early, so a reader who stops
  // just shy of the very last pixel still gets the reveal.
  it("fires within the threshold, and not a pixel before", () => {
    const atThreshold = LONG_PAGE - VIEWPORT - 96;
    expect(hasReachedBottom(atThreshold, VIEWPORT, LONG_PAGE)).toBe(true);
    expect(hasReachedBottom(atThreshold - 1, VIEWPORT, LONG_PAGE)).toBe(false);
  });

  // A page with nothing to scroll has already shown the reader its end.
  it("is true when the page is shorter than the viewport", () => {
    expect(hasReachedBottom(0, VIEWPORT, 400)).toBe(true);
  });

  // Guards the measurement that has to wait a frame: read during commit,
  // scrollHeight can be short enough to look like the bottom of the page and
  // hand out the secret on arrival.
  it("would fire at the top if the document measured short", () => {
    expect(hasReachedBottom(0, VIEWPORT, 500)).toBe(true);
    expect(hasReachedBottom(0, VIEWPORT, LONG_PAGE)).toBe(false);
  });
});
