import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Pt,
  clean,
  lerp,
  near,
  numText,
  oppositeSide,
  placeTriangle,
  ratioText,
} from "./geometry";

/**
 * A triangle ABC with a line DE cutting AB at D and AC at E: the Basic Proportionality Theorem
 * (Thales, Theorem 6.1) and its converse (Theorem 6.2).
 * - parallel: E follows D so that DE stays parallel to BC; the learner moves D and reads AD/DB and
 *   AE/EC, always equal.
 * - free: D and E move separately; the line is parallel to BC exactly when AD/DB = AE/EC.
 * With `parts` set, AB and AC are marked in that many equal parts and D and E sit on the marks
 * (Activities 2 and 3). The triangle is given by AB, AC and the angle A, in cm.
 */

export const BptMode = { Parallel: "parallel", Free: "free" } as const;
export type BptMode = (typeof BptMode)[keyof typeof BptMode];

export const BptAction = {
  MoveD: "moveD",
  MoveE: "moveE",
  SetD: "setD",
  SetE: "setE",
  SetMode: "setMode",
} as const;
export const BptSignal = { Changed: "changed", Parallel: "parallel" } as const;
export const BptDerived = {
  AD: "ad",
  DB: "db",
  AE: "ae",
  EC: "ec",
  RatioD: "ratioD",
  RatioE: "ratioE",
  IsParallel: "isParallel",
} as const;
export const BptPart = {
  Triangle: "triangle",
  Line: "line",
  Ratios: "ratios",
  MoveD: "moveD",
  MoveE: "moveE",
  Verdict: "verdict",
} as const;

const bptState = z
  .object({
    mode: z.nativeEnum(BptMode),
    /** AB and AC in cm, and the angle at A. */
    ab: z.number().min(0.1).max(100),
    ac: z.number().min(0.1).max(100),
    angleA: z.number().min(20).max(140),
    /** D's place on AB: AD ÷ AB, strictly between 0 and 1. */
    d: z.number().gt(0).lt(1),
    /** E's place on AC (free mode): AE ÷ AC. */
    e: z.number().gt(0).lt(1),
    /** AB and AC marked in this many equal parts, D and E on the marks; null: no marks. */
    parts: z.number().int().min(2).max(10).nullable(),
    /** Names of A, B, C, D, E. */
    names: z.array(z.string().min(1).max(3)).length(5),
    canMoveD: z.boolean(),
    canMoveE: z.boolean(),
    showRatios: z.boolean(),
    /** Write the lengths AD, DB, AE, EC in cm on the picture. */
    showLengths: z.boolean(),
  })
  .strict();
export type BptState = z.infer<typeof bptState>;

/** E's place on AC: equal to D's in parallel mode. */
export const eOf = (s: Pick<BptState, "mode" | "d" | "e">): number =>
  s.mode === BptMode.Parallel ? s.d : s.e;

export function lengthsOf(s: Pick<BptState, "mode" | "ab" | "ac" | "d" | "e">): {
  ad: number;
  db: number;
  ae: number;
  ec: number;
} {
  const e = eOf(s);
  return {
    ad: clean(s.ab * s.d),
    db: clean(s.ab * (1 - s.d)),
    ae: clean(s.ac * e),
    ec: clean(s.ac * (1 - e)),
  };
}

export const ratioDOf = (s: Pick<BptState, "d">): number => clean(s.d / (1 - s.d));
export const ratioEOf = (s: Pick<BptState, "mode" | "d" | "e">): number => {
  const e = eOf(s);
  return clean(e / (1 - e));
};
export const isParallelOf = (s: Pick<BptState, "mode" | "d" | "e">): boolean =>
  near(ratioDOf(s), ratioEOf(s), 1e-6);

/** The vertices A, B, C, D, E (y up): B at the origin, BC along the x-axis, A above. */
export function pointsOf(s: Pick<BptState, "mode" | "ab" | "ac" | "angleA" | "d" | "e">): {
  a: Pt;
  b: Pt;
  c: Pt;
  dPt: Pt;
  ePt: Pt;
} {
  const { a, b, c } = placeTriangle({ ab: s.ab, ca: s.ac, bc: oppositeSide(s.ab, s.ac, s.angleA) });
  return { a, b, c, dPt: lerp(a, b, s.d), ePt: lerp(a, c, eOf(s)) };
}

/** How far one tap moves D or E: one mark, or a twentieth of the side. */
const stepOf = (s: Pick<BptState, "parts">) => (s.parts === null ? 0.05 : 1 / s.parts);

function moved(x: number, by: number, s: Pick<BptState, "parts">): number {
  const step = stepOf(s);
  const next = clean(Math.round((x + by * step) / step) * step);
  return Math.min(1 - step, Math.max(step, next));
}

function changed(before: BptState, after: BptState): Emit[] {
  const out: Emit[] = [
    {
      signal: BptSignal.Changed,
      payload: {
        ratioD: ratioDOf(after),
        ratioE: ratioEOf(after),
        isParallel: isParallelOf(after),
      },
    },
  ];
  if (after.mode === BptMode.Free && isParallelOf(after) && !isParallelOf(before))
    out.push({ signal: BptSignal.Parallel, payload: { ratio: ratioDOf(after) } });
  return out;
}

const act = actionsFor<BptState>();

export const proportionLine = defineProp({
  type: "proportionLine",
  describe:
    "A triangle ABC with a line DE meeting AB at D and AC at E, for the Basic Proportionality Theorem (Thales): a line parallel to one side cuts the other two sides in the same ratio, AD/DB = AE/EC, and its converse: a line that cuts two sides in the same ratio is parallel to the third side. In parallel mode E follows D so DE stays parallel to BC; in free mode D and E move separately and the line is parallel only when the ratios match. AB and AC can be marked in equal parts (NCERT Activities 2 and 3). Shows the ratios and, if asked, the lengths in cm.",
  state: bptState,
  defaults: {
    mode: BptMode.Parallel,
    ab: 5,
    ac: 5,
    angleA: 60,
    d: 0.6,
    e: 0.6,
    parts: 5,
    names: ["A", "B", "C", "D", "E"],
    canMoveD: true,
    canMoveE: false,
    showRatios: true,
    showLengths: false,
  },
  inputs: ["canMoveD", "canMoveE", "showRatios", "showLengths"],
  invariant: (s) =>
    s.parts !== null &&
    (!near(s.d * s.parts, Math.round(s.d * s.parts), 1e-6) ||
      !near(s.e * s.parts, Math.round(s.e * s.parts), 1e-6))
      ? "D and E must sit on the marks"
      : undefined,
  derived: {
    [BptDerived.AD]: { describe: "AD in cm", compute: (s) => lengthsOf(s).ad },
    [BptDerived.DB]: { describe: "DB in cm", compute: (s) => lengthsOf(s).db },
    [BptDerived.AE]: { describe: "AE in cm", compute: (s) => lengthsOf(s).ae },
    [BptDerived.EC]: { describe: "EC in cm", compute: (s) => lengthsOf(s).ec },
    [BptDerived.RatioD]: { describe: "AD ÷ DB", compute: ratioDOf },
    [BptDerived.RatioE]: { describe: "AE ÷ EC", compute: ratioEOf },
    [BptDerived.IsParallel]: {
      describe: "Whether DE is parallel to BC (exactly when AD/DB = AE/EC)",
      compute: isParallelOf,
    },
  },
  actions: {
    [BptAction.MoveD]: act({
      describe: "Slide D along AB away from A (by: 1) or towards A (by: −1), one mark at a time",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canMoveD) return set({});
        const d = moved(s.d, a.by, s);
        if (d === s.d) return set({});
        const next = { ...s, d };
        return set({ d }, ...changed(s, next));
      },
    }),
    [BptAction.MoveE]: act({
      describe: "Slide E along AC away from A (by: 1) or towards A (by: −1) (free mode)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canMoveE || s.mode !== BptMode.Free) return set({});
        const e = moved(s.e, a.by, s);
        if (e === s.e) return set({});
        const next = { ...s, e };
        return set({ e }, ...changed(s, next));
      },
    }),
    [BptAction.SetD]: act({
      describe: "Put D at this fraction of AB from A",
      args: z.object({ d: z.number().gt(0).lt(1) }).strict(),
      run: (s, a) => set({ d: a.d }, ...changed(s, { ...s, d: a.d })),
    }),
    [BptAction.SetE]: act({
      describe: "Put E at this fraction of AC from A",
      args: z.object({ e: z.number().gt(0).lt(1) }).strict(),
      run: (s, a) => set({ e: a.e }, ...changed(s, { ...s, e: a.e })),
    }),
    [BptAction.SetMode]: act({
      describe: "Keep DE parallel to BC (parallel) or let E move by itself (free)",
      args: z.object({ mode: z.nativeEnum(BptMode) }).strict(),
      run: (s, a) => set({ mode: a.mode, e: a.mode === BptMode.Free ? s.e : s.d }),
    }),
  },
  signals: {
    [BptSignal.Changed]: {
      describe: "D or E moved; the payload has both ratios and whether DE ∥ BC",
    },
    [BptSignal.Parallel]: {
      describe: "In free mode the line has just become parallel to BC; the payload has the ratio",
    },
  },
  observe: (s) => {
    const [A, B, C, D, E] = s.names as [string, string, string, string, string];
    const L = lengthsOf(s);
    const par = isParallelOf(s);
    const elements: Element[] = [
      { id: BptPart.Triangle, value: `triangle ${A}${B}${C}` },
      {
        id: BptPart.Line,
        value: `${D}${E} meets ${A}${B} at ${D} and ${A}${C} at ${E}${par ? `, parallel to ${B}${C}` : ""}`,
      },
    ];
    if (s.showRatios)
      elements.push({
        id: BptPart.Ratios,
        value: `${A}${D}/${D}${B} = ${ratioText(ratioDOf(s))}; ${A}${E}/${E}${C} = ${ratioText(ratioEOf(s))}`,
      });
    if (s.canMoveD) elements.push({ id: BptPart.MoveD, value: `move ${D}` });
    if (s.canMoveE && s.mode === BptMode.Free)
      elements.push({ id: BptPart.MoveE, value: `move ${E}` });
    elements.push({
      id: BptPart.Verdict,
      value: par ? `${D}${E} ∥ ${B}${C}` : `${D}${E} is not parallel to ${B}${C}`,
    });
    return {
      summary: `Triangle ${A}${B}${C} with ${A}${B} = ${numText(s.ab)} cm, ${A}${C} = ${numText(s.ac)} cm; ${D} on ${A}${B} (${A}${D} = ${numText(L.ad)} cm, ${D}${B} = ${numText(L.db)} cm), ${E} on ${A}${C} (${A}${E} = ${numText(L.ae)} cm, ${E}${C} = ${numText(L.ec)} cm).`,
      elements,
    };
  },
  parts: (s) => [
    BptPart.Triangle,
    BptPart.Line,
    ...(s.showRatios ? [BptPart.Ratios] : []),
    ...(s.canMoveD ? [BptPart.MoveD] : []),
    ...(s.canMoveE && s.mode === BptMode.Free ? [BptPart.MoveE] : []),
    BptPart.Verdict,
  ],
});
