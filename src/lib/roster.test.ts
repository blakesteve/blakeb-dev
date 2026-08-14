import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getRosterComponentCount,
  getRosterComponents,
  getRosterRamp,
  getRosterTokenFamilies,
  getRosterTokens,
  getRosterVersion,
} from "./roster";

/**
 * These run against the really installed @blakesteve/roster rather than a
 * fixture, because the failure being guarded against is a Roster major moving
 * a file and this parser silently returning fewer components — a fixture would
 * keep passing through exactly that.
 *
 * So the assertions are structural: shapes, invariants, and the handful of
 * facts that would have to be deliberately changed. Nothing asserts an exact
 * component count, which every minor bump would break for no reason.
 */

const dts = (entry: string) =>
  readFileSync(join(process.cwd(), "node_modules", "@blakesteve", "roster", "dist", entry), "utf8");

describe("getRosterVersion", () => {
  it("reads a semver off the installed package", () => {
    expect(getRosterVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("agrees with the package.json the app depends on", () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), "node_modules", "@blakesteve", "roster", "package.json"), "utf8"),
    ) as { version: string };
    expect(getRosterVersion()).toBe(pkg.version);
  });
});

describe("getRosterComponents", () => {
  const components = getRosterComponents();

  it("finds components at all", () => {
    /* A parser that matches nothing is the failure mode; any regression to
       zero, or to a handful, means the export shape moved. */
    expect(components.length).toBeGreaterThan(20);
  });

  it("puts every component in a known tier", () => {
    for (const { name, tier } of components) {
      expect(["atoms", "molecules", "organisms"]).toContain(tier);
      expect(name).toMatch(/^[A-Z][A-Za-z0-9]*$/);
    }
  });

  it("populates all three tiers", () => {
    const tiers = new Set(components.map((c) => c.tier));
    expect([...tiers].sort()).toEqual(["atoms", "molecules", "organisms"]);
  });

  it("reads the second entry point, not just index.d.ts", () => {
    /* DataTable ships from `@blakesteve/roster/data-table` so its TanStack peer
       stays optional. Reading only index.d.ts undercounts by one, silently. */
    expect(dts("index.d.ts")).not.toContain("DataTable");
    expect(components).toContainEqual({ name: "DataTable", tier: "organisms" });
  });

  it("keeps the components index.d.ts does export", () => {
    expect(components).toContainEqual({ name: "Button", tier: "atoms" });
    expect(components).toContainEqual({ name: "Alert", tier: "molecules" });
    expect(components).toContainEqual({ name: "Navbar", tier: "organisms" });
  });

  it("excludes the sibling CVA variant modules", () => {
    /* `Button/button-variants` sits next to `Button/Button`; only the second is
       a component, and the folder-and-file match is what tells them apart. */
    expect(dts("index.d.ts")).toContain("button-variants");
    const names = components.map((c) => c.name);
    expect(names).not.toContain("buttonVariants");
    for (const name of names) {
      expect(name).not.toMatch(/variants$/i);
    }
  });

  it("returns each component once", () => {
    const names = components.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("counts what it lists", () => {
    expect(getRosterComponentCount()).toBe(components.length);
  });
});

describe("getRosterTokenFamilies", () => {
  const families = getRosterTokenFamilies();

  it("finds the shipped color families", () => {
    expect(families).toContain("primary");
    expect(families).toContain("gray");
    expect(families.length).toBeGreaterThan(5);
  });

  it("preserves the order tokens.css declares them in", () => {
    expect(families[0]).toBe("primary");
  });

  it("lists each family once", () => {
    expect(new Set(families).size).toBe(families.length);
  });

  it("ignores the single-value tokens that have no ramp", () => {
    /* `--roster-black`, `--roster-white`, `--roster-cream` carry no step. */
    expect(families).not.toContain("black");
    expect(families).not.toContain("white");
    expect(families).not.toContain("cream");
  });

  it("gives every family a readable ramp", () => {
    for (const family of families) {
      expect(getRosterRamp(family).length).toBeGreaterThan(0);
    }
  });
});

describe("getRosterRamp", () => {
  it("returns steps in ascending order", () => {
    const ramp = getRosterRamp("gray");
    const steps = ramp.map((s) => s.step);
    expect(steps.length).toBeGreaterThan(1);
    expect([...steps].sort((a, b) => a - b)).toEqual(steps);
  });

  it("pairs each step with the hex Roster ships", () => {
    for (const { step, shipped } of getRosterRamp("primary")) {
      expect(step).toBeGreaterThanOrEqual(50);
      expect(shipped).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });

  it("includes the anchor step every family defines", () => {
    expect(getRosterRamp("primary").map((s) => s.step)).toContain(500);
  });

  it("returns nothing for a family that is not shipped", () => {
    expect(getRosterRamp("chartreuse")).toEqual([]);
  });
});

describe("getRosterTokens", () => {
  it("pulls the requested declarations out of tokens.css", () => {
    const [primary, gray] = getRosterTokens(["roster-primary-500", "roster-gray-800"]);

    expect(primary.name).toBe("--roster-primary-500");
    expect(primary.value).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(gray.name).toBe("--roster-gray-800");
    expect(gray.value).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it("agrees with the ramp reader on the same token", () => {
    const [token] = getRosterTokens(["roster-primary-500"]);
    const step = getRosterRamp("primary").find((s) => s.step === 500);
    expect(token.value).toBe(step?.shipped);
  });

  it("answers in the order it was asked", () => {
    const names = ["roster-gray-800", "roster-primary-500", "roster-amber-500"];
    expect(getRosterTokens(names).map((t) => t.name)).toEqual(names.map((n) => `--${n}`));
  });

  it("falls back to black for a token that is not declared", () => {
    expect(getRosterTokens(["roster-nonexistent-500"])).toEqual([
      { name: "--roster-nonexistent-500", value: "#000000" },
    ]);
  });

  it("resolves the tokens the home page strip asks for", () => {
    const strip = [
      "roster-primary-500",
      "roster-teal-500",
      "roster-success-500",
      "roster-amber-500",
      "roster-error-500",
      "roster-orange-500",
      "roster-gray-500",
      "roster-gray-800",
    ];
    for (const token of getRosterTokens(strip)) {
      expect(token.value).not.toBe("#000000");
    }
  });
});
