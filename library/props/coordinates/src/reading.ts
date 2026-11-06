import { type Out, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { part } from "./part";
import {
  type PlaneCore,
  PlanePart,
  type PlaneWindow,
  type Point,
  QUADRANTS,
  type Quadrant,
  fromPlane,
  placeOf,
  pointSchema,
} from "./plane";

/** How much of a point's reading is written: each stage is defined by a board before it is used. */
export const Reading = {
  /** The point alone. */
  None: "none",
  /** Its perpendiculars to both axes. */
  Perpendiculars: "perpendiculars",
  /** And their lengths, with the direction each is measured in. */
  Distances: "distances",
  /** And the signed distances named abscissa and ordinate. */
  Abscissa: "abscissa",
  /** And the pair (x, y). */
  Pair: "pair",
} as const;
export type Reading = (typeof Reading)[keyof typeof Reading];

/** The plane's fields it draws or decides by: the window, and the frame its point is read in. */
export const readingReads = fromPlane("window", "shift", "turn");

export type ReadingState = Pick<PlaneCore, (typeof readingReads.keys)[number]> & {
  point: Point | null;
  pointStep: number;
  reading: Reading;
  isReadingHidden: boolean;
  visited: Quadrant[];
  unit: string;
  decimals: number;
  canMovePoint: boolean;
  showsVisitedSigns: boolean;
};

/**
 * A point of the sheet read in the axes' frame: moved by `shift`, turned by `turn` about O. The
 * point stays where it is on the sheet; only its coordinates depend on the axes.
 */
export function readIn(s: Pick<ReadingState, "shift" | "turn">, p: Point): Point {
  const a = (s.turn * Math.PI) / 180;
  const [dx, dy] = [p.x - s.shift.x, p.y - s.shift.y];
  const round = (v: number) => Number(v.toFixed(6));
  return {
    x: round(dx * Math.cos(a) + dy * Math.sin(a)),
    y: round(-dx * Math.sin(a) + dy * Math.cos(a)),
  };
}

/** A point snapped to the step and kept inside the window. */
export function snapped(s: Pick<ReadingState, "pointStep" | "window">, p: Point): Point {
  const snap = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, Number((Math.round(v / s.pointStep) * s.pointStep).toFixed(6))));
  return { x: snap(p.x, s.window.xMin, s.window.xMax), y: snap(p.y, s.window.yMin, s.window.yMax) };
}

/** Whether it is drawn on the plane. */
export const isReadingOn = (s: Pick<ReadingState, "point">) => s.point !== null;

const placeSchema = z.enum([...QUADRANTS, "x-axis", "y-axis", PlanePart.O]);

/**
 * A point's reading: a point the learner drags or taps, read off the axes as
 * far as the board writes it. The window it snaps inside, it needs from the coordinate plane.
 */
export const reading = prop({
  type: "reading",
  role: PropRole.Explainer,
  describe:
    "A point the learner drags or taps, read off the axes: its perpendiculars to both axes, their lengths and directions, its abscissa and ordinate, and (x, y), as far as the board writes them. A crossed axis flips a sign; on an axis one coordinate is 0. The quadrants it has been in are remembered, and can show their sign patterns. In a guessing round the reading stays hidden until shown. With the axes moved or turned, a point that stays is read in them: only its coordinates change.",
  variables: z
    .object({
      /** The point, or null when there is none. */
      point: pointSchema.nullable(),
      /** What the point snaps to: 1 (whole numbers), 0.5, 0.25. */
      pointStep: z.number().positive(),
      reading: z.nativeEnum(Reading),
      /** A guessing round: the reading is kept from the screen until it is shown. */
      isReadingHidden: z.boolean(),
      /** The quadrants the point has been in, in order. */
      visited: z.array(z.enum(QUADRANTS)).max(4),
      /** Written after a measured distance ("30 m"); empty for none. The same in both languages. */
      unit: z.string().max(4),
      /** How many decimal places its coordinates are written to: 0 as usual, 2 under turned axes. */
      decimals: z.number().int().min(0).max(2),
      /** The learner can drag or tap the point. Off: it stays (the axes move under it). */
      canMovePoint: z.boolean(),
      /** Each quadrant the point has been in shows its sign pattern, (+, +) in I and so on. */
      showsVisitedSigns: z.boolean(),
    })
    .strict(),
  start: {
    point: null,
    pointStep: 1,
    reading: Reading.None,
    isReadingHidden: false,
    visited: [],
    unit: "",
    decimals: 0,
    canMovePoint: true,
    showsVisitedSigns: false,
  },
  needs: z.object(readingReads.fields).strict(),
  facts: {
    abscissa: (me) => (me.point === null ? null : readIn(me, me.point).x),
    ordinate: (me) => (me.point === null ? null : readIn(me, me.point).y),
    place: (me) => (me.point === null ? null : placeOf(readIn(me, me.point))),
  },
  actions: {
    movePoint: action(pointSchema.shape, {
      from: "screen",
      describe: "Put the point at (x, y), snapped to the step (the learner's drag or tap)",
    }),
    showReading: action(
      {},
      {
        from: "screen",
        describe: "Show the reading kept hidden in a guessing round (the learner's Show)",
      },
    ),
    askAt: action(pointSchema.shape, {
      describe: "Put the point at (x, y) with its reading hidden: a guessing round",
    }),
  },
  signals: {
    moved: signal({ ...pointSchema.shape, place: placeSchema }),
    enteredQuadrant: signal({ quadrant: z.enum(QUADRANTS) }),
    readingShown: signal(pointSchema.shape),
  },
  on: {
    movePoint: (me, p, t) => me.canMovePoint && putAt(me, p, false, t),
    showReading: (me, _, t) =>
      me.point !== null &&
      me.isReadingHidden && [
        t.set({ isReadingHidden: false }),
        t.tell.readingShown({ x: me.point.x, y: me.point.y }),
      ],
    askAt: (me, p, t) => putAt(me, p, true, t),
  },
});

/** What putting the point down uses of the tools a rule gets. */
type ReadingTools = {
  set: (patch: { point: Point; visited: Quadrant[]; isReadingHidden?: boolean }) => Out;
  tell: {
    moved: (p: { x: number; y: number; place: z.infer<typeof placeSchema> }) => Out;
    enteredQuadrant: (p: { quadrant: Quadrant }) => Out;
  };
};

/** The point put down at p (snapped), the quadrants it has now been in, and what it tells. */
function putAt(
  me: {
    pointStep: number;
    window: PlaneWindow;
    visited: Quadrant[];
    shift: Point;
    turn: number;
  },
  p: Point,
  isHidden: boolean,
  t: ReadingTools,
): Out[] {
  const point = snapped(me, p);
  const place = placeOf(readIn(me, point));
  const quadrant = (QUADRANTS as readonly string[]).includes(place) ? (place as Quadrant) : null;
  const isNew = quadrant !== null && !me.visited.includes(quadrant);
  const visited = isNew && quadrant !== null ? [...me.visited, quadrant] : me.visited;
  return [
    t.set({ point, visited, ...(isHidden ? { isReadingHidden: true } : {}) }),
    t.tell.moved({ x: point.x, y: point.y, place }),
    ...(isNew && quadrant !== null ? [t.tell.enteredQuadrant({ quadrant })] : []),
  ];
}

/** On the coordinate plane: a point to read, in front of the lines, its words below. */
export const readingPart = part({
  prop: reading,
  isOn: isReadingOn,
  turns: { front: 50, below: 20, controls: 40 },
  says: "a point read off the axes as its abscissa, ordinate and (x, y)",
});
