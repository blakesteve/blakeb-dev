import { describe, expect, it } from "vitest";

import {
  NAV_ITEMS,
  SPECIMENS_PAGE,
  ariaCurrentFor,
  isPastTitle,
  isShowingRunningHead,
  tabSlide,
} from "./nav";

/**
 * The bar's rules, as literals. The handoff itself runs in a browser; what it
 * decides is here, each case beside the one it must not be confused with.
 */

describe("the nav items", () => {
  it("are the four sections, in order, with the second read from the one constant", () => {
    expect(NAV_ITEMS.map(({ label, href }) => [label, href])).toEqual([
      ["Work", "/work"],
      [SPECIMENS_PAGE.label, SPECIMENS_PAGE.href],
      ["About", "/about"],
      ["Writing", "/writing"],
    ]);
  });

  it("leave the résumé out", () => {
    expect(NAV_ITEMS.map(({ href }) => href)).not.toContain("/resume");
  });
});

describe("ariaCurrentFor", () => {
  it("says page on the section's own page, and only for that item", () => {
    expect(ariaCurrentFor("work", { section: "work" })).toBe("page");
    expect(ariaCurrentFor("about", { section: "work" })).toBeUndefined();
  });

  it("says true on the section a page sits under, as the résumé does under About", () => {
    expect(ariaCurrentFor("work", { within: "work" })).toBe("true");
    expect(ariaCurrentFor("about", { within: "about" })).toBe("true");
    expect(ariaCurrentFor("writing", { within: "about" })).toBeUndefined();
  });

  it("lights nothing on a page with no section, as on the 404 and the home page", () => {
    for (const { section } of NAV_ITEMS) expect(ariaCurrentFor(section, {})).toBeUndefined();
  });
});

describe("isPastTitle", () => {
  const BAR = 53;

  it("is past once the title has gone up above the bar's bottom edge", () => {
    expect(isPastTitle({ isIntersecting: false, top: -200 }, BAR)).toBe(true);
    expect(isPastTitle({ isIntersecting: false, top: BAR - 1 }, BAR)).toBe(true);
  });

  it("isn't past while the title is on screen", () => {
    expect(isPastTitle({ isIntersecting: true, top: 200 }, BAR)).toBe(false);
    expect(isPastTitle({ isIntersecting: true, top: -10 }, BAR)).toBe(false);
  });

  it("isn't past for a title below the viewport, which isn't intersecting either", () => {
    expect(isPastTitle({ isIntersecting: false, top: 2_000 }, BAR)).toBe(false);
    expect(isPastTitle({ isIntersecting: false, top: BAR }, BAR)).toBe(false);
  });
});

describe("tabSlide", () => {
  const WORK = { left: 72, width: 30 };
  const ABOUT = { left: 184, width: 40 };

  it("starts at the last item, sized to it, and ends where the tab already is", () => {
    expect(tabSlide(WORK, ABOUT)).toEqual([
      { transform: "translateX(-112px) scaleX(0.75)" },
      { transform: "none" },
    ]);
    expect(tabSlide(ABOUT, WORK)?.[0].transform).toBe("translateX(112px) scaleX(1.3333333333333333)");
  });

  it("doesn't slide on a hop within a section, where the lit item stays put", () => {
    expect(tabSlide(WORK, { ...WORK })).toBeNull();
  });

  it("doesn't slide when no item was lit, or none is lit now", () => {
    expect(tabSlide(null, ABOUT)).toBeNull();
    expect(tabSlide(WORK, null)).toBeNull();
    expect(tabSlide(null, null)).toBeNull();
  });

  it("still slides between two items the same width", () => {
    expect(tabSlide(WORK, { left: 200, width: 30 })?.[0].transform).toBe("translateX(-128px) scaleX(1)");
  });
});

describe("isShowingRunningHead", () => {
  it("shows on the path it was measured on, once past the title", () => {
    expect(isShowingRunningHead({ path: "/work/roster", past: true }, "/work/roster")).toBe(true);
    expect(isShowingRunningHead({ path: "/work/roster", past: false }, "/work/roster")).toBe(false);
  });

  it("resets on a client navigation, so a past title can't survive it", () => {
    expect(isShowingRunningHead({ path: "/work/roster", past: true }, "/work/retrospect")).toBe(false);
  });

  it("stays at the top before anything has been measured", () => {
    expect(isShowingRunningHead(null, "/work/roster")).toBe(false);
  });
});
