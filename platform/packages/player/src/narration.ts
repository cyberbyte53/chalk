import { type Locale, audioKey } from "@chalk/content";
import { segment } from "@chalk/prop";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

/** Where a spoken line's audio file is, by audio key; undefined when the lesson has no audio at all. */
export type AudioSource = (key: string) => string | undefined;

/** A prop that is speaking: its name (for the retry mark and, as its address, its audio file). */
export type SpokenProp = { name: string };

export type Narrator = {
  /** Plays a prop's line and resolves when it ends (or fails; the text is on screen either way). */
  speak: (prop: SpokenProp) => Promise<void>;
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
  /** The board as events name it (boardKey): with each prop's address, its audio files' keys. */
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

  const speak = useCallback(
    (prop: SpokenProp) =>
      new Promise<void>((resolve) => {
        if (source === undefined) return resolve(); // this lesson has no audio yet
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
    [board, locale, source, onFailure],
  );

  return { speak, failed };
}
