import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type SplitWorking, factorPairs, quadTex, quadText, splitPair, splitWorking } from "./quad";

/**
 * Factorising ax² + bx + c by splitting the middle term: find two numbers that multiply to ac and
 * add to b, write bx as px + qx, group, and take out the common factor. The learner picks a pair;
 * a right pick shows the grouping, the two factors and the roots.
 */

export const SplitAction = { Pick: "pick", Solve: "solve", Clear: "clear" } as const;
export const SplitSignal = { Picked: "picked" } as const;
export const SplitDerived = {
  Product: "product",
  Pairs: "pairs",
  Answer: "answer",
  IsRight: "isRight",
  Working: "working",
  HasWholeSplit: "hasWholeSplit",
} as const;
export const SplitPart = {
  Equation: "equation",
  Target: "target",
  Pairs: "pairs",
  Check: "check",
  Working: "working",
  Roots: "roots",
} as const;

const whole = z.number().int().min(-1000).max(1000);
const pair = z.tuple([whole, whole]);

const splitState = z
  .object({
    a: whole.refine((a) => a !== 0, "a can't be 0"),
    b: whole,
    c: whole,
    variable: z.string().regex(/^[a-z]$/),
    /** The pair the learner picked, or null. */
    picked: pair.nullable(),
    /** The pairs offered; null: every pair of whole numbers that multiply to ac. */
    choices: z.array(pair).max(24).nullable(),
    canPick: z.boolean(),
    /** After a right pick: show the split, the grouping and the factors. */
    showWorking: z.boolean(),
    /** After a right pick: show the roots (each factor = 0). */
    showRoots: z.boolean(),
  })
  .strict();
export type SplitState = z.infer<typeof splitState>;

export const pairsOf = (s: Pick<SplitState, "a" | "c" | "choices">): [number, number][] =>
  s.choices ?? factorPairs(s.a * s.c);

export const isRightPick = (s: Pick<SplitState, "a" | "b" | "c" | "picked">) =>
  s.picked !== null && s.picked[0] * s.picked[1] === s.a * s.c && s.picked[0] + s.picked[1] === s.b;

export function workingOf(s: SplitState): SplitWorking | null {
  if (!isRightPick(s) || s.picked === null) return null;
  return splitWorking(s.a, s.picked[0], s.picked[1], s.c, s.variable);
}

const act = actionsFor<SplitState>();

export const middleSplit = defineProp({
  type: "middleSplit",
  describe:
    "Factorising a quadratic ax² + bx + c by splitting the middle term. The goal: two whole numbers p and q that multiply to a × c and add to b. The learner picks a pair from the factor pairs of ac and sees its product and sum checked. With the right pair, bx is written as px + qx, the four terms are grouped two by two, the common bracket is taken out, giving the two factors, and each factor set to 0 gives a root. Some quadratics have no such pair of whole numbers.",
  state: splitState,
  defaults: {
    a: 2,
    b: -5,
    c: 3,
    variable: "x",
    picked: null,
    choices: null,
    canPick: true,
    showWorking: true,
    showRoots: true,
  },
  inputs: ["canPick", "showWorking", "showRoots", "choices"],
  derived: {
    [SplitDerived.Product]: { describe: "a × c, what p × q must be", compute: (s) => s.a * s.c },
    [SplitDerived.Pairs]: {
      describe: "The pairs offered to pick from",
      compute: pairsOf,
    },
    [SplitDerived.Answer]: {
      describe: "The pair that splits the middle term (null if no whole numbers do)",
      compute: (s) => splitPair(s.a, s.b, s.c),
    },
    [SplitDerived.IsRight]: {
      describe: "The picked pair multiplies to ac and adds to b",
      compute: isRightPick,
    },
    [SplitDerived.Working]: {
      describe: "After a right pick: the split, the grouping, the factors and the roots (TeX)",
      compute: workingOf,
    },
    [SplitDerived.HasWholeSplit]: {
      describe: "Some pair of whole numbers splits the middle term",
      compute: (s) => splitPair(s.a, s.b, s.c) !== null,
    },
  },
  actions: {
    [SplitAction.Pick]: act({
      describe: "Pick the pair p, q (their product and sum are checked)",
      byLearner: true,
      args: z.object({ p: whole, q: whole }).strict(),
      run: (s, a) => {
        if (!s.canPick) return set({});
        const picked: [number, number] = [a.p, a.q];
        const isRight = isRightPick({ ...s, picked });
        return set(
          { picked },
          { signal: SplitSignal.Picked, payload: { p: a.p, q: a.q, isRight } },
        );
      },
    }),
    [SplitAction.Solve]: act({
      describe: "Pick the right pair (shows the answer)",
      args: z.object({}).strict(),
      run: (s) => {
        const answer = splitPair(s.a, s.b, s.c);
        if (answer === null) return set({});
        return set(
          { picked: answer },
          { signal: SplitSignal.Picked, payload: { p: answer[0], q: answer[1], isRight: true } },
        );
      },
    }),
    [SplitAction.Clear]: act({
      describe: "Take the pick back",
      args: z.object({}).strict(),
      run: () => set({ picked: null }),
    }),
  },
  signals: {
    [SplitSignal.Picked]: {
      describe: "The learner picked a pair; the payload has p, q and whether it is right",
    },
  },
  observe: (s) => {
    const v = s.variable;
    const elements: Element[] = [
      { id: SplitPart.Equation, value: `${quadText(s.a, s.b, s.c, v)} = 0` },
      { id: SplitPart.Target, value: `multiply to ${s.a * s.c}, add to ${s.b}` },
    ];
    if (s.canPick)
      elements.push({
        id: SplitPart.Pairs,
        value: pairsOf(s)
          .map(([p, q]) => `${p} × ${q}`)
          .join(", "),
      });
    const w = workingOf(s);
    if (s.picked !== null)
      elements.push({
        id: SplitPart.Check,
        value: `${s.picked[0]} × ${s.picked[1]} = ${s.picked[0] * s.picked[1]}, ${s.picked[0]} + ${s.picked[1]} = ${s.picked[0] + s.picked[1]}: ${isRightPick(s) ? "right" : "not right"}`,
      });
    if (w !== null && s.showWorking)
      elements.push({ id: SplitPart.Working, value: `${w.split} = ${w.grouped} = ${w.factored}` });
    if (w !== null && s.showRoots)
      elements.push({ id: SplitPart.Roots, value: `${v} = ${w.roots[0]} or ${v} = ${w.roots[1]}` });
    return {
      summary: `Splitting the middle term of ${quadTex(s.a, s.b, s.c, v)} = 0: two numbers that multiply to ${s.a * s.c} and add to ${s.b}.${s.picked === null ? " Nothing picked yet." : ""}`,
      elements,
      hidden: { answer: splitPair(s.a, s.b, s.c) },
    };
  },
  parts: (s) => [
    SplitPart.Equation,
    SplitPart.Target,
    ...(s.canPick ? [SplitPart.Pairs] : []),
    ...(s.picked !== null ? [SplitPart.Check] : []),
    ...(isRightPick(s) && s.showWorking ? [SplitPart.Working] : []),
    ...(isRightPick(s) && s.showRoots ? [SplitPart.Roots] : []),
  ],
});
