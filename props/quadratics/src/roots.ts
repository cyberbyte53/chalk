import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  NATURE_WORDS,
  Nature,
  clean,
  discriminant,
  natureOf,
  numTex,
  numText,
  quadTex,
  realRoots,
  rootsTex,
} from "./quad";

/**
 * The graph of y = ax² + bx + c, with the roots of ax² + bx + c = k where it meets the line y = k
 * (the x-axis when k = 0). The discriminant b² − 4a(c − k) says how many: two, one (the curve just
 * touches) or none.
 */

export const Coefficient = { A: "a", B: "b", C: "c" } as const;
export type Coefficient = (typeof Coefficient)[keyof typeof Coefficient];

export const RootsAction = {
  SetCoefficient: "setCoefficient",
  Nudge: "nudge",
  SetLevel: "setLevel",
} as const;
export const RootsSignal = { Changed: "changed" } as const;
export const RootsDerived = {
  Discriminant: "discriminant",
  Nature: "nature",
  Roots: "roots",
  RootsTex: "rootsTex",
  RootCount: "rootCount",
  Vertex: "vertex",
} as const;
export const RootsPart = {
  Plane: "plane",
  Equation: "equation",
  Discriminant: "discriminant",
  Roots: "roots",
  Steppers: "steppers",
  Level: "level",
} as const;

const reach = z.number().min(-1000).max(1000);

const rootsState = z
  .object({
    a: z
      .number()
      .min(-50)
      .max(50)
      .refine((a) => a !== 0, "a can't be 0"),
    b: z.number().min(-200).max(200),
    c: z.number().min(-1000).max(1000),
    /** The height the equation asks about: ax² + bx + c = level. 0 is the x-axis. */
    level: reach,
    /** The line y = level is drawn (when level ≠ 0) with this label, e.g. "15 m". */
    levelLabel: z.string().max(12),
    variable: z.string().regex(/^[a-z]$/),
    /** The name of y: "y", or "h" for a height. */
    yName: z.string().regex(/^[a-z]$/),
    window: z
      .object({ xMin: reach, xMax: reach, yMin: reach, yMax: reach })
      .strict()
      .refine((w) => w.xMin < w.xMax && w.yMin < w.yMax, "the window is upside down"),
    /** Which coefficients the learner can change with − and +. */
    canSet: z.array(z.nativeEnum(Coefficient)).max(3),
    /** Whether the learner can move the line y = level. */
    canSetLevel: z.boolean(),
    /** One − or + step. */
    step: z.number().positive(),
    showEquation: z.boolean(),
    showDiscriminant: z.boolean(),
    showRoots: z.boolean(),
  })
  .strict();
export type RootsState = z.infer<typeof rootsState>;

type Abc = Pick<RootsState, "a" | "b" | "c" | "level">;

/** The equation solved: ax² + bx + (c − level) = 0. */
const shifted = (s: Abc): [number, number, number] => [s.a, s.b, clean(s.c - s.level)];
export const discriminantOf = (s: Abc) => discriminant(...shifted(s));
export const rootsOf = (s: Abc) => realRoots(...shifted(s));

/** The equation as TeX lines: 2x^2 - 4x + 3 = 0, or -5t^2 + 20t = 15 then -5t^2 + 20t - 15 = 0. */
export function equationLines(s: RootsState): string[] {
  const v = s.variable;
  const lhs = quadTex(s.a, s.b, s.c, v);
  if (s.level === 0) return [`${lhs} = 0`];
  return [`${lhs} = ${numTex(s.level)}`, `${quadTex(...shifted(s), v)} = 0`];
}

/** The same on one line, for the observation. */
export function equationTex(s: RootsState): string {
  return equationLines(s).join(", i.e. ");
}

/** D = b² − 4ac with the numbers put in, as two TeX lines. */
export function discriminantLines(s: RootsState): [string, string] {
  const [a, b, c] = shifted(s);
  const p = (x: number) => (x < 0 ? `(${numTex(x)})` : numTex(x));
  const d = discriminant(a, b, c);
  return [
    "D = b^2 - 4ac",
    `\\phantom{D} = ${p(b)}^2 - 4 \\times ${p(a)} \\times ${p(c)} = ${numTex(d)}`,
  ];
}

/** On one line, for the observation. */
export function discriminantTex(s: RootsState): string {
  const [one, two] = discriminantLines(s);
  return `${one} ${two.replace("\\phantom{D} ", "")}`;
}

const act = actionsFor<RootsState>();

function changed(s: RootsState) {
  const d = discriminantOf(s);
  return {
    signal: RootsSignal.Changed,
    payload: { a: s.a, b: s.b, c: s.c, level: s.level, discriminant: d, nature: natureOf(d) },
  };
}

const BOUND: Record<Coefficient, number> = { a: 50, b: 200, c: 1000 };

export const rootsGraph = defineProp({
  type: "rootsGraph",
  describe:
    "The graph of y = ax² + bx + c (a parabola), on a plane, with the roots of ax² + bx + c = k marked where the curve meets the line y = k (k = 0: the x-axis). The discriminant D = b² − 4ac (for c − k) is worked out: D > 0, the curve crosses the line at two points (two different real roots); D = 0, it just touches it (two equal real roots); D < 0, it never reaches it (no real roots). The roots are shown exactly, e.g. (3 ± √19)/5. The learner can change a, b, c with − and + and, for a height question (h = 20t − 5t², when is h = 15?), move the line.",
  state: rootsState,
  defaults: {
    a: 1,
    b: -2,
    c: -3,
    level: 0,
    levelLabel: "",
    variable: "x",
    yName: "y",
    window: { xMin: -5, xMax: 5, yMin: -6, yMax: 6 },
    canSet: [Coefficient.C],
    canSetLevel: false,
    step: 1,
    showEquation: true,
    showDiscriminant: true,
    showRoots: true,
  },
  inputs: ["canSet", "canSetLevel", "showEquation", "showDiscriminant", "showRoots", "levelLabel"],
  derived: {
    [RootsDerived.Discriminant]: {
      describe: "D = b² − 4ac, for the equation ax² + bx + c = level",
      compute: discriminantOf,
    },
    [RootsDerived.Nature]: {
      describe: "twoDistinct (D > 0), twoEqual (D = 0) or none (D < 0)",
      compute: (s) => natureOf(discriminantOf(s)),
    },
    [RootsDerived.Roots]: {
      describe: "The real roots, smallest first (an equal root twice; none: empty)",
      compute: rootsOf,
    },
    [RootsDerived.RootsTex]: {
      describe: "The real roots, exact, as TeX",
      compute: (s) => rootsTex(...shifted(s)),
    },
    [RootsDerived.RootCount]: {
      describe: "How many different real roots: 2, 1 or 0",
      compute: (s) => new Set(rootsOf(s)).size,
    },
    [RootsDerived.Vertex]: {
      describe: "The turning point (−b/2a, its y): the top or bottom of the curve",
      compute: (s) => {
        const x = clean(-s.b / (2 * s.a));
        return [x, clean(s.a * x * x + s.b * x + s.c)];
      },
    },
  },
  actions: {
    [RootsAction.SetCoefficient]: act({
      describe: "Set a, b or c (a can't be 0)",
      args: z.object({ name: z.nativeEnum(Coefficient), value: z.number() }).strict(),
      run: (s, a) => {
        if (a.name === Coefficient.A && a.value === 0) return set({});
        const value = Math.max(-BOUND[a.name], Math.min(BOUND[a.name], clean(a.value)));
        const next = { ...s, [a.name]: value };
        return set({ [a.name]: value }, changed(next));
      },
    }),
    [RootsAction.Nudge]: act({
      describe: "Make a, b or c one step bigger (by: 1) or smaller (by: −1); a steps over 0",
      byLearner: true,
      args: z
        .object({ name: z.nativeEnum(Coefficient), by: z.union([z.literal(1), z.literal(-1)]) })
        .strict(),
      run: (s, a) => {
        if (!s.canSet.includes(a.name)) return set({});
        let value = clean(s[a.name] + a.by * s.step);
        if (a.name === Coefficient.A && value === 0) value = clean(value + a.by * s.step);
        value = Math.max(-BOUND[a.name], Math.min(BOUND[a.name], value));
        if (a.name === Coefficient.A && value === 0) return set({});
        const next = { ...s, [a.name]: value };
        return set({ [a.name]: value }, changed(next));
      },
    }),
    [RootsAction.SetLevel]: act({
      describe: "Move the line y = level (the height the equation asks about)",
      byLearner: true,
      args: z.object({ level: reach }).strict(),
      run: (s, a) => {
        if (!s.canSetLevel) return set({});
        const level = clean(Math.round(a.level / s.step) * s.step);
        return set({ level }, changed({ ...s, level }));
      },
    }),
  },
  signals: {
    [RootsSignal.Changed]: {
      describe: "a, b, c or the level changed; the payload has them, D and the nature of the roots",
    },
  },
  observe: (s) => {
    const d = discriminantOf(s);
    const nature = natureOf(d);
    const roots = rootsOf(s);
    const tex = rootsTex(...shifted(s));
    const v = s.variable;
    const where = s.level === 0 ? "the x-axis" : `the line ${s.yName} = ${numText(s.level)}`;
    const meets =
      nature === Nature.TwoDistinct
        ? `crosses ${where} at ${v} = ${numText(roots[0] ?? 0)} and ${v} = ${numText(roots[1] ?? 0)}`
        : nature === Nature.TwoEqual
          ? `just touches ${where} at ${v} = ${numText(roots[0] ?? 0)}`
          : `never reaches ${where}`;
    const elements: Element[] = [
      {
        id: RootsPart.Plane,
        value: `the curve ${s.yName} = ${quadTex(s.a, s.b, s.c, v)} ${meets}`,
      },
    ];
    if (s.showEquation) elements.push({ id: RootsPart.Equation, value: equationTex(s) });
    if (s.showDiscriminant)
      elements.push({
        id: RootsPart.Discriminant,
        value: `${discriminantTex(s)}: ${NATURE_WORDS[nature].en}`,
      });
    if (s.showRoots)
      elements.push({
        id: RootsPart.Roots,
        value: tex.length === 0 ? "no real roots" : tex.map((r) => `${v} = ${r}`).join(", "),
      });
    if (s.canSet.length > 0)
      elements.push({
        id: RootsPart.Steppers,
        value: s.canSet.map((n) => `${n} = ${s[n]}`).join(", "),
      });
    if (s.level !== 0 || s.canSetLevel)
      elements.push({ id: RootsPart.Level, value: `${s.yName} = ${numText(s.level)}` });
    return {
      summary: `The parabola ${s.yName} = ${quadTex(s.a, s.b, s.c, v)}: it ${meets} (D = ${numText(d)}, ${NATURE_WORDS[nature].en}).`,
      elements,
      hidden: s.showRoots ? undefined : { roots: tex },
    };
  },
  parts: (s) => [
    RootsPart.Plane,
    ...(s.showEquation ? [RootsPart.Equation] : []),
    ...(s.showDiscriminant ? [RootsPart.Discriminant] : []),
    ...(s.showRoots ? [RootsPart.Roots] : []),
    ...(s.canSet.length > 0 ? [RootsPart.Steppers] : []),
    ...(s.level !== 0 || s.canSetLevel ? [RootsPart.Level] : []),
  ],
});
