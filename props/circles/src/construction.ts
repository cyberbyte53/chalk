import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Pt,
  type Words,
  add,
  angleOf,
  circleCircle,
  clean,
  dist,
  isTriangle,
  lerp,
  mid,
  numText,
  onCircle,
  placeTriangle,
  scale,
  sub,
  tangentLength,
  unit,
} from "./kit/geometry";

/**
 * Ruler-and-compass constructions, one step at a time (NCERT Class 10 Ch 11, and the tangent at a
 * point from Ch 10). Each tap of "next" adds the step's arcs and lines, with the compass or ruler
 * that makes it, and a caption saying what to do. The last step states the result and why it
 * works.
 *
 * - divide: divide AB in the ratio m : n (Construction 11.1).
 * - divideAlt: the alternative method with two parallel rays (Construction 11.1, second way).
 * - similar: a triangle similar to ABC with scale factor m/n, smaller or larger (Construction 11.2).
 * - tangentAtPoint: the tangent at a point P of a circle (11.3, first paragraph).
 * - tangentsFromPoint: the pair of tangents from an outside point P (Construction 11.3).
 * - tangentsAtAngle: a pair of tangents inclined at a given angle (Exercise 11.2 Q4).
 *
 * Model units are cm, y up.
 */

export const ConstructionKind = {
  Divide: "divide",
  DivideAlt: "divideAlt",
  Similar: "similar",
  TangentAtPoint: "tangentAtPoint",
  TangentsFromPoint: "tangentsFromPoint",
  TangentsAtAngle: "tangentsAtAngle",
} as const;
export type ConstructionKind = (typeof ConstructionKind)[keyof typeof ConstructionKind];

export type Tone = "main" | "accent" | "result" | "construction" | "muted" | "wrong";

/** One thing a step draws. */
export type Item =
  | { k: "seg"; from: Pt; to: Pt; tone?: Tone; dashed?: boolean }
  | { k: "ray"; from: Pt; to: Pt; tone?: Tone }
  | { k: "circle"; c: Pt; r: number; tone?: Tone }
  | { k: "arc"; c: Pt; r: number; from: number; to: number; tone?: Tone }
  | { k: "point"; at: Pt; tone?: Tone; kind?: "solid" | "hollow" | "centre" }
  | { k: "label"; at: Pt; text: string; away?: Pt; prefer?: number; tone?: Tone; small?: boolean }
  | { k: "right"; v: Pt; p: Pt; q: Pt }
  | { k: "angle"; v: Pt; p: Pt; q: Pt; label?: string; count?: number; tone?: Tone }
  | { k: "ticks"; from: Pt; to: Pt; count: number }
  | { k: "parallel"; from: Pt; to: Pt; count: number };

export type Tool =
  | { k: "compass"; c: Pt; r: number; angle: number }
  | { k: "ruler"; from: Pt; to: Pt };

export type Step = { caption: Words; items: Item[]; tool?: Tool };

export const ConstructionAction = {
  Next: "next",
  Back: "back",
  Reset: "reset",
  GoTo: "goTo",
} as const;
export const ConstructionSignal = { Stepped: "stepped", Done: "done" } as const;
export const ConstructionDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Result: "result",
} as const;
export const ConstructionPart = {
  Figure: "figure",
  Caption: "caption",
  Steps: "steps",
} as const;

const constructionState = z
  .object({
    kind: z.nativeEnum(ConstructionKind),
    /** The step shown (0 is the starting figure). */
    step: z.number().int().min(0).max(20),
    canStep: z.boolean(),
    /** Draw the compass or ruler for the step being made. */
    showTool: z.boolean(),
    /** divide, divideAlt: AB in cm. */
    length: z.number().min(1).max(20),
    /** divide: the ratio m : n; similar: the scale factor m/n. */
    m: z.number().int().min(1).max(9),
    n: z.number().int().min(1).max(9),
    /** similar: the given triangle's sides in cm. */
    ab: z.number().min(1).max(20),
    bc: z.number().min(1).max(20),
    ca: z.number().min(1).max(20),
    /** Circle constructions: the radius, and (tangentsFromPoint) OP, in cm. */
    r: z.number().min(1).max(20),
    d: z.number().min(1).max(40),
    /** tangentsAtAngle: the angle between the tangents, in degrees. */
    angle: z.number().min(20).max(160),
  })
  .strict();
export type ConstructionState = z.infer<typeof constructionState>;

const sub_ = (i: number): string =>
  `${i}`
    .split("")
    .map((c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)])
    .join("");

/** A short arc of a circle around the direction `toward` (degrees), for a compass mark. */
const markArc = (
  c: Pt,
  r: number,
  toward: number,
  half = 14,
  tone: Tone = "construction",
): Item => ({
  k: "arc",
  c,
  r,
  from: toward - half,
  to: toward + half,
  tone,
});

/** Divide AB in m : n with one ray (Construction 11.1). */
function divideSteps(s: ConstructionState): Step[] {
  const { length: L, m, n } = s;
  const A: Pt = [0, 0];
  const B: Pt = [L, 0];
  const total = m + n;
  const gap = Math.min(1.2, (L * 0.95) / total);
  const dir = unit(-35);
  const pt = (i: number): Pt => add(A, scale(dir, gap * i));
  const X = pt(total + 1.3);
  const C = lerp(A, B, m / total);
  const Am = pt(m);
  const Ak = pt(total);
  const marks: Item[] = [];
  for (let i = 1; i <= total; i++) {
    marks.push(markArc(pt(i - 1), gap, -35));
    marks.push({ k: "point", at: pt(i), tone: i === m || i === total ? "accent" : "main" });
    if (i === 1 || i === m || i === total)
      marks.push({ k: "label", at: pt(i), text: `A${sub_(i)}`, prefer: 135, small: true });
  }
  return [
    {
      caption: {
        en: `Draw the line segment AB, ${numText(L)} cm long.`,
        hi: `रेखाखंड AB खींचो, ${numText(L)} cm लंबा।`,
      },
      items: [
        { k: "seg", from: A, to: B },
        { k: "point", at: A },
        { k: "point", at: B },
        { k: "label", at: A, text: "A", prefer: 180 },
        { k: "label", at: B, text: "B", prefer: 0 },
      ],
      tool: { k: "ruler", from: A, to: B },
    },
    {
      caption: {
        en: "Draw any ray AX making an acute angle with AB.",
        hi: "कोई किरण AX खींचो जो AB के साथ न्यून कोण बनाए।",
      },
      items: [
        { k: "ray", from: A, to: X },
        { k: "label", at: X, text: "X", prefer: 315 },
      ],
      tool: { k: "ruler", from: A, to: X },
    },
    {
      caption: {
        en: `Keep the compass open at one width. From A, mark ${total} (= ${m} + ${n}) equal steps along AX: A₁, A₂, …, A${sub_(total)}.`,
        hi: `परकार को एक ही चौड़ाई पर खुला रखो। A से AX पर ${total} (= ${m} + ${n}) बराबर कदम लगाओ: A₁, A₂, …, A${sub_(total)}।`,
      },
      items: marks,
      tool: { k: "compass", c: pt(total - 1), r: gap, angle: -35 },
    },
    {
      caption: { en: `Join B to A${sub_(total)}.`, hi: `B को A${sub_(total)} से मिलाओ।` },
      items: [{ k: "seg", from: Ak, to: B, tone: "accent" }],
      tool: { k: "ruler", from: Ak, to: B },
    },
    {
      caption: {
        en: `Through A${sub_(m)}, draw a line parallel to A${sub_(total)}B (make an angle equal to ∠AA${sub_(total)}B at A${sub_(m)}). It meets AB at C.`,
        hi: `A${sub_(m)} से होकर A${sub_(total)}B के समांतर रेखा खींचो (A${sub_(m)} पर ∠AA${sub_(total)}B के बराबर कोण बनाकर)। यह AB को C पर काटती है।`,
      },
      items: [
        { k: "angle", v: Ak, p: A, q: B, count: 1, tone: "accent" },
        { k: "angle", v: Am, p: A, q: C, count: 1, tone: "accent" },
        { k: "seg", from: Am, to: C, tone: "result" },
        { k: "parallel", from: Ak, to: B, count: 1 },
        { k: "parallel", from: Am, to: C, count: 1 },
        { k: "point", at: C, tone: "result" },
        { k: "label", at: C, text: "C", prefer: 270, tone: "result" },
      ],
      tool: { k: "ruler", from: Am, to: C },
    },
    {
      caption: {
        en: `C divides AB in the ratio ${m} : ${n}. Why: A${sub_(m)}C ∥ A${sub_(total)}B, so by the Basic Proportionality Theorem AC : CB = AA${sub_(m)} : A${sub_(m)}A${sub_(total)} = ${m} : ${n}.`,
        hi: `C, AB को ${m} : ${n} के अनुपात में बाँटता है। क्यों: A${sub_(m)}C ∥ A${sub_(total)}B, इसलिए आधारभूत समानुपातिकता प्रमेय से AC : CB = AA${sub_(m)} : A${sub_(m)}A${sub_(total)} = ${m} : ${n}।`,
      },
      items: [
        { k: "seg", from: A, to: C, tone: "result" },
        {
          k: "label",
          at: mid(A, C),
          text: `${numText((L * m) / total)} cm`,
          prefer: 270,
          small: true,
          tone: "result",
        },
        {
          k: "label",
          at: mid(C, B),
          text: `${numText((L * n) / total)} cm`,
          prefer: 270,
          small: true,
        },
      ],
    },
  ];
}

/** Divide AB in m : n with two parallel rays (Construction 11.1, the alternative method). */
function divideAltSteps(s: ConstructionState): Step[] {
  const { length: L, m, n } = s;
  const A: Pt = [0, 0];
  const B: Pt = [L, 0];
  const gap = Math.min(1.2, (L * 0.8) / Math.max(m, n));
  const dA = unit(-40);
  const dB = unit(140);
  const a = (i: number): Pt => add(A, scale(dA, gap * i));
  const b = (i: number): Pt => add(B, scale(dB, gap * i));
  const X = a(m + 1.3);
  const Y = b(n + 1.3);
  const C = lerp(A, B, m / (m + n));
  const marks = (pt: (i: number) => Pt, count: number, toward: number, name: string): Item[] => {
    const out: Item[] = [];
    for (let i = 1; i <= count; i++) {
      out.push(markArc(pt(i - 1), gap, toward));
      out.push({ k: "point", at: pt(i), tone: i === count ? "accent" : "main" });
      if (i === 1 || i === count)
        out.push({
          k: "label",
          at: pt(i),
          text: `${name}${sub_(i)}`,
          prefer: toward + 90,
          small: true,
        });
    }
    return out;
  };
  return [
    {
      caption: {
        en: `Draw the line segment AB, ${numText(L)} cm long.`,
        hi: `रेखाखंड AB खींचो, ${numText(L)} cm लंबा।`,
      },
      items: [
        { k: "seg", from: A, to: B },
        { k: "point", at: A },
        { k: "point", at: B },
        { k: "label", at: A, text: "A", prefer: 180 },
        { k: "label", at: B, text: "B", prefer: 0 },
      ],
      tool: { k: "ruler", from: A, to: B },
    },
    {
      caption: {
        en: "Draw any ray AX making an acute angle with AB.",
        hi: "कोई किरण AX खींचो जो AB के साथ न्यून कोण बनाए।",
      },
      items: [
        { k: "ray", from: A, to: X },
        { k: "label", at: X, text: "X", prefer: 315 },
      ],
      tool: { k: "ruler", from: A, to: X },
    },
    {
      caption: {
        en: "Draw a ray BY parallel to AX, on the other side of AB, by making ∠ABY equal to ∠BAX.",
        hi: "AB के दूसरी ओर AX के समांतर किरण BY खींचो, ∠ABY को ∠BAX के बराबर बनाकर।",
      },
      items: [
        { k: "ray", from: B, to: Y },
        { k: "label", at: Y, text: "Y", prefer: 135 },
        { k: "angle", v: A, p: B, q: X, tone: "accent" },
        { k: "angle", v: B, p: A, q: Y, tone: "accent" },
      ],
      tool: { k: "ruler", from: B, to: Y },
    },
    {
      caption: {
        en: `With one compass width, mark ${m} equal steps A₁ … A${sub_(m)} on AX and ${n} equal steps B₁ … B${sub_(n)} on BY.`,
        hi: `परकार की एक ही चौड़ाई से AX पर ${m} बराबर कदम A₁ … A${sub_(m)} और BY पर ${n} बराबर कदम B₁ … B${sub_(n)} लगाओ।`,
      },
      items: [...marks(a, m, -40, "A"), ...marks(b, n, 140, "B")],
      tool: { k: "compass", c: b(n - 1), r: gap, angle: 140 },
    },
    {
      caption: {
        en: `Join A${sub_(m)}B${sub_(n)}. It cuts AB at C.`,
        hi: `A${sub_(m)}B${sub_(n)} को मिलाओ। यह AB को C पर काटती है।`,
      },
      items: [
        { k: "seg", from: a(m), to: b(n), tone: "result" },
        { k: "point", at: C, tone: "result" },
        { k: "label", at: C, text: "C", prefer: 300, tone: "result" },
      ],
      tool: { k: "ruler", from: a(m), to: b(n) },
    },
    {
      caption: {
        en: `AC : CB = ${m} : ${n}. Why: ∆AA${sub_(m)}C ~ ∆BB${sub_(n)}C (AA: the alternate angles at A and B are equal, and the angles at C are vertically opposite), so AC : BC = AA${sub_(m)} : BB${sub_(n)} = ${m} : ${n}.`,
        hi: `AC : CB = ${m} : ${n}। क्यों: ∆AA${sub_(m)}C ~ ∆BB${sub_(n)}C (AA: A और B पर एकांतर कोण बराबर हैं, और C पर शीर्षाभिमुख कोण), इसलिए AC : BC = AA${sub_(m)} : BB${sub_(n)} = ${m} : ${n}।`,
      },
      items: [
        { k: "seg", from: A, to: C, tone: "result" },
        {
          k: "label",
          at: mid(A, C),
          text: `${numText((L * m) / (m + n))} cm`,
          prefer: 90,
          small: true,
          tone: "result",
        },
        {
          k: "label",
          at: mid(C, B),
          text: `${numText((L * n) / (m + n))} cm`,
          prefer: 270,
          small: true,
        },
      ],
    },
  ];
}

/** The given triangle, and the scaled one's vertices, for the similar-triangle construction. */
export function similarPoints(s: Pick<ConstructionState, "ab" | "bc" | "ca" | "m" | "n">): {
  A: Pt;
  B: Pt;
  C: Pt;
  A2: Pt;
  C2: Pt;
} {
  const { a: A, b: B, c: C } = placeTriangle({ ab: s.ab, bc: s.bc, ca: s.ca });
  const k = s.m / s.n;
  return { A, B, C, A2: add(B, scale(sub(A, B), k)), C2: add(B, scale(sub(C, B), k)) };
}

/** A triangle similar to ABC with scale factor m/n (Construction 11.2, Examples 1 and 2). */
function similarSteps(s: ConstructionState): Step[] {
  const { m, n } = s;
  const { A, B, C, A2, C2 } = similarPoints(s);
  const most = Math.max(m, n);
  const gap = Math.min(1.1, (s.bc * 0.9) / most);
  const dir = unit(-32);
  const pt = (i: number): Pt => add(B, scale(dir, gap * i));
  const X = pt(most + 1.3);
  const isBigger = m > n;
  const marks: Item[] = [];
  for (let i = 1; i <= most; i++) {
    marks.push(markArc(pt(i - 1), gap, -32));
    marks.push({ k: "point", at: pt(i), tone: i === m || i === n ? "accent" : "main" });
    if (i === 1 || i === m || i === n)
      marks.push({ k: "label", at: pt(i), text: `B${sub_(i)}`, prefer: 225, small: true });
  }
  const big = isBigger ? `${m}/${n}` : `${m}/${n}`;
  return [
    {
      caption: {
        en: `Draw ∆ABC with BC = ${numText(s.bc)} cm, AB = ${numText(s.ab)} cm and CA = ${numText(s.ca)} cm. We want a triangle whose sides are ${big} of these.`,
        hi: `∆ABC खींचो जिसमें BC = ${numText(s.bc)} cm, AB = ${numText(s.ab)} cm और CA = ${numText(s.ca)} cm। हमें ऐसा त्रिभुज चाहिए जिसकी भुजाएँ इनकी ${big} हों।`,
      },
      items: [
        { k: "seg", from: A, to: B },
        { k: "seg", from: B, to: C },
        { k: "seg", from: C, to: A },
        { k: "label", at: A, text: "A", prefer: 270 },
        { k: "label", at: B, text: "B", prefer: 180 },
        { k: "label", at: C, text: "C", prefer: 0 },
      ],
      tool: { k: "ruler", from: B, to: C },
    },
    {
      caption: {
        en: "Draw any ray BX making an acute angle with BC, on the side away from A.",
        hi: "कोई किरण BX खींचो जो BC के साथ न्यून कोण बनाए, A से दूर वाली ओर।",
      },
      items: [
        { k: "ray", from: B, to: X },
        { k: "label", at: X, text: "X", prefer: 315 },
      ],
      tool: { k: "ruler", from: B, to: X },
    },
    {
      caption: {
        en: `Mark ${most} equal steps B₁, B₂, …, B${sub_(most)} along BX (${most} is the bigger of ${m} and ${n}).`,
        hi: `BX पर ${most} बराबर कदम B₁, B₂, …, B${sub_(most)} लगाओ (${m} और ${n} में ${most} बड़ा है)।`,
      },
      items: marks,
      tool: { k: "compass", c: pt(most - 1), r: gap, angle: -32 },
    },
    {
      caption: { en: `Join B${sub_(n)} to C.`, hi: `B${sub_(n)} को C से मिलाओ।` },
      items: [{ k: "seg", from: pt(n), to: C, tone: "accent" }],
      tool: { k: "ruler", from: pt(n), to: C },
    },
    {
      caption: isBigger
        ? {
            en: `Through B${sub_(m)}, draw a line parallel to B${sub_(n)}C. Extend BC to meet it at C′.`,
            hi: `B${sub_(m)} से होकर B${sub_(n)}C के समांतर रेखा खींचो। BC को बढ़ाओ ताकि वह इसे C′ पर मिले।`,
          }
        : {
            en: `Through B${sub_(m)}, draw a line parallel to B${sub_(n)}C. It meets BC at C′.`,
            hi: `B${sub_(m)} से होकर B${sub_(n)}C के समांतर रेखा खींचो। यह BC को C′ पर मिलती है।`,
          },
      items: [
        ...(isBigger ? [{ k: "seg", from: C, to: C2, tone: "muted", dashed: true } as Item] : []),
        { k: "seg", from: pt(m), to: C2, tone: "result" },
        { k: "parallel", from: pt(n), to: C, count: 1 },
        { k: "parallel", from: pt(m), to: C2, count: 1 },
        { k: "point", at: C2, tone: "result" },
        { k: "label", at: C2, text: "C′", prefer: 315, tone: "result" },
      ],
      tool: { k: "ruler", from: pt(m), to: C2 },
    },
    {
      caption: isBigger
        ? {
            en: "Through C′, draw a line parallel to CA. Extend BA to meet it at A′.",
            hi: "C′ से होकर CA के समांतर रेखा खींचो। BA को बढ़ाओ ताकि वह इसे A′ पर मिले।",
          }
        : {
            en: "Through C′, draw a line parallel to CA. It meets BA at A′.",
            hi: "C′ से होकर CA के समांतर रेखा खींचो। यह BA को A′ पर मिलती है।",
          },
      items: [
        ...(isBigger ? [{ k: "seg", from: A, to: A2, tone: "muted", dashed: true } as Item] : []),
        { k: "seg", from: C2, to: A2, tone: "result" },
        { k: "parallel", from: C, to: A, count: 2 },
        { k: "parallel", from: C2, to: A2, count: 2 },
        { k: "point", at: A2, tone: "result" },
        { k: "label", at: A2, text: "A′", prefer: 270, tone: "result" },
      ],
      tool: { k: "ruler", from: C2, to: A2 },
    },
    {
      caption: {
        en: `∆A′BC′ is the triangle we wanted: each side is ${m}/${n} of the matching side of ∆ABC. Why: BC′ : BC = BB${sub_(m)} : BB${sub_(n)} = ${m} : ${n} (C′B${sub_(m)} ∥ CB${sub_(n)}), and C′A′ ∥ CA makes ∆A′BC′ ~ ∆ABC, so A′B/AB = A′C′/AC = BC′/BC = ${m}/${n}.`,
        hi: `∆A′BC′ वही त्रिभुज है जो हमें चाहिए: इसकी हर भुजा ∆ABC की संगत भुजा की ${m}/${n} है। क्यों: BC′ : BC = BB${sub_(m)} : BB${sub_(n)} = ${m} : ${n} (C′B${sub_(m)} ∥ CB${sub_(n)}), और C′A′ ∥ CA से ∆A′BC′ ~ ∆ABC, इसलिए A′B/AB = A′C′/AC = BC′/BC = ${m}/${n}।`,
      },
      items: [
        { k: "seg", from: B, to: C2, tone: "result" },
        { k: "seg", from: B, to: A2, tone: "result" },
      ],
    },
  ];
}

/** The tangent at a point P of a circle: draw the radius OP and the perpendicular to it at P. */
function tangentAtPointSteps(s: ConstructionState): Step[] {
  const O: Pt = [0, 0];
  const at = 300;
  const P = onCircle(O, s.r, at);
  const u = unit(at);
  const e = s.r * 0.45;
  const E = add(P, scale(u, -e));
  const F = add(P, scale(u, e));
  const w = s.r * 0.75;
  const [G, H] = circleCircle(E, w, F, w) as [Pt, Pt];
  const t = sub(H, G);
  const T1 = add(P, scale(t, 1.1));
  const T2 = add(P, scale(t, -1.1));
  return [
    {
      caption: {
        en: `Draw a circle with centre O and radius ${numText(s.r)} cm, and mark a point P on it.`,
        hi: `केंद्र O और त्रिज्या ${numText(s.r)} cm का वृत्त खींचो, और उस पर एक बिंदु P लो।`,
      },
      items: [
        { k: "circle", c: O, r: s.r },
        { k: "point", at: O, kind: "centre" },
        { k: "point", at: P },
        { k: "label", at: O, text: "O", prefer: 180 },
        { k: "label", at: P, text: "P", away: O },
      ],
      tool: { k: "compass", c: O, r: s.r, angle: 60 },
    },
    {
      caption: {
        en: "Draw the radius OP and extend it past P.",
        hi: "त्रिज्या OP खींचो और उसे P से आगे बढ़ाओ।",
      },
      items: [{ k: "seg", from: O, to: add(P, scale(u, s.r * 0.6)), tone: "main" }],
      tool: { k: "ruler", from: O, to: add(P, scale(u, s.r * 0.6)) },
    },
    {
      caption: {
        en: "With centre P and a small width, cut the line on both sides of P at E and F (PE = PF).",
        hi: "केंद्र P और छोटी चौड़ाई से P के दोनों ओर रेखा को E और F पर काटो (PE = PF)।",
      },
      items: [
        markArc(P, e, at + 180),
        markArc(P, e, at),
        { k: "point", at: E },
        { k: "point", at: F },
        { k: "label", at: E, text: "E", prefer: 200, small: true },
        { k: "label", at: F, text: "F", prefer: 20, small: true },
      ],
      tool: { k: "compass", c: P, r: e, angle: at },
    },
    {
      caption: {
        en: "With centres E and F and a bigger width, draw arcs that cross on both sides of the line.",
        hi: "केंद्र E और F तथा बड़ी चौड़ाई से ऐसे चाप खींचो जो रेखा के दोनों ओर एक-दूसरे को काटें।",
      },
      items: [
        markArc(E, w, angleOf(E, G), 12),
        markArc(E, w, angleOf(E, H), 12),
        markArc(F, w, angleOf(F, G), 12),
        markArc(F, w, angleOf(F, H), 12),
      ],
      tool: { k: "compass", c: F, r: w, angle: angleOf(F, G) },
    },
    {
      caption: {
        en: "Join the two crossings with a line through P. It is perpendicular to the radius OP, so it is the tangent at P.",
        hi: "दोनों कटान बिंदुओं को P से होकर जाने वाली रेखा से मिलाओ। यह त्रिज्या OP पर लंब है, इसलिए यही P पर स्पर्श रेखा है।",
      },
      items: [
        { k: "seg", from: T1, to: T2, tone: "result" },
        { k: "right", v: P, p: O, q: T1 },
      ],
      tool: { k: "ruler", from: T1, to: T2 },
    },
  ];
}

/** The pair of tangents from an outside point P (Construction 11.3). */
export function tangentsFromPointPoints(s: Pick<ConstructionState, "r" | "d">): {
  O: Pt;
  P: Pt;
  M: Pt;
  Q: Pt;
  R: Pt;
} {
  const O: Pt = [0, 0];
  const P: Pt = [s.d, 0];
  const M = mid(O, P);
  const [Q, R] = circleCircle(O, s.r, M, s.d / 2) as [Pt, Pt];
  return { O, P, M, Q, R };
}

function tangentsFromPointSteps(s: ConstructionState): Step[] {
  const { O, P, M, Q, R } = tangentsFromPointPoints(s);
  const w = s.d * 0.65;
  const [U, V] = circleCircle(O, w, P, w) as [Pt, Pt];
  const len = tangentLength(s.d, s.r) ?? 0;
  const ext = (a: Pt, b: Pt) => add(b, scale(sub(b, a), 0.3));
  return [
    {
      caption: {
        en: `A circle with centre O and radius ${numText(s.r)} cm, and a point P ${numText(s.d)} cm from O.`,
        hi: `केंद्र O और त्रिज्या ${numText(s.r)} cm का वृत्त, और O से ${numText(s.d)} cm दूर एक बिंदु P।`,
      },
      items: [
        { k: "circle", c: O, r: s.r },
        { k: "point", at: O, kind: "centre" },
        { k: "point", at: P },
        { k: "label", at: O, text: "O", prefer: 180 },
        { k: "label", at: P, text: "P", prefer: 0 },
      ],
      tool: { k: "compass", c: O, r: s.r, angle: 120 },
    },
    {
      caption: { en: "Join PO.", hi: "PO को मिलाओ।" },
      items: [{ k: "seg", from: O, to: P, tone: "main" }],
      tool: { k: "ruler", from: O, to: P },
    },
    {
      caption: {
        en: "Bisect PO: with centres P and O and a width more than half PO, draw arcs crossing above and below. Join the crossings; this line cuts PO at its mid-point M.",
        hi: "PO को समद्विभाजित करो: केंद्र P और O तथा PO के आधे से अधिक चौड़ाई से ऊपर और नीचे कटने वाले चाप खींचो। कटान बिंदुओं को मिलाओ; यह रेखा PO को उसके मध्य-बिंदु M पर काटती है।",
      },
      items: [
        markArc(O, w, angleOf(O, U), 12),
        markArc(O, w, angleOf(O, V), 12),
        markArc(P, w, angleOf(P, U), 12),
        markArc(P, w, angleOf(P, V), 12),
        { k: "seg", from: U, to: V, tone: "construction" },
        { k: "point", at: M, tone: "accent" },
        { k: "label", at: M, text: "M", prefer: 315, tone: "accent" },
        { k: "ticks", from: O, to: M, count: 1 },
        { k: "ticks", from: M, to: P, count: 1 },
      ],
      tool: { k: "compass", c: P, r: w, angle: angleOf(P, U) },
    },
    {
      caption: {
        en: "With centre M and radius MO, draw a circle. It cuts the given circle at Q and R.",
        hi: "केंद्र M और त्रिज्या MO से एक वृत्त खींचो। यह दिए गए वृत्त को Q और R पर काटता है।",
      },
      items: [
        { k: "circle", c: M, r: s.d / 2, tone: "construction" },
        { k: "point", at: Q, tone: "accent" },
        { k: "point", at: R, tone: "accent" },
        { k: "label", at: Q, text: "Q", away: M, tone: "accent" },
        { k: "label", at: R, text: "R", away: M, tone: "accent" },
      ],
      tool: { k: "compass", c: M, r: s.d / 2, angle: 70 },
    },
    {
      caption: {
        en: "Join PQ and PR. These are the two tangents from P.",
        hi: "PQ और PR को मिलाओ। यही P से खींची गई दो स्पर्श रेखाएँ हैं।",
      },
      items: [
        { k: "seg", from: P, to: ext(P, Q), tone: "result" },
        { k: "seg", from: P, to: ext(P, R), tone: "result" },
      ],
      tool: { k: "ruler", from: P, to: Q },
    },
    {
      caption: {
        en: `Why it works: join OQ. ∠PQO is an angle in a semicircle (PO is a diameter of the circle through M), so ∠PQO = 90°. A line perpendicular to a radius at its end on the circle is a tangent, so PQ is a tangent; so is PR. Each is √(${numText(s.d)}² − ${numText(s.r)}²) = ${numText(len)} cm long.`,
        hi: `यह क्यों काम करता है: OQ को मिलाओ। ∠PQO अर्धवृत्त में बना कोण है (PO, M वाले वृत्त का व्यास है), इसलिए ∠PQO = 90°। त्रिज्या के वृत्त वाले सिरे पर उस पर लंब रेखा स्पर्श रेखा होती है, इसलिए PQ स्पर्श रेखा है; PR भी। हर एक की लंबाई √(${numText(s.d)}² − ${numText(s.r)}²) = ${numText(len)} cm है।`,
      },
      items: [
        { k: "seg", from: O, to: Q, tone: "main" },
        { k: "seg", from: O, to: R, tone: "main" },
        { k: "right", v: Q, p: O, q: P },
        { k: "right", v: R, p: O, q: P },
        { k: "ticks", from: P, to: Q, count: 2 },
        { k: "ticks", from: P, to: R, count: 2 },
      ],
    },
  ];
}

/** A pair of tangents inclined at a given angle (Exercise 11.2 Q4). */
export function tangentsAtAnglePoints(s: Pick<ConstructionState, "r" | "angle">): {
  O: Pt;
  A: Pt;
  B: Pt;
  P: Pt;
} {
  const O: Pt = [0, 0];
  const central = 180 - s.angle;
  // A and B sit symmetrically about the bottom of the circle, so P lands below O.
  const startA = 270 - central / 2;
  const a = onCircle(O, s.r, startA);
  const b = onCircle(O, s.r, startA + central);
  // The tangents at a and b meet on the bisector of ∠aOb, r / cos(central/2) from O.
  const P = onCircle(O, s.r / Math.cos(((central / 2) * Math.PI) / 180), startA + central / 2);
  return { O, A: a, B: b, P };
}

function tangentsAtAngleSteps(s: ConstructionState): Step[] {
  const { O, A, B, P } = tangentsAtAnglePoints(s);
  const central = clean(180 - s.angle);
  const startA = angleOf(O, A);
  const useSteps = Math.abs(central - 120) < 1e-9;
  const mid60 = onCircle(O, s.r, startA + 60);
  const ext = (from: Pt, to: Pt) => add(to, scale(sub(to, from), 0.35));
  const angleItems: Item[] = useSteps
    ? [
        markArc(A, s.r, angleOf(A, mid60), 10),
        { k: "point", at: mid60, tone: "construction" },
        markArc(mid60, s.r, angleOf(mid60, B), 10),
      ]
    : [];
  return [
    {
      caption: {
        en: `Draw a circle with centre O and radius ${numText(s.r)} cm, and a radius OA.`,
        hi: `केंद्र O और त्रिज्या ${numText(s.r)} cm का वृत्त खींचो, और एक त्रिज्या OA।`,
      },
      items: [
        { k: "circle", c: O, r: s.r },
        { k: "point", at: O, kind: "centre" },
        { k: "seg", from: O, to: A, tone: "main" },
        { k: "point", at: A },
        { k: "label", at: O, text: "O", prefer: 90 },
        { k: "label", at: A, text: "A", away: O },
      ],
      tool: { k: "compass", c: O, r: s.r, angle: 30 },
    },
    {
      caption: useSteps
        ? {
            en: `The tangents will meet at ${numText(s.angle)}°, so ∠AOB must be 180° − ${numText(s.angle)}° = ${numText(central)}°. With the compass still at the radius, step twice round the circle from A (each step is 60°) to reach B. Join OB.`,
            hi: `स्पर्श रेखाएँ ${numText(s.angle)}° पर मिलेंगी, इसलिए ∠AOB = 180° − ${numText(s.angle)}° = ${numText(central)}° होना चाहिए। परकार को त्रिज्या पर ही रखकर A से वृत्त पर दो कदम लगाओ (हर कदम 60°) और B पर पहुँचो। OB को मिलाओ।`,
          }
        : {
            en: `The tangents will meet at ${numText(s.angle)}°, so ∠AOB must be 180° − ${numText(s.angle)}° = ${numText(central)}°. Draw the radius OB making that angle with OA.`,
            hi: `स्पर्श रेखाएँ ${numText(s.angle)}° पर मिलेंगी, इसलिए ∠AOB = 180° − ${numText(s.angle)}° = ${numText(central)}° होना चाहिए। OA से इतना कोण बनाती हुई त्रिज्या OB खींचो।`,
          },
      items: [
        ...angleItems,
        { k: "seg", from: O, to: B, tone: "main" },
        { k: "point", at: B },
        { k: "label", at: B, text: "B", away: O },
        { k: "angle", v: O, p: A, q: B, label: `${numText(central)}°`, tone: "accent" },
      ],
      tool: useSteps
        ? { k: "compass", c: mid60, r: s.r, angle: angleOf(mid60, B) }
        : { k: "ruler", from: O, to: B },
    },
    {
      caption: {
        en: "Draw lines perpendicular to OA at A and to OB at B. They are the tangents at A and B, and they meet at P.",
        hi: "A पर OA के लंब और B पर OB के लंब रेखाएँ खींचो। ये A और B पर स्पर्श रेखाएँ हैं, और P पर मिलती हैं।",
      },
      items: [
        { k: "seg", from: A, to: ext(A, P), tone: "result" },
        { k: "seg", from: B, to: ext(B, P), tone: "result" },
        { k: "right", v: A, p: O, q: P },
        { k: "right", v: B, p: O, q: P },
        { k: "point", at: P, tone: "result" },
        { k: "label", at: P, text: "P", away: O, tone: "result" },
      ],
      tool: { k: "ruler", from: A, to: ext(A, P) },
    },
    {
      caption: {
        en: `PA and PB are inclined at ${numText(s.angle)}°. Why: the angles of the quadrilateral OAPB add up to 360°, and ∠OAP = ∠OBP = 90°, so ∠APB = 360° − 90° − 90° − ${numText(central)}° = ${numText(s.angle)}°.`,
        hi: `PA और PB, ${numText(s.angle)}° पर झुकी हैं। क्यों: चतुर्भुज OAPB के कोणों का योग 360° है, और ∠OAP = ∠OBP = 90°, इसलिए ∠APB = 360° − 90° − 90° − ${numText(central)}° = ${numText(s.angle)}°।`,
      },
      items: [{ k: "angle", v: P, p: A, q: B, label: `${numText(s.angle)}°`, tone: "result" }],
    },
  ];
}

/** Every step of the construction, in order. */
export function stepsOf(s: ConstructionState): Step[] {
  switch (s.kind) {
    case ConstructionKind.Divide:
      return divideSteps(s);
    case ConstructionKind.DivideAlt:
      return divideAltSteps(s);
    case ConstructionKind.Similar:
      return similarSteps(s);
    case ConstructionKind.TangentAtPoint:
      return tangentAtPointSteps(s);
    case ConstructionKind.TangentsFromPoint:
      return tangentsFromPointSteps(s);
    case ConstructionKind.TangentsAtAngle:
      return tangentsAtAngleSteps(s);
  }
}

export const stepCountOf = (s: ConstructionState): number => stepsOf(s).length;

/** What the finished construction gives, for checking: lengths in cm, angles in degrees. */
export function resultOf(s: ConstructionState): Record<string, number> {
  switch (s.kind) {
    case ConstructionKind.Divide:
    case ConstructionKind.DivideAlt:
      return {
        ac: clean((s.length * s.m) / (s.m + s.n)),
        cb: clean((s.length * s.n) / (s.m + s.n)),
      };
    case ConstructionKind.Similar: {
      const { A2, B, C2 } = similarPoints(s);
      return {
        scale: clean(s.m / s.n),
        a2b: clean(dist(A2, B)),
        bc2: clean(dist(B, C2)),
        c2a2: clean(dist(C2, A2)),
      };
    }
    case ConstructionKind.TangentAtPoint:
      return { angle: 90 };
    case ConstructionKind.TangentsFromPoint: {
      const { P, Q, R } = tangentsFromPointPoints(s);
      return { pq: clean(dist(P, Q)), pr: clean(dist(P, R)) };
    }
    case ConstructionKind.TangentsAtAngle: {
      const { P, A, B } = tangentsAtAnglePoints(s);
      const a = Math.atan2(A[1] - P[1], A[0] - P[0]);
      const b = Math.atan2(B[1] - P[1], B[0] - P[0]);
      let d = Math.abs(a - b);
      if (d > Math.PI) d = 2 * Math.PI - d;
      return { angle: clean(Math.round(((d * 180) / Math.PI) * 1e6) / 1e6) };
    }
  }
}

function stepped(s: ConstructionState, step: number): Emit[] {
  const count = stepCountOf(s);
  const out: Emit[] = [{ signal: ConstructionSignal.Stepped, payload: { step } }];
  if (step === count - 1 && s.step !== count - 1)
    out.push({ signal: ConstructionSignal.Done, payload: resultOf(s) });
  return out;
}

const act = actionsFor<ConstructionState>();

export const construction = defineProp({
  type: "construction",
  describe:
    "A ruler-and-compass construction drawn one step at a time, with the compass or ruler shown for the step being made and a caption saying what to do; the last step states the result and why it works (NCERT Class 10 Ch 11). Kinds: divide a line segment AB in the ratio m : n with one ray and equal steps (Construction 11.1) or with two parallel rays (its alternative method); construct a triangle similar to a given triangle ABC with scale factor m/n, smaller or larger (Construction 11.2); the tangent at a point of a circle (radius, then the perpendicular at its end); the pair of tangents from a point outside a circle by bisecting PO and drawing the circle on PO as diameter (Construction 11.3); a pair of tangents inclined at a given angle (Exercise 11.2 Q4). Lengths in cm.",
  state: constructionState,
  defaults: {
    kind: ConstructionKind.Divide,
    step: 0,
    canStep: true,
    showTool: true,
    length: 7.6,
    m: 3,
    n: 2,
    ab: 5,
    bc: 6,
    ca: 7,
    r: 3,
    d: 6,
    angle: 60,
  },
  inputs: ["canStep", "showTool"],
  invariant: (s) => {
    if (s.step >= stepCountOf(s)) return "step is past the last step";
    if (s.kind === ConstructionKind.Similar) {
      if (s.m === s.n) return "a scale factor of 1 makes the same triangle";
      if (!isTriangle({ ab: s.ab, bc: s.bc, ca: s.ca }))
        return "the three sides don't make a triangle";
    }
    if (s.kind === ConstructionKind.TangentsFromPoint && s.d <= s.r)
      return "P must be outside the circle (d > r)";
    return undefined;
  },
  derived: {
    [ConstructionDerived.StepCount]: {
      describe: "How many steps the construction has",
      compute: stepCountOf,
    },
    [ConstructionDerived.IsDone]: {
      describe: "Whether the last step (the result) is showing",
      compute: (s) => s.step === stepCountOf(s) - 1,
    },
    [ConstructionDerived.Result]: {
      describe:
        "What the construction gives: divide → ac and cb (cm); similar → scale and the new sides a2b, bc2, c2a2 (cm); tangentsFromPoint → pq and pr (cm); tangentsAtAngle → angle (degrees)",
      compute: resultOf,
    },
  },
  actions: {
    [ConstructionAction.Next]: act({
      describe: "Make the next step of the construction",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep) return set({});
        const step = Math.min(stepCountOf(s) - 1, s.step + 1);
        if (step === s.step) return set({});
        return set({ step }, ...stepped(s, step));
      },
    }),
    [ConstructionAction.Back]: act({
      describe: "Go back one step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step === 0) return set({});
        return set(
          { step: s.step - 1 },
          { signal: ConstructionSignal.Stepped, payload: { step: s.step - 1 } },
        );
      },
    }),
    [ConstructionAction.Reset]: act({
      describe: "Start the construction again from the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: ConstructionSignal.Stepped, payload: { step: 0 } }),
    }),
    [ConstructionAction.GoTo]: act({
      describe: "Show a given step (0 is the first)",
      args: z.object({ step: z.number().int().min(0).max(20) }).strict(),
      run: (s, a) => {
        const step = Math.min(stepCountOf(s) - 1, a.step);
        return set({ step }, ...stepped(s, step));
      },
    }),
  },
});
