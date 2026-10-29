import { localizedSchema } from "@chalk/content";
import {
  type Effect,
  actionsFor,
  call,
  layersFor,
  raise,
  seq,
  set,
  signal,
  tween,
} from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, type Point, pointSchema } from "./plane";

export type WalkerState = PlaneCore & {
  walkerName: z.infer<typeof localizedSchema>;
  walkFrom: Point | null;
  along: number;
  up: number;
  walked: number;
  isWalking: boolean;
  canSetSteps: boolean;
};

const MAX_STEPS = 50;
/** Seconds she takes from one line to the next. */
export const SECONDS_PER_LINE = 0.4;
const act = actionsFor<WalkerState>();
const none = z.object({}).strict();
const count = z.object({ value: z.number().int().min(-MAX_STEPS).max(MAX_STEPS) }).strict();

/** Where the walker stands after `walked` units: along first, then up. */
export function walkerAt(
  s: Pick<WalkerState, "walkFrom" | "along" | "up" | "walked">,
): Point | null {
  if (s.walkFrom === null) return null;
  const a = Math.min(s.walked, Math.abs(s.along));
  const u = Math.max(0, s.walked - Math.abs(s.along));
  return { x: s.walkFrom.x + Math.sign(s.along) * a, y: s.walkFrom.y + Math.sign(s.up) * u };
}

export const walkerSignals = {
  passed: signal("The walker passed a line: `axis`, counted `count` so far"),
  turned: signal("The walker went `along` along the first line and turned"),
  arrived: signal("The walker arrived at (`x`, `y`); `isAtTarget` when that is the target place"),
};

/** The target place another layer marks (Aman's house), if there is one. */
const targetOf = (s: WalkerState): Point | null =>
  (s as WalkerState & { target?: Point | null }).target ?? null;

/**
 * Walks her from where she stands to the end, one line at a time: along first, then she turns,
 * then up or down. Each line passed is announced with how many so far.
 */
const walkOn = act({
  describe:
    "Walk: along by the first number, counting each line passed, turn, then up or down by the second (the learner's Walk; timed)",
  byLearner: true,
  args: none,
  changes: ["walked", "isWalking"],
  run: (s) => {
    const total = Math.abs(s.along) + Math.abs(s.up);
    if (s.walkFrom === null || total === 0) return set({});
    // From the start again once she has arrived; else on from where she stopped.
    const from = s.walked >= total ? 0 : Math.floor(s.walked);
    const steps: Effect<WalkerState>[] = [set({ walked: from, isWalking: true })];
    for (let k = from + 1; k <= total; k++) {
      const isAlong = k <= Math.abs(s.along);
      steps.push(
        tween(SECONDS_PER_LINE, { walked: k }, { ease: (x) => x, while: (now) => now.isWalking }),
        set(
          {},
          raise(walkerSignals.passed, {
            axis: isAlong ? "along" : "up",
            count: isAlong ? k : k - Math.abs(s.along),
          }),
          ...(k === Math.abs(s.along) && s.up !== 0
            ? [raise(walkerSignals.turned, { along: s.along })]
            : []),
        ),
      );
    }
    const end = walkerAt({ ...s, walked: total }) ?? s.walkFrom;
    const target = targetOf(s);
    const isAtTarget = target !== null && target.x === end.x && target.y === end.y;
    steps.push(
      set({ isWalking: false }, raise(walkerSignals.arrived, { x: end.x, y: end.y, isAtTarget })),
    );
    return seq(...steps);
  },
});

export const walker = layersFor<WalkerState>()({
  name: "walker",
  frame: "plane",
  describe:
    "A walker (Riya) who goes from where she starts along the horizontal line by one number, then turns and goes up or down by the other, on the lines only, counting each line she passes. She always goes where the two numbers say, so swapped numbers end somewhere else.",
  fields: {
    walkerName: localizedSchema,
    /** Where she starts (Riya's corner, O), or null: no walker. */
    walkFrom: pointSchema.nullable(),
    /** The first number: how far along, + to the right, − to the left. */
    along: z.number().int().min(-MAX_STEPS).max(MAX_STEPS),
    /** The second number: how far up (+) or down (−) after she turns. */
    up: z.number().int().min(-MAX_STEPS).max(MAX_STEPS),
    /** How far she has walked so far, in units: along first, then up. */
    walked: z.number().min(0),
    isWalking: z.boolean(),
    /** Whether the learner sets the two numbers (steppers). */
    canSetSteps: z.boolean(),
  },
  defaults: {
    walkerName: { en: "Riya", hi: "रिया" },
    walkFrom: null,
    along: 0,
    up: 0,
    walked: 0,
    isWalking: false,
    canSetSteps: true,
  },
  isOn: (s) => s.walkFrom !== null,
  actions: {
    setAlong: act({
      describe:
        "Set the first number, how far along (the learner's stepper); she goes back to the start",
      byLearner: true,
      args: count,
      changes: ["along", "walked", "isWalking"],
      run: (_, { value }) => set({ along: value, walked: 0, isWalking: false }),
    }),
    setUp: act({
      describe:
        "Set the second number, how far up or down (the learner's stepper); she goes back to the start",
      byLearner: true,
      args: count,
      changes: ["up", "walked", "isWalking"],
      run: (_, { value }) => set({ up: value, walked: 0, isWalking: false }),
    }),
    walk: walkOn,
    walkTo: act({
      describe: "Set both numbers to reach (x, y) from the start, and walk there (timed)",
      reveals: true,
      args: pointSchema,
      changes: ["along", "up", "walked", "isWalking"],
      run: (s, p) =>
        s.walkFrom === null
          ? set({})
          : seq(
              set({
                along: p.x - s.walkFrom.x,
                up: p.y - s.walkFrom.y,
                walked: 0,
                isWalking: false,
              }),
              call(walkOn),
            ),
    }),
    backToStart: act({
      describe: "Back to where she started (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["walked", "isWalking"],
      run: () => set({ walked: 0, isWalking: false }),
    }),
  },
  signals: walkerSignals,
  derived: {
    position: {
      describe: "Where she stands now",
      compute: walkerAt,
    },
    isArrived: {
      describe: "She has walked both numbers",
      compute: (s) => s.walked >= Math.abs(s.along) + Math.abs(s.up),
    },
  },
  invariant: (s) =>
    s.walked > Math.abs(s.along) + Math.abs(s.up) + 1e-9
      ? "she can't have walked further than the two numbers say"
      : undefined,
});
