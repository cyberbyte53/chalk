import { type BoardKit, type PlacedOf, t } from "@chalk/author";
import { choiceQuestion, distinctOptions, settle } from "@chalk/content-source/patterns";
import {
  EquationForm,
  LinePairAction,
  type LinePairState,
  type LinearSceneKind,
  Method,
  SolveStepsAction,
  type SolveStepsState,
  equationOf,
  fracTex,
  linePairDef,
  linearSceneDef,
  solutionOf,
  solveStepsDef,
} from "@chalk/prop-linear-equations";
import { z } from "zod";

type Fraction = NonNullable<ReturnType<typeof solutionOf>>[0];

/** One linear equation a x + b y + c = 0, as the props store it. */
export type Eq = { a: number; b: number; c: number };

/** a x + b y + c = 0, written the general way. */
export const general = (a: number, b: number, c: number): Eq => ({ a, b, c });

/** a x + b y = k, written the everyday way (stored as a x + b y − k = 0). */
export const equals = (a: number, b: number, k: number): Eq => ({ a, b, c: k === 0 ? 0 : -k });

/** The part of the plane a picture shows. */
export type Window = { xMin: number; xMax: number; yMin: number; yMax: number };

/** The mela's cash box clues: x glasses of lemonade (₹10), y samosas (₹15), 50 sold, ₹600. */
export const CASH_BOX: [Eq, Eq] = [equals(1, 1, 50), equals(10, 15, 600)];

/**
 * A coordinate plane with one or two lines. Whatever the learner may do on it (drag the lines,
 * change line 2's numbers, drag a test point) is theirs alone, not Jugnu's.
 */
export function plane(
  b: BoardKit,
  name: string,
  lines: readonly Eq[],
  window: Window,
  options: Partial<Omit<LinePairState, "lines" | "window">> = {},
): PlacedOf<typeof linePairDef> {
  const p = b.prop(linePairDef, name, {
    lines: [...lines],
    handles: [],
    window,
    variables: ["x", "y"],
    form: EquationForm.Equals,
    snap: 1,
    canDrag: false,
    editLine: null,
    showEquations: true,
    showTables: false,
    showSolution: false,
    showRatios: false,
    probe: null,
    canMoveProbe: false,
    shade: null,
    ...options,
  });
  if (options.canDrag === true) b.studentOnly(p.action(LinePairAction.MoveHandle));
  if (options.editLine !== undefined && options.editLine !== null)
    b.studentOnly(p.action(LinePairAction.SetCoefficient));
  if (options.canMoveProbe === true) b.studentOnly(p.action(LinePairAction.MoveProbe));
  return p;
}

/** A pair worked on paper, step by step, by one method; the learner reveals each step. */
export function working(
  b: BoardKit,
  name: string,
  equations: readonly [Eq, Eq],
  method: Method,
  options: Partial<Omit<SolveStepsState, "equations" | "method">> = {},
): PlacedOf<typeof solveStepsDef> {
  const s = b.prop(solveStepsDef, name, {
    equations: [equations[0], equations[1]],
    method,
    variables: ["x", "y"],
    form: EquationForm.Equals,
    isolate: null,
    eliminate: null,
    step: 0,
    canChoose: method !== Method.CrossMultiplication,
    canStep: true,
    showCheck: true,
    showDiagram: method === Method.CrossMultiplication,
    ...options,
  });
  b.studentOnly(s.action(SolveStepsAction.Choose));
  b.studentOnly(s.action(SolveStepsAction.Next));
  b.studentOnly(s.action(SolveStepsAction.Reset));
  return s;
}

/** A story picture. */
export function scene(
  b: BoardKit,
  name: string,
  kind: LinearSceneKind,
  standsFor: string,
): PlacedOf<typeof linearSceneDef> {
  const s = b.prop(linearSceneDef, name, { scene: kind });
  b.standsFor(s, standsFor);
  return s;
}

/* ------------------------------------------------------------------ */
/* For the question bank                                                */
/* ------------------------------------------------------------------ */

/** A line from a question's params: a x + b y = k. */
export const lineOf = (p: { a: number; b: number; k: number }): Eq => equals(p.a, p.b, p.k);

/** One equation as TeX, the everyday way (a x + b y = k) unless asked for the general form. */
export function eqTex(
  line: Eq,
  general = false,
  names: readonly [string, string] = ["x", "y"],
): string {
  return equationOf(line, names, general ? EquationForm.General : EquationForm.Equals, true);
}

/** A pair as one line of TeX: "2x + 3y = 9 and 4x + 6y = 18" (the connective is localised). */
export function pairTex(
  l1: Eq,
  l2: Eq,
  general = false,
  names: readonly [string, string] = ["x", "y"],
): { en: string; hi: string } {
  const a = `$${eqTex(l1, general, names)}$`;
  const b = `$${eqTex(l2, general, names)}$`;
  return { en: `${a} and ${b}`, hi: `${a} और ${b}` };
}

/** A pair in a question's params: a₁x + b₁y = k₁ and a₂x + b₂y = k₂ (shown in general form if asked). */
export const pairParams = z
  .object({
    a1: z.number(),
    b1: z.number(),
    k1: z.number(),
    a2: z.number(),
    b2: z.number(),
    k2: z.number(),
    general: z.boolean().optional(),
  })
  .strict();
export type PairParams = z.infer<typeof pairParams>;

/** The two lines of a question's pair. */
export const linesOf = (p: PairParams): [Eq, Eq] => [
  equals(p.a1, p.b1, p.k1),
  equals(p.a2, p.b2, p.k2),
];

/** A seed for shuffling a pair's options, the same every build. */
export const seedOf = (p: PairParams): number =>
  Math.round(p.a1 * 3 + p.b1 * 5 + p.k1 * 7 + p.a2 * 11 + p.b2 * 13 + p.k2 * 17);

const methodWords: Record<Method, { en: string; hi: string }> = {
  [Method.Substitution]: { en: "the substitution method", hi: "प्रतिस्थापन विधि" },
  [Method.Elimination]: { en: "the elimination method", hi: "विलोपन विधि" },
  [Method.CrossMultiplication]: { en: "cross-multiplication", hi: "वज्र-गुणन" },
};

/**
 * "Solve this pair by …": the right pair, the same numbers swapped, and the usual sign slip
 * (each wrong option with what to check). The pair must have exactly one solution.
 */
export function solveQuestion(bk: BoardKit, p: PairParams, method: Method) {
  const [l1, l2] = linesOf(p);
  const s = solutionOf(l1, l2);
  if (s === null) throw new Error("solveQuestion: this pair has no unique solution");
  const [x, y] = s;
  const label = (a: Fraction, b: Fraction) => {
    const text = `$x = ${fracTex(a)}$, $y = ${fracTex(b)}$`;
    return t(text, text);
  };
  const check = t(
    `Put your values back into both ${pairTex(l1, l2).en}: one of them fails.`,
    `अपने मान दोनों ${pairTex(l1, l2).hi} में वापस रखो: उनमें से एक खरा नहीं उतरता।`,
  );
  const options = distinctOptions({ id: "right", label: label(x, y) }, [
    { id: "swap", label: label(y, x), feedback: check },
    { id: "sign", label: label(x, y.neg()), feedback: check },
    { id: "both", label: label(x.neg(), y.neg()), feedback: check },
  ]);
  const words = methodWords[method];
  const pair = pairTex(l1, l2, p.general === true);
  return choiceQuestion(bk, {
    prompt: t(`Solve ${pair.en} by ${words.en}.`, `${pair.hi} को ${words.hi} से हल करो।`),
    options: settle(options, seedOf(p) + 3),
    answer: "right",
  });
}
