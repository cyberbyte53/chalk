import type { localizedSchema } from "@chalk/content";
import {
  type Effect,
  type Emit,
  PropRole,
  actionsFor,
  defineProp,
  raise,
  seq,
  set,
  signal,
  wait,
} from "@chalk/prop";
import { z } from "zod";
import type { Point, pointSchema } from "./plane";

export const throwSchema = z
  .object({ red: z.number().int().min(1).max(6), green: z.number().int().min(1).max(6) })
  .strict();

export type DiceState = {
  counters: z.infer<typeof pointSchema>[];
  playerNames: z.infer<typeof localizedSchema>[];
  turn: number;
  lastThrow: z.infer<typeof throwSchema> | null;
  seed: number;
  throwsMade: number;
  goal: number;
  winner: number | null;
};

/** Seconds a counter takes from one line to the next. */
const SECONDS_PER_LINE = 0.18;

/** A number from 0 to 1, the same for the same seed and n (mulberry32). */
function chance(seed: number, n: number): number {
  let t = (seed * 2654435761 + n * 40503 + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** The n-th throw of a game with this seed: red and green, 1 to 6 each. */
export function throwOf(seed: number, n: number): { red: number; green: number } {
  return {
    red: 1 + Math.floor(chance(seed, 2 * n) * 6),
    green: 1 + Math.floor(chance(seed, 2 * n + 1) * 6),
  };
}

/** Who: player 0 or 1. A die's face: 1 to 6. A counter's coordinate: a whole number from 0. */
const player = z.number().int().min(0).max(1);
const face = z.number().int().min(1).max(6);
const coordinate = z.number().int().min(0);

/** Whether it is drawn on the plane. */
export const isDiceOn = (s: Pick<DiceState, "counters">) => s.counters.length > 0;
