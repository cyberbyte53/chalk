import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText } from "./numbers";
import {
  lessThanPoints,
  medianOf,
  moreThanPoints,
  ncert,
  ogiveCrossing,
  rowSchema,
  totalOf,
  xAtHeight,
} from "./stats";

/**
 * The ogives of NCERT 14.5: plot (upper limit, less-than cf) and join them for the less-than
 * ogive; plot (lower limit, more-than cf) for the more-than ogive. The median is read off the
 * graph two ways: across from n/2 to the less-than ogive and down, or straight down from where
 * the two ogives cross. The points are joined by straight lines, so both readings agree exactly
 * with the median formula.
 */

export const OgiveAction = {
  PlotNext: "plotNext",
  PlotAll: "plotAll",
  ShowMedian: "showMedian",
  Reset: "reset",
} as const;
export const OgiveSignal = { Plotted: "plotted", Joined: "joined", Read: "read" } as const;
export const OgiveDerived = {
  LessPoints: "lessPoints",
  MorePoints: "morePoints",
  Half: "half",
  Crossing: "crossing",
  Median: "median",
  PlottedCount: "plottedCount",
} as const;
export const OgivePart = {
  Graph: "graph",
  Plot: "plot",
  All: "all",
  Median: "median",
  Result: "result",
} as const;

export const OgiveShow = { LessThan: "lessThan", MoreThan: "moreThan", Both: "both" } as const;
export type OgiveShow = (typeof OgiveShow)[keyof typeof OgiveShow];

const wordsSchema = z.object({ en: z.string().max(40), hi: z.string().max(40) }).strict();

const ogiveState = z
  .object({
    rows: z.array(rowSchema).min(2).max(14),
    show: z.nativeEnum(OgiveShow),
    /** How many points are plotted so far (less-than points first, then more-than). */
    plotted: z.number().int().min(0).max(28),
    /** Whether the median reading is drawn (the n/2 line, or the crossing). */
    isMedianShown: z.boolean(),
    classHeading: wordsSchema,
    freqHeading: wordsSchema,
    canPlot: z.boolean(),
    canShowMedian: z.boolean(),
  })
  .strict();
export type OgiveState = z.infer<typeof ogiveState>;

export const pointCount = (s: Pick<OgiveState, "rows" | "show">) =>
  s.show === OgiveShow.Both ? 2 * s.rows.length : s.rows.length;

/** The points plotted so far, per curve. */
export function plottedPoints(s: OgiveState): {
  less: [number, number][];
  more: [number, number][];
} {
  const less = s.show === OgiveShow.MoreThan ? [] : lessThanPoints(s.rows);
  const more = s.show === OgiveShow.LessThan ? [] : moreThanPoints(s.rows);
  return {
    less: less.slice(0, Math.min(less.length, s.plotted)),
    more: more.slice(0, Math.max(0, s.plotted - less.length)),
  };
}

/** The median as read from the graph (equal to the formula's). */
export function readMedian(s: Pick<OgiveState, "rows" | "show">): number | null {
  if (s.show === OgiveShow.Both) return ogiveCrossing(s.rows)?.[0] ?? null;
  const half = totalOf(s.rows) / 2;
  const pts = s.show === OgiveShow.LessThan ? lessThanPoints(s.rows) : moreThanPoints(s.rows);
  return xAtHeight(pts, half);
}

const act = actionsFor<OgiveState>();

export const ogive = defineProp({
  type: "ogive",
  describe:
    "Ogives (cumulative frequency curves) from a grouped frequency table, NCERT 14.5. The less-than ogive plots (upper class limit, cumulative frequency) and joins the points; the more-than ogive plots (lower class limit, number at or above it). The learner plots the points one at a time (or all at once), then reads the median: for one ogive, across from n/2 on the y-axis to the curve and down to the x-axis; for both, down from where they cross. Points are joined by straight lines, so the reading agrees with the median formula.",
  state: ogiveState,
  defaults: {
    rows: [
      { lo: 0, hi: 10, f: 5, label: null },
      { lo: 10, hi: 20, f: 3, label: null },
      { lo: 20, hi: 30, f: 4, label: null },
      { lo: 30, hi: 40, f: 3, label: null },
      { lo: 40, hi: 50, f: 3, label: null },
      { lo: 50, hi: 60, f: 4, label: null },
      { lo: 60, hi: 70, f: 7, label: null },
      { lo: 70, hi: 80, f: 9, label: null },
      { lo: 80, hi: 90, f: 7, label: null },
      { lo: 90, hi: 100, f: 8, label: null },
    ],
    show: OgiveShow.LessThan,
    plotted: 0,
    isMedianShown: false,
    classHeading: { en: "Marks", hi: "अंक" },
    freqHeading: { en: "Students", hi: "विद्यार्थी" },
    canPlot: true,
    canShowMedian: true,
  },
  inputs: ["canPlot", "canShowMedian"],
  invariant: (s) => {
    if (s.plotted > pointCount(s)) return "more points plotted than there are";
    if (s.rows.some((r, i) => i > 0 && clean(r.lo) !== clean(s.rows[i - 1]?.hi ?? 0)))
      return "the classes must follow on from each other";
    if (s.isMedianShown && s.plotted < pointCount(s))
      return "plot every point before reading the median";
    return undefined;
  },
  derived: {
    [OgiveDerived.LessPoints]: {
      describe: "The less-than ogive's points",
      compute: (s) => lessThanPoints(s.rows),
    },
    [OgiveDerived.MorePoints]: {
      describe: "The more-than ogive's points",
      compute: (s) => moreThanPoints(s.rows),
    },
    [OgiveDerived.Half]: { describe: "n/2", compute: (s) => clean(totalOf(s.rows) / 2) },
    [OgiveDerived.Crossing]: {
      describe: "Where the two ogives cross",
      compute: (s) => ogiveCrossing(s.rows),
    },
    [OgiveDerived.Median]: {
      describe: "The median read from the graph, rounded to 2 decimals (equals the formula's)",
      compute: (s) => ncert(readMedian(s) ?? medianOf(s.rows)),
    },
    [OgiveDerived.PlottedCount]: { describe: "Points plotted so far", compute: (s) => s.plotted },
  },
  actions: {
    [OgiveAction.PlotNext]: act({
      describe: "Plot the next point",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canPlot || s.plotted >= pointCount(s)) return set({});
        const plotted = s.plotted + 1;
        const done = plotted === pointCount(s);
        return set(
          { plotted },
          { signal: OgiveSignal.Plotted, payload: { plotted } },
          ...(done ? [{ signal: OgiveSignal.Joined, payload: {} }] : []),
        );
      },
    }),
    [OgiveAction.PlotAll]: act({
      describe: "Plot every point and join them",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canPlot || s.plotted === pointCount(s)
          ? set({})
          : set({ plotted: pointCount(s) }, { signal: OgiveSignal.Joined, payload: {} }),
    }),
    [OgiveAction.ShowMedian]: act({
      describe: "Read the median off the graph (once every point is plotted)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canShowMedian || s.isMedianShown || s.plotted < pointCount(s)) return set({});
        return set(
          { isMedianShown: true },
          { signal: OgiveSignal.Read, payload: { median: ncert(readMedian(s) ?? 0) } },
        );
      },
    }),
    [OgiveAction.Reset]: act({
      describe: "Clear the graph",
      args: z.object({}).strict(),
      run: () => set({ plotted: 0, isMedianShown: false }),
    }),
  },
  signals: {
    [OgiveSignal.Plotted]: { describe: "A point was plotted; the payload has how many so far" },
    [OgiveSignal.Joined]: { describe: "Every point is plotted and joined" },
    [OgiveSignal.Read]: {
      describe: "The median was read off the graph; the payload has it",
    },
  },
  observe: (s) => {
    const { less, more } = plottedPoints(s);
    const fmt = (pts: [number, number][]) =>
      pts.map(([x, y]) => `(${numText(x)}, ${y})`).join(", ");
    const elements: Element[] = [
      {
        id: OgivePart.Graph,
        value:
          [
            less.length > 0 ? `less-than points ${fmt(less)}` : "",
            more.length > 0 ? `more-than points ${fmt(more)}` : "",
            s.isMedianShown ? `median read at x = ${numText(readMedian(s) ?? 0)}` : "",
          ]
            .filter((x) => x !== "")
            .join("; ") || "empty axes",
      },
    ];
    if (s.isMedianShown)
      elements.push({ id: OgivePart.Result, value: `median ≈ ${numText(readMedian(s) ?? 0)}` });
    return {
      summary: `Ogive graph (${s.show}), ${s.plotted} of ${pointCount(s)} points plotted${
        s.isMedianShown ? ", median read" : ""
      }.`,
      elements,
      hidden: { median: ncert(readMedian(s) ?? 0) },
    };
  },
  parts: (s) => [
    OgivePart.Graph,
    ...(s.canPlot && s.plotted < pointCount(s) ? [OgivePart.Plot, OgivePart.All] : []),
    ...(s.canShowMedian && s.plotted === pointCount(s) && !s.isMedianShown
      ? [OgivePart.Median]
      : []),
    ...(s.isMedianShown ? [OgivePart.Result] : []),
  ],
});
