import {
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  EquationForm,
  type Line,
  Relation,
  equationOf,
  frac,
  fracText,
  handlesOf,
  lineThrough,
  ratioTestOf,
  relationOf,
  solutionOf,
  triangleWith,
} from "./algebra";
import { LinePairAction, LinePairSignal, type LinePairState, linePair } from "./line-pair";
import { LinePairView } from "./line-pair-view";
import { LinearSceneKind, linearScene } from "./scene";
import { LinearSceneView } from "./scene-view";
import {
  SolveStepsAction,
  SolveStepsSignal,
  type SolveStepsState,
  solveSteps,
} from "./solve-steps";
import { SolveStepsView } from "./solve-steps-view";
import { Method, Outcome, StepKind, workedSolution } from "./steps";

/** ax + by = k, written the book's way, as a line (c = −k). */
const eq = (a: number, b: number, k: number): Line => ({ a, b, c: -k });
const XY = ["x", "y"] as const;

function run<S extends Record<string, unknown>>(
  def: ReturnType<typeof asAnyProp>,
  state: S,
  name: string,
  args: Record<string, unknown>,
) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: result.effect.emit };
}

const pt = (p: Readonly<NonNullable<ReturnType<typeof solutionOf>>> | null) =>
  p === null ? null : `(${fracText(p[0])}, ${fracText(p[1])})`;

describe("a pair of lines (NCERT 3.2, 3.3)", () => {
  it("Akhila's rides and hoopla meet at (4, 2)", () => {
    const pair = [eq(1, -2, 0), eq(3, 4, 20)] as const;
    expect(relationOf(...pair)).toBe(Relation.Intersecting);
    expect(pt(solutionOf(...pair))).toBe("(4, 2)");
  });

  it("the two stationery bills are the same line; the rails are parallel", () => {
    expect(relationOf(eq(2, 3, 9), eq(4, 6, 18))).toBe(Relation.Coincident);
    expect(relationOf({ a: 1, b: 2, c: -4 }, { a: 2, b: 4, c: -12 })).toBe(Relation.Parallel);
    expect(solutionOf(eq(2, 3, 9), eq(4, 6, 18))).toBeNull();
  });

  it("Examples 4, 5 and 6", () => {
    expect(pt(solutionOf(eq(1, 3, 6), eq(2, -3, 12)))).toBe("(6, 0)");
    // 3x − (24/5)y + 3/5 = 0 is 5x − 8y + 1 = 0 times 3/5: the same line, fractions and all.
    expect(relationOf({ a: 5, b: -8, c: 1 }, { a: 3, b: -24 / 5, c: 3 / 5 })).toBe(
      Relation.Coincident,
    );
    // Champa: y = 2x − 2 and y = 4x − 4.
    expect(pt(solutionOf(eq(-2, 1, -2), eq(-4, 1, -4)))).toBe("(1, 0)");
  });

  it("the ratio test agrees with Exercise 3.2 Q2", () => {
    expect(ratioTestOf({ a: 5, b: -4, c: 8 }, { a: 7, b: 6, c: -9 })).toBe("a≠b");
    expect(ratioTestOf({ a: 9, b: 3, c: 12 }, { a: 18, b: 6, c: 24 })).toBe("a=b=c");
    expect(ratioTestOf({ a: 6, b: -3, c: 10 }, { a: 2, b: -1, c: 9 })).toBe("a=b≠c");
  });

  it("the algebraic solutions in the chapter", () => {
    expect(pt(solutionOf(eq(7, -15, 2), eq(1, 2, 3)))).toBe("(49/29, 19/29)");
    expect(pt(solutionOf(eq(9, -4, 2000), eq(7, -3, 2000)))).toBe("(2000, 4000)");
    expect(pt(solutionOf(eq(5, 3, 35), eq(2, 4, 28)))).toBe("(4, 5)");
    expect(pt(solutionOf(eq(2, 3, 46), eq(3, 5, 74)))).toBe("(8, 10)");
    expect(pt(solutionOf(eq(2, 3, 13), eq(5, -4, -2)))).toBe("(2, 3)");
    expect(pt(solutionOf(eq(5, 1, 2), eq(6, -3, 1)))).toBe("(1/3, 1/3)");
    expect(pt(solutionOf(eq(30, 44, 10), eq(40, 55, 13)))).toBe("(1/5, 1/11)");
    expect(pt(solutionOf(eq(0.2, 0.3, 1.3), eq(0.4, 0.5, 2.3)))).toBe("(2, 3)");
  });

  it("a line through two points has whole coefficients in lowest terms", () => {
    expect(lineThrough([0, 5], [4, 2])).toEqual({ a: 3, b: 4, c: -20 });
    expect(lineThrough([0, 0], [2, 1])).toEqual({ a: 1, b: -2, c: 0 });
    expect(lineThrough([3, -1], [3, 4])).toEqual({ a: 1, b: 0, c: -3 });
    expect(lineThrough([0.5, 1], [1.5, 2])).toEqual({ a: 2, b: -2, c: 1 });
  });

  it("holds a line by NCERT-style whole-number points that are on it", () => {
    const w = { xMin: -2, xMax: 8, yMin: -2, yMax: 7 };
    expect(handlesOf(eq(3, 4, 20), w)).toEqual([
      [0, 5],
      [4, 2],
    ]);
    expect(handlesOf(eq(1, -2, 0), w)).toEqual([
      [0, 0],
      [2, 1],
    ]);
    expect(handlesOf({ a: 1, b: 2, c: -4 }, w)).toEqual([
      [0, 2],
      [4, 0],
    ]);
    for (let a = -4; a <= 4; a++)
      for (let b = -4; b <= 4; b++)
        for (let k = -6; k <= 6; k += 3) {
          if (a === 0 && b === 0) continue;
          const line = eq(a, b, k);
          const [p, q] = handlesOf(line, w);
          expect(p).not.toEqual(q);
          expect(Math.abs(line.a * p[0] + line.b * p[1] + line.c)).toBeLessThan(1e-9);
          expect(Math.abs(line.a * q[0] + line.b * q[1] + line.c)).toBeLessThan(1e-9);
        }
  });

  it("Exercise 3.2 Q7: the triangle with the x-axis", () => {
    const t = triangleWith({ a: 1, b: -1, c: 1 }, { a: 3, b: 2, c: -12 }, "x");
    expect(t?.map(([x, y]) => `(${fracText(x)}, ${fracText(y)})`)).toEqual([
      "(2, 3)",
      "(−1, 0)",
      "(4, 0)",
    ]);
  });

  it("writes equations the book's way", () => {
    expect(equationOf(eq(1, -2, 0), XY, EquationForm.Equals, false)).toBe("x − 2y = 0");
    expect(equationOf(eq(3, 4, 20), XY, EquationForm.Equals, false)).toBe("3x + 4y = 20");
    expect(equationOf(eq(2, 3, 9), XY, EquationForm.General, false)).toBe("2x + 3y − 9 = 0");
    expect(equationOf({ a: -1, b: 0, c: 2 }, ["s", "t"], EquationForm.General, false)).toBe(
      "−s + 2 = 0",
    );
    expect(equationOf(eq(1, 0.5, 3), XY, EquationForm.Equals, true)).toBe("x + \\frac{1}{2}y = 3");
  });
});

describe("worked solutions (NCERT 3.4)", () => {
  const all = (w: ReturnType<typeof workedSolution>) => w.steps.flatMap((s) => s.lines).join(" | ");

  it("Example 7 by substitution, the book's steps", () => {
    const w = workedSolution(
      [eq(7, -15, 2), eq(1, 2, 3)],
      XY,
      EquationForm.Equals,
      Method.Substitution,
      {
        isolate: null,
        eliminate: null,
      },
    );
    const text = all(w);
    expect(text).toContain("x = 3 - 2y");
    expect(text).toContain("7\\left(3 - 2y\\right) - 15y = 2");
    expect(text).toContain("21 - 14y - 15y = 2");
    expect(text).toContain("-29y = -19");
    expect(text).toContain("\\frac{19}{29}");
    expect(w.outcome).toBe(Outcome.Unique);
    expect(pt(w.solution)).toBe("(49/29, 19/29)");
    expect(w.steps.at(-1)?.kind).toBe(StepKind.Check);
  });

  it("Example 9: 18 = 18, infinitely many; Example 10: a false statement, none", () => {
    const many = workedSolution(
      [eq(2, 3, 9), eq(4, 6, 18)],
      XY,
      EquationForm.Equals,
      Method.Substitution,
      {
        isolate: { equation: 0, variable: 0 },
        eliminate: null,
      },
    );
    expect(all(many)).toContain("x = \\frac{9 - 3y}{2}");
    expect(all(many)).toContain("18 - 6y + 6y = 18");
    expect(many.steps.at(-1)?.lines[0]).toBe("18 = 18");
    expect(many.outcome).toBe(Outcome.InfinitelyMany);
    const none = workedSolution(
      [eq(1, 2, 4), eq(2, 4, 12)],
      XY,
      EquationForm.Equals,
      Method.Substitution,
      {
        isolate: null,
        eliminate: null,
      },
    );
    expect(none.outcome).toBe(Outcome.None);
    expect(none.steps.at(-1)?.kind).toBe(StepKind.Result);
  });

  it("Example 8 (ages) keeps the letters s and t", () => {
    const w = workedSolution(
      [
        { a: 1, b: -7, c: 42 },
        { a: 1, b: -3, c: -6 },
      ],
      ["s", "t"],
      EquationForm.Equals,
      Method.Substitution,
      { isolate: null, eliminate: null },
    );
    expect(all(w)).toContain("s = 6 + 3t");
    expect(pt(w.solution)).toBe("(42, 12)");
  });

  it("Example 11 by elimination: × 3 and × 4, then subtract", () => {
    const w = workedSolution(
      [eq(9, -4, 2000), eq(7, -3, 2000)],
      XY,
      EquationForm.Equals,
      Method.Elimination,
      {
        isolate: null,
        eliminate: 1,
      },
    );
    const text = all(w);
    expect(text).toContain("27x - 12y = 6000");
    expect(text).toContain("28x - 12y = 8000");
    expect(text).toContain("(28 - 27)x = 8000 - 6000");
    expect(text).toContain("9(2000) - 4y = 2000");
    expect(pt(w.solution)).toBe("(2000, 4000)");
  });

  it("Example 12: 0 = a non-zero number, no solution; Example 13: add", () => {
    const none = workedSolution(
      [eq(2, 3, 8), eq(4, 6, 7)],
      XY,
      EquationForm.Equals,
      Method.Elimination,
      {
        isolate: null,
        eliminate: null,
      },
    );
    expect(none.outcome).toBe(Outcome.None);
    const digits = workedSolution(
      [eq(1, 1, 6), eq(1, -1, 2)],
      XY,
      EquationForm.Equals,
      Method.Elimination,
      {
        isolate: null,
        eliminate: 1,
      },
    );
    expect(all(digits)).toContain("(1 + 1)x = 6 + 2");
    expect(pt(digits.solution)).toBe("(4, 2)");
  });

  it("Example 14 by cross-multiplication: x/8 = y/10 = 1/1", () => {
    const w = workedSolution(
      [eq(2, 3, 46), eq(3, 5, 74)],
      XY,
      EquationForm.Equals,
      Method.CrossMultiplication,
      {
        isolate: null,
        eliminate: null,
      },
    );
    const text = all(w);
    expect(text).toContain("(3)(-74) - (5)(-46)");
    expect(text).toContain("\\frac{x}{8} = \\frac{y}{10} = \\frac{1}{1}");
    expect(pt(w.solution)).toBe("(8, 10)");
    const zero = workedSolution(
      [eq(3, -5, 20), eq(6, -10, 40)],
      XY,
      EquationForm.Equals,
      Method.CrossMultiplication,
      {
        isolate: null,
        eliminate: null,
      },
    );
    expect(zero.outcome).toBe(Outcome.InfinitelyMany);
  });

  it("every method agrees with the formula, and the check holds, over many pairs", () => {
    let n = 0;
    for (let a1 = -3; a1 <= 3; a1++)
      for (let b1 = -3; b1 <= 3; b1 += 2)
        for (let a2 = -2; a2 <= 4; a2 += 2)
          for (let b2 = -4; b2 <= 4; b2 += 3)
            for (const [k1, k2] of [
              [5, -7],
              [0, 3],
              [6, 6],
            ] as const) {
              if ((a1 === 0 && b1 === 0) || (a2 === 0 && b2 === 0)) continue;
              const pair = [eq(a1, b1, k1), eq(a2, b2, k2)] as const;
              const relation = relationOf(...pair);
              const expected = solutionOf(...pair);
              for (const method of Object.values(Method)) {
                for (const choice of [
                  { isolate: null, eliminate: null },
                  { isolate: { equation: 1, variable: 1 } as const, eliminate: 0 as const },
                ]) {
                  const w = workedSolution(pair, XY, EquationForm.Equals, method, choice);
                  n += 1;
                  if (relation === Relation.Intersecting) {
                    expect(w.outcome).toBe(Outcome.Unique);
                    expect(pt(w.solution)).toBe(pt(expected));
                    const [x, y] = w.solution as [ReturnType<typeof frac>, ReturnType<typeof frac>];
                    for (const line of pair)
                      expect(
                        frac(line.a).mul(x).add(frac(line.b).mul(y)).add(line.c).equals(0),
                      ).toBe(true);
                    const check = w.steps.at(-1);
                    expect(check?.kind).toBe(StepKind.Check);
                    expect(check?.lines.every((l) => l.endsWith("\\checkmark"))).toBe(true);
                  } else {
                    expect(w.outcome).toBe(
                      relation === Relation.Parallel ? Outcome.None : Outcome.InfinitelyMany,
                    );
                  }
                }
              }
            }
    expect(n).toBeGreaterThan(500);
  });
});

describe("linePair, the prop", () => {
  const def = asAnyProp(linePair);
  const start = { ...linePair.defaults, canDrag: true } as LinePairState;

  it("dragging a dot turns the line through it and the other dot", () => {
    const { state, emit } = run(def, start, LinePairAction.MoveHandle, {
      line: 1,
      handle: 1,
      x: 4,
      y: 3,
    });
    // (0, 5) stays; the other dot moves to (4, 3): x + 2y = 10.
    expect(state.lines[1]).toEqual({ a: 1, b: 2, c: -10 });
    expect(state.handles[1]).toEqual([
      [0, 5],
      [4, 3],
    ]);
    expect(emit[0]?.signal).toBe(LinePairSignal.Changed);
    const view = viewOf(def, state) as Record<string, unknown>;
    expect(view.relation).toBe(Relation.Intersecting);
  });

  it("a dot can't sit on the other one, and nothing moves when dragging is off", () => {
    expect(
      run(def, start, LinePairAction.MoveHandle, { line: 1, handle: 1, x: 0, y: 5 }).state,
    ).toEqual(start);
    const still = { ...start, canDrag: false };
    expect(
      run(def, still, LinePairAction.MoveHandle, { line: 0, handle: 0, x: 3, y: 3 }).state,
    ).toEqual(still);
  });

  it("the − / + buttons change only the editable line, never to a = b = 0", () => {
    const s = { ...linePair.defaults, editLine: 1 } as LinePairState;
    const made = run(def, s, LinePairAction.SetCoefficient, {
      line: 1,
      coefficient: "a",
      value: 6,
    }).state;
    expect(made.lines[1]).toEqual({ a: 6, b: 4, c: -20 });
    expect(
      run(def, s, LinePairAction.SetCoefficient, { line: 0, coefficient: "a", value: 6 }).state,
    ).toEqual(s);
    const flat = { ...s, lines: [s.lines[0], { a: 0, b: 2, c: 1 }] } as LinePairState;
    expect(
      run(def, flat, LinePairAction.SetCoefficient, { line: 1, coefficient: "b", value: 0 }).state,
    ).toEqual(flat);
  });

  it("the test point says which equations it satisfies", () => {
    const s = { ...linePair.defaults, probe: [0, 0], canMoveProbe: true } as LinePairState;
    const { state, emit } = run(def, s, LinePairAction.MoveProbe, { x: 4.2, y: 1.9 });
    expect(state.probe).toEqual([4, 2]);
    expect(emit[0]?.payload).toMatchObject({ on: [true, true], isOnBoth: true });
    const off = run(def, s, LinePairAction.MoveProbe, { x: 2, y: 1 });
    expect(off.emit[0]?.payload).toMatchObject({ on: [true, false], isOnBoth: false });
  });

  it("observes the pair the way the screen shows it", () => {
    const o = observationOf(def, { ...linePair.defaults, showRatios: true });
    expect(o.summary).toContain("x − 2y = 0");
    expect(o.summary).toContain("meeting at (4, 2)");
    expect(JSON.stringify(o.elements)).toContain("a₁/a₂ = 1/3");
  });

  it("rejects dots that aren't on their line", () => {
    const bad = {
      ...linePair.defaults,
      handles: [
        [
          [0, 0],
          [1, 1],
        ],
      ],
    };
    expect(applyPatch(def, linePair.defaults, { handles: bad.handles }).isOk).toBe(false);
  });
});

describe("solveSteps, the prop", () => {
  const def = asAnyProp(solveSteps);
  const start = solveSteps.defaults as SolveStepsState;

  it("waits for the learner's choice, then reveals the working to the end", () => {
    expect(run(def, start, SolveStepsAction.Next, {}).state).toEqual(start);
    let { state, emit } = run(def, start, SolveStepsAction.Choose, {
      isolate: { equation: 1, variable: 0 },
    });
    expect(emit[0]?.signal).toBe(SolveStepsSignal.Chosen);
    expect(state.step).toBe(1);
    const count = (viewOf(def, state) as Record<string, unknown>).stepCount as number;
    let last = emit;
    while (state.step < count) ({ state, emit: last } = run(def, state, SolveStepsAction.Next, {}));
    expect(last[0]?.payload).toMatchObject({ isDone: true, outcome: Outcome.Unique });
    expect(run(def, state, SolveStepsAction.Next, {}).state).toEqual(state);
    expect(run(def, state, SolveStepsAction.Reset, {}).state).toMatchObject({
      step: 0,
      isolate: null,
    });
  });

  it("won't write a variable from an equation that doesn't have it", () => {
    const s = { ...start, equations: [eq(0, 2, 4), eq(1, 1, 3)] } as SolveStepsState;
    expect(
      run(def, s, SolveStepsAction.Choose, { isolate: { equation: 0, variable: 0 } }).state,
    ).toEqual(s);
  });

  it("show-all fills in the easiest choice", () => {
    const { state } = run(def, start, SolveStepsAction.ShowAll, {});
    expect(state.isolate).toEqual({ equation: 1, variable: 0 });
    const o = observationOf(def, state);
    expect(o.summary).toContain("x = 49/29, y = 19/29");
  });
});

describe("views", () => {
  const widths = [300, 340, 420];
  const cases: [ReturnType<typeof asAnyProp>, (p: never) => unknown, Record<string, unknown>][] = [
    [asAnyProp(linePair), LinePairView as never, { ...linePair.defaults }],
    [
      asAnyProp(linePair),
      LinePairView as never,
      {
        ...linePair.defaults,
        lines: [eq(2, 3, 9), eq(4, 6, 18)],
        showTables: true,
        showRatios: true,
        canDrag: true,
        probe: [3, 1],
        canMoveProbe: true,
      },
    ],
    [
      asAnyProp(linePair),
      LinePairView as never,
      {
        ...linePair.defaults,
        lines: [
          { a: 1, b: -1, c: 1 },
          { a: 3, b: 2, c: -12 },
        ],
        shade: "x",
        editLine: 1,
        window: { xMin: -2, xMax: 6, yMin: -1, yMax: 7 },
      },
    ],
    [asAnyProp(solveSteps), SolveStepsView as never, { ...solveSteps.defaults }],
    [
      asAnyProp(solveSteps),
      SolveStepsView as never,
      { ...solveSteps.defaults, isolate: { equation: 1, variable: 0 }, step: 9 },
    ],
    [
      asAnyProp(solveSteps),
      SolveStepsView as never,
      {
        ...solveSteps.defaults,
        equations: [eq(2, 3, 46), eq(3, 5, 74)],
        method: Method.CrossMultiplication,
        step: 9,
      },
    ],
    [
      asAnyProp(solveSteps),
      SolveStepsView as never,
      {
        ...solveSteps.defaults,
        equations: [eq(9, -4, 2000), eq(7, -3, 2000)],
        method: Method.Elimination,
        eliminate: 1,
        step: 9,
      },
    ],
    ...Object.values(LinearSceneKind).map(
      (scene) =>
        [asAnyProp(linearScene), LinearSceneView as never, { scene }] as [
          ReturnType<typeof asAnyProp>,
          (p: never) => unknown,
          Record<string, unknown>,
        ],
    ),
  ];
  it.each(
    cases.flatMap((c, i) =>
      widths.flatMap((width) => (["en", "hi"] as const).map((locale) => ({ i, c, width, locale }))),
    ),
  )("case $i renders at $width px ($locale) without gaps", ({ c, width, locale }) => {
    {
      const [def, View, state] = c;
      const V = View as unknown as (p: Record<string, unknown>) => preact.JSX.Element;
      const html = renderToString(
        <V
          view={viewOf(def, state)}
          width={width}
          locale={locale}
          call={() => undefined}
          signal={() => undefined}
        />,
      );
      expect(html).not.toMatch(/NaN|undefined|\[object/);
      expect(html.length).toBeGreaterThan(100);
    }
  });
});
