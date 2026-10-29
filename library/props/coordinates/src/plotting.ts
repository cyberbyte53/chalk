import { type Emit, actionsFor, layersFor, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, isInWindow } from "./plane";

/** A pair to plot, from a table or a list. */
export const pairSchema = z
  .object({ x: z.number(), y: z.number(), name: z.string().max(3).optional() })
  .strict();
export type Pair = z.infer<typeof pairSchema>;

/** A dot the learner put down, and whether it is where its pair says. */
export const plottedSchema = z
  .object({ x: z.number(), y: z.number(), isRight: z.boolean() })
  .strict();

export type PlottingState = PlaneCore & {
  toPlot: Pair[];
  plotted: z.infer<typeof plottedSchema>[];
  showSwaps: boolean;
  showTable: boolean;
  scaleChoices: number[];
};

const MAX_PAIRS = 12;
/** Two numbers the same, to a millionth (a tap snaps to quarters; pairs carry decimals). */
const same = (a: number, b: number) => Math.abs(a - b) < 1e-6;

/** A dot for the next pair at (x, y), and what it announces. */
function dotFor(s: PlottingState, x: number, y: number) {
  const n = s.plotted.length;
  const pair = s.toPlot[n];
  if (pair === undefined) return null;
  const isRight = same(pair.x, x) && same(pair.y, y);
  const plotted = [...s.plotted, { x, y, isRight }];
  const emit: Emit[] = [raise(plottingSignals.plotted, { n, x, y, isRight })];
  if (plotted.length === s.toPlot.length) emit.push(raise(plottingSignals.allPlotted));
  return { plotted, emit };
}

const act = actionsFor<PlottingState>();
const none = z.object({}).strict();

export const plottingSignals = {
  plotted: signal(
    "A dot was put down for pair `n` at (`x`, `y`); `isRight` when that is where the pair says",
  ),
  fellOff: signal("At this scale pair `n`, (`x`, `y`), is off the plane"),
  allPlotted: signal("Every pair is plotted"),
};

export const plotting = layersFor<PlottingState>()({
  name: "plotting",
  frame: "plane",
  describe:
    "Pairs to plot, from a table or a list: the learner taps where each goes, decimals between the marks included, and each dot is right or wrong. A pair can be shown with its swap, joined. The scale is chosen from a few, so at a small one a point falls off the plane.",
  fields: {
    /** The pairs, in order. */
    toPlot: z.array(pairSchema).max(MAX_PAIRS),
    /** The dots put down so far, one per pair in order. */
    plotted: z.array(plottedSchema).max(MAX_PAIRS),
    /** Each plotted pair with its swap (y, x), joined, as a pair and its swap. */
    showSwaps: z.boolean(),
    /** The pairs written as a table of x and y above the plane. */
    showTable: z.boolean(),
    /** The scales offered (units between numbered marks); empty: none offered. */
    scaleChoices: z.array(z.number().positive()).max(4),
  },
  defaults: {
    toPlot: [],
    plotted: [],
    showSwaps: false,
    showTable: false,
    scaleChoices: [],
  },
  isOn: (s) => s.toPlot.length > 0,
  actions: {
    plotAt: act({
      describe:
        "Put the next pair's dot at (x, y) (the learner's tap); it is right if that is where the pair says",
      byLearner: true,
      args: z.object({ x: z.number(), y: z.number() }).strict(),
      changes: ["plotted"],
      run: (s, { x, y }) => {
        const dot = dotFor(s, x, y);
        return dot === null ? set({}) : set({ plotted: dot.plotted }, ...dot.emit);
      },
    }),
    plotNext: act({
      describe: "Put the next pair's dot where it goes",
      reveals: true,
      args: none,
      changes: ["plotted"],
      run: (s) => {
        const pair = s.toPlot[s.plotted.length];
        const dot = pair === undefined ? null : dotFor(s, pair.x, pair.y);
        return dot === null ? set({}) : set({ plotted: dot.plotted }, ...dot.emit);
      },
    }),
    setScale: act({
      describe:
        "Choose the scale: a number every this many units, the window grown to match (the learner's choice)",
      byLearner: true,
      args: z.object({ every: z.number().positive() }).strict(),
      changes: ["tickEvery", "window"],
      run: (s, { every }) => {
        if (every === s.tickEvery) return set({});
        // The plane keeps its marks where they are: a number every `every` units, so the window
        // grows or shrinks with the scale.
        const k = every / s.tickEvery;
        const w = s.window;
        const window = { xMin: w.xMin * k, xMax: w.xMax * k, yMin: w.yMin * k, yMax: w.yMax * k };
        const off = s.toPlot.flatMap((p, n) =>
          isInWindow(window, p) ? [] : [raise(plottingSignals.fellOff, { n, x: p.x, y: p.y })],
        );
        return set({ tickEvery: every, window }, ...off);
      },
    }),
    clearPlotted: act({
      describe: "Take every dot off (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["plotted"],
      run: () => set({ plotted: [] }),
    }),
  },
  signals: plottingSignals,
  derived: {
    next: {
      describe: "The next pair to plot, or null when all are",
      compute: (s) => s.toPlot[s.plotted.length] ?? null,
    },
  },
  invariant: (s) => (s.plotted.length > s.toPlot.length ? "more dots than pairs" : undefined),
});
