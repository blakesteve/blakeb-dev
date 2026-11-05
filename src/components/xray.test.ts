import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (...path: string[]) => readFileSync(["src", ...path].join("/"), "utf8");
const css = read("app", "globals.css").replace(/\/\*[\s\S]*?\*\//g, "");

/** Every rule whose selector list names this, so a reworded selector can't hide one. */
function rulesFor(selector: string) {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(",").some((one) => one.trim() === selector))
    .map(([, , body]) => body);
  if (rules.length === 0) throw new Error(`no rule for ${selector}`);
  return rules.join("\n");
}

/* The overlay's placing is tested in `lib/xray-place.test.ts`. These pin what
   only a browser would otherwise catch. */
describe("X-ray's styles", () => {
  /* `position: relative` moved anything positioned the moment X-ray came on,
     and the `::after` it anchored ran a phone's page out to 398px. */
  it("doesn't change the layout of what it outlines", () => {
    expect(css).not.toMatch(/\[data-roster\]::after/);
    expect(rulesFor(".xray [data-roster]")).toContain("outline: 1px dashed");
    expect(rulesFor(".xray [data-roster]")).not.toMatch(/\bposition:/);
    expect(css).not.toMatch(/\.xray[^{}]*\[data-roster\][^{}]*\{[^}]*\bposition:/);
  });

  it("sits the page's labels under the bar and the bar's in it", () => {
    expect(rulesFor(".xray-layer-page")).toContain("z-index: 39;");
    expect(read("components", "top-bar.tsx")).toContain("sticky top-0 z-40");
  });

  it("sets labels in --panel, which clears 4.5:1 on the press sheet", () => {
    expect(rulesFor(".xray-tab")).toContain("color: var(--panel);");
  });
});

describe("the bar", () => {
  it("marks where it rests, just before itself", () => {
    expect(read("components", "top-bar.tsx")).toMatch(
      /<div data-bar-rest aria-hidden="true" \/>\s+<div data-top-bar /,
    );
  });
});

describe("what gets a label", () => {
  const scan = read("lib", "xray-scan.ts");

  /* Roster's Dialog marks the page behind it, and a test reading those loses
     every label the moment one opens. */
  it("doesn't decide from aria-hidden or inert", () => {
    expect(scan.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/aria-hidden|inert/);
  });

  it("leaves out X-ray's own chrome and portaled popups", () => {
    expect(scan).toContain('"[data-xray-ui],[data-xray-layer],#headlessui-portal-root"');
  });

  /* It's a Headless UI internal. If Roster's copy renames it, popups get
     labeled and counted, and this is the line that says so. */
  it("reads a portal root Roster's Headless UI still creates", () => {
    const portal = readFileSync(
      "node_modules/@blakesteve/roster/dist/node_modules/@headlessui/react/dist/components/portal/portal.js",
      "utf8",
    );
    expect(portal).toContain("headlessui-portal-root");
  });
});

it("builds its controls from Roster", () => {
  expect(read("components", "xray.tsx")).not.toMatch(/<button\b/);
});

it("hears Esc before a dialog does, so the top layer closes first", () => {
  expect(read("components", "xray.tsx")).toContain('window.addEventListener("keydown", onKey, true);');
});
