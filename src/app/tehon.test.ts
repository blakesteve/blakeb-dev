import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { getProject } from "@/lib/projects";

/**
 * Tehon is coming soon and not out. Nothing here may say otherwise: no store, no
 * badge, no download, no "available", and no link but tehon.app. The three phrases
 * that say it isn't out are the only places those words belong. Its card and its
 * study open on what it is. Words inside a screenshot are out of reach.
 */

const STUDIES = readFileSync(join(process.cwd(), "src", "content", "case-studies.tsx"), "utf8");
const RAW = STUDIES.slice(STUDIES.indexOf("\n  tehon: {"));
/* The prose wraps, so a phrase can be split across two source lines. */
const STUDY = RAW.replace(/\s+/g, " ");

const ALLOWED = ["there's nothing to download yet", "coming soon to both stores", "Not on a store yet"];
const OUT = /\bstores?\b|apps\.apple|google play|play\.google|testflight|\bbadges?\b|download|available|out now/i;
const without = (text: string) => ALLOWED.reduce((rest, phrase) => rest.replace(phrase, ""), text);

const entry = getProject("tehon")!;
/* Every string in it: a résumé line and a link's label too. */
const ENTRY = JSON.stringify(entry);

describe("Tehon, before its launch", () => {
  it("reaches its entry and its study", () => {
    expect(STUDY).toContain("An app for practicing written Japanese");
    expect(STUDY).toContain("KanjiVG, by Ulrich Apel");
    expect(RAW.trimEnd()).toMatch(/\n};$/);
  });

  it("says nothing that sounds like it's out", () => {
    expect(ENTRY).not.toMatch(OUT);
    for (const phrase of ALLOWED) expect(STUDY.split(phrase), phrase).toHaveLength(2);
    expect(without(STUDY)).not.toMatch(OUT);
  });

  it("opens on what it is, everywhere it's introduced", () => {
    const lede = STUDY.match(/lede: "([^"]+)"/)?.[1];
    for (const text of [entry.tagline, entry.blurb, lede]) expect(text).toMatch(/^An app for practicing written Japanese/);
  });

  it("twin: the words that would say it's out are refused, the allowed phrases' among them", () => {
    for (const phrase of ALLOWED) expect(phrase).toMatch(OUT);
    for (const bad of [
      "Available now.",
      "On Google Play",
      "Download it",
      "Out now",
      "It's in both stores now, and on TestFlight.",
      "On the App\n            Store".replace(/\s+/g, " "),
      '<StudyLink href="https://apps.apple.com/app/x">',
      "https://play.google.com/store/apps/x",
      "A badge for each store",
    ])
      expect(without(bad), bad).toMatch(OUT);
  });

  it("links to tehon.app and nowhere else", () => {
    expect(entry.links.map((link) => link.href)).toEqual(["https://tehon.app"]);
    expect(entry.links.map((link) => link.kind)).toEqual(["site"]);
    expect(STUDY.match(/https?:/g)).toBeNull();
    /* Its status says it's coming, and its host is its own page. */
    expect([entry.status, entry.host]).toEqual(["Coming soon", "tehon.app"]);
  });
});
