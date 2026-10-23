import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Pt, angleAt, clean, dist, near, numText } from "./geometry";

/**
 * Two polygons side by side, to test NCERT's definition: polygons with the same number of sides
 * are similar when (i) their corresponding angles are equal and (ii) their corresponding sides are
 * in the same ratio. Four pairs:
 * - enlarged: the second is the first scaled by k (always similar; k = 1 is congruent);
 * - squareRectangle: a square and a rectangle k times as wide (angles equal, sides not in one
 *   ratio unless k = 1; Fig 6.6);
 * - squareRhombus: a square and a rhombus with sides k times as long and a set angle (sides in one
 *   ratio, angles not equal unless the angle is 90°; Fig 6.7);
 * - shadow: a card ABCD under a bulb O and its shadow A′B′C′D′ on the table, each shadow point on
 *   the ray from O through the card point (Activity 1, Fig 6.4).
 */

export const SimilarPair = {
  Enlarged: "enlarged",
  SquareRectangle: "squareRectangle",
  SquareRhombus: "squareRhombus",
  Shadow: "shadow",
} as const;
export type SimilarPair = (typeof SimilarPair)[keyof typeof SimilarPair];

/** The first polygon's shape, for the enlarged and shadow pairs. */
export const SimilarShape = {
  Quadrilateral: "quadrilateral",
  Triangle: "triangle",
  Pentagon: "pentagon",
} as const;
export type SimilarShape = (typeof SimilarShape)[keyof typeof SimilarShape];

export const SimilarAction = {
  SetPair: "setPair",
  SetScale: "setScale",
  NudgeScale: "nudgeScale",
  NudgeAngle: "nudgeAngle",
} as const;
export const SimilarSignal = { Changed: "changed" } as const;
export const SimilarDerived = {
  Ratios: "ratios",
  AnglesFirst: "anglesFirst",
  AnglesSecond: "anglesSecond",
  AnglesEqual: "anglesEqual",
  RatiosEqual: "ratiosEqual",
  IsSimilar: "isSimilar",
  ScaleFactor: "scaleFactor",
} as const;
export const SimilarPart = {
  First: "first",
  Second: "second",
  Bulb: "bulb",
  Angles: "angles",
  Ratios: "ratios",
  Verdict: "verdict",
  Scale: "scale",
  Angle: "angle",
} as const;

export const SCALE_MIN = 0.5;
export const SCALE_MAX = 3;
export const SCALE_STEP = 0.25;

const similarState = z
  .object({
    pair: z.nativeEnum(SimilarPair),
    shape: z.nativeEnum(SimilarShape),
    /** The scale factor k: second ÷ first (for the rectangle, its width ÷ the square's side). */
    scale: z.number().min(SCALE_MIN).max(SCALE_MAX),
    /** The rhombus's angle, in degrees. */
    angle: z.number().min(30).max(90),
    /** The letters of the first polygon's vertices, in order (the second gets the same with ′, or its own). */
    firstNames: z.array(z.string().min(1).max(3)).min(3).max(5),
    secondNames: z.array(z.string().min(1).max(3)).min(3).max(5),
    canScale: z.boolean(),
    canSetAngle: z.boolean(),
    showAngles: z.boolean(),
    showRatios: z.boolean(),
    /** Say "similar" or "not similar" under the pictures. */
    showVerdict: z.boolean(),
  })
  .strict();
export type SimilarState = z.infer<typeof similarState>;

const BASE: Record<SimilarShape, Pt[]> = {
  [SimilarShape.Quadrilateral]: [
    [0, 0],
    [3, 0],
    [3.6, 2],
    [0.9, 2.6],
  ],
  [SimilarShape.Triangle]: [
    [0, 0],
    [3, 0],
    [1.1, 2.2],
  ],
  [SimilarShape.Pentagon]: [
    [0, 0],
    [2.6, 0],
    [3.2, 1.6],
    [1.5, 2.8],
    [-0.3, 1.7],
  ],
};

const SIDE = 2;

/** The vertices of both polygons (y up), in the same order as their names. */
export function polygonsOf(s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">): {
  first: Pt[];
  second: Pt[];
} {
  const k = s.scale;
  switch (s.pair) {
    case SimilarPair.Enlarged:
    case SimilarPair.Shadow: {
      const first = BASE[s.shape];
      return { first, second: first.map(([x, y]) => [x * k, y * k] as Pt) };
    }
    case SimilarPair.SquareRectangle:
      return {
        first: [
          [0, 0],
          [SIDE, 0],
          [SIDE, SIDE],
          [0, SIDE],
        ],
        second: [
          [0, 0],
          [SIDE * k, 0],
          [SIDE * k, SIDE],
          [0, SIDE],
        ],
      };
    case SimilarPair.SquareRhombus: {
      const t = (s.angle * Math.PI) / 180;
      const a = SIDE * k;
      const dx = a * Math.cos(t);
      const dy = a * Math.sin(t);
      return {
        first: [
          [0, 0],
          [SIDE, 0],
          [SIDE, SIDE],
          [0, SIDE],
        ],
        second: [
          [0, 0],
          [a, 0],
          [a + dx, dy],
          [dx, dy],
        ],
      };
    }
  }
}

function sidesOf(pts: readonly Pt[]): number[] {
  return pts.map((p, i) => dist(p, pts[(i + 1) % pts.length] as Pt));
}

function anglesOfPolygon(pts: readonly Pt[]): number[] {
  return pts.map((p, i) =>
    angleAt(p, pts[(i + pts.length - 1) % pts.length] as Pt, pts[(i + 1) % pts.length] as Pt),
  );
}

/** Each side of the second divided by the matching side of the first. */
export function ratiosOf(s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">): number[] {
  const { first, second } = polygonsOf(s);
  const a = sidesOf(first);
  const b = sidesOf(second);
  return a.map((x, i) => clean((b[i] as number) / x));
}

export function anglesFirstOf(
  s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">,
): number[] {
  return anglesOfPolygon(polygonsOf(s).first).map((x) => Math.round(x));
}

export function anglesSecondOf(
  s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">,
): number[] {
  return anglesOfPolygon(polygonsOf(s).second).map((x) => Math.round(x));
}

export function anglesEqualOf(
  s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">,
): boolean {
  const a = anglesFirstOf(s);
  const b = anglesSecondOf(s);
  return a.every((x, i) => Math.abs(x - (b[i] as number)) < 0.5);
}

export function ratiosEqualOf(
  s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">,
): boolean {
  const r = ratiosOf(s);
  return r.every((x) => near(x, r[0] as number, 1e-6));
}

export function isSimilarOf(s: Pick<SimilarState, "pair" | "shape" | "scale" | "angle">): boolean {
  return anglesEqualOf(s) && ratiosEqualOf(s);
}

const VERTS: Record<SimilarShape, number> = {
  [SimilarShape.Quadrilateral]: 4,
  [SimilarShape.Triangle]: 3,
  [SimilarShape.Pentagon]: 5,
};

/** How many vertices the pair's polygons have. */
export function vertexCount(s: Pick<SimilarState, "pair" | "shape">): number {
  return s.pair === SimilarPair.Enlarged || s.pair === SimilarPair.Shadow ? VERTS[s.shape] : 4;
}

function changed(s: SimilarState): Emit[] {
  return [
    {
      signal: SimilarSignal.Changed,
      payload: { scale: s.scale, angle: s.angle, isSimilar: isSimilarOf(s) },
    },
  ];
}

const act = actionsFor<SimilarState>();

export const similarFigures = defineProp({
  type: "similarFigures",
  describe:
    "Two polygons side by side to test similarity (NCERT 6.2): similar polygons have their corresponding angles equal and their corresponding sides in the same ratio, the scale factor. Pairs: an enlargement by a scale factor k (always similar; k = 1 is congruent), a square beside a rectangle (angles equal but sides not in one ratio), a square beside a rhombus (sides in one ratio but angles not equal), and a card under a bulb with its shadow on the table (Activity 1: each shadow corner lies on the ray from the bulb through the card's corner, so the shadow is an enlargement). Angles and side ratios can be shown, and a verdict.",
  state: similarState,
  defaults: {
    pair: SimilarPair.Enlarged,
    shape: SimilarShape.Quadrilateral,
    scale: 1.5,
    angle: 60,
    firstNames: ["A", "B", "C", "D"],
    secondNames: ["P", "Q", "R", "S"],
    canScale: true,
    canSetAngle: false,
    showAngles: true,
    showRatios: true,
    showVerdict: true,
  },
  inputs: ["canScale", "canSetAngle", "showAngles", "showRatios", "showVerdict"],
  invariant: (s) =>
    s.firstNames.length < vertexCount(s) || s.secondNames.length < vertexCount(s)
      ? "fewer vertex names than the polygons have vertices"
      : undefined,
  derived: {
    [SimilarDerived.Ratios]: {
      describe: "Each side of the second polygon divided by the matching side of the first",
      compute: ratiosOf,
    },
    [SimilarDerived.AnglesFirst]: {
      describe: "The first polygon's angles, in degrees, in vertex order",
      compute: anglesFirstOf,
    },
    [SimilarDerived.AnglesSecond]: {
      describe: "The second polygon's angles, in degrees, in vertex order",
      compute: anglesSecondOf,
    },
    [SimilarDerived.AnglesEqual]: {
      describe: "Whether every pair of corresponding angles is equal",
      compute: anglesEqualOf,
    },
    [SimilarDerived.RatiosEqual]: {
      describe: "Whether all corresponding sides are in the same ratio",
      compute: ratiosEqualOf,
    },
    [SimilarDerived.IsSimilar]: {
      describe: "Whether the polygons are similar: both conditions hold",
      compute: isSimilarOf,
    },
    [SimilarDerived.ScaleFactor]: {
      describe: "The scale factor (second ÷ first) when the sides are in one ratio, else null",
      compute: (s) => (ratiosEqualOf(s) ? (ratiosOf(s)[0] as number) : null),
    },
  },
  actions: {
    [SimilarAction.SetPair]: act({
      describe: "Show another pair (and shape for the enlargement or shadow)",
      args: z
        .object({ pair: z.nativeEnum(SimilarPair), shape: z.nativeEnum(SimilarShape).optional() })
        .strict(),
      run: (s, a) => {
        const next = { ...s, pair: a.pair, shape: a.shape ?? s.shape };
        return set({ pair: next.pair, shape: next.shape }, ...changed(next));
      },
    }),
    [SimilarAction.SetScale]: act({
      describe: "Set the scale factor k",
      args: z.object({ scale: z.number().min(SCALE_MIN).max(SCALE_MAX) }).strict(),
      run: (s, a) => set({ scale: a.scale }, ...changed({ ...s, scale: a.scale })),
    }),
    [SimilarAction.NudgeScale]: act({
      describe:
        "Make the second figure bigger (by: 1) or smaller (by: −1) by a quarter of the first (for the shadow: move the card nearer the bulb or nearer the table)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canScale) return set({});
        const scale = clean(Math.min(SCALE_MAX, Math.max(SCALE_MIN, s.scale + a.by * SCALE_STEP)));
        if (scale === s.scale) return set({});
        return set({ scale }, ...changed({ ...s, scale }));
      },
    }),
    [SimilarAction.NudgeAngle]: act({
      describe: "Open the rhombus's angle wider (by: 1) or narrower (by: −1) by 10°",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canSetAngle || s.pair !== SimilarPair.SquareRhombus) return set({});
        const angle = Math.min(90, Math.max(30, s.angle + a.by * 10));
        if (angle === s.angle) return set({});
        return set({ angle }, ...changed({ ...s, angle }));
      },
    }),
  },
  signals: {
    [SimilarSignal.Changed]: {
      describe:
        "The scale or angle changed; the payload has them and whether the figures are similar",
    },
  },
  observe: (s) => {
    const n = vertexCount(s);
    const f = s.firstNames.slice(0, n);
    const g = s.secondNames.slice(0, n);
    const ratios = ratiosOf(s);
    const a1 = anglesFirstOf(s);
    const a2 = anglesSecondOf(s);
    const similar = isSimilarOf(s);
    const elements: Element[] = [
      { id: SimilarPart.First, value: `polygon ${f.join("")}` },
      { id: SimilarPart.Second, value: `polygon ${g.join("")}` },
    ];
    if (s.showAngles)
      elements.push({
        id: SimilarPart.Angles,
        value: f.map((v, i) => `∠${v} = ${a1[i]}°, ∠${g[i]} = ${a2[i]}°`).join("; "),
      });
    if (s.showRatios)
      elements.push({
        id: SimilarPart.Ratios,
        value: f
          .map(
            (v, i) =>
              `${g[i]}${g[(i + 1) % n]}/${v}${f[(i + 1) % n]} = ${numText(ratios[i] as number)}`,
          )
          .join("; "),
      });
    if (s.showVerdict)
      elements.push({ id: SimilarPart.Verdict, value: similar ? "similar" : "not similar" });
    if (s.canScale) elements.push({ id: SimilarPart.Scale, value: `k = ${numText(s.scale)}` });
    if (s.canSetAngle && s.pair === SimilarPair.SquareRhombus)
      elements.push({ id: SimilarPart.Angle, value: `angle ${s.angle}°` });
    const what: Record<SimilarPair, string> = {
      [SimilarPair.Enlarged]: `${f.join("")} and ${g.join("")}, the second ${numText(s.scale)} times the first`,
      [SimilarPair.SquareRectangle]: `square ${f.join("")} and a rectangle ${g.join("")} ${numText(s.scale)} times as wide`,
      [SimilarPair.SquareRhombus]: `square ${f.join("")} and a rhombus ${g.join("")} with sides ${numText(s.scale)} times as long and an angle of ${s.angle}°`,
      [SimilarPair.Shadow]: `card ${f.join("")} under a bulb and its shadow ${g.join("")}, ${numText(s.scale)} times as big`,
    };
    return {
      summary: `${what[s.pair]}.${s.showVerdict ? (similar ? " They are similar." : " They are not similar.") : ""}`,
      elements,
      hidden: s.showVerdict
        ? undefined
        : { isSimilar: similar, anglesEqual: anglesEqualOf(s), ratiosEqual: ratiosEqualOf(s) },
    };
  },
  parts: (s) => [
    SimilarPart.First,
    SimilarPart.Second,
    ...(s.pair === SimilarPair.Shadow ? [SimilarPart.Bulb] : []),
    ...(s.showAngles ? [SimilarPart.Angles] : []),
    ...(s.showRatios ? [SimilarPart.Ratios] : []),
    ...(s.showVerdict ? [SimilarPart.Verdict] : []),
    ...(s.canScale ? [SimilarPart.Scale] : []),
    ...(s.canSetAngle && s.pair === SimilarPair.SquareRhombus ? [SimilarPart.Angle] : []),
  ],
});
