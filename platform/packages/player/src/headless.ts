import type { Board } from "@chalk/content";
import type { AnyPropDef, StoredState } from "@chalk/prop";
import { BoardRuntime, type RuntimeServices } from "./runtime";

/** Every prop's stored state (the board's own included), as plain data: what a phone sends. */
export type BoardState = Readonly<Record<string, StoredState>>;

/** A board's state right now, as plain data (the board's own state included: what is hidden). */
export function boardState(runtime: BoardRuntime): BoardState {
  return Object.fromEntries(runtime.saveFacts());
}

/** Each frame jumps this far: further than any wait or glide, so each finishes in one frame. */
const JUMP_MS = 60_000;
/**
 * Most frames before the board counts as never settling (a lesson that loops forever). What is still
 * waiting then is dropped: the copy stops there.
 */
const MAX_FRAMES = 400;

/** A board with no screen, where time jumps to the end of whatever is moving. */
export type HeadlessBoard = {
  runtime: BoardRuntime;
  /**
   * Resolves once nothing on the board is moving or waiting. False if it never stopped (a loop),
   * in which case what was still waiting was dropped.
   */
  settle: () => Promise<boolean>;
  /** Content errors met while it ran. */
  errors: readonly string[];
  dispose: () => void;
};

const nextTurn = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * A board for Jugnu's server: built from the lesson's board, then put into `state` (what the phone
 * sent). Its start script is not run; it is already wherever the student is. Nothing is spoken.
 * Timed actions finish at once, so `await runtime.call(...)` resolves at the end state.
 */
export function headlessBoard(
  board: Board,
  lookup: (type: string) => AnyPropDef | undefined,
  state?: BoardState,
): HeadlessBoard {
  const errors: string[] = [];
  let now = 0;
  let pending: ((now: number) => void)[] = [];
  let frames = 0;
  let isPumping = false;
  let isDisposed = false;
  let isSettled = true;
  const idle = new Set<() => void>();

  const pump = async () => {
    if (isPumping) return;
    isPumping = true;
    while (pending.length > 0 && !isDisposed) {
      if (frames >= MAX_FRAMES) {
        pending = [];
        isSettled = false;
        break;
      }
      frames++;
      now += JUMP_MS;
      const due = pending;
      pending = [];
      for (const callback of due) callback(now);
      // Let what the frame finished (a script's next step) run, and maybe ask for another frame.
      await nextTurn();
    }
    isPumping = false;
    for (const resolve of idle) resolve();
    idle.clear();
  };

  const services: RuntimeServices = {
    now: () => now,
    frame: (callback) => {
      pending.push(callback);
      // Never call back before `frame` has returned: the runtime's clock keeps what it returns.
      queueMicrotask(() => void pump());
      return () => {
        pending = pending.filter((c) => c !== callback);
      };
    },
    speak: async () => {},
    onError: (message, error) =>
      errors.push(error === undefined ? message : `${message}: ${String(error)}`),
  };

  const runtime = new BoardRuntime(board, lookup, services);
  if (state !== undefined) runtime.restoreFacts(new Map(Object.entries(state)));

  const settle = async (): Promise<boolean> => {
    frames = 0;
    isSettled = true;
    // Scripts move on in later turns of the event loop; keep looking until a turn changes nothing.
    for (let quiet = 0; quiet < 2; ) {
      await nextTurn();
      if (isPumping || pending.length > 0) {
        quiet = 0;
        await new Promise<void>((resolve) => {
          idle.add(resolve);
          if (!isPumping) void pump();
        });
      } else quiet++;
    }
    return isSettled;
  };

  return {
    runtime,
    settle,
    errors,
    dispose: () => {
      isDisposed = true;
      pending = [];
      runtime.dispose();
    },
  };
}
