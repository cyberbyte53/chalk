import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, completedTex, fracTex, numText, quadTex, rootsTex } from "./quad";

/**
 * Completing the square with tiles (NCERT Fig 4.2): an x by x square and a strip b by x. Cut the
 * strip in half, put one half along the bottom: it is a big square with one corner missing, a
 * (b/2) by (b/2) square. Add the corner and take it away again:
 * x² + bx = (x + b/2)² − (b/2)².
 */

export const TilesAction = { Next: "next", GoTo: "goTo", SetB: "setB" } as const;
export const TilesSignal = { Stepped: "stepped", Completed: "completed" } as const;
export const TilesDerived = {
  Half: "half",
  Corner: "corner",
  Completed: "completed",
  RightSide: "rightSide",
  HasRealRoots: "hasRealRoots",
  Roots: "roots",
} as const;
export const TilesPart = {
  Tiles: "tiles",
  Next: "next",
  B: "b",
  Algebra: "algebra",
  Equation: "equation",
} as const;

/** The square and the strip; the strip halved; the halves round two sides; the corner added. */
export const TILE_STEPS = 4;
export const MAX_B = 12;

const tilesState = z
  .object({
    /** The coefficient of x: the strip is b by x. */
    b: z.number().int().min(1).max(MAX_B),
    /** The equation's constant: x² + bx + c = 0. Null: just the expression x² + bx. */
    c: z.number().int().min(-500).max(500).nullable(),
    step: z
      .number()
      .int()
      .min(0)
      .max(TILE_STEPS - 1),
    canStep: z.boolean(),
    /** Whether the learner can change b. */
    canSetB: z.boolean(),
    /** Write the algebra for each step under the tiles. */
    showAlgebra: z.boolean(),
  })
  .strict();
export type TilesState = z.infer<typeof tilesState>;

/** The square is complete: (b/2)² added. */
export const isComplete = (s: Pick<TilesState, "step">) => s.step === TILE_STEPS - 1;

/** (b/2)² − c: what (x + b/2)² must equal, as a number. Null without an equation. */
export const rightSideOf = (s: Pick<TilesState, "b" | "c">) =>
  s.c === null ? null : clean((s.b * s.b) / 4 - s.c);

/** Each step's algebra, as TeX. */
export function stepTex(s: Pick<TilesState, "b" | "c" | "step">): string {
  const half = fracTex(s.b, 2);
  switch (s.step) {
    case 0:
      return `x^2 + ${s.b}x`;
    case 1:
      return `x^2 + ${s.b}x = x^2 + ${half}x + ${half}x`;
    case 2:
      return `x^2 + ${half}x + ${half}x = \\left(x + ${half}\\right)x + ${half}\\,x`;
    default:
      return `x^2 + ${s.b}x = ${completedTex(s.b)}`;
  }
}

/** With the constant: x² + bx + c = 0 → (x + b/2)² = (b/2)² − c. */
export function equationTex(s: Pick<TilesState, "b" | "c">): string | null {
  if (s.c === null) return null;
  const half = fracTex(s.b, 2);
  const rhs = fracTex(s.b * s.b - 4 * s.c, 4);
  return `${quadTex(1, s.b, s.c)} = 0 \\;\\Rightarrow\\; \\left(x + ${half}\\right)^2 = ${rhs}`;
}

const act = actionsFor<TilesState>();

function stepped(step: number): Emit[] {
  const out: Emit[] = [{ signal: TilesSignal.Stepped, payload: { step } }];
  if (step === TILE_STEPS - 1) out.push({ signal: TilesSignal.Completed, payload: { step } });
  return out;
}

const STEP_WORDS = [
  "an x by x square (x²) and a strip b by x (bx)",
  "the strip cut into two halves, each (b/2) by x",
  "one half along the side, the other along the bottom: a big square with a corner missing",
  "the missing (b/2) by (b/2) corner added (and taken away again): a complete square of side x + b/2",
];

export function describeTiles(s: Pick<TilesState, "b" | "c" | "step">): string {
  const half = numText(s.b / 2);
  const words = (STEP_WORDS[s.step] ?? "").replace(/b\/2/g, half).replace(/\bb\b/g, String(s.b));
  return `Completing the square on x² + ${s.b}x with tiles, step ${s.step + 1} of ${TILE_STEPS}: ${words}.`;
}

export const squareTiles = defineProp({
  type: "squareTiles",
  describe:
    "Completing the square with tiles, as in NCERT Fig 4.2: an x-by-x square (x²) and a b-by-x strip (bx). Step by step the strip is cut into two halves of (b/2)x, one half is moved along the side and one along the bottom, which leaves a big square with a (b/2)-by-(b/2) corner missing; adding that corner (and taking it away again) gives x² + bx = (x + b/2)² − (b/2)². With the equation's constant c it goes on to (x + b/2)² = (b/2)² − c, which has real roots only when that is not negative.",
  state: tilesState,
  defaults: { b: 4, c: null, step: 0, canStep: true, canSetB: false, showAlgebra: true },
  inputs: ["canStep", "canSetB", "showAlgebra"],
  derived: {
    [TilesDerived.Half]: {
      describe: "b/2, the width of each half-strip",
      compute: (s) => clean(s.b / 2),
    },
    [TilesDerived.Corner]: {
      describe: "(b/2)², the missing corner",
      compute: (s) => clean((s.b * s.b) / 4),
    },
    [TilesDerived.Completed]: {
      describe: "x² + bx written as (x + b/2)² − (b/2)², as TeX",
      compute: (s) => completedTex(s.b),
    },
    [TilesDerived.RightSide]: {
      describe:
        "With the constant c: (b/2)² − c, what the square (x + b/2)² must equal (null: no c)",
      compute: rightSideOf,
    },
    [TilesDerived.HasRealRoots]: {
      describe: "With c: (b/2)² − c is not negative, so square roots can be taken (null: no c)",
      compute: (s) => {
        const r = rightSideOf(s);
        return r === null ? null : r >= 0;
      },
    },
    [TilesDerived.Roots]: {
      describe: "With c: the roots of x² + bx + c = 0, exact, as TeX (empty if none are real)",
      compute: (s) => (s.c === null ? [] : rootsTex(1, s.b, s.c)),
    },
  },
  actions: {
    [TilesAction.Next]: act({
      describe: "Go to the next step (after the last, back to the start)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep) return set({});
        const step = (s.step + 1) % TILE_STEPS;
        return set({ step }, ...stepped(step));
      },
    }),
    [TilesAction.GoTo]: act({
      describe:
        "Show one step: 0 square and strip, 1 halves, 2 halves round two sides, 3 corner added",
      args: z
        .object({
          step: z
            .number()
            .int()
            .min(0)
            .max(TILE_STEPS - 1),
        })
        .strict(),
      run: (_s, a) => set({ step: a.step }, ...stepped(a.step)),
    }),
    [TilesAction.SetB]: act({
      describe: "Change b, the strip's width (starts again from step 1)",
      byLearner: true,
      args: z.object({ b: z.number().int().min(1).max(MAX_B) }).strict(),
      run: (s, a) => (s.canSetB ? set({ b: a.b, step: 0 }) : set({})),
    }),
  },
  signals: {
    [TilesSignal.Stepped]: { describe: "The tiles moved to a step; the payload has the step" },
    [TilesSignal.Completed]: { describe: "The missing corner was added: the square is complete" },
  },
  observe: (s) => {
    const elements: Element[] = [{ id: TilesPart.Tiles, value: describeTiles(s) }];
    if (s.showAlgebra) elements.push({ id: TilesPart.Algebra, value: stepTex(s) });
    const eq = equationTex(s);
    if (eq !== null && isComplete(s)) elements.push({ id: TilesPart.Equation, value: eq });
    if (s.canStep)
      elements.push({ id: TilesPart.Next, value: `step ${s.step + 1} of ${TILE_STEPS}` });
    if (s.canSetB) elements.push({ id: TilesPart.B, value: `b = ${s.b}` });
    return { summary: describeTiles(s), elements };
  },
  parts: (s) => [
    TilesPart.Tiles,
    ...(s.showAlgebra ? [TilesPart.Algebra] : []),
    ...(s.c !== null && isComplete(s) ? [TilesPart.Equation] : []),
    ...(s.canStep ? [TilesPart.Next] : []),
    ...(s.canSetB ? [TilesPart.B] : []),
  ],
});
