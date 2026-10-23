import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { type Pt, type Words, clean, near } from "@chalk/prop-circles/kit";
import { z } from "zod";
import {
  type NamedPoint,
  type PlaneWindow,
  coordTex,
  dist2,
  isCollinear,
  namedPoint,
  planeWindow,
  ptOf,
  snapTo,
  sqrtTex,
  term,
  within,
} from "./plane";

/**
 * Graph paper with up to four named points (NCERT 7.1–7.2 and the distance examples). Points the
 * lesson marks movable can be dragged (snapped to the grid) or moved with the arrow keys. The
 * picture can join the points (a segment, a closed shape or an open path), write each joined side's
 * length, and draw the right triangle under the first two points, P and Q, with the corner T level
 * with P and below Q, so PQ² = PT² + QT² (the distance formula). With `proof` on, the learner taps
 * through the textbook's derivation: drop PR and QS to the x-axis, draw PT ⟂ QS, read PT and QT off
 * the coordinates, then Pythagoras.
 */

export const PlaneJoin = {
  None: "none",
  Segment: "segment",
  Polygon: "polygon",
  Path: "path",
} as const;
export type PlaneJoin = (typeof PlaneJoin)[keyof typeof PlaneJoin];

export const PlaneAction = {
  SetPoint: "setPoint",
  Nudge: "nudge",
  Next: "next",
  Back: "back",
  Again: "again",
} as const;
export const PlaneSignal = { Changed: "changed", Stepped: "stepped" } as const;
export const PlaneDerived = {
  X0: "x0",
  Y0: "y0",
  X1: "x1",
  Y1: "y1",
  X2: "x2",
  Y2: "y2",
  X3: "x3",
  Y3: "y3",
  D2: "d2",
  Collinear: "collinear",
  Step: "step",
} as const;
export const PlanePart = {
  Plane: "plane",
  Points: "points",
  Triangle: "triangle",
  Working: "working",
  Steps: "steps",
} as const;

const planeState = z
  .object({
    points: z.array(namedPoint).min(1).max(4),
    /** Which points (by index) the learner can drag. */
    movable: z.array(z.number().int().min(0).max(3)).max(4),
    /** The grid a dragged point snaps to, in units (1, or 0.5 for half-units). */
    snap: z.number().gt(0).max(5),
    window: planeWindow,
    join: z.nativeEnum(PlaneJoin),
    /** Write each point's coordinates next to its name. */
    showCoords: z.boolean(),
    /** Name the four quadrants I to IV. */
    showQuadrants: z.boolean(),
    /** Write the length of each joined side. */
    showLengths: z.boolean(),
    /** Draw the right triangle PTQ under the first two points, with PT and QT. */
    showTriangle: z.boolean(),
    /** Write the distance formula worked out for the first two points. */
    showWorking: z.boolean(),
    /** Walk the derivation of the distance formula step by step. */
    proof: z.boolean(),
    step: z.number().int().min(0).max(4),
  })
  .strict();
export type PlaneState = z.infer<typeof planeState>;

/** The derivation's steps (with `proof` on). */
export const PROOF_STEPS: readonly Words[] = [
  {
    en: "Two points P(x₁, y₁) and Q(x₂, y₂). How far apart are they?",
    hi: "दो बिंदु P(x₁, y₁) और Q(x₂, y₂)। वे कितनी दूर हैं?",
  },
  {
    en: "Draw PR and QS perpendicular to the x-axis. Then OR = x₁ and OS = x₂.",
    hi: "x-अक्ष पर लंब PR और QS खींचो। तब OR = x₁ और OS = x₂।",
  },
  {
    en: "From P, draw PT perpendicular to QS. PTQ is a right triangle, with the right angle at T.",
    hi: "P से QS पर लंब PT खींचो। PTQ एक समकोण त्रिभुज है, जिसका समकोण T पर है।",
  },
  {
    en: "PT = RS = x₂ − x₁, and QT = SQ − ST = y₂ − y₁ (ST = PR = y₁).",
    hi: "PT = RS = x₂ − x₁, और QT = SQ − ST = y₂ − y₁ (ST = PR = y₁)।",
  },
  {
    en: "Pythagoras in ∆PTQ: PQ² = PT² + QT² = (x₂ − x₁)² + (y₂ − y₁)².",
    hi: "∆PTQ में पाइथागोरस: PQ² = PT² + QT² = (x₂ − x₁)² + (y₂ − y₁)²।",
  },
];

const pt = (s: PlaneState, i: number): Pt => {
  const p = s.points[i];
  return p === undefined ? [0, 0] : ptOf(p);
};

/** PQ²: the squared distance between the first two points (0 with one point). */
export const d2Of = (s: Pick<PlaneState, "points">): number =>
  s.points.length < 2 ? 0 : dist2(ptOf(s.points[0] as NamedPoint), ptOf(s.points[1] as NamedPoint));

/** Whether the first three points lie on one line (false with fewer than three). */
export const collinearOf = (s: Pick<PlaneState, "points">): boolean =>
  s.points.length >= 3 &&
  isCollinear(
    ptOf(s.points[0] as NamedPoint),
    ptOf(s.points[1] as NamedPoint),
    ptOf(s.points[2] as NamedPoint),
  );

/** The sides the picture joins, as pairs of point indices. */
export function sidesOf(s: Pick<PlaneState, "points" | "join">): [number, number][] {
  const n = s.points.length;
  if (s.join === PlaneJoin.None || n < 2) return [];
  if (s.join === PlaneJoin.Segment) return [[0, 1]];
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n; i++) out.push([i, i + 1]);
  if (s.join === PlaneJoin.Polygon && n >= 3) out.push([n - 1, 0]);
  return out;
}

/** The working of PQ for the first two points, one TeX line each. */
export function workingOf(s: PlaneState): string[] {
  if (s.points.length < 2) return [];
  const p = s.points[0] as NamedPoint;
  const q = s.points[1] as NamedPoint;
  const dx = clean(q.x - p.x);
  const dy = clean(q.y - p.y);
  const d2 = d2Of(s);
  const name = `${p.name}${q.name}`;
  return [
    `${name}^2 = (${coordTex(q.x)} - ${term(p.x)})^2 + (${coordTex(q.y)} - ${term(p.y)})^2`,
    `${name}^2 = ${term(dx)}^2 + ${term(dy)}^2 = ${coordTex(dx * dx)} + ${coordTex(dy * dy)} = ${coordTex(d2)}`,
    `${name} = \\sqrt{${coordTex(d2)}}${sqrtTex(d2) === `\\sqrt{${coordTex(d2)}}` ? "" : ` = ${sqrtTex(d2)}`}`,
  ];
}

function changed(s: PlaneState): Emit[] {
  return [
    {
      signal: PlaneSignal.Changed,
      payload: { points: s.points.map((p) => [p.x, p.y]), d2: d2Of(s), collinear: collinearOf(s) },
    },
  ];
}

function placed(s: PlaneState, i: number, x: number, y: number) {
  const [x0, x1, y0, y1] = s.window as PlaneWindow;
  const nx = within(x, x0, x1);
  const ny = within(y, y0, y1);
  const old = s.points[i] as NamedPoint;
  if (near(nx, old.x, 1e-9) && near(ny, old.y, 1e-9)) return set({});
  const points = s.points.map((p, j) => (j === i ? { ...p, x: nx, y: ny } : p));
  return set({ points }, ...changed({ ...s, points }));
}

const act = actionsFor<PlaneState>();
const index = z.number().int().min(0).max(3);

export const coordinatePlane = defineProp({
  type: "coordinatePlane",
  describe:
    "Graph paper with the x- and y-axes, the origin O and up to four named points, for NCERT Class 10 Ch 7 (7.1 and 7.2). The lesson chooses which points the learner can drag; they snap to the grid and can also be moved with the arrow keys. The picture can write each point's coordinates, join the points (a segment PQ, a closed shape or an open path) and write each joined side's length as a surd (√8 = 2√2). For the distance formula it draws the right triangle PTQ under the first two points (T level with P and directly below or above Q, so PT = |x₂ − x₁| and QT = |y₂ − y₁|) and writes PQ² = (x₂ − x₁)² + (y₂ − y₁)² worked out with their numbers. With `proof` on, the learner taps Next through the textbook's derivation: PR and QS perpendicular to the x-axis, PT perpendicular to QS, PT and QT from the coordinates, then Pythagoras.",
  state: planeState,
  defaults: {
    points: [
      { name: "P", x: 4, y: 6 },
      { name: "Q", x: 6, y: 8 },
    ],
    movable: [1],
    snap: 1,
    window: [-2, 10, -2, 10],
    join: PlaneJoin.Segment,
    showCoords: true,
    showQuadrants: false,
    showLengths: false,
    showTriangle: true,
    showWorking: true,
    proof: false,
    step: 0,
  },
  invariant: (s) =>
    s.movable.every((i) => i < s.points.length) ? undefined : "a movable index has no point",
  inputs: ["showCoords", "showLengths", "showTriangle", "showWorking", "join"],
  derived: {
    [PlaneDerived.X0]: { describe: "The first point's x-coordinate", compute: (s) => pt(s, 0)[0] },
    [PlaneDerived.Y0]: { describe: "The first point's y-coordinate", compute: (s) => pt(s, 0)[1] },
    [PlaneDerived.X1]: { describe: "The second point's x-coordinate", compute: (s) => pt(s, 1)[0] },
    [PlaneDerived.Y1]: { describe: "The second point's y-coordinate", compute: (s) => pt(s, 1)[1] },
    [PlaneDerived.X2]: { describe: "The third point's x-coordinate", compute: (s) => pt(s, 2)[0] },
    [PlaneDerived.Y2]: { describe: "The third point's y-coordinate", compute: (s) => pt(s, 2)[1] },
    [PlaneDerived.X3]: { describe: "The fourth point's x-coordinate", compute: (s) => pt(s, 3)[0] },
    [PlaneDerived.Y3]: { describe: "The fourth point's y-coordinate", compute: (s) => pt(s, 3)[1] },
    [PlaneDerived.D2]: {
      describe: "PQ², the square of the distance between the first two points",
      compute: d2Of,
    },
    [PlaneDerived.Collinear]: {
      describe: "Whether the first three points lie on one straight line",
      compute: collinearOf,
    },
    [PlaneDerived.Step]: { describe: "The derivation step shown (0–4)", compute: (s) => s.step },
  },
  actions: {
    [PlaneAction.SetPoint]: act({
      describe:
        "Put point i at (x, y); a learner's drag snaps to the grid and works only on a movable point",
      byLearner: true,
      args: z
        .object({ i: index, x: z.number(), y: z.number(), isSnapped: z.boolean().optional() })
        .strict(),
      run: (s, a) => {
        if (a.i >= s.points.length) return set({});
        if (a.isSnapped === true) {
          if (!s.movable.includes(a.i)) return set({});
          return placed(s, a.i, snapTo(a.x, s.snap), snapTo(a.y, s.snap));
        }
        return placed(s, a.i, a.x, a.y);
      },
    }),
    [PlaneAction.Nudge]: act({
      describe: "Move movable point i one grid step left/right (dx) and down/up (dy)",
      byLearner: true,
      args: z
        .object({
          i: index,
          dx: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
          dy: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
        })
        .strict(),
      run: (s, a) => {
        if (a.i >= s.points.length || !s.movable.includes(a.i)) return set({});
        const p = s.points[a.i] as NamedPoint;
        return placed(s, a.i, clean(p.x + a.dx * s.snap), clean(p.y + a.dy * s.snap));
      },
    }),
    [PlaneAction.Next]: act({
      describe: "Show the derivation's next step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.proof || s.step >= PROOF_STEPS.length - 1
          ? set({})
          : set(
              { step: s.step + 1 },
              { signal: PlaneSignal.Stepped, payload: { step: s.step + 1 } },
            ),
    }),
    [PlaneAction.Back]: act({
      describe: "Go back one step in the derivation",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.proof || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: PlaneSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [PlaneAction.Again]: act({
      describe: "Start the derivation again",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: PlaneSignal.Stepped, payload: { step: 0 } }),
    }),
  },
});
