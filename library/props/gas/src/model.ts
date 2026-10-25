import { actionsFor, defineProp, repeat, seq, set } from "@chalk/prop";
import { z } from "zod";

/**
 * An ideal gas in a box (an experiment: how far the board model goes with many moving things).
 *
 * Only independent quantities are stored. Each particle's start and direction come from the seed,
 * and every particle moves at a speed set by the temperature, so where a particle is follows from
 * `travel` alone: how far the gas has moved so far (it grows faster when it is hotter). Particles
 * bounce off the walls and pass through each other.
 */

export const GasAction = {
  Start: "start",
  Step: "step",
  Stop: "stop",
  Heat: "heat",
  Cool: "cool",
  SetCount: "setCount",
} as const;

export const MAX_PARTICLES = 5000;
export const MIN_TEMPERATURE = 0.25;
export const MAX_TEMPERATURE = 4;
/** One frame of the gas's own clock. */
export const STEP = 1 / 60;
/** How far a particle at temperature 1 travels in a second, in box widths. */
const SPEED = 0.35;

const gasState = z
  .object({
    count: z.number().int().min(1).max(MAX_PARTICLES),
    temperature: z.number().min(MIN_TEMPERATURE).max(MAX_TEMPERATURE),
    /** How far the gas has moved, in box widths at unit speed. */
    travel: z.number().min(0),
    isRunning: z.boolean(),
    seed: z.number().int().min(0),
  })
  .strict();
export type GasState = z.infer<typeof gasState>;

const act = actionsFor<GasState>();

/** A number in [0, 1) that depends only on its inputs. */
function hash(seed: number, i: number, k: number): number {
  let h = (seed * 374761393 + i * 668265263 + k * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** Bounces a coordinate back and forth inside [0, 1]. */
function bounce(u: number): number {
  const m = ((u % 2) + 2) % 2;
  return m <= 1 ? m : 2 - m;
}

/** Where every particle is, as [x0, y0, x1, y1, …] in [0, 1] (y measured on the box's height). */
export function positions(
  s: Pick<GasState, "count" | "seed" | "travel">,
  aspect: number,
): Float64Array {
  const out = new Float64Array(s.count * 2);
  for (let i = 0; i < s.count; i++) {
    const angle = hash(s.seed, i, 2) * Math.PI * 2;
    // Speeds spread out (some slow, some fast), like a real gas.
    const speed = 0.4 + 1.2 * hash(s.seed, i, 3);
    out[i * 2] = bounce(hash(s.seed, i, 0) + Math.cos(angle) * speed * s.travel);
    out[i * 2 + 1] = bounce(hash(s.seed, i, 1) + (Math.sin(angle) * speed * s.travel) / aspect);
  }
  return out;
}

export const gas = defineProp({
  type: "gas",
  isExplainer: false,
  describe: "An ideal gas in a box: particles bounce off the walls, faster when it is hotter.",
  state: gasState,
  defaults: {
    count: 1000,
    temperature: 1,
    travel: 0,
    isRunning: false,
    seed: 7,
  },
  derived: {
    speed: {
      describe: "How fast the gas moves now (box widths a second)",
      compute: (s) => SPEED * Math.sqrt(s.temperature),
    },
  },
  actions: {
    [GasAction.Start]: act({
      describe: "Let the gas move (until stopped)",
      byLearner: true,
      args: z.object({}).strict(),
      run: () =>
        seq(set({ isRunning: true }), repeat(STEP, GasAction.Step, { while: (s) => s.isRunning })),
    }),
    [GasAction.Step]: act({
      describe: "Move the gas on by one step (its own clock)",
      internal: true,
      args: z.object({}).strict(),
      run: (s) => set({ travel: s.travel + SPEED * Math.sqrt(s.temperature) * STEP }),
    }),
    [GasAction.Stop]: act({
      describe: "Freeze the gas",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isRunning: false }),
    }),
    [GasAction.Heat]: act({
      describe: "Make it hotter (particles speed up)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ temperature: Math.min(MAX_TEMPERATURE, s.temperature * 2) }),
    }),
    [GasAction.Cool]: act({
      describe: "Make it colder (particles slow down)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ temperature: Math.max(MIN_TEMPERATURE, s.temperature / 2) }),
    }),
    [GasAction.SetCount]: act({
      describe: "How many particles",
      byLearner: true,
      args: z.object({ count: z.number().int().min(1).max(MAX_PARTICLES) }).strict(),
      run: (_s, a) => set({ count: a.count }),
    }),
  },
  signals: {},
});
