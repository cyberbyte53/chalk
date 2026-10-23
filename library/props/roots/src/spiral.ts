import { type Box, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";
import { around, spiralLayout, spiralPoints } from "./geometry";
import { glide } from "./glide";
import { rootText } from "./surd";

export const RootSpiralPart = {
  Centre: "centre",
  HypotenusePrefix: "hypotenuse:",
  LegPrefix: "leg:",
} as const;

export const RootSpiralSignal = { Grown: "grown" } as const;

export const MAX_STEPS = 16;
/** How long a new triangle takes to draw. */
export const GROW_SECONDS = 1.2;

const rootSpiralState = z
  .object({
    /** How many right triangles (steps = 1: OP1 = 1 and OP2 = √2). */
    steps: z.number().int().min(1).max(MAX_STEPS),
    /** How far the newest triangle is drawn: its unit leg first, then its hypotenuse. */
    grow: z.number().min(0).max(1),
  })
  .strict();
export type RootSpiralState = z.infer<typeof rootSpiralState>;

const act = actionsFor<RootSpiralState>();

function parts(s: RootSpiralState): string[] {
  const out: string[] = [RootSpiralPart.Centre];
  for (let k = 1; k <= s.steps + 1; k++) out.push(`${RootSpiralPart.HypotenusePrefix}${k}`);
  for (let k = 1; k <= s.steps; k++) out.push(`${RootSpiralPart.LegPrefix}${k}`);
  return out;
}

function locate(s: RootSpiralState, part: string, width: number): Box | undefined {
  if (!parts(s).includes(part)) return undefined;
  const layout = spiralLayout(s.steps, width);
  const points = spiralPoints(s.steps + 1).map(layout.px);
  const at = (k: number) => points[k] ?? { x: 0, y: 0 };
  if (part === RootSpiralPart.Centre) return around([at(0)]);
  if (part.startsWith(RootSpiralPart.HypotenusePrefix)) {
    const k = Number(part.slice(RootSpiralPart.HypotenusePrefix.length));
    return around([at(0), at(k)], 8);
  }
  const k = Number(part.slice(RootSpiralPart.LegPrefix.length));
  return around([at(k), at(k + 1)], 8);
}

/**
 * The square-root spiral: OP1 = 1, and at each Pk a unit perpendicular to OPk gives P(k+1), so
 * OP(k+1)² = OPk² + 1. It knows right triangles, nothing about any lesson.
 */
export const rootSpiral = defineProp({
  type: "rootSpiral",
  describe:
    "The square-root spiral: start with OP1 = 1; at P1 a unit perpendicular to OP1 gives P2 with OP2 = √2; at P2 a unit perpendicular to OP2 gives P3 with OP3 = √3; and so on, `steps` triangles in all. Hypotenuses labelled √2, √3, 2, √5, …",
  state: rootSpiralState,
  defaults: { steps: 1, grow: 1 },
  derived: {
    lastSquared: {
      describe: "The newest hypotenuse squared, OP(steps+1)² = steps + 1",
      compute: (s) => s.steps + 1,
    },
    lastText: {
      describe: 'The newest hypotenuse as maths, e.g. "√5", or "3" when it is √9',
      compute: (s) => rootText(s.steps + 1),
    },
  },
  actions: {
    addStep: act({
      describe:
        "Add the next triangle: draw a unit perpendicular at the newest point, then the new hypotenuse from O (over 1.2 s). Keeps the triangles already there. Raises `grown`.",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.steps >= MAX_STEPS) throw new Error(`the spiral stops at ${MAX_STEPS} triangles`);
        const steps = s.steps + 1;
        return task(async (c) => {
          c.set({ steps, grow: 0 });
          let last = 0;
          const isSame = () => c.get().steps === steps && c.get().grow === last;
          const isDone = await glide(c.wait, GROW_SECONDS, 0, (grow) => {
            if (!isSame()) return false;
            c.set({ grow });
            last = grow;
            return true;
          });
          if (!isDone || !isSame()) return;
          c.set({ grow: 1 });
          c.emit(RootSpiralSignal.Grown, { squared: steps + 1 });
        });
      },
    }),
    removeStep: act({
      describe: "Take away the newest triangle (never the first). Keeps the rest.",
      args: z.object({}).strict(),
      run: (s) => set({ steps: Math.max(1, s.steps - 1), grow: 1 }),
    }),
    showSteps: act({
      describe: "Show `steps` triangles, drawn at once",
      args: z.object({ steps: z.number().int().min(1).max(MAX_STEPS) }).strict(),
      run: (_s, a) => set({ steps: a.steps, grow: 1 }),
    }),
    startAgain: act({
      describe: "Back to the first triangle",
      args: z.object({}).strict(),
      run: () => set({ steps: 1, grow: 1 }),
    }),
  },
  signals: {
    [RootSpiralSignal.Grown]: { describe: "The newest hypotenuse, √`squared`, is drawn" },
  },
  parts,
  locate,
});
