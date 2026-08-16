"use client";

import { useSyncExternalStore } from "react";

/**
 * A short silent loop, framed like a `Shot`.
 *
 * Some things a screenshot cannot carry. Retrospect's loading screen spawns
 * planets, orbits them, and occasionally collides two into an explosion; a
 * still of that is just a diagram of a solar system.
 *
 * Video rather than GIF, and not close: GIF has no interframe compression and
 * caps at 256 colors, so this clip would land somewhere north of 20 MB and
 * band badly across a dark starfield. The same footage as H.264 at a sensible
 * size is about 100 KB.
 *
 * Reduced motion is honored properly rather than ignored. If the visitor has
 * asked for less movement, the loop does not autoplay: they get the poster
 * frame and a play control, and can opt in. `useSyncExternalStore` reads the
 * media query live, so a visitor who changes the setting gets the right
 * behavior without a reload.
 */

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* The server cannot know, so it renders the calmer of the two. */
function readServer() {
  return true;
}

export function Clip({
  src,
  poster,
  alt,
  caption,
}: {
  src: string;
  poster: string;
  /** Described for anyone who cannot watch it; the caption is for everyone. */
  alt: string;
  caption: string;
}) {
  const reduced = useSyncExternalStore(subscribe, readReducedMotion, readServer);

  return (
    <figure className="my-5 flex w-full flex-col gap-[7px]">
      <div className="overflow-hidden rounded-[3px] border border-rule bg-panel">
        <video
          className="block h-auto w-full"
          poster={poster}
          preload="metadata"
          muted
          playsInline
          loop={!reduced}
          autoPlay={!reduced}
          controls={reduced}
          aria-label={alt}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <figcaption className="font-[family-name:var(--font-util)] text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {caption}
      </figcaption>
    </figure>
  );
}
