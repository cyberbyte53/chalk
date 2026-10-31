import type { Sound } from "@chalk/content";
import type { Board, Locale } from "@chalk/content";
import type { WordsToSay } from "./sound/narration";
// Makes every component re-render when a signal it read while rendering changes, and only then.
import "@preact/signals";
import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import type { PropRegistry } from "./prop-module";
import { BoardRuntime } from "./runtime";
import { type LiveBoard, SceneRuntime } from "./scene-runtime";
import { trackBoard } from "./snapshot";

export type Speak = (line: WordsToSay) => Promise<void>;

/**
 * How fast boards' clocks run: 1 for a student (real time); a tool watching boards may run them
 * faster (the chalk MCP's play), so waits and glides end sooner, in the same order, with the same
 * values.
 */
export const BoardSpeedContext = createContext(1);

/**
 * Runs one board while it is on screen. Nothing here re-renders: each component that reads a prop's
 * view (`runtime.getView`) re-renders when that view changes.
 */
export function useBoardRuntime(
  board: Board,
  registry: PropRegistry,
  speak: Speak,
  voice: {
    /** The board's language (a scene says its lines in it). */
    locale: Locale;
    lineSeconds?: (line: WordsToSay) => number | undefined;
    hush?: () => void;
    /** Nothing heard: lines keep their lengths on the board's clock; nothing plays (board-player.tsx). */
    isSilent?: boolean;
    /** Plays a sound alongside (sound/engine.ts), lasting until stopped if it lasts; returns how to stop it. */
    playSound?: (sound: Sound, lasts?: boolean) => () => void;
  },
): LiveBoard {
  const speed = useContext(BoardSpeedContext);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const [runtime] = useState((): LiveBoard => {
    const services = {
      // A silent board says nothing: its lines only take their time.
      speak: (line: WordsToSay) =>
        voice.isSilent === true ? Promise.resolve() : speakRef.current(line),
      frame: (callback: (now: number) => void) => {
        const handle = requestAnimationFrame((ms) => callback(ms * speed));
        return () => cancelAnimationFrame(handle);
      },
      now: () => performance.now() * speed,
      // A broken rule must never fail silently, and never stop the learner.
      onError: (message: string, error?: unknown) => console.error(message, error ?? ""),
    };
    return board.model !== undefined
      ? new SceneRuntime(board, (type) => registry[type], {
          ...services,
          locale: voice.locale,
          ...(voice.lineSeconds === undefined ? {} : { lineSeconds: voice.lineSeconds }),
          ...(voice.hush === undefined ? {} : { hush: voice.hush }),
          // Heard, a line is over when its sound is; silent, it keeps its length and nothing plays.
          ...(voice.isSilent === true || voice.playSound === undefined
            ? {}
            : { playSound: voice.playSound }),
          isHeard: voice.isSilent !== true,
        })
      : new BoardRuntime(board, (type) => registry[type], {
          ...services,
          frame: (callback) => {
            const handle = requestAnimationFrame(callback);
            return () => cancelAnimationFrame(handle);
          },
        });
  });
  useEffect(() => {
    runtime.start();
    const untrack = trackBoard(runtime);
    return () => {
      untrack();
      runtime.dispose();
    };
  }, [runtime]);
  return runtime;
}
