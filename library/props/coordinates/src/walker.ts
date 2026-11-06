import { localizedSchema } from "@chalk/content";
import { type Out, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { part } from "./part";
import {
  Axes,
  Marks,
  type PlaneCore,
  type Point,
  Scene,
  fromPlane,
  isInWindow,
  pointSchema,
  windowSchema,
} from "./plane";

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

const MAX_TRAIL = 200;

/**
 * Riya: she walks one block per tap, on roads only, gliding from block to block
 * (a planned move: where she is between blocks is worked out from the board's clock). What she
 * walks by (the map's edge, the streets up, where she is headed) she needs from the coordinate
 * plane; she never keeps a copy.
 */
export const walker = prop({
  type: "walker",
  role: PropRole.Explainer,
  describe:
    "A walker (Riya) moved one block per tap of an arrow, from wherever she is, on roads only: in a town, along the main road and up the streets; in a city or on graph paper, along any line. Her route is drawn and her address shown as she moves. A lesson can also walk her to a point, along then up.",
  variables: z
    .object({
      walkerName: localizedSchema,
      walkerKind: z.nativeEnum(WalkerKind),
      /** Whether her line under the plane says where she is (off when that is the answer). */
      showWhere: z.boolean(),
      /** Where she starts (Riya's corner, O), or null: no walker. */
      walkFrom: pointSchema.nullable(),
      at: pointSchema,
      roads: z.nativeEnum(Roads),
      /** The blocks she has walked since the start, in order (her route). */
      trail: z.array(pointSchema).max(MAX_TRAIL),
      isWalking: z.boolean(),
      /** Whether the learner gets the arrows. */
      canStep: z.boolean(),
    })
    .strict(),
  start: {
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
  needs: z
    .object({
      window: windowSchema,
      upLines: z.array(z.number().int()).nullable(),
      axes: z.nativeEnum(Axes),
      marks: z.nativeEnum(Marks),
      axisNames: z.tuple([localizedSchema, localizedSchema]),
      scene: z.nativeEnum(Scene),
      /** Where she is headed (Aman's house), or null. */
      target: pointSchema.nullable(),
      targetName: localizedSchema,
      /** Whether the learner can still choose one (so she may yet arrive somewhere). */
      canChooseTarget: z.boolean(),
    })
    .strict(),
  actions: {
    step: action(
      { direction: z.nativeEnum(Direction) },
      { from: "screen", describe: "Move Riya one block up, down, left or right, on roads only" },
    ),
    walkTo: action(pointSchema.shape, {
      describe: "Walk Riya from her start to (x, y): along, then up",
    }),
    backToStart: action({}, { from: "screen", describe: "Riya back to where she started" }),
    startHere: action(
      {},
      {
        describe:
          "Riya starts again from where she stands: her route so far is cleared (a trail's next leg)",
      },
    ),
  },
  signals: {
    stepped: signal(pointSchema.shape),
    arrived: signal(pointSchema.shape),
    blocked: signal({ direction: z.nativeEnum(Direction), why: z.string().min(1) }),
  },
  on: {
    step: (me, { direction }, t) => {
      if (me.walkFrom === null || me.isWalking) return;
      const next = stepFrom(me, direction);
      if ("blocked" in next) return t.tell.blocked({ direction, why: next.blocked });
      return [
        t.set({ isWalking: true }),
        glide(me.target, next.to, routeAfter(me, next.to), t, [t.set({ isWalking: false })]),
      ];
    },
    // Along, then up or down, block by block: each glide's end starts the next.
    walkTo: (me, p, t) => {
      const start = me.walkFrom;
      if (start === null || !Number.isInteger(p.x - start.x) || !Number.isInteger(p.y - start.y))
        return;
      const route: Point[] = [];
      const dx = Math.sign(p.x - start.x);
      const dy = Math.sign(p.y - start.y);
      for (let x = start.x; x !== p.x; x += dx) route.push({ x: x + dx, y: start.y });
      for (let y = start.y; y !== p.y; y += dy) route.push({ x: p.x, y: y + dy });
      let then: Out[] = [t.set({ isWalking: false })];
      for (let i = route.length - 1; i >= 0; i--)
        then = [glide(me.target, route[i] as Point, route.slice(0, i + 1), t, then)];
      return [t.stop(), t.set({ at: start, trail: [], isWalking: true }), ...then];
    },
    backToStart: (me, _, t) =>
      me.walkFrom !== null && [t.stop(), t.set({ at: me.walkFrom, trail: [], isWalking: false })],
    startHere: (me, _, t) => !me.isWalking && t.set({ walkFrom: me.at, trail: [] }),
  },
});

/** What a glide uses of the tools a rule gets. */
type WalkerTools = {
  move: (variable: "at", to: Point, takes: number, options: { atEnd: readonly Out[] }) => Out;
  set: (patch: { trail: Point[] }) => Out;
  tell: { stepped: (p: Point) => Out; arrived: (p: Point) => Out };
};

/** One block's glide: she moves there, then where she is is told (and that she arrived, there). */
function glide(target: Point | null, to: Point, trail: Point[], t: WalkerTools, then: Out[]): Out {
  return t.move("at", to, SECONDS_PER_BLOCK, {
    atEnd: [
      t.set({ trail: trail.slice(-MAX_TRAIL) }),
      t.tell.stepped(to),
      ...(isSame(target, to) ? [t.tell.arrived(to)] : []),
      ...then,
    ],
  });
}

/** On the coordinate plane: Riya, behind the plane's marks, her buttons first. */
export const walkerPart = part({
  prop: walker,
  isOn: isWalkerOn,
  turns: { back: 20, on: 50, below: 30, controls: 10 },
  says: "a walker who goes along the first line, then up or down the second, on the lines only, so two numbers in order reach one place",
});
