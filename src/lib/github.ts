/**
 * Commit counts, read from GitHub at build time.
 *
 * These were typed by hand, and the drift was exactly what you would predict:
 * Roster's count appeared as 310 in its case study and 298 in `projects.ts`,
 * the same fact stated two different ways, and the real number was 313. Game
 * Verdict's said 822 against an actual 833, under a source line that read
 * "GitHub API" — a claim the page could not honor, since that repository is
 * private and answers 404.
 *
 * So: public repositories are read, and private ones are labeled as the dated
 * snapshots they are. A number that cannot be verified does not get to imply
 * that it was.
 *
 * GitHub exposes no commit-count field. The documented approach is to ask for a
 * single commit and read the last page number out of the `Link` header, which
 * is the total. It costs one request and no pagination.
 */

export type CommitCount = number | null;

function unavailable(repo: string, reason: string): null {
  console.warn(`[github] no commit count for ${repo}: ${reason}`);
  return null;
}

/**
 * Total commits on the default branch, or `null` if it cannot be read.
 *
 * Never throws. This runs during `next build` on Vercel, and a portfolio deploy
 * should not fail because GitHub rate-limited an anonymous request — the caller
 * falls back to a written figure and labels it as a snapshot. Unauthenticated
 * requests get 60 an hour, which is ample for one number per build, and the
 * hourly revalidate keeps it that way.
 */
export async function getCommitCount(repo: string): Promise<CommitCount> {
  const endpoint = `https://api.github.com/repos/${repo}/commits?per_page=1`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        /* GitHub rejects anonymous requests that send no User-Agent. */
        "User-Agent": "blakeb.dev-build",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return unavailable(repo, `returned ${response.status}`);
    }

    const link = response.headers.get("link");
    if (!link) {
      /* No Link header means a single page, so the count is what came back. */
      const body: unknown = await response.json();
      return Array.isArray(body) ? body.length : unavailable(repo, "no link header");
    }

    const last = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (!last) return unavailable(repo, "link header had no last page");

    const total = Number(last[1]);
    return Number.isFinite(total) && total > 0
      ? total
      : unavailable(repo, `parsed a nonsense count: ${last[1]}`);
  } catch (error) {
    return unavailable(repo, error instanceof Error ? error.message : "fetch threw");
  }
}
