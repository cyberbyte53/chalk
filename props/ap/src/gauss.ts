import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { bracketTex, clean, numTex, numText, sumOf, termOf, termsOf, withUnit } from "./ap";

/**
 * The sum of an AP the way Gauss found 1 + 2 + … + 100: write the sum forwards, write it again
 * backwards underneath, add the pairs (every pair is a + l), so twice the sum is n(a + l). As bars
 * (term k is a column of height aₖ; a copy turned upside down sits on top and makes a rectangle)
 * or as written pairs (for long sums like 1 to 100).
 */

export const GaussAction = {
  Next: "next",
  Back: "back",
  Reset: "reset",
  NudgeN: "nudgeN",
  SetN: "setN",
} as const;
export const GaussSignal = { Stepped: "stepped", Done: "done", Changed: "changed" } as const;
export const GaussDerived = {
  Sum: "sum",
  Last: "last",
  PairSum: "pairSum",
  Lines: "lines",
} as const;
export const GaussPart = {
  Picture: "picture",
  Lines: "lines",
  Next: "next",
  Back: "back",
  StepN: "stepN",
  Result: "result",
} as const;

export const GaussMode = { Bars: "bars", Pairs: "pairs" } as const;
export type GaussMode = (typeof GaussMode)[keyof typeof GaussMode];

/** Steps: 0 the sum; 1 the sum backwards; 2 the pairs added; 3 halved. */
export const GAUSS_STEPS = 3;
/** The most columns the bars mode draws. */
export const MAX_BARS = 24;

const gaussState = z
  .object({
    mode: z.nativeEnum(GaussMode),
    a: z.number().min(-1e6).max(1e6),
    d: z.number().min(-1e6).max(1e6),
    /** How many terms are added. */
    n: z.number().int().min(1).max(10000),
    nMax: z.number().int().min(1).max(10000),
    step: z.number().int().min(0).max(GAUSS_STEPS),
    canStep: z.boolean(),
    canSetN: z.boolean(),
    /** The unit of the terms ("₹", or ""). */
    unit: z.string().max(4),
  })
  .strict();
export type GaussState = z.infer<typeof gaussState>;

export const lastOf = (s: Pick<GaussState, "a" | "d" | "n">) => termOf(s.a, s.d, s.n);
export const pairSumOf = (s: Pick<GaussState, "a" | "d" | "n">) => clean(s.a + lastOf(s));
export const sumOfState = (s: Pick<GaussState, "a" | "d" | "n">) => sumOf(s.a, s.d, s.n);

/** The terms written out: all of them if few, else the first three, …, the last two. */
function written(values: readonly number[]): string {
  const t = values.map((v) => bracketTex(v));
  if (t.length <= 6) return t.join(" + ");
  return [...t.slice(0, 3), "\\dots", ...t.slice(-2)].join(" + ");
}

/** The four lines of the trick, as TeX. */
export function linesTex(s: Pick<GaussState, "a" | "d" | "n">): string[] {
  const values = termsOf(s.a, s.d, s.n);
  const pair = pairSumOf(s);
  const twice = clean(s.n * pair);
  const pairs =
    s.n <= 6
      ? Array.from({ length: s.n }, () => bracketTex(pair)).join(" + ")
      : `${bracketTex(pair)} + ${bracketTex(pair)} + \\dots + ${bracketTex(pair)}`;
  // A long row of pairs goes on its own line, so the line fits a phone.
  const doubled =
    s.n <= 6
      ? `2S = ${pairs} = ${s.n} \\times ${bracketTex(pair)} = ${numTex(twice)}`
      : `\\begin{aligned} 2S &= ${pairs} \\\\ &= ${s.n} \\times ${bracketTex(pair)} = ${numTex(twice)} \\end{aligned}`;
  return [
    `S = ${written(values)}`,
    `S = ${written([...values].reverse())}`,
    doubled,
    `S = \\frac{${numTex(twice)}}{2} = ${numTex(sumOfState(s))}`,
  ];
}

function changed(s: GaussState): Emit {
  return { signal: GaussSignal.Changed, payload: { n: s.n, sum: sumOfState(s) } };
}

const act = actionsFor<GaussState>();

export const gaussSum = defineProp({
  type: "gaussSum",
  describe:
    "The sum of the first n terms of an AP worked out the way Gauss added 1 to 100, in steps: the sum written forwards; then backwards underneath; adding each pair gives the same total, first term + last term, n times, so twice the sum is n(a + l); halve it. In bars mode the terms are columns of a staircase and an upside-down copy fits on top to make an n by (a + l) rectangle; in pairs mode the two rows are written out. The learner steps through, and can change n.",
  state: gaussState,
  defaults: {
    mode: GaussMode.Bars,
    a: 1,
    d: 1,
    n: 6,
    nMax: 12,
    step: 0,
    canStep: true,
    canSetN: false,
    unit: "",
  },
  inputs: ["canStep", "canSetN"],
  invariant: (s) => {
    if (s.n > s.nMax) return "n is beyond nMax";
    if (s.mode === GaussMode.Bars) {
      if (s.nMax > MAX_BARS) return `bars mode draws at most ${MAX_BARS} columns`;
      if (Math.min(s.a, lastOf(s)) < 0) return "bars mode needs terms that are not negative";
    }
    return undefined;
  },
  derived: {
    [GaussDerived.Sum]: { describe: "The sum of the first n terms", compute: sumOfState },
    [GaussDerived.Last]: { describe: "The last (nth) term l", compute: lastOf },
    [GaussDerived.PairSum]: {
      describe: "What every pair adds up to: first term + last term",
      compute: pairSumOf,
    },
    [GaussDerived.Lines]: {
      describe: "The four lines of the trick as TeX (sum, sum backwards, 2S, S)",
      compute: linesTex,
    },
  },
  actions: {
    [GaussAction.Next]: act({
      describe: "Show the next step of the trick",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= GAUSS_STEPS) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: GaussSignal.Stepped, payload: { step } }];
        if (step === GAUSS_STEPS)
          out.push({ signal: GaussSignal.Done, payload: { sum: sumOfState(s) } });
        return set({ step }, ...out);
      },
    }),
    [GaussAction.Back]: act({
      describe: "Go back one step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: GaussSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [GaussAction.Reset]: act({
      describe: "Back to the first step",
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [GaussAction.NudgeN]: act({
      describe: "Add one more term (by: 1) or one fewer (by: −1); the steps start again",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canSetN) return set({});
        const n = Math.max(1, Math.min(s.nMax, s.n + a.by));
        const next = { ...s, n, step: 0 };
        if (n === s.n || (s.mode === GaussMode.Bars && lastOf(next) < 0)) return set({});
        return set({ n, step: 0 }, changed(next));
      },
    }),
    [GaussAction.SetN]: act({
      describe: "Set how many terms are added; the steps start again",
      args: z.object({ n: z.number().int().min(1) }).strict(),
      run: (s, a) => {
        const next = { ...s, n: Math.min(s.nMax, a.n), step: 0 };
        return set({ n: next.n, step: 0 }, changed(next));
      },
    }),
  },
  signals: {
    [GaussSignal.Stepped]: { describe: "A step was shown; the payload has the step" },
    [GaussSignal.Done]: { describe: "The last step (the sum) is shown; the payload has the sum" },
    [GaussSignal.Changed]: { describe: "n changed; the payload has n and the new sum" },
  },
  observe: (s) => {
    const lines = linesTex(s);
    const elements: Element[] = [
      {
        id: GaussPart.Picture,
        value:
          s.mode === GaussMode.Bars
            ? ([
                `a staircase of ${s.n} columns, ${numText(s.a)} up to ${numText(lastOf(s))}`,
                "a copy turned upside down beside it",
                `the copy on top: a rectangle ${s.n} wide and ${numText(pairSumOf(s))} tall`,
                "the staircase is half the rectangle",
              ][s.step] ?? "")
            : `the sum written out${s.step >= 1 ? ", and again backwards" : ""}`,
      },
      { id: GaussPart.Lines, value: lines.slice(0, s.step + 1).join("; ") },
    ];
    if (s.step === GAUSS_STEPS)
      elements.push({ id: GaussPart.Result, value: `S = ${withUnit(sumOfState(s), s.unit)}` });
    if (s.canSetN) elements.push({ id: GaussPart.StepN, value: `n = ${s.n}` });
    return {
      summary: `Adding the first ${s.n} terms of the AP ${numText(s.a)}, ${numText(termOf(s.a, s.d, 2))}, … by pairing (step ${s.step} of ${GAUSS_STEPS}).`,
      elements,
      hidden: { sum: sumOfState(s) },
    };
  },
  parts: (s) => [
    GaussPart.Picture,
    GaussPart.Lines,
    ...(s.canStep && s.step < GAUSS_STEPS ? [GaussPart.Next] : []),
    ...(s.canStep && s.step > 0 ? [GaussPart.Back] : []),
    ...(s.canSetN ? [GaussPart.StepN] : []),
    ...(s.step === GAUSS_STEPS ? [GaussPart.Result] : []),
  ],
});
