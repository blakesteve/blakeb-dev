import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { XRay } from "@/components/xray";
import { getRosterComponents } from "@/lib/roster";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blakeb.dev"),
  title: {
    default: "Blake Ball — Front End Engineer",
    template: "%s — Blake Ball",
  },
  description:
    "Front end engineer in Austin, Texas. Sixteen years building interfaces, most recently at Revmatics. I build design systems and the products that run on them.",
  openGraph: {
    title: "Blake Ball — Front End Engineer",
    description:
      "Sixteen years building interfaces. I build design systems and the products that run on them.",
    url: "https://blakeb.dev",
    siteName: "blakeb.dev",
    locale: "en_US",
    type: "website",
  },
};

/* Runs before first paint so the page never flashes the wrong production
   state. Reads the saved choice, falls back to the OS preference. */
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("state");
    var dark = saved
      ? saved === "blueline"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Name → tier, read from the installed package so X-ray can build Storybook
  // links without a hand-maintained map.
  const tiers = Object.fromEntries(
    getRosterComponents().map(({ name, tier }) => [name, tier]),
  );

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <XRay tiers={tiers} />
      </body>
    </html>
  );
}
