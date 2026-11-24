import { barStyle } from "@/lib/projects";

/**
 * Roster's color bar, 4px across the top of whatever positioned box holds it:
 * its card on the home page and its case study's header. A child rather than
 * Card's `brandColorTop`, which is a background color and can't hold a gradient.
 * Forced colors drop it with the other cards' edges.
 */
export function RosterBar() {
  return <span aria-hidden="true" className="roster-bar" style={barStyle()} />;
}
