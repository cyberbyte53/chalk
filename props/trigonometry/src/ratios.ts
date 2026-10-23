import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  PARTNER,
  RATIOS,
  RATIO_SIDES,
  Ratio,
  Side,
  clean,
  deg,
  numText,
  rad,
  ratioValue,
  sqrtTex,
} from "./trig";

/**
 * The trigonometric ratios of an acute angle in a right triangle (NCERT 8.2, 8.4).
 * - Triangle ABC is right-angled at B (names can be changed); the learner turns the angle at A and
 *   scales the triangle. Scaling changes every side but no ratio (Fig 8.6: the triangles are
 *   similar by AA), turning the angle changes the ratios.
 * - The reference angle can be swapped from A to C = 90° − A: the side opposite one is the side
 *   adjacent to the other, so sin A = cos C, tan A = cot C, sec A = cosec C (8.4).
 * - Given mode (NCERT "if sin A = 1/3"): the triangle is set by one ratio n/d of the first vertex's
 *   angle, its sides drawn as multiples of k; the steps find the third side by Pythagoras, then
 *   every ratio. Name the vertices so the given angle comes first (Example 5: Q, P, O).
 */

export const RatioReference = { A: "A", C: "C" } as const;
export type RatioReference = (typeof RatioReference)[keyof typeof RatioReference];

export const RatiosAction = {
  NudgeAngle: "nudgeAngle",
  NudgeSize: "nudgeSize",
  Swap: "swap",
  SetAngle: "setAngle",
  Next: "next",
  Reset: "reset",
} as const;
export const RatiosSignal = { Changed: "changed", Swapped: "swapped", Stepped: "stepped" } as const;
export const RatiosDerived = {
  Angle: "angle",
  Sides: "sides",
  Values: "values",
  Pairs: "pairs",
  Working: "working",
} as const;
export const RatiosPart = {
  Triangle: "triangle",
  Sides: "sides",
  Ratios: "ratios",
  Pairs: "pairs",
  Working: "working",
  Controls: "controls",
  Next: "next",
} as const;

/** The largest hypotenuse; the picture is framed for it, so scaling visibly changes the size. */
export const SIZE_MAX = 12;

/** Lines of working in given mode: the ratio as sides, the third side, the other ratios. */
export const GIVEN_STEPS = 3;

const given = z
  .object({
    ratio: z.nativeEnum(Ratio),
    num: z.number().int().min(1).max(40),
    den: z.number().int().min(1).max(40),
  })
  .strict();
export type GivenRatio = z.infer<typeof given>;

const ratiosState = z
  .object({
    /** The angle at the first vertex (A), in degrees. */
    angle: z.number().min(1).max(89),
    /** How far one turn moves the angle (°). */
    angleStep: z.number().min(1).max(15),
    /** The hypotenuse's length (units); scaling changes it, not the ratios. */
    size: z.number().min(1).max(SIZE_MAX),
    sizeStep: z.number().min(0.5).max(5),
    /** Which acute angle the sides are named from. */
    reference: z.nativeEnum(RatioReference),
    /** Vertex names: first acute angle, right angle, second acute angle. */
    names: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
    /** Which ratios are listed under the picture. */
    shown: z.array(z.nativeEnum(Ratio)).max(6),
    /** Label each side opposite / adjacent / hypotenuse (relative to the reference angle). */
    showSides: z.boolean(),
    /** Write side lengths on the picture and the ratios' values. */
    showValues: z.boolean(),
    /** List each ratio of A beside the equal ratio of the other angle (8.4). */
    showPairs: z.boolean(),
    /** Given mode: the triangle is fixed by this one ratio (sides in k); null for free mode. */
    given: given.nullable(),
    /** Given mode: how many lines of working are shown. */
    step: z.number().int().min(0).max(GIVEN_STEPS),
    canSetAngle: z.boolean(),
    canScale: z.boolean(),
    canSwap: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type RatiosState = z.infer<typeof ratiosState>;

/** In given mode, the three sides as multiples of k: [opposite, adjacent, hypotenuse] squared. */
export function givenSquares(g: GivenRatio): Record<Side, number> | null {
  const [top, bottom] = RATIO_SIDES[g.ratio];
  const sq: Partial<Record<Side, number>> = { [top]: g.num * g.num, [bottom]: g.den * g.den };
  const third = [Side.Opposite, Side.Adjacent, Side.Hypotenuse].find((s) => sq[s] === undefined);
  if (third === undefined) return null;
  if (third === Side.Hypotenuse) sq[third] = (sq.opposite ?? 0) + (sq.adjacent ?? 0);
  else
    sq[third] = (sq.hypotenuse ?? 0) - (sq[third === Side.Opposite ? "adjacent" : "opposite"] ?? 0);
  if ((sq[third] ?? 0) <= 0) return null;
  return sq as Record<Side, number>;
}

/** The angle at A (°): set directly, or fixed by the given ratio. */
export function angleOf(s: Pick<RatiosState, "angle" | "given">): number {
  if (s.given === null) return s.angle;
  const sq = givenSquares(s.given);
  if (sq === null) return s.angle;
  return clean(deg(Math.atan2(Math.sqrt(sq.opposite), Math.sqrt(sq.adjacent))));
}

/** The reference angle (°): A, or C = 90° − A. */
export const referenceAngleOf = (s: RatiosState): number =>
  s.reference === RatioReference.A ? angleOf(s) : clean(90 - angleOf(s));

/** Side lengths: AB (adjacent to A), BC (opposite A), AC (hypotenuse). */
export function lengthsOf(s: RatiosState): { ab: number; bc: number; ac: number } {
  const a = rad(angleOf(s));
  if (s.given !== null) {
    const sq = givenSquares(s.given);
    if (sq !== null) {
      // Draw with k chosen so the hypotenuse has the state's size.
      const k = s.size / Math.sqrt(sq.hypotenuse);
      return {
        ab: clean(Math.sqrt(sq.adjacent) * k),
        bc: clean(Math.sqrt(sq.opposite) * k),
        ac: s.size,
      };
    }
  }
  return { ab: clean(s.size * Math.cos(a)), bc: clean(s.size * Math.sin(a)), ac: s.size };
}

/** Each side's name relative to the reference angle, by segment. */
export function sideRoles(s: RatiosState): { ab: Side; bc: Side; ac: Side } {
  return s.reference === RatioReference.A
    ? { ab: Side.Adjacent, bc: Side.Opposite, ac: Side.Hypotenuse }
    : { ab: Side.Opposite, bc: Side.Adjacent, ac: Side.Hypotenuse };
}

/** The value of each ratio of the reference angle. */
export function valuesOf(s: RatiosState): Record<Ratio, number | null> {
  const a = referenceAngleOf(s);
  return Object.fromEntries(RATIOS.map((r) => [r, ratioValue(r, a)])) as Record<
    Ratio,
    number | null
  >;
}

/** The segment (two vertex names) for a side, relative to the reference. */
export function segmentFor(s: RatiosState, side: Side): string {
  const [a, b, c] = s.names;
  const roles = sideRoles(s);
  if (roles.ab === side) return `${a}${b}`;
  if (roles.bc === side) return `${b}${c}`;
  return `${a}${c}`;
}

/** A ratio as a fraction of segment names: sin A = BC/AC. */
export function ratioAsSides(s: RatiosState, ratio: Ratio): string {
  const [top, bottom] = RATIO_SIDES[ratio];
  return `\\dfrac{${segmentFor(s, top)}}{${segmentFor(s, bottom)}}`;
}

/** Given mode: each side as TeX in k (opposite, adjacent, hypotenuse). */
export function givenSideTex(g: GivenRatio): Record<Side, string> | null {
  const sq = givenSquares(g);
  if (sq === null) return null;
  const tex = (n: number): string => {
    const r = sqrtTex(n);
    return r === "1" ? "k" : `${r}k`;
  };
  return { opposite: tex(sq.opposite), adjacent: tex(sq.adjacent), hypotenuse: tex(sq.hypotenuse) };
}

/** Given mode: the value of a ratio as an exact TeX fraction, e.g. \tfrac{2\sqrt{2}}{3}. */
export function givenRatioTex(g: GivenRatio, ratio: Ratio): string | null {
  const t = givenSideTex(g);
  if (t === null) return null;
  const [top, bottom] = RATIO_SIDES[ratio];
  const strip = (x: string): string => (x === "k" ? "1" : x.replace(/k$/, ""));
  const n = strip(t[top]);
  const d = strip(t[bottom]);
  return d === "1" ? n : `\\tfrac{${n}}{${d}}`;
}

/** Given mode working, as TeX lines. */
export function workingOf(s: RatiosState): string[] {
  const g = s.given;
  if (g === null) return [];
  const sq = givenSquares(g);
  const t = givenSideTex(g);
  if (sq === null || t === null) return [];
  const [top, bottom] = RATIO_SIDES[g.ratio];
  // The given ratio is always of the first vertex's angle (name the vertices to suit).
  const ang = s.names[0];
  const third = [Side.Opposite, Side.Adjacent, Side.Hypotenuse].find(
    (x) => x !== top && x !== bottom,
  ) as Side;
  const op = g.ratio === Ratio.Cosec ? "\\operatorname{cosec}" : `\\${g.ratio}`;
  const thirdSeg = segmentFor(s, third);
  const thirdLine =
    third === Side.Hypotenuse
      ? `${thirdSeg}^2 = (${t.opposite})^2 + (${t.adjacent})^2 = ${sq.hypotenuse}k^2,\\ ${thirdSeg} = ${t.hypotenuse}`
      : `${thirdSeg}^2 = (${t.hypotenuse})^2 - (${t[third === Side.Opposite ? Side.Adjacent : Side.Opposite]})^2 = ${sq[third]}k^2,\\ ${thirdSeg} = ${t[third]}`;
  const rest = [Ratio.Sin, Ratio.Cos, Ratio.Tan]
    .filter((r) => r !== g.ratio)
    .map((r) => `\\${r} ${ang} = ${givenRatioTex(g, r)}`)
    .join(",\\quad ");
  return [
    `${op} ${ang} = \\dfrac{${g.num}}{${g.den}}:\\ ${segmentFor(s, top)} = ${t[top]},\\ ${segmentFor(s, bottom)} = ${t[bottom]}`,
    thirdLine,
    rest,
  ];
}

function changed(s: RatiosState): Emit[] {
  const v = valuesOf(s);
  return [
    {
      signal: RatiosSignal.Changed,
      payload: {
        angle: referenceAngleOf(s),
        size: s.size,
        sin: v.sin === null ? null : clean(v.sin),
        cos: v.cos === null ? null : clean(v.cos),
        tan: v.tan === null ? null : clean(v.tan),
      },
    },
  ];
}

const act = actionsFor<RatiosState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const trigRatios = defineProp({
  type: "trigRatios",
  describe:
    "A right triangle (right-angled at the middle vertex, ABC by default) for the trigonometric ratios. The learner turns the angle at A and scales the triangle: every side changes but the ratios do not (the triangles are similar), while a different angle gives different ratios. Each side can be labelled opposite / adjacent / hypotenuse relative to the reference angle, and the six ratios (sin, cos, tan, cosec, sec, cot) listed as side ÷ side with their values. The reference can be swapped to the other acute angle (90° − A): opposite and adjacent trade places, so sin A = cos(90° − A), tan A = cot(90° − A), sec A = cosec(90° − A). Given mode fixes the triangle by one ratio (e.g. sin A = 1/3) with sides in k and steps through Pythagoras to the other ratios.",
  state: ratiosState,
  defaults: {
    angle: 35,
    angleStep: 5,
    size: 8,
    sizeStep: 1,
    reference: RatioReference.A,
    names: ["A", "B", "C"],
    shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan],
    showSides: true,
    showValues: true,
    showPairs: false,
    given: null,
    step: 0,
    canSetAngle: true,
    canScale: true,
    canSwap: false,
    canStep: false,
  },
  inputs: ["showSides", "showValues", "showPairs", "canSetAngle", "canScale", "canSwap"],
  invariant: (s) =>
    s.given !== null && givenSquares(s.given) === null
      ? "the given ratio can't be a ratio of a right triangle's sides"
      : s.given !== null && s.reference !== RatioReference.A
        ? "given mode names the sides from the first vertex: keep the reference at A"
        : new Set(s.names).size !== 3
          ? "the three vertex names must differ"
          : undefined,
  derived: {
    [RatiosDerived.Angle]: {
      describe: "The reference angle in degrees (A, or 90° − A after a swap)",
      compute: referenceAngleOf,
    },
    [RatiosDerived.Sides]: {
      describe: "The side lengths AB, BC, AC (units) and which is opposite / adjacent / hypotenuse",
      compute: (s) => ({ ...lengthsOf(s), roles: sideRoles(s) }),
    },
    [RatiosDerived.Values]: {
      describe: "The value of each of the six ratios of the reference angle (null = not defined)",
      compute: valuesOf,
    },
    [RatiosDerived.Pairs]: {
      describe:
        "Each ratio of the reference angle and the ratio of the other acute angle it equals, e.g. sin A = cos C",
      compute: (s) => RATIOS.map((r) => ({ ratio: r, partner: PARTNER[r], value: valuesOf(s)[r] })),
    },
    [RatiosDerived.Working]: {
      describe: "Given mode: the working as TeX lines (sides in k, the third side, the ratios)",
      compute: workingOf,
    },
  },
  actions: {
    [RatiosAction.NudgeAngle]: act({
      describe: "Make the angle at A bigger (by: 1) or smaller (by: −1) by one angle step",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canSetAngle || s.given !== null) return set({});
        const angle = clean(Math.min(85, Math.max(5, s.angle + a.by * s.angleStep)));
        if (angle === s.angle) return set({});
        return set({ angle }, ...changed({ ...s, angle }));
      },
    }),
    [RatiosAction.NudgeSize]: act({
      describe: "Make the whole triangle bigger (by: 1) or smaller (by: −1), keeping its angles",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canScale) return set({});
        const size = clean(Math.min(SIZE_MAX, Math.max(2, s.size + a.by * s.sizeStep)));
        if (size === s.size) return set({});
        return set({ size }, ...changed({ ...s, size }));
      },
    }),
    [RatiosAction.Swap]: act({
      describe: "Name the sides from the other acute angle instead (A ↔ C = 90° − A)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canSwap || s.given !== null) return set({});
        const reference = s.reference === RatioReference.A ? RatioReference.C : RatioReference.A;
        const next = { ...s, reference };
        return set(
          { reference },
          { signal: RatiosSignal.Swapped, payload: { reference, angle: referenceAngleOf(next) } },
          ...changed(next),
        );
      },
    }),
    [RatiosAction.SetAngle]: act({
      describe: "Set the angle at A (°) (the lesson, not the learner)",
      byLearner: false,
      args: z.object({ angle: z.number().min(5).max(85) }).strict(),
      run: (s, a) => set({ angle: a.angle }, ...changed({ ...s, angle: a.angle })),
    }),
    [RatiosAction.Next]: act({
      describe: "Given mode: show the next line of working",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.given === null || s.step >= GIVEN_STEPS) return set({});
        const step = s.step + 1;
        return set({ step }, { signal: RatiosSignal.Stepped, payload: { step } });
      },
    }),
    [RatiosAction.Reset]: act({
      describe: "Given mode: hide the working again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [RatiosSignal.Changed]: {
      describe: "The angle or size changed; the payload has the angle, size, sin, cos and tan",
    },
    [RatiosSignal.Swapped]: { describe: "The reference angle was swapped; the payload has it" },
    [RatiosSignal.Stepped]: { describe: "Given mode: a line of working was shown" },
  },
  observe: (s) => {
    const l = lengthsOf(s);
    const [a, b, c] = s.names;
    const ref = s.reference === RatioReference.A ? a : c;
    const ang = referenceAngleOf(s);
    const v = valuesOf(s);
    const roles = sideRoles(s);
    const elements: Element[] = [
      {
        id: RatiosPart.Triangle,
        value:
          s.given === null
            ? `right triangle ${a}${b}${c}, right angle at ${b}; angle ${a} = ${numText(angleOf(s), 1)}°, angle ${c} = ${numText(90 - angleOf(s), 1)}°; ${a}${b} = ${numText(l.ab)}, ${b}${c} = ${numText(l.bc)}, ${a}${c} = ${numText(l.ac)}`
            : `right triangle ${a}${b}${c}, right angle at ${b}, with ${s.given.ratio} ${ref} = ${s.given.num}/${s.given.den}`,
      },
    ];
    if (s.showSides)
      elements.push({
        id: RatiosPart.Sides,
        value: `from angle ${ref}: ${a}${b} is ${roles.ab}, ${b}${c} is ${roles.bc}, ${a}${c} is the hypotenuse`,
      });
    if (s.shown.length > 0)
      elements.push({
        id: RatiosPart.Ratios,
        value: s.shown
          .map((r) => {
            const [t, bt] = RATIO_SIDES[r];
            const val = v[r];
            return `${r} ${ref} = ${segmentFor(s, t)}/${segmentFor(s, bt)}${s.showValues && s.given === null ? ` = ${val === null ? "not defined" : numText(val)}` : ""}`;
          })
          .join("; "),
      });
    if (s.showPairs)
      elements.push({
        id: RatiosPart.Pairs,
        value: RATIOS.map(
          (r) => `${r} ${ref} = ${PARTNER[r]} (90° − ${ref}) = ${PARTNER[r]} ${ref === a ? c : a}`,
        ).join("; "),
      });
    if (s.given !== null && s.step > 0)
      elements.push({ id: RatiosPart.Working, value: workingOf(s).slice(0, s.step).join("; ") });
    return {
      summary:
        s.given === null
          ? `A right triangle with angle ${ref} = ${numText(ang, 1)}°: sin ${ref} = ${numText(v.sin ?? 0)}, cos ${ref} = ${numText(v.cos ?? 0)}, tan ${ref} = ${v.tan === null ? "not defined" : numText(v.tan)}.`
          : `A right triangle in which ${s.given.ratio} ${ref} = ${s.given.num}/${s.given.den}.`,
      elements,
    };
  },
  parts: (s) => [
    RatiosPart.Triangle,
    ...(s.showSides ? [RatiosPart.Sides] : []),
    ...(s.shown.length > 0 ? [RatiosPart.Ratios] : []),
    ...(s.showPairs ? [RatiosPart.Pairs] : []),
    ...(s.given !== null && s.step > 0 ? [RatiosPart.Working] : []),
    ...(s.canSetAngle || s.canScale || s.canSwap ? [RatiosPart.Controls] : []),
    ...(s.given !== null && s.canStep ? [RatiosPart.Next] : []),
  ],
});
