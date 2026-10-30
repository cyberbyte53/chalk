import { PropRole } from "@chalk/prop";
import { type Out, action, prop, signal } from "@chalk/prop/next";
import { z } from "zod";
import {
  PlanePart,
  type PlaneWindow,
  type Point,
  QUADRANTS,
  type Quadrant,
  placeOf,
  pointSchema,
} from "../plane";
import { Reading, readingReads, snapped } from "../reading";

/**
 * A point's reading, on the event model: a point the learner drags or taps, read off the axes as
 * far as the board writes it. The window it snaps inside, it needs from the coordinate plane.
 */

const placeSchema = z.enum([...QUADRANTS, "x-axis", "y-axis", PlanePart.O]);

export const reading = prop({
  type: "sceneReading",
  role: PropRole.Explainer,
  describe:
    "A point the learner drags or taps, read off the axes: its perpendiculars to both axes, their lengths and directions, its abscissa and ordinate, and (x, y), as far as the board writes them. A crossed axis flips a sign; on an axis one coordinate is 0. The quadrants it has been in are remembered. In a guessing round the reading stays hidden until shown.",
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
    })
    .strict(),
  start: {
    point: null,
    pointStep: 1,
    reading: Reading.None,
    isReadingHidden: false,
    visited: [],
    unit: "",
  },
  needs: z.object(readingReads.fields).strict(),
  facts: {
    abscissa: (me) => me.point?.x ?? null,
    ordinate: (me) => me.point?.y ?? null,
    place: (me) => (me.point === null ? null : placeOf(me.point)),
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
    movePoint: (me, p, t) => putAt(me, p, false, t),
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
  me: { pointStep: number; window: PlaneWindow; visited: Quadrant[] },
  p: Point,
  isHidden: boolean,
  t: ReadingTools,
): Out[] {
  const point = snapped(me, p);
  const place = placeOf(point);
  const quadrant = (QUADRANTS as readonly string[]).includes(place) ? (place as Quadrant) : null;
  const isNew = quadrant !== null && !me.visited.includes(quadrant);
  const visited = isNew && quadrant !== null ? [...me.visited, quadrant] : me.visited;
  return [
    t.set({ point, visited, ...(isHidden ? { isReadingHidden: true } : {}) }),
    t.tell.moved({ x: point.x, y: point.y, place }),
    ...(isNew && quadrant !== null ? [t.tell.enteredQuadrant({ quadrant })] : []),
  ];
}
