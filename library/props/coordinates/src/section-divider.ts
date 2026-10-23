import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { type Pt, clean, near } from "@chalk/prop-circles/kit";
import { z } from "zod";
import { coordTex, divide, planeWindow, ratioNear, snapTo, term, within } from "./plane";

/**
 * A segment AB on graph paper and the point P that divides it internally in the ratio m : n, so
 * AP : PB = m : n (NCERT 7.3, the section formula). The learner drags P along AB (it settles on the
 * nearest whole-number ratio) or nudges m and n; the ends can be movable too. It can mark AB in
 * m + n equal parts, draw the two similar right triangles of the derivation (∆PAQ ~ ∆BPC by AA,
 * with AQ and PC level and QP and CB upright), and write x = (m x₂ + n x₁)/(m + n) and the same
 * for y, worked out. At m = n, P is the mid-point.
 */

export const SectionAction = {
  SetRatio: "setRatio",
  NudgeM: "nudgeM",
  NudgeN: "nudgeN",
  SetAlong: "setAlong",
  SetEnd: "setEnd",
} as const;
export const SectionSignal = { Changed: "changed", Midpoint: "midpoint" } as const;
export const SectionDerived = {
  M: "m",
  N: "n",
  X: "x",
  Y: "y",
  IsMidpoint: "isMidpoint",
} as const;
export const SectionPart = {
  Plane: "plane",
  Segment: "segment",
  Point: "point",
  Triangles: "triangles",
  Ratio: "ratio",
  Working: "working",
} as const;

const pt = z.tuple([z.number().min(-60).max(60), z.number().min(-60).max(60)]);
const sectionState = z
  .object({
    a: pt,
    b: pt,
    /** Names of the ends and the dividing point: [A, B, P]. */
    names: z.array(z.string().min(1).max(3)).length(3),
    m: z.number().int().min(1).max(12),
    n: z.number().int().min(1).max(12),
    /** The most parts (m + n) a drag of P settles on. */
    maxParts: z.number().int().min(2).max(12),
    /** The learner can change the ratio (drag P, nudge m and n). */
    canRatio: z.boolean(),
    /** The learner can drag A and B (snapped to the grid). */
    canMove: z.boolean(),
    window: planeWindow,
    showCoords: z.boolean(),
    /** Mark AB in m + n equal parts. */
    showParts: z.boolean(),
    /** Draw ∆PAQ and ∆BPC, the similar triangles of the derivation. */
    showSimilar: z.boolean(),
    /** Write the section formula worked out. */
    showWorking: z.boolean(),
  })
  .strict();
export type SectionState = z.infer<typeof sectionState>;

/** P, the point dividing AB in m : n. */
export const pointOf = (s: Pick<SectionState, "a" | "b" | "m" | "n">): Pt =>
  divide(s.a as Pt, s.b as Pt, s.m, s.n);

export const isMidpointOf = (s: Pick<SectionState, "m" | "n">): boolean => s.m === s.n;

/** The working, one TeX line each: the formula for x and y with the numbers put in. */
export function workingOf(s: SectionState): string[] {
  const [x1, y1] = s.a;
  const [x2, y2] = s.b;
  const { m, n } = s;
  const [x, y] = pointOf(s);
  const line = (c: string, v1: number, v2: number, v: number) =>
    `${c} = \\frac{${m} \\times ${term(v2)} + ${n} \\times ${term(v1)}}{${m} + ${n}} = \\frac{${coordTex(clean(m * v2 + n * v1))}}{${m + n}} = ${coordTex(v)}`;
  return [line("x", x1, x2, x), line("y", y1, y2, y)];
}

function changed(before: SectionState, after: SectionState): Emit[] {
  const p = pointOf(after);
  const out: Emit[] = [
    { signal: SectionSignal.Changed, payload: { m: after.m, n: after.n, x: p[0], y: p[1] } },
  ];
  if (isMidpointOf(after) && !isMidpointOf(before))
    out.push({ signal: SectionSignal.Midpoint, payload: { x: p[0], y: p[1] } });
  return out;
}

function withRatio(s: SectionState, m: number, n: number) {
  if (m === s.m && n === s.n) return set({});
  const after = { ...s, m, n };
  return set({ m, n }, ...changed(s, after));
}

const act = actionsFor<SectionState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const sectionDivider = defineProp({
  type: "sectionDivider",
  describe:
    "A segment AB on graph paper and the point P dividing it internally in the ratio m : n (AP : PB = m : n), for NCERT Class 10 Ch 7.3 (the section formula). The learner drags P along AB, where it settles on the nearest whole-number ratio, or nudges m and n with − and + buttons; the lesson can also let them drag A and B on the grid. It can mark AB in m + n equal parts, draw the derivation's two similar right triangles (∆PAQ ~ ∆BPC by AA: AQ and PC level, QP and CB upright, so (x − x₁)/(x₂ − x) = m/n) and write x = (m x₂ + n x₁)/(m + n), y = (m y₂ + n y₁)/(m + n) worked out with the numbers. At m = n, P is the mid-point ((x₁ + x₂)/2, (y₁ + y₂)/2); 1 : 2 and 2 : 1 are the points of trisection.",
  state: sectionState,
  defaults: {
    a: [0, 0],
    b: [36, 15],
    names: ["A", "B", "P"],
    m: 1,
    n: 2,
    maxParts: 8,
    canRatio: true,
    canMove: false,
    window: [-2, 38, -2, 18],
    showCoords: true,
    showParts: false,
    showSimilar: false,
    showWorking: true,
  },
  inputs: ["showCoords", "showParts", "showSimilar", "showWorking", "canRatio", "canMove"],
  derived: {
    [SectionDerived.M]: { describe: "m, P's share from A (AP : PB = m : n)", compute: (s) => s.m },
    [SectionDerived.N]: { describe: "n, P's share from B", compute: (s) => s.n },
    [SectionDerived.X]: { describe: "P's x-coordinate", compute: (s) => pointOf(s)[0] },
    [SectionDerived.Y]: { describe: "P's y-coordinate", compute: (s) => pointOf(s)[1] },
    [SectionDerived.IsMidpoint]: {
      describe: "Whether P is the mid-point of AB (m = n)",
      compute: isMidpointOf,
    },
  },
  actions: {
    [SectionAction.SetRatio]: act({
      describe: "Set the ratio m : n (whole numbers 1 to 12)",
      args: z
        .object({ m: z.number().int().min(1).max(12), n: z.number().int().min(1).max(12) })
        .strict(),
      run: (s, a) => withRatio(s, a.m, a.n),
    }),
    [SectionAction.NudgeM]: act({
      describe: "Make m one more or one less",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => (s.canRatio ? withRatio(s, within(s.m + a.by, 1, 12), s.n) : set({})),
    }),
    [SectionAction.NudgeN]: act({
      describe: "Make n one more or one less",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => (s.canRatio ? withRatio(s, s.m, within(s.n + a.by, 1, 12)) : set({})),
    }),
    [SectionAction.SetAlong]: act({
      describe:
        "Drag P to a fraction t of the way from A to B; it settles on the nearest whole ratio with m + n ≤ maxParts",
      byLearner: true,
      args: z.object({ t: z.number() }).strict(),
      run: (s, a) => {
        if (!s.canRatio) return set({});
        const [m, n] = ratioNear(within(a.t, 0, 1), s.maxParts);
        return withRatio(s, m, n);
      },
    }),
    [SectionAction.SetEnd]: act({
      describe: "Move end A or B to (x, y), snapped to the grid, when the ends are movable",
      byLearner: true,
      args: z.object({ end: z.enum(["a", "b"]), x: z.number(), y: z.number() }).strict(),
      run: (s, a) => {
        if (!s.canMove) return set({});
        const [x0, x1, y0, y1] = s.window;
        const p: [number, number] = [
          within(snapTo(a.x, 1), x0, x1),
          within(snapTo(a.y, 1), y0, y1),
        ];
        const other = a.end === "a" ? s.b : s.a;
        const old = a.end === "a" ? s.a : s.b;
        if ((near(p[0], old[0]) && near(p[1], old[1])) || (p[0] === other[0] && p[1] === other[1]))
          return set({});
        const after = { ...s, [a.end]: p };
        return set({ [a.end]: p }, ...changed(s, after));
      },
    }),
  },
});
