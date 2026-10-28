import { localizedSchema } from "@chalk/content";
import {
  PropRole,
  SizeFit,
  actionsFor,
  call,
  defineProp,
  par,
  raise,
  seq,
  set,
  signal,
  tween,
} from "@chalk/prop";
import { z } from "zod";
import { numText, pairText, quadrantOf } from "./plane";

/** The farthest a plane reaches from the origin, either way. */
export const MAX_REACH = 12;

const reach = z.number().int().min(-MAX_REACH).max(MAX_REACH);
const coordinate = z.number().min(-MAX_REACH).max(MAX_REACH);
/** A dot on the plane: left by a walk, or placed and named by the lesson (B, M, L…). */
const mark = z
  .object({ x: coordinate, y: coordinate, name: z.string().min(1).max(3).optional() })
  .strict();

const coordinatePlaneState = z
  .object({
    /** The window: the plane runs from xMin to xMax across and yMin to yMax up (whole units). */
    xMin: reach,
    xMax: reach,
    yMin: reach,
    yMax: reach,
    /**
     * What the plane is drawn as: graph paper, a squared notebook page, a colony (streets up from a main road, a house at
     * each house number) or a cinema hall (a seat at each place, the screen at the front).
     */
    scene: z.enum(["paper", "notebook", "colony", "cinema"]),
    /** Only the x-axis, as a number line (P stays on it), before the plane is made from two. */
    isNumberLine: z.boolean(),
    /** Whether the learner can add the y-axis to the number line, making the plane. */
    canAddYAxis: z.boolean(),
    /** The point P: its x-coordinate (abscissa) and y-coordinate (ordinate). */
    x: coordinate,
    y: coordinate,
    /** Whether P's x and its y are known. Each known number alone is a whole line of places. */
    isXKnown: z.boolean(),
    isYKnown: z.boolean(),
    /** Whether the learner can drag P. */
    isMovable: z.boolean(),
    /** Whether the learner sets P's numbers with steppers. */
    canSetNumbers: z.boolean(),
    /** The step P moves in: 1 for whole units, 0.5 for halves. */
    snap: z.union([z.literal(1), z.literal(0.5)]),
    /** Whether the line each known number stands for is drawn (x = 3 is a vertical line). */
    showLines: z.boolean(),
    /** Whether P's perpendiculars to the two axes are drawn, each with its signed length. */
    showPerpendiculars: z.boolean(),
    /** Whether P's coordinates are written beside it and in the readout. */
    showCoordinates: z.boolean(),
    /** Whether the readout above the plane is shown (P = (x, y) and where it is). */
    showReadout: z.boolean(),
    /** Whether the axes' ends are named X′, X, Y′, Y, as the book draws them. */
    showAxisEnds: z.boolean(),
    /** Whether the four quadrants are tinted and numbered I to IV, P's own one stronger. */
    showQuadrants: z.boolean(),
    /** Whether each quadrant's signs are written in it: (+, +), (−, +), (−, −), (+, −). */
    showSigns: z.boolean(),
    /** Whether the learner can walk to P from O (along x, then up y) and swap P's numbers. */
    canWalk: z.boolean(),
    /** Where the walker is on its way to P, and whether it is out. */
    walkX: coordinate,
    walkY: coordinate,
    isWalkerOut: z.boolean(),
    /** Whether the learner can tap anywhere on the plane to put P there. */
    canPick: z.boolean(),
    /**
     * Whether two friends can walk to P together: one along x then up y, the other up y then
     * along x. Both arrive at P: its coordinates are those two moves, in either order.
     */
    canWalkBoth: z.boolean(),
    /** Where the second friend (y first) is, and whether they are out. */
    walk2X: coordinate,
    walk2Y: coordinate,
    isWalker2Out: z.boolean(),
    /** Pairs the learner picks with one tap (an example's table), each a button. */
    pairs: z.array(z.object({ x: coordinate, y: coordinate }).strict()).max(10),
    /** The dots walks have left behind. */
    marks: z.array(mark).max(16),
    /** P's name. */
    pointName: z.string().min(1).max(3),
    /** The axes' names (x and y; street and house; column and row), from the lesson. */
    xName: localizedSchema,
    yName: localizedSchema,
    /** Words on the buttons and in the readout, from the lesson. */
    walkLabel: localizedSchema,
    walkBothLabel: localizedSchema,
    swapLabel: localizedSchema,
    againLabel: localizedSchema,
    addYAxisLabel: localizedSchema,
    screenLabel: localizedSchema,
    rightOfOWords: localizedSchema,
    leftOfOWords: localizedSchema,
    quadrantWord: localizedSchema,
    onXAxisWords: localizedSchema,
    onYAxisWords: localizedSchema,
    originWords: localizedSchema,
  })
  .strict();
export type CoordinatePlaneState = z.infer<typeof coordinatePlaneState>;

const act = actionsFor<CoordinatePlaneState>();
const none = z.object({}).strict();
const at = z.object({ x: z.number(), y: z.number() }).strict();
const value = z.object({ value: z.number() }).strict();

/** A number moved onto the plane's grid of steps and inside its window. */
export function snapped(v: number, step: number, lo: number, hi: number): number {
  const s = Math.round(v / step) * step;
  return Number(Math.min(hi, Math.max(lo, s)).toFixed(6));
}

/** Seconds the walker takes for a stretch: steady, so counting steps is easy to follow. */
const walkTime = (units: number) => 0.25 + Math.abs(units) * 0.28;

const signals = {
  moved: signal("P moved; its `x` and `y`"),
  arrived: signal("The walker reached P from O; its `x` and `y`"),
};

const leaveMark = act({
  describe: "The walker is at P: a dot stays there",
  internal: true,
  changes: ["marks", "walkX", "walkY"],
  args: none,
  run: (s) => {
    const here = { x: s.x, y: s.y };
    const marks = s.marks.some((m) => m.x === here.x && m.y === here.y)
      ? s.marks
      : [...s.marks, here].slice(-16);
    return set({ marks, walkX: s.x, walkY: s.y }, raise(signals.arrived, here));
  },
});

/**
 * A plane with two perpendicular number lines, the axes, crossing at their zeros, the origin O, and
 * one point P. Every point is fixed by two numbers: its x-coordinate, the signed distance from the
 * y-axis, and its y-coordinate, the signed distance from the x-axis, written (x, y). Each number
 * alone is a line (x = 3 is every point 3 to the right of the y-axis); two numbers are two lines
 * meeting at one point. The axes cut the plane into four quadrants, numbered I to IV anticlockwise,
 * where the signs are (+, +), (−, +), (−, −), (+, −); on the x-axis y is 0, on the y-axis x is 0.
 * To plot (x, y), walk from O x along the x-axis, then y parallel to the y-axis: (x, y) and (y, x)
 * are different points unless x = y.
 */
export const coordinatePlane = defineProp({
  type: "coordinatePlane",
  role: PropRole.Explainer,
  // Scaled as one picture, and allowed to grow on a projector: the plane is what the class looks at.
  size: { fit: SizeFit.Scale, maxZoom: 1.6, maxHeight: 0.85 },
  describe:
    "A plane with an x-axis and a y-axis crossing at the origin O, and a point P. P's x-coordinate is its signed distance from the y-axis and its y-coordinate its signed distance from the x-axis, written (x, y). Each number alone is a line of places; two numbers meet at one point. The axes make four quadrants, I to IV anticlockwise, with signs (+, +), (−, +), (−, −), (+, −); a point on the x-axis has y = 0, on the y-axis x = 0, and O is (0, 0). Plotting (x, y) is walking x along the x-axis, then y up: (x, y) and (y, x) differ unless x = y.",
  state: coordinatePlaneState,
  defaults: {
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6,
    scene: "paper",
    isNumberLine: false,
    canAddYAxis: false,
    x: 4,
    y: 3,
    isXKnown: true,
    isYKnown: true,
    isMovable: true,
    canSetNumbers: false,
    snap: 1,
    showLines: false,
    showPerpendiculars: true,
    showCoordinates: true,
    showReadout: true,
    showAxisEnds: false,
    showQuadrants: true,
    showSigns: false,
    canWalk: false,
    walkX: 0,
    walkY: 0,
    isWalkerOut: false,
    canPick: false,
    canWalkBoth: false,
    walk2X: 0,
    walk2Y: 0,
    isWalker2Out: false,
    marks: [],
    pairs: [],
    pointName: "P",
    xName: { en: "x", hi: "x" },
    yName: { en: "y", hi: "y" },
    walkLabel: { en: "Walk there", hi: "वहाँ चलो" },
    walkBothLabel: { en: "Two friends walk", hi: "दो दोस्त चलें" },
    swapLabel: { en: "Swap x and y", hi: "x और y बदलो" },
    againLabel: { en: "Start again", hi: "फिर से" },
    addYAxisLabel: { en: "Add a second number line", hi: "दूसरी संख्या रेखा जोड़ो" },
    screenLabel: { en: "SCREEN", hi: "पर्दा" },
    rightOfOWords: { en: "{n} to the right of O", hi: "O से {n} दाईं ओर" },
    leftOfOWords: { en: "{n} to the left of O", hi: "O से {n} बाईं ओर" },
    quadrantWord: { en: "Quadrant", hi: "चतुर्थांश" },
    onXAxisWords: { en: "on the x-axis", hi: "x-अक्ष पर" },
    onYAxisWords: { en: "on the y-axis", hi: "y-अक्ष पर" },
    originWords: { en: "the origin", hi: "मूलबिंदु" },
  },
  inputs: [
    "isNumberLine",
    "isMovable",
    "canSetNumbers",
    "showLines",
    "showPerpendiculars",
    "showCoordinates",
    "showQuadrants",
    "showSigns",
    "canWalk",
    "canPick",
    "canWalkBoth",
  ],
  derived: {
    quadrant: {
      describe: "P's quadrant, 1 to 4, or 0 when P is on an axis",
      compute: (s) => quadrantOf(s.x, s.y),
    },
    isOnXAxis: {
      describe: "P is on the x-axis: its y-coordinate is 0",
      compute: (s) => s.y === 0,
    },
    isOnYAxis: {
      describe: "P is on the y-axis: its x-coordinate is 0",
      compute: (s) => s.x === 0,
    },
    isKnown: {
      describe: "Both of P's numbers are known, so P is one point",
      compute: (s) => s.isXKnown && s.isYKnown,
    },
  },
  actions: {
    movePoint: act({
      describe:
        "Drag P to a place on the grid (the learner's finger); both its numbers are then known",
      byLearner: true,
      changes: ["x", "y", "isXKnown", "isYKnown", "isWalkerOut", "isWalker2Out"],
      args: at,
      run: (s, a) => {
        const x = snapped(a.x, s.snap, s.xMin, s.xMax);
        // On the number line, P stays on it.
        const y = s.isNumberLine ? 0 : snapped(a.y, s.snap, s.yMin, s.yMax);
        if (x === s.x && y === s.y && s.isXKnown && s.isYKnown) return set({});
        // A new place to walk to: the walker from the last walk goes home (its dot stays).
        return set(
          { x, y, isXKnown: true, isYKnown: true, isWalkerOut: false, isWalker2Out: false },
          raise(signals.moved, { x, y }),
        );
      },
    }),
    setX: act({
      describe: "Give P's x-coordinate (a stepper): x is then known",
      byLearner: true,
      changes: ["x", "isXKnown"],
      args: value,
      run: (s, a) => {
        const x = snapped(a.value, s.snap, s.xMin, s.xMax);
        return set({ x, isXKnown: true }, raise(signals.moved, { x, y: s.y }));
      },
    }),
    setY: act({
      describe: "Give P's y-coordinate (a stepper): y is then known",
      byLearner: true,
      changes: ["y", "isYKnown"],
      args: value,
      run: (s, a) => {
        const y = snapped(a.value, s.snap, s.yMin, s.yMax);
        return set({ y, isYKnown: true }, raise(signals.moved, { x: s.x, y }));
      },
    }),
    swap: act({
      describe: "Swap P's numbers: (x, y) becomes (y, x)",
      byLearner: true,
      changes: ["x", "y", "isWalkerOut", "walkX", "walkY", "isWalker2Out"],
      args: none,
      run: (s) => {
        const x = snapped(s.y, s.snap, s.xMin, s.xMax);
        const y = snapped(s.x, s.snap, s.yMin, s.yMax);
        return set(
          { x, y, isWalkerOut: false, walkX: 0, walkY: 0 },
          raise(signals.moved, { x, y }),
        );
      },
    }),
    walk: act({
      describe:
        "Walk from O to P: first x along the x-axis, then y parallel to the y-axis; a dot stays at P",
      byLearner: true,
      changes: ["isWalkerOut", "walkX", "walkY"],
      args: none,
      run: (s) =>
        seq(
          set({ isWalkerOut: true, walkX: 0, walkY: 0 }),
          tween(walkTime(s.x), { walkX: s.x }, { ease: (t) => t }),
          tween(walkTime(s.y), { walkY: s.y }, { ease: (t) => t }),
          call(leaveMark),
        ),
    }),
    leaveMark,
    walkBoth: act({
      describe:
        "Two friends walk from O to P at the same time: one x along the x-axis then y up, the other y up the y-axis then x along; both arrive at P",
      byLearner: true,
      changes: ["isWalkerOut", "walkX", "walkY", "isWalker2Out", "walk2X", "walk2Y"],
      args: none,
      run: (s) =>
        seq(
          set({ isWalkerOut: true, walkX: 0, walkY: 0, isWalker2Out: true, walk2X: 0, walk2Y: 0 }),
          par(
            seq(
              tween(walkTime(s.x), { walkX: s.x }, { ease: (t) => t }),
              tween(walkTime(s.y), { walkY: s.y }, { ease: (t) => t }),
            ),
            seq(
              tween(walkTime(s.y), { walk2Y: s.y }, { ease: (t) => t }),
              tween(walkTime(s.x), { walk2X: s.x }, { ease: (t) => t }),
            ),
          ),
          call(leaveMark),
        ),
    }),
    addYAxis: act({
      describe:
        "Put a second number line through O, upright, crossing the first at their zeros: the number line becomes the plane",
      byLearner: true,
      changes: ["isNumberLine"],
      args: none,
      run: (s) => (s.isNumberLine ? set({ isNumberLine: false }) : set({})),
    }),
    startAgain: act({
      describe: "Clear the dots and the walker; P's numbers are forgotten when the lines are shown",
      byLearner: true,
      changes: ["marks", "isWalkerOut", "isWalker2Out", "walkX", "walkY", "isXKnown", "isYKnown"],
      args: none,
      run: (s) =>
        set({
          marks: [],
          isWalkerOut: false,
          isWalker2Out: false,
          walkX: 0,
          walkY: 0,
          isXKnown: !s.showLines,
          isYKnown: !s.showLines,
        }),
    }),
  },
  signals,
  invariant: (s) => {
    if (s.xMin >= s.xMax || s.yMin >= s.yMax) return "the window is empty";
    if (s.isNumberLine && s.y !== 0) return "on the number line P has no y but 0";
    if (s.scene !== "paper" && (s.xMin !== 0 || s.yMin !== 0))
      return "a notebook page, a colony or a cinema starts at 0 on both axes";
    if (s.x < s.xMin || s.x > s.xMax || s.y < s.yMin || s.y > s.yMax)
      return `P (${s.x}, ${s.y}) is outside the window`;
    return undefined;
  },
  summary: (s) => {
    if (s.isNumberLine) return `a number line; ${s.pointName} is at ${numText(s.x)}`;
    const known = s.isXKnown && s.isYKnown;
    if (!known)
      return s.isXKnown
        ? `only P's x is known: x = ${s.x}, a line of places`
        : s.isYKnown
          ? `only P's y is known: y = ${s.y}, a line of places`
          : "P's numbers are not known yet";
    const q = quadrantOf(s.x, s.y);
    const where =
      s.x === 0 && s.y === 0
        ? "the origin"
        : s.y === 0
          ? "on the x-axis"
          : s.x === 0
            ? "on the y-axis"
            : `in quadrant ${q}`;
    return `${s.pointName} is at ${pairText(s.x, s.y)}, ${where}${s.marks.length > 0 ? `; dots at ${s.marks.map((m) => pairText(m.x, m.y)).join(", ")}` : ""}`;
  },
});
