import type { Locale } from "@chalk/content";
import { estimatedSeconds } from "@chalk/prop/next";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  type Played,
  isAudible,
  isMuted,
  playClip as playOnEngine,
  prepare,
  whenAudible,
} from "./engine";
import { canSpeak, hush as phoneHush, speak as phoneSpeak } from "./speech";

/** A clip to play: where it is, and how long it plays. */
export type PlayableClip = { url: string; seconds: number };

/**
 * A chapter's clips (voiced by the content build into its sound folder): the clips that say a speaker's phrases in a language,
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

/** How much longer than its length a sound may take before we stop waiting for it, in seconds. */
const MARGIN = 2;
/** How long a live voice may take to make a line before the next source says it. */
const LIVE_WAIT_MS = 3_000;

/**
 * Says a board's lines, one at a time, from the first source that can (platform/docs/sound.md):
 * its clips glued one after another (every phrase voiced with its chapter); a live voice from the
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

  /** A voiced clip, on the engine's voice channel. */
  const playClip = useCallback(
    async (clip: PlayableClip): Promise<Played> => {
      let why: Played = "heard";
      const isHeard = await playOne(clip.seconds, (done) => {
        const playing = playOnEngine(clip.url, "voice");
        void playing.done.then((played) => {
          why = played;
          done(played === "heard");
        });
        return playing.stop;
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
      // The phone's voice doesn't say why it couldn't: while the page may not sound, it is that.
      return isHeard ? "heard" : isAudible() ? "broken" : "blocked";
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

  /** Resolves once the page may sound (its first touch), or when the line is stopped. */
  const firstTouch = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          stopNow.current = undefined;
          resolve();
        };
        stopNow.current = done;
        void whenAudible().then(done);
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
      if (isMuted.voice.peek()) return void (await playQuiet(phrases.join(" ")));
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
      // The line's clips are fetched before it starts: its time is the clips', not the network's,
      // and its phrases follow each other with no gaps.
      await Promise.all((clips ?? []).map((clip) => prepare(clip.url)));
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
      isMuted.voice.subscribe((muted) => {
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
