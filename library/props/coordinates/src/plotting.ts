import { type Out, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, fromPlane, isInWindow } from "./plane";

/** A pair to plot, from a table or a list. */
export const pairSchema = z
  .object({ x: z.number(), y: z.number(), name: z.string().max(3).optional() })
  .strict();
export type Pair = z.infer<typeof pairSchema>;

/** A dot kept on the plane: only one dropped where its pair says is kept (isRight, always). */
export const plottedSchema = z
  .object({ x: z.number(), y: z.number(), isRight: z.boolean() })
  .strict();

/** The plane's fields it draws or decides by. */
export const plottingReads = fromPlane("window", "tickEvery", "axisNames");

export type PlottingState = Pick<PlaneCore, (typeof plottingReads.keys)[number]> & {
  toPlot: Pair[];
  plotted: z.infer<typeof plottedSchema>[];
  dot: { x: number; y: number };
  step: number;
  showSwaps: boolean;
  showTable: boolean;
  scaleChoices: number[];
};

/** Whether it is drawn on the plane. */
export const isPlottingOn = (s: Pick<PlottingState, "toPlot">) => s.toPlot.length > 0;

const MAX_PAIRS = 12;
/** Two numbers the same, to a millionth (a tap snaps to quarters; pairs carry decimals). */
const same = (a: number, b: number) => Math.abs(a - b) < 1e-6;
type Plotted = z.infer<typeof plottedSchema>;

/**
 * Plotting: pairs from a table or a list, each placed by dragging a dot from O: dropped where its
 * pair says, it turns green and stays, and the next pair's dot waits at O; dropped anywhere else,
 * it stays where it was dropped, kept by nothing, to drag again (the board can answer the miss). The plane's window and scale it draws by, it needs; a scale the learner chooses
 * it only tells (the plane changes its own).
 */
export const plotting = prop({
  type: "plotting",
  role: PropRole.Explainer,
  describe:
    "Pairs to plot, from a table or a list: the learner drags a dot from O to where each goes, decimals between the marks included; dropped right, it turns green and stays, and the next dot waits at O; dropped wrong, it stays to be dragged again. A pair can be shown with its swap, joined. The scale is chosen from a few, so at a small one a point falls off the plane.",
  variables: z
    .object({
      /** The pairs, in order. */
      toPlot: z.array(pairSchema).max(MAX_PAIRS),
      /** The dots put down so far, one per pair in order. */
      plotted: z.array(plottedSchema).max(MAX_PAIRS),
      /** Each plotted pair with its swap (y, x), joined, as a pair and its swap. */
      showSwaps: z.boolean(),
      /** Where the next pair's dot is: at O until the learner drags it. */
      dot: z.object({ x: z.number(), y: z.number() }).strict(),
      /** What a dropped dot snaps to: 0.25 (the book's pairs go to 1.25); 1 where a walker goes. */
      step: z.number().positive(),
      /** The pairs written as a table above the plane, its rows named as the axes are. */
      showTable: z.boolean(),
      /** The scales offered (units between numbered marks); empty: none offered. */
      scaleChoices: z.array(z.number().positive()).max(4),
    })
    .strict(),
  start: {
    toPlot: [],
    plotted: [],
    dot: { x: 0, y: 0 },
    step: 0.25,
    showSwaps: false,
    showTable: false,
    scaleChoices: [],
  },
  needs: z.object(plottingReads.fields).strict(),
  facts: {
    offPlane: (me) =>
      me.toPlot.flatMap((p, n) => (isInWindow(me.window, p) ? [] : [{ n, x: p.x, y: p.y }])),
    next: (me): Pair | null => me.toPlot[me.plotted.length] ?? null,
  },
  actions: {
    moveDot: action(
      { x: z.number(), y: z.number() },
      { from: "screen", describe: "Move the next pair's dot to (x, y) (the learner's drag)" },
    ),
    plotAt: action(
      { x: z.number(), y: z.number() },
      {
        from: "screen",
        describe:
          "Drop the next pair's dot at (x, y) (the learner lets go): where the pair says, it is kept and the next dot waits at O; anywhere else it stays there, `missed`",
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
    clearPlotted: action({}, { describe: "Take every dot off, the next dot back at O" }),
  },
  signals: {
    plotted: signal({
      n: z.number().int().min(0),
      x: z.number(),
      y: z.number(),
      isRight: z.boolean(),
    }),
    /** A dot dropped where its pair doesn't say: where. */
    missed: signal({ n: z.number().int().min(0), x: z.number(), y: z.number() }),
    scaleChosen: signal({ every: z.number().positive() }),
    allPlotted: signal(),
  },
  on: {
    moveDot: (_, dot, t) => t.set({ dot }),
    plotAt: (me, { x, y }, t) => dotAt(me, x, y, t),
    plotNext: (me, _, t) => {
      const pair = me.toPlot[me.plotted.length];
      return pair !== undefined && dotAt(me, pair.x, pair.y, t);
    },
    chooseScale: (_, { every }, t) => t.tell.scaleChosen({ every }),
    clearPlotted: (_, __, t) => t.set({ plotted: [], dot: { x: 0, y: 0 } }),
  },
  invariant: (s) => (s.plotted.length > s.toPlot.length ? "more dots than pairs" : undefined),
});

/** What a dot uses of the tools a rule gets. */
type PlottingTools = {
  set: (patch: { plotted?: Plotted[]; dot: { x: number; y: number } }) => Out;
  tell: {
    plotted: (p: { n: number; x: number; y: number; isRight: boolean }) => Out;
    missed: (p: { n: number; x: number; y: number }) => Out;
    allPlotted: () => Out;
  };
};

/**
 * The next pair's dot dropped at (x, y): where the pair says, kept, and the next dot back at O; else
 * left there, missed. Nothing when every pair is plotted.
 */
function dotAt(
  me: { toPlot: readonly Pair[]; plotted: readonly Plotted[] },
  x: number,
  y: number,
  t: PlottingTools,
): Out[] | undefined {
  const n = me.plotted.length;
  const pair = me.toPlot[n];
  if (pair === undefined) return;
  if (!(same(pair.x, x) && same(pair.y, y)))
    return [t.set({ dot: { x, y } }), t.tell.missed({ n, x, y })];
  const plotted = [...me.plotted, { x, y, isRight: true }];
  return [
    t.set({ plotted, dot: { x: 0, y: 0 } }),
    t.tell.plotted({ n, x, y, isRight: true }),
    ...(plotted.length === me.toPlot.length ? [t.tell.allPlotted()] : []),
  ];
}
