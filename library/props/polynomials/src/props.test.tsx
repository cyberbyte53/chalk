import { type PropViewProps, partPaths } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  initialState,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { ComponentType } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  LongDivisionAction,
  type LongDivisionState,
  layoutTex,
  longDivision,
  moveTex,
} from "./long-division";
import { LongDivisionView } from "./long-division-view";
import { BoxMode, PolyBoxAction, polyBox } from "./poly-box";
import { PolyBoxView } from "./poly-box-view";
import {
  ValueMachineAction,
  type ValueMachineState,
  machineNumber,
  valueMachine,
  workingTex,
} from "./value-machine";
import { ValueMachineView } from "./value-machine-view";
import { PlaneForm, ZeroPlaneAction, type ZeroPlaneState, zeroPlane } from "./zero-plane";
import { ZeroPlaneView } from "./zero-plane-view";

/** A view read by path in a test (its shape is the prop's). */
type Seen = { readonly [key: string]: Seen };

const plane = asAnyProp(zeroPlane);
const box = asAnyProp(polyBox);

/** Runs an action through the one door, as the player does, and returns the new state. */
function run<S extends StoredState>(
  def: AnyPropDef,
  state: S,
  action: string,
  args: Record<string, unknown> = {},
) {
  const result = prepareAction(def, state, action, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  const effect = result.effect;
  if (effect.kind !== EffectKind.Set) throw new Error(`${action} should be instant`);
  const next = applyPatch(def, state, effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: effect.emit };
}

const look = (def: AnyPropDef, s: StoredState) => viewOf(def, s) as Record<string, unknown>;

function drawn(def: AnyPropDef, View: ComponentType<PropViewProps>, s: StoredState): string {
  return renderToString(
    <View
      view={viewOf(def, s)}
      locale="en"
      width={360}
      call={() => undefined}
      signal={() => undefined}
    />,
  );
}

/** Every element is either tagged `data-part` in the view or found on screen by `locate`. */
function expectAddressable(def: AnyPropDef, View: ComponentType<PropViewProps>, s: StoredState) {
  const html = drawn(def, View, s);
  const tagged = partPaths(html);
  const seen = observationOf(def, s);
  for (const e of seen.elements) {
    const isFound =
      tagged.has(e.id) || def.locate?.(viewOf(def, s) as never, e.id, 360) !== undefined;
    expect(isFound, `${def.type}: ${e.id}`).toBe(true);
  }
  return { seen, html, ids: seen.elements.map((e) => e.id) };
}

const quadratic: ZeroPlaneState = {
  ...zeroPlane.defaults,
  zeroes: [-1, 4],
  window: { xMin: -3, xMax: 6, yMin: -8, yMax: 8 },
};

describe("zeroPlane: held by its zeroes", () => {
  it("draws y = x² − 3x − 4 from zeroes −1 and 4", () => {
    const v = look(plane, quadratic);
    expect(v.equation).toBe("x² − 3x − 4");
    expect(v.zeroCount).toBe(2);
    expect(v.sumOfZeroes).toBe(3);
    expect(v.productOfZeroes).toBe(-4);
    expect(v.yIntercept).toBe(-4);
  });

  it("dragging a zero moves it on the snap grid, and the equation follows", () => {
    const { state, emit } = run(plane, quadratic, ZeroPlaneAction.MoveZero, { index: 1, to: 2.8 });
    expect(state.zeroes).toEqual([-1, 3]);
    expect(look(plane, state).equation).toBe("x² − 2x − 3");
    expect(emit[0]?.signal).toBe("changed");
  });

  it("two zeroes dragged together make the graph touch: one point, a repeated zero", () => {
    const { state } = run(plane, quadratic, ZeroPlaneAction.MoveZero, { index: 1, to: -1 });
    expect(look(plane, state).zeroCount).toBe(1);
    expect(look(plane, state).hasTouch).toBe(true);
  });

  it("k·p(x) keeps the zeroes; a < 0 opens the parabola downward", () => {
    const s = { ...quadratic, canSetLeading: true };
    const { state } = run(plane, s, ZeroPlaneAction.SetLeading, { leading: -2 });
    expect(look(plane, state).zeroes).toEqual([-1, 4]);
    expect(look(plane, state).equation).toBe("−2x² + 6x + 8");
    expect(observationOf(plane, state).summary).toContain("opening down");
  });

  it("refuses to drag when the board says it can't, or a zero that isn't there", () => {
    expect(
      run(plane, { ...quadratic, isDraggable: false }, ZeroPlaneAction.MoveZero, {
        index: 0,
        to: 2,
      }).state.zeroes,
    ).toEqual([-1, 4]);
    expect(
      run(plane, quadratic, ZeroPlaneAction.MoveZero, { index: 5, to: 2 }).state.zeroes,
    ).toEqual([-1, 4]);
  });
});

describe("zeroPlane: held by its vertex", () => {
  const vertex: ZeroPlaneState = { ...zeroPlane.defaults, form: PlaneForm.Vertex, vertex: [1, -4] };
  it("2, 1 or 0 zeroes as the vertex moves up", () => {
    expect(look(plane, vertex).zeroCount).toBe(2);
    expect(
      look(plane, run(plane, vertex, ZeroPlaneAction.MoveVertex, { x: 1, y: 0 }).state).zeroCount,
    ).toBe(1);
    expect(
      look(plane, run(plane, vertex, ZeroPlaneAction.MoveVertex, { x: 1, y: 2 }).state).zeroCount,
    ).toBe(0);
  });
});

describe("zeroPlane: the probe reads p(k)", () => {
  it("p(2) = −6 and p(4) = 0 on y = x² − 3x − 4", () => {
    const s = { ...quadratic, probe: 0 };
    expect(look(plane, run(plane, s, ZeroPlaneAction.MoveProbe, { x: 2 }).state).probeValue).toBe(
      -6,
    );
    const at4 = run(plane, s, ZeroPlaneAction.MoveProbe, { x: 4 });
    expect(look(plane, at4.state).probeValue).toBe(0);
    expect(at4.emit[0]).toEqual({ signal: "probed", payload: { x: 4, value: 0 } });
  });
});

describe("zeroPlane: what the student sees", () => {
  it("names the curve, each zero (draggable), the equation and the readouts, all findable", () => {
    const s = {
      ...quadratic,
      isSymmetryShown: true,
      isInterceptShown: true,
      probe: 2,
      canSetLeading: true,
      isFactoredShown: true,
    };
    const { ids, seen } = expectAddressable(plane, ZeroPlaneView, s);
    expect(ids).toEqual(
      expect.arrayContaining([
        "curve",
        "zero:0",
        "zero:1",
        "symmetry",
        "intercept",
        "probe",
        "equation",
        "factored",
        "leading",
      ]),
    );
    expect(seen.elements.find((e) => e.id === "symmetry")?.value).toBe("x = 3/2");
    expect(seen.elements.find((e) => e.id === "zero:1")?.value).toBe("4, draggable");
    expect(seen.summary).toContain("meeting the x-axis 2 times");
  });

  it("a fixed graph marks the zeroes where it meets the axis; a touch says so", () => {
    const s: ZeroPlaneState = {
      ...zeroPlane.defaults,
      form: PlaneForm.Coefficients,
      fixed: [1, -1, 0, 0],
      isDraggable: false,
    };
    const { seen } = expectAddressable(plane, ZeroPlaneView, s);
    expect(seen.elements.filter((e) => e.id.startsWith("zero:")).map((e) => e.value)).toEqual([
      "0 (touches)",
      "1",
    ]);
  });

  it("the vertex is a handle; with no zeroes nothing is marked on the axis", () => {
    const s: ZeroPlaneState = { ...zeroPlane.defaults, form: PlaneForm.Vertex, vertex: [1, 2] };
    const { ids, seen } = expectAddressable(plane, ZeroPlaneView, s);
    expect(ids).toContain("vertex");
    expect(ids.some((id) => id.startsWith("zero:"))).toBe(false);
    expect(seen.summary).toContain("nowhere");
  });

  it("draws the curve in Node, at the width it is given", () => {
    const html = drawn(plane, ZeroPlaneView, quadratic);
    expect(html).toContain("<svg");
    expect(html).toContain('width="360"');
  });
});

describe("polyBox: dividing", () => {
  const divide = {
    ...polyBox.defaults,
    mode: BoxMode.Divide,
    side: [1, 2],
    dividend: [2, 3, 1],
    steps: 0,
  };
  it("Example 6 in two steps: quotient 2x − 1, remainder 3", () => {
    expect(look(box, divide).stepCount).toBe(2);
    const one = run(box, divide, PolyBoxAction.Next);
    expect(one.emit).toEqual([{ signal: "stepped", payload: { step: 1 } }]);
    const two = run(box, one.state, PolyBoxAction.Next);
    expect(two.emit[1]).toEqual({
      signal: "finished",
      payload: { quotient: "2x − 1", remainder: "3" },
    });
    expect(look(box, two.state).isDone).toBe(true);
    expect(run(box, two.state, PolyBoxAction.Next).state.steps).toBe(2);
  });

  it("what's left shows after each column; the quotient stays hidden until it's found", () => {
    const one = run(box, divide, PolyBoxAction.Next).state;
    const { seen, ids } = expectAddressable(box, PolyBoxView, one);
    expect(seen.elements.find((e) => e.id === "left")?.value).toBe("−x + 1");
    expect(ids).toEqual(
      expect.arrayContaining(["side:0", "side:1", "top:0", "cell:0:0", "cell:1:0", "dividend"]),
    );
    expect(seen.hidden).toEqual({ quotient: "2x − 1", remainder: "3" });
    const done = expectAddressable(box, PolyBoxView, { ...divide, steps: 2 });
    expect(done.seen.elements.find((e) => e.id === "left")?.value).toBe("3 (the remainder)");
    expect(done.seen.hidden).toBeUndefined();
  });
});

describe("polyBox: multiplying", () => {
  const multiply = {
    ...polyBox.defaults,
    mode: BoxMode.Multiply,
    side: [1, -1],
    top: [1, -3],
    steps: 0,
  };
  it("(x − 1)(x − 3): four cells, then x² − 4x + 3", () => {
    expect(look(box, multiply).stepCount).toBe(4);
    const all = run(box, multiply, PolyBoxAction.All);
    expect(all.emit).toEqual([{ signal: "finished", payload: { result: "x² − 4x + 3" } }]);
    const { seen } = expectAddressable(box, PolyBoxView, all.state);
    expect(seen.elements.filter((e) => e.id.startsWith("cell:")).map((e) => e.value)).toEqual([
      "x²",
      "−3x",
      "−x",
      "3",
    ]);
    expect(seen.elements.find((e) => e.id === "result")?.value).toBe("x² − 4x + 3");
  });
});

describe("zeroPlane: lifting and flipping", () => {
  const fixed: ZeroPlaneState = {
    ...zeroPlane.defaults,
    form: PlaneForm.Coefficients,
    fixed: [1, -2, -3],
    canLift: true,
    canFlip: true,
  };
  it("lifting the curve changes how many times it meets the x-axis: 2, 1, 0", () => {
    expect(look(plane, fixed).zeroCount).toBe(2);
    const touch = run(plane, fixed, ZeroPlaneAction.Lift, { to: 4 });
    expect(look(plane, touch.state).equation).toBe("x² − 2x + 1");
    expect(look(plane, touch.state).zeroCount).toBe(1);
    expect(look(plane, run(plane, fixed, ZeroPlaneAction.Lift, { to: 5 }).state).zeroCount).toBe(0);
  });
  it("a cubic lifted never meets the axis more than 3 times", () => {
    const cubic = {
      ...fixed,
      fixed: [1, 0, -4, 0],
      window: { xMin: -4, xMax: 4, yMin: -8, yMax: 8 },
    };
    for (const to of [-4, -2, 0, 2, 4]) {
      expect(
        look(plane, run(plane, cubic, ZeroPlaneAction.Lift, { to }).state).zeroCount,
      ).toBeLessThanOrEqual(3);
    }
  });
  it("flipping turns it upside down and keeps the zeroes", () => {
    const { state } = run(plane, fixed, ZeroPlaneAction.Flip);
    expect(look(plane, state).equation).toBe("−x² + 2x + 3");
    expect(look(plane, state).zeroes).toEqual([-1, 3]);
  });
  it("can't lift or flip unless the board allows it", () => {
    const locked = { ...fixed, canLift: false, canFlip: false };
    expect(run(plane, locked, ZeroPlaneAction.Lift, { to: 4 }).state.lift).toBe(0);
    expect(run(plane, locked, ZeroPlaneAction.Flip).state.fixed).toEqual([1, -2, -3]);
  });
  it("every element can be found on screen, sum and product included", () => {
    expectAddressable(plane, ZeroPlaneView, {
      ...quadratic,
      isSumProductShown: true,
      canLift: true,
      canFlip: true,
    });
  });
});

describe("valueMachine", () => {
  const machine = asAnyProp(valueMachine);
  it("writes out the substitution, signs and all", () => {
    expect(workingTex([1, -3, -4], -1)).toBe(
      "p(-1) = \\left(-1\\right)^{2} - 3 \\times \\left(-1\\right) - 4 = 0",
    );
    expect(workingTex([1, -3, -4], 2)).toBe("p(2) = 2^{2} - 3 \\times 2 - 4 = -6");
    expect(workingTex([-5, 20, 0], 1, "h", "t")).toBe(
      "h(1) = -5 \\times 1^{2} + 20 \\times 1 = 15",
    );
    expect(workingTex([2, -5, -14, 8], 0.5)).toBe(
      "p(\\frac{1}{2}) = 2 \\times \\left(\\frac{1}{2}\\right)^{3} - 5 \\times \\left(\\frac{1}{2}\\right)^{2} - 14 \\times \\left(\\frac{1}{2}\\right) + 8 = 0",
    );
  });
  /** A machine placed as a board places it (bindings made true). */
  const placed = (given: Record<string, unknown> = {}) => {
    const r = initialState(machine, given);
    if (!r.isOk) throw new Error(r.errors.join("; "));
    return r.state as ValueMachineState;
  };
  it("each number put in leaves a dot; a zero says so", () => {
    let s = placed();
    s = run(machine, s, ValueMachineAction.Put, { x: 2 }).state;
    const four = run(machine, s, ValueMachineAction.Put, { x: 4 });
    expect(four.state.tried).toEqual([2, 4]);
    expect(four.emit.map((e) => e.signal)).toEqual(["put", "foundZero"]);
    expect(look(machine, four.state).zeroesFound).toEqual([4]);
    expect(look(machine, four.state).value).toBe(0);
    // Every block shows the machine's numbers: bound, so read through the view, never stored.
    const shown = look(machine, four.state) as unknown as Seen;
    expect(four.state.substitution).toEqual({ placeholder: "…" }); // its only own fact
    expect(shown?.substitution?.tex).toBe("p(4) = 4^{2} - 3 \\times 4 - 4 = 0");
    expect(shown?.plane?.handle).toMatchObject({ x: 4, label: "4" });
    expect(shown?.plane?.dots?.dots).toEqual([
      { x: 2, y: -6, tone: "main", isFaded: true },
      { x: 4, y: 0, tone: "accent" },
    ]);
  });
  it("what the learner does to a block becomes the machine's Put, Move or StartAgain", () => {
    const s = placed({ input: -1, tried: [-1] });
    const nudged = run(machine, s, "stepper.change", { to: -0.9 });
    expect(nudged.state.tried).toEqual([-1, -0.9]);
    expect(nudged.emit.map((e) => e.signal)).toEqual(["put"]);
    const dragging = run(machine, s, "plane.handle.move", { x: 2.04 });
    expect(dragging.state).toMatchObject({ input: 2, tried: [-1] });
    expect((look(machine, dragging.state) as unknown as Seen)?.plane?.dots?.dots).toContainEqual({
      x: 2,
      y: -6,
      tone: "muted",
    });
    const letGo = run(machine, dragging.state, "plane.handle.put", { x: 2.04 });
    expect(letGo.state.tried).toEqual([-1, 2]);
    const cleared = run(machine, letGo.state, "clear.press", {});
    expect(cleared.state).toMatchObject({ input: null, tried: [] });
    expect((look(machine, cleared.state) as unknown as Seen)?.clear?.isEnabled).toBe(false);
  });
  it("writes decimals as decimals, halves and quarters as fractions", () => {
    expect(workingTex([1, -3, -4], 2.3)).toBe(
      "p(2.3) = \\left(2.3\\right)^{2} - 3 \\times \\left(2.3\\right) - 4 = -5.61",
    );
    expect(machineNumber(-3.61).text).toBe("−3.61");
    expect(machineNumber(0.5).tex).toBe("\\frac{1}{2}");
    expect(machineNumber(-0.25).text).toBe("−1/4");
    expect(machineNumber(1 / 3).text).toBe("1/3");
  });
  it("puts in on the 0.1 step, inside the range", () => {
    const s = placed();
    expect(run(machine, s, ValueMachineAction.Put, { x: 2.34 }).state.input).toBe(2.3);
    expect(run(machine, s, ValueMachineAction.Put, { x: 0.1 + 0.2 }).state.tried).toEqual([0.3]);
    expect(run(machine, s, ValueMachineAction.Put, { x: 40 }).state.input).toBe(s.max);
  });
  it("sliding x moves the working but leaves no dot and says nothing", () => {
    const s = placed({ input: -1, tried: [-1] });
    const moved = run(machine, s, ValueMachineAction.Move, { x: 3.96 });
    expect(moved.state.input).toBe(4);
    expect(moved.state.tried).toEqual([-1]);
    expect(moved.emit).toEqual([]);
    expect(look(machine, moved.state).value).toBe(0);
    expect(look(machine, moved.state).zeroesFound).toEqual([-1]);
  });
  it("every element can be found on screen", () => {
    const s = placed({ input: -1, tried: [2, -1] });
    const { html, ids } = expectAddressable(machine, ValueMachineView, s);
    // One picture: graph paper, the drop line, the dots and the handle drawn together.
    expect(html.match(/<svg/g)?.length).toBe(2); // the stage's own SVG and its top layer
    expect(ids).toContain("plane › handle › handle");
    expect(ids).toContain("stepper › more");
  });
});

describe("longDivision", () => {
  const division = asAnyProp(longDivision);
  const start = longDivision.defaults as LongDivisionState;
  const played = (s: LongDivisionState, moves: number) => {
    let at = s;
    for (let i = 0; i < moves; i++) at = run(division, at, LongDivisionAction.Next).state;
    return at;
  };
  it("takes three moves per quotient term: divide, multiply, subtract", () => {
    expect(look(division, start).stepCount).toBe(6);
    expect(moveTex(played(start, 1))).toBe("\\frac{2x^{2}}{x} = 2x");
    expect(moveTex(played(start, 2))).toBe("2x(x + 2) = 2x^{2} + 4x");
    expect(moveTex(played(start, 3))).toBe(
      "\\begin{aligned} &(2x^{2} + 3x + 1) - (2x^{2} + 4x) \\\\ &= -x + 1 \\end{aligned}",
    );
    expect(moveTex(played(start, 4))).toBe("\\frac{-x}{x} = -1");
    expect(moveTex(played(start, 5))).toBe("(-1)(x + 2) = -x - 2");
  });
  it("ends with dividend = divisor × quotient + remainder (NCERT Example 6 and 7)", () => {
    const done = played(start, 6);
    expect(look(division, done).quotient).toBe("2x − 1");
    expect(look(division, done).remainder).toBe("3");
    expect(moveTex(done)).toContain("\\\\[6pt] &2x^{2} + 3x + 1 \\\\ &= (x + 2)(2x - 1) + 3 ");
    const ncert = { ...start, dividend: [3, 1, 2, 5], divisor: [1, 2, 1] };
    const end = played(ncert, 6);
    expect(look(division, end).quotient).toBe("3x − 5");
    expect(look(division, end).remainder).toBe("9x + 10");
    expect(moveTex(end)).toContain("&= (x^{2} + 2x + 1)(3x - 5) + (9x + 10)");
  });
  it("a factor leaves 0, written in the constant's column", () => {
    const factor = { ...start, dividend: [2, 3, -2, -9, -12], divisor: [1, 0, -3], variable: "t" };
    const end = played(factor, look(division, factor).stepCount as number);
    expect(look(division, end).quotient).toBe("2t² + 3t + 4");
    expect(look(division, end).remainder).toBe("0");
    expect(layoutTex(end).endsWith("\\hline  &  &  &  &  & 0 \\end{array}")).toBe(true);
    expect(moveTex(end)).toContain("&= (t^{2} - 3)(2t^{2} + 3t + 4) ");
    expect(moveTex(end)).not.toContain("+ 0");
  });
  it("puts each quotient term over the dividend term of the same power", () => {
    const ncert = { ...start, dividend: [3, 1, 2, 5], divisor: [1, 2, 1] };
    const firstRow = layoutTex(played(ncert, 1)).split("\\\\")[0];
    expect(firstRow).toBe("\\begin{array}{r|rrrr}  &  &  & 3x &  ");
  });
  it("signals each move, and finishing once; stops at the end; starts again", () => {
    const five = played(start, 5);
    const last = run(division, five, LongDivisionAction.Next);
    expect(last.emit.map((e) => e.signal)).toEqual(["stepped", "finished"]);
    expect(run(division, last.state, LongDivisionAction.Next).emit).toEqual([]);
    expect(run(division, last.state, LongDivisionAction.StartAgain).state.steps).toBe(0);
    expect(run(division, start, LongDivisionAction.All).state.steps).toBe(6);
  });
  it("every element can be found on screen, from start to end", () => {
    for (const moves of [0, 2, 6])
      expectAddressable(division, LongDivisionView, played(start, moves));
  });
});
