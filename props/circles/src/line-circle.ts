import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Pt, add, clean, dist, lineCircle, near, scale, unit } from "./kit/geometry";

/**
 * A circle with centre O and radius r, and a line: how a line can sit with respect to a circle
 * (NCERT 10.1–10.2, Fig 10.1, Activities 1–2, Theorem 10.1).
 * - slide: the line keeps its direction and slides across the circle (Activity 2): no common point,
 *   two (a secant, cutting a chord) or exactly one (a tangent) when it is r from the centre.
 * - rotate: the line turns about a point P on the circle (Activity 1): it cuts the circle again at
 *   Q, and Q runs into P at exactly one position, the tangent at P.
 * - shortest: the tangent XY at P stays put and a point Q slides along it (Theorem 10.1's proof):
 *   OQ is longer than the radius OP for every Q except P itself, so OP is the shortest distance
 *   from O to the line, and OP ⊥ XY.
 * Lengths are in cm. The circle's centre is the origin; P is the lowest point of the circle.
 */

export const LineCircleMode = { Slide: "slide", Rotate: "rotate", Shortest: "shortest" } as const;
export type LineCircleMode = (typeof LineCircleMode)[keyof typeof LineCircleMode];

/** How the line sits: no common point, cuts in two points, or touches at one. */
export const LineKind = {
  NonIntersecting: "nonIntersecting",
  Secant: "secant",
  Tangent: "tangent",
} as const;
export type LineKind = (typeof LineKind)[keyof typeof LineKind];

export const LineCircleAction = { Move: "move", Set: "set", SetMode: "setMode" } as const;
export const LineCircleSignal = { Changed: "changed", Touched: "touched" } as const;
export const LineCircleDerived = {
  Kind: "kind",
  CommonPoints: "commonPoints",
  Distance: "distance",
  Chord: "chord",
  IsTangent: "isTangent",
  OQ: "oq",
} as const;
export const LineCirclePart = {
  Circle: "circle",
  Line: "line",
  Kind: "kind",
  Readout: "readout",
  Move: "move",
} as const;

const lineCircleState = z
  .object({
    mode: z.nativeEnum(LineCircleMode),
    /** The radius in cm. */
    r: z.number().min(1).max(20),
    /** slide: the line's signed distance from O in cm (positive below O, towards P's side). */
    offset: z.number().min(-40).max(40),
    /** rotate: the line's turn about P in degrees; 0 is the tangent at P. */
    turn: z.number().min(-80).max(80),
    /** shortest: Q's place along the tangent, in cm from P (0 is P itself). */
    along: z.number().min(-40).max(40),
    /** How far one tap slides the line (slide) or moves Q (shortest), in cm. */
    step: z.number().gt(0).max(10),
    /** How far one tap turns the line (rotate), in degrees. */
    turnStep: z.number().gt(0).max(45),
    /** Names of the centre, P, Q and the line's ends: [O, P, Q, X, Y]. */
    names: z.array(z.string().min(1).max(3)).length(5),
    canMove: z.boolean(),
    /** Say what kind of line it is (non-intersecting, secant, tangent) and how many common points. */
    showKind: z.boolean(),
    /** When the line touches, draw the radius to the point of contact with its right-angle mark. */
    showRadius: z.boolean(),
    /** Write the chord's length when the line is a secant. */
    showChord: z.boolean(),
  })
  .strict();
export type LineCircleState = z.infer<typeof lineCircleState>;

const O: Pt = [0, 0];

/** P, the point the line turns about (rotate) or touches (shortest): the lowest point. */
export const pivotOf = (s: Pick<LineCircleState, "r">): Pt => [0, -s.r];

/** A point on the line and its direction, in model cm. */
export function lineOf(s: Pick<LineCircleState, "mode" | "r" | "offset" | "turn">): {
  p: Pt;
  u: Pt;
} {
  if (s.mode === LineCircleMode.Slide) return { p: [0, -s.offset], u: [1, 0] };
  if (s.mode === LineCircleMode.Rotate) return { p: pivotOf(s), u: unit(s.turn) };
  return { p: pivotOf(s), u: [1, 0] };
}

/** The distance from O to the line. */
export function distanceOf(s: Pick<LineCircleState, "mode" | "r" | "offset" | "turn">): number {
  if (s.mode === LineCircleMode.Slide) return clean(Math.abs(s.offset));
  if (s.mode === LineCircleMode.Rotate)
    return clean(s.r * Math.abs(Math.cos((s.turn * Math.PI) / 180)));
  return s.r;
}

/** The points the line and the circle share. */
export function commonPointsOf(s: Pick<LineCircleState, "mode" | "r" | "offset" | "turn">): Pt[] {
  const { p, u } = lineOf(s);
  if (s.mode !== LineCircleMode.Slide) {
    // The line passes through P exactly; the other point is where it leaves the circle.
    const pts = lineCircle(p, u, O, s.r, 1e-7);
    if (pts.length < 2 || near(dist(pts[0] as Pt, pts[1] as Pt), 0, 1e-7)) return [pivotOf(s)];
    const other = dist(pts[0] as Pt, p) > dist(pts[1] as Pt, p) ? pts[0] : pts[1];
    return [pivotOf(s), other as Pt];
  }
  return lineCircle(p, u, O, s.r, 1e-7);
}

export function kindOf(s: Pick<LineCircleState, "mode" | "r" | "offset" | "turn">): LineKind {
  const n = commonPointsOf(s).length;
  return n === 0 ? LineKind.NonIntersecting : n === 1 ? LineKind.Tangent : LineKind.Secant;
}

/** The chord the line cuts off (0 if it only touches or misses). */
export function chordOf(s: Pick<LineCircleState, "mode" | "r" | "offset" | "turn">): number {
  const pts = commonPointsOf(s);
  return pts.length === 2 ? clean(dist(pts[0] as Pt, pts[1] as Pt)) : 0;
}

/** Q on the tangent (shortest mode). */
export const qOf = (s: Pick<LineCircleState, "r" | "along">): Pt =>
  add(pivotOf(s), scale([1, 0], s.along));

/** OQ: from the centre to Q on the tangent. */
export const oqOf = (s: Pick<LineCircleState, "r" | "along">): number => clean(dist(O, qOf(s)));

/** The value a tap changes, and its limits. */
function limitsOf(s: LineCircleState): {
  key: "offset" | "turn" | "along";
  lo: number;
  hi: number;
} {
  if (s.mode === LineCircleMode.Slide) return { key: "offset", lo: -1.75 * s.r, hi: 1.75 * s.r };
  if (s.mode === LineCircleMode.Rotate) return { key: "turn", lo: -75, hi: 75 };
  return { key: "along", lo: -1.75 * s.r, hi: 1.75 * s.r };
}

function changed(before: LineCircleState, after: LineCircleState): Emit[] {
  const kind = kindOf(after);
  const out: Emit[] = [
    {
      signal: LineCircleSignal.Changed,
      payload: { kind, points: commonPointsOf(after).length, distance: distanceOf(after) },
    },
  ];
  if (
    after.mode !== LineCircleMode.Shortest &&
    kind === LineKind.Tangent &&
    kindOf(before) !== LineKind.Tangent
  )
    out.push({ signal: LineCircleSignal.Touched, payload: { distance: distanceOf(after) } });
  return out;
}

const act = actionsFor<LineCircleState>();

export const lineAndCircle = defineProp({
  type: "lineCircle",
  describe:
    "A circle with centre O and a straight line, for NCERT 10.1–10.2 (tangents to a circle). In slide mode the line keeps its direction and slides across: it has no common point with the circle (a non-intersecting line), two (a secant) or exactly one (a tangent) when its distance from O equals the radius; there are at most two tangents parallel to a given line. In rotate mode the line turns about a point P on the circle and cuts it again at Q; as it turns, Q runs into P and the line becomes the tangent at P, the only one there. In shortest mode the tangent at P stays and a point Q slides along it: OQ is always longer than the radius OP except at P, so OP is the shortest distance and the tangent is perpendicular to the radius (Theorem 10.1). Can show the radius to the point of contact with a right-angle mark and the chord's length.",
  state: lineCircleState,
  defaults: {
    mode: LineCircleMode.Slide,
    r: 3,
    offset: 4.5,
    turn: 45,
    along: 3,
    step: 0.75,
    turnStep: 15,
    names: ["O", "P", "Q", "X", "Y"],
    canMove: true,
    showKind: true,
    showRadius: false,
    showChord: false,
  },
  inputs: ["canMove", "showKind", "showRadius", "showChord"],
  invariant: (s) => {
    const { key, lo, hi } = limitsOf(s);
    const v = s[key];
    if (v < lo - 1e-9 || v > hi + 1e-9) return `${key} must stay between ${lo} and ${hi}`;
    return undefined;
  },
  derived: {
    [LineCircleDerived.Kind]: {
      describe: "How the line sits: nonIntersecting (no common point), secant (two), tangent (one)",
      compute: kindOf,
    },
    [LineCircleDerived.CommonPoints]: {
      describe: "How many points the line and the circle have in common (0, 1 or 2)",
      compute: (s) => commonPointsOf(s).length,
    },
    [LineCircleDerived.Distance]: {
      describe: "The distance from the centre O to the line, in cm",
      compute: distanceOf,
    },
    [LineCircleDerived.Chord]: {
      describe: "The length of the chord the line cuts off, in cm (0 unless it is a secant)",
      compute: chordOf,
    },
    [LineCircleDerived.IsTangent]: {
      describe: "Whether the line is a tangent (exactly one common point)",
      compute: (s) => kindOf(s) === LineKind.Tangent,
    },
    [LineCircleDerived.OQ]: {
      describe: "Shortest mode: the length OQ from the centre to Q on the tangent, in cm",
      compute: oqOf,
    },
  },
  actions: {
    [LineCircleAction.Move]: act({
      describe:
        "Move the line one step (slide: towards the bottom with by: 1, the top with by: −1; rotate: turn it anticlockwise by: 1 or clockwise by: −1), or, in shortest mode, slide Q along the tangent",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canMove) return set({});
        const { key, lo, hi } = limitsOf(s);
        const stepped = clean(
          s[key] + a.by * (s.mode === LineCircleMode.Rotate ? s.turnStep : s.step),
        );
        const value = Math.min(hi, Math.max(lo, stepped));
        if (near(value, s[key], 1e-9)) return set({});
        const next = { ...s, [key]: value };
        return set({ [key]: value }, ...changed(s, next));
      },
    }),
    [LineCircleAction.Set]: act({
      describe:
        "Put the line at a place: its distance from O in cm (slide), its turn in degrees (rotate), or Q's place along the tangent in cm (shortest)",
      args: z.object({ value: z.number() }).strict(),
      run: (s, a) => {
        const { key, lo, hi } = limitsOf(s);
        const value = clean(Math.min(hi, Math.max(lo, a.value)));
        const next = { ...s, [key]: value };
        return set({ [key]: value }, ...changed(s, next));
      },
    }),
    [LineCircleAction.SetMode]: act({
      describe:
        "Show sliding lines, a line turning about P, or a point Q sliding along the tangent",
      args: z.object({ mode: z.nativeEnum(LineCircleMode) }).strict(),
      run: (_s, a) => set({ mode: a.mode }),
    }),
  },
});
