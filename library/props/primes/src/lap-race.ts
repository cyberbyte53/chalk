import { localizedSchema } from "@chalk/content";
import {
  PropRole,
  actionsFor,
  call,
  defineProp,
  raise,
  seq,
  set,
  signal,
  tween,
} from "@chalk/prop";
import { z } from "zod";
import { lcm } from "./arithmetic";

export const MAX_LAP = 120;
/** Race minutes per second of watching. */
export const MINUTES_PER_SECOND = 8;
/** Longest the race runs, in minutes: past the LCM of any two laps up to MAX_LAP. */
export const MAX_TIME = MAX_LAP * MAX_LAP;

const lapRaceState = z
  .object({
    /** Minutes each runner takes for one round. */
    lapA: z.number().int().min(1).max(MAX_LAP),
    lapB: z.number().int().min(1).max(MAX_LAP),
    /** The clock, in minutes (it runs on smoothly while the race runs; it shows whole minutes). */
    time: z.number().min(0).max(MAX_TIME),
    /** Whether the race is running: the clock goes on until both are at the start together. */
    isRunning: z.boolean(),
    /** The runners' names, from the lesson. */
    nameA: localizedSchema,
    nameB: localizedSchema,
    /** The play and pause buttons' words. */
    playLabel: localizedSchema,
    pauseLabel: localizedSchema,
  })
  .strict();
export type LapRaceState = z.infer<typeof lapRaceState>;

const act = actionsFor<LapRaceState>();
const none = z.object({}).strict();

/** Both are at the start at the same minute (and the race has begun). */
const isMetOf = (s: LapRaceState) => s.time > 0 && s.time % s.lapA === 0 && s.time % s.lapB === 0;

/** The next minute after `time` when both runners are at the start together. */
export function nextMeeting(s: Pick<LapRaceState, "lapA" | "lapB" | "time">): number {
  const m = lcm(s.lapA, s.lapB);
  return (Math.floor(s.time / m) + 1) * m;
}

/** The minutes a runner has been at the start so far: 18, 36, … */
export function crossings(lap: number, time: number): number[] {
  return Array.from({ length: Math.floor(time / lap) }, (_, k) => (k + 1) * lap);
}

/** One runner's log in words: "Sonia at the start at 18 (18 × 1), 36 (18 × 2)". */
export function logText(name: string, lap: number, time: number): string {
  const at = crossings(lap, time);
  return at.length === 0
    ? `${name}: not back at the start yet`
    : `${name} at the start at ${at.map((m, k) => `${m} (${lap} × ${k + 1})`).join(", ")}`;
}

const signals = {
  met: signal("Both are at the start together, at minute `time`"),
};

/** Play's own last step, when the running clock gets to a meeting: no finger does it. */
const arrive = act({
  describe:
    "The running clock reaches the next minute both are at the start together; it stops there",
  changes: ["isRunning", "time"],
  // Play's own step when the clock gets there: no finger does it.
  internal: true,
  args: none,
  run: (s) => {
    if (!s.isRunning) return set({});
    // Already there (the clock ran to it), or on to it at once.
    const time = s.time > 0 && isMetOf(s) ? s.time : nextMeeting(s);
    return set({ isRunning: false, time }, raise(signals.met, { time }));
  },
});

/**
 * Two runners on a round track, starting together at the start line, one taking a minutes a round
 * and the other b. Play runs the clock (on the board's clock) until both are at the start together,
 * first at LCM(a, b); each minute a runner crosses the start is logged under them on the way.
 */
export const lapRace = defineProp({
  type: "lapRace",
  role: PropRole.Explainer,
  describe:
    "Two runners on a round track start together from the start line; one takes a minutes a round, the other b. Play runs the clock for both at once; each minute a runner is back at the start is written in their log (Sonia: 18, 36; Ravi: 12, 24, 36). They are at the start together at a minute in both logs, a common multiple of a and b, first at LCM(a, b). Passing each other elsewhere on the track doesn't count.",
  state: lapRaceState,
  defaults: {
    lapA: 18,
    lapB: 12,
    time: 0,
    isRunning: false,
    nameA: { en: "Sonia", hi: "सोनिया" },
    nameB: { en: "Ravi", hi: "रवि" },
    playLabel: { en: "Play", hi: "चलाओ" },
    pauseLabel: { en: "Pause", hi: "रोको" },
  },
  // The answer, before the race gets there.
  offScreen: ["lcm"],
  derived: {
    isMet: {
      describe: "Both are at the start at this minute",
      compute: isMetOf,
    },
    lcm: {
      describe: "The first minute they are at the start together: LCM(a, b)",
      compute: (s) => lcm(s.lapA, s.lapB),
    },
  },
  actions: {
    play: act({
      describe:
        "Start the clock: both run until they are at the start together (the learner's button)",
      changes: ["isRunning", "time"],
      byLearner: true,
      args: none,
      run: (s) => {
        const stop = nextMeeting(s);
        if (s.isRunning || stop > MAX_TIME) return set({});
        // The clock runs on the board's clock to the next minute both are at the start, and stops.
        return seq(
          set({ isRunning: true }),
          tween(
            (stop - s.time) / MINUTES_PER_SECOND,
            { time: stop },
            { ease: (x) => x, while: (now) => now.isRunning },
          ),
          call(arrive),
        );
      },
    }),
    pause: act({
      describe: "Stop the clock at the minute it shows (the learner's button)",
      changes: ["isRunning", "time"],
      byLearner: true,
      args: none,
      run: (s) => set({ isRunning: false, time: Math.floor(s.time + 1e-9) }),
    }),
    arrive,
    startAgain: act({
      describe: "Both back at the start line, the clock at 0",
      changes: ["time", "isRunning"],
      byLearner: true,
      args: none,
      run: () => set({ time: 0, isRunning: false }),
    }),
    runToMeet: act({
      describe: "Run until they are first at the start together",
      changes: ["time", "isRunning"],
      reveals: true,
      args: none,
      run: (s) => {
        const m = lcm(s.lapA, s.lapB);
        return set({ time: m, isRunning: false }, raise(signals.met, { time: m }));
      },
    }),
  },
  signals,
  summary: (s) =>
    `${s.nameA.en} takes ${s.lapA} minutes a round, ${s.nameB.en} ${s.lapB}; the clock shows ${Math.floor(s.time + 1e-9)} minutes${
      isMetOf(s) ? ", and both are at the start together" : ""
    }${s.isRunning ? "; the race is running" : ""}`,
});
