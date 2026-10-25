import { type Emit, FrameKind, actionsFor, defineHost, defineLayer, set } from "@chalk/prop";
import { type GridState, planeCore, planePixels, windowOf } from "@chalk/prop-blocks/plane";
import { type Pt, type Words, clean, near } from "@chalk/prop-circles/kit";
import { z } from "zod";
import {
  type NamedPoint,
  coordTex,
  coordText,
  dist2,
  isCollinear,
  namedPoint,
  pairText,
  ptOf,
  snapTo,
  sqrtTex,
  sqrtText,
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
  PointPrefix: "point:",
  SidePrefix: "side:",
  Collinear: "collinear",
  Triangle: "triangle",
  Working: "working",
  Steps: "steps",
} as const;

/** The whole state: the graph paper's fields and every layer's, side by side. */
export type PlaneState = GridState & {
  points: NamedPoint[];
  movable: number[];
  snap: number;
  showCoords: boolean;
  join: PlaneJoin;
  showLengths: boolean;
  showTriangle: boolean;
  showWorking: boolean;
  proof: boolean;
  step: number;
};

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

const pt = (s: Pick<PlaneState, "points">, i: number): Pt => {
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
export function workingOf(s: Pick<PlaneState, "points">): string[] {
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

function changed(s: Pick<PlaneState, "points">): Emit[] {
  return [
    {
      signal: PlaneSignal.Changed,
      payload: { points: s.points.map((p) => [p.x, p.y]), d2: d2Of(s), collinear: collinearOf(s) },
    },
  ];
}

function placed(s: PointsState, i: number, x: number, y: number) {
  const [x0, x1, y0, y1] = s.window;
  const nx = within(x, x0, x1);
  const ny = within(y, y0, y1);
  const old = s.points[i] as NamedPoint;
  if (near(nx, old.x, 1e-9) && near(ny, old.y, 1e-9)) return set({});
  const points = s.points.map((p, j) => (j === i ? { ...p, x: nx, y: ny } : p));
  return set({ points }, ...changed({ points }));
}

const index = z.number().int().min(0).max(3);

// ---- layers on the plane ----

export type PointsState = GridState & {
  points: NamedPoint[];
  movable: number[];
  snap: number;
  showCoords: boolean;
};
const onPoints = actionsFor<PointsState>();
const pointId = (p: NamedPoint) => `${PlanePart.PointPrefix}${p.name}`;

/** Up to four named points; the movable ones are dragged (snapped) or moved with the arrow keys. */
export const points = defineLayer({
  name: "points",
  frame: FrameKind.Plane,
  describe:
    "Up to four named points; the lesson says which the learner can drag (they snap to the grid) or move with the arrow keys.",
  fields: {
    points: z.array(namedPoint).min(1).max(4),
    /** Which points (by index) the learner can drag. */
    movable: z.array(z.number().int().min(0).max(3)).max(4),
    /** The grid a dragged point snaps to, in units (1, or 0.5 for half-units). */
    snap: z.number().gt(0).max(5),
    /** Write each point's coordinates next to its name. */
    showCoords: z.boolean(),
  },
  defaults: {
    points: [
      { name: "P", x: 4, y: 6 },
      { name: "Q", x: 6, y: 8 },
    ],
    movable: [1],
    snap: 1,
    showCoords: true,
  },
  inputs: ["showCoords"],
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
  },
  actions: {
    [PlaneAction.SetPoint]: onPoints({
      describe:
        "Put point i at (x, y); a learner's drag snaps to the grid and works only on a movable point",
      byLearner: true,
      args: z
        .object({ i: index, x: z.number(), y: z.number(), isSnapped: z.boolean().optional() })
        .strict(),
      changes: ["points"],
      run: (s, a) => {
        if (a.i >= s.points.length) return set({});
        if (a.isSnapped === true) {
          if (!s.movable.includes(a.i)) return set({});
          return placed(s, a.i, snapTo(a.x, s.snap), snapTo(a.y, s.snap));
        }
        return placed(s, a.i, a.x, a.y);
      },
    }),
    [PlaneAction.Nudge]: onPoints({
      describe: "Move movable point i one grid step left/right (dx) and down/up (dy)",
      byLearner: true,
      args: z
        .object({
          i: index,
          dx: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
          dy: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
        })
        .strict(),
      changes: ["points"],
      run: (s, a) => {
        if (a.i >= s.points.length || !s.movable.includes(a.i)) return set({});
        const p = s.points[a.i] as NamedPoint;
        return placed(s, a.i, clean(p.x + a.dx * s.snap), clean(p.y + a.dy * s.snap));
      },
    }),
  },
  signals: {
    [PlaneSignal.Changed]: {
      describe:
        "A point moved: every point's coordinates, PQ² and whether the first three are collinear",
    },
  },
  observe: (s: PointsState) => ({
    elements: s.points.map((p, i) => ({
      id: pointId(p),
      value: { x: p.x, y: p.y },
      words: s.showCoords ? `${p.name}${pairText(ptOf(p))}` : p.name,
      ...(s.movable.includes(i) ? { does: PlaneAction.SetPoint } : {}),
    })),
    summary: s.points.map((p) => `${p.name}${pairText(ptOf(p))}`).join(", "),
  }),
  locate: (s, part, at) => {
    const p = s.points.find((q) => pointId(q) === part);
    if (p === undefined) return undefined;
    const [x, y] = at.toPx(p.x, p.y);
    return { x: x - 14, y: y - 14, width: 28, height: 28 };
  },
  invariant: (s) =>
    s.movable.every((i) => i < s.points.length) ? undefined : "a movable index has no point",
});

export type JoinState = PointsState & { join: PlaneJoin; showLengths: boolean };

/** Lines joining the points (a segment, a closed shape or an open path), each side's length. */
export const joins = defineLayer({
  name: "joins",
  frame: FrameKind.Plane,
  describe:
    "Joins the points (a segment PQ, a closed shape or an open path) and can write each joined side's length as a surd (√8 = 2√2).",
  needs: ["points"],
  fields: { join: z.nativeEnum(PlaneJoin), showLengths: z.boolean() },
  defaults: { join: PlaneJoin.Segment, showLengths: false },
  inputs: ["join", "showLengths"],
  actions: {},
  observe: (s: JoinState) => {
    const elements = sidesOf(s).map(([i, j]) => {
      const p = s.points[i] as NamedPoint;
      const q = s.points[j] as NamedPoint;
      const d2 = dist2(ptOf(p), ptOf(q));
      return {
        id: `${PlanePart.SidePrefix}${p.name}${q.name}`,
        value: s.showLengths ? Math.sqrt(d2) : null,
        words: s.showLengths ? `${p.name}${q.name} = ${sqrtText(d2)}` : `${p.name}${q.name}`,
      };
    });
    if (s.points.length >= 3 && s.join !== PlaneJoin.None && s.showLengths && collinearOf(s))
      elements.push({
        id: PlanePart.Collinear,
        value: null,
        words: "The three points lie on one line",
      });
    return { elements };
  },
});

export type TriangleState = PointsState & { showTriangle: boolean } & ProofState;

/** The right triangle PTQ under the first two points: PT = |x₂ − x₁| and QT = |y₂ − y₁|. */
export const rightTriangle = defineLayer({
  name: "rightTriangle",
  frame: FrameKind.Plane,
  describe:
    "The right triangle PTQ under the first two points, T level with P and directly below or above Q, so PT = |x₂ − x₁| and QT = |y₂ − y₁|.",
  needs: ["points", "proof"],
  fields: { showTriangle: z.boolean() },
  defaults: { showTriangle: true },
  inputs: ["showTriangle"],
  actions: {},
  observe: (s: TriangleState) => {
    const step = s.proof ? s.step : PROOF_STEPS.length - 1;
    const isDrawn = s.points.length >= 2 && (s.showTriangle || s.proof) && step >= 2;
    const P = pt(s, 0);
    const Q = pt(s, 1);
    if (!isDrawn || near(P[0], Q[0], 1e-9) || near(P[1], Q[1], 1e-9)) return { elements: [] };
    return {
      elements: [
        {
          id: PlanePart.Triangle,
          value: { T: { x: Q[0], y: P[1] } },
          ...(step >= 3
            ? {
                words: `PT = ${coordText(Math.abs(Q[0] - P[0]))}, QT = ${coordText(Math.abs(Q[1] - P[1]))}`,
              }
            : { words: "right triangle PTQ" }),
        },
      ],
    };
  },
});

export type WorkingState = PointsState & { showWorking: boolean } & ProofState;

export const working = defineLayer({
  name: "working",
  frame: FrameKind.Plane,
  describe: "PQ² = (x₂ − x₁)² + (y₂ − y₁)² worked out with the first two points' numbers.",
  needs: ["points", "proof"],
  fields: { showWorking: z.boolean() },
  defaults: { showWorking: true },
  inputs: ["showWorking"],
  actions: {},
  observe: (s: WorkingState) => {
    const lines =
      s.showWorking && s.points.length >= 2 && (!s.proof || s.step >= 4)
        ? workingOf(s as PlaneState)
        : [];
    return lines.length === 0
      ? { elements: [] }
      : { elements: [{ id: PlanePart.Working, value: lines }] };
  },
});

export type ProofState = { proof: boolean; step: number };
const onProof = actionsFor<ProofState>();

/** The textbook's derivation of the distance formula, a step at a time. */
export const proof = defineLayer({
  name: "proof",
  frame: FrameKind.Plane,
  describe:
    "The learner taps Next through the textbook's derivation: PR and QS perpendicular to the x-axis, PT perpendicular to QS, PT and QT from the coordinates, then Pythagoras.",
  fields: { proof: z.boolean(), step: z.number().int().min(0).max(4) },
  defaults: { proof: false, step: 0 },
  derived: {
    [PlaneDerived.Step]: { describe: "The derivation step shown (0–4)", compute: (s) => s.step },
  },
  actions: {
    [PlaneAction.Next]: onProof({
      describe: "Show the derivation's next step",
      byLearner: true,
      args: z.object({}).strict(),
      changes: ["step"],
      run: (s) =>
        !s.proof || s.step >= PROOF_STEPS.length - 1
          ? set({})
          : set(
              { step: s.step + 1 },
              { signal: PlaneSignal.Stepped, payload: { step: s.step + 1 } },
            ),
    }),
    [PlaneAction.Back]: onProof({
      describe: "Go back one step in the derivation",
      byLearner: true,
      args: z.object({}).strict(),
      changes: ["step"],
      run: (s) =>
        !s.proof || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: PlaneSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [PlaneAction.Again]: onProof({
      describe: "Start the derivation again",
      byLearner: true,
      args: z.object({}).strict(),
      changes: ["step"],
      run: (s) =>
        s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: PlaneSignal.Stepped, payload: { step: 0 } }),
    }),
  },
  signals: { [PlaneSignal.Stepped]: { describe: "The derivation moved to `step`" } },
  observe: (s: ProofState) =>
    s.proof
      ? {
          elements: [
            {
              id: PlanePart.Steps,
              value: s.step,
              words: (PROOF_STEPS[s.step] as Words).en,
              // The step bar: Next until the last step, Back and Again after the first.
              does: [
                ...(s.step < PROOF_STEPS.length - 1 ? [PlaneAction.Next] : []),
                ...(s.step > 0 ? [PlaneAction.Back, PlaneAction.Again] : []),
              ],
            },
          ],
          summary: `the derivation at step ${s.step + 1} of ${PROOF_STEPS.length}`,
        }
      : { elements: [] },
});

export const coordinatePlane = defineHost({
  type: "coordinatePlane",
  describe:
    "Graph paper with the x- and y-axes, the origin O and up to four named points, for NCERT Class 10 Ch 7 (7.1 and 7.2). The lesson chooses which points the learner can drag; they snap to the grid and can also be moved with the arrow keys. The picture can write each point's coordinates, join the points (a segment PQ, a closed shape or an open path) and write each joined side's length as a surd (√8 = 2√2). For the distance formula it draws the right triangle PTQ under the first two points (T level with P and directly below or above Q, so PT = |x₂ − x₁| and QT = |y₂ − y₁|) and writes PQ² = (x₂ − x₁)² + (y₂ − y₁)² worked out with their numbers. With `proof` on, the learner taps Next through the textbook's derivation: PR and QS perpendicular to the x-axis, PT perpendicular to QS, PT and QT from the coordinates, then Pythagoras.",
  frame: FrameKind.Plane,
  core: planeCore,
  layers: [points, joins, rightTriangle, working, proof],
  window: windowOf,
  pixels: planePixels,
});
