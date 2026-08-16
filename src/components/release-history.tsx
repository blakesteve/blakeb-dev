import { REyebrow } from "@/lib/roster-ui";
import { getRosterHistory, milestones } from "@/lib/roster-npm";

/**
 * Roster's majors, read from the npm registry at build time.
 *
 * A changelog typed by hand is a changelog that drifts, so this one is the
 * registry's own record. The deprecation notice on 3.0.0 is quoted verbatim
 * from npm rather than retyped, which is the point: the tombstone is public,
 * and this page shows the public version of it.
 *
 * Renders nothing at all if the registry is unreachable. The prose around it
 * does not depend on this component existing, so a degraded build loses a
 * table rather than a paragraph.
 */
export async function ReleaseHistory() {
  const history = await getRosterHistory();
  if (!history) return null;

  const beats = milestones(history);

  return (
    <figure className="my-5 flex w-full flex-col gap-[7px]">
      <div className="flex flex-col gap-[10px] rounded-[3px] border border-rule bg-panel px-[15px] py-[14px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <REyebrow>Majors</REyebrow>
          <REyebrow>
            {history.total} versions since {history.first}
          </REyebrow>
        </div>

        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {beats.map((release) => (
            <li key={release.version} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-[family-name:var(--font-display)] text-[1.0625rem] font-bold tracking-[-0.02em] text-ink">
                  {release.version}
                </span>
                <REyebrow>{release.date}</REyebrow>
                {release.deprecated && (
                  <REyebrow tone="primary">deprecated</REyebrow>
                )}
              </div>

              {release.deprecated && (
                <p className="m-0 max-w-[62ch] border-l-2 border-spot pl-3 text-[0.875rem] leading-[1.55] text-ink-soft">
                  {release.deprecated}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

      <figcaption className="font-[family-name:var(--font-util)] text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        Read from the npm registry at build time. The deprecation notice is npm&rsquo;s,
        quoted as published.
      </figcaption>
    </figure>
  );
}
