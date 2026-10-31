import { type PlaneCore, type Point, type Quadrant, fromPlane } from "./plane";

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

/** The plane's fields it draws or decides by. */
export const readingReads = fromPlane("window");

export type ReadingState = Pick<PlaneCore, (typeof readingReads.keys)[number]> & {
  point: Point | null;
  pointStep: number;
  reading: Reading;
  isReadingHidden: boolean;
  visited: Quadrant[];
  unit: string;
};

/** A point snapped to the step and kept inside the window. */
export function snapped(s: Pick<ReadingState, "pointStep" | "window">, p: Point): Point {
  const snap = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, Number((Math.round(v / s.pointStep) * s.pointStep).toFixed(6))));
  return { x: snap(p.x, s.window.xMin, s.window.xMax), y: snap(p.y, s.window.yMin, s.window.yMax) };
}

/** Whether it is drawn on the plane. */
export const isReadingOn = (s: Pick<ReadingState, "point">) => s.point !== null;
