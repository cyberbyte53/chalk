import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type DivisionStep,
  type Term,
  collect,
  divisionSteps,
  termTex,
  termsOf,
  termsTex,
  termsText,
} from "./box-algebra";
import { button } from "./seen";

export const LongDivisionAction = {
  Next: "next",
  All: "all",
  StartAgain: "startAgain",
  SetProblem: "setProblem",
} as const;

export const LongDivisionDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Quotient: "quotient",
  Remainder: "remainder",
} as const;

export const LongDivisionSignal = { Stepped: "stepped", Finished: "finished" } as const;

/** The three moves that find one quotient term, in order. */
export const DivisionMove = {
  Divide: "divide",
  Multiply: "multiply",
  Subtract: "subtract",
} as const;
export type DivisionMove = (typeof DivisionMove)[keyof typeof DivisionMove];
const MOVES: readonly DivisionMove[] = [
  DivisionMove.Divide,
  DivisionMove.Multiply,
  DivisionMove.Subtract,
];

const coefficients = z.array(z.number()).min(1).max(6);

const longDivisionState = z
  .object({
    /** What is divided, highest power first. */
    dividend: coefficients,
    /** What it is divided by, highest power first. */
    divisor: coefficients,
    /** Moves done: three per quotient term (divide, multiply, subtract). */
    steps: z.number().int().min(0),
    variable: z.string().regex(/^[a-z]$/),
  })
  .strict();
export type LongDivisionState = z.infer<typeof longDivisionState>;

type Problem = Pick<LongDivisionState, "dividend" | "divisor">;

const stepsOf = (s: Problem): DivisionStep[] => divisionSteps(s.dividend, s.divisor);

/** Every move it takes: three for each quotient term. */
export function moveCountOf(s: Problem): number {
  return stepsOf(s).length * MOVES.length;
}

/** What is left before quotient term `i` is found (the dividend, for the first). */
function leftBefore(steps: readonly DivisionStep[], i: number, s: Problem): Term[] {
  return i === 0 ? collect(termsOf(s.dividend)) : (steps[i - 1]?.remaining ?? []);
}

const quotientOf = (s: Problem) => stepsOf(s).map((step) => step.quotient);
const remainderOf = (s: Problem) => stepsOf(s).at(-1)?.remaining ?? collect(termsOf(s.dividend));

/** The move just done: which quotient term, and which of its three moves; null before the first. */
export function lastMove(s: LongDivisionState): { term: number; move: DivisionMove } | null {
  if (s.steps === 0) return null;
  const k = s.steps - 1;
  return {
    term: Math.floor(k / MOVES.length),
    move: MOVES[k % MOVES.length] ?? DivisionMove.Divide,
  };
}

/** The maths of the move just done, in LaTeX: 2x² ÷ x = 2x; 2x(x + 2) = 2x² + 4x; the subtraction. */
export function moveTex(s: LongDivisionState): string | null {
  const at = lastMove(s);
  if (at === null) return null;
  const v = s.variable;
  const steps = stepsOf(s);
  const step = steps[at.term];
  if (step === undefined) return null;
  const left = leftBefore(steps, at.term, s);
  const lead = termsOf(s.divisor)[0];
  const first = left[0];
  const g = termsTex(termsOf(s.divisor), v);
  const isMonomial = termsOf(s.divisor).length === 1;
  const q = termTex(step.quotient, v);
  if (at.move === DivisionMove.Divide)
    return first === undefined || lead === undefined
      ? null
      : `\\frac{${termTex(first, v)}}{${termTex(lead, v)}} = ${q}`;
  if (at.move === DivisionMove.Multiply)
    return `${q.startsWith("-") ? `(${q})` : q}${isMonomial ? ` \\times ${g}` : `(${g})`} = ${termsTex(step.cells, v)}`;
  // What's left goes on a line of its own, and after the last move the whole result: a phone is
  // too narrow for either on one line.
  const lines = [
    `&(${termsTex(left, v)}) - (${termsTex(step.cells, v)})`,
    `&= ${termsTex(step.remaining, v)}`,
  ];
  if (at.term === steps.length - 1) {
    const r = remainderOf(s);
    lines.push(
      `[6pt] &${termsTex(collect(termsOf(s.dividend)), v)}`,
      `&= (${g})(${termsTex(quotientOf(s), v)})${r.length === 0 ? "" : ` + ${bracket(termsTex(r, v))}`}`,
    );
  }
  // A line starting [6pt] is a gap before it, written straight after the \\.
  const body = lines
    .map((line, i) => (i === 0 ? line : line.startsWith("[") ? `\\\\${line}` : `\\\\ ${line}`))
    .join(" ");
  return `\\begin{aligned} ${body} \\end{aligned}`;
}

/** A polynomial in brackets when it has more than one term or a sign: 3, (9x + 10), (−1). */
function bracket(tex: string): string {
  return /^-|\s[+-]\s/.test(tex) ? `(${tex})` : tex;
}

/**
 * One row of the layout: each term in its power's column, a row's first term with no plus. Columns
 * run from the dividend's highest power (`top`) down to the constant.
 */
function rowCells(terms: readonly Term[], top: number, v: string): string[] {
  const cells = Array.from({ length: top + 1 }, () => "");
  terms.forEach((t, i) => {
    const column = top - t.power;
    if (column < 0 || column > top) return;
    const body = termTex(t, v);
    cells[column] = i === 0 ? body : body.startsWith("-") ? `-\\;${body.slice(1)}` : `+\\;${body}`;
  });
  return cells;
}

/** A row taken away: −( on its first term, ) on its last. */
function takenAway(cells: string[]): string[] {
  const first = cells.findIndex((c) => c !== "");
  const last = cells.length - 1 - [...cells].reverse().findIndex((c) => c !== "");
  return cells.map((c, i) => `${i === first ? "-(" : ""}${c}${i === last ? ")" : ""}`);
}

/**
 * The long division as the book sets it out, in LaTeX: the quotient on top, the divisor to the
 * left, then for each quotient term its product (taken away) and what is left. Like powers stand in
 * one column, the quotient's terms included.
 */
export function layoutTex(s: LongDivisionState): string {
  const v = s.variable;
  const steps = stepsOf(s);
  const dividend = collect(termsOf(s.dividend));
  const top = dividend[0]?.power ?? 0;
  const found = Math.ceil(s.steps / MOVES.length);
  const quotient = steps.slice(0, found).map((step) => step.quotient);
  // Each row, and whether a line is drawn under it.
  const rows: { cells: string; isRuled: boolean }[] = [
    { cells: ` & ${rowCells(quotient, top, v).join(" & ")}`, isRuled: true },
    {
      cells: `${termsTex(termsOf(s.divisor), v)} & ${rowCells(dividend, top, v).join(" & ")}`,
      isRuled: false,
    },
  ];
  steps.forEach((step, i) => {
    const moves = s.steps - i * MOVES.length;
    if (moves >= 2)
      rows.push({
        cells: ` & ${takenAway(rowCells(step.cells, top, v)).join(" & ")}`,
        isRuled: true,
      });
    if (moves >= 3) {
      const left =
        step.remaining.length === 0
          ? [...Array.from({ length: top }, () => ""), "0"]
          : rowCells(step.remaining, top, v);
      rows.push({ cells: ` & ${left.join(" & ")}`, isRuled: false });
    }
  });
  const body = rows
    .map((row, i) => `${i > 0 && rows[i - 1]?.isRuled ? "\\hline " : ""}${row.cells}`)
    .join(" \\\\ ");
  return `\\begin{array}{r|${"r".repeat(top + 1)}} ${body} \\end{array}`;
}

const act = actionsFor<LongDivisionState>();
const none = z.object({}).strict();

function finished(s: LongDivisionState): Emit {
  const v = s.variable;
  return {
    signal: LongDivisionSignal.Finished,
    payload: { quotient: termsText(quotientOf(s), v), remainder: termsText(remainderOf(s), v) },
  };
}

/**
 * Long division of polynomials, the way the book sets it out. Each quotient term takes three moves:
 * divide (what's left's first term ÷ the divisor's first term), multiply (the divisor by that term)
 * and subtract (to get what's left). It stops when what's left has a smaller degree than the
 * divisor: that is the remainder, and dividend = divisor × quotient + remainder.
 */
export const longDivision = defineProp({
  type: "longDivision",
  describe:
    "Long division of one polynomial by another, set out as in the book: divisor on the left, quotient on top, like powers in one column. The learner taps through it one move at a time, three moves per quotient term: divide (what's left's first term ÷ the divisor's first term, written on top), multiply (the divisor times that term, written underneath) and subtract (what's left). Under the layout, the maths of the move just made is written out (2x² ÷ x = 2x; 2x(x + 2) = 2x² + 4x; (2x² + 3x + 1) − (2x² + 4x) = −x + 1). It stops when what's left has a smaller degree than the divisor, and ends with dividend = divisor × quotient + remainder.",
  state: longDivisionState,
  defaults: { dividend: [2, 3, 1], divisor: [1, 2], steps: 0, variable: "x" },
  derived: {
    [LongDivisionDerived.StepCount]: {
      describe: "How many moves it takes in all (three per quotient term)",
      compute: moveCountOf,
    },
    [LongDivisionDerived.IsDone]: {
      describe: "Every move is done",
      compute: (s) => s.steps >= moveCountOf(s),
    },
    [LongDivisionDerived.Quotient]: {
      describe: "The whole quotient, written out",
      compute: (s) => termsText(quotientOf(s), s.variable),
    },
    [LongDivisionDerived.Remainder]: {
      describe: "The remainder, written out (0 when the divisor is a factor)",
      compute: (s) => termsText(remainderOf(s), s.variable),
    },
  },
  actions: {
    [LongDivisionAction.Next]: act({
      describe: "Make the next move: divide, multiply or subtract (the learner's button)",
      byLearner: true,
      args: none,
      run: (s) => {
        const total = moveCountOf(s);
        if (s.steps >= total) return set({});
        const steps = s.steps + 1;
        const emits: Emit[] = [{ signal: LongDivisionSignal.Stepped, payload: { step: steps } }];
        if (steps === total) emits.push(finished(s));
        return set({ steps }, ...emits);
      },
    }),
    [LongDivisionAction.All]: act({
      describe: "Make every move at once",
      reveals: true,
      args: none,
      run: (s) => {
        const total = moveCountOf(s);
        return s.steps >= total ? set({}) : set({ steps: total }, finished(s));
      },
    }),
    [LongDivisionAction.StartAgain]: act({
      describe: "Back to the start: only the dividend and the divisor",
      byLearner: true,
      args: none,
      run: () => set({ steps: 0 }),
    }),
    [LongDivisionAction.SetProblem]: act({
      describe: "A new division, from the start",
      args: z.object({ dividend: coefficients, divisor: coefficients }).strict(),
      run: (_s, a) => set({ dividend: a.dividend, divisor: a.divisor, steps: 0 }),
    }),
  },
  signals: {
    [LongDivisionSignal.Stepped]: { describe: "A move was made: `step` is how many so far" },
    [LongDivisionSignal.Finished]: {
      describe: "Every move is made: `quotient` and `remainder`",
    },
  },
  invariant: (s) => {
    if (termsOf(s.divisor).length === 0) return "the divisor can't be 0";
    if (s.steps > moveCountOf(s))
      return `steps ${s.steps} is more than the ${moveCountOf(s)} there are`;
    return undefined;
  },
  observe: (s) => {
    const v = s.variable;
    const steps = stepsOf(s);
    const total = moveCountOf(s);
    const isDone = s.steps >= total;
    const found = Math.ceil(s.steps / MOVES.length);
    const dividend = termsText(collect(termsOf(s.dividend)), v);
    const divisor = termsText(termsOf(s.divisor), v);
    const rows = steps.flatMap((step, i) => {
      const moves = s.steps - i * MOVES.length;
      const out: string[] = [];
      if (moves >= 2) out.push(`take away ${termsText(step.cells, v)}`);
      if (moves >= 3) out.push(`left ${termsText(step.remaining, v)}`);
      return out;
    });
    const at = lastMove(s);
    const elements: Element[] = [
      {
        id: "working",
        value: [
          `quotient so far: ${found === 0 ? "nothing" : termsText(quotientOf(s).slice(0, found), v)}`,
          `${divisor} ) ${dividend}`,
          ...rows,
        ].join("; "),
      },
    ];
    if (at !== null)
      elements.push({ id: "move", value: `${at.move} (quotient term ${at.term + 1})` });
    elements.push(button("next", !isDone), button("startAgain", s.steps > 0));
    return {
      summary: `long division of ${dividend} by ${divisor}: ${s.steps} of ${total} moves made${isDone ? `; quotient ${termsText(quotientOf(s), v)}, remainder ${termsText(remainderOf(s), v)}` : ""}`,
      elements,
      ...(isDone
        ? {}
        : {
            hidden: {
              quotient: termsText(quotientOf(s), v),
              remainder: termsText(remainderOf(s), v),
            },
          }),
    };
  },
});
