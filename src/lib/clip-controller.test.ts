import { describe, expect, it } from "vitest";

import {
  INITIAL_CLIP_STATE,
  createClipController,
  isRefusal,
  latestVisibility,
  shouldPlay,
  showsNativeControls,
  type Playable,
} from "./clip-controller";

/**
 * The rules a `Clip` plays by, driven through the real controller with a
 * stand-in video. Every expected value here is a requirement written down, not
 * one read back from the module: "paused", "controls showing", and so on.
 *
 * The wiring that feeds the controller (an `IntersectionObserver` for
 * visibility, the motion media query, the button) is not covered here: this
 * suite runs in Node with no DOM, on purpose. That part was checked in a
 * browser, on a production build.
 */

/** A video that records what it was asked to do, and can refuse. */
function fakeVideo(reject?: () => unknown) {
  const calls: ("play" | "pause")[] = [];
  const video: Playable = {
    play() {
      calls.push("play");
      return reject ? Promise.reject(reject()) : Promise.resolve();
    },
    pause() {
      calls.push("pause");
    },
  };
  /** What the video was last told to do. */
  const last = () => calls.at(-1);
  return { video, calls, last };
}

/** Lets any `play()` rejection reach its handler. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Motion allowed and on screen: the ordinary case, playing. */
function playing(reject?: () => unknown) {
  const fake = fakeVideo(reject);
  const clip = createClipController(fake.video);
  clip.setReduced(false);
  clip.setVisible(true);
  return { ...fake, clip };
}

describe("before anything is known", () => {
  it("starts as the server renders it: not playing, with the browser's controls", () => {
    expect(shouldPlay(INITIAL_CLIP_STATE)).toBe(false);
    expect(showsNativeControls(INITIAL_CLIP_STATE)).toBe(true);
  });
});

describe("playing", () => {
  it("plays when motion is allowed and the clip is on screen", () => {
    const { last, clip } = playing();
    expect(last()).toBe("play");
    expect(showsNativeControls(clip.state)).toBe(false);
  });
});

describe("off screen", () => {
  it("never plays while off screen, even with motion allowed", () => {
    const { calls, video } = fakeVideo();
    const clip = createClipController(video);
    clip.setReduced(false);
    expect(calls).not.toContain("play");
    expect(clip.state.visible).toBe(false);
  });

  it("reads the latest of a batch, so a quick scroll in and out ends off screen", () => {
    /* A busy page can deliver entering and leaving in one callback. */
    expect(latestVisibility([{ isIntersecting: true, time: 10 }, { isIntersecting: false, time: 20 }])).toBe(false);
    expect(latestVisibility([{ isIntersecting: false, time: 20 }, { isIntersecting: true, time: 10 }])).toBe(false);
    expect(latestVisibility([{ isIntersecting: false, time: 10 }, { isIntersecting: true, time: 20 }])).toBe(true);
    expect(latestVisibility([])).toBe(null);
  });

  it("pauses when it scrolls away, and plays again when it comes back", () => {
    const { last, clip } = playing();
    clip.setVisible(false);
    expect(last()).toBe("pause");
    clip.setVisible(true);
    expect(last()).toBe("play");
  });
});

describe("the reader's pause", () => {
  it("pauses when the reader presses Pause", () => {
    const { last, clip } = playing();
    clip.toggle();
    expect(last()).toBe("pause");
    expect(clip.state.readerPaused).toBe(true);
  });

  it("survives the clip scrolling away and back", () => {
    /* The visibility logic must never overrule the reader: a clip they paused
       stays paused when it scrolls back into view. */
    const { calls, clip } = playing();
    clip.toggle();
    const pausedAt = calls.length;
    clip.setVisible(false);
    clip.setVisible(true);
    expect(calls.slice(pausedAt)).not.toContain("play");
    expect(calls.at(-1)).toBe("pause");
  });

  it("plays again only when the reader presses Play", () => {
    const { last, clip } = playing();
    clip.toggle();
    clip.toggle();
    expect(last()).toBe("play");
    expect(clip.state.readerPaused).toBe(false);
  });

  it("keeps its own button rather than the browser's controls", () => {
    const { clip } = playing();
    clip.toggle();
    expect(showsNativeControls(clip.state)).toBe(false);
  });
});

describe("reduced motion", () => {
  it("does not play when the visitor asked for less motion", () => {
    const { calls, video } = fakeVideo();
    const clip = createClipController(video);
    clip.setReduced(true);
    clip.setVisible(true);
    expect(calls).not.toContain("play");
    expect(showsNativeControls(clip.state)).toBe(true);
  });

  it("pauses when the setting is switched on while the page is open", () => {
    const { last, clip } = playing();
    clip.setReduced(true);
    expect(last()).toBe("pause");
    expect(showsNativeControls(clip.state)).toBe(true);
  });

  it("plays again when the setting is switched back off", () => {
    const { last, clip } = playing();
    clip.setReduced(true);
    clip.setReduced(false);
    expect(last()).toBe("play");
    expect(showsNativeControls(clip.state)).toBe(false);
  });
});

describe("a browser that won't play", () => {
  it("brings the browser's controls back on NotAllowedError", async () => {
    const { clip } = playing(() => new DOMException("Low Power Mode", "NotAllowedError"));
    await settle();
    expect(clip.state.refused).toBe(true);
    expect(showsNativeControls(clip.state)).toBe(true);
  });

  it("does not treat AbortError as a refusal", async () => {
    /* A pause() interrupting a play() that hasn't started rejects this way.
       Counting it as a refusal left controls on a playing loop. */
    const { clip } = playing(() => new DOMException("interrupted", "AbortError"));
    await settle();
    expect(clip.state.refused).toBe(false);
    expect(showsNativeControls(clip.state)).toBe(false);
  });

  it("recognizes only NotAllowedError as a refusal", () => {
    expect(isRefusal(new DOMException("x", "NotAllowedError"))).toBe(true);
    expect(isRefusal(new DOMException("x", "AbortError"))).toBe(false);
    expect(isRefusal(new DOMException("x", "NotSupportedError"))).toBe(false);
    expect(isRefusal(new Error("NotAllowedError"))).toBe(false);
  });
});
