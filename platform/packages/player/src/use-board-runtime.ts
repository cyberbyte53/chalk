import type { Board } from "@chalk/content";
import type { Spoken } from "@chalk/prop";
// Makes every component re-render when a signal it read while rendering changes, and only then.
import "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PropRegistry } from "./prop-module";
import { BoardRuntime } from "./runtime";
import { trackBoard } from "./snapshot";

export type Speak = (prop: { name: string }, line: Spoken) => Promise<void>;

/**
 * Runs one board while it is on screen. Nothing here re-renders: each component that reads a prop's
 * view (`runtime.getView`) re-renders when that view changes.
 */
export function useBoardRuntime(board: Board, registry: PropRegistry, speak: Speak): BoardRuntime {
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const [runtime] = useState(
    () =>
      new BoardRuntime(board, (type) => registry[type]?.def, {
        speak: (prop, line) => speakRef.current(prop, line),
        frame: (callback) => {
          const handle = requestAnimationFrame(callback);
          return () => cancelAnimationFrame(handle);
        },
        now: () => performance.now(),
        // A broken rule must never fail silently, and never stop the learner.
        onError: (message, error) => console.error(message, error ?? ""),
      }),
  );
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
