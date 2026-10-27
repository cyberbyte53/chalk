import { SizeFit, actionsFor, defineProp, repeat, seq, set } from "@chalk/prop";
import { z } from "zod";

export const TimerSignal = { Tick: "tick" } as const;

const timerState = z
  .object({
    isRunning: z.boolean(),
    /** Ticks since it last started. */
    ticks: z.number().int().min(0),
  })
  .strict();
export type TimerState = z.infer<typeof timerState>;

const act = actionsFor<TimerState>();

/**
 * Ticks on the board's clock (so pausing the board pauses it). `start` finishes when the timer
 * stops, so a script can say "tick 100 times, then…". Nothing on screen.
 */
export const timer = defineProp({
  type: "timer",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
  isExplainer: false,
  describe:
    "A timer that raises `tick` every so often, for things that repeat (toss, sample, step).",
  state: timerState,
  defaults: { isRunning: false, ticks: 0 },
  actions: {
    start: act({
      describe:
        "Tick every `every` seconds, `times` times (or until stopped); finishes when it stops",
      args: z
        .object({
          every: z.number().min(0.02).max(60),
          times: z.number().int().positive().optional(),
        })
        .strict(),
      run: (_s, a) =>
        seq(
          set({ isRunning: true, ticks: 0 }),
          repeat(a.every, "tick", {
            while: (s) => s.isRunning,
            args: a.times === undefined ? {} : { times: a.times },
          }),
        ),
    }),
    tick: act({
      describe: "One tick (the timer's own step)",
      internal: true,
      args: z.object({ times: z.number().int().positive().optional() }).strict(),
      run: (s, a) => {
        const ticks = s.ticks + 1;
        const isRunning = a.times === undefined || ticks < a.times;
        return set({ ticks, isRunning }, { signal: TimerSignal.Tick, payload: { ticks } });
      },
    }),
    stop: act({
      describe: "Stop ticking",
      args: z.object({}).strict(),
      run: () => set({ isRunning: false }),
    }),
  },
  signals: { [TimerSignal.Tick]: { describe: "Time for the next one" } },
});
