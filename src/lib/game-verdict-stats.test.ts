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

/**
 * A `fetch` that resolves to a response with the given body.
 *
 * `headers` and `text` are here because the rejection path reads both, and a
 * stand-in without them is not a Response — it is a shape that happens to pass.
 * The first version omitted them, so adding a header read to the source threw a
 * TypeError that the module's own catch swallowed into a generic message, and
 * the suite reported it as an unrelated assertion failure.
 */
function respondWith(
  body: unknown,
  init: { ok?: boolean; status?: number; headers?: Record<string, string>; text?: string } = {},
) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: new Headers(init.headers ?? {}),
    json: async () => body,
    text: async () => init.text ?? JSON.stringify(body),
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
      "https://api.gameverdict.app/api/stats",
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

  // The failure that actually happened: 200 from a laptop, 403 to Vercel's
  // functions. A bare status sent us looking at the route, which cannot emit a
  // 403 at all, so the log has to name whoever really refused.
  it("names the edge that refused, not just the status", async () => {
    respondWith(null, {
      ok: false,
      status: 403,
      headers: { server: "cloudflare", "cf-ray": "a2d402dfae80e76d-DEN" },
      text: "error code: 1010",
    });

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    const [message] = warn.mock.calls.at(-1) as [string];
    expect(message).toContain("403");
    expect(message).toContain("server=cloudflare");
    expect(message).toContain("cf-ray=a2d402dfae80e76d-DEN");
    expect(message).toContain("error code: 1010");
  });

  it("still reports a rejection when the body cannot be read", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: new Headers(),
      json: async () => null,
      text: async () => {
        throw new Error("stream already consumed");
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getGameVerdictStats()).resolves.toEqual(UNAVAILABLE);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("502"));
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
