"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { RButton } from "@/lib/roster-ui";
import {
  INITIAL_CLIP_STATE,
  createClipController,
  latestVisibility,
  showsNativeControls,
  type ClipController,
} from "@/lib/clip-controller";

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
  const controller = useRef<ClipController | null>(null);
  const [state, setState] = useState(INITIAL_CLIP_STATE);

  /* The loop is started from here, by `lib/clip-controller.ts`, rather than
     by `autoplay`. The server renders the calmer version with no `autoplay`,
     and a browser decides to autoplay when the video has buffered, not when
     hydration adds the attribute, so on a warm cache the loop never started.
     The controller's own comment has that history and the rest of it; this
     component only reports to it what it can see: whether the clip is on
     screen, what the visitor's motion setting is, and the reader's button. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const current = createClipController(el, (next) => {
      /* A `play()` from a controller already torn down, by a remount in
         development, can settle late. Its state is not this clip's. */
      if (controller.current === current) setState(next);
    });
    controller.current = current;
    const observer = new IntersectionObserver((entries) => {
      const visible = latestVisibility(entries);
      if (visible !== null) current.setVisible(visible);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.setReduced(reduced);
  }, [reduced]);

  const native = showsNativeControls(state);

  return (
    <figure className="relative my-5 flex w-full flex-col gap-[7px]">
      <div className="overflow-hidden rounded-[3px] border border-rule bg-panel">
        <video
          ref={video}
          className="block h-auto w-full"
          poster={poster}
          preload="metadata"
          muted
          playsInline
          loop={!reduced}
          controls={native}
          aria-label={alt}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {/* WCAG 2.2.2: a loop that starts itself and runs over five seconds
          needs a way to stop it. The browser's controls cover reduced motion
          and a refusal; everywhere else this does.

          Beside the caption, not over the video. On a phone, a 44px button
          in a corner of the frame covered the end of Retrospect's in-frame
          copy and a stretch of the dial. The caption line keeps its height
          and its right-hand room whether or not the button is there, so
          nothing moves when it appears after hydration. It sits before the
          caption in the markup because a figcaption has to come last. */}
      {native ? null : (
        <ClipToggle
          paused={state.readerPaused}
          onToggle={() => controller.current?.toggle()}
          onRemovedWhileFocused={() => queueMicrotask(() => video.current?.focus())}
        />
      )}
      <figcaption className="flex min-h-11 items-center pr-[7.5rem] font-[family-name:var(--font-util)] text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * The reader's Pause and Play.
 *
 * It disappears when the browser's own controls take over, which happens if
 * the visitor turns on reduced motion, or the browser refuses to play. If it
 * had focus then, focus would fall to the top of the page, so it hands focus
 * to the video instead, which by then has controls to land on.
 *
 * The check runs in a layout effect's cleanup because that runs before React
 * removes the button. By the time anything else could look, Chromium has
 * already fired `blur` and moved focus to the body.
 */
function ClipToggle({
  paused,
  onToggle,
  onRemovedWhileFocused,
}: {
  paused: boolean;
  onToggle: () => void;
  onRemovedWhileFocused: () => void;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const removed = useRef(onRemovedWhileFocused);

  useLayoutEffect(() => {
    removed.current = onRemovedWhileFocused;
  });

  useLayoutEffect(() => {
    const el = wrap.current;
    return () => {
      if (el?.contains(document.activeElement)) removed.current();
    };
  }, []);

  return (
    <span ref={wrap} className="absolute bottom-0 right-0">
      <RButton type="button" size="lg" variant="solid" colorScheme="neutral" onClick={onToggle}>
        {paused ? "Play" : "Pause"}
        <span className="sr-only"> the clip</span>
      </RButton>
    </span>
  );
}
