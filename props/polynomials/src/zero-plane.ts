import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Poly,
  clean,
  degreeOf,
  factoredTex,
  fromVertex,
  fromZeroes,
  niceNumber,
  polyText,
  realZeroes,
  trim,
  valueAt,
  zeroesWithRepeats,
} from "./poly";

/** How the graph is held: by its zeroes, by its vertex (a parabola), or fixed by its coefficients. */
export const PlaneForm = {
  Zeroes: "zeroes",
  Vertex: "vertex",
  Coefficients: "coefficients",
} as const;
export type PlaneForm = (typeof PlaneForm)[keyof typeof PlaneForm];

export const ZeroPlaneAction = {
  MoveZero: "moveZero",
  MoveVertex: "moveVertex",
  SetLeading: "setLeading",
  MoveProbe: "moveProbe",
  SetCoefficients: "setCoefficients",
  Lift: "lift",
  Flip: "flip",
} as const;

export const ZeroPlaneDerived = {
  Coefficients: "coefficients",
  Leading: "leadingCoefficient",
  Degree: "degree",
  Zeroes: "zeroes",
  ZeroCount: "zeroCount",
  HasTouch: "hasTouch",
  SumOfZeroes: "sumOfZeroes",
  ProductOfZeroes: "productOfZeroes",
  YIntercept: "yIntercept",
  ProbeValue: "probeValue",
  Equation: "equation",
} as const;

export const ZeroPlaneSignal = { Changed: "changed", Probed: "probed" } as const;

/** The most zeroes a graph can be held by (a quartic, for Example 9). */
export const MAX_DEGREE = 4;
/** How far the plane reaches, either way, at most. */
export const MAX_REACH = 50;

const reach = z.number().min(-MAX_REACH).max(MAX_REACH);

const zeroPlaneState = z
  .object({
    form: z.nativeEnum(PlaneForm),
    /** a, the leading coefficient (zeroes and vertex forms). */
    leading: z
      .number()
      .min(-10)
      .max(10)
      .refine((a) => a !== 0, "the leading coefficient can't be 0"),
    /** The zeroes, in the order their handles were placed (zeroes form): y = a(x − z₁)(x − z₂)… */
    zeroes: z.array(reach).max(MAX_DEGREE),
    /** The vertex (h, k) (vertex form): y = a(x − h)² + k. */
    vertex: z.tuple([reach, reach]),
    /** Highest power first (coefficients form). */
    fixed: z.array(z.number()).max(MAX_DEGREE + 1),
    /** The variable's letter: x, u, s, t. */
    variable: z.string().regex(/^[a-z]$/),
    /** Handles move by this much. */
    snap: z.number().positive(),
    /** The plane shown: x from xMin to xMax, y from yMin to yMax. */
    window: z
      .object({ xMin: reach, xMax: reach, yMin: reach, yMax: reach })
      .strict()
      .refine((w) => w.xMin < w.xMax && w.yMin < w.yMax, "the window is upside down"),
    /** Whether the learner can drag the zeroes or the vertex. */
    isDraggable: z.boolean(),
    /** Whether the learner can change a (a stepper below the plane). */
    canSetLeading: z.boolean(),
    /** The stepper's label for a: "a", or "k" where the text calls the multiplier k. */
    leadingName: z.string().min(1).max(2),
    isEquationShown: z.boolean(),
    isFactoredShown: z.boolean(),
    /** The axis of symmetry (a parabola): the dashed line x = −b/2a. */
    isSymmetryShown: z.boolean(),
    /** The point (0, p(0)) where the graph meets the y-axis. */
    isInterceptShown: z.boolean(),
    /** The probe: a point the learner slides along the curve, showing p(k). Null: no probe. */
    probe: reach.nullable(),
    /** Added to the constant term: the whole curve lifted (or lowered) by this much. */
    lift: reach,
    /** Whether the learner can lift the curve by dragging the point where it meets the y-axis. */
    canLift: z.boolean(),
    /** Whether the learner can turn the curve upside down (every coefficient negated). */
    canFlip: z.boolean(),
    /** A quadratic's α + β and αβ, read out under the plane. */
    isSumProductShown: z.boolean(),
  })
  .strict();
export type ZeroPlaneState = z.infer<typeof zeroPlaneState>;

/** The polynomial the state draws, before any lift. */
function heldBy(s: ZeroPlaneState): number[] {
  switch (s.form) {
    case PlaneForm.Zeroes:
      return fromZeroes(s.leading, s.zeroes);
    case PlaneForm.Vertex:
      return fromVertex(s.leading, s.vertex[0], s.vertex[1]);
    default:
      return trim(s.fixed);
  }
}

/** The polynomial the state draws: what holds it, lifted by `lift`. */
export function coefficientsOf(s: ZeroPlaneState): number[] {
  const p = heldBy(s);
  if (s.lift === 0) return p;
  return p.map((c, i) => (i === p.length - 1 ? clean(c + s.lift) : c));
}

/** x on the grid of `step`. Not rounded further: −2 × (1/6) stays the float nearest −1/3, so p(−1/3) comes out 0. */
const snapTo = (x: number, step: number) => {
  const v = Math.round(x / step) * step;
  return Object.is(v, -0) ? 0 : v;
};

/** −b/a for a quadratic or cubic (the sum of all its zeroes, real or not), else null. */
export function sumOf(p: Poly): number | null {
  const n = degreeOf(p);
  return n >= 1 && p[0] !== undefined && p[1] !== undefined ? clean(-p[1] / p[0]) : null;
}

/** (−1)ⁿ × constant / a: the product of all the zeroes. */
export function productOf(p: Poly): number | null {
  const n = degreeOf(p);
  const a = p[0];
  const last = p[n];
  if (n < 1 || a === undefined || last === undefined) return null;
  return clean(((n % 2 === 0 ? 1 : -1) * last) / a);
}

const act = actionsFor<ZeroPlaneState>();

/**
 * The graph of y = p(x) on a plane, with its zeroes where it meets the x-axis. It can be held by its
 * zeroes (drag them along the axis: the curve and its equation follow), by its vertex (a parabola:
 * drag it to make 2, 1 or no zeroes), or fixed. Optional: the axis of symmetry, the y-intercept, the
 * equation written out and factored, and a probe that slides along the curve reading p(k).
 */
export const zeroPlane = defineProp({
  type: "zeroPlane",
  describe:
    "The graph of y = p(x) for a polynomial p of degree 1 to 4, on a coordinate plane. Its zeroes are the x-coordinates where the graph meets the x-axis; a degree-n polynomial meets it at most n times. Held by its zeroes, y = a(x − z₁)(x − z₂)…, the learner drags them along the axis; held by its vertex, y = a(x − h)² + k, the learner drags the vertex and sees 2, 1 or 0 zeroes. A parabola's axis of symmetry sits midway between its zeroes, at x = −b/2a; it meets the y-axis at p(0), the constant term. A probe slides along the curve reading p(k).",
  state: zeroPlaneState,
  defaults: {
    form: PlaneForm.Zeroes,
    leading: 1,
    zeroes: [-1, 3],
    vertex: [1, -4],
    fixed: [1, -2, -3],
    variable: "x",
    snap: 0.5,
    window: { xMin: -5, xMax: 5, yMin: -6, yMax: 6 },
    isDraggable: true,
    canSetLeading: false,
    leadingName: "a",
    isEquationShown: true,
    isFactoredShown: false,
    isSymmetryShown: false,
    isInterceptShown: false,
    probe: null,
    lift: 0,
    canLift: false,
    canFlip: false,
    isSumProductShown: false,
  },
  derived: {
    [ZeroPlaneDerived.Coefficients]: {
      describe: "p's coefficients, highest power first",
      compute: coefficientsOf,
    },
    [ZeroPlaneDerived.Leading]: {
      describe:
        "a, p's leading coefficient: a parabola opens up when it is positive, down when negative",
      compute: (s) => coefficientsOf(s)[0] ?? 0,
    },
    [ZeroPlaneDerived.Degree]: {
      describe: "p's degree",
      compute: (s) => degreeOf(coefficientsOf(s)),
    },
    [ZeroPlaneDerived.Zeroes]: {
      describe: "The real zeroes, smallest first, each once (where the graph meets the x-axis)",
      compute: (s) => realZeroes(coefficientsOf(s)).map((zero) => zero.x),
    },
    [ZeroPlaneDerived.ZeroCount]: {
      describe: "How many points the graph meets the x-axis at (a touch counts once)",
      compute: (s) => realZeroes(coefficientsOf(s)).length,
    },
    [ZeroPlaneDerived.HasTouch]: {
      describe: "The graph touches the x-axis somewhere without crossing it (a repeated zero)",
      compute: (s) => realZeroes(coefficientsOf(s)).some((zero) => zero.multiplicity % 2 === 0),
    },
    [ZeroPlaneDerived.SumOfZeroes]: {
      describe: "−b/a: the sum of all the zeroes, counted with repeats",
      compute: (s) => sumOf(coefficientsOf(s)),
    },
    [ZeroPlaneDerived.ProductOfZeroes]: {
      describe: "The product of all the zeroes: c/a for a quadratic, −d/a for a cubic",
      compute: (s) => productOf(coefficientsOf(s)),
    },
    [ZeroPlaneDerived.YIntercept]: {
      describe: "p(0), where the graph meets the y-axis: the constant term",
      compute: (s) => clean(valueAt(coefficientsOf(s), 0)),
    },
    [ZeroPlaneDerived.ProbeValue]: {
      describe: "p(k) at the probe, or null without one",
      compute: (s) => (s.probe === null ? null : clean(valueAt(coefficientsOf(s), s.probe))),
    },
    [ZeroPlaneDerived.Equation]: {
      describe: "p(x) written out, the book's way",
      compute: (s) => polyText(coefficientsOf(s), s.variable),
    },
  },
  inputs: [
    "isEquationShown",
    "isFactoredShown",
    "isSymmetryShown",
    "isInterceptShown",
    "isDraggable",
    "isSumProductShown",
  ],
  actions: {
    [ZeroPlaneAction.MoveZero]: act({
      describe: "Slide one zero along the x-axis (the learner's drag); the curve follows",
      byLearner: true,
      args: z.object({ index: z.number().int().min(0), to: reach }).strict(),
      run: (s, a) => {
        if (s.form !== PlaneForm.Zeroes || !s.isDraggable || a.index >= s.zeroes.length)
          return set({});
        const to = snapTo(Math.min(s.window.xMax, Math.max(s.window.xMin, a.to)), s.snap);
        if (s.zeroes[a.index] === to) return set({});
        const zeroes = s.zeroes.map((x, i) => (i === a.index ? to : x));
        return set({ zeroes }, changed({ ...s, zeroes }));
      },
    }),
    [ZeroPlaneAction.MoveVertex]: act({
      describe: "Move a parabola's vertex (the learner's drag); its shape stays",
      byLearner: true,
      args: z.object({ x: reach, y: reach }).strict(),
      run: (s, a) => {
        if (s.form !== PlaneForm.Vertex || !s.isDraggable) return set({});
        const vertex: [number, number] = [snapTo(a.x, s.snap), snapTo(a.y, s.snap)];
        if (vertex[0] === s.vertex[0] && vertex[1] === s.vertex[1]) return set({});
        return set({ vertex }, changed({ ...s, vertex }));
      },
    }),
    [ZeroPlaneAction.SetLeading]: act({
      describe:
        "Change a: k·p(x) has the same zeroes as p(x); a < 0 turns a parabola upside down (the learner's stepper)",
      byLearner: true,
      args: z.object({ leading: z.number().min(-10).max(10) }).strict(),
      run: (s, a) => {
        if (!s.canSetLeading || a.leading === 0) return set({});
        if (s.form === PlaneForm.Coefficients) {
          const old = s.fixed.find((c) => c !== 0) ?? 1;
          const fixed = s.fixed.map((c) => clean((c * a.leading) / old));
          return set({ fixed }, changed({ ...s, fixed }));
        }
        return set({ leading: a.leading }, changed({ ...s, leading: a.leading }));
      },
    }),
    [ZeroPlaneAction.MoveProbe]: act({
      describe: "Slide the probe to x = k along the curve; it reads p(k) (the learner's drag)",
      byLearner: true,
      args: z.object({ x: reach }).strict(),
      run: (s, a) => {
        if (s.probe === null) return set({});
        const probe = snapTo(Math.min(s.window.xMax, Math.max(s.window.xMin, a.x)), s.snap);
        if (probe === s.probe) return set({});
        const value = clean(valueAt(coefficientsOf(s), probe));
        return set({ probe }, { signal: ZeroPlaneSignal.Probed, payload: { x: probe, value } });
      },
    }),
    [ZeroPlaneAction.SetCoefficients]: act({
      describe: "Show another polynomial, fixed by its coefficients (highest power first)",
      args: z
        .object({
          coefficients: z
            .array(z.number())
            .min(2)
            .max(MAX_DEGREE + 1),
        })
        .strict(),
      run: (s, a) => {
        const fixed = trim(a.coefficients);
        if (fixed.length < 2) return set({});
        return set(
          { form: PlaneForm.Coefficients, fixed },
          changed({ ...s, form: PlaneForm.Coefficients, fixed }),
        );
      },
    }),
    [ZeroPlaneAction.Lift]: act({
      describe:
        "Lift (or lower) the whole curve: the constant term changes, so the curve meets the x-axis in more or fewer places (the learner's drag on the y-axis point)",
      byLearner: true,
      args: z.object({ to: reach }).strict(),
      run: (s, a) => {
        if (!s.canLift) return set({});
        const lift = snapTo(a.to, s.snap);
        const p0 = valueAt(heldBy(s), 0) + lift;
        if (lift === s.lift || p0 < s.window.yMin || p0 > s.window.yMax) return set({});
        return set({ lift }, changed({ ...s, lift }));
      },
    }),
    [ZeroPlaneAction.Flip]: act({
      describe:
        "Turn the curve upside down: every coefficient changes sign, so a parabola that opened up opens down. The zeroes stay (the learner's button)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canFlip) return set({});
        const lift = clean(-s.lift);
        const flipped: Partial<ZeroPlaneState> =
          s.form === PlaneForm.Zeroes
            ? { leading: -s.leading, lift }
            : s.form === PlaneForm.Vertex
              ? { leading: -s.leading, vertex: [s.vertex[0], clean(-s.vertex[1])], lift }
              : { fixed: s.fixed.map((c) => clean(-c)), lift };
        return set(flipped, changed({ ...s, ...flipped }));
      },
    }),
  },
  signals: {
    [ZeroPlaneSignal.Changed]: {
      describe: "The polynomial changed: `zeroes` (real, each once) and `equation`",
    },
    [ZeroPlaneSignal.Probed]: { describe: "The probe moved: `x` and `value` = p(x)" },
  },
  invariant: (s) => {
    const n = degreeOf(coefficientsOf(s));
    if (n < 1) return "the polynomial must have degree 1 or more";
    if (n > MAX_DEGREE) return `degree ${n} is more than ${MAX_DEGREE}`;
    if (s.form === PlaneForm.Zeroes && s.zeroes.length === 0)
      return "a graph held by its zeroes needs one";
    return undefined;
  },
  observe: (s) => {
    const p = coefficientsOf(s);
    const v = s.variable;
    const n = degreeOf(p);
    const zeroes = realZeroes(p);
    const shape =
      n === 1
        ? "a straight line"
        : n === 2
          ? `a parabola opening ${(p[0] ?? 1) > 0 ? "up" : "down"}`
          : `a curve of degree ${n}`;
    const elements: Element[] = [{ id: "curve", value: `y = ${polyText(p, v)}` }];
    const isHeldByZeroes = s.form === PlaneForm.Zeroes;
    // Zero handles are tied to the stored zeroes (so a drag keeps hold of the same one); otherwise
    // the zeroes are marked where the graph meets the axis, each once.
    const marked = isHeldByZeroes
      ? s.zeroes.map((x, i) => ({ id: `zero:${i}`, x }))
      : zeroes.map((zero, i) => ({ id: `zero:${i}`, x: zero.x }));
    const inView = (x: number) => x >= s.window.xMin && x <= s.window.xMax;
    for (const m of marked) {
      if (!inView(m.x)) continue;
      const repeats = zeroes.find((zero) => Math.abs(zero.x - m.x) < 1e-9)?.multiplicity ?? 1;
      elements.push({
        id: m.id,
        value: `${niceNumber(m.x).text}${repeats % 2 === 0 ? " (touches)" : ""}${isHeldByZeroes && s.isDraggable ? ", draggable" : ""}`,
      });
    }
    if (s.form === PlaneForm.Vertex) {
      elements.push({
        id: "vertex",
        value: `(${niceNumber(s.vertex[0]).text}, ${niceNumber(s.vertex[1]).text})${s.isDraggable ? ", draggable" : ""}`,
      });
    }
    if (s.isSymmetryShown && n === 2) {
      const h = clean(-(p[1] ?? 0) / (2 * (p[0] ?? 1)));
      elements.push({ id: "symmetry", value: `${v} = ${niceNumber(h).text}` });
    }
    if (s.isInterceptShown) {
      elements.push({ id: "intercept", value: `(0, ${niceNumber(valueAt(p, 0)).text})` });
    }
    if (s.probe !== null) {
      elements.push({
        id: "probe",
        value: `p(${niceNumber(s.probe).text}) = ${niceNumber(valueAt(p, s.probe)).text}`,
      });
    }
    if (s.isEquationShown) elements.push({ id: "equation", value: `y = ${polyText(p, v)}` });
    if (s.isFactoredShown && zeroesWithRepeats(p).length === n) {
      elements.push({
        id: "factored",
        value: `y = ${texToText(factoredTex(p[0] ?? 1, zeroesWithRepeats(p), v))}`,
      });
    }
    if (s.canSetLeading)
      elements.push({ id: "leading", value: `a = ${niceNumber(p[0] ?? 1).text}` });
    if (s.canLift)
      elements.push({
        id: "lift",
        value: `(0, ${niceNumber(valueAt(p, 0)).text}), drag up or down to lift the curve`,
      });
    if (s.canFlip) elements.push({ id: "flip", value: "turns the curve upside down" });
    if (s.isSumProductShown && n === 2) {
      const sum = sumOf(p);
      const product = productOf(p);
      if (sum !== null) elements.push({ id: "sum", value: `α + β = ${niceNumber(sum).text}` });
      if (product !== null)
        elements.push({ id: "product", value: `αβ = ${niceNumber(product).text}` });
    }
    const count = zeroes.length;
    return {
      summary: `the graph of y = ${polyText(p, v)}, ${shape}, meeting the x-axis ${count === 0 ? "nowhere" : count === 1 ? "once" : `${count} times`}`,
      elements,
    };
  },
  locate: (s, part, width) => {
    const box = planeBox(s, width);
    const p = coefficientsOf(s);
    const at = (x: number, y: number, size = 44) => {
      const [px, py] = box.toPixel(x, y);
      return { x: px - size / 2, y: py - size / 2, width: size, height: size };
    };
    if (part === "curve") return { x: 0, y: 0, width, height: box.height };
    const zero = /^zero:(\d+)$/.exec(part);
    if (zero !== null) {
      const i = Number(zero[1]);
      const x = s.form === PlaneForm.Zeroes ? s.zeroes[i] : realZeroes(p)[i]?.x;
      return x === undefined ? undefined : at(x, 0);
    }
    if (part === "vertex" && s.form === PlaneForm.Vertex) return at(s.vertex[0], s.vertex[1]);
    if (part === "intercept" && s.isInterceptShown) return at(0, valueAt(p, 0));
    if (part === "probe" && s.probe !== null) return at(s.probe, valueAt(p, s.probe));
    if (part === "lift" && s.canLift) return at(0, valueAt(p, 0));
    if (part === "symmetry" && s.isSymmetryShown && degreeOf(p) === 2) {
      const [px] = box.toPixel(-(p[1] ?? 0) / (2 * (p[0] ?? 1)), 0);
      return { x: px - 12, y: 0, width: 24, height: box.height };
    }
    return undefined;
  },
});

/** The plane's size at a width, and plane-to-pixel. The view draws exactly this. */
export function planeBox(s: Pick<ZeroPlaneState, "window">, width: number) {
  const { xMin, xMax, yMin, yMax } = s.window;
  const height = Math.round(Math.min(380, Math.max(240, width * 0.8)));
  return {
    width,
    height,
    toPixel: (x: number, y: number): [number, number] => [
      ((x - xMin) / (xMax - xMin)) * width,
      ((yMax - y) / (yMax - yMin)) * height,
    ],
  };
}

function changed(s: ZeroPlaneState): Emit {
  const p = coefficientsOf(s);
  return {
    signal: ZeroPlaneSignal.Changed,
    payload: { zeroes: realZeroes(p).map((zero) => zero.x), equation: polyText(p, s.variable) },
  };
}

/** A little LaTeX as plain text, for the observation: (x - 1)^{2} → (x − 1)². */
function texToText(tex: string): string {
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return tex
    .replace(/\^\{(\d+)\}/g, (_, k: string) => [...k].map((d) => SUP[Number(d)]).join(""))
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/ - /g, " − ");
}
