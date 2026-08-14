import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CAREER_START,
  ENGINEERING_START,
  formatDuration,
  formatMark,
  monthsBetween,
  positions,
  positionSpan,
  summary,
  yearsShipping,
  yearsShippingWords,
} from "./career";

/**
 * This module feeds both the /about timeline and the /resume document, so an
 * off-by-one here is an off-by-one on a résumé. The cases that matter are the
 * ones with no fixed answer: the open-ended role, singular versus plural, a
 * position whose title changed in place, and the rounding boundary that made
 * the home page and this function disagree about how long the career is.
 */

/** `monthsBetween(_, null)` reads the wall clock in UTC; pin it. */
function atMonth(mark: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${mark}-15T12:00:00.000Z`));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("monthsBetween", () => {
  it("counts whole months between two marks", () => {
    expect(monthsBetween("2013-12", "2019-07")).toBe(67);
  });

  it("counts across a year boundary", () => {
    expect(monthsBetween("2023-11", "2024-01")).toBe(2);
  });

  it("returns zero for the same mark", () => {
    expect(monthsBetween("2021-10", "2021-10")).toBe(0);
  });

  it("counts to the current month when end is null", () => {
    atMonth("2026-08");
    expect(monthsBetween("2025-01", null)).toBe(19);
  });

  it("tracks the clock rather than caching the present", () => {
    atMonth("2026-08");
    const before = monthsBetween("2025-01", null);
    atMonth("2027-08");
    expect(monthsBetween("2025-01", null)).toBe(before + 12);
  });
});

describe("formatDuration", () => {
  it("says under a month for zero", () => {
    expect(formatDuration(0)).toBe("under a month");
  });

  it("uses the singular for one month", () => {
    expect(formatDuration(1)).toBe("1 mo");
  });

  it("uses the plural for several months", () => {
    expect(formatDuration(10)).toBe("10 mos");
  });

  it("uses the singular for exactly one year", () => {
    expect(formatDuration(12)).toBe("1 yr");
  });

  it("uses the plural for two years", () => {
    expect(formatDuration(24)).toBe("2 yrs");
  });

  it("mixes a singular year with a singular month", () => {
    expect(formatDuration(13)).toBe("1 yr 1 mo");
  });

  it("mixes years and months", () => {
    expect(formatDuration(67)).toBe("5 yrs 7 mos");
  });

  it("drops the months when the span is whole years", () => {
    expect(formatDuration(36)).toBe("3 yrs");
  });
});

describe("formatMark", () => {
  it("renders the first month", () => {
    expect(formatMark("2010-01")).toBe("Jan 2010");
  });

  it("renders the last month", () => {
    expect(formatMark("2013-12")).toBe("Dec 2013");
  });

  it("does not zero-pad or reorder the year", () => {
    expect(formatMark("2010-11")).toBe("Nov 2010");
  });
});

describe("positionSpan", () => {
  const find = (org: string) => positions.find((p) => p.org === org)!;

  it("spans the oldest start to the newest end across several roles", () => {
    /* Cart.com: Senior from 2021-10, Lead from 2023-02 to 2023-11. */
    const cart = find("Cart.com");
    expect(cart.roles).toHaveLength(2);
    expect(positionSpan(cart)).toEqual({ start: "2021-10", end: "2023-11" });
  });

  it("reports the whole span, not the current role's", () => {
    const cart = find("Cart.com");
    const { start, end } = positionSpan(cart);
    expect(monthsBetween(start, end)).toBe(25);
    expect(formatDuration(monthsBetween(start, end))).toBe("2 yrs 1 mo");
  });

  it("keeps end null when a role is still open", () => {
    expect(positionSpan(find("Revmatics"))).toEqual({ start: "2025-01", end: null });
  });

  it("passes a single-role position through unchanged", () => {
    expect(positionSpan(find("IBM"))).toEqual({ start: "2013-12", end: "2019-07" });
  });
});

describe("career bounds", () => {
  it("starts the timeline at the first job of any track", () => {
    expect(CAREER_START).toBe("2009-02");
  });

  it("starts the shipping count at the first engineering job", () => {
    expect(ENGINEERING_START).toBe("2010-11");
  });

  it("ignores the design roles that precede it", () => {
    const design = positions.filter((p) => p.track === "design");
    expect(design.length).toBeGreaterThan(0);
    for (const p of design) {
      for (const role of p.roles) {
        expect(role.start < ENGINEERING_START).toBe(true);
      }
    }
  });
});

describe("yearsShipping", () => {
  it("rounds up rather than flooring", () => {
    /* Nov 2010 to Aug 2026 is 189 months: 15.75 years, which reads sixteen. */
    atMonth("2026-08");
    expect(monthsBetween(ENGINEERING_START, null)).toBe(189);
    expect(yearsShipping()).toBe(16);
    expect(yearsShippingWords()).toBe("sixteen");
  });

  it("rounds up from exactly half a year", () => {
    atMonth("2026-05");
    expect(monthsBetween(ENGINEERING_START, null)).toBe(186);
    expect(yearsShipping()).toBe(16);
  });

  it("rounds down below the halfway mark", () => {
    atMonth("2026-02");
    expect(monthsBetween(ENGINEERING_START, null)).toBe(183);
    expect(yearsShipping()).toBe(15);
    expect(yearsShippingWords()).toBe("fifteen");
  });

  it("reads the exact anniversary as a whole number", () => {
    atMonth("2026-11");
    expect(yearsShipping()).toBe(16);
  });
});

describe("yearsShippingWords", () => {
  it("spells the low end of the word list", () => {
    atMonth("2020-11");
    expect(yearsShipping()).toBe(10);
    expect(yearsShippingWords()).toBe("ten");
  });

  it("spells the high end of the word list", () => {
    atMonth("2030-11");
    expect(yearsShipping()).toBe(20);
    expect(yearsShippingWords()).toBe("twenty");
  });

  it("falls back to numerals past the word list", () => {
    atMonth("2031-11");
    expect(yearsShipping()).toBe(21);
    expect(yearsShippingWords()).toBe("21");
  });
});

describe("summary", () => {
  it("spells the current count into the résumé paragraph", () => {
    atMonth("2026-08");
    expect(summary()).toContain("sixteen years shipping software");
  });
});
