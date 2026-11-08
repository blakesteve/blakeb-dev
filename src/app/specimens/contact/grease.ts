/**
 * The grease pencil: a photographer's marks on the Contact sheet, drawn from
 * release data kept here. Roster has no per-component "since" to read, and a
 * comment in its source is no record, so this map is the record, and
 * `grease.test.ts` holds it to the installed package.
 *
 * A circle goes on the components from the newest release that added any, and
 * only those: when the next release adds one, `NEWEST` moves to it and the old
 * circles go, so marks can't pile up. `NEWEST.total` is the library's count once
 * that release was out. A bump that adds or drops a component changes the
 * count, and the test fails until this map says which release did it.
 */

export const NEWEST = {
  version: "5.18.0",
  added: ["RadioTileGroup", "Timeline"],
  total: 64,
} as const;

/** Deprecated components, and what to use instead. */
export const DEPRECATED: Readonly<Record<string, string>> = {
  LiquidTabs: "Tabs",
};

export type Grease = { kind: "new"; version: string } | { kind: "deprecated"; use: string };

export function greaseFor(name: string): Grease | null {
  if (name in DEPRECATED) return { kind: "deprecated", use: DEPRECATED[name] };
  if ((NEWEST.added as readonly string[]).includes(name)) return { kind: "new", version: NEWEST.version };
  return null;
}

/** What a caption's accessible name adds, since the drawing itself is hidden. */
export function greaseWords(grease: Grease): string {
  return grease.kind === "new" ? `new in ${grease.version}` : `deprecated, use ${grease.use}`;
}

/** The handwritten note beside the mark. */
export function greaseNote(grease: Grease): string {
  return grease.kind === "new" ? `new in ${grease.version}` : `use ${grease.use}`;
}
