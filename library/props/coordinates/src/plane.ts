import { localizedSchema } from "@chalk/content";
import {
  type Effect,
  type FrameSpec,
  actionsFor,
  layersFor,
  raise,
  seq,
  set,
  signal,
  tween,
  wait,
} from "@chalk/prop";
import { z } from "zod";

/**
 * The core of the coordinate plane: two perpendicular lines and their marks, drawn only as far as
 * the lesson has defined them, and the points a figure names. Every layer draws on it.
 */

export const pointSchema = z.object({ x: z.number(), y: z.number() }).strict();
export type Point = z.infer<typeof pointSchema>;

/** The part of the plane shown, in its own units. */
export const windowSchema = z
  .object({ xMin: z.number(), xMax: z.number(), yMin: z.number(), yMax: z.number() })
  .strict();
export type PlaneWindow = z.infer<typeof windowSchema>;

/** What the lines carry: nothing (a sheet's edges), counts from 1, or number lines. */
export const Marks = {
  /** Plain lines: a sheet's left and bottom edges. */
  None: "none",
  /** 1, 2, 3 … from the corner: no 0, no negatives (a street's houses, a row of desks). */
  Counts: "counts",
  /** Number lines: 0 where they cross, positive one way and negative the other. */
  Numbers: "numbers",
} as const;
export type Marks = (typeof Marks)[keyof typeof Marks];

/** Which lines are drawn. */
export const Axes = { Both: "both", Horizontal: "horizontal" } as const;
export type Axes = (typeof Axes)[keyof typeof Axes];

/** What is drawn behind the plane. */
export const Scene = {
  None: "none",
  Paper: "paper",
  Town: "town",
  Classroom: "classroom",
  FairGround: "fairGround",
} as const;
export type Scene = (typeof Scene)[keyof typeof Scene];

/** The parts of the plane a tap can name. */
export const PlanePart = {
  O: "O",
  OX: "OX",
  OXDash: "OX′",
  OY: "OY",
  OYDash: "OY′",
  I: "I",
  II: "II",
  III: "III",
  IV: "IV",
} as const;
export type PlanePart = (typeof PlanePart)[keyof typeof PlanePart];
export const QUADRANTS = [PlanePart.I, PlanePart.II, PlanePart.III, PlanePart.IV] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export const Tone = { Main: "main", Accent: "accent", Muted: "muted" } as const;
export type Tone = (typeof Tone)[keyof typeof Tone];

/** A point a figure names (P, B, M …): fixed where the figure has it. */
export const namedPointSchema = z
  .object({
    /** What it is called on the plane: a letter (P), or a pair ((10, 7)). */
    name: z.string().min(1).max(7),
    x: z.number(),
    y: z.number(),
    /** Shown now: a figure's points can be read one at a time. */
    isShown: z.boolean(),
    /** Dashed perpendiculars from it to both axes. */
    hasDropLines: z.boolean(),
    tone: z.nativeEnum(Tone),
  })
  .strict();
export type NamedPoint = z.infer<typeof namedPointSchema>;

const MAX_SPAN = 200;
/** Seconds one line takes to rise, alone or in turn with the rest. */
const RISE = 1.2;
const RISE_EACH = 0.35;

/** The whole numbers a line can rise from: those on the horizontal line, inside the window, but 0. */
const marksUp = (s: Pick<PlaneCore, "window">): number[] => {
  const out: number[] = [];
  for (let x = Math.ceil(s.window.xMin); x <= s.window.xMax && out.length < MAX_SPAN; x++)
    if (x !== 0) out.push(x);
  return out;
};

/** Lines growing up one after another: each from 0 to full height, then counted as risen. */
function riseSteps(
  risen: readonly number[],
  ats: readonly number[],
  seconds: number,
): Effect<PlaneCore>[] {
  const done = [...risen];
  return ats.flatMap((at) => {
    done.push(at);
    const upLines = [...done];
    return [
      set<PlaneCore>({ rising: { at, height: 0 } }),
      tween<PlaneCore>(
        seconds,
        { rising: { at, height: 1 } },
        {
          interpolate: (_, __, t) => ({ rising: { at, height: t } }),
        },
      ),
      set<PlaneCore>({ upLines, rising: null }, raise(planeSignals.risen, { at })),
    ];
  });
}
/** Seconds between one quadrant's name and the next in the sweep; seconds the line takes to glide. */
const SWEEP_STEP = 0.6;
const GLIDE = 1.2;
const MAX_POINTS = 24;

const planeFields = {
  window: windowSchema,
  /** Which lines are drawn: both, or only the horizontal one (a number line). */
  axes: z.nativeEnum(Axes),
  /** What the lines carry. */
  marks: z.nativeEnum(Marks),
  /** A number every this many units along each line. */
  tickEvery: z.number().positive(),
  /** Graph paper: a faint line every unit. */
  hasGrid: z.boolean(),
  /** The lines' names, in the lesson's words: Street number and House number; x and y; t and d. */
  axisNames: z.tuple([localizedSchema, localizedSchema]),
  showAxisNames: z.boolean(),
  /** O written where the lines cross. */
  showOrigin: z.boolean(),
  /** OX, OX′, OY, OY′ written on the halves of the axes, each with its sign. */
  showDirections: z.boolean(),
  /** How many quadrants are named so far, I to IV anticlockwise from OX (0: none). */
  quadrantsNamed: z.number().int().min(0).max(4),
  /** Each named quadrant's sign pattern written in it: (+, +), (−, +) … */
  showQuadrantSigns: z.boolean(),
  /** What is drawn behind: a sheet, the town, the classroom, the fair ground. */
  scene: z.nativeEnum(Scene),
  /**
   * How far the vertical line's zero is from the horizontal line's zero, in units. (0, 0): they
   * cross at their zeroes, and they are the axes.
   */
  apart: pointSchema,
  /**
   * The whole numbers on the horizontal line that have a line rising from them (a town's streets),
   * or null: every one has (the plane as usual). Empty: only the horizontal line, a number line.
   */
  upLines: z.array(z.number().int()).max(MAX_SPAN).nullable(),
  /**
   * Which lines carry their numbers (with the marks): both as usual; on a page that becomes a ruler
   * only when a distance along it is given, none at first, each numbered by `numberLine`.
   */
  numbered: z.array(z.enum(["x", "y"])).max(2),
  /** A line rising now: where it stands, and how far up it has grown (0 to 1), or null. */
  rising: z
    .object({ at: z.number().int(), height: z.number().min(0).max(1) })
    .strict()
    .nullable(),
  /** The part a tap named last (a half of an axis, a quadrant, O), or null. */
  named: z.nativeEnum(PlanePart).nullable(),
  /** The points a figure names. */
  points: z.array(namedPointSchema).max(MAX_POINTS),
  /**
   * Whether the learner gets a Next point button for a figure's hidden points. Off when the lesson
   * shows them itself (a crossing marked when Riya reaches it).
   */
  canShowPoints: z.boolean(),
};

export type PlaneCore = {
  window: PlaneWindow;
  axes: Axes;
  marks: Marks;
  tickEvery: number;
  hasGrid: boolean;
  axisNames: [z.infer<typeof localizedSchema>, z.infer<typeof localizedSchema>];
  showAxisNames: boolean;
  showOrigin: boolean;
  showDirections: boolean;
  quadrantsNamed: number;
  showQuadrantSigns: boolean;
  scene: Scene;
  apart: Point;
  upLines: number[] | null;
  numbered: ("x" | "y")[];
  rising: { at: number; height: number } | null;
  named: PlanePart | null;
  points: NamedPoint[];
  canShowPoints: boolean;
};

/** Where a point is: in a quadrant, on an axis, or at O. */
export function placeOf(p: Point): Quadrant | "x-axis" | "y-axis" | "O" {
  if (p.x === 0 && p.y === 0) return PlanePart.O;
  if (p.y === 0) return "x-axis";
  if (p.x === 0) return "y-axis";
  if (p.x > 0) return p.y > 0 ? PlanePart.I : PlanePart.IV;
  return p.y > 0 ? PlanePart.II : PlanePart.III;
}

/** Whether a point is inside the window. */
export const isInWindow = (w: PlaneWindow, p: Point) =>
  p.x >= w.xMin && p.x <= w.xMax && p.y >= w.yMin && p.y <= w.yMax;

const act = actionsFor<PlaneCore>();
const none = z.object({}).strict();

export const planeSignals = {
  risen: signal("A line has risen from `at` on the horizontal line (a street, with its places)"),
  crossed: signal("The two number lines cross at their zeroes: they are the axes, and O is named"),
  named: signal("A tap named a part of the plane: `part`"),
  quadrantsNumbered: signal("The sweep has named all four quadrants, I to IV"),
};

export const core = layersFor<PlaneCore>()({
  name: "plane",
  frame: "plane",
  describe:
    "Two perpendicular lines and their marks, drawn only as far as the lesson has defined them: plain lines, counts from 1, or number lines with O, the directions and the quadrants; and the points a figure names.",
  fields: planeFields,
  defaults: {
    window: { xMin: -6, xMax: 6, yMin: -5, yMax: 5 },
    axes: Axes.Both,
    marks: Marks.Numbers,
    tickEvery: 1,
    hasGrid: false,
    axisNames: [
      { en: "x", hi: "x" },
      { en: "y", hi: "y" },
    ],
    showAxisNames: true,
    showOrigin: true,
    showDirections: false,
    quadrantsNamed: 0,
    showQuadrantSigns: false,
    scene: Scene.None,
    apart: { x: 0, y: 0 },
    upLines: null,
    numbered: ["x", "y"],
    rising: null,
    named: null,
    points: [],
    canShowPoints: false,
  },
  actions: {
    namePart: act({
      describe:
        "Name the part of the plane tapped: a half of an axis with its sign, a quadrant, or O (the learner's tap)",
      byLearner: true,
      args: z.object({ part: z.nativeEnum(PlanePart) }).strict(),
      changes: ["named"],
      run: (_, { part }) => set({ named: part }, raise(planeSignals.named, { part })),
    }),
    numberQuadrants: act({
      describe:
        "Sweep anticlockwise from OX, naming the quadrants I, II, III, IV one after another (timed)",
      byLearner: true,
      args: none,
      changes: ["quadrantsNamed"],
      run: () =>
        seq(
          set({ quadrantsNamed: 0 }),
          ...[1, 2, 3, 4].flatMap((n) => [
            wait<PlaneCore>(SWEEP_STEP),
            n === 4
              ? set<PlaneCore>({ quadrantsNamed: n }, raise(planeSignals.quadrantsNumbered))
              : set<PlaneCore>({ quadrantsNamed: n }),
          ]),
        ),
    }),
    moveApart: act({
      describe:
        "Slide the vertical number line: its zero this far from the horizontal line's zero (the learner's drag)",
      byLearner: true,
      args: pointSchema,
      changes: ["apart"],
      run: (_, apart) =>
        apart.x === 0 && apart.y === 0
          ? set({ apart }, raise(planeSignals.crossed))
          : set({ apart }),
    }),
    bringTogether: act({
      describe:
        "Glide the vertical number line until the two zeroes meet; there they are the axes, and O is named (timed)",
      byLearner: true,
      args: none,
      changes: ["apart", "showOrigin"],
      run: (s) =>
        s.apart.x === 0 && s.apart.y === 0
          ? set({ showOrigin: true })
          : seq(
              tween(
                GLIDE,
                { apart: { x: 0, y: 0 } },
                {
                  interpolate: (from, _to, t) => ({
                    apart: { x: from.apart.x * (1 - t), y: from.apart.y * (1 - t) },
                  }),
                },
              ),
              set({ apart: { x: 0, y: 0 }, showOrigin: true }, raise(planeSignals.crossed)),
            ),
    }),
    showPoint: act({
      describe: "Show the next of a figure's points, or the one named (the learner's Next)",
      byLearner: true,
      args: z.object({ name: z.string().min(1).max(7).optional() }).strict(),
      changes: ["points"],
      run: (s, { name }) => {
        const at =
          name === undefined
            ? s.points.findIndex((p) => !p.isShown)
            : s.points.findIndex((p) => p.name === name);
        if (at === -1) return set({});
        return set({ points: s.points.map((p, i) => (i === at ? { ...p, isShown: true } : p)) });
      },
    }),
    raiseUpLine: act({
      describe:
        "Raise a line from a whole number on the horizontal line: it grows upward, its places appearing on it as it grows (timed)",
      args: z.object({ at: z.number().int() }).strict(),
      changes: ["upLines", "rising"],
      run: (s, { at }) =>
        s.upLines === null || s.upLines.includes(at)
          ? set({})
          : seq(...riseSteps(s.upLines, [at], RISE)),
    }),
    numberLine: act({
      describe:
        "Number one line: its marks and numbers appear (a page's edge becomes a ruler once a distance along it is given)",
      args: z.object({ axis: z.enum(["x", "y"]) }).strict(),
      changes: ["numbered"],
      run: (s, { axis }) =>
        s.numbered.includes(axis) ? set({}) : set({ numbered: [...s.numbered, axis] }),
    }),
    raiseAllUpLines: act({
      describe: "Raise every line not risen yet, one after another, left to right (timed)",
      args: none,
      changes: ["upLines", "rising"],
      run: (s) => {
        if (s.upLines === null) return set({});
        const risen = s.upLines;
        const rest = marksUp(s).filter((x) => !risen.includes(x));
        return rest.length === 0
          ? set({})
          : seq(...riseSteps(risen, rest, RISE_EACH), set({ upLines: null }));
      },
    }),
    showAllPoints: act({
      describe: "Show every point the figure names",
      args: none,
      changes: ["points"],
      run: (s) => set({ points: s.points.map((p) => ({ ...p, isShown: true })) }),
    }),
  },
  signals: planeSignals,
  derived: {
    isCrossed: {
      describe: "The two number lines cross at their zeroes",
      compute: (s) => s.apart.x === 0 && s.apart.y === 0,
    },
  },
  invariant: (s) => {
    const w = s.window;
    if (w.xMin >= w.xMax || w.yMin >= w.yMax)
      return "the window must have xMin < xMax and yMin < yMax";
    if (w.xMax - w.xMin > MAX_SPAN || w.yMax - w.yMin > MAX_SPAN)
      return `the window is at most ${MAX_SPAN} units across and up`;
    if (s.marks === Marks.Counts && (w.xMin < 0 || w.yMin < 0))
      return "counts start from 1 at the corner: the window can't go below 0";
    return undefined;
  },
});

/**
 * The plane's picture: one unit across is one unit up, fitted to the width with a margin. Its height
 * follows the window (at least 200 pixels; a number line, 110).
 */
export const planeFrame: FrameSpec<PlaneCore> = {
  kind: "plane",
  pixels: (s, width) => {
    const { xMin, xMax, yMin, yMax } = s.window;
    // Room round the plane for what is written outside it: the numbers up the left, the numbers
    // and the horizontal line's name along the bottom, the vertical line's name on top.
    const pad = { left: 36, right: 16, top: 24, bottom: 44 };
    // As wide as it is given: how tall it may be on a screen is the player's rule (size.ts, a share
    // of the screen's height), not a number of its own here.
    const unit = (width - pad.left - pad.right) / (xMax - xMin);
    // A single line (a number line) needs only room for itself and its numbers.
    const least = s.axes === Axes.Horizontal ? 110 : 200;
    const height = Math.round(Math.max(least, unit * (yMax - yMin) + pad.top + pad.bottom));
    const left = pad.left + (width - pad.left - pad.right - unit * (xMax - xMin)) / 2;
    const top = pad.top + (height - pad.top - pad.bottom - unit * (yMax - yMin)) / 2;
    return {
      width,
      height,
      toPx: (x, y = 0) => [left + (x - xMin) * unit, top + (yMax - y) * unit],
      fromPx: (px, py = 0) => [xMin + (px - left) / unit, yMax - (py - top) / unit],
    };
  },
  label: (s) =>
    `${s.axes === Axes.Horizontal ? "A number line" : "A plane"} from ${s.window.xMin} to ${s.window.xMax} across${
      s.axes === Axes.Both ? ` and ${s.window.yMin} to ${s.window.yMax} up` : ""
    }`,
};
