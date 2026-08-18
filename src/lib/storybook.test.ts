import { describe, expect, it, vi } from "vitest";

import { STORYBOOK_URL } from "./storybook";

/**
 * `.gitignore` excludes `.env*`, so a production build never receives
 * `NEXT_PUBLIC_STORYBOOK_URL` and falls back. That fallback used to be an empty
 * string in one module and the deployed URL in another, which shipped a site
 * where the Roster case study linked to Storybook while `/system` printed every
 * component name as plain text and X-ray announced that Storybook was not
 * deployed.
 *
 * A local run cannot see any of that, because `.env.local` sets the variable
 * and both branches agree. These assert the fallback itself.
 */

describe("STORYBOOK_URL", () => {
  // The regression: an empty default silently disables every Storybook link in
  // production, and does it while the case study still links out.
  it("falls back to a real deployment rather than an empty string", () => {
    expect(STORYBOOK_URL).not.toBe("");
    expect(() => new URL(STORYBOOK_URL)).not.toThrow();
    expect(STORYBOOK_URL).toMatch(/^https:\/\//);
  });

  it("carries no trailing slash, since callers append a path", () => {
    expect(STORYBOOK_URL.endsWith("/")).toBe(false);
  });

  it("prefers the environment variable when one is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_STORYBOOK_URL", "https://example.test");
    vi.resetModules(); // the static import above is already evaluated
    const fresh = await import("./storybook");
    expect(fresh.STORYBOOK_URL).toBe("https://example.test");
    vi.unstubAllEnvs();
  });
});
