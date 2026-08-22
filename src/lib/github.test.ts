import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCommitCount } from "./github";

/**
 * Every test here is the same test: the build does not fall over.
 *
 * This runs during `next build` on Vercel, so a throw from any path fails a
 * deploy over a number that appears once in a stat row. The contract is that
 * each failure resolves to `null` and leaves a line in the build log — the
 * caller then prints its written figure and labels it a snapshot rather than
 * claiming to have read it.
 */

let warn: ReturnType<typeof vi.spyOn>;

function respondWith(init: {
  ok?: boolean;
  status?: number;
  link?: string | null;
  body?: unknown;
}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: new Headers(init.link ? { link: init.link } : {}),
    json: async () => init.body ?? [],
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const LAST = (n: number) =>
  `<https://api.github.com/repositories/1/commits?per_page=1&page=2>; rel="next", ` +
  `<https://api.github.com/repositories/1/commits?per_page=1&page=${n}>; rel="last"`;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getCommitCount", () => {
  // GitHub exposes no count field; the total is the last page number when you
  // ask for one commit per page.
  it("reads the total out of the Link header", async () => {
    respondWith({ link: LAST(313) });
    await expect(getCommitCount("blakesteve/roster")).resolves.toBe(313);
    expect(warn).not.toHaveBeenCalled();
  });

  it("asks for a single commit, so there is nothing to paginate", async () => {
    const fetchMock = respondWith({ link: LAST(9) });
    await getCommitCount("blakesteve/roster");
    expect(fetchMock.mock.calls[0][0]).toContain("per_page=1");
  });

  // A repository with fewer commits than a page returns no Link header at all.
  it("falls back to the body length when there is no Link header", async () => {
    respondWith({ link: null, body: [{ sha: "a" }] });
    await expect(getCommitCount("blakesteve/tiny")).resolves.toBe(1);
  });

  // The case that started this: game-verdict is private and answers 404, so the
  // page must not claim to have read it.
  it("degrades on a private or missing repository", async () => {
    respondWith({ ok: false, status: 404 });
    await expect(getCommitCount("blakesteve/game-verdict")).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("404"));
  });

  it("degrades when rate limited", async () => {
    respondWith({ ok: false, status: 403 });
    await expect(getCommitCount("blakesteve/roster")).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("403"));
  });

  it("degrades when the Link header has no last page", async () => {
    respondWith({ link: '<https://api.github.com/x?page=2>; rel="next"' });
    await expect(getCommitCount("blakesteve/roster")).resolves.toBeNull();
  });

  it("degrades rather than printing a nonsense count", async () => {
    respondWith({ link: LAST(0) });
    await expect(getCommitCount("blakesteve/roster")).resolves.toBeNull();
  });

  it("degrades when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    await expect(getCommitCount("blakesteve/roster")).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("ECONNREFUSED"));
  });
});
