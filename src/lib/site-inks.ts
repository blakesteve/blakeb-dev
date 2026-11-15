/**
 * Roster's text-on-fill inks this site sets for its own fills, in globals.css.
 * Anywhere that shows an app's palette as that app ships it (the "As Roster
 * ships it" column, an Ink swap job) has to unset each one it doesn't set
 * itself, or that app wears this site's ink on its own colors. `initial`
 * makes the variable invalid, so Roster's compiled fallback applies.
 */
export const SITE_ROSTER_INKS = ["--roster-primary-500-ink"] as const;
