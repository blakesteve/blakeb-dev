import localFont from "next/font/local";
import { Barlow_Condensed, Geist, Public_Sans } from "next/font/google";

/**
 * The products' own faces, declared in this route alone. `preload: false`, so a
 * visitor who never picks a job never downloads one: the browser fetches a face
 * when text first uses it, and `swap` keeps the sheet readable until it lands.
 *
 * Bragging Rocks' two Japanese faces are local files, each its Latin slice. Through
 * `next/font/google` they brought every unicode slice's `@font-face` with them,
 * `subsets` only choosing what preloads: 487 rules, 368 KB of CSS on this route,
 * for a sheet that prints no Japanese.
 */
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--job-font-geist",
});
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "700",
  variable: "--job-font-barlow",
});
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--job-font-public-sans",
});
const zenKaku = localFont({
  src: [
    { path: "./fonts/zen-kaku-gothic-new-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/zen-kaku-gothic-new-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/zen-kaku-gothic-new-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  preload: false,
  variable: "--job-font-zen-kaku",
});
const shippori = localFont({
  src: "./fonts/shippori-mincho-latin-700-normal.woff2",
  weight: "700",
  display: "swap",
  preload: false,
  variable: "--job-font-shippori",
});

export const JOB_FONTS = [geist, barlow, publicSans, zenKaku, shippori]
  .map((font) => font.variable)
  .join(" ");
