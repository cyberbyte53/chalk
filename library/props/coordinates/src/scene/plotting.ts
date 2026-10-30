import { PropRole } from "@chalk/prop";
import { type Out, action, prop, signal } from "@chalk/prop/next";
import { z } from "zod";
import { isInWindow } from "../plane";
import { type Pair, pairSchema, plottedSchema, plottingReads } from "../plotting";

/**
 * Plotting, on the event model: pairs from a table or a list, each put down by a tap and marked
 * right or wrong. The plane's window and scale it draws by, it needs; a scale the learner chooses
 * it only tells (the plane changes its own).
 */

const MAX_PAIRS = 12;
/** Two numbers the same, to a millionth (a tap snaps to quarters; pairs carry decimals). */
const same = (a: number, b: number) => Math.abs(a - b) < 1e-6;
type Plotted = z.infer<typeof plottedSchema>;

export const plotting = prop({
  type: "scenePlotting",
  role: PropRole.Explainer,
  describe:
    "Pairs to plot, from a table or a list: the learner taps where each goes, decimals between the marks included, and each dot is right or wrong. A pair can be shown with its swap, joined. The scale is chosen from a few, so at a small one a point falls off the plane.",
  variables: z
    .object({
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
    })
    .strict(),
  start: { toPlot: [], plotted: [], showSwaps: false, showTable: false, scaleChoices: [] },
  needs: z.object(plottingReads.fields).strict(),
  facts: {
    offPlane: (me) =>
      me.toPlot.flatMap((p, n) => (isInWindow(me.window, p) ? [] : [{ n, x: p.x, y: p.y }])),
    next: (me): Pair | null => me.toPlot[me.plotted.length] ?? null,
  },
  actions: {
    plotAt: action(
      { x: z.number(), y: z.number() },
      {
        from: "screen",
        describe:
          "Put the next pair's dot at (x, y) (the learner's tap); it is right if that is where the pair says",
      },
    ),
    plotNext: action({}, { describe: "Put the next pair's dot where it goes" }),
    chooseScale: action(
      { every: z.number().positive() },
      {
        from: "screen",
        describe:
          "Ask for a scale: a number every this many units (the learner's choice); the plane changes its own scale, and the pairs off it then are `offPlane`",
      },
    ),
    clearPlotted: action({}, { from: "screen", describe: "Take every dot off (the learner's ↺)" }),
  },
  signals: {
    plotted: signal({
      n: z.number().int().min(0),
      x: z.number(),
      y: z.number(),
      isRight: z.boolean(),
    }),
    scaleChosen: signal({ every: z.number().positive() }),
    allPlotted: signal(),
  },
  on: {
    plotAt: (me, { x, y }, t) => dotAt(me, x, y, t),
    plotNext: (me, _, t) => {
      const pair = me.toPlot[me.plotted.length];
      return pair !== undefined && dotAt(me, pair.x, pair.y, t);
    },
    chooseScale: (_, { every }, t) => t.tell.scaleChosen({ every }),
    clearPlotted: (_, __, t) => t.set({ plotted: [] }),
  },
  invariant: (s) => (s.plotted.length > s.toPlot.length ? "more dots than pairs" : undefined),
});

/** What a dot uses of the tools a rule gets. */
type PlottingTools = {
  set: (patch: { plotted: Plotted[] }) => Out;
  tell: {
    plotted: (p: { n: number; x: number; y: number; isRight: boolean }) => Out;
    allPlotted: () => Out;
  };
};

/** A dot for the next pair at (x, y), and what it tells (nothing when every pair is plotted). */
function dotAt(
  me: { toPlot: readonly Pair[]; plotted: readonly Plotted[] },
  x: number,
  y: number,
  t: PlottingTools,
): Out[] | undefined {
  const n = me.plotted.length;
  const pair = me.toPlot[n];
  if (pair === undefined) return;
  const isRight = same(pair.x, x) && same(pair.y, y);
  const plotted = [...me.plotted, { x, y, isRight }];
  return [
    t.set({ plotted }),
    t.tell.plotted({ n, x, y, isRight }),
    ...(plotted.length === me.toPlot.length ? [t.tell.allPlotted()] : []),
  ];
}
