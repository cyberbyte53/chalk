import { localizedSchema } from "@chalk/content";
import { PropRole } from "@chalk/prop";
import { action, prop, signal } from "@chalk/prop/next";
import { z } from "zod";
import {
  Axes,
  Marks,
  type PlaneCore,
  PlanePart,
  Scene,
  lineSchema,
  namedPointSchema,
  planeFrame,
  planeStart,
  pointSchema,
  scaledWindow,
  windowSchema,
} from "../plane";

/**
 * The plane, on the event model: two perpendicular lines and their marks, drawn only as far as the
 * lesson has defined them, and the points a figure names. Everything else in the coordinate plane
 * draws on its picture. What it decides by but doesn't own (whether it is alone, whether its
 * numbers are buttons, which is lit) it needs from the coordinate plane.
 */

const MAX_SPAN = 200;
const MAX_POINTS = 24;
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

export const plane = prop({
  type: "scenePlane",
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
  },
  signals: {
    risen: signal({ at: z.number().int() }),
    crossed: signal(),
    named: signal({ part: z.nativeEnum(PlanePart) }),
    quadrantsNumbered: signal(),
    numberTapped: signal(lineSchema.shape),
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
    moveApart: (_, apart, t) => [
      t.set({ apart }),
      ...(apart.x === 0 && apart.y === 0 ? [t.tell.crossed()] : []),
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
