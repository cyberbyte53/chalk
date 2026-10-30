import { localizedSchema } from "@chalk/content";
import { PropRole } from "@chalk/prop";
import { type Out, action, prop, signal } from "@chalk/prop/next";
import { z } from "zod";
import { Axes, Marks, type Point, Scene, pointSchema, windowSchema } from "../plane";
import { Direction, Roads, SECONDS_PER_BLOCK, WalkerKind, routeAfter, stepFrom } from "../walker";

/**
 * Riya, on the event model: she walks one block per tap, on roads only, gliding from block to block
 * (a planned move: where she is between blocks is worked out from the board's clock). What she
 * walks by (the map's edge, the streets up, where she is headed) she needs from the coordinate
 * plane; she never keeps a copy.
 */

const MAX_TRAIL = 200;
const isSame = (a: Point | null, b: Point) => a !== null && a.x === b.x && a.y === b.y;

export const walker = prop({
  type: "sceneWalker",
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
