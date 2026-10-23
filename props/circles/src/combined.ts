import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Pt, type Words, clean } from "./kit/geometry";
import { type PathCmd, shapes } from "./kit/path";

/**
 * Areas of combinations of plane figures (NCERT 12.4): the shaded region of a worked example,
 * found one piece at a time. Each step lights up one piece that is added or taken away and writes
 * its line of working; the last step adds the lines up.
 * - lawnBeds: Example 4, a square lawn of side 56 m with a flower bed on two opposite sides, each
 *   the segment of the circle centred at O (where the diagonals meet) beyond that side.
 * - fourCircles: Example 5, a square of side 14 cm with four circles of diameter 7 cm cut out.
 * - petals: Example 6, the design made by semicircles drawn inward on each side of a square of side
 *   10 cm (π = 3.14).
 */

export const CombinedKind = {
  LawnBeds: "lawnBeds",
  FourCircles: "fourCircles",
  Petals: "petals",
} as const;
export type CombinedKind = (typeof CombinedKind)[keyof typeof CombinedKind];

export type Term = {
  /** Added to the shaded area, or taken away from it. */
  op: 1 | -1;
  name: Words;
  /** The sum that gives this piece, in numbers. */
  working: string;
  value: number;
  /** The piece, to light up. */
  cmds: PathCmd[];
};

export type Figure = {
  question: Words;
  unit: "cm" | "m";
  /** The outline of every shape in the figure, drawn thin. */
  outlines: PathCmd[][];
  /** The shaded region (loops inside loops are holes). */
  shaded: PathCmd[][];
  labels: { at: Pt; text: string; away?: Pt; prefer?: number; isNote?: boolean }[];
  terms: Term[];
  /** The model-unit box to frame. */
  box: [Pt, Pt];
};

const O: Pt = [0, 0];

function lawnBeds(): Figure {
  const A: Pt = [-28, 28];
  const B: Pt = [-28, -28];
  const C: Pt = [28, -28];
  const D: Pt = [28, 28];
  const R = 28 * Math.SQRT2;
  const sectorAB = shapes.sector(O, R, 135, 225);
  const sectorCD = shapes.sector(O, R, -45, 45);
  return {
    question: {
      en: "Two circular flower beds on two sides of a square lawn ABCD of side 56 m; O, where the diagonals meet, is the centre of each. Find the area of the lawn and the beds together.",
      hi: "भुजा 56 m वाले वर्गाकार लॉन ABCD के दो ओर दो वृत्ताकार फूलों की क्यारियाँ हैं; विकर्णों का प्रतिच्छेद बिंदु O दोनों का केंद्र है। लॉन और क्यारियों का कुल क्षेत्रफल ज्ञात करो।",
    },
    unit: "m",
    outlines: [
      shapes.polygon([A, B, C, D]),
      shapes.polygon([A, C]),
      shapes.polygon([B, D]),
      sectorAB,
      sectorCD,
    ],
    shaded: [
      shapes.polygon([A, B, C, D]),
      shapes.segment(O, R, 135, 225),
      shapes.segment(O, R, -45, 45),
    ],
    labels: [
      { at: A, text: "A", away: O },
      { at: B, text: "B", away: O },
      { at: C, text: "C", away: O },
      { at: D, text: "D", away: O },
      { at: O, text: "O", prefer: 90 },
      { at: [0, 28], text: "56 m", prefer: 90, isNote: true },
    ],
    terms: [
      {
        op: 1,
        name: { en: "square lawn ABCD", hi: "वर्गाकार लॉन ABCD" },
        working: "56 × 56 = 3136",
        value: 3136,
        cmds: shapes.polygon([A, B, C, D]),
      },
      {
        op: 1,
        name: {
          en: "sector OAB (OA² = 28 × 56, ∠AOB = 90°)",
          hi: "त्रिज्यखंड OAB (OA² = 28 × 56, ∠AOB = 90°)",
        },
        working: "¼ × 22/7 × 28 × 56 = 1232",
        value: 1232,
        cmds: sectorAB,
      },
      {
        op: -1,
        name: { en: "∆OAB", hi: "∆OAB" },
        working: "¼ × 56 × 56 = 784",
        value: 784,
        cmds: shapes.polygon([O, A, B]),
      },
      {
        op: 1,
        name: { en: "sector OCD", hi: "त्रिज्यखंड OCD" },
        working: "¼ × 22/7 × 28 × 56 = 1232",
        value: 1232,
        cmds: sectorCD,
      },
      {
        op: -1,
        name: { en: "∆OCD", hi: "∆OCD" },
        working: "¼ × 56 × 56 = 784",
        value: 784,
        cmds: shapes.polygon([O, C, D]),
      },
    ],
    box: [
      [-R - 2, -30],
      [R + 2, 32],
    ],
  };
}

function fourCircles(): Figure {
  const sq = shapes.rect(-7, -7, 7, 7);
  const centres: Pt[] = [
    [-3.5, 3.5],
    [3.5, 3.5],
    [3.5, -3.5],
    [-3.5, -3.5],
  ];
  const circles = centres.map((c) => shapes.circle(c, 3.5));
  return {
    question: {
      en: "ABCD is a square of side 14 cm with four equal circles inside it, as shown. Find the area of the shaded region.",
      hi: "ABCD भुजा 14 cm का एक वर्ग है जिसके अंदर चार बराबर वृत्त हैं, जैसा दिखाया है। छायांकित भाग का क्षेत्रफल ज्ञात करो।",
    },
    unit: "cm",
    outlines: [sq, ...circles],
    shaded: [sq, ...circles],
    labels: [
      { at: [-7, 7], text: "A", away: O },
      { at: [7, 7], text: "B", away: O },
      { at: [7, -7], text: "C", away: O },
      { at: [-7, -7], text: "D", away: O },
      { at: [0, -7], text: "14 cm", prefer: 270, isNote: true },
    ],
    terms: [
      {
        op: 1,
        name: { en: "square ABCD", hi: "वर्ग ABCD" },
        working: "14 × 14 = 196",
        value: 196,
        cmds: sq,
      },
      {
        op: -1,
        name: { en: "four circles, each of radius 7/2 cm", hi: "चार वृत्त, हर एक की त्रिज्या 7/2 cm" },
        working: "4 × 22/7 × 7/2 × 7/2 = 154",
        value: 154,
        cmds: circles.flat(),
      },
    ],
    box: [
      [-7.5, -8.5],
      [7.5, 8.5],
    ],
  };
}

function petals(): Figure {
  const sq = shapes.rect(-5, -5, 5, 5);
  const one: PathCmd[] = [
    { k: "M", p: [-5, -5] },
    { k: "L", p: [-5, 5] },
    { k: "A", c: [0, 5], r: 5, from: 180, to: 270 },
    { k: "A", c: [0, -5], r: 5, from: 90, to: 180 },
    { k: "Z" },
  ];
  const three: PathCmd[] = [
    { k: "M", p: [5, 5] },
    { k: "L", p: [5, -5] },
    { k: "A", c: [0, -5], r: 5, from: 0, to: 90 },
    { k: "A", c: [0, 5], r: 5, from: 270, to: 360 },
    { k: "Z" },
  ];
  const two: PathCmd[] = [
    { k: "M", p: [5, 5] },
    { k: "L", p: [-5, 5] },
    { k: "A", c: [-5, 0], r: 5, from: 90, to: 0, cw: true },
    { k: "A", c: [5, 0], r: 5, from: 180, to: 90, cw: true },
    { k: "Z" },
  ];
  const four: PathCmd[] = [
    { k: "M", p: [-5, -5] },
    { k: "L", p: [5, -5] },
    { k: "A", c: [5, 0], r: 5, from: 270, to: 180, cw: true },
    { k: "A", c: [-5, 0], r: 5, from: 0, to: -90, cw: true },
    { k: "Z" },
  ];
  return {
    question: {
      en: "ABCD is a square of side 10 cm, and a semicircle is drawn inside it on each side as diameter. Find the area of the shaded design (use π = 3.14).",
      hi: "ABCD भुजा 10 cm का वर्ग है, और हर भुजा को व्यास मानकर उसके अंदर एक अर्धवृत्त खींचा गया है। छायांकित डिज़ाइन का क्षेत्रफल ज्ञात करो (π = 3.14 लो)।",
    },
    unit: "cm",
    outlines: [
      sq,
      shapes.segment([0, 5], 5, 180, 360),
      shapes.segment([0, -5], 5, 0, 180),
      shapes.segment([5, 0], 5, 90, 270),
      shapes.segment([-5, 0], 5, -90, 90),
    ],
    shaded: [sq, one, two, three, four],
    labels: [
      { at: [-5, 5], text: "A", away: O },
      { at: [5, 5], text: "B", away: O },
      { at: [5, -5], text: "C", away: O },
      { at: [-5, -5], text: "D", away: O },
      { at: [-4, 0], text: "I", isNote: true, prefer: 0 },
      { at: [0, 4], text: "II", isNote: true, prefer: 270 },
      { at: [4, 0], text: "III", isNote: true, prefer: 180 },
      { at: [0, -4], text: "IV", isNote: true, prefer: 90 },
      { at: [0, -5], text: "10 cm", prefer: 270, isNote: true },
    ],
    terms: [
      {
        op: 1,
        name: { en: "square ABCD", hi: "वर्ग ABCD" },
        working: "10 × 10 = 100",
        value: 100,
        cmds: sq,
      },
      {
        op: -1,
        name: {
          en: "I + III (the square less the semicircles on AB and CD)",
          hi: "I + III (वर्ग में से AB और CD वाले अर्धवृत्त घटाकर)",
        },
        working: "100 − 2 × ½ × 3.14 × 5² = 21.5",
        value: 21.5,
        cmds: [...one, ...three],
      },
      {
        op: -1,
        name: { en: "II + IV (the same way)", hi: "II + IV (इसी तरह)" },
        working: "100 − 2 × ½ × 3.14 × 5² = 21.5",
        value: 21.5,
        cmds: [...two, ...four],
      },
    ],
    box: [
      [-5.5, -6.6],
      [5.5, 6],
    ],
  };
}

export function figureOf(kind: CombinedKind): Figure {
  switch (kind) {
    case CombinedKind.LawnBeds:
      return lawnBeds();
    case CombinedKind.FourCircles:
      return fourCircles();
    case CombinedKind.Petals:
      return petals();
  }
}

/** The shaded area: the pieces added up. */
export const totalOf = (s: Pick<CombinedState, "kind">): number =>
  clean(figureOf(s.kind).terms.reduce((sum, t) => sum + t.op * t.value, 0));

/** Steps: the question, one per piece, then the total. */
export const combinedStepCountOf = (s: Pick<CombinedState, "kind">): number =>
  figureOf(s.kind).terms.length + 2;

export const CombinedAction = { Next: "next", Back: "back", Reset: "reset", GoTo: "goTo" } as const;
export const CombinedSignal = { Stepped: "stepped", Done: "done" } as const;
export const CombinedDerived = {
  StepCount: "stepCount",
  Total: "total",
  IsDone: "isDone",
} as const;
export const CombinedPart = { Figure: "figure", Working: "working", Steps: "steps" } as const;

const combinedState = z
  .object({
    kind: z.nativeEnum(CombinedKind),
    step: z.number().int().min(0).max(12),
    canStep: z.boolean(),
  })
  .strict();
export type CombinedState = z.infer<typeof combinedState>;

function stepped(s: CombinedState, step: number): Emit[] {
  const out: Emit[] = [{ signal: CombinedSignal.Stepped, payload: { step } }];
  if (step === combinedStepCountOf(s) - 1 && s.step !== step)
    out.push({ signal: CombinedSignal.Done, payload: { total: totalOf(s) } });
  return out;
}

const act = actionsFor<CombinedState>();

export const combinedFigures = defineProp({
  type: "combinedFigures",
  describe:
    "The shaded region of an NCERT 12.4 worked example, found one piece at a time: each step lights up one shape that is added to or taken away from the shaded area and writes its line of working, and the last step adds them up. lawnBeds is Example 4 (a square lawn of side 56 m with flower beds that are segments of the circle through its corners, centred where the diagonals meet: 3136 + 1232 − 784 + 1232 − 784 = 4032 m²); fourCircles is Example 5 (a square of side 14 cm less four circles of diameter 7 cm: 196 − 154 = 42 cm²); petals is Example 6 (semicircles drawn inward on each side of a square of side 10 cm, π = 3.14: 100 − 21.5 − 21.5 = 57 cm²).",
  state: combinedState,
  defaults: { kind: CombinedKind.FourCircles, step: 0, canStep: true },
  inputs: ["canStep"],
  invariant: (s) => (s.step >= combinedStepCountOf(s) ? "step is past the last step" : undefined),
  derived: {
    [CombinedDerived.StepCount]: {
      describe: "How many steps (the question, one per piece, the total)",
      compute: combinedStepCountOf,
    },
    [CombinedDerived.Total]: { describe: "The shaded area (m² or cm²)", compute: totalOf },
    [CombinedDerived.IsDone]: {
      describe: "Whether the total is showing",
      compute: (s) => s.step === combinedStepCountOf(s) - 1,
    },
  },
  actions: {
    [CombinedAction.Next]: act({
      describe: "Take the next piece",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep) return set({});
        const step = Math.min(combinedStepCountOf(s) - 1, s.step + 1);
        return step === s.step ? set({}) : set({ step }, ...stepped(s, step));
      },
    }),
    [CombinedAction.Back]: act({
      describe: "Go back one piece",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: CombinedSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [CombinedAction.Reset]: act({
      describe: "Start again from the question",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: CombinedSignal.Stepped, payload: { step: 0 } }),
    }),
    [CombinedAction.GoTo]: act({
      describe: "Show a given step (0 is the question)",
      args: z.object({ step: z.number().int().min(0).max(12) }).strict(),
      run: (s, a) => {
        const step = Math.min(combinedStepCountOf(s) - 1, a.step);
        return set({ step }, ...stepped(s, step));
      },
    }),
  },
});
