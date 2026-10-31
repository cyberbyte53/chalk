import { localizedSchema } from "@chalk/content";
import {
  type Effect,
  type Emit,
  PropRole,
  actionsFor,
  defineProp,
  raise,
  seq,
  set,
  signal,
  tween,
} from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, type Point, fromPlane, isInWindow, pointSchema } from "./plane";

/** Which lines are roads Riya can walk on. */
export const Roads = {
  /** A main road through her start, and a street up from it at every whole number but the start. */
  Town: "town",
  /** Every whole-number line, both ways: a city of crossing streets, graph paper. */
  Grid: "grid",
} as const;
export type Roads = (typeof Roads)[keyof typeof Roads];

export const Direction = { Up: "up", Down: "down", Left: "left", Right: "right" } as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

/** What the walker is drawn as. */
export const WalkerKind = { Person: "person", Bus: "bus" } as const;
export type WalkerKind = (typeof WalkerKind)[keyof typeof WalkerKind];

/** The plane's fields she walks and is drawn by: its edge, its streets, its lines' names. */
export const walkerReads = fromPlane("window", "upLines", "axes", "marks", "axisNames", "scene");

/** Where she is headed, as the places say (Aman's house): passed in, never hers to change. */
const goalFields = {
  /** The target place, or null. */
  target: pointSchema.nullable(),
  /** What it is called on screen. */
  targetName: localizedSchema,
  /** Whether the learner can still choose one (so she may yet arrive somewhere). */
  canChooseTarget: z.boolean(),
};

export type WalkerState = Pick<PlaneCore, (typeof walkerReads.keys)[number]> & {
  target: Point | null;
  targetName: z.infer<typeof localizedSchema>;
  canChooseTarget: boolean;
  walkerName: z.infer<typeof localizedSchema>;
  walkerKind: WalkerKind;
  showWhere: boolean;
  walkFrom: Point | null;
  at: Point;
  roads: Roads;
  trail: Point[];
  isWalking: boolean;
  canStep: boolean;
};

/** Seconds she takes from one block to the next. */
export const SECONDS_PER_BLOCK = 0.3;

const MOVE: Record<Direction, Point> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * Where one block that way takes her, or why it can't: off the map, or no road. In the town, ← →
 * only on the main road, and ↑ ↓ only on a street (a whole number other than the start), never
 * below the main road.
 */
export function stepFrom(
  s: Pick<WalkerState, "walkFrom" | "at" | "roads" | "window" | "upLines">,
  direction: Direction,
): { to: Point } | { blocked: string } {
  const d = MOVE[direction];
  const to = { x: s.at.x + d.x, y: s.at.y + d.y };
  if (!isInWindow(s.window, to)) return { blocked: "the edge of the map" };
  if (s.roads === Roads.Town && s.walkFrom !== null) {
    const isAcross = d.y === 0;
    if (isAcross && s.at.y !== s.walkFrom.y)
      return { blocked: "no road across here: back down to the main road" };
    // Grown past the corner, the town has a street at the corner too, and its streets go south.
    const hasCornerStreet = s.window.xMin < s.walkFrom.x;
    const hasSouth = s.window.yMin < s.walkFrom.y;
    if (!isAcross && (!Number.isInteger(s.at.x) || (s.at.x === s.walkFrom.x && !hasCornerStreet)))
      return { blocked: "no street going up here" };
    if (!isAcross && s.upLines !== null && !s.upLines.includes(s.at.x))
      return { blocked: "this street isn't there yet" };
    if (!isAcross && to.y < s.walkFrom.y && !hasSouth)
      return { blocked: "nothing below the main road" };
  }
  return { to };
}

const isSame = (a: Point | null, b: Point) => a !== null && a.x === b.x && a.y === b.y;

/**
 * The route after a step to `to`: the step added, or, when it goes back onto the block before this
 * one, this block taken off. So the route always runs from the start to where the walker is now.
 */
export function routeAfter(s: Pick<WalkerState, "walkFrom" | "trail">, to: Point): Point[] {
  const before = s.trail.length >= 2 ? s.trail.at(-2) : s.walkFrom;
  return before !== null && before !== undefined && isSame(before, to)
    ? s.trail.slice(0, -1)
    : [...s.trail, to];
}

/** Whether she is on the plane: she has a start. */
export const isWalkerOn = (s: Pick<WalkerState, "walkFrom">) => s.walkFrom !== null;
