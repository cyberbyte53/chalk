import { type Emit, PropRole, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, fromPlane, isInWindow } from "./plane";

/** A pair to plot, from a table or a list. */
export const pairSchema = z
  .object({ x: z.number(), y: z.number(), name: z.string().max(3).optional() })
  .strict();
export type Pair = z.infer<typeof pairSchema>;

/** A dot the learner put down, and whether it is where its pair says. */
export const plottedSchema = z
  .object({ x: z.number(), y: z.number(), isRight: z.boolean() })
  .strict();

/** The plane's fields it draws or decides by. */
export const plottingReads = fromPlane("window", "tickEvery");

export type PlottingState = Pick<PlaneCore, (typeof plottingReads.keys)[number]> & {
  toPlot: Pair[];
  plotted: z.infer<typeof plottedSchema>[];
  showSwaps: boolean;
  showTable: boolean;
  scaleChoices: number[];
};

const MAX_PAIRS = 12;
/** Two numbers the same, to a millionth (a tap snaps to quarters; pairs carry decimals). */
const same = (a: number, b: number) => Math.abs(a - b) < 1e-6;

/** Whether it is drawn on the plane. */
export const isPlottingOn = (s: Pick<PlottingState, "toPlot">) => s.toPlot.length > 0;
