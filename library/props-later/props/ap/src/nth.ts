import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Fraction,
  bracketTex,
  clean,
  fracText,
  isTermValue,
  nFor,
  numTex,
  numText,
  ordinal,
  termOf,
  withUnit,
} from "./ap";

/**
 * The nth term as hops: from the first term a, n − 1 hops of d each reach aₙ = a + (n − 1)d. The
 * learner moves n and watches the hops and the formula with the numbers in. With a target value
 * ("which term is −81?") it steps through solving target = a + (n − 1)d for n, and says whether n
 * is a positive whole number, i.e. whether the target is a term at all.
 */

export const NthAction = {
  SetN: "setN",
  NudgeN: "nudgeN",
  SetTarget: "setTarget",
  Next: "next",
  Reset: "reset",
} as const;
export const NthSignal = {
  Changed: "changed",
  Hit: "hit",
  Stepped: "stepped",
  Solved: "solved",
} as const;
export const NthDerived = {
  Term: "term",
  Hops: "hops",
  NForTarget: "nForTarget",
  IsTerm: "isTerm",
  Working: "working",
} as const;
export const NthPart = {
  Line: "line",
  Hops: "hops",
  Term: "term",
  Formula: "formula",
  StepN: "stepN",
  Target: "target",
  Working: "working",
  Next: "next",
} as const;

/** Lines of solving target = a + (n − 1)d, after the question. */
export const SOLVE_STEPS = 3;

const nthState = z
  .object({
    a: z.number().min(-1e6).max(1e6),
    d: z.number().min(-1e6).max(1e6),
    /** Which term is shown. */
    n: z.number().int().min(1).max(10000),
    /** The largest n the stepper reaches. */
    nMax: z.number().int().min(1).max(10000),
    /** How far one tap moves n. */
    nStep: z.number().int().min(1).max(1000),
    canMoveN: z.boolean(),
    /** Write aₙ = a + (n − 1)d with the numbers in. */
    showFormula: z.boolean(),
    /** A value to find the term number of, or null. */
    target: z.number().nullable(),
    /** How many solving lines are shown (0 = just the question). */
    step: z.number().int().min(0).max(SOLVE_STEPS),
    canStep: z.boolean(),
    /** The unit of the terms ("₹", "cm", or ""). */
    unit: z.string().max(4),
  })
  .strict();
export type NthState = z.infer<typeof nthState>;

/** aₙ for the shown n. */
export const termOfState = (s: Pick<NthState, "a" | "d" | "n">) => termOf(s.a, s.d, s.n);

/** The n that gives the target, as an exact fraction (null: no target, or d = 0). */
export function nForTarget(s: Pick<NthState, "a" | "d" | "target">): Fraction | null {
  return s.target === null ? null : nFor(s.a, s.d, s.target);
}

/** Whether the target is a term (null: no target). */
export function targetIsTerm(s: Pick<NthState, "a" | "d" | "target">): boolean | null {
  return s.target === null ? null : isTermValue(s.a, s.d, s.target);
}

/** The formula with the numbers in, as TeX: a_{20} = 100 + (20 − 1) × 5 = 195. */
export function formulaTex(s: Pick<NthState, "a" | "d" | "n">): string {
  return `a_{${s.n}} = ${numTex(s.a)} + (${s.n} - 1) \\times ${bracketTex(s.d)} = ${numTex(termOfState(s))}`;
}

/**
 * The solving lines, as TeX: the equation, n − 1 = …, n = …. Null without a target. With d = 0 one
 * line says every term is a.
 */
export function workingTex(s: Pick<NthState, "a" | "d" | "target">): string[] | null {
  if (s.target === null) return null;
  const t = s.target;
  if (clean(s.d) === 0)
    return [`${numTex(t)} = ${numTex(s.a)} + (n - 1) \\times 0 = ${numTex(s.a)}`];
  const f = nFor(s.a, s.d, t) as Fraction;
  const m1: Fraction = { p: f.p - f.q, q: f.q };
  const tex = (x: Fraction) =>
    x.q === 1 ? numTex(x.p) : `${x.p < 0 ? "-" : ""}\\frac{${Math.abs(x.p)}}{${x.q}}`;
  return [
    `${numTex(t)} = ${numTex(s.a)} + (n - 1) \\times ${bracketTex(s.d)}`,
    `n - 1 = \\frac{${numTex(t)} - ${bracketTex(s.a)}}{${numTex(s.d)}} = ${tex(m1)}`,
    `n = ${tex(f)}`,
  ];
}

function changed(s: NthState): Emit[] {
  const out: Emit[] = [{ signal: NthSignal.Changed, payload: { n: s.n, term: termOfState(s) } }];
  if (s.target !== null && clean(termOfState(s) - s.target) === 0)
    out.push({ signal: NthSignal.Hit, payload: { n: s.n } });
  return out;
}

const act = actionsFor<NthState>();

export const nthTerm = defineProp({
  type: "nthTerm",
  describe:
    "The nth term of an arithmetic progression as hops along a number line: from the first term a, n − 1 hops of the common difference d reach the nth term aₙ = a + (n − 1)d (many hops are drawn as a few, a brace and the last). The learner changes n and reads the term, with the formula written out with the numbers in. With a target value it steps through solving target = a + (n − 1)d for n and says whether the target is a term: n must be a positive whole number.",
  state: nthState,
  defaults: {
    a: 2,
    d: 5,
    n: 4,
    nMax: 30,
    nStep: 1,
    canMoveN: true,
    showFormula: true,
    target: null,
    step: 0,
    canStep: false,
    unit: "",
  },
  inputs: ["canMoveN", "showFormula", "canStep"],
  invariant: (s) => (s.n > s.nMax ? "n is beyond nMax" : undefined),
  derived: {
    [NthDerived.Term]: {
      describe: "The nth term a + (n − 1)d for the shown n",
      compute: termOfState,
    },
    [NthDerived.Hops]: { describe: "How many hops of d from a: n − 1", compute: (s) => s.n - 1 },
    [NthDerived.NForTarget]: {
      describe:
        "The n with a + (n − 1)d = target, as text (35, or 151/3 when it is not whole); null with no target or d = 0",
      compute: (s) => {
        const f = nForTarget(s);
        return f === null ? null : fracText(f);
      },
    },
    [NthDerived.IsTerm]: {
      describe: "Whether the target is a term (n a positive whole number); null with no target",
      compute: targetIsTerm,
    },
    [NthDerived.Working]: {
      describe: "The solving lines for the target, as TeX (null with no target)",
      compute: workingTex,
    },
  },
  actions: {
    [NthAction.SetN]: act({
      describe: "Show the nth term for this n",
      args: z.object({ n: z.number().int().min(1) }).strict(),
      run: (s, a) => {
        const next = { ...s, n: Math.min(s.nMax, a.n) };
        return set({ n: next.n }, ...changed(next));
      },
    }),
    [NthAction.NudgeN]: act({
      describe: "Move n one step up (by: 1) or down (by: −1)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canMoveN) return set({});
        const n = Math.max(1, Math.min(s.nMax, s.n + a.by * s.nStep));
        if (n === s.n) return set({});
        const next = { ...s, n };
        return set({ n }, ...changed(next));
      },
    }),
    [NthAction.SetTarget]: act({
      describe: "Ask which term a value is (null: no question); the solving starts again",
      args: z.object({ target: z.number().nullable() }).strict(),
      run: (_s, a) => set({ target: a.target, step: 0 }),
    }),
    [NthAction.Next]: act({
      describe: "Show the next line of solving target = a + (n − 1)d for n",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.target === null) return set({});
        const lines = workingTex(s)?.length ?? 0;
        if (s.step >= lines) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: NthSignal.Stepped, payload: { step } }];
        if (step === lines) {
          const f = nForTarget(s);
          out.push({
            signal: NthSignal.Solved,
            payload: { n: f === null ? null : fracText(f), isTerm: targetIsTerm(s) },
          });
        }
        return set({ step }, ...out);
      },
    }),
    [NthAction.Reset]: act({
      describe: "Hide the solving lines again",
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [NthSignal.Changed]: { describe: "n changed; the payload has n and the term" },
    [NthSignal.Hit]: { describe: "The shown term is exactly the target; the payload has n" },
    [NthSignal.Stepped]: { describe: "A solving line was shown; the payload has the step" },
    [NthSignal.Solved]: {
      describe:
        "The last solving line is shown; the payload has n (as text) and whether the target is a term",
    },
  },
  observe: (s) => {
    const term = termOfState(s);
    const elements: Element[] = [
      {
        id: NthPart.Hops,
        value: `${s.n - 1} hops of ${numText(s.d)} from ${withUnit(s.a, s.unit)}`,
      },
      { id: NthPart.Term, value: `a${s.n} = ${withUnit(term, s.unit)}` },
    ];
    if (s.showFormula) elements.push({ id: NthPart.Formula, value: formulaTex(s) });
    if (s.canMoveN) elements.push({ id: NthPart.StepN, value: `n = ${s.n}` });
    const work = workingTex(s);
    if (s.target !== null) {
      elements.push({ id: NthPart.Target, value: `which term is ${withUnit(s.target, s.unit)}?` });
      if (work !== null && s.step > 0)
        elements.push({ id: NthPart.Working, value: work.slice(0, s.step).join("; ") });
    }
    const isTerm = targetIsTerm(s);
    const f = nForTarget(s);
    return {
      summary: `The AP with a = ${numText(s.a)}, d = ${numText(s.d)}: the ${ordinal(s.n)} term is ${withUnit(term, s.unit)}.${s.target === null ? "" : ` Asked: which term is ${withUnit(s.target, s.unit)}?`}`,
      elements,
      hidden:
        s.target === null ? undefined : { nForTarget: f === null ? null : fracText(f), isTerm },
    };
  },
  parts: (s) => [
    NthPart.Line,
    NthPart.Hops,
    NthPart.Term,
    ...(s.showFormula ? [NthPart.Formula] : []),
    ...(s.canMoveN ? [NthPart.StepN] : []),
    ...(s.target !== null ? [NthPart.Target] : []),
    ...(s.target !== null && s.step > 0 ? [NthPart.Working] : []),
    ...(s.target !== null && s.canStep ? [NthPart.Next] : []),
  ],
});
