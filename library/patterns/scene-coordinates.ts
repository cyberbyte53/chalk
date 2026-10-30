import { type GivenFor, type Step, tap } from "@chalk/author";
import { Direction, type sceneCoordinatePlane } from "@chalk/prop-coordinates";
import { type PlaneSetup, bareClassroom, bareNotebook, bareTown } from "./coordinates";

/**
 * The coordinate plane's helpers for scenes (boards on the event model): the same setups as
 * coordinates.ts, the taps that walk Riya (a witness), and what a check reads. A scene reads a
 * piece by its name: `isAt("town", 4, 5)`.
 */

/** What a scene gives the coordinate plane, part by part: `{ walker: { walkFrom } }`. */
export type SceneSetup = GivenFor<typeof sceneCoordinatePlane>;

/** The same places, fields and parts as today's setups: only the plane's parts' names are read. */
const asScene = (setup: PlaneSetup): SceneSetup => setup as unknown as SceneSetup;

/** Setups put together part by part, later ones over earlier. */
export function sceneSetup(...setups: readonly SceneSetup[]): SceneSetup {
  const out: Record<string, Record<string, unknown>> = {};
  for (const one of setups)
    for (const [part, fields] of Object.entries(one))
      out[part] = { ...(out[part] ?? {}), ...(fields as Record<string, unknown>) };
  return out as SceneSetup;
}

export const sceneTown = (streets?: number, houses?: number): SceneSetup =>
  asScene(bareTown(streets, houses));
export const sceneClassroom = (columns?: number, rows?: number): SceneSetup =>
  asScene(bareClassroom(columns, rows));
export const sceneNotebook = (width?: number, height?: number): SceneSetup =>
  asScene(bareNotebook(width, height));

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
