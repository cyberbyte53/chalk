import type { Locale } from "@chalk/content";
import { estimatedSeconds } from "@chalk/prop/next";
import { signal } from "@preact/signals";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { canSpeak, hush as phoneHush, speak as phoneSpeak } from "./speech";

const MUTED_KEY = "chalk.isMuted";
const remembered = (): boolean => {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Whether the voice is off, for every board until the learner turns it on again (kept on this
 * device). Muted, lines aren't played, but the board keeps its timing: a line still takes as long
 * as its clip, so what waits for it comes when it would have.
 */
export const isMuted = signal(remembered());

export function setMuted(isOn: boolean): void {
  isMuted.value = isOn;
  try {
    localStorage.setItem(MUTED_KEY, isOn ? "1" : "0");
  } catch {}
}

/** A clip to play: where it is, and how long it plays. */
export type PlayableClip = { url: string; seconds: number };

/**
 * A chapter's clips (made by `pnpm voice`): the clips that say a speaker's phrases in a language,
 * one after another, or undefined when one has none.
 */
export type AudioSource = {
  clipsOf: (
    speaker: string,
    locale: Locale,
    phrases: readonly string[],
  ) => readonly PlayableClip[] | undefined;
  /**
   * A live voice: any words, in the speaker's voice, made as they are needed (a server's; in
   * development, the studio's Piper). Undefined when there is none, or it couldn't.
   */
  live?: (
    speaker: string,
    locale: Locale,
    words: string,
    signal: AbortSignal,
  ) => Promise<PlayableClip | undefined>;
};

/**
 * Something to say: its name (a piece, or a line of the board), who says it, and its phrases in
 * each language (spoken.ts: a fixed line is one phrase, a line with values a few).
 */
export type Utterance = {
  name: string;
  speaker: string;
  phrases: Readonly<Partial<Record<Locale, readonly string[]>>>;
};

/** A prop that is speaking: its name (for the retry mark). */
export type SpokenProp = { name: string };

export type Narrator = {
  /** Says a line and resolves when it ends (or fails; the text is on screen either way). */
  speak: (line: Utterance) => Promise<void>;
  /** How long a line plays here, when its clips are known. */
  seconds: (line: Utterance) => number | undefined;
  /** Stops the line being said. */
  hush: () => void;
  /** Lines whose audio couldn't play, by name. */
  failed: ReadonlySet<string>;
};

/** What became of a sound: heard, refused by the browser until the page's first touch, or broken. */
type Played = "heard" | "blocked" | "broken";

/** Whether the page has been touched yet: until then the browser may let it make no sound. */
const hasBeenTouched = (): boolean =>
  typeof navigator === "undefined" ||
  (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
    ?.hasBeenActive !== false;

/** How much longer than its length a sound may take before we stop waiting for it, in seconds. */
const MARGIN = 2;
/** How long a live voice may take to make a line before the next source says it. */
const LIVE_WAIT_MS = 3_000;

/**
 * Says a board's lines, one at a time, from the first source that can (platform/docs/sound.md):
 * its clips glued one after another (every phrase made by `pnpm voice`); a live voice from the
 * server (not yet); else the phone's own voice. Failures never block the lesson: the line is
 * marked, reported, and the board carries on.
 */
export function useNarrator(
  locale: Locale,
  source: AudioSource | undefined,
  onFailure: (prop: SpokenProp, reason: string) => void,
): Narrator {
  /** The line being said: a newer one (or a hush) ends its clips. */
  const saying = useRef(0);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());

  const clipsFor = useCallback(
    (line: Utterance) => {
      const phrases = line.phrases[locale];
      return phrases === undefined ? undefined : source?.clipsOf(line.speaker, locale, phrases);
    },
    [source, locale],
  );

  /** Ends the sound playing now, and any live voice still being made (a hush, a newer line, mute). */
  const stopNow = useRef<(() => void) | undefined>(undefined);

  /**
   * Plays one sound until it ends, fails, is stopped, or runs past its own length and a margin:
   * whatever happens it is over when this resolves, never keeping the board waiting. True if it
   * was heard (to its end, or as long as it should have been); false if it couldn't be.
   */
  const playOne = useCallback(
    (seconds: number, start: (done: (isHeard: boolean) => void) => () => void) =>
      new Promise<boolean>((resolve) => {
        let isOver = false;
        // How to stop the sound: known once it has started (it may be over before then).
        const sound: { halt?: () => void } = {};
        const done = (isHeard: boolean) => {
          if (isOver) return;
          isOver = true;
          clearTimeout(timer);
          stopNow.current = undefined;
          sound.halt?.();
          resolve(isHeard);
        };
        const timer = setTimeout(() => done(true), (seconds + MARGIN) * 1000);
        stopNow.current = () => done(true);
        sound.halt = start(done);
        if (isOver) sound.halt();
      }),
    [],
  );

  /**
   * A clip; `onBroken` when it couldn't be played because it is broken (it didn't load), not
   * merely because the page can't sound yet (the browser waits for the student's first touch).
   */
  /**
   * One audio player for every clip. A browser lets a player start only once the page is touched,
   * and the strictest (Safari, some apps' webviews) only a player that has itself started inside a
   * touch: once it has, it stays allowed. A new player per clip would need a touch per clip.
   */
  const player = useRef<HTMLAudioElement | undefined>(undefined);

  const playClip = useCallback(
    async (clip: PlayableClip): Promise<Played> => {
      let why: Played = "broken";
      const isHeard = await playOne(clip.seconds, (done) => {
        player.current ??= new Audio();
        const audio = player.current;
        const ended = () => done(true);
        const failed = () => done(false);
        audio.addEventListener("ended", ended);
        audio.addEventListener("error", failed);
        audio.src = clip.url;
        audio.play().catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "NotAllowedError") why = "blocked";
          done(false);
        });
        return () => {
          audio.removeEventListener("ended", ended);
          audio.removeEventListener("error", failed);
          audio.pause();
        };
      });
      return isHeard ? "heard" : why;
    },
    [playOne],
  );

  /** The phone's own voice; a voice reads slower than our estimate, so it gets twice as long. */
  const playPhone = useCallback(
    async (words: string): Promise<Played> => {
      const isHeard = await playOne(estimatedSeconds(words) * 2, (done) => {
        void phoneSpeak(words, locale).then(done);
        return phoneHush;
      });
      // The phone's voice doesn't say why it couldn't: before the first touch, it is that.
      return isHeard ? "heard" : hasBeenTouched() ? "broken" : "blocked";
    },
    [playOne, locale],
  );

  /** Nothing heard, for as long as `words` would take to say. */
  const playQuiet = useCallback(
    (words: string) =>
      playOne(estimatedSeconds(words), (done) => {
        const timer = setTimeout(() => done(true), estimatedSeconds(words) * 1000);
        return () => clearTimeout(timer);
      }),
    [playOne],
  );

  /** A live voice's clip for `words`, if it makes one in time (and the line isn't stopped first). */
  const makeLive = useCallback(
    async (speaker: string, words: string): Promise<PlayableClip | undefined> => {
      if (source?.live === undefined) return undefined;
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), LIVE_WAIT_MS);
      stopNow.current = () => abort.abort();
      try {
        return await source.live(speaker, locale, words, abort.signal);
      } catch {
        return undefined;
      } finally {
        clearTimeout(timer);
        stopNow.current = undefined;
      }
    },
    [source, locale],
  );

  const stop = useCallback(() => {
    saying.current++;
    stopNow.current?.();
  }, []);

  // Gone from the screen: nothing more is said.
  useEffect(() => stop, [stop]);

  /** Resolves on the page's first touch or key, or when the line is stopped. */
  const firstTouch = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          window.removeEventListener("pointerdown", done, true);
          window.removeEventListener("keydown", done, true);
          stopNow.current = undefined;
          resolve();
        };
        window.addEventListener("pointerdown", done, true);
        window.addEventListener("keydown", done, true);
        stopNow.current = done;
      }),
    [],
  );

  const speak = useCallback(
    async (line: Utterance) => {
      stop();
      const mine = saying.current;
      const phrases = line.phrases[locale];
      if (phrases === undefined || phrases.length === 0) return;
      const isMine = () => saying.current === mine;
      // Muted: nothing heard, and the line still takes its time (the board's pacing is the same).
      if (isMuted.peek()) return void (await playQuiet(phrases.join(" ")));
      // A sound the browser refuses before the page's first touch can be heard, just not yet:
      // the line waits for the touch (and the board with it), then plays.
      const whenAllowed = async (play: () => Promise<Played>): Promise<Played> => {
        for (;;) {
          const played = await play();
          if (played !== "blocked" || !isMine()) return played;
          await firstTouch();
          if (!isMine()) return played;
        }
      };
      // 1. Its clips, glued. A clip that can't play leaves the rest of the line to the next source.
      let from = 0;
      let isBroken = false;
      const clips = clipsFor(line);
      for (const clip of clips ?? []) {
        if (!isMine()) return;
        const played = await whenAllowed(() => playClip(clip));
        if (played !== "heard") {
          isBroken = played === "broken";
          break;
        }
        from++;
      }
      if (clips !== undefined && from === clips.length) return void forget(line.name);
      if (isBroken) {
        setFailed((prev) => new Set(prev).add(line.name));
        onFailure({ name: line.name }, "a clip failed to play");
      }
      const rest = phrases.slice(from).join(" ");
      // 2. A live voice. 3. The phone's own voice. 4. Quiet, for as long as the words would take:
      // whatever couldn't be heard still takes its time.
      if (!isMine()) return;
      const made = await makeLive(line.speaker, rest);
      if (!isMine()) return;
      if (made !== undefined && (await whenAllowed(() => playClip(made))) === "heard") return;
      if (!isMine()) return;
      if (canSpeak() && (await whenAllowed(() => playPhone(rest))) === "heard") return;
      if (isMine()) await playQuiet(rest);
    },
    [locale, clipsFor, playClip, makeLive, playPhone, playQuiet, firstTouch, stop, onFailure],
  );

  /** A line that played: no longer marked as failed. */
  const forget = (name: string) =>
    setFailed((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });

  // Muting stops the line being said.
  useEffect(
    () =>
      isMuted.subscribe((muted) => {
        if (muted) stop();
      }),
    [stop],
  );

  const seconds = useCallback(
    (line: Utterance) => clipsFor(line)?.reduce((sum, clip) => sum + clip.seconds, 0),
    [clipsFor],
  );

  const hush = stop;

  return { speak, failed, seconds, hush };
}
