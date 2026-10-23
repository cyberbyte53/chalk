import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { type Pt, clean, near } from "@chalk/prop-circles/kit";
import { z } from "zod";
import {
  type NamedPoint,
  bracketOf,
  coordTex,
  isCollinear,
  namedPoint,
  planeWindow,
  ptOf,
  snapTo,
  term,
  triangleAreaOf,
  within,
} from "./plane";

/**
 * A triangle ABC on graph paper with its area worked out from the coordinates (NCERT 7.4):
 * area = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|. The learner drags the movable vertices on
 * the grid; when the three points fall on one line the area is 0 and the prop says they are
 * collinear. With `proof` on, the learner taps through the textbook's derivation: drop
 * perpendiculars to the x-axis, add the two trapezia under the upper sides, take away the one under
 * the long side.
 */

export const AreaAction = {
  SetPoint: "setPoint",
  Nudge: "nudge",
  Next: "next",
  Back: "back",
  Again: "again",
} as const;
export const AreaSignal = {
  Changed: "changed",
  Collinear: "collinear",
  Stepped: "stepped",
} as const;
export const AreaDerived = {
  Area: "area",
  Bracket: "bracket",
  IsCollinear: "isCollinear",
  Step: "step",
} as const;
export const AreaPart = {
  Plane: "plane",
  Triangle: "triangle",
  Trapezia: "trapezia",
  Working: "working",
  Steps: "steps",
  Verdict: "verdict",
} as const;

/** How many derivation steps there are (with `proof` on). */
export const AREA_STEP_COUNT = 5;

const areaState = z
  .object({
    points: z.array(namedPoint).length(3),
    /** Names of the feet of the perpendiculars from the three vertices to the x-axis. */
    feet: z.array(z.string().min(1).max(3)).length(3),
    movable: z.array(z.number().int().min(0).max(2)).max(3),
    snap: z.number().gt(0).max(5),
    window: planeWindow,
    showCoords: z.boolean(),
    /** Write the area formula worked out. */
    showWorking: z.boolean(),
    proof: z.boolean(),
    step: z
      .number()
      .int()
      .min(0)
      .max(AREA_STEP_COUNT - 1),
  })
  .strict();
export type AreaState = z.infer<typeof areaState>;

const pts = (s: Pick<AreaState, "points">): [Pt, Pt, Pt] =>
  s.points.map(ptOf) as unknown as [Pt, Pt, Pt];

export const areaOf = (s: Pick<AreaState, "points">): number => triangleAreaOf(...pts(s));
export const bracketValueOf = (s: Pick<AreaState, "points">): number => bracketOf(...pts(s));
export const isCollinearOf = (s: Pick<AreaState, "points">): boolean => isCollinear(...pts(s));

/** Joins signed terms in TeX: [11, −16, 21] → "11 - 16 + 21". */
export function sumTex(terms: readonly number[]): string {
  return terms
    .map((v, i) => {
      const c = clean(v);
      if (i === 0) return coordTex(c);
      return c < 0 ? `- ${coordTex(-c)}` : `+ ${coordTex(c)}`;
    })
    .join(" ");
}

/** The working, one TeX line each. */
export function workingOf(s: Pick<AreaState, "points">): string[] {
  const [a, b, c] = pts(s);
  const [x1, y1] = a;
  const [x2, y2] = b;
  const [x3, y3] = c;
  const t1 = clean(x1 * (y2 - y3));
  const t2 = clean(x2 * (y3 - y1));
  const t3 = clean(x3 * (y1 - y2));
  const total = bracketValueOf(s);
  const area = areaOf(s);
  return [
    String.raw`\text{Area} = \tfrac{1}{2}\left|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)\right|`,
    String.raw`= \tfrac{1}{2}\left|${term(x1)}(${coordTex(y2)} - ${term(y3)}) + ${term(x2)}(${coordTex(y3)} - ${term(y1)}) + ${term(x3)}(${coordTex(y1)} - ${term(y2)})\right|`,
    String.raw`= \tfrac{1}{2}\left|${sumTex([t1, t2, t3])}\right| = \tfrac{1}{2}\left|${coordTex(total)}\right|`,
    String.raw`= \tfrac{1}{2} \times ${coordTex(Math.abs(total))} = ${coordTex(area)}`,
  ];
}

function changed(before: AreaState, after: AreaState): Emit[] {
  const out: Emit[] = [
    {
      signal: AreaSignal.Changed,
      payload: { area: areaOf(after), collinear: isCollinearOf(after) },
    },
  ];
  if (isCollinearOf(after) && !isCollinearOf(before))
    out.push({ signal: AreaSignal.Collinear, payload: {} });
  return out;
}

function placed(s: AreaState, i: number, x: number, y: number) {
  const [x0, x1, y0, y1] = s.window;
  const nx = within(x, x0, x1);
  const ny = within(y, y0, y1);
  const old = s.points[i] as NamedPoint;
  if (near(nx, old.x, 1e-9) && near(ny, old.y, 1e-9)) return set({});
  // Two vertices may not sit on one spot.
  if (s.points.some((p, j) => j !== i && near(p.x, nx, 1e-9) && near(p.y, ny, 1e-9)))
    return set({});
  const points = s.points.map((p, j) => (j === i ? { ...p, x: nx, y: ny } : p));
  const after = { ...s, points };
  return set({ points }, ...changed(s, after));
}

const act = actionsFor<AreaState>();
const index = z.number().int().min(0).max(2);
const stepped = (step: number) => ({ signal: AreaSignal.Stepped, payload: { step } });

export const triangleArea = defineProp({
  type: "triangleArea",
  describe:
    "A triangle on graph paper with its area found from the coordinates of its vertices, for NCERT Class 10 Ch 7.4: area = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|, worked out line by line with the numbers put in (a negative bracket is turned positive, since an area is the numerical value). The learner drags the movable vertices on the grid (or moves them with the arrow keys); when all three fall on one line the area is 0 and it says the points are collinear. With `proof` on, the learner taps through the textbook's derivation: drop perpendiculars from the vertices to the x-axis, add the two trapezia under the two upper sides, take away the trapezium under the long side, and the formula comes out.",
  state: areaState,
  defaults: {
    points: [
      { name: "A", x: 4, y: 7 },
      { name: "B", x: 2, y: 1 },
      { name: "C", x: 8, y: 3 },
    ],
    feet: ["P", "Q", "R"],
    movable: [0],
    snap: 1,
    window: [-1, 10, -1, 9],
    showCoords: true,
    showWorking: true,
    proof: false,
    step: 0,
  },
  inputs: ["showCoords", "showWorking"],
  derived: {
    [AreaDerived.Area]: { describe: "The triangle's area, in square units", compute: areaOf },
    [AreaDerived.Bracket]: {
      describe: "x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂), twice the signed area",
      compute: bracketValueOf,
    },
    [AreaDerived.IsCollinear]: {
      describe: "Whether the three vertices lie on one line (area 0)",
      compute: isCollinearOf,
    },
    [AreaDerived.Step]: { describe: "The derivation step shown", compute: (s) => s.step },
  },
  actions: {
    [AreaAction.SetPoint]: act({
      describe:
        "Put vertex i at (x, y); a learner's drag snaps to the grid and works only on a movable vertex",
      byLearner: true,
      args: z
        .object({ i: index, x: z.number(), y: z.number(), isSnapped: z.boolean().optional() })
        .strict(),
      run: (s, a) => {
        if (a.isSnapped === true) {
          if (!s.movable.includes(a.i)) return set({});
          return placed(s, a.i, snapTo(a.x, s.snap), snapTo(a.y, s.snap));
        }
        return placed(s, a.i, a.x, a.y);
      },
    }),
    [AreaAction.Nudge]: act({
      describe: "Move movable vertex i one grid step left/right (dx) and down/up (dy)",
      byLearner: true,
      args: z
        .object({
          i: index,
          dx: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
          dy: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
        })
        .strict(),
      run: (s, a) => {
        if (!s.movable.includes(a.i)) return set({});
        const p = s.points[a.i] as NamedPoint;
        return placed(s, a.i, clean(p.x + a.dx * s.snap), clean(p.y + a.dy * s.snap));
      },
    }),
    [AreaAction.Next]: act({
      describe: "Show the derivation's next step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.proof || s.step >= AREA_STEP_COUNT - 1
          ? set({})
          : set({ step: s.step + 1 }, stepped(s.step + 1)),
    }),
    [AreaAction.Back]: act({
      describe: "Go back one step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.proof || s.step === 0 ? set({}) : set({ step: s.step - 1 }, stepped(s.step - 1)),
    }),
    [AreaAction.Again]: act({
      describe: "Start the derivation again",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => (s.step === 0 ? set({}) : set({ step: 0 }, stepped(0))),
    }),
  },
});
