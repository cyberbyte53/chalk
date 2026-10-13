import type { Board } from "@chalk/content";
import type { Spoken } from "@chalk/prop";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PropRegistry } from "./prop-module";
import { BoardRuntime } from "./runtime";

export type Speak = (prop: { name: string; id: number | undefined }, line: Spoken) => Promise<void>;

/** Runs one board while it is on screen, and re-renders whenever any prop's state changes. */
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
  const [, setVersion] = useState(0);
  useEffect(() => {
    const stop = runtime.subscribe(() => setVersion((v) => v + 1));
    runtime.start();
    return () => {
      stop();
      runtime.dispose();
    };
  }, [runtime]);
  return runtime;
}
