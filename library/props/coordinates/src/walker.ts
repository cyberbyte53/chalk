import { localizedSchema } from "@chalk/content";
import { actionsFor, layersFor, set, signal } from "@chalk/prop";
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
      run: () => set({}),
    }),
    setUp: act({
      describe:
        "Set the second number, how far up or down (the learner's stepper); she goes back to the start",
      byLearner: true,
      args: count,
      changes: ["up", "walked", "isWalking"],
      run: () => set({}),
    }),
    walk: act({
      describe:
        "Walk: along by the first number, counting each line passed, turn, then up or down by the second (the learner's Walk; timed)",
      byLearner: true,
      args: none,
      changes: ["walked", "isWalking"],
      run: () => set({}),
    }),
    walkTo: act({
      describe: "Set both numbers to reach (x, y) from the start, and walk there (timed)",
      reveals: true,
      args: pointSchema,
      changes: ["along", "up", "walked", "isWalking"],
      run: () => set({}),
    }),
    backToStart: act({
      describe: "Back to where she started (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["walked", "isWalking"],
      run: () => set({}),
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
