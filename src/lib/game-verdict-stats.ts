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

const ENDPOINT = "https://www.gameverdict.app/api/stats";

export type GameVerdictStats = { games: number | null; verdicts: number | null };

const UNAVAILABLE: GameVerdictStats = { games: null, verdicts: null };

function unavailable(reason: string): GameVerdictStats {
  console.warn(`[game-verdict-stats] falling back to written figures: ${reason}`);
  return UNAVAILABLE;
}

function asCount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export async function getGameVerdictStats(): Promise<GameVerdictStats> {
  try {
    const response = await fetch(ENDPOINT, { next: { revalidate: 3600 } });
    if (!response.ok) return unavailable(`${ENDPOINT} returned ${response.status}`);

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
