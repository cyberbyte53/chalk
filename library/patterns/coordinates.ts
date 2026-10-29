import { type At, type Placed, type Step, t, wait } from "@chalk/author";
import {
  Direction,
  Marks,
  PlaceKind,
  Roads,
  Scene,
  type coordinatePlaneDef,
} from "@chalk/prop-coordinates";

/**
 * Helpers for questions on the coordinate plane: starting setups with the readouts off (the family
 * turns on what it wants), conditions on the plane's state for `check`, and the taps that get there
 * (a question's `solve`).
 */

type Plane = Placed<typeof coordinatePlaneDef>;

/** Every whole-number point from (1, 1) to (across, up): a town's houses, a classroom's desks. */
export const gridOf = (across: number, up: number) =>
  Array.from({ length: across }, (_, i) =>
    Array.from({ length: up }, (_, j) => ({ x: i + 1, y: j + 1 })),
  ).flat();

/**
 * Riya's town, its size: six streets (fewer than the book's map's eight, so each block is big enough
 * to tap on a phone), five houses up each.
 */
export const TOWN = { streets: 6, houses: 5 } as const;

/** Riya's town: streets 1 to `streets` from the main road, `houses` up each; she at the corner. */
export const bareTown = (streets: number = TOWN.streets, houses: number = TOWN.houses) => ({
  window: { xMin: 0, xMax: streets + 0.5, yMin: 0, yMax: houses + 0.5 },
  marks: Marks.Counts,
  scene: Scene.Town,
  axisNames: [t("Street number", "गली नंबर"), t("House number", "मकान नंबर")] as [
    ReturnType<typeof t>,
    ReturnType<typeof t>,
  ],
  places: gridOf(streets, houses),
  placeKind: PlaceKind.House,
  canChooseTarget: false,
  showAddress: false,
  showWhere: false,
  walkFrom: { x: 0, y: 0 },
  at: { x: 0, y: 0 },
  roads: Roads.Town,
});

/** The classroom: `columns` × `rows` desks, numbered from the left and from the front. */
export const bareClassroom = (columns = 10, rows = 7) => ({
  window: { xMin: 0, xMax: columns + 0.5, yMin: 0, yMax: rows + 0.5 },
  marks: Marks.Counts,
  scene: Scene.Classroom,
  axisNames: [t("Column", "स्तंभ"), t("Row", "पंक्ति")] as [ReturnType<typeof t>, ReturnType<typeof t>],
  places: gridOf(columns, rows),
  placeKind: PlaceKind.Desk,
  showAddress: false,
});

/** A notebook page squared in centimetres, measured from its left edge and its bottom; a dot to drag. */
export const bareNotebook = (width = 15, height = 12) => ({
  window: { xMin: 0, xMax: width, yMin: 0, yMax: height },
  marks: Marks.Counts,
  tickEvery: 1,
  hasGrid: true,
  scene: Scene.Paper,
  axisNames: [t("left edge", "बायाँ किनारा"), t("bottom", "नीचे का किनारा")] as [
    ReturnType<typeof t>,
    ReturnType<typeof t>,
  ],
  showAxisNames: false,
  unit: "cm",
  point: { x: width - 1, y: height - 1 },
  pointStep: 1,
});

/** Riya stands at (x, y). (When she announces a step, she is exactly on its block.) */
export const isAt =
  (plane: Plane, x: number, y: number) =>
  (at: At): boolean => {
    const p = at(plane).at;
    return p.x === x && p.y === y;
  };

/** The place at (x, y) is the one chosen (the desk tapped). */
export const isChosen =
  (plane: Plane, x: number, y: number) =>
  (at: At): boolean => {
    const target = at(plane).target;
    return target !== null && target.x === x && target.y === y;
  };

/** The point dragged (the dot) is at (x, y). */
export const isPlaced =
  (plane: Plane, x: number, y: number) =>
  (at: At): boolean => {
    const p = at(plane).point;
    return p !== null && p.x === x && p.y === y;
  };

/**
 * The taps that walk Riya from the corner to (x, y): along, then up, each waited out (a tap while
 * she is still moving is ignored).
 */
export function walkTo(plane: Plane, x: number, y: number): (Step | ReturnType<typeof wait>)[] {
  const tap = (direction: Direction) => [plane.learner.step({ direction }), wait(0.4)];
  return [
    ...Array.from({ length: Math.abs(x) }, () => tap(x > 0 ? Direction.Right : Direction.Left)),
    ...Array.from({ length: Math.abs(y) }, () => tap(y > 0 ? Direction.Up : Direction.Down)),
  ].flat();
}
