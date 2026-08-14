/**
 * Fails the build if a color ramp is not monotonic.
 *
 * A ramp runs light to dark as the step number climbs. That is the only rule,
 * and this file exists because it has been broken twice by hand: once with
 * --ink-faint at 300 and --ink-soft at 400 on the blueline, and once with the
 * old border color left at 200, where it sat darker than 700 with near-white
 * steps on either side.
 *
 * Both mistakes came from assigning a step by what a color is FOR rather than
 * by how light it is, and both were caught by a person looking at /system
 * rather than by anything automatic. Now they are caught here.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

const SEMANTIC = ["paper", "panel", "ink", "ink-soft", "ink-faint", "rule", "hair"];

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* The file declares the press sheet first, then `:root.dark`. */
const [pressBlock, bluelineBlock] = css.split(":root.dark");

function semanticsIn(block) {
  const found = {};
  for (const name of SEMANTIC) {
    const match = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    if (match) found[name] = match[1];
  }
  return found;
}

function rampsIn(block, tokens) {
  const ramps = {};
  const pattern = /--roster-([a-z]+)-(\d+):\s*(var\(--([a-z-]+)\)|#[0-9a-fA-F]{6})/g;

  for (const match of block.matchAll(pattern)) {
    const [, family, step, raw, referenced] = match;
    const value = referenced ? tokens[referenced] : raw;
    /* Families built with color-mix resolve at render time, not here. Only the
       hand-assigned ramps can be checked statically, which is fine: they are
       the only ones a human can get out of order. */
    if (!value?.startsWith("#")) continue;
    (ramps[family] ??= []).push({ step: Number(step), value });
  }
  return ramps;
}

let failures = 0;

for (const [stateName, block] of [
  ["press sheet", pressBlock],
  ["blueline", bluelineBlock],
]) {
  if (!block) continue;
  const tokens = semanticsIn(block.includes("--paper") ? block : pressBlock);
  const ramps = rampsIn(block, tokens);

  for (const [family, rawSteps] of Object.entries(ramps)) {
    const steps = rawSteps
      .sort((a, b) => a.step - b.step)
      .map((s) => ({ ...s, lum: luminance(s.value) }));

    for (let i = 1; i < steps.length; i += 1) {
      if (steps[i].lum > steps[i - 1].lum) {
        failures += 1;
        console.error(
          `✗ ${stateName} · --roster-${family}: step ${steps[i].step} (${steps[i].value}, ` +
            `luminance ${steps[i].lum.toFixed(4)}) is LIGHTER than step ` +
            `${steps[i - 1].step} (${steps[i - 1].value}, ${steps[i - 1].lum.toFixed(4)}). ` +
            `A ramp must darken as the step climbs.`,
        );
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} ramp ordering problem(s). See src/app/globals.css.`);
  process.exit(1);
}

console.log("✓ color ramps are monotonic");
