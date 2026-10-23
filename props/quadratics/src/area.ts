import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText, quadTex } from "./quad";

/**
 * A rectangle whose breadth is x and whose length is mx + n (a plot, a hall, a park). The learner
 * nudges x and watches the area; with a target area, the equation x(mx + n) = target is a
 * quadratic, and the area builder marks the breadth that hits it.
 */

export const AreaAction = { SetBreadth: "setBreadth", Nudge: "nudge" } as const;
export const AreaSignal = { Changed: "changed", Hit: "hit" } as const;
export const AreaDerived = {
  Length: "length",
  Area: "area",
  IsOnTarget: "isOnTarget",
  Equation: "equation",
} as const;
export const AreaPart = {
  Rectangle: "rectangle",
  Breadth: "breadth",
  Length: "length",
  Area: "area",
  Nudge: "nudge",
  Equation: "equation",
} as const;

const areaState = z
  .object({
    /** The breadth x. */
    x: z.number().min(0).max(1000),
    /** The length is m·x + n. */
    m: z.number().min(-10).max(10),
    n: z.number().min(-1000).max(1000),
    /** The area the plot must have, or null: no target. */
    target: z.number().positive().nullable(),
    /** How far one tap moves x. */
    step: z.number().positive(),
    /** The largest breadth the stepper reaches. */
    xMax: z.number().positive(),
    /** The unit of length, as shown ("m", "cm"). */
    unit: z.string().max(4),
    canMove: z.boolean(),
    /** Write the equation x(mx + n) = target under the picture. */
    showEquation: z.boolean(),
  })
  .strict();
export type AreaState = z.infer<typeof areaState>;

export const lengthOf = (s: Pick<AreaState, "x" | "m" | "n">) => clean(s.m * s.x + s.n);
export const areaOf = (s: Pick<AreaState, "x" | "m" | "n">) => clean(s.x * lengthOf(s));
export const isOnTarget = (s: AreaState) =>
  s.target !== null && Math.abs(areaOf(s) - s.target) < 1e-9 && lengthOf(s) > 0;

/** The length as TeX in terms of x: 2x + 1, 30 − x, x + 3. */
export function lengthTex(m: number, n: number): string {
  return quadTex(0, m, n);
}

/** x(2x + 1) = 300 (null: no target). */
export function productTex(s: Pick<AreaState, "m" | "n" | "target">): string | null {
  return s.target === null ? null : `x(${lengthTex(s.m, s.n)}) = ${s.target}`;
}

/** The same in standard form: 2x² + x − 300 = 0 (null: no target). */
export function standardTex(s: Pick<AreaState, "m" | "n" | "target">): string | null {
  return s.target === null ? null : `${quadTex(s.m, s.n, -s.target)} = 0`;
}

/** Both, for the observation: x(2x + 1) = 300, i.e. 2x² + x − 300 = 0. */
export function equationTex(s: Pick<AreaState, "m" | "n" | "target">): string | null {
  const a = productTex(s);
  const b = standardTex(s);
  return a === null || b === null ? null : `${a}, i.e. ${b}`;
}

function changed(s: AreaState): Emit[] {
  const out: Emit[] = [
    { signal: AreaSignal.Changed, payload: { x: s.x, length: lengthOf(s), area: areaOf(s) } },
  ];
  if (isOnTarget(s)) out.push({ signal: AreaSignal.Hit, payload: { x: s.x, length: lengthOf(s) } });
  return out;
}

const act = actionsFor<AreaState>();

export const areaBuilder = defineProp({
  type: "areaBuilder",
  describe:
    "A rectangle (a plot of land, a hall, a park) whose breadth is x and whose length is m·x + n, drawn to scale with its sides and area labelled. The learner changes x and watches the length and the area change. With a target area, the area builder writes the equation x(mx + n) = target, a quadratic equation, and marks the breadth that gives exactly the target.",
  state: areaState,
  defaults: {
    x: 5,
    m: 2,
    n: 1,
    target: 300,
    step: 1,
    xMax: 15,
    unit: "m",
    canMove: true,
    showEquation: true,
  },
  inputs: ["canMove", "showEquation", "target"],
  invariant: (s) => (lengthOf(s) < 0 ? "the length can't be negative at this breadth" : undefined),
  derived: {
    [AreaDerived.Length]: { describe: "The length m·x + n", compute: lengthOf },
    [AreaDerived.Area]: { describe: "The area x × (m·x + n)", compute: areaOf },
    [AreaDerived.IsOnTarget]: {
      describe: "The area is exactly the target area",
      compute: isOnTarget,
    },
    [AreaDerived.Equation]: {
      describe: "The equation x(mx + n) = target and its standard form, as TeX (null: no target)",
      compute: equationTex,
    },
  },
  actions: {
    [AreaAction.SetBreadth]: act({
      describe: "Set the breadth x (it must keep the length positive)",
      args: z.object({ x: z.number().min(0) }).strict(),
      run: (s, a) => {
        const next = { ...s, x: clean(Math.min(s.xMax, a.x)) };
        return set({ x: next.x }, ...changed(next));
      },
    }),
    [AreaAction.Nudge]: act({
      describe: "Make the breadth one step bigger (by: 1) or smaller (by: −1)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canMove) return set({});
        const x = clean(Math.max(0, Math.min(s.xMax, s.x + a.by * s.step)));
        const next = { ...s, x };
        if (lengthOf(next) <= 0) return set({});
        return set({ x }, ...changed(next));
      },
    }),
  },
  signals: {
    [AreaSignal.Changed]: {
      describe: "The breadth changed; the payload has x, the length and the area",
    },
    [AreaSignal.Hit]: {
      describe: "The area is now exactly the target; the payload has x and the length",
    },
  },
  observe: (s) => {
    const len = lengthOf(s);
    const area = areaOf(s);
    const elements: Element[] = [
      { id: AreaPart.Breadth, value: `breadth x = ${numText(s.x)} ${s.unit}` },
      { id: AreaPart.Length, value: `length = ${numText(len)} ${s.unit}` },
      { id: AreaPart.Area, value: `area = ${numText(area)} ${s.unit}²` },
    ];
    if (s.canMove) elements.push({ id: AreaPart.Nudge, value: `x moves by ${s.step}` });
    const eq = equationTex(s);
    if (s.showEquation && eq !== null) elements.push({ id: AreaPart.Equation, value: eq });
    const goal =
      s.target === null
        ? ""
        : isOnTarget(s)
          ? `, exactly the target ${s.target} ${s.unit}²`
          : `; the target is ${s.target} ${s.unit}²`;
    return {
      summary: `A rectangle ${numText(s.x)} ${s.unit} by ${numText(len)} ${s.unit} (length = ${lengthTex(s.m, s.n)}), area ${numText(area)} ${s.unit}²${goal}.`,
      elements,
    };
  },
  parts: (s) => [
    AreaPart.Rectangle,
    AreaPart.Breadth,
    AreaPart.Length,
    AreaPart.Area,
    ...(s.canMove ? [AreaPart.Nudge] : []),
    ...(s.showEquation && s.target !== null ? [AreaPart.Equation] : []),
  ],
});
