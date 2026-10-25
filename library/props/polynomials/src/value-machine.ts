import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  EPS,
  type Nice,
  type Poly,
  clean,
  degreeOf,
  niceNumber,
  polyText,
  trim,
  valueAt,
} from "./poly";

export const ValueMachineAction = { Put: "put", Move: "move", StartAgain: "startAgain" } as const;
export const ValueMachineDerived = {
  Value: "value",
  Working: "working",
  ZeroesFound: "zeroesFound",
} as const;
export const ValueMachineSignal = { Put: "put", FoundZero: "foundZero" } as const;

/** How many inputs stay on the grid as dots. */
export const MAX_DOTS = 60;
const reach = z.number().min(-50).max(50);

const valueMachineState = z
  .object({
    /** The polynomial, highest power first. */
    coefficients: z.array(z.number()).min(2).max(6),
    /** Its name and variable: p(x), h(t). */
    name: z.string().regex(/^[a-z]$/),
    variable: z.string().regex(/^[a-z]$/),
    /** The number put in last, or null before the first. */
    input: reach.nullable(),
    /** Every number put in so far, oldest first (each once): a dot each on the grid. */
    tried: z.array(reach).max(MAX_DOTS),
    /** The step the input snaps to (dragging and nudging), and its range. */
    step: z.number().positive(),
    min: reach,
    max: reach,
    /** The grid the dots are drawn on. */
    window: z
      .object({ xMin: reach, xMax: reach, yMin: reach, yMax: reach })
      .strict()
      .refine((w) => w.xMin < w.xMax && w.yMin < w.yMax, "the window is upside down"),
  })
  .strict();
export type ValueMachineState = z.infer<typeof valueMachineState>;

const act = actionsFor<ValueMachineState>();
const snapTo = (x: number, step: number) => clean(Math.round(x / step) * step);
const isZero = (p: Poly, x: number) => Math.abs(valueAt(p, x)) < 1e-9;

/**
 * A number as the machine writes it: halves and quarters as fractions (½, as the book checks
 * zeroes), anything else that ends within 4 places as a decimal (2.3, −3.61, not 23/10), and the
 * rest the book's way.
 */
export function machineNumber(x: number): Nice {
  if (Number.isInteger(clean(x * 4))) return niceNumber(x);
  const r = clean(Math.round(x * 1e4) / 1e4);
  if (Math.abs(r - x) > 1e-9) return niceNumber(x);
  const digits = String(Math.abs(r));
  return {
    value: r,
    tex: r < 0 ? `-${digits}` : digits,
    text: r < 0 ? `−${digits}` : digits,
    isExact: true,
  };
}

/** A number put into a power, the way it's written when substituting: 2, (−1), (1/2), (2.3). */
function inputTex(x: number): string {
  const n = machineNumber(x);
  return x < 0 || !Number.isInteger(n.value) ? `\\left(${n.tex}\\right)` : n.tex;
}

/**
 * The substitution written out, term by term, then the value:
 * p(−1) = (−1)² − 3 × (−1) − 4 = 0.
 */
export function workingTex(p: Poly, x: number, name = "p", v = "x"): string {
  const q = trim(p);
  const n = degreeOf(q);
  const xt = inputTex(x);
  const parts: string[] = [];
  q.forEach((c, i) => {
    if (Math.abs(c) < EPS) return;
    const k = n - i;
    const size = Math.abs(c);
    const isOne = Math.abs(size - 1) < EPS;
    const power = k === 0 ? "" : k === 1 ? xt : `${xt}^{${k}}`;
    const body =
      k === 0 ? niceNumber(size).tex : isOne ? power : `${niceNumber(size).tex} \\times ${power}`;
    const sign = c < 0 ? "-" : "+";
    parts.push(parts.length === 0 ? `${c < 0 ? "-" : ""}${body}` : `${sign} ${body}`);
  });
  const value = machineNumber(clean(valueAt(q, x))).tex;
  return `${name}(${machineNumber(x).tex}) = ${parts.join(" ")} = ${value}`;
}

/** Where the input lands: inside the range, on the step. */
const land = (s: ValueMachineState, x: number) =>
  snapTo(Math.min(s.max, Math.max(s.min, x)), s.step);

function put(s: ValueMachineState, x: number): ValueMachineState {
  const tried = [...s.tried.filter((t) => t !== x), x].slice(-MAX_DOTS);
  return { ...s, input: x, tried };
}

/**
 * The value machine: put in a number, and out comes the polynomial's value at it, with the
 * substitution written out. Every number put in leaves a dot at (x, p(x)) on a grid; a dot on the
 * x-axis is a zero. With enough dots, they trace the graph.
 */
export const valueMachine = defineProp({
  type: "valueMachine",
  describe:
    "A polynomial p(x) as a machine: the learner drags x along the grid's x-axis (or nudges it with − and +, in steps of 0.1 by default) and sees p(x), with the substitution written out term by term as they go (p(−1) = (−1)² − 3 × (−1) − 4 = 0; decimals as decimals, p(2.3) = −5.61). Letting go, or each nudge, puts the number in and leaves a dot at (k, p(k)) on the grid; a zero, where p(k) = 0, is a dot on the x-axis. Enough dots trace the graph of y = p(x).",
  state: valueMachineState,
  defaults: {
    coefficients: [1, -3, -4],
    name: "p",
    variable: "x",
    input: null,
    tried: [],
    step: 0.1,
    min: -5,
    max: 6,
    window: { xMin: -3, xMax: 6, yMin: -8, yMax: 8 },
  },
  derived: {
    [ValueMachineDerived.Value]: {
      describe: "p at the number put in last, or null before the first",
      compute: (s) => (s.input === null ? null : clean(valueAt(s.coefficients, s.input))),
    },
    [ValueMachineDerived.Working]: {
      describe: "The substitution written out, in LaTeX",
      compute: (s) =>
        s.input === null ? null : workingTex(s.coefficients, s.input, s.name, s.variable),
    },
    [ValueMachineDerived.ZeroesFound]: {
      describe: "The numbers put in so far that gave 0, smallest first",
      compute: (s) => s.tried.filter((x) => isZero(s.coefficients, x)).sort((a, b) => a - b),
    },
  },
  actions: {
    [ValueMachineAction.Put]: act({
      describe:
        "Put a number into the machine: letting go of the x handle, or a − / + nudge. Leaves a dot",
      byLearner: true,
      args: z.object({ x: reach }).strict(),
      run: (s, a) => {
        const x = land(s, a.x);
        const next = put(s, x);
        const value = clean(valueAt(s.coefficients, x));
        const emits: Emit[] = [{ signal: ValueMachineSignal.Put, payload: { x, value } }];
        if (isZero(s.coefficients, x))
          emits.push({ signal: ValueMachineSignal.FoundZero, payload: { x } });
        return set({ input: next.input, tried: next.tried }, ...emits);
      },
    }),
    [ValueMachineAction.Move]: act({
      describe:
        "Slide x along the axis (the learner dragging the handle): the working follows, no dot is left",
      byLearner: true,
      args: z.object({ x: reach }).strict(),
      run: (s, a) => set({ input: land(s, a.x) }),
    }),
    [ValueMachineAction.StartAgain]: act({
      describe: "Clear every dot",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ input: null, tried: [] }),
    }),
  },
  signals: {
    [ValueMachineSignal.Put]: { describe: "A number went in: `x` and `value` = p(x)" },
    [ValueMachineSignal.FoundZero]: { describe: "A number put in gave 0: `x` is a zero" },
  },
  observe: (s) => {
    const p = s.coefficients;
    const fn = `${s.name}(${s.variable}) = ${polyText(p, s.variable)}`;
    const elements: Element[] = [
      {
        id: "input",
        value:
          s.input === null
            ? "nothing put in yet"
            : `${s.variable} = ${machineNumber(s.input).text}`,
      },
    ];
    elements.push({
      id: "handle",
      value: `on the x-axis at ${s.variable} = ${machineNumber(s.input ?? 0).text}, to drag`,
    });
    if (s.input !== null)
      elements.push({
        id: "working",
        value: `${s.name}(${machineNumber(s.input).text}) = ${machineNumber(clean(valueAt(p, s.input))).text}`,
      });
    elements.push({
      id: "dots",
      value:
        s.tried.length === 0
          ? "no dots yet"
          : s.tried
              .map((x) => `(${machineNumber(x).text}, ${machineNumber(clean(valueAt(p, x))).text})`)
              .join(", "),
    });
    const zeroes = s.tried.filter((x) => isZero(p, x));
    return {
      summary: `the value machine for ${fn}; ${s.tried.length} numbers put in${zeroes.length > 0 ? `, zeroes found: ${zeroes.map((x) => machineNumber(x).text).join(", ")}` : ""}`,
      elements,
    };
  },
});
