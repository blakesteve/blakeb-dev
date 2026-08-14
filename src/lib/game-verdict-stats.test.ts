import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGameVerdictStats } from "./game-verdict-stats";

/**
 * Every test here is really the same test: the build does not fall over.
 *
 * This runs at build time on Vercel, so a throw from any of these paths fails a
 * deploy that has nothing to do with Game Verdict. The contract is that each
 * failure resolves to `{ games: null, verdicts: null }` and leaves a line in the
 * build log — degrading quietly is how you find out weeks later that the
 * numbers stopped moving.
 */

const UNAVAILABLE = { games: null, verdicts: null };

let warn: ReturnType<typeof vi.spyOn>;

/** A `fetch` that resolves to a response with the given body. */
function respondWith(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getGameVerdictStats", () => {
  it("returns the counts the endpoint reports", async () => {
    respondWith({ games: 1284, verdicts: 3907 });

    await expect(getGameVerdictStats()).resolves.toEqual({ games: 1284, verdicts: 3907 });
    expect(warn).not.toHaveBeenCalled();
  });

  it("asks for the hourly cached copy", async () => {
    const fetchMock = respondWith({ games: 1, verdicts: 1 });

    await getGameVerdictStats();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.gameverdict.app/api/stats",
      { next: { revalidate: 3600 } },
    );
  });

  it("keeps a partial answer rather than discarding both counts", async () => {
    respondWith({ games: 1284, verdicts: null });

    await expect(getGameVerdictStats()).resolves.toEqual({ games: 1284, verdicts: null });
    expect(warn).not.toHaveBeenCalled();
  });

  it("accepts zero as a real count", async () => {
    respondWith({ games: 0, verdicts: 12 });

    await expect(getGameVerdictStats()).resolves.toEqual({ games: 0, verdicts: 12 });
  });

  it("degrades on a non-ok response", async () => {
    respondWith({ games: 1284, verdicts: 3907 }, { ok: false, status: 503 });

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("503"));
  });

  it("degrades when the body is not an object", async () => {
    respondWith("service unavailable");

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("not an object"));
  });

  it("degrades when the body is null", async () => {
    respondWith(null);

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("not an object"));
  });

  it("degrades when a 200 reports both counts unavailable", async () => {
    respondWith({ games: null, verdicts: null });

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("both counts unavailable"));
  });

  it("degrades when the counts are the wrong shape", async () => {
    respondWith({ games: "1284", verdicts: -3 });

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalled();
  });

  it("degrades when the fields are missing entirely", async () => {
    respondWith({ error: "nope" });

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalled();
  });

  it("degrades when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("ECONNREFUSED"));
  });

  it("degrades when something other than an Error is thrown", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("kaboom"));

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("fetch threw"));
  });

  it("degrades when the body will not parse as JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON at position 0");
        },
      }),
    );

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Unexpected token"));
  });

  it("names itself in the build log so the line is findable", async () => {
    respondWith(null);

    await getGameVerdictStats();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[game-verdict-stats]"));
  });
});
