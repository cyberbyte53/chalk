import type { Sound } from "@chalk/content";
import type { Board, Locale } from "@chalk/content";
import { type SoundPlaying, isMuted } from "./sound/engine";
import type { WordsToSay } from "./sound/voice";
// Makes every component re-render when a signal it read while rendering changes, and only then.
import "@preact/signals";
import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import type { PropRegistry } from "./prop-module";
import { BoardRuntime } from "./runtime";
import { trackBoard } from "./snapshot";

export type Speak = (line: WordsToSay) => Promise<boolean>;

/**
 * How fast boards' clocks run: 1 for a student (real time); a tool watching boards may run them
 * faster, so waits and glides end sooner, in the same order, with the same values. Infinity: a
 * tool reading boards, whose clocks jump to where they end (runtime.ts, isJumping).
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
    /** Not started yet: shown, its clock still (a board waiting for its first touch). */
    isHeld?: boolean;
    /** Plays a sound alongside (sound/engine.ts), lasting until stopped if it lasts; returns how to stop it. */
    playSound?: (sound: Sound, lasts?: boolean) => SoundPlaying;
  },
): BoardRuntime {
  const given = useContext(BoardSpeedContext);
  const isJumping = given === Number.POSITIVE_INFINITY;
  const speed = isJumping ? 1 : given;
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const [runtime] = useState((): BoardRuntime => {
    const services = {
      // A silent board says nothing: its lines only take their time.
      speak: (line: WordsToSay) =>
        voice.isSilent === true ? Promise.resolve(false) : speakRef.current(line),
      frame: (callback: (now: number) => void) => {
        const handle = requestAnimationFrame((ms) => callback(ms * speed));
        return () => cancelAnimationFrame(handle);
      },
      now: () => performance.now() * speed,
      // A broken rule must never fail silently, and never stop the learner.
      onError: (message: string, error?: unknown) => console.error(message, error ?? ""),
    };
    return new BoardRuntime(board, (type) => registry[type], {
      ...services,
      locale: voice.locale,
      ...(voice.lineSeconds === undefined ? {} : { lineSeconds: voice.lineSeconds }),
      ...(voice.hush === undefined ? {} : { hush: voice.hush }),
      // Heard, a line is over when its sound is; silent, it keeps its length and nothing plays.
      ...(voice.isSilent === true || voice.playSound === undefined
        ? {}
        : { playSound: voice.playSound }),
      isHeard: voice.isSilent !== true,
      // The child's switches (a heard board only: a tool's boards keep every line's length).
      ...(voice.isSilent === true
        ? {}
        : {
            isVoiceOff: () => isMuted.voice.peek(),
            isSoundsOff: () => isMuted.sounds.peek(),
          }),
      ...(isJumping ? { isJumping: true } : {}),
    });
  });
  const isHeld = voice.isHeld === true;
  useEffect(() => {
    if (isHeld) return;
    runtime.start();
    const untrack = trackBoard(runtime);
    return () => {
      untrack();
      runtime.dispose();
    };
  }, [runtime, isHeld]);
  // The voice turned off mid-line: that line is over now.
  const isSilent = voice.isSilent === true;
  useEffect(
    () => (isSilent ? undefined : isMuted.voice.subscribe((off) => off && runtime.voiceOff())),
    [runtime, isSilent],
  );
  return runtime;
}
