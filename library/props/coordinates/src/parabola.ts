import { Ease, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { type Point, windowSchema } from "./plane";
import { num } from "./words";

/** The two zeroes a parabola is held by: y = a(x − α)(x − β). */
const zeroesSchema = z.object({ alpha: z.number(), beta: z.number() }).strict();
export type Zeroes = z.infer<typeof zeroesSchema>;

/** What fixes the curve: its zeroes, a, and how far it is lifted (k). */
export type ParabolaShape = { zeroes: Zeroes | null; a: number; lift: number };

/** Closer than this to 0 is 0 (a touch, a lift that has come back to the axis). */
const EPS = 1e-9;

const NONE: Zeroes = { alpha: 0, beta: 0 };

/** y at x: a(x − α)(x − β) + k. */
export function valueAt(s: ParabolaShape, x: number): number {
  const { alpha, beta } = s.zeroes ?? NONE;
  return s.a * (x - alpha) * (x - beta) + s.lift;
}

/** y = ax² + bx + c: b = −a(α + β), c = aαβ + k. */
export function coefficientsOf(s: ParabolaShape): { a: number; b: number; c: number } {
  const { alpha, beta } = s.zeroes ?? NONE;
  return { a: s.a, b: clean(-s.a * (alpha + beta)), c: clean(s.a * alpha * beta + s.lift) };
}

/** Its vertex: midway between the zeroes, x = (α + β)/2. */
export function vertexOf(s: ParabolaShape): Point {
  const { alpha, beta } = s.zeroes ?? NONE;
  const x = (alpha + beta) / 2;
  return { x: clean(x), y: clean(valueAt(s, x)) };
}

/**
 * Where it meets the x-axis, smallest first, a touch once: y = a[(x − h)² − d²] + k is 0 where
 * (x − h)² = d² − k/a, with h midway and d half the gap. None when that is below 0.
 */
export function realZeroesOf(s: ParabolaShape): number[] {
  if (s.zeroes === null) return [];
  const { alpha, beta } = s.zeroes;
  if (Math.abs(s.lift) < EPS)
    return Math.abs(alpha - beta) < EPS ? [clean(alpha)] : [alpha, beta].sort((p, q) => p - q);
  const h = (alpha + beta) / 2;
  const d = (beta - alpha) / 2;
  const q = d * d - s.lift / s.a;
  if (Math.abs(q) < EPS) return [clean(h)];
  if (q < 0) return [];
  const r = Math.sqrt(q);
  return [clean(h - r), clean(h + r)];
}

/** A number for the screen: to two places, the book's minus sign. */
const shown = (v: number) => num(Number(v.toFixed(2)));

/** −0 and float dust read as what they are. */
function clean(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/** One term, signed: "−2x²", "+ 4x", "− 3"; the first without its plus. */
function term(c: number, power: string, isFirst: boolean): string {
  const size = Math.abs(Number(c.toFixed(2)));
  const body = power !== "" && size === 1 ? power : `${shown(size)}${power}`;
  if (isFirst) return c < 0 ? `−${body}` : body;
  return c < 0 ? `− ${body}` : `+ ${body}`;
}

/** ax² + bx + c the book's way: x² − 2x − 3, −2x² + 4x, x² − 4. */
export function expandedOf(s: ParabolaShape): string {
  const { a, b, c } = coefficientsOf(s);
  const terms = [
    [a, "x²"],
    [b, "x"],
    [c, ""],
  ] as const;
  const kept = terms.filter(([v]) => Math.abs(Number(v.toFixed(2))) > 0);
  return kept.map(([v, p], i) => term(v, p, i === 0)).join(" ");
}

/** One factor (x − z): x for 0, (x + 1) for −1. */
const factor = (z0: number) =>
  Math.abs(Number(z0.toFixed(2))) === 0 ? "x" : `(x ${z0 < 0 ? "+" : "−"} ${shown(Math.abs(z0))})`;

/**
 * a(x − α)(x − β) the book's way, smaller zero first: (x + 1)(x − 3), −2x(x − 2), (x − 1)². Null
 * when it is lifted: then it isn't held by those zeroes.
 */
export function factoredOf(s: ParabolaShape): string | null {
  if (s.zeroes === null || Math.abs(s.lift) >= EPS) return null;
  const [p, q] = [s.zeroes.alpha, s.zeroes.beta].sort((m, n) => m - n) as [number, number];
  const size = Math.abs(Number(s.a.toFixed(2)));
  const lead = `${s.a < 0 ? "−" : ""}${size === 1 ? "" : shown(size)}`;
  // Two that read the same are written as one, squared (the last moment of a slide together).
  if (shown(p) === shown(q)) return `${lead}${p === 0 ? "x²" : `${factor(p)}²`}`;
  // x first: −2x(x − 2), not −2(x − 2)x.
  const [f, g] = q === 0 ? [factor(q), factor(p)] : [factor(p), factor(q)];
  return `${lead}${f}${g}`;
}

/**
 * The stretch of x where it is in view (inside the window, up to its open end): where a trace
 * starts and stops, so the tracing point is on the plane all the way. The whole window when it
 * isn't in view at all.
 */
export function spanOf(
  s: ParabolaShape,
  w: { xMin: number; xMax: number; yMin: number; yMax: number },
): [number, number] {
  const v = vertexOf(s);
  // a(x − h)² + v reaches the edge it opens towards at (x − h)² = (edge − v)/a.
  const room = (s.a > 0 ? w.yMax - v.y : w.yMin - v.y) / s.a;
  if (s.zeroes === null || room < 0) return [w.xMin, w.xMax];
  const r = Math.sqrt(room);
  const from = Math.max(w.xMin, v.x - r);
  const to = Math.min(w.xMax, v.x + r);
  return from < to ? [from, to] : [w.xMin, w.xMax];
}

/** Whether it is on the plane: a board gave it zeroes. */
export const isParabolaOn = (s: Pick<ParabolaShape, "zeroes">) => s.zeroes !== null;

const seconds = z.number().positive().max(30);

/** What a move of the zeroes tells: where they are, and how many times it meets the axis. */
const moved = (s: ParabolaShape) => ({ ...(s.zeroes ?? NONE), zeroCount: realZeroesOf(s).length });

/**
 * A parabola, the graph of a quadratic: y = a(x − α)(x − β) + k on the plane's axes, held by its
 * zeroes. The student drags a zero and the whole curve follows; a board traces it from left to
 * right, slides its zeroes together until it touches the axis, and lifts it off.
 */
export const parabola = prop({
  type: "parabola",
  role: PropRole.Explainer,
  describe:
    "A parabola, the graph of the quadratic y = a(x − α)(x − β) + k, held by its zeroes α and β: the x-coordinates where it meets the x-axis. Its vertex is midway, at x = (α + β)/2; a > 0 opens it up, a < 0 down; when α = β it touches the axis at one point; lifted clear of the axis it has no real zeroes. The student drags a zero and the curve and its expression follow; a board traces it from left to right, slides its zeroes, and lifts it.",
  variables: z
    .object({
      /** The zeroes it is held by, or null: no parabola. */
      zeroes: zeroesSchema.nullable(),
      /** a: the coefficient of x². Never 0. */
      a: z.number().min(-10).max(10),
      /** k: the whole curve raised (or lowered) by this much; 0 holds it by its zeroes. */
      lift: z.number().min(-50).max(50),
      /** How much of it is drawn, from the left: 0 none, 1 all of it. */
      traced: z.number().min(0).max(1),
      /** A dragged zero lands on a multiple of this. */
      step: z.number().positive(),
      /** Whether the student can drag the zeroes. */
      canDrag: z.boolean(),
      /** Whether the student can turn it over. */
      canFlip: z.boolean(),
      /** A dot on it at each whole number x: its table of values. */
      showsValues: z.boolean(),
      /** Its axis of symmetry, x = (α + β)/2, dashed. */
      showsSymmetry: z.boolean(),
      /** Its expression, and its zeroes, under the plane. */
      showsExpression: z.boolean(),
    })
    .strict(),
  start: {
    zeroes: null,
    a: 1,
    lift: 0,
    traced: 1,
    step: 0.5,
    canDrag: true,
    canFlip: false,
    showsValues: true,
    showsSymmetry: false,
    showsExpression: true,
  },
  needs: z.object({ window: windowSchema }).strict(),
  facts: {
    coefficients: (me) => coefficientsOf(me),
    realZeroes: (me) => realZeroesOf(me),
    zeroCount: (me) => realZeroesOf(me).length,
    isTouching: (me) => me.zeroes !== null && realZeroesOf(me).length === 1,
    vertex: (me) => vertexOf(me),
    expanded: (me) => expandedOf(me),
    factored: (me) => factoredOf(me),
    /** The student holds a zero only while the curve is held by them (not lifted). */
    canMoveZeroes: (me) => me.canDrag && me.zeroes !== null && Math.abs(me.lift) < EPS,
  },
  actions: {
    moveAlpha: action(
      { x: z.number() },
      { from: "screen", describe: "Slide the zero α along the x-axis; the whole curve follows" },
    ),
    moveBeta: action(
      { x: z.number() },
      { from: "screen", describe: "Slide the zero β along the x-axis; the whole curve follows" },
    ),
    flip: action(
      {},
      { from: "screen", describe: "Turn it over: a and k change sign, the zeroes stay" },
    ),
    trace: action(
      { seconds },
      { describe: "Draw it from left to right, a point leaving the curve behind it" },
    ),
    moveZeroes: action(
      { alpha: z.number(), beta: z.number(), seconds },
      { describe: "Slide both zeroes to α and β together; the curve reshapes as they go" },
    ),
    lift: action(
      { to: z.number().min(-50).max(50), seconds },
      { describe: "Raise or lower the whole curve until it is lifted by `to` (k)" },
    ),
  },
  signals: {
    zeroMoved: signal({ alpha: z.number(), beta: z.number(), zeroCount: z.number().int() }),
    flipped: signal({ a: z.number() }),
    traced: signal({}),
    zeroesMoved: signal({ alpha: z.number(), beta: z.number(), zeroCount: z.number().int() }),
    lifted: signal({ lift: z.number(), zeroCount: z.number().int() }),
  },
  on: {
    moveAlpha: (me, { x }, t) => {
      const zeroes = dragged(me, "alpha", x);
      return zeroes !== null && [t.set({ zeroes }), t.tell.zeroMoved(moved({ ...me, zeroes }))];
    },
    moveBeta: (me, { x }, t) => {
      const zeroes = dragged(me, "beta", x);
      return zeroes !== null && [t.set({ zeroes }), t.tell.zeroMoved(moved({ ...me, zeroes }))];
    },
    flip: (me, _, t) => {
      if (!me.canFlip || me.zeroes === null) return;
      const a = -me.a;
      return [t.set({ a, lift: clean(-me.lift) }), t.tell.flipped({ a })];
    },
    trace: (me, { seconds: takes }, t) =>
      me.zeroes !== null && [
        t.set({ traced: 0 }),
        t.move("traced", 1, takes, { ease: Ease.Linear, atEnd: [t.tell.traced({})] }),
      ],
    moveZeroes: (me, { alpha, beta, seconds: takes }, t) => {
      if (me.zeroes === null) return;
      const to = { alpha, beta };
      return t.move("zeroes", to, takes, {
        ease: Ease.Smooth,
        atEnd: [t.tell.zeroesMoved(moved({ ...me, zeroes: to }))],
      });
    },
    lift: (me, { to, seconds: takes }, t) =>
      me.zeroes !== null &&
      t.move("lift", to, takes, {
        ease: Ease.Smooth,
        atEnd: [t.tell.lifted({ lift: to, zeroCount: realZeroesOf({ ...me, lift: to }).length })],
      }),
  },
  invariant: (s) => (s.a === 0 ? "a can't be 0: y would be a line, not a parabola" : undefined),
});

/** Where a dragged zero lands: snapped to the step, on the plane; null when it is refused. */
function dragged(
  me: {
    zeroes: Zeroes | null;
    canMoveZeroes: boolean;
    step: number;
    window: { xMin: number; xMax: number };
  },
  which: keyof Zeroes,
  x: number,
): Zeroes | null {
  if (!me.canMoveZeroes || me.zeroes === null) return null;
  const to = clean(Math.round(x / me.step) * me.step);
  if (to < me.window.xMin || to > me.window.xMax || to === me.zeroes[which]) return null;
  return { ...me.zeroes, [which]: to };
}
