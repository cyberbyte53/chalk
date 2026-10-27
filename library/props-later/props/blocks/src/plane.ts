import {
  type Element,
  FrameKind,
  type PlanePixels,
  type PlaneWindow,
  actionsFor,
  defineHost,
  defineLayer,
  isInPlane,
  set,
} from "@chalk/prop";
import { frameOf } from "@chalk/prop-circles/kit";
import { z } from "zod";

/**
 * Graph paper as a host: the core is the window, the grid, the axes and O; layers draw on it.
 * This package's layers: plotted dots, a handle on the x-axis, a drop line. Other packages add
 * their own (named points, joins and the distance working in `@chalk/prop-coordinates`).
 */

/** The part of the plane shown: [xMin, xMax, yMin, yMax]. */
export const planeWindowSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .refine((w) => w[0] < w[1] && w[2] < w[3], "the window must have xMin < xMax and yMin < yMax");
export type PlaneWindowTuple = z.infer<typeof planeWindowSchema>;

export type GridState = {
  window: PlaneWindowTuple;
  /** One unit across is one unit up (geometry); off, the window fills the box (graphs). */
  isEqualUnits: boolean;
  /** Name the four quadrants I to IV. */
  showQuadrants: boolean;
  /** The axes' names. */
  axisNames: [string, string];
};

export const GridPart = { Plane: "plane" } as const;

export const windowOf = (s: Pick<GridState, "window">): PlaneWindow => ({
  xMin: s.window[0],
  xMax: s.window[1],
  yMin: s.window[2],
  yMax: s.window[3],
});

/**
 * Where the plane is drawn at a width: its height, the stage's model frame, and model → pixels.
 * Equal units fit the window with a margin (as graph paper); unequal ones fill the box exactly.
 */
export function planePixels(
  s: GridState,
  width: number,
): PlanePixels & {
  frame: { x: [number, number]; y: [number, number] };
} {
  const [x0, x1, y0, y1] = s.window;
  let height: number;
  let frame: { x: [number, number]; y: [number, number] };
  if (s.isEqualUnits) {
    const aspect = (y1 - y0) / (x1 - x0);
    height = Math.round(Math.min(380, Math.max(200, width * aspect)));
    frame = frameOf(
      [
        [x0, y0],
        [x1, y1],
      ],
      { width, height },
      14,
    );
  } else {
    height = Math.round(Math.min(380, Math.max(240, width * 0.8)));
    frame = { x: [x0, x1], y: [y0, y1] };
  }
  const [fx0, fx1] = frame.x;
  const [fy0, fy1] = frame.y;
  return {
    ...windowOf(s),
    width,
    height,
    frame,
    toPx: (x, y) => [
      ((x - fx0) / (fx1 - fx0)) * width,
      height - ((y - fy0) / (fy1 - fy0)) * height,
    ],
  };
}

export const grid = defineLayer({
  name: "grid",
  frame: FrameKind.Plane,
  describe: "Graph paper: the window, a grid line every unit (or every few), the axes and O.",
  fields: {
    window: planeWindowSchema,
    isEqualUnits: z.boolean(),
    showQuadrants: z.boolean(),
    axisNames: z.tuple([z.string().min(1).max(3), z.string().min(1).max(3)]),
  },
  defaults: {
    window: [-2, 10, -2, 10],
    isEqualUnits: true,
    showQuadrants: false,
    axisNames: ["x", "y"],
  } satisfies GridState,
  actions: {},
  observe: (s: GridState, w) => ({
    summary: `graph paper from ${w.xMin} to ${w.xMax} across and ${w.yMin} to ${w.yMax} up${s.showQuadrants ? ", quadrants named I to IV" : ""}`,
    elements: [{ id: GridPart.Plane, value: { ...w } }],
  }),
  locate: (_s, part, at) =>
    part === GridPart.Plane ? { x: 0, y: 0, width: at.width, height: at.height } : undefined,
});

// ---- plotted dots ----

export const DotTone = { Main: "main", Accent: "accent", Muted: "muted" } as const;
export type DotTone = (typeof DotTone)[keyof typeof DotTone];
const plottedSchema = z
  .object({
    x: z.number().min(-1000).max(1000),
    y: z.number().min(-1e6).max(1e6),
    tone: z.nativeEnum(DotTone),
    /** Drawn faint (an older dot). */
    isFaded: z.boolean().optional(),
  })
  .strict();
export type Plotted = z.infer<typeof plottedSchema>;
export type PlottedState = GridState & { plotted: Plotted[] };
export const PlottedPart = { Dots: "dots" } as const;
export const PlottedAction = { Plot: "plot", ClearPlotted: "clearPlotted" } as const;
export const MAX_PLOTTED = 120;
const onPlotted = actionsFor<PlottedState>();

export const plotted = defineLayer({
  name: "plotted",
  frame: FrameKind.Plane,
  describe: "Unnamed dots at (x, y): the points of a table, the values a machine gave.",
  fields: { plotted: z.array(plottedSchema).max(MAX_PLOTTED) },
  defaults: { plotted: [] },
  actions: {
    [PlottedAction.Plot]: onPlotted({
      describe: "Put a dot at (x, y)",
      args: plottedSchema,
      changes: ["plotted"],
      run: (s, a) => set({ plotted: [...s.plotted, a].slice(-MAX_PLOTTED) }),
    }),
    [PlottedAction.ClearPlotted]: onPlotted({
      describe: "Remove every dot",
      args: z.object({}).strict(),
      changes: ["plotted"],
      run: () => set({ plotted: [] }),
    }),
  },
  observe: (s, w) => {
    const shown = s.plotted.filter((p) => isInPlane(w, p.x, p.y));
    return shown.length === 0
      ? { elements: [] }
      : {
          elements: [{ id: PlottedPart.Dots, value: shown.map((p) => ({ x: p.x, y: p.y })) }],
          summary: `${shown.length} dot${shown.length === 1 ? "" : "s"}`,
        };
  },
  locate: (s, part, at) =>
    part === PlottedPart.Dots && s.plotted.length > 0 ? whole(at) : undefined,
});

const whole = (at: PlanePixels) => ({ x: 0, y: 0, width: at.width, height: at.height });

// ---- a handle on the x-axis ----

const handleSchema = z
  .object({
    x: z.number().min(-1000).max(1000),
    /** How it's written under the handle ("2.3", "½"). */
    label: z.string().max(16),
    /** How far an arrow key nudges it. */
    step: z.number().positive(),
  })
  .strict();
export type AxisHandle = z.infer<typeof handleSchema>;
export type HandleState = GridState & { handle: AxisHandle | null };
export const HandlePart = { Handle: "handle" } as const;
export const HandleAction = { MoveHandle: "moveHandle", PutHandle: "putHandle" } as const;
export const HandleSignal = { HandlePut: "handlePut" } as const;
const onHandle = actionsFor<HandleState>();

export const axisHandle = defineLayer({
  name: "axisHandle",
  frame: FrameKind.Plane,
  describe:
    "A handle on the x-axis the learner drags (touching the grid anywhere moves it there); letting go puts it down.",
  fields: { handle: handleSchema.nullable() },
  defaults: { handle: null },
  actions: {
    [HandleAction.MoveHandle]: onHandle({
      describe: "Slide the handle to x (while the learner drags)",
      byLearner: true,
      args: z.object({ x: z.number() }).strict(),
      changes: ["handle"],
      run: (s, a) => set({ handle: { x: a.x, label: String(a.x), step: s.handle?.step ?? 1 } }),
    }),
    [HandleAction.PutHandle]: onHandle({
      describe: "Put the handle down at x (the learner letting go, or a nudge)",
      byLearner: true,
      args: z.object({ x: z.number() }).strict(),
      changes: ["handle"],
      run: (s, a) =>
        set(
          { handle: { x: a.x, label: String(a.x), step: s.handle?.step ?? 1 } },
          { signal: HandleSignal.HandlePut, payload: { x: a.x } },
        ),
    }),
  },
  signals: { [HandleSignal.HandlePut]: { describe: "The learner put the handle down at `x`" } },
  observe: (s) =>
    s.handle === null
      ? { elements: [] }
      : {
          elements: [
            {
              id: HandlePart.Handle,
              value: s.handle.x,
              words: s.handle.label,
              does: [HandleAction.MoveHandle, HandleAction.PutHandle],
            },
          ],
        },
  locate: (s, part, at) => {
    if (part !== HandlePart.Handle || s.handle === null) return undefined;
    const [x, y] = at.toPx(s.handle.x, 0);
    const top = Math.min(at.height, Math.max(0, y));
    return { x: x - 14, y: top - 14, width: 28, height: 28 };
  },
});

// ---- a drop line from the x-axis to a point ----

const guideSchema = z.object({ x: z.number(), y: z.number() }).strict();
export type GuideState = GridState & { guide: z.infer<typeof guideSchema> | null };
export const GuidePart = { Guide: "guide" } as const;

export const guide = defineLayer({
  name: "guide",
  frame: FrameKind.Plane,
  describe: "A dashed line from (x, 0) up or down to (x, y): how high the point is.",
  fields: { guide: guideSchema.nullable() },
  defaults: { guide: null },
  actions: {},
  observe: (s: GuideState) =>
    s.guide === null
      ? { elements: [] }
      : { elements: [{ id: GuidePart.Guide, value: { ...s.guide } }] },
});

/** Graph paper with plotted dots, a handle on the x-axis and a drop line. */
export const plane = defineHost({
  type: "plane",
  describe:
    "Graph paper: a window on the plane with grid lines, the axes and O. It can show unnamed dots, a handle on the x-axis the learner drags, and a dashed drop line from the x-axis to a point.",
  frame: FrameKind.Plane,
  core: grid,
  layers: [plotted, axisHandle, guide],
  window: windowOf,
  pixels: planePixels,
});

export type PlaneState = typeof plane.defaults;

/** For other packages' plane hosts. */
export const planeCore = grid;
