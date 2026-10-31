import { z } from "zod";
import { type PlaneCore, fromPlane } from "./plane";

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

/** Whether it is drawn on the plane. */
export const isPlottingOn = (s: Pick<PlottingState, "toPlot">) => s.toPlot.length > 0;
