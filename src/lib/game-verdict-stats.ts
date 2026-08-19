/**
 * Game Verdict's public aggregate counts, read at build time.
 *
 * The figures on its case study used to be typed by hand under a source that
 * claimed they were live, which is the thing this whole page argues against.
 * Now they come from the app itself.
 *
 * Two deliberate choices:
 *
 * - `revalidate: 3600`. The upstream route caches for five minutes; there is no
 *   value in this site asking more often than hourly for a number that appears
 *   once in a case study.
 * - Failure returns nulls rather than throwing. A portfolio deploy should not
 *   fail because another app was briefly unreachable, so the caller falls back
 *   to its last known figure and labels it as a snapshot instead of as live.
 *   It does warn, though: silently degrading means finding out weeks later
 *   that the numbers stopped moving, and the build log is the cheapest place
 *   to learn otherwise.
 */

/**
 * Deliberately `api.` and not `www.`, and this must not be "tidied" back.
 *
 * `www.gameverdict.app` is proxied by Cloudflare with Bot Fight Mode on, which
 * serves a managed challenge to automated traffic — the "Just a moment..."
 * interstitial. A browser solves it silently; `fetch` cannot, so every build
 * took a 403 and quietly shipped the written fallback instead. Bot Fight Mode
 * is a zone-wide free-tier feature that cannot be skipped per path, so the
 * endpoint moved rather than the rule.
 *
 * `api.gameverdict.app` is the same Vercel deployment with Cloudflare's proxy
 * switched off (grey cloud), so this request reaches the origin directly. If
 * that DNS record is ever proxied again, this silently reverts to fallback
 * figures and the build log says so.
 */
const ENDPOINT = "https://api.gameverdict.app/api/stats";

export type GameVerdictStats = { games: number | null; verdicts: number | null };

const UNAVAILABLE: GameVerdictStats = { games: null, verdicts: null };

function unavailable(reason: string): GameVerdictStats {
  console.warn(`[game-verdict-stats] falling back to written figures: ${reason}`);
  return UNAVAILABLE;
}

/**
 * A rejection, described well enough to act on from a build log.
 *
 * A bare status is not enough. The endpoint answers 200 from a laptop and 403
 * to Vercel's functions, which took a round of guessing to pin on the edge in
 * front of it rather than on the route — the route cannot even emit a 403, it
 * returns 200 with nulls on failure. `server` and `cf-ray` name whoever
 * actually refused, and the body carries the rule when there is one.
 */
async function describeRejection(response: Response): Promise<string> {
  const via = ["server", "cf-ray", "cf-mitigated"]
    .map((header) => [header, response.headers.get(header)] as const)
    .filter(([, value]) => value)
    .map(([header, value]) => `${header}=${value}`)
    .join(" ");

  let body = "";
  try {
    body = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 160);
  } catch {
    /* A body is a bonus here, never the point. */
  }

  return [`${ENDPOINT} returned ${response.status}`, via, body]
    .filter(Boolean)
    .join(" · ");
}

function asCount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export async function getGameVerdictStats(): Promise<GameVerdictStats> {
  try {
    const response = await fetch(ENDPOINT, { next: { revalidate: 3600 } });
    if (!response.ok) return unavailable(await describeRejection(response));

    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) return unavailable("response was not an object");

    const { games, verdicts } = body as Record<string, unknown>;
    const stats = { games: asCount(games), verdicts: asCount(verdicts) };

    /* The endpoint answers with nulls when its own counts are unavailable. */
    if (stats.games === null && stats.verdicts === null) {
      return unavailable("endpoint reported both counts unavailable");
    }
    return stats;
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "fetch threw");
  }
}
