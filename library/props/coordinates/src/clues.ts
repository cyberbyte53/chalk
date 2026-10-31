import { localizedSchema } from "@chalk/content";
import { type Emit, PropRole, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import {
  type PlaneCore,
  type PlaneWindow,
  type Point,
  fromPlane,
  pointSchema,
  windowSchema,
} from "./plane";

/**
 * A clue about where a point is: words, and what they allow. A region ("upper half"), one distance
 * (every point with x = 5: a whole line), or both distances (one point).
 */
export const clueSchema = z
  .object({
    words: localizedSchema,
    region: windowSchema.optional(),
    x: z.number().optional(),
    y: z.number().optional(),
  })
  .strict();
export type Clue = z.infer<typeof clueSchema>;

/** The plane's fields it draws or decides by. */
export const cluesReads = fromPlane("window");

export type CluesState = Pick<PlaneCore, (typeof cluesReads.keys)[number]> & {
  unit: string;
  isPlaneFree: boolean;
  hidden: Point | null;
  clueChoices: Clue[];
  given: number[];
  isHiddenShown: boolean;
  canHide: boolean;
  canGiveClues: boolean;
};

/**
 * Where the point could still be after these clues: anywhere in the window, a region, a line
 * (x = 5, or y = 0), one point, or nowhere (clues that disagree).
 */
export type Still =
  | { kind: "anywhere" }
  | { kind: "region"; region: PlaneWindow }
  | { kind: "line"; axis: "x" | "y"; value: number; region: PlaneWindow }
  | { kind: "point"; x: number; y: number }
  | { kind: "nowhere" };

export function stillPossible(
  s: Pick<CluesState, "window" | "clueChoices">,
  given: readonly number[],
): Still {
  let r: PlaneWindow = { ...s.window };
  let x: number | undefined;
  let y: number | undefined;
  for (const g of given) {
    const c = s.clueChoices[g];
    if (c === undefined) continue;
    if (c.region !== undefined)
      r = {
        xMin: Math.max(r.xMin, c.region.xMin),
        xMax: Math.min(r.xMax, c.region.xMax),
        yMin: Math.max(r.yMin, c.region.yMin),
        yMax: Math.min(r.yMax, c.region.yMax),
      };
    if (c.x !== undefined) {
      if (x !== undefined && x !== c.x) return { kind: "nowhere" };
      x = c.x;
    }
    if (c.y !== undefined) {
      if (y !== undefined && y !== c.y) return { kind: "nowhere" };
      y = c.y;
    }
  }
  if (r.xMin > r.xMax || r.yMin > r.yMax) return { kind: "nowhere" };
  const isIn = (v: number, lo: number, hi: number) => v >= lo && v <= hi;
  if (x !== undefined && !isIn(x, r.xMin, r.xMax)) return { kind: "nowhere" };
  if (y !== undefined && !isIn(y, r.yMin, r.yMax)) return { kind: "nowhere" };
  if (x !== undefined && y !== undefined) return { kind: "point", x, y };
  if (x !== undefined) return { kind: "line", axis: "x", value: x, region: r };
  if (y !== undefined) return { kind: "line", axis: "y", value: y, region: r };
  const isWhole =
    r.xMin === s.window.xMin &&
    r.xMax === s.window.xMax &&
    r.yMin === s.window.yMin &&
    r.yMax === s.window.yMax;
  return isWhole ? { kind: "anywhere" } : { kind: "region", region: r };
}

/** Whether it is drawn on the plane. */
export const areCluesOn = (s: Pick<CluesState, "clueChoices">) => s.clueChoices.length > 0;
