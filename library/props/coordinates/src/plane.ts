import { localizedSchema } from "@chalk/content";
import { type FrameSpec, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";

/**
 * The plane itself: two perpendicular lines and their marks, drawn only as far as the lesson has
 * defined them, and the points a figure names. It provides the picture every other part of the
 * coordinate plane draws on (coordinate-plane.ts).
 */

export const pointSchema = z.object({ x: z.number(), y: z.number() }).strict();
export type Point = z.infer<typeof pointSchema>;

/** The part of the plane shown, in its own units. */
export const windowSchema = z
  .object({ xMin: z.number(), xMax: z.number(), yMin: z.number(), yMax: z.number() })
  .strict();
export type PlaneWindow = z.infer<typeof windowSchema>;

/** Every place with one number: all the houses on a street (x), or along a row (y). */
export const lineSchema = z.object({ axis: z.enum(["x", "y"]), value: z.number() }).strict();
export type Line = z.infer<typeof lineSchema>;

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
  /**
   * Whether the learner gets a button numbering the quadrants I to IV. Off until the lesson
   * defines quadrants: before that, the axes are named without them.
   */
  canNumberQuadrants: z.boolean(),
  /**
   * Whether a quadrant can be tapped before all four are numbered. Off: a quadrant is tapped only
   * once the lesson has numbered them, so the word isn't met before it is taught.
   */
  canTapQuadrants: z.boolean(),
  /**
   * Whether a tapped part's name is written under the plane. Off in a question that asks for a
   * part by its name: the tap only marks it, and Check says if it is the one.
   */
  namesTapped: z.boolean(),
  /**
   * How far the two lines are drawn turned, in degrees anticlockwise, about the horizontal line's
   * zero: a pair at right angles that points any way. 0 as usual: one across, one up.
   */
  turn: z.number().min(-90).max(90),
  /**
   * How strongly what is drawn behind the lines (the scene, and the places on it) shows, from 0
   * (not at all) to 1 (as usual): a lesson fades the town in behind the axes, and out again.
   */
  backdrop: z.number().min(0).max(1),
  /** Each numbered quadrant tinted its own colour, so the four parts read as four. */
  tintsQuadrants: z.boolean(),
  /** Nothing else is drawn on it: a tap on a part of it names that part. */
  isAlone: z.boolean(),
  /** A counted line's numbers are buttons (each lights the places with that number). */
  canTapNumbers: z.boolean(),
  /** The number lit now, shown pressed. */
  lit: lineSchema.nullable(),
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
  canNumberQuadrants: boolean;
  canTapQuadrants: boolean;
  namesTapped: boolean;
  turn: number;
  backdrop: number;
  tintsQuadrants: boolean;
  isAlone: boolean;
  canTapNumbers: boolean;
  lit: Line | null;
};

/** The plane as a board first places it, before the lesson's own fields. */
export const planeStart: Omit<PlaneCore, "isAlone" | "canTapNumbers" | "lit"> = {
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
  canNumberQuadrants: false,
  canTapQuadrants: false,
  namesTapped: true,
  turn: 0,
  backdrop: 1,
  tintsQuadrants: false,
};

/** Where a point is: in a quadrant, on an axis, or at O. */
export function placeOf(p: Point): Quadrant | "x-axis" | "y-axis" | "O" {
  if (p.x === 0 && p.y === 0) return PlanePart.O;
  if (p.y === 0) return "x-axis";
  if (p.x === 0) return "y-axis";
  if (p.x > 0) return p.y > 0 ? PlanePart.I : PlanePart.IV;
  return p.y > 0 ? PlanePart.II : PlanePart.III;
}

/**
 * The window at a new scale: the marks stay where they are on screen, a number every `to` units
 * instead of `from`, so the window grows or shrinks with the scale.
 */
export function scaledWindow(w: PlaneWindow, from: number, to: number): PlaneWindow {
  const k = to / from;
  return { xMin: w.xMin * k, xMax: w.xMax * k, yMin: w.yMin * k, yMax: w.yMax * k };
}

/** Whether a point is inside the window. */
export const isInWindow = (w: PlaneWindow, p: Point) =>
  p.x >= w.xMin && p.x <= w.xMax && p.y >= w.yMin && p.y <= w.yMax;

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

/** What a part on its own reads of the plane: its start, nothing else drawn on it. */
const planeDefaults: PlaneCore = { ...planeStart, isAlone: true, canTapNumbers: false, lit: null };

/**
 * Some of the plane's fields, for a part that draws or decides by them (where the edge is, which
 * streets are up): the part keeps them among its own, and the coordinate plane passes the plane's
 * in (coordinate-plane.ts). On its own, a part has the plane's defaults.
 */
export function fromPlane<const K extends keyof PlaneCore>(...keys: K[]) {
  return {
    keys,
    fields: Object.fromEntries(keys.map((k) => [k, planeFields[k]])) as {
      [P in K]: (typeof planeFields)[P];
    },
    defaults: Object.fromEntries(keys.map((k) => [k, planeDefaults[k]])) as Pick<PlaneCore, K>,
  };
}

/** Seconds one line takes to rise, alone or in turn with the rest. */
const RISE = 1.2;
const RISE_EACH = 0.35;
/** Seconds between one quadrant's name and the next; seconds the vertical line takes to glide. */
const SWEEP_STEP = 0.6;
const GLIDE = 1.2;

/** The whole numbers a line can rise from: on the horizontal line, inside the window, but 0. */
const marksUp = (w: PlaneCore["window"]): number[] => {
  const out: number[] = [];
  for (let x = Math.ceil(w.xMin); x <= w.xMax && out.length < MAX_SPAN; x++)
    if (x !== 0) out.push(x);
  return out;
};

/**
 * The plane: two perpendicular lines and their marks, drawn only as far as the
 * lesson has defined them, and the points a figure names. Everything else in the coordinate plane
 * draws on its picture. What it decides by but doesn't own (whether it is alone, whether its
 * numbers are buttons, which is lit) it needs from the coordinate plane.
 */
export const plane = prop({
  type: "plane",
  role: PropRole.Explainer,
  describe:
    "Two perpendicular lines and their marks, drawn only as far as the lesson has defined them: plain lines, counts from 1, or number lines with O, the directions and the quadrants; and the points a figure names.",
  variables: z
    .object({
      window: windowSchema,
      /** Which lines are drawn: both, or only the horizontal one (a number line). */
      axes: z.nativeEnum(Axes),
      marks: z.nativeEnum(Marks),
      /** A number every this many units along each line. */
      tickEvery: z.number().positive(),
      hasGrid: z.boolean(),
      /** The lines' names, in the lesson's words: Street number and House number; x and y. */
      axisNames: z.tuple([localizedSchema, localizedSchema]),
      showAxisNames: z.boolean(),
      showOrigin: z.boolean(),
      showDirections: z.boolean(),
      /** How many quadrants are named so far, I to IV anticlockwise from OX. */
      quadrantsNamed: z.number().int().min(0).max(4),
      showQuadrantSigns: z.boolean(),
      scene: z.nativeEnum(Scene),
      /** How far the vertical line's zero is from the horizontal line's; (0, 0): they are the axes. */
      apart: pointSchema,
      /** The numbers with a line risen from them (a town's streets); null: every one. */
      upLines: z.array(z.number().int()).max(MAX_SPAN).nullable(),
      /** Which lines carry their numbers. */
      numbered: z.array(z.enum(["x", "y"])).max(2),
      /** A line rising now (where, how far up, 0 to 1), or null. */
      rising: z
        .object({ at: z.number().int(), height: z.number().min(0).max(1) })
        .strict()
        .nullable(),
      /** The part a tap named last, or null. */
      named: z.nativeEnum(PlanePart).nullable(),
      points: z.array(namedPointSchema).max(MAX_POINTS),
      /** The learner gets a Next point button for a figure's hidden points. */
      canShowPoints: z.boolean(),
      /** The learner gets a button numbering the quadrants I to IV. */
      canNumberQuadrants: z.boolean(),
      /** A quadrant can be tapped before all four are numbered. */
      canTapQuadrants: z.boolean(),
      /** A tapped part's name is written under the plane. */
      namesTapped: z.boolean(),
      /** The lines drawn turned this many degrees anticlockwise; 0: one across, one up. */
      turn: z.number().min(-90).max(90),
      /** How strongly the scene and its places show behind the lines, 0 to 1. */
      backdrop: z.number().min(0).max(1),
      /** Each numbered quadrant tinted its own colour. */
      tintsQuadrants: z.boolean(),
    })
    .strict(),
  start: planeStart,

  needs: z
    .object({
      /** Nothing else is drawn on it: a tap on a part of it names that part. */
      isAlone: z.boolean(),
      /** A counted line's numbers are buttons. */
      canTapNumbers: z.boolean(),
      /** The number lit now, shown pressed. */
      lit: lineSchema.nullable(),
    })
    .strict(),
  facts: { isCrossed: (me) => me.apart.x === 0 && me.apart.y === 0 },
  actions: {
    namePart: action(
      { part: z.nativeEnum(PlanePart) },
      { from: "screen", describe: "Name the part tapped" },
    ),
    numberQuadrants: action(
      {},
      { from: "screen", describe: "Name the quadrants I to IV, one after another" },
    ),
    moveApart: action(pointSchema.shape, {
      from: "screen",
      describe: "Slide the vertical line's zero",
    }),
    bringTogether: action(
      {},
      { from: "screen", describe: "Glide the zeroes together: the axes, and O" },
    ),
    showPoint: action(
      { name: z.string().min(1).max(7).optional() },
      { from: "screen", describe: "Show the next point" },
    ),
    raiseUpLine: action({ at: z.number().int() }, { describe: "Raise a line from a whole number" }),
    raiseAllUpLines: action({}, { describe: "Raise every line not risen yet, left to right" }),
    /** One line rising after another: the next of `ats` (`isAll`: then every number has one). */
    raiseNext: action({
      ats: z.array(z.number().int()),
      seconds: z.number().positive(),
      isAll: z.boolean(),
    }),
    numberLine: action({ axis: z.enum(["x", "y"]) }, { describe: "Number one line" }),
    setScale: action(
      { every: z.number().positive() },
      { describe: "A number every this many units" },
    ),
    tapNumber: action(lineSchema.shape, {
      from: "screen",
      describe: "Tap a number on a counted line",
    }),
    showAllPoints: action({}, { describe: "Show every point" }),
    turnTo: action(
      { degrees: z.number().min(-90).max(90), seconds: z.number().positive() },
      { describe: "Turn the two lines, gliding, to this many degrees (0: upright)" },
    ),
    fadeBackdrop: action(
      { to: z.number().min(0).max(1), seconds: z.number().positive() },
      { describe: "Fade what is drawn behind the lines (the town) in or out" },
    ),
  },
  signals: {
    risen: signal({ at: z.number().int() }),
    crossed: signal(),
    named: signal({ part: z.nativeEnum(PlanePart) }),
    quadrantsNumbered: signal(),
    numberTapped: signal(lineSchema.shape),
    turned: signal({ degrees: z.number() }),
  },
  on: {
    namePart: (_, { part }, t) => [t.set({ named: part }), t.tell.named({ part })],
    numberQuadrants: (_, __, t) => [
      t.set({ quadrantsNamed: 0 }),
      t.later(SWEEP_STEP, t.set({ quadrantsNamed: 1 })),
      t.later(SWEEP_STEP * 2, t.set({ quadrantsNamed: 2 })),
      t.later(SWEEP_STEP * 3, t.set({ quadrantsNamed: 3 })),
      t.later(SWEEP_STEP * 4, t.set({ quadrantsNamed: 4 }), t.tell.quadrantsNumbered()),
    ],
    // Slid until the zeroes meet: the axes, named O, as when brought together by the button.
    moveApart: (_, apart, t) => [
      t.set({ apart }),
      ...(apart.x === 0 && apart.y === 0 ? [t.set({ showOrigin: true }), t.tell.crossed()] : []),
    ],
    bringTogether: (me, _, t) =>
      me.isCrossed
        ? t.set({ showOrigin: true })
        : t.move("apart", { x: 0, y: 0 }, GLIDE, {
            atEnd: [t.set({ showOrigin: true }), t.tell.crossed()],
          }),
    showPoint: (me, { name }, t) => {
      const at = me.points.findIndex((p) => (name === undefined ? !p.isShown : p.name === name));
      return (
        at !== -1 &&
        t.set({ points: me.points.map((p, i) => (i === at ? { ...p, isShown: true } : p)) })
      );
    },
    raiseUpLine: (me, { at }, t) =>
      me.upLines !== null &&
      !me.upLines.includes(at) &&
      t.self.raiseNext({ ats: [at], seconds: RISE, isAll: false }),
    raiseAllUpLines: (me, _, t) => {
      if (me.upLines === null) return;
      const risen = me.upLines;
      const rest = marksUp(me.window).filter((x) => !risen.includes(x));
      return rest.length > 0 && t.self.raiseNext({ ats: rest, seconds: RISE_EACH, isAll: true });
    },
    // Each line grows from 0 to full height; once up, it is counted, and the next starts.
    raiseNext: (me, { ats, seconds, isAll }, t) => {
      const [at, ...rest] = ats;
      if (at === undefined) return;
      const upLines = [...(me.upLines ?? []), at];
      return [
        t.set({ rising: { at, height: 0 } }),
        t.move("rising", { at, height: 1 }, seconds, {
          atEnd: [
            t.set({ upLines, rising: null }),
            t.tell.risen({ at }),
            ...(rest.length > 0
              ? [t.self.raiseNext({ ats: rest, seconds, isAll })]
              : isAll
                ? [t.set({ upLines: null })]
                : []),
          ],
        }),
      ];
    },
    numberLine: (me, { axis }, t) =>
      !me.numbered.includes(axis) && t.set({ numbered: [...me.numbered, axis] }),
    setScale: (me, { every }, t) =>
      every !== me.tickEvery &&
      t.set({ tickEvery: every, window: scaledWindow(me.window, me.tickEvery, every) }),
    tapNumber: (me, line, t) => me.canTapNumbers && t.tell.numberTapped(line),
    showAllPoints: (me, _, t) => t.set({ points: me.points.map((p) => ({ ...p, isShown: true })) }),
    turnTo: (_, { degrees, seconds }, t) =>
      t.move("turn", degrees, seconds, { atEnd: [t.tell.turned({ degrees })] }),
    fadeBackdrop: (_, { to, seconds }, t) => t.move("backdrop", to, seconds),
  },
  frame: {
    kind: planeFrame.kind,
    pixels: (me, width) => planeFrame.pixels(me as unknown as PlaneCore, width),
    label: (me) => planeFrame.label?.(me as unknown as PlaneCore) ?? "the plane",
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
