import { type GivenFor, type Step, t, tap } from "@chalk/author";
import {
  Direction,
  Marks,
  PlaceKind,
  Roads,
  Scene,
  type coordinatePlane,
} from "@chalk/prop-coordinates";

/**
 * The coordinate plane's helpers for boards: its starting setups (the town, the classroom, the
 * notebook page), the taps that walk Riya (a witness), and what a check reads. A scene reads a
 * piece by its name: `isAt("town", 4, 5)`.
 */

/** What a scene gives the coordinate plane, part by part: `{ walker: { walkFrom } }`. */
export type PlaneSetup = GivenFor<typeof coordinatePlane>;

/** Setups put together part by part, later ones over earlier. */
export function setup(...setups: readonly PlaneSetup[]): PlaneSetup {
  const out: Record<string, Record<string, unknown>> = {};
  for (const one of setups)
    for (const [part, fields] of Object.entries(one))
      out[part] = { ...(out[part] ?? {}), ...(fields as Record<string, unknown>) };
  return out as PlaneSetup;
}

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
export const bareTown = (
  streets: number = TOWN.streets,
  houses: number = TOWN.houses,
): PlaneSetup => ({
  plane: {
    window: { xMin: 0, xMax: streets + 0.5, yMin: 0, yMax: houses + 0.5 },
    marks: Marks.Counts,
    scene: Scene.Town,
    axisNames: [t("Street number", "गली नंबर"), t("House number", "मकान नंबर")],
  },
  places: {
    places: gridOf(streets, houses),
    placeKind: PlaceKind.House,
    canChooseTarget: false,
    showAddress: false,
  },
  walker: { showWhere: false, walkFrom: { x: 0, y: 0 }, at: { x: 0, y: 0 }, roads: Roads.Town },
});

/** The classroom: `columns` × `rows` desks, numbered from the left and from the front. */
export const bareClassroom = (columns = 10, rows = 7): PlaneSetup => ({
  plane: {
    window: { xMin: 0, xMax: columns + 0.5, yMin: 0, yMax: rows + 0.5 },
    marks: Marks.Counts,
    scene: Scene.Classroom,
    axisNames: [t("Column", "स्तंभ"), t("Row", "पंक्ति")],
  },
  places: { places: gridOf(columns, rows), placeKind: PlaceKind.Desk, showAddress: false },
});

/** A notebook page squared in centimetres, measured from its left edge and its bottom; a dot to drag. */
export const bareNotebook = (width = 15, height = 12): PlaneSetup => ({
  plane: {
    window: { xMin: 0, xMax: width, yMin: 0, yMax: height },
    marks: Marks.Counts,
    tickEvery: 1,
    hasGrid: true,
    scene: Scene.Paper,
    axisNames: [t("left edge", "बायाँ किनारा"), t("bottom", "नीचे का किनारा")],
    showAxisNames: false,
  },
  reading: { unit: "cm", point: { x: width - 1, y: height - 1 }, pointStep: 1 },
});

export const town = bareTown;
export const classroom = bareClassroom;
export const notebook = bareNotebook;

/** How a scene reads a piece: by its name. */
type Read = (piece: string) => Readonly<Record<string, unknown>>;
type PlaneRead = {
  walker: { at: { x: number; y: number } };
  places: { target: { x: number; y: number } | null };
  reading: { point: { x: number; y: number } | null };
};
const planeOf = (read: Read, plane: string) => read(plane) as unknown as PlaneRead;

/** Riya stands at (x, y). */
export const isAt =
  (plane: string, x: number, y: number) =>
  (read: Read): boolean => {
    const p = planeOf(read, plane).walker.at;
    return p.x === x && p.y === y;
  };

/** The place at (x, y) is the one chosen. */
export const isChosen =
  (plane: string, x: number, y: number) =>
  (read: Read): boolean => {
    const target = planeOf(read, plane).places.target;
    return target !== null && target.x === x && target.y === y;
  };

/** The point dragged (the dot) is at (x, y). */
export const isPlaced =
  (plane: string, x: number, y: number) =>
  (read: Read): boolean => {
    const p = planeOf(read, plane).reading.point;
    return p !== null && p.x === x && p.y === y;
  };

/**
 * The taps that walk Riya from the corner to (x, y): along, then up. Each plays out before the
 * next (a scene's witness lets what a tap set off finish), so nothing waits by hand.
 */
export function walkTo(plane: string, x: number, y: number): Step[] {
  const step = (direction: Direction) => tap(`${plane}.walker`, "step", { direction });
  return [
    ...Array.from({ length: Math.abs(x) }, () => step(x > 0 ? Direction.Right : Direction.Left)),
    ...Array.from({ length: Math.abs(y) }, () => step(y > 0 ? Direction.Up : Direction.Down)),
  ];
}
