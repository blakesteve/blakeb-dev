export type HoverRule = { selector: string; guarded: boolean };
export type HoverAllow = { selector: string; reason: string };

export const HOVER_ALLOW: HoverAllow[];
export function hoverRules(css: string): HoverRule[];
export function checkHover(
  css: string,
  allow?: HoverAllow[],
): { unguarded: string[]; stale: string[]; guarded: number };
