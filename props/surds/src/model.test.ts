import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  prepareAction,
  tweenAt,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { layoutOf } from "./layout";
import { type SurdTilesState, surdTiles } from "./model";
import { type Term, sumValue, termValue } from "./surd";

const def: AnyPropDef = asAnyProp(surdTiles);
const t = (coefficient: number, radicand = 1): Term => ({ coefficient, radicand });
const at = (left: Term[], right: Term[], more: Partial<SurdTilesState> = {}): SurdTilesState => ({
  ...surdTiles.defaults,
  left,
  right,
  ...more,
});
const view = (s: SurdTilesState) => viewOf(def, s);

function run(state: SurdTilesState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  return result.effect;
}

function refuses(state: SurdTilesState, name: string, args: Record<string, unknown> = {}) {
  return !prepareAction(def, state, name, args).isOk;
}

/** Runs a task with a clock that never waits, every `set` through the one door. */
async function play(state: SurdTilesState, name: string, args: Record<string, unknown> = {}) {
  const effect = run(state, name, args);
  let stored: StoredState = state;
  const steps: number[] = [];
  const signals: { signal: string; payload?: Readonly<Record<string, unknown>> }[] = [];
  if (effect.kind === EffectKind.Set) {
    const r = applyPatch(def, stored, effect.set);
    if (!r.isOk) throw new Error(r.errors.join("; "));
    return { state: r.state, steps, signals: [...effect.emit] };
  }
  if (effect.kind !== EffectKind.Task) throw new Error("expected a task");
  await effect.run({
    speak: async () => {},
    wait: async () => {},
    get: () => stored,
    set: (patch) => {
      const r = applyPatch(def, stored, patch);
      if (!r.isOk) throw new Error(r.errors.join("; "));
      stored = r.state;
      steps.push(Number(stored.combine));
    },
    emit: (signal, payload) => signals.push({ signal, payload }),
  });
  return { state: stored, steps, signals };
}

const ROOT5_PLUS_ROOT3 = [t(1, 5), t(1, 3)];
const ROOT5_MINUS_ROOT3 = [t(1, 5), t(-1, 3)];

describe("surdTiles: known products", () => {
  const cases: [string, Term[], Term[], string, boolean][] = [
    // NCERT Exercise 1.5 Q2
    ["(3 + √3)(2 + √2)", [t(3), t(1, 3)], [t(2), t(1, 2)], "6 + 3√2 + 2√3 + √6", false],
    ["(3 + √3)(3 − √3)", [t(3), t(1, 3)], [t(3), t(-1, 3)], "6", true],
    ["(√5 + √2)²", [t(1, 5), t(1, 2)], [t(1, 5), t(1, 2)], "7 + 2√10", false],
    ["(√5 − √2)(√5 + √2)", [t(1, 5), t(-1, 2)], [t(1, 5), t(1, 2)], "3", true],
    // Conjugates: rationalising the denominator (Examples 17–20, Q5)
    ["(√5 + √3)(√5 − √3)", ROOT5_PLUS_ROOT3, ROOT5_MINUS_ROOT3, "2", true],
    ["(√7)(√7)", [t(1, 7)], [t(1, 7)], "7", true],
    ["(√2)(√2)", [t(1, 2)], [t(1, 2)], "2", true],
    ["(7 + 3√2)(7 − 3√2)", [t(7), t(3, 2)], [t(7), t(-3, 2)], "31", true],
    ["(2 + √3)(2 − √3)", [t(2), t(1, 3)], [t(2), t(-1, 3)], "1", true],
    ["(√3 − √5)(√3 + √5)", [t(1, 3), t(-1, 5)], [t(1, 3), t(1, 5)], "−2", true],
    ["(√7 − √6)(√7 + √6)", [t(1, 7), t(-1, 6)], [t(1, 7), t(1, 6)], "1", true],
    ["(√7 − 2)(√7 + 2)", [t(1, 7), t(-2)], [t(1, 7), t(2)], "3", true],
    // The mistake: the same binomial instead of the conjugate
    ["(√5 + √3)²", ROOT5_PLUS_ROOT3, ROOT5_PLUS_ROOT3, "8 + 2√15", false],
    ["√2·√8", [t(1, 2)], [t(1, 8)], "4", true],
    ["√6·√10", [t(1, 6)], [t(1, 10)], "2√15", false],
  ];
  for (const [name, left, right, text, rational] of cases) {
    it(`${name} = ${text}`, () => {
      const v = view(at(left, right));
      expect(v.resultText).toBe(text);
      expect(v.isRational).toBe(rational);
    });
  }

  it("draws (√5 + √3)(√5 − √3) as 5, −√15, √15, −3: the cross tiles cancel", () => {
    const v = view(at(ROOT5_PLUS_ROOT3, ROOT5_MINUS_ROOT3));
    expect(v.tiles).toEqual([
      { row: 0, col: 0, coefficient: 5, radicand: 1, text: "5", isCancelled: false },
      { row: 0, col: 1, coefficient: -1, radicand: 15, text: "−√15", isCancelled: true },
      { row: 1, col: 0, coefficient: 1, radicand: 15, text: "√15", isCancelled: true },
      { row: 1, col: 1, coefficient: -3, radicand: 1, text: "−3", isCancelled: false },
    ]);
    expect(v.cancelledTiles).toEqual(["0-1", "1-0"]);
    expect(v.expandedText).toBe("5 − √15 + √15 − 3");
    expect(v.terms).toEqual([t(2)]);
  });

  it("with the same binomial the cross tiles add instead: 2√15", () => {
    const v = view(at(ROOT5_PLUS_ROOT3, ROOT5_PLUS_ROOT3));
    expect(v.cancelledTiles).toEqual([]);
    expect(v.expandedText).toBe("5 + √15 + √15 + 3");
    expect(v.terms).toEqual([t(8), t(2, 15)]);
  });

  it("(√5 + √2)² is not 5 + 2: the two cross tiles are there", () => {
    const v = view(at([t(1, 5), t(1, 2)], [t(1, 5), t(1, 2)]));
    expect(v.expandedText).toBe("5 + √10 + √10 + 2");
  });

  it("writes the factors", () => {
    const v = view(at([t(3), t(1, 3)], [t(1, 7)]));
    expect(v.leftText).toBe("(3 + √3)");
    expect(v.rightText).toBe("√7");
  });

  it("knows only factors and tiles: no lesson-specific fields", () => {
    expect(Object.keys(view(surdTiles.defaults)).sort()).toEqual(
      [
        "canChangeRight",
        "cancelledTiles",
        "combine",
        "expandedText",
        "hasCombined",
        "isRational",
        "left",
        "leftText",
        "resultText",
        "right",
        "rightText",
        "terms",
        "tiles",
      ].sort(),
    );
  });
});

describe("surdTiles: laws over generated factors", () => {
  // A small deterministic generator (no Math.random).
  let seed = 12345;
  const next = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  const coefficient = () => {
    const c = next(41) - 20;
    return c === 0 ? 1 : c;
  };
  const radicand = () => (next(3) === 0 ? 1 : 1 + next(200));
  const factor = (): Term[] =>
    Array.from({ length: 1 + next(2) }, () => ({
      coefficient: coefficient(),
      radicand: radicand(),
    }));

  it("the result's value is the product of the factors' values, and isRational matches", () => {
    for (let i = 0; i < 3000; i++) {
      const left = factor();
      const right =
        i % 3 === 0 ? left.map((x, j) => (j === 1 ? t(-x.coefficient, x.radicand) : x)) : factor();
      const s = at(left, right);
      expect(applyPatch(def, surdTiles.defaults, s).isOk).toBe(true);
      const v = view(s);
      const terms = v.terms as Term[];
      const expected = sumValue(left) * sumValue(right);
      expect(Math.abs(sumValue(terms) - expected)).toBeLessThan(
        1e-9 * Math.max(1, Math.abs(expected)),
      );
      expect(v.isRational).toBe(terms.every((x) => x.radicand === 1));
      // Each tile is its row term times its column term.
      for (const tile of v.tiles as (Term & { row: number; col: number })[]) {
        const a = left[tile.row];
        const b = right[tile.col];
        if (a === undefined || b === undefined) throw new Error("tile out of range");
        expect(Math.abs(termValue(tile) - termValue(a) * termValue(b))).toBeLessThan(1e-9 * 4000);
      }
      // Simplified terms: square-free radicands, distinct, sorted, no zeros.
      const radicands = terms.map((x) => x.radicand);
      expect([...radicands].sort((a, b) => a - b)).toEqual(radicands);
      expect(new Set(radicands).size).toBe(radicands.length);
      for (const x of terms) {
        expect(x.coefficient).not.toBe(0);
        for (let p = 2; p * p <= x.radicand; p++) expect(x.radicand % (p * p)).not.toBe(0);
      }
      // A conjugate pair (a + b)(a − b) is always rational: a² − b².
      if (i % 3 === 0 && left.length === 2) expect(v.isRational).toBe(true);
    }
  });
});

describe("surdTiles: actions", () => {
  const start = at(ROOT5_PLUS_ROOT3, ROOT5_PLUS_ROOT3, { canChangeRight: true, combine: 1 });

  it("flipSign turns √5 + √3 into √5 − √3 and separates the tiles", async () => {
    const { state } = await play(start, "flipSign", { term: 1 });
    expect(state.right).toEqual(ROOT5_MINUS_ROOT3);
    expect(state.left).toEqual(ROOT5_PLUS_ROOT3);
    expect(state.combine).toBe(0);
    expect(view(state as SurdTilesState).isRational).toBe(true);
  });

  it("setRight picks an offered factor; setFactors changes both", async () => {
    const one = await play(start, "setRight", { right: [t(1, 5), t(-1, 3)] });
    expect(one.state.right).toEqual(ROOT5_MINUS_ROOT3);
    expect(one.state.left).toEqual(ROOT5_PLUS_ROOT3);
    expect(one.state.combine).toBe(0);
    const two = await play(start, "setFactors", { left: [t(1, 7)], right: [t(1, 7)] });
    expect(two.state).toMatchObject({
      left: [t(1, 7)],
      right: [t(1, 7)],
      combine: 0,
      canChangeRight: true,
    });
  });

  it("refuses learner changes to the top factor unless canChangeRight", () => {
    const locked = { ...start, canChangeRight: false };
    expect(refuses(locked, "flipSign", { term: 0 })).toBe(true);
    expect(refuses(locked, "setRight", { right: [t(1, 2)] })).toBe(true);
    expect(refuses(locked, "setFactors", { left: [t(1, 2)], right: [t(1, 2)] })).toBe(false);
    expect(refuses({ ...start, right: [t(1, 7)] }, "flipSign", { term: 1 })).toBe(true);
  });

  it("combine glides through the one door at every step, then raises combined", async () => {
    const s = at(ROOT5_PLUS_ROOT3, ROOT5_MINUS_ROOT3);
    const { state, steps, signals } = await play(s, "combine");
    expect(steps.length).toBe(45);
    expect(steps.at(-1)).toBe(1);
    for (let i = 1; i < steps.length; i++) expect(steps[i] ?? 0).toBeGreaterThan(steps[i - 1] ?? 0);
    expect(state.combine).toBe(1);
    expect(view(state as SurdTilesState).hasCombined).toBe(true);
    expect(signals).toEqual([{ signal: "combined", payload: { isRational: true } }]);
  });

  it("combine at once with over 0, and it reveals the product", async () => {
    const { state, signals } = await play(at(ROOT5_PLUS_ROOT3, ROOT5_PLUS_ROOT3), "combine", {
      over: 0,
    });
    expect(state.combine).toBe(1);
    expect(signals).toEqual([{ signal: "combined", payload: { isRational: false } }]);
    expect(surdTiles.actions.combine?.reveals).toBe(true);
  });

  it("a combine run stops when the factors change on its way", async () => {
    const s = at(ROOT5_PLUS_ROOT3, ROOT5_MINUS_ROOT3, { canChangeRight: true });
    const effect = run(s, "combine");
    if (effect.kind !== EffectKind.Task) throw new Error("expected a task");
    let stored: StoredState = s;
    let sets = 0;
    const signals: string[] = [];
    await effect.run({
      speak: async () => {},
      wait: async () => {
        if (sets === 10) stored = { ...stored, right: ROOT5_PLUS_ROOT3, combine: 0 };
      },
      get: () => stored,
      set: (patch) => {
        sets += 1;
        stored = { ...stored, ...patch };
      },
      emit: (signal) => signals.push(signal),
    });
    expect(sets).toBe(10);
    expect(stored.combine).toBe(0);
    expect(signals).toEqual([]);
  });

  it("separate glides back to the tiles, every step through the one door", () => {
    const s = at(ROOT5_PLUS_ROOT3, ROOT5_MINUS_ROOT3, { combine: 1 });
    const effect = run(s, "separate");
    if (effect.kind !== EffectKind.Tween) throw new Error("expected a tween");
    expect(effect.to).toEqual({ combine: 0 });
    for (let i = 0; i <= 50; i++)
      expect(applyPatch(def, s, tweenAt(s, effect.to, i / 50)).isOk).toBe(true);
  });

  it("marks what a finger does", () => {
    const byLearner = Object.entries(surdTiles.actions)
      .filter(([, spec]) => spec.byLearner === true)
      .map(([name]) => name)
      .sort();
    expect(byLearner).toEqual(["combine", "flipSign", "separate", "setRight"]);
  });
});

describe("surdTiles: refusals", () => {
  const s = surdTiles.defaults;
  it("refuses a 0 coefficient, a 0 radicand, 3 terms or none", () => {
    expect(applyPatch(def, s, { left: [t(0, 2), t(1, 3)] }).isOk).toBe(false);
    expect(applyPatch(def, s, { left: [t(1, 0)] }).isOk).toBe(false);
    expect(applyPatch(def, s, { right: [t(1, 2), t(1, 3), t(1, 5)] }).isOk).toBe(false);
    expect(applyPatch(def, s, { right: [] }).isOk).toBe(false);
    expect(applyPatch(def, s, { right: [t(1.5, 2)] }).isOk).toBe(false);
    expect(applyPatch(def, s, { right: [t(21, 2)] }).isOk).toBe(false);
    expect(applyPatch(def, s, { right: [t(1, 201)] }).isOk).toBe(false);
    expect(applyPatch(def, s, { combine: 1.2 }).isOk).toBe(false);
    expect(refuses(s, "setFactors", { left: [t(0, 2)], right: [t(1, 2)] })).toBe(true);
  });
});

describe("surdTiles: parts", () => {
  const s = at(ROOT5_PLUS_ROOT3, ROOT5_MINUS_ROOT3);
  const v = view(s) as never;
  it("names every tile, term and the result", () => {
    expect(surdTiles.parts?.(v)).toEqual([
      "tile:0-0",
      "tile:0-1",
      "tile:1-0",
      "tile:1-1",
      "leftTerm:0",
      "leftTerm:1",
      "rightTerm:0",
      "rightTerm:1",
      "result",
    ]);
    expect(surdTiles.parts?.(view(at([t(1, 7)], [t(1, 7)])) as never)).toEqual([
      "tile:0-0",
      "leftTerm:0",
      "rightTerm:0",
      "result",
    ]);
  });

  it("locates parts inside the prop at the width it's given", () => {
    for (const width of [200, 340, 380]) {
      const height = layoutOf(s.left, s.right, width).height;
      for (const part of surdTiles.parts?.(v) ?? []) {
        const box = surdTiles.locate?.(v, part, width);
        expect(box, part).toBeDefined();
        if (box === undefined) continue;
        expect(box.x).toBeGreaterThanOrEqual(-1);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
      }
    }
    expect(surdTiles.locate?.(v, "tile:2-0", 340)).toBeUndefined();
  });

  it("gives the cross tiles the same area: a × b and b × a", () => {
    const layout = layoutOf(s.left, s.right, 340);
    const area = (row: number, col: number) =>
      (layout.rows[row]?.height ?? 0) * (layout.columns[col]?.width ?? 0);
    expect(area(0, 1)).toBeCloseTo(area(1, 0), 6);
  });
});
