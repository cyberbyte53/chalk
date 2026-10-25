import { type FramePixels, actionsFor, defineGroup, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { DotTone, type GridState, planePixels, planeWindowSchema } from "./plane";

/**
 * Graph paper as a frame, and leaves that draw on it: unnamed dots, a handle on the x-axis, a drop
 * line. `dotPlane` is the four together, the plane a machine plots its values on. Each leaf owns
 * only its own fields; the paper owns the window and the transform every leaf draws through.
 */

// ---- graph paper: the frame ----

const paperState = z
  .object({
    window: planeWindowSchema,
    /** One unit across is one unit up (geometry); off, the window fills the box (graphs). */
    isEqualUnits: z.boolean(),
    /** Name the four quadrants I to IV. */
    showQuadrants: z.boolean(),
    axisNames: z.tuple([z.string().min(1).max(3), z.string().min(1).max(3)]),
  })
  .strict();
export type GraphPaperState = z.infer<typeof paperState>;
export const GraphPaperPart = { Plane: "plane" } as const;

/** Model ↔ pixels for graph paper at a width (the same mapping the old plane host drew with). */
export function paperPixels(s: GraphPaperState, width: number): FramePixels {
  const at = planePixels(s as GridState, width);
  const [fx0, fx1] = at.frame.x;
  const [fy0, fy1] = at.frame.y;
  return {
    width,
    height: at.height,
    domain: { x: at.frame.x, y: at.frame.y },
    toPx: (x, y = 0) => at.toPx(x, y),
    fromPx: (px, py = 0) => [
      fx0 + (px / width) * (fx1 - fx0),
      fy0 + ((at.height - py) / at.height) * (fy1 - fy0),
    ],
  };
}

export const graphPaper = defineProp({
  type: "graphPaper",
  isExplainer: false,
  describe:
    "Graph paper: a window on the plane with a grid line every unit (or every few), the axes and O.",
  state: paperState,
  defaults: {
    window: [-2, 10, -2, 10],
    isEqualUnits: true,
    showQuadrants: false,
    axisNames: ["x", "y"],
  },
  actions: {},
  frame: {
    kind: "plane",
    pixels: paperPixels,
    label: (s) =>
      `Graph paper from ${s.window[0]} to ${s.window[1]} across, ${s.window[2]} to ${s.window[3]} up`,
  },
  observe: (s) => ({
    summary: `graph paper from ${s.window[0]} to ${s.window[1]} across and ${s.window[2]} to ${s.window[3]} up${s.showQuadrants ? ", quadrants named I to IV" : ""}`,
    elements: [
      {
        id: GraphPaperPart.Plane,
        value: { xMin: s.window[0], xMax: s.window[1], yMin: s.window[2], yMax: s.window[3] },
      },
    ],
  }),
});

// ---- dots ----

const dotSchema = z
  .object({
    x: z.number().min(-1000).max(1000),
    y: z.number().min(-1e6).max(1e6),
    tone: z.nativeEnum(DotTone),
    /** Drawn faint (an older dot). */
    isFaded: z.boolean().optional(),
  })
  .strict();
export type Dot = z.infer<typeof dotSchema>;
export const MAX_DOTS_DRAWN = 120;
export const DotsPart = { Dots: "dots" } as const;
export const DotsAction = { Plot: "plot", Clear: "clear" } as const;
const dotsState = z.object({ dots: z.array(dotSchema).max(MAX_DOTS_DRAWN) }).strict();
export type DotsState = z.infer<typeof dotsState>;
const onDots = actionsFor<DotsState>();

export const dots = defineProp({
  type: "dots",
  isExplainer: false,
  describe: "Unnamed dots at (x, y): the points of a table, the values a machine gave.",
  state: dotsState,
  defaults: { dots: [] },
  drawsOn: "plane",
  actions: {
    [DotsAction.Plot]: onDots({
      describe: "Put a dot at (x, y)",
      args: dotSchema,
      changes: ["dots"],
      run: (s, a) => set({ dots: [...s.dots, a].slice(-MAX_DOTS_DRAWN) }),
    }),
    [DotsAction.Clear]: onDots({
      describe: "Remove every dot",
      args: z.object({}).strict(),
      changes: ["dots"],
      run: () => set({ dots: [] }),
    }),
  },
  observe: (s) =>
    s.dots.length === 0
      ? { summary: "no dots", elements: [] }
      : {
          summary: `${s.dots.length} dot${s.dots.length === 1 ? "" : "s"}`,
          elements: [{ id: DotsPart.Dots, value: s.dots.map((p) => ({ x: p.x, y: p.y })) }],
        },
});

// ---- a handle on the x-axis ----

export const XHandlePart = { Handle: "handle" } as const;
export const XHandleAction = { Move: "move", Put: "put" } as const;
export const XHandleSignal = { Put: "put" } as const;
const xHandleState = z
  .object({
    x: z.number().min(-1000).max(1000),
    /** How it's written under the handle ("2.3", "½"). */
    label: z.string().max(16),
    /** How far an arrow key nudges it. */
    step: z.number().positive(),
    /** What x is called, for screen readers. */
    name: z.string().min(1).max(3),
  })
  .strict();
export type XHandleState = z.infer<typeof xHandleState>;
const onHandle = actionsFor<XHandleState>();
const xArgs = z.object({ x: z.number().min(-1000).max(1000) }).strict();

export const xHandle = defineProp({
  type: "xHandle",
  isExplainer: false,
  describe:
    "A handle on the x-axis the learner drags (touching the paper anywhere moves it there); letting go, or an arrow key, puts it down.",
  state: xHandleState,
  defaults: { x: 0, label: "0", step: 1, name: "x" },
  drawsOn: "plane",
  actions: {
    [XHandleAction.Move]: onHandle({
      describe: "Slide the handle to x (while the learner drags)",
      byLearner: true,
      args: xArgs,
      changes: ["x", "label"],
      run: (_s, a) => set({ x: a.x, label: String(a.x) }),
    }),
    [XHandleAction.Put]: onHandle({
      describe: "Put the handle down at x (the learner letting go, or a nudge)",
      byLearner: true,
      args: xArgs,
      changes: ["x", "label"],
      run: (_s, a) =>
        set({ x: a.x, label: String(a.x) }, { signal: XHandleSignal.Put, payload: { x: a.x } }),
    }),
  },
  signals: { [XHandleSignal.Put]: { describe: "The learner put the handle down at `x`" } },
  observe: (s) => ({
    summary: `a handle on the x-axis at ${s.name} = ${s.label}`,
    elements: [
      {
        id: XHandlePart.Handle,
        value: s.x,
        words: s.label,
        does: [XHandleAction.Move, XHandleAction.Put],
      },
    ],
  }),
});

// ---- a drop line from the x-axis to a point ----

export const DropLinePart = { Line: "line" } as const;
const dropLineState = z
  .object({ at: z.object({ x: z.number(), y: z.number() }).strict().nullable() })
  .strict();
export type DropLineState = z.infer<typeof dropLineState>;

export const dropLine = defineProp({
  type: "dropLine",
  isExplainer: false,
  describe: "A dashed line from (x, 0) up or down to (x, y): how high the point is.",
  state: dropLineState,
  defaults: { at: null },
  drawsOn: "plane",
  actions: {},
  observe: (s) =>
    s.at === null
      ? { summary: "no drop line", elements: [] }
      : { summary: "a drop line", elements: [{ id: DropLinePart.Line, value: { ...s.at } }] },
});

// ---- the four together ----

/** Graph paper with dots, a drop line and a handle on the x-axis (each may be left out). */
export const dotPlane = defineGroup({
  type: "dotPlane",
  isExplainer: false,
  describe:
    "Graph paper with unnamed dots, a dashed drop line from the x-axis to a point, and a handle on the x-axis the learner drags.",
  children: { paper: graphPaper, guide: dropLine, dots, handle: xHandle },
  optional: ["guide", "dots", "handle"],
  defaults: { paper: { isEqualUnits: false } },
  summary: (s) => {
    const [x0, x1, y0, y1] = s.paper.window;
    return `graph paper from ${x0} to ${x1} across and ${y0} to ${y1} up`;
  },
  layout: { kind: "frame", provider: "paper", children: ["guide", "dots", "handle"] },
});
export type DotPlaneState = NonNullable<typeof dotPlane.stateType>;
