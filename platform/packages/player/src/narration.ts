import { type Locale, audioKey } from "@chalk/content";
import { type Spoken, segment } from "@chalk/prop";
import { signal } from "@preact/signals";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

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

/** Where a spoken line's audio file is, by audio key; undefined when the lesson has no audio at all. */
export type AudioSource = ((key: string) => string | undefined) & {
  /** How long the line's file plays, in seconds (publish measures it), when known. */
  readonly seconds?: (key: string) => number | undefined;
  /** The words the line's clip was made from, when known: a line saying other words now skips it. */
  readonly words?: (key: string) => string | undefined;
};

/** A prop that is speaking: its name (for the retry mark and, as its address, its audio file). */
export type SpokenProp = { name: string };

export type Narrator = {
  /** Plays a prop's line and resolves when it ends (or fails; the text is on screen either way). */
  speak: (prop: SpokenProp, line?: Spoken) => Promise<void>;
  /** How long a prop's line plays here, when its audio's length is known (and its words its clip's). */
  seconds: (prop: string, line?: Spoken) => number | undefined;
  /** Stops the line being said. */
  hush: () => void;
  /** Props whose audio couldn't play, by name. */
  failed: ReadonlySet<string>;
};

/** Longest a single line may take before we stop waiting for it. */
const MAX_LINE_MS = 20_000;

/**
 * Speaks a board's lines one at a time, when a script says so. Audio comes from publish (one file per line and language).
 * Failures never block the lesson: the line is marked, reported, and the board carries on.
 */
export function useNarrator(
  /** The board's item id (its name, for a board made by hand): with each prop's address, its audio files' keys. */
  board: string,
  locale: Locale,
  source: AudioSource | undefined,
  onFailure: (prop: SpokenProp, reason: string) => void,
): Narrator {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());

  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  /** Whether the clip for `key` says `line`'s words (a line changed since the clip was made doesn't). */
  const isClipOf = useCallback(
    (key: string, line: Spoken | undefined) => {
      const made = source?.words?.(key);
      const now = line?.say[locale];
      return made === undefined || now === undefined || made === now;
    },
    [source, locale],
  );

  const speak = useCallback(
    (prop: SpokenProp, line?: Spoken) =>
      new Promise<void>((resolve) => {
        if (source === undefined) return resolve(); // this lesson has no audio yet
        if (isMuted.peek()) return resolve();
        // Its words aren't its clip's any more: nothing to play (until a live voice says them).
        if (!isClipOf(audioKey(board, segment(prop.name), locale), line)) return resolve();
        const fail = (reason: string) => {
          setFailed((prev) => new Set(prev).add(prop.name));
          onFailure(prop, reason);
          resolve();
        };
        const url = source(audioKey(board, segment(prop.name), locale));
        if (url === undefined) return fail("no audio file for this line");
        audio.current?.pause();
        const player = new Audio(url);
        audio.current = player;
        let isDone = false;
        const finish = () => {
          if (isDone) return;
          isDone = true;
          clearTimeout(timer);
          setFailed((prev) => {
            if (!prev.has(prop.name)) return prev;
            const next = new Set(prev);
            next.delete(prop.name);
            return next;
          });
          resolve();
        };
        const timer = setTimeout(finish, MAX_LINE_MS);
        player.addEventListener("ended", finish);
        player.addEventListener("error", () => {
          if (isDone) return;
          isDone = true;
          clearTimeout(timer);
          fail("audio failed to load");
        });
        player.play().catch((error: unknown) => {
          if (isDone) return;
          isDone = true;
          clearTimeout(timer);
          fail(error instanceof Error ? error.name : "audio could not play");
        });
      }),
    [board, locale, source, onFailure, isClipOf],
  );

  // Muting stops the line being said.
  useEffect(
    () =>
      isMuted.subscribe((muted) => {
        if (muted) audio.current?.pause();
      }),
    [],
  );

  const seconds = useCallback(
    (prop: string, line?: Spoken) => {
      const key = audioKey(board, segment(prop), locale);
      return isClipOf(key, line) ? source?.seconds?.(key) : undefined;
    },
    [board, locale, source, isClipOf],
  );

  const hush = useCallback(() => audio.current?.pause(), []);

  return { speak, failed, seconds, hush };
}
