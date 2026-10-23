import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Sides,
  anglesOf,
  clean,
  isTriangle,
  near,
  numText,
  oppositeSide,
  sidesFromBaseAngles,
} from "./geometry";

/**
 * Two triangles ABC and DEF, A ↔ D, B ↔ E, C ↔ F, to test the criteria for similarity (NCERT 6.4).
 * The first is fixed; the learner changes the second in one of these ways:
 * - scale: every side k times the first's (always similar);
 * - sides: each side on its own (SSS: similar exactly when all three ratios match);
 * - sas: DE, DF and the angle D between them (SAS);
 * - angles: the base EF and the angles E and F at its ends (AAA / AA: the third angle follows).
 * The view shows the sides, the angles, the three ratios AB/DE, BC/EF, CA/FD and a verdict.
 */

export const MatchEdit = {
  None: "none",
  Scale: "scale",
  Sides: "sides",
  Sas: "sas",
  Angles: "angles",
} as const;
export type MatchEdit = (typeof MatchEdit)[keyof typeof MatchEdit];

/** A side of the second triangle, named by the first's: ab ↔ DE, bc ↔ EF, ca ↔ FD. */
export const MatchSide = { AB: "ab", BC: "bc", CA: "ca" } as const;
export type MatchSide = (typeof MatchSide)[keyof typeof MatchSide];

export const MatchAction = {
  SetSecond: "setSecond",
  NudgeScale: "nudgeScale",
  NudgeSide: "nudgeSide",
  NudgeAngle: "nudgeAngle",
} as const;
export const MatchSignal = { Changed: "changed", Similar: "similar" } as const;
export const MatchDerived = {
  AnglesFirst: "anglesFirst",
  AnglesSecond: "anglesSecond",
  Ratios: "ratios",
  AnglesEqual: "anglesEqual",
  SidesProportional: "sidesProportional",
  IsSimilar: "isSimilar",
} as const;
export const MatchPart = {
  First: "first",
  Second: "second",
  Ratios: "ratios",
  Angles: "angles",
  Verdict: "verdict",
  Controls: "controls",
} as const;

const sidesSchema = z
  .object({
    ab: z.number().min(0.1).max(100),
    bc: z.number().min(0.1).max(100),
    ca: z.number().min(0.1).max(100),
  })
  .strict();

const matchState = z
  .object({
    first: sidesSchema,
    /** The second triangle's sides DE (ab), EF (bc), FD (ca). */
    second: sidesSchema,
    edit: z.nativeEnum(MatchEdit),
    /** How far one tap changes a side (cm). */
    step: z.number().min(0.05).max(10),
    /** Names of A, B, C, D, E, F (D ↔ A, E ↔ B, F ↔ C). */
    names: z.array(z.string().min(1).max(3)).length(6),
    showSides: z.boolean(),
    showAngles: z.boolean(),
    showRatios: z.boolean(),
    showVerdict: z.boolean(),
  })
  .strict();
export type MatchState = z.infer<typeof matchState>;

const ANGLE_STEP = 5;
const round1 = (x: number) => Math.round(x * 10) / 10;

export const anglesFirstOf = (s: Pick<MatchState, "first">) => anglesOf(s.first).map(round1);
export const anglesSecondOf = (s: Pick<MatchState, "second">) => anglesOf(s.second).map(round1);

/** AB/DE, BC/EF, CA/FD. */
export function ratiosOfMatch(s: Pick<MatchState, "first" | "second">): [number, number, number] {
  return [
    clean(s.first.ab / s.second.ab),
    clean(s.first.bc / s.second.bc),
    clean(s.first.ca / s.second.ca),
  ];
}

/** For each vertex pair (A,D), (B,E), (C,F): whether the angles are equal. */
export function anglesEqualOf(
  s: Pick<MatchState, "first" | "second">,
): [boolean, boolean, boolean] {
  const a = anglesOf(s.first);
  const b = anglesOf(s.second);
  return [0, 1, 2].map((i) => Math.abs((a[i] as number) - (b[i] as number)) < 0.05) as [
    boolean,
    boolean,
    boolean,
  ];
}

export function sidesProportionalOf(s: Pick<MatchState, "first" | "second">): boolean {
  const [r1, r2, r3] = ratiosOfMatch(s);
  return near(r1, r2, 1e-4) && near(r2, r3, 1e-4);
}

export const isSimilarMatch = (s: Pick<MatchState, "first" | "second">): boolean =>
  sidesProportionalOf(s) && anglesEqualOf(s).every(Boolean);

function changed(before: MatchState, second: Sides): Emit[] {
  const after = { ...before, second };
  const out: Emit[] = [
    {
      signal: MatchSignal.Changed,
      payload: { ratios: ratiosOfMatch(after), isSimilar: isSimilarMatch(after) },
    },
  ];
  if (isSimilarMatch(after) && !isSimilarMatch(before))
    out.push({ signal: MatchSignal.Similar, payload: { ratio: ratiosOfMatch(after)[0] } });
  return out;
}

const tidy = (x: Sides): Sides => ({ ab: clean(x.ab), bc: clean(x.bc), ca: clean(x.ca) });

/** The second triangle after a side change, keeping what the edit mode keeps; null if impossible. */
export function withSide(s: MatchState, side: MatchSide, by: 1 | -1): Sides | null {
  const t = { ...s.second };
  const len = clean(t[side] + by * s.step);
  if (len <= 0) return null;
  if (s.edit === MatchEdit.Sides) {
    t[side] = len;
  } else if (s.edit === MatchEdit.Sas) {
    if (side === MatchSide.BC) return null;
    const angleD = anglesOf(t)[0];
    t[side] = len;
    t.bc = oppositeSide(t.ab, t.ca, angleD);
  } else if (s.edit === MatchEdit.Angles) {
    if (side !== MatchSide.BC) return null;
    const k = len / t.bc;
    return tidy({ ab: t.ab * k, bc: len, ca: t.ca * k });
  } else return null;
  return isTriangle(t) ? tidy(t) : null;
}

/** The second triangle after an angle change at D (sas) or E, F (angles); null if impossible. */
export function withAngle(s: MatchState, at: 0 | 1 | 2, by: 1 | -1): Sides | null {
  const [D, E, F] = anglesOf(s.second);
  if (s.edit === MatchEdit.Sas && at === 0) {
    const angle = Math.round(D) + by * ANGLE_STEP;
    if (angle <= 0 || angle >= 180) return null;
    return tidy({ ...s.second, bc: oppositeSide(s.second.ab, s.second.ca, angle) });
  }
  if (s.edit === MatchEdit.Angles && at !== 0) {
    const e = at === 1 ? Math.round(E) + by * ANGLE_STEP : Math.round(E);
    const f = at === 2 ? Math.round(F) + by * ANGLE_STEP : Math.round(F);
    const sides = sidesFromBaseAngles(s.second.bc, e, f);
    return sides === null ? null : tidy(sides);
  }
  return null;
}

const act = actionsFor<MatchState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const triangleMatch = defineProp({
  type: "triangleMatch",
  describe:
    "Two triangles ABC and DEF side by side (A ↔ D, B ↔ E, C ↔ F) to test the criteria for similarity (NCERT 6.4): AAA/AA (corresponding angles equal), SSS (all three sides in the same ratio) and SAS (one angle equal and the sides including it in the same ratio). The first triangle is fixed; the learner changes the second by a scale factor, side by side, by two sides and the angle between them, or by its base and the angles at its ends, and reads the sides, the angles, the ratios AB/DE, BC/EF, CA/FD and whether the triangles are similar.",
  state: matchState,
  defaults: {
    first: { ab: 3, bc: 6, ca: 8 },
    second: { ab: 4.5, bc: 9, ca: 12 },
    edit: MatchEdit.Sides,
    step: 0.5,
    names: ["A", "B", "C", "D", "E", "F"],
    showSides: true,
    showAngles: true,
    showRatios: true,
    showVerdict: true,
  },
  inputs: ["showSides", "showAngles", "showRatios", "showVerdict"],
  invariant: (s) =>
    !isTriangle(s.first) || !isTriangle(s.second) ? "the sides don't make a triangle" : undefined,
  derived: {
    [MatchDerived.AnglesFirst]: {
      describe: "The angles A, B, C (degrees, to 0.1)",
      compute: anglesFirstOf,
    },
    [MatchDerived.AnglesSecond]: {
      describe: "The angles D, E, F (degrees, to 0.1)",
      compute: anglesSecondOf,
    },
    [MatchDerived.Ratios]: { describe: "AB/DE, BC/EF, CA/FD", compute: ratiosOfMatch },
    [MatchDerived.AnglesEqual]: {
      describe: "Whether ∠A = ∠D, ∠B = ∠E, ∠C = ∠F (three answers)",
      compute: anglesEqualOf,
    },
    [MatchDerived.SidesProportional]: {
      describe: "Whether AB/DE = BC/EF = CA/FD",
      compute: sidesProportionalOf,
    },
    [MatchDerived.IsSimilar]: {
      describe: "Whether ∆ABC ~ ∆DEF in this correspondence",
      compute: isSimilarMatch,
    },
  },
  actions: {
    [MatchAction.SetSecond]: act({
      describe: "Give the second triangle these sides DE, EF, FD",
      args: sidesSchema,
      run: (s, a) => (isTriangle(a) ? set({ second: tidy(a) }, ...changed(s, tidy(a))) : set({})),
    }),
    [MatchAction.NudgeScale]: act({
      describe:
        "Make the second triangle a quarter of the first bigger (by: 1) or smaller (by: −1), keeping its shape (scale mode)",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (s.edit !== MatchEdit.Scale) return set({});
        const k = clean(Math.round((s.second.ab / s.first.ab) * 4) / 4 + a.by * 0.25);
        if (k < 0.25 || k > 4) return set({});
        const second = tidy({ ab: s.first.ab * k, bc: s.first.bc * k, ca: s.first.ca * k });
        return set({ second }, ...changed(s, second));
      },
    }),
    [MatchAction.NudgeSide]: act({
      describe:
        "Lengthen (by: 1) or shorten (by: −1) one side of the second triangle, named by the first's (ab = DE, bc = EF, ca = FD); in sas mode DE or DF with the angle D kept, in angles mode EF with the angles kept",
      byLearner: true,
      args: z.object({ side: z.nativeEnum(MatchSide), by }).strict(),
      run: (s, a) => {
        const second = withSide(s, a.side, a.by);
        return second === null ? set({}) : set({ second }, ...changed(s, second));
      },
    }),
    [MatchAction.NudgeAngle]: act({
      describe:
        "Open (by: 1) or close (by: −1) an angle of the second triangle by 5°: the angle D in sas mode (at: 0), or E or F in angles mode (at: 1 or 2)",
      byLearner: true,
      args: z.object({ at: z.union([z.literal(0), z.literal(1), z.literal(2)]), by }).strict(),
      run: (s, a) => {
        const second = withAngle(s, a.at, a.by);
        return second === null || !isTriangle(second)
          ? set({})
          : set({ second }, ...changed(s, second));
      },
    }),
  },
  signals: {
    [MatchSignal.Changed]: {
      describe:
        "The second triangle changed; the payload has the ratios and whether they are similar",
    },
    [MatchSignal.Similar]: { describe: "The triangles have just become similar" },
  },
  observe: (s) => {
    const [A, B, C, D, E, F] = s.names as [string, string, string, string, string, string];
    const a1 = anglesFirstOf(s);
    const a2 = anglesSecondOf(s);
    const r = ratiosOfMatch(s);
    const similar = isSimilarMatch(s);
    const sides = (x: Sides, p: string, q: string, t: string) =>
      `${p}${q} = ${numText(x.ab)}, ${q}${t} = ${numText(x.bc)}, ${t}${p} = ${numText(x.ca)}`;
    const elements: Element[] = [
      {
        id: MatchPart.First,
        value: `triangle ${A}${B}${C}${s.showSides ? `: ${sides(s.first, A, B, C)}` : ""}`,
      },
      {
        id: MatchPart.Second,
        value: `triangle ${D}${E}${F}${s.showSides ? `: ${sides(s.second, D, E, F)}` : ""}`,
      },
    ];
    if (s.showAngles)
      elements.push({
        id: MatchPart.Angles,
        value: `∠${A} = ${numText(a1[0] as number, 1)}°, ∠${B} = ${numText(a1[1] as number, 1)}°, ∠${C} = ${numText(a1[2] as number, 1)}°; ∠${D} = ${numText(a2[0] as number, 1)}°, ∠${E} = ${numText(a2[1] as number, 1)}°, ∠${F} = ${numText(a2[2] as number, 1)}°`,
      });
    if (s.showRatios)
      elements.push({
        id: MatchPart.Ratios,
        value: `${A}${B}/${D}${E} = ${numText(r[0], 3)}, ${B}${C}/${E}${F} = ${numText(r[1], 3)}, ${C}${A}/${F}${D} = ${numText(r[2], 3)}`,
      });
    if (s.showVerdict)
      elements.push({
        id: MatchPart.Verdict,
        value: similar ? `∆${A}${B}${C} ~ ∆${D}${E}${F}` : "not similar",
      });
    if (s.edit !== MatchEdit.None)
      elements.push({ id: MatchPart.Controls, value: `change ${D}${E}${F}` });
    return {
      summary: `Triangles ${A}${B}${C} and ${D}${E}${F}.${s.showVerdict ? (similar ? " They are similar." : " They are not similar.") : ""}`,
      elements,
      hidden: s.showVerdict ? undefined : { isSimilar: similar },
    };
  },
  parts: (s) => [
    MatchPart.First,
    MatchPart.Second,
    ...(s.showAngles ? [MatchPart.Angles] : []),
    ...(s.showRatios ? [MatchPart.Ratios] : []),
    ...(s.showVerdict ? [MatchPart.Verdict] : []),
    ...(s.edit !== MatchEdit.None ? [MatchPart.Controls] : []),
  ],
});
