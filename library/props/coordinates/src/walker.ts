import { localizedSchema } from "@chalk/content";
import {
  type Effect,
  type Emit,
  actionsFor,
  layersFor,
  raise,
  seq,
  set,
  signal,
  tween,
} from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, type Point, isInWindow, pointSchema } from "./plane";

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

export type WalkerState = PlaneCore & {
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
const MAX_TRAIL = 200;
const act = actionsFor<WalkerState>();
const none = z.object({}).strict();

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
    if (!isAcross && (!Number.isInteger(s.at.x) || s.at.x === s.walkFrom.x))
      return { blocked: "no street going up here" };
    if (!isAcross && s.upLines !== null && !s.upLines.includes(s.at.x))
      return { blocked: "this street isn't there yet" };
    if (!isAcross && to.y < s.walkFrom.y) return { blocked: "nothing below the main road" };
  }
  return { to };
}

/** The target another layer marks (Aman's house), if there is one. */
const targetOf = (s: WalkerState): Point | null =>
  (s as WalkerState & { target?: Point | null }).target ?? null;

const isSame = (a: Point | null, b: Point) => a !== null && a.x === b.x && a.y === b.y;

export const walkerSignals = {
  stepped: signal("Riya stepped one block, to (`x`, `y`)"),
  arrived: signal("Riya stepped onto the target place (Aman's house), at (`x`, `y`)"),
  blocked: signal("Riya can't go `direction`: `why`"),
};

/** One block's glide, then where she is announced (and that she has arrived, at the target). */
function glide(s: WalkerState, from: Point, to: Point, trail: Point[]): Effect<WalkerState>[] {
  const emit: Emit[] = [raise(walkerSignals.stepped, { x: to.x, y: to.y })];
  if (isSame(targetOf(s), to)) emit.push(raise(walkerSignals.arrived, { x: to.x, y: to.y }));
  return [
    tween(
      SECONDS_PER_BLOCK,
      { at: to },
      {
        ease: (x) => x,
        interpolate: (_, __, t) => ({
          at: { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t },
        }),
      },
    ),
    set({ at: to, trail: trail.slice(-MAX_TRAIL) }, ...emit),
  ];
}

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

const step = act({
  describe:
    "Move Riya one block up, down, left or right from where she is, on roads only (the learner's arrow; timed)",
  byLearner: true,
  args: z.object({ direction: z.nativeEnum(Direction) }).strict(),
  changes: ["at", "trail", "isWalking"],
  run: (s, { direction }) => {
    if (s.walkFrom === null || s.isWalking) return set({});
    const next = stepFrom(s, direction);
    if ("blocked" in next)
      return set({}, raise(walkerSignals.blocked, { direction, why: next.blocked }));
    return seq(
      set({ isWalking: true }),
      ...glide(s, s.at, next.to, routeAfter(s, next.to)),
      set({ isWalking: false }),
    );
  },
});

export const walker = layersFor<WalkerState>()({
  name: "walker",
  frame: "plane",
  describe:
    "A walker (Riya) moved one block per tap of an arrow, from wherever she is, on roads only: in a town, along the main road and up the streets; in a city or on graph paper, along any line. Her route is drawn and her address shown as she moves. A lesson can also walk her to a point, along then up.",
  fields: {
    walkerName: localizedSchema,
    /** Drawn as a person (Riya) or a bus. */
    walkerKind: z.nativeEnum(WalkerKind),
    /** Whether her line under the plane says where she is (off when that is the answer). */
    showWhere: z.boolean(),
    /** Where she starts (Riya's corner, O), or null: no walker. */
    walkFrom: pointSchema.nullable(),
    /** Where she stands now. */
    at: pointSchema,
    /** Which lines are roads: a town's main road and streets, or every grid line. */
    roads: z.nativeEnum(Roads),
    /** The blocks she has walked since the start, in order (her route). */
    trail: z.array(pointSchema).max(MAX_TRAIL),
    isWalking: z.boolean(),
    /** Whether the learner gets the arrows. */
    canStep: z.boolean(),
  },
  defaults: {
    walkerName: { en: "Riya", hi: "रिया" },
    walkerKind: WalkerKind.Person,
    showWhere: true,
    walkFrom: null,
    at: { x: 0, y: 0 },
    roads: Roads.Grid,
    trail: [],
    isWalking: false,
    canStep: true,
  },
  isOn: (s) => s.walkFrom !== null,
  actions: {
    step,
    walkTo: act({
      describe:
        "Walk Riya from her start to (x, y): along, then up or down, block by block (timed)",
      reveals: true,
      args: pointSchema,
      changes: ["at", "trail", "isWalking"],
      run: (s, p) => {
        const start = s.walkFrom;
        if (start === null || !Number.isInteger(p.x - start.x) || !Number.isInteger(p.y - start.y))
          return set({});
        const route: Point[] = [];
        const dx = Math.sign(p.x - start.x);
        const dy = Math.sign(p.y - start.y);
        for (let x = start.x; x !== p.x; x += dx) route.push({ x: x + dx, y: start.y });
        for (let y = start.y; y !== p.y; y += dy) route.push({ x: p.x, y: y + dy });
        const steps: Effect<WalkerState>[] = [set({ at: start, trail: [], isWalking: true })];
        let from = start;
        route.forEach((to, i) => {
          steps.push(...glide(s, from, to, route.slice(0, i + 1)));
          from = to;
        });
        return seq(...steps, set({ isWalking: false }));
      },
    }),
    backToStart: act({
      describe: "Riya back to where she started, her route cleared (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["at", "trail", "isWalking"],
      run: (s) =>
        s.walkFrom === null ? set({}) : set({ at: s.walkFrom, trail: [], isWalking: false }),
    }),
  },
  signals: walkerSignals,
  invariant: (s) =>
    s.walkFrom !== null && !isInWindow(s.window, s.at) ? "Riya is off the map" : undefined,
});
