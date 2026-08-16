/**
 * Roster's release history, read from the npm registry at build time.
 *
 * The point is the same one the rest of this site keeps making: a changelog
 * that is typed by hand is a changelog that drifts. This one is the registry's
 * own record, including the deprecation notice on 3.0.0, quoted rather than
 * retyped.
 *
 * Degrades like the Game Verdict stats do. A registry hiccup should not fail a
 * deploy, so an unreachable fetch returns null and the page falls back to
 * prose that does not depend on it.
 */

const REGISTRY = "https://registry.npmjs.org/@blakesteve%2Froster";

export type Release = {
  version: string;
  /** `YYYY-MM-DD`. */
  date: string;
  major: boolean;
  /** The npm deprecation message, when one is set. */
  deprecated?: string;
};

export type RosterHistory = {
  releases: Release[];
  total: number;
  first: string;
  latest: Release;
};

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

export async function getRosterHistory(): Promise<RosterHistory | null> {
  try {
    const response = await fetch(REGISTRY, { next: { revalidate: 3600 } });
    if (!response.ok) {
      console.warn(`[roster-npm] registry returned ${response.status}`);
      return null;
    }

    const body = (await response.json()) as {
      time?: Record<string, string>;
      versions?: Record<string, { deprecated?: string }>;
    };
    const time = body.time ?? {};
    const versions = body.versions ?? {};

    const all = Object.keys(versions)
      .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
      .sort(compareVersions);

    if (all.length === 0) return null;

    const releases: Release[] = all.map((version) => ({
      version,
      date: (time[version] ?? "").slice(0, 10),
      major: version.endsWith(".0.0"),
      ...(versions[version]?.deprecated
        ? { deprecated: versions[version].deprecated }
        : {}),
    }));

    return {
      releases,
      total: releases.length,
      first: releases[0].date,
      latest: releases[releases.length - 1],
    };
  } catch (error) {
    console.warn(
      `[roster-npm] falling back: ${error instanceof Error ? error.message : "fetch threw"}`,
    );
    return null;
  }
}

/** Majors plus anything carrying a deprecation notice: the story beats. */
export function milestones(history: RosterHistory): Release[] {
  return history.releases.filter((r) => r.major || r.deprecated);
}
