import { type PropView, describeView } from "@chalk/player";
import { Board, type BoardEvent, prop } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { coordinatePlaneProp } from "./index";
import {
  coefficientsOf,
  expandedOf,
  factoredOf,
  parabola,
  realZeroesOf,
  valueAt,
  vertexOf,
} from "./parabola";
import { windowSchema } from "./plane";

// The parabola, held alone by a tiny holder that gives it the plane's window.

const WINDOW = { xMin: -4, xMax: 6, yMin: -5, yMax: 6 };
const holder = prop({
  type: "parabolaHolder",
  describe: "test",
  variables: z.object({ window: windowSchema }).strict(),
  start: { window: WINDOW },
  children: { parabola },
});

/** y = (x + 1)(x − 3), the book's x² − 2x − 3, unless given otherwise. */
function board(given: Readonly<Record<string, unknown>> = {}) {
  const b = new Board(holder, { parabola: { zeroes: { alpha: -1, beta: 3 }, ...given } } as never);
  const told: { signal: string; payload: unknown }[] = [];
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: `${e.path}.${e.signal}`, payload: e.payload });
  });
  return { b, told, read: () => b.read<typeof holder>().parabola };
}

const shape = (alpha: number, beta: number, a = 1, lift = 0) => ({
  zeroes: { alpha, beta },
  a,
  lift,
});

describe("the parabola y = a(x − α)(x − β), against the book", () => {
  it("x² − 2x − 3 = (x + 1)(x − 3): zeroes −1 and 3, vertex (1, −4), meets the y-axis at −3", () => {
    const s = shape(-1, 3);
    expect(coefficientsOf(s)).toEqual({ a: 1, b: -2, c: -3 });
    expect(expandedOf(s)).toBe("x² − 2x − 3");
    expect(factoredOf(s)).toBe("(x + 1)(x − 3)");
    expect(realZeroesOf(s)).toEqual([-1, 3]);
    expect(vertexOf(s)).toEqual({ x: 1, y: -4 });
    expect(valueAt(s, 0)).toBe(-3);
  });

  it("a < 0 opens down: −2x² + 4x = −2x(x − 2), its vertex (1, 2) on top", () => {
    const s = shape(2, 0, -2);
    expect(expandedOf(s)).toBe("−2x² + 4x");
    expect(factoredOf(s)).toBe("−2x(x − 2)");
    expect(vertexOf(s)).toEqual({ x: 1, y: 2 });
    expect(valueAt(s, 5)).toBeLessThan(vertexOf(s).y);
  });

  it("the two zeroes meet: x² − 2x + 1 = (x − 1)², it touches the axis at one point", () => {
    const s = shape(1, 1);
    expect(expandedOf(s)).toBe("x² − 2x + 1");
    expect(factoredOf(s)).toBe("(x − 1)²");
    expect(realZeroesOf(s)).toEqual([1]);
    expect(vertexOf(s)).toEqual({ x: 1, y: 0 });
  });

  it("lifted off the axis it has no zeroes; lowered, it meets it twice again", () => {
    const up = shape(1, 1, 1, 2);
    expect(expandedOf(up)).toBe("x² − 2x + 3");
    expect(factoredOf(up)).toBeNull();
    expect(realZeroesOf(up)).toEqual([]);
    // (x − 1)² − 1 = x(x − 2): zeroes 0 and 2.
    expect(realZeroesOf(shape(1, 1, 1, -1))).toEqual([0, 2]);
    // x² − 4 = (x + 2)(x − 2), and −x² + 9 written the book's way.
    expect(expandedOf(shape(-2, 2))).toBe("x² − 4");
    expect(expandedOf(shape(-3, 3, -1))).toBe("−x² + 9");
    expect(factoredOf(shape(-3, 3, -1))).toBe("−(x + 3)(x − 3)");
  });

  it("over many parabolas: zero at its zeroes, vertex midway, symmetric, α + β = −b/a, αβ = c/a", () => {
    for (let i = 0; i < 200; i++) {
      const alpha = ((i * 37) % 17) / 2 - 4;
      const beta = ((i * 53) % 19) / 2 - 4.5;
      const a = [1, -1, 2, -0.5, 3][i % 5] as number;
      const s = shape(alpha, beta, a);
      const { b, c } = coefficientsOf(s);
      expect(valueAt(s, alpha)).toBeCloseTo(0, 9);
      expect(valueAt(s, beta)).toBeCloseTo(0, 9);
      const h = vertexOf(s).x;
      expect(h).toBeCloseTo((alpha + beta) / 2, 9);
      expect(valueAt(s, h + 1.3)).toBeCloseTo(valueAt(s, h - 1.3), 9);
      expect(alpha + beta).toBeCloseTo(-b / a, 9);
      expect(alpha * beta).toBeCloseTo(c / a, 9);
      // How many times it meets the axis: b² − 4ac decides.
      const lift = ((i % 7) - 3) / 2;
      const lifted = shape(alpha, beta, a, lift);
      const k = coefficientsOf(lifted);
      const d = k.b * k.b - 4 * k.a * k.c;
      const n = realZeroesOf(lifted).length;
      expect(n).toBe(Math.abs(d) < 1e-9 ? 1 : d > 0 ? 2 : 0);
      for (const z0 of realZeroesOf(lifted)) expect(valueAt(lifted, z0)).toBeCloseTo(0, 6);
    }
  });
});

describe("what it can be asked", () => {
  it("dragging a zero snaps it to the step, and the curve follows", () => {
    const { b, told, read } = board();
    b.input("parabola", "moveBeta", { x: 1.2 });
    expect(read().zeroes).toEqual({ alpha: -1, beta: 1 });
    expect(read().expanded).toBe("x² − 1");
    expect(told.at(-1)).toEqual({
      signal: "parabola.zeroMoved",
      payload: { alpha: -1, beta: 1, zeroCount: 2 },
    });
    b.input("parabola", "moveAlpha", { x: 0.9 });
    expect(read().isTouching).toBe(true);
    expect(read().factored).toBe("(x − 1)²");
  });

  it("refuses a zero off the plane, a drag when it can't be dragged, and one while lifted", () => {
    const { b, read } = board();
    b.input("parabola", "moveAlpha", { x: -9 });
    expect(read().zeroes?.alpha).toBe(-1);
    const fixed = board({ canDrag: false });
    fixed.b.input("parabola", "moveAlpha", { x: 0 });
    expect(fixed.read().zeroes?.alpha).toBe(-1);
    const lifted = board({ lift: 2 });
    lifted.b.input("parabola", "moveAlpha", { x: 0 });
    expect(lifted.read().zeroes?.alpha).toBe(-1);
  });

  it("flip turns it over: a's sign, the zeroes stay; only when it may", () => {
    const { b, read } = board();
    b.input("parabola", "flip", {});
    expect(read().a).toBe(1);
    const flips = board({ canFlip: true });
    flips.b.input("parabola", "flip", {});
    expect(flips.read().a).toBe(-1);
    expect(flips.read().expanded).toBe("−x² + 2x + 3");
    expect(flips.read().realZeroes).toEqual([-1, 3]);
  });

  it("trace draws it from left to right, and tells when it is drawn", () => {
    const { b, told, read } = board();
    expect(read().traced).toBe(1);
    b.send("parabola", "trace", { seconds: 4 });
    expect(read().traced).toBe(0);
    b.advanceTo(2);
    expect(read().traced).toBeCloseTo(0.5, 6);
    expect(told.map((e) => e.signal)).not.toContain("parabola.traced");
    b.runUntilIdle();
    expect(read().traced).toBe(1);
    expect(told.map((e) => e.signal)).toContain("parabola.traced");
  });

  it("moveZeroes slides both zeroes together: midway between, then there, then tells", () => {
    const { b, told, read } = board();
    b.send("parabola", "moveZeroes", { alpha: 1, beta: 1, seconds: 2 });
    b.advanceTo(1);
    const mid = read().zeroes;
    expect(mid?.alpha).toBeGreaterThan(-1);
    expect(mid?.alpha).toBeLessThan(1);
    expect(mid?.beta).toBeLessThan(3);
    expect(mid?.beta).toBeGreaterThan(1);
    // Always midway between them, the vertex.
    expect(read().vertex.x).toBeCloseTo(1, 9);
    b.runUntilIdle();
    expect(read().zeroes).toEqual({ alpha: 1, beta: 1 });
    expect(read().zeroCount).toBe(1);
    expect(told.at(-1)).toEqual({
      signal: "parabola.zeroesMoved",
      payload: { alpha: 1, beta: 1, zeroCount: 1 },
    });
  });

  it("lift raises it off the axis: no zeroes left, told at its end", () => {
    const { b, told, read } = board({ zeroes: { alpha: 1, beta: 1 } });
    b.send("parabola", "lift", { to: 1.5, seconds: 1.5 });
    b.advanceTo(0.75);
    expect(read().lift).toBeGreaterThan(0);
    expect(read().lift).toBeLessThan(1.5);
    expect(read().zeroCount).toBe(0);
    b.runUntilIdle();
    expect(read().expanded).toBe("x² − 2x + 2.5");
    expect(told.at(-1)).toEqual({
      signal: "parabola.lifted",
      payload: { lift: 1.5, zeroCount: 0 },
    });
  });

  it("a can't be 0: that is no parabola", () => {
    expect(() => board({ a: 0 }).read()).toThrow();
  });
});

describe("what the student sees", () => {
  const given = {
    plane: { window: WINDOW },
    parabola: { zeroes: { alpha: -1, beta: 3 }, canFlip: true },
  };
  const holderOf = prop({
    type: "planeHolder",
    describe: "test",
    variables: z.object({ isOpen: z.boolean() }).strict(),
    start: { isOpen: false },
    children: { it: coordinatePlaneProp.def },
  });

  it("the curve and its expression, both zeroes to drag, and Flip", () => {
    const b = new Board(holderOf, { it: given } as never);
    const seen = describeView(coordinatePlaneProp, b.read("it") as unknown as PropView);
    const at = (id: string) => seen.elements.find((e) => e.id === id);
    expect(at("parabola/expression")?.words).toBe("y = x² − 2x − 3 = (x + 1)(x − 3)");
    expect(at("parabola/zeroes")?.value).toEqual([-1, 3]);
    expect(at("parabola/moveAlpha")?.does).toBe("parabola.moveAlpha");
    expect(at("parabola/moveBeta")?.does).toBe("parabola.moveBeta");
    expect(at("parabola/flip")?.does).toBe("parabola.flip");
  });
});
