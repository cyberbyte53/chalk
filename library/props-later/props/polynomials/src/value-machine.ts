import { type Emit, actionsFor, defineGroup, set } from "@chalk/prop";
import {
  type Dot,
  DotTone,
  dotPlane,
  iconButtonDef,
  mathLineDef,
  stepperDef,
} from "@chalk/prop-blocks";
import { z } from "zod";
import {
  EPS,
  type Nice,
  type Poly,
  clean,
  degreeOf,
  niceNumber,
  polyTex,
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

/** What the machine itself holds; everything its blocks show is worked out from this. */
const machineOwn = z
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
type Own = z.infer<typeof machineOwn>;

const act = actionsFor<Own>();
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
const land = (s: Own, x: number) => snapTo(Math.min(s.max, Math.max(s.min, x)), s.step);

/** The dots on the grid: every number put in (the last one bright), zeroes marked. */
function dotsOf(s: Own): Dot[] {
  const p = s.coefficients;
  const { xMin, xMax, yMin, yMax } = s.window;
  const at = (x: number) => clean(valueAt(p, x));
  const inside = (x: number) => x >= xMin && x <= xMax && at(x) >= yMin && at(x) <= yMax;
  const out: Dot[] = s.tried.filter(inside).map((t) => ({
    x: t,
    y: at(t),
    tone: isZero(p, t) ? DotTone.Accent : DotTone.Main,
    ...(t === s.input ? {} : { isFaded: true }),
  }));
  // Held but not put in yet (dragging): a grey dot.
  if (s.input !== null && !s.tried.includes(s.input) && inside(s.input))
    out.push({ x: s.input, y: at(s.input), tone: DotTone.Muted });
  return out;
}

/**
 * The value machine: put in a number, and out comes the polynomial's value at it, with the
 * substitution written out. Every number put in leaves a dot at (x, p(x)) on a grid; a dot on the
 * x-axis is a zero. With enough dots, they trace the graph.
 *
 * A group of blocks: the rule and the working are lines of maths, x is a stepper and a handle on
 * the plane's x-axis, the dots are plotted on the plane, ↺ is a button. The machine holds the
 * polynomial, the input and the numbers tried; every block's shown fields are bound to those (IS),
 * and what the learner does to a block is routed to the machine's Put or Move.
 */
export const valueMachine = defineGroup({
  type: "valueMachine",
  describe:
    "A polynomial p(x) as a machine: the learner drags x along the grid's x-axis (or nudges it with − and +, in steps of 0.1 by default) and sees p(x), with the substitution written out term by term as they go (p(−1) = (−1)² − 3 × (−1) − 4 = 0; decimals as decimals, p(2.3) = −5.61). Letting go, or each nudge, puts the number in and leaves a dot at (k, p(k)) on the grid; a zero, where p(k) = 0, is a dot on the x-axis. Enough dots trace the graph of y = p(x).",
  own: machineOwn,
  ownDefaults: {
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
  children: {
    rule: mathLineDef,
    stepper: stepperDef,
    substitution: mathLineDef,
    plane: dotPlane,
    clear: iconButtonDef,
  },
  defaults: { clear: { symbol: "↺", label: "Clear the dots" } },
  is: {
    rule: (s) => ({ tex: `${s.name}(${s.variable}) = ${polyTex(s.coefficients, s.variable)}` }),
    stepper: (s) => ({
      name: s.variable,
      value: s.input ?? 0,
      shown: machineNumber(s.input ?? 0).text,
      step: s.step,
      min: s.min,
      max: s.max,
    }),
    substitution: (s) => ({
      tex: s.input === null ? "" : workingTex(s.coefficients, s.input, s.name, s.variable),
      isSplit: degreeOf(trim(s.coefficients)) >= 3,
    }),
    plane: (s) => ({
      paper: {
        window: [s.window.xMin, s.window.xMax, s.window.yMin, s.window.yMax] as [
          number,
          number,
          number,
          number,
        ],
        isEqualUnits: false,
        axisNames: [s.variable, "y"] as [string, string],
      },
      dots: { dots: dotsOf(s) },
      handle: {
        x: s.input ?? 0,
        label: machineNumber(s.input ?? 0).text,
        step: s.step,
        name: s.variable,
      },
      guide: {
        at: s.input === null ? null : { x: s.input, y: clean(valueAt(s.coefficients, s.input)) },
      },
    }),
    clear: (s) => ({ isEnabled: s.tried.length > 0 }),
  },
  route: {
    // x is the machine's: a nudge or a drag moves the machine's input, not the block's own copy.
    "stepper.change": (_s, a) => [[ValueMachineAction.Put, { x: a.to }]],
    "plane.handle.move": (_s, a) => [[ValueMachineAction.Move, { x: a.x }]],
    "plane.handle.put": (_s, a) => [[ValueMachineAction.Put, { x: a.x }]],
  },
  when: { "clear.pressed": () => [[ValueMachineAction.StartAgain, {}]] },
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
      changes: ["input", "tried"],
      run: (s, a) => {
        const x = land(s, a.x);
        const tried = [...s.tried.filter((t) => t !== x), x].slice(-MAX_DOTS);
        const value = clean(valueAt(s.coefficients, x));
        const emits: Emit[] = [{ signal: ValueMachineSignal.Put, payload: { x, value } }];
        if (isZero(s.coefficients, x))
          emits.push({ signal: ValueMachineSignal.FoundZero, payload: { x } });
        return set({ input: x, tried }, ...emits);
      },
    }),
    [ValueMachineAction.Move]: act({
      describe:
        "Slide x along the axis (the learner dragging the handle): the working follows, no dot is left",
      byLearner: true,
      args: z.object({ x: reach }).strict(),
      changes: ["input"],
      run: (s, a) => set({ input: land(s, a.x) }),
    }),
    [ValueMachineAction.StartAgain]: act({
      describe: "Clear every dot",
      byLearner: true,
      args: z.object({}).strict(),
      changes: ["input", "tried"],
      run: () => set({ input: null, tried: [] }),
    }),
  },
  signals: {
    [ValueMachineSignal.Put]: { describe: "A number went in: `x` and `value` = p(x)" },
    [ValueMachineSignal.FoundZero]: { describe: "A number put in gave 0: `x` is a zero" },
  },
  summary: (s) => {
    const fn = `${s.name}(${s.variable}) = ${polyText(s.coefficients, s.variable)}`;
    const zeroes = s.tried.filter((x) => isZero(s.coefficients, x));
    return `the value machine for ${fn}; ${s.tried.length} numbers put in${zeroes.length > 0 ? `, zeroes found: ${zeroes.map((x) => machineNumber(x).text).join(", ")}` : ""}`;
  },
  layout: { kind: "column", children: ["rule", "stepper", "substitution", "plane", "clear"] },
});

export type ValueMachineState = NonNullable<typeof valueMachine.stateType>;
