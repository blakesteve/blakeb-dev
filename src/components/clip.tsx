"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
  const video = useRef<HTMLVideoElement>(null);
  /* Set when the browser refuses to start the loop, so the visitor still gets
     a control to start it themselves rather than a still with no way in. */
  const [refused, setRefused] = useState(false);

  /* Start the loop from here, rather than trusting `autoPlay` to.

     The server renders the calmer version, with no `autoplay`, because it
     can not know the visitor's setting. Hydration then adds the attribute,
     and a browser decides whether to autoplay when the video has buffered,
     not when the attribute changes. So whenever the clip buffered before
     hydration finished, which is the usual case on a warm cache, it never
     started, and hydration had also removed its controls: a still frame with
     no way to play it. Measured on blakeb.dev on 29 September 2026, the
     Retrospect clip played on one load in four.

     Only while it is on screen. A bare `play()` skips the rule `autoplay`
     would have followed, that a muted loop waits until it is visible and
     pauses when it scrolls away: without this the Retrospect clip, 9,500px
     down its page, decoded from the moment the page loaded and a reader
     arrived partway through the loop.

     Only `NotAllowedError` counts as the browser refusing. A `play()` that a
     `pause()` interrupts rejects with `AbortError`, which is not a refusal,
     and treating it as one left the controls showing on a playing loop. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (reduced) {
      el.pause();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        el.pause();
        return;
      }
      el.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") setRefused(true);
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <figure className="my-5 flex w-full flex-col gap-[7px]">
      <div className="overflow-hidden rounded-[3px] border border-rule bg-panel">
        <video
          ref={video}
          className="block h-auto w-full"
          poster={poster}
          preload="metadata"
          muted
          playsInline
          loop={!reduced}
          autoPlay={!reduced}
          controls={reduced || refused}
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
