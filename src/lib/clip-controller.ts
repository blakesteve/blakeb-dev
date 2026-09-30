/**
 * What a `Clip` should be doing, decided apart from React and the DOM.
 *
 * Four things decide whether the loop runs: whether the visitor asked for
 * reduced motion, whether the clip is on screen, whether the reader pressed
 * Pause, and whether the browser refused to start it. Every one of those has
 * already been got wrong once in `Clip`, so they live here, where a test can
 * drive them with a stand-in video instead of trusting a browser to reproduce
 * each case:
 *
 * - The server can not know the visitor's setting, so the loop never started
 *   on its own once the video had buffered before hydration. Found on
 *   blakeb.dev, 29 September 2026: one load in four played.
 * - A bare `play()` ignored the rule a muted `autoplay` follows, waiting until
 *   the video is on screen, and a clip 9,500px down decoded from page load.
 * - A `play()` that a `pause()` interrupts rejects with `AbortError`. Counting
 *   that as a refusal left native controls on a playing loop.
 * - With autoplay working, a loop over five seconds ran with no way to stop
 *   it (WCAG 2.2.2). Hence the reader's own Pause, which has to survive the
 *   clip scrolling away and back: the visibility logic must never override it.
 */

/** The two things this needs from a video element. */
export type Playable = {
  play(): Promise<void>;
  pause(): void;
};

export type ClipState = {
  /** The visitor asked for less motion. */
  reduced: boolean;
  /** Some of the clip is on screen. */
  visible: boolean;
  /** The reader pressed Pause, and hasn't pressed Play since. */
  readerPaused: boolean;
  /** The browser refused to start the loop. */
  refused: boolean;
};

/**
 * Before anything is known. `reduced` starts true because that is what the
 * server renders: the calmer version, since it can not read the setting.
 */
export const INITIAL_CLIP_STATE: ClipState = {
  reduced: true,
  visible: false,
  readerPaused: false,
  refused: false,
};

/** Whether the loop should be running. */
export function shouldPlay(state: ClipState): boolean {
  return !state.reduced && state.visible && !state.readerPaused && !state.refused;
}

/**
 * The browser's own controls, where the visitor asked for less motion or the
 * browser wouldn't start the loop. Everywhere else the clip carries its own
 * Pause and Play button instead.
 */
export function showsNativeControls(state: ClipState): boolean {
  return state.reduced || state.refused;
}

/**
 * Only `NotAllowedError` is the browser refusing, as it does in iOS Low Power
 * Mode. `AbortError` means a `pause()` got there first, which is not a refusal.
 */
export function isRefusal(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

/**
 * Whether the clip is on screen now, from one `IntersectionObserver` batch.
 *
 * The latest entry, not the first. When the page is busy the browser can
 * hand over entering and leaving in a single callback, oldest first, and
 * reading `entries[0]` then says "on screen" about a clip that has already
 * left. Found in review: a clip 9,500px down its page kept playing after a
 * quick scroll in and out. Picked by `time`, so the order of the batch is
 * not relied on either.
 */
export function latestVisibility(
  entries: readonly { isIntersecting: boolean; time: number }[],
): boolean | null {
  if (entries.length === 0) return null;
  return entries.reduce((latest, entry) => (entry.time >= latest.time ? entry : latest)).isIntersecting;
}

export type ClipController = {
  setReduced(reduced: boolean): void;
  setVisible(visible: boolean): void;
  /** The reader's Pause and Play button. */
  toggle(): void;
  readonly state: ClipState;
};

/**
 * Keeps `video` doing what the state says, and reports every change.
 *
 * Each change settles the video straight away: `play()` if it should run,
 * `pause()` if not. Calling either when the video is already there is
 * harmless, so there is no need to track what the video is doing, only what
 * it should be doing.
 */
export function createClipController(
  video: Playable,
  onChange: (state: ClipState) => void = () => {},
): ClipController {
  let state = INITIAL_CLIP_STATE;

  const update = (next: Partial<ClipState>) => {
    state = { ...state, ...next };
    onChange(state);
    if (shouldPlay(state)) {
      video.play().catch((error: unknown) => {
        if (isRefusal(error)) update({ refused: true });
      });
    } else {
      video.pause();
    }
  };

  return {
    setReduced: (reduced) => update({ reduced }),
    setVisible: (visible) => update({ visible }),
    toggle: () => update({ readerPaused: !state.readerPaused }),
    get state() {
      return state;
    },
  };
}
