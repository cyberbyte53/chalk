import { actionsFor, defineProp, set, task } from "@chalk/prop";
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
export const timer = defineProp<TimerState>({
  type: "timer",
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
        task(async (context) => {
          context.set({ isRunning: true, ticks: 0 });
          while (context.get().isRunning) {
            await context.wait(a.every);
            if (!context.get().isRunning) break;
            const ticks = context.get().ticks + 1;
            context.set({ ticks });
            context.emit(TimerSignal.Tick, { ticks });
            if (a.times !== undefined && ticks >= a.times) context.set({ isRunning: false });
          }
        }),
    }),
    stop: act({
      describe: "Stop ticking",
      args: z.object({}).strict(),
      run: () => set({ isRunning: false }),
    }),
  },
  signals: { [TimerSignal.Tick]: { describe: "Time for the next one" } },
});
