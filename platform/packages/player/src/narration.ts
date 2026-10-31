import type { Locale } from "@chalk/content";
import { signal } from "@preact/signals";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { hush as phoneHush, speak as phoneSpeak } from "./speech";

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

/** Longest one sound (a clip, or the phone saying a line) may take before we stop waiting for it. */
const MAX_CLIP_MS = 20_000;

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

  /** Ends the clip or phone line playing now (a hush, a newer line, mute). */
  const stopNow = useRef<(() => void) | undefined>(undefined);

  /**
   * Plays one sound until it ends, fails, is stopped, or runs past the longest a line may take:
   * whatever happens, it is over when this resolves (the voice never keeps the board waiting).
   */
  const playOne = useCallback(
    (start: (done: (isFine: boolean) => void) => () => void) =>
      new Promise<boolean>((resolve) => {
        let isOver = false;
        // How to stop the sound: known once it has started (it may be over before then).
        const sound: { halt?: () => void } = {};
        const done = (isFine: boolean) => {
          if (isOver) return;
          isOver = true;
          clearTimeout(timer);
          stopNow.current = undefined;
          sound.halt?.();
          resolve(isFine);
        };
        const timer = setTimeout(() => done(true), MAX_CLIP_MS);
        stopNow.current = () => done(true);
        sound.halt = start(done);
        if (isOver) sound.halt();
      }),
    [],
  );

  const playClip = useCallback(
    (url: string) =>
      playOne((done) => {
        const player = new Audio(url);
        player.addEventListener("ended", () => done(true));
        player.addEventListener("error", () => done(false));
        player.play().catch(() => done(false));
        return () => player.pause();
      }),
    [playOne],
  );

  const playPhone = useCallback(
    (words: string) =>
      playOne((done) => {
        void phoneSpeak(words, locale).then(() => done(true));
        return phoneHush;
      }),
    [playOne, locale],
  );

  const stop = useCallback(() => {
    saying.current++;
    stopNow.current?.();
  }, []);

  // Gone from the screen: nothing more is said.
  useEffect(() => stop, [stop]);

  const speak = useCallback(
    async (line: Utterance) => {
      stop();
      const mine = saying.current;
      if (isMuted.peek()) return;
      const phrases = line.phrases[locale];
      if (phrases === undefined || phrases.length === 0) return;
      // 1. Its clips, glued. A clip that fails leaves the rest of the line to the next source.
      let from = 0;
      const clips = clipsFor(line);
      if (clips !== undefined) {
        for (const clip of clips) {
          if (saying.current !== mine) return;
          if (!(await playClip(clip.url))) break;
          from++;
        }
        if (from === clips.length) {
          setFailed((prev) => {
            if (!prev.has(line.name)) return prev;
            const next = new Set(prev);
            next.delete(line.name);
            return next;
          });
          return;
        }
        setFailed((prev) => new Set(prev).add(line.name));
        onFailure({ name: line.name }, "a clip failed to play");
      }
      // 2. A live voice from the server: not yet. 3. The phone's own voice, for what is left.
      if (saying.current === mine) await playPhone(phrases.slice(from).join(" "));
    },
    [locale, clipsFor, playClip, playPhone, stop, onFailure],
  );

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
