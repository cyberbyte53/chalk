import { localizedSchema } from "@chalk/content";
import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/** At most this many points are kept (older ones drop off), so state stays small enough to log. */
export const MAX_POINTS = 1000;

const point = z.tuple([z.number(), z.number()]);

const graphState = z
  .object({
    points: z.array(point).max(MAX_POINTS),
    /** The x axis starts at 0 and shows at least this far; it grows when points go past it. */
    xMax: z.number().positive(),
    yMin: z.number(),
    yMax: z.number(),
    /** A dashed horizontal line to compare against (e.g. ½), or null. */
    guide: z.number().nullable(),
    guideLabel: z.string(),
    xLabel: localizedSchema,
    yLabel: localizedSchema,
  })
  .strict();
export type GraphState = z.infer<typeof graphState>;

const act = actionsFor<GraphState>();

/** A line graph that points are added to one by one. It plots; it knows nothing about what. */
export const graph = defineProp<GraphState>({
  type: "graph",
  describe: "A line graph: points are added one at a time and joined up.",
  state: graphState,
  defaults: {
    points: [],
    xMax: 10,
    yMin: 0,
    yMax: 1,
    guide: null,
    guideLabel: "",
    xLabel: { en: "x", hi: "x" },
    yLabel: { en: "y", hi: "y" },
  },
  derived: {
    count: { describe: "How many points it shows", compute: (s) => s.points.length },
    lastY: {
      describe: "The newest point's y, or null",
      compute: (s) => s.points.at(-1)?.[1] ?? null,
    },
  },
  actions: {
    addPoint: act({
      describe: "Add a point and join it to the last one",
      args: z.object({ x: z.number(), y: z.number() }).strict(),
      run: (s, a) => {
        const points = [...s.points, [a.x, a.y] as [number, number]].slice(-MAX_POINTS);
        return set({ points, xMax: Math.max(s.xMax, a.x) });
      },
    }),
    clear: act({
      describe: "Remove every point",
      args: z.object({}).strict(),
      run: () => set({ points: [] }),
    }),
    setGuide: act({
      describe: "Show a dashed line at y (or none)",
      args: z.object({ at: z.number().nullable(), label: z.string() }).strict(),
      run: (_s, a) => set({ guide: a.at, guideLabel: a.label }),
    }),
  },
  parts: (s) => [
    "axes",
    ...(s.guide === null ? [] : ["guide"]),
    ...(s.points.length > 0 ? ["last"] : []),
  ],
  invariant: (s) => (s.yMax > s.yMin ? undefined : "yMax must be more than yMin"),
});
