import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { useWhenChanged } from "./when-changed";

/**
 * The board's clock, for a view whose look eases (a camera gliding to what changed). The state is
 * the target; the view eases toward it on this clock, so pausing the board pauses it, and a board
 * with no screen (or a picture taken at once) shows the target. Views never run their own clock.
 */
export type BoardClock = {
  /** Seconds, not counting pauses. */
  time: () => number;
  /** Calls back on the next frame; returns a function that cancels it. */
  frame: (callback: () => void) => () => void;
};

export const BoardClockContext = createContext<BoardClock | null>(null);

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

/** Numbers that ease from where they were to `target` over `seconds` of board time. */
export function useBoardTween<T extends Readonly<Record<string, number>>>(
  target: T,
  seconds: number,
): T {
  const clock = useContext(BoardClockContext);
  const [now, setNow] = useState(target);
  const from = useRef(target);
  const key = JSON.stringify(target);
  useWhenChanged([key, clock, seconds], () => {
    const start = from.current;
    if (JSON.stringify(start) === key) return;
    if (clock === null || seconds <= 0) {
      from.current = target;
      setNow(target);
      return;
    }
    const t0 = clock.time();
    let cancel = () => {};
    const step = () => {
      const k = Math.min(1, (clock.time() - t0) / seconds);
      const e = easeInOut(k);
      const next = Object.fromEntries(
        Object.entries(target).map(([name, to]) => {
          const was = start[name] ?? to;
          return [name, was + (to - was) * e];
        }),
      ) as T;
      from.current = next;
      setNow(next);
      if (k < 1) cancel = clock.frame(step);
    };
    cancel = clock.frame(step);
    return () => cancel();
  });
  return now;
}
