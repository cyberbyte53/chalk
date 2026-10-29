import { actionsFor, layersFor, set, signal } from "@chalk/prop";
import { z } from "zod";
import {
  type PlaneCore,
  PlanePart,
  type Point,
  type Quadrant,
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

export type ReadingState = PlaneCore & {
  point: Point | null;
  pointStep: number;
  reading: Reading;
  isReadingHidden: boolean;
  visited: Quadrant[];
};

const act = actionsFor<ReadingState>();
const none = z.object({}).strict();

export const readingSignals = {
  moved: signal("The point was put down at (`x`, `y`), `place`: a quadrant, an axis or O"),
  enteredQuadrant: signal("The point is in a quadrant it hadn't been in: `quadrant`"),
  readingShown: signal("The hidden reading was shown: (`x`, `y`)"),
};

export const reading = layersFor<ReadingState>()({
  name: "reading",
  frame: "plane",
  describe:
    "A point the learner drags or taps, read off the axes: its perpendiculars to both axes, their lengths and directions, its abscissa and ordinate, and (x, y), as far as the board writes them. A crossed axis flips a sign; on an axis one coordinate is 0. The quadrants it has been in are remembered. In a guessing round the reading stays hidden until shown.",
  fields: {
    /** The point, or null when there is none. */
    point: pointSchema.nullable(),
    /** What the point snaps to: 1 (whole numbers), 0.5, 0.25. */
    pointStep: z.number().positive(),
    reading: z.nativeEnum(Reading),
    /** A guessing round: the reading is kept from the screen until it is shown. */
    isReadingHidden: z.boolean(),
    /** The quadrants the point has been in, in order. */
    visited: z.array(z.nativeEnum(PlanePart)).max(4),
  },
  defaults: {
    point: null,
    pointStep: 1,
    reading: Reading.None,
    isReadingHidden: false,
    visited: [],
  },
  isOn: (s) => s.point !== null,
  actions: {
    movePoint: act({
      describe: "Put the point at (x, y), snapped to the step (the learner's drag or tap)",
      byLearner: true,
      args: pointSchema,
      changes: ["point", "visited"],
      run: () => set({}),
    }),
    showReading: act({
      describe: "Show the reading kept hidden in a guessing round (the learner's Show)",
      byLearner: true,
      reveals: true,
      args: none,
      changes: ["isReadingHidden"],
      run: () => set({}),
    }),
    askAt: act({
      describe: "Put the point at (x, y) with its reading hidden: a guessing round",
      args: pointSchema,
      changes: ["point", "isReadingHidden", "visited"],
      run: () => set({}),
    }),
  },
  signals: readingSignals,
  derived: {
    abscissa: {
      describe: "x: the point's distance from the y-axis, + along OX, − along OX′",
      compute: (s) => s.point?.x ?? null,
    },
    ordinate: {
      describe: "y: the point's distance from the x-axis, + along OY, − along OY′",
      compute: (s) => s.point?.y ?? null,
    },
    place: {
      describe: "Where the point is: quadrant I to IV, on the x-axis or the y-axis, or at O",
      compute: (s) => (s.point === null ? null : placeOf(s.point)),
    },
  },
  offScreen: [],
});
