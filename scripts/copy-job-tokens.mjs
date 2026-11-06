/**
 * Copies each app's `--roster-*` overrides into `src/content/job-tokens.json`,
 * for Ink swap on /specimens. Run it by hand when an app's palette moves:
 *
 *   node scripts/copy-job-tokens.mjs
 *
 * It reads the sibling repos, which Vercel doesn't have, so it can't run in a
 * build and the file it writes is committed, with the date it was copied. The
 * page's footnote prints that date: this is a copy, and it says so. Each app is
 * read at its production branch rather than whatever its working tree is on.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = join(root, "..");

const APPS = {
  gv: { repo: "game-verdict", file: "src/app/globals.css" },
  retrospect: { repo: "retrospect", file: "src/app/globals.css" },
  /* Light at its root and dark under `.dark`, and its job is the dark one. */
  megasquad: {
    repo: "web/portfolio/pick-ems-v2/pick-ems-v2/mega-squad",
    file: "src/index.css",
    dark: true,
  },
  br: { repo: "bragging-rocks", file: "src/app/globals.css" },
};

const css = ({ repo, file }) =>
  execFileSync("git", ["-C", join(workspace, repo), "show", `origin/main:${file}`], {
    encoding: "utf8",
  }).replace(/\/\*[\s\S]*?\*\//g, "");

/* The app's root declarations, and its dark block for the one app that needs
   it: a job is one state of the app, and the other dark jobs' roots already are
   that state. */
function overrides(source, dark) {
  const declared = {};
  const applies = (selector) =>
    /^(:root|html)( |,|$)/.test(selector) || (dark && /^(:root)?\.dark( |,|$)/.test(selector));
  for (const [, selector, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const last = selector.split(";").pop().trim().replace(/\s+/g, " ");
    if (!applies(last)) continue;
    for (const [, name, value] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      declared[name] = value.trim();
    }
  }

  const resolve = (value, depth = 0) =>
    depth > 4
      ? value
      : value.replace(/var\((--[a-z0-9-]+)(?:,[^)]*)?\)/g, (whole, name) =>
          declared[name] ? resolve(declared[name], depth + 1) : whole,
        );

  return Object.fromEntries(
    Object.entries(declared)
      .filter(([name]) => name.startsWith("--roster-"))
      .map(([name, value]) => [name, resolve(value)])
      .filter(([, value]) => !/var\(--(?!roster)/.test(value))
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Chicago",
}).format(new Date());

const jobs = Object.fromEntries(
  Object.entries(APPS).map(([id, app]) => [id, overrides(css(app), app.dark)]),
);

writeFileSync(
  join(root, "src/content/job-tokens.json"),
  `${JSON.stringify({ copied: date, jobs }, null, 2)}\n`,
);

for (const [id, tokens] of Object.entries(jobs)) console.log(id, Object.keys(tokens).length);
