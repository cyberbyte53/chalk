import { localizedSchema } from "@chalk/content";
import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { lcm } from "./arithmetic";
import { button } from "./seen";

export const MAX_LAP = 120;
/** Longest the race runs, in minutes: past the LCM of any two laps up to MAX_LAP. */
export const MAX_TIME = MAX_LAP * MAX_LAP;

export const LapRaceAction = {
  Play: "play",
  Pause: "pause",
  Arrive: "arrive",
  StartAgain: "startAgain",
  RunToMeet: "runToMeet",
} as const;

export const LapRaceDerived = {
  IsMet: "isMet",
  Lcm: "lcm",
} as const;

export const LapRaceSignal = { Met: "met" } as const;

const lapRaceState = z
  .object({
    /** Minutes each runner takes for one round. */
    lapA: z.number().int().min(1).max(MAX_LAP),
    lapB: z.number().int().min(1).max(MAX_LAP),
    /** The clock, in minutes, where it last stopped. */
    time: z.number().int().min(0).max(MAX_TIME),
    /** Whether the race is running: the clock goes on until both are at the start together. */
    isRunning: z.boolean(),
    /** The letter counting each runner's rounds: Sonia is at the start at minute lapA × letterA. */
    letterA: z.string().min(1).max(2),
    letterB: z.string().min(1).max(2),
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

/**
 * Two runners on a round track, starting together at the start line, one taking a minutes a round
 * and the other b. Play runs the clock (the view animates it) until both are at the start together,
 * first at LCM(a, b); each minute a runner crosses the start is logged under them on the way.
 */
export const lapRace = defineProp({
  type: "lapRace",
  describe:
    "Two runners on a round track start together from the start line; one takes a minutes a round, the other b. Play runs the clock for both at once; each minute a runner is back at the start is written in their log (Sonia: 18, 36; Ravi: 12, 24, 36). They are at the start together at a minute in both logs, a common multiple of a and b, first at LCM(a, b). Passing each other elsewhere on the track doesn't count.",
  state: lapRaceState,
  defaults: {
    lapA: 18,
    lapB: 12,
    time: 0,
    isRunning: false,
    letterA: "m",
    letterB: "n",
    nameA: { en: "Sonia", hi: "सोनिया" },
    nameB: { en: "Ravi", hi: "रवि" },
    playLabel: { en: "Play", hi: "चलाओ" },
    pauseLabel: { en: "Pause", hi: "रोको" },
  },
  derived: {
    [LapRaceDerived.IsMet]: {
      describe: "Both are at the start at this minute",
      compute: isMetOf,
    },
    [LapRaceDerived.Lcm]: {
      describe: "The first minute they are at the start together: LCM(a, b)",
      compute: (s) => lcm(s.lapA, s.lapB),
    },
  },
  actions: {
    [LapRaceAction.Play]: act({
      describe:
        "Start the clock: both run until they are at the start together (the learner's button)",
      byLearner: true,
      args: none,
      run: (s) => (s.isRunning || nextMeeting(s) > MAX_TIME ? set({}) : set({ isRunning: true })),
    }),
    [LapRaceAction.Pause]: act({
      describe: "Stop the clock at the minute it shows (the learner's button)",
      byLearner: true,
      args: z.object({ time: z.number().int().min(0).max(MAX_TIME) }).strict(),
      run: (s, a) => {
        if (!s.isRunning || a.time < s.time || a.time >= nextMeeting(s))
          return set({ isRunning: false });
        return set({ isRunning: false, time: a.time });
      },
    }),
    [LapRaceAction.Arrive]: act({
      describe:
        "The running clock reaches the next minute both are at the start together; it stops there (the view calls this when its clock gets there)",
      byLearner: true,
      args: none,
      run: (s) => {
        if (!s.isRunning) return set({});
        const time = nextMeeting(s);
        return set({ isRunning: false, time }, { signal: LapRaceSignal.Met, payload: { time } });
      },
    }),
    [LapRaceAction.StartAgain]: act({
      describe: "Both back at the start line, the clock at 0",
      byLearner: true,
      args: none,
      run: () => set({ time: 0, isRunning: false }),
    }),
    [LapRaceAction.RunToMeet]: act({
      describe: "Run until they are first at the start together",
      reveals: true,
      args: none,
      run: (s) => {
        const m = lcm(s.lapA, s.lapB);
        return set(
          { time: m, isRunning: false },
          { signal: LapRaceSignal.Met, payload: { time: m } },
        );
      },
    }),
  },
  signals: {
    [LapRaceSignal.Met]: { describe: "Both are at the start together, at minute `time`" },
  },
  observe: (s) => {
    const met = isMetOf(s);
    return {
      summary: `${s.nameA.en} takes ${s.lapA} minutes a round, ${s.nameB.en} ${s.lapB}; the clock shows ${s.time} minutes${
        met ? ", and both are at the start together" : ""
      }${s.isRunning ? "; the race is running" : ""}`,
      elements: [
        {
          id: "track",
          value: met ? "both runners at the start line" : `minute ${s.time} of the race`,
        },
        { id: "clock", value: `${s.time} min` },
        { id: "logA", value: logText(s.nameA.en, s.lapA, s.time) },
        { id: "logB", value: logText(s.nameB.en, s.lapB, s.time) },
        s.isRunning ? button("pause") : button("play", nextMeeting(s) <= MAX_TIME),
        button("startAgain", s.time > 0 || s.isRunning),
      ],
      ...(met ? {} : { hidden: { lcm: lcm(s.lapA, s.lapB) } }),
    };
  },
});
