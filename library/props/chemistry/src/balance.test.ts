import { type PropView, checkProp, describeView } from "@chalk/player";
import { Board, type BoardEvent } from "@chalk/prop";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { SECONDS_TO_REGROUP, Side, equationBalance, tallyRows } from "./balance";
import { EquationBalanceView } from "./balance-view";
import { atomsOf, balancingCoefficients, prettyFormula, tallyOf } from "./formula";
import { equationBalanceProp } from "./index";
import { shapeOf } from "./molecule";
import { flightAt, pairsOf, pictureOf, sideAtoms } from "./picture";

const R = Side.Reactants;
const P = Side.Products;

const one = (...formulae: string[]) => formulae.map((formula) => ({ formula, coefficient: 1 }));
const WATER = { reactants: one("H2", "O2"), products: one("H2O") };
const IRON_AND_STEAM = { reactants: one("Fe", "H2O"), products: one("Fe3O4", "H2") };
const METHANE = { reactants: one("CH4", "O2"), products: one("CO2", "H2O") };

function board(given: Readonly<Record<string, unknown>> = WATER) {
  const b = new Board(equationBalance, given as never);
  const told: { signal: string; payload: unknown }[] = [];
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload });
  });
  return { b, told, read: () => b.read<typeof equationBalance>() };
}

describe("formulae, read as the book writes them", () => {
  it("counts each element's atoms, brackets and all", () => {
    expect(atomsOf("H2O")).toEqual({ H: 2, O: 1 });
    expect(atomsOf("Fe3O4")).toEqual({ Fe: 3, O: 4 });
    expect(atomsOf("Ca(OH)2")).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(atomsOf("Pb(NO3)2")).toEqual({ Pb: 1, N: 2, O: 6 });
    expect(() => atomsOf("h2o")).toThrow();
    expect(() => atomsOf("H1")).toThrow();
    expect(prettyFormula("Fe3O4")).toBe("Fe₃O₄");
  });

  it("counts a side with its coefficients: 2H₂O holds 4 H and 2 O", () => {
    expect(tallyOf([{ formula: "H2O", coefficient: 2 }])).toEqual({ H: 4, O: 2 });
  });

  it("finds the book's smallest coefficients", () => {
    expect(balancingCoefficients(["H2", "O2"], ["H2O"])).toEqual([2, 1, 2]);
    expect(balancingCoefficients(["Fe", "H2O"], ["Fe3O4", "H2"])).toEqual([3, 4, 1, 4]);
    expect(balancingCoefficients(["CH4", "O2"], ["CO2", "H2O"])).toEqual([1, 2, 1, 2]);
    expect(balancingCoefficients(["Mg", "O2"], ["MgO"])).toEqual([2, 1, 2]);
  });
});

describe("H₂ + O₂ → H₂O, balanced a molecule at a time", () => {
  it("starts unbalanced: O is 2 on the left and 1 on the right; H is 2 and 2", () => {
    const { read } = board();
    const s = read();
    expect(s.tally).toEqual([
      { element: "H", left: 2, right: 2 },
      { element: "O", left: 2, right: 1 },
    ]);
    expect(s.isBalanced).toBe(false);
    expect(s.equation).toBe("H₂ + O₂ → H₂O");
    expect(s.solution).toEqual({ reactants: [2, 1], products: [2] });
  });

  it("a second H₂O balances O and leaves H short (2 vs 4); a second H₂ balances all", () => {
    const { b, told, read } = board();
    b.send("", "setCoefficient", { side: P, index: 0, coefficient: 2 });
    b.runUntilIdle();
    expect(read().tally).toEqual([
      { element: "H", left: 2, right: 4 },
      { element: "O", left: 2, right: 2 },
    ]);
    expect(told.map((t) => t.signal)).toEqual(["counted"]);
    b.input("", "step", { side: R, index: 0, by: 1 });
    b.runUntilIdle();
    expect(read().isBalanced).toBe(true);
    expect(read().equation).toBe("2H₂ + O₂ → 2H₂O");
    expect(told.map((t) => t.signal)).toEqual(["counted", "counted", "balanced"]);
    expect(told[2]?.payload).toEqual({ equation: "2H₂ + O₂ → 2H₂O" });
  });

  it("the tally changes at once; the new copy pops in, and counted is told when it has", () => {
    const { b, told, read } = board();
    b.send("", "setCoefficient", { side: P, index: 0, coefficient: 2 });
    b.advanceTo(0.25);
    const mid = read();
    expect(mid.products[0]?.coefficient).toBe(2);
    expect(mid.pop).toEqual({ side: P, index: 0, was: 1 });
    expect(mid.popped).toBeGreaterThan(0);
    expect(mid.popped).toBeLessThan(1);
    expect(told).toEqual([]);
    b.runUntilIdle();
    expect(read().pop).toBeNull();
    expect(told[0]?.payload).toEqual({ side: P, index: 0, coefficient: 2, isBalanced: false });
  });

  it("refuses a coefficient below 1 or above 6, the same one again, or a molecule not there", () => {
    const { b, told, read } = board();
    b.input("", "step", { side: R, index: 0, by: -1 });
    b.send("", "setCoefficient", { side: R, index: 0, coefficient: 1 });
    b.send("", "setCoefficient", { side: P, index: 2, coefficient: 2 });
    b.runUntilIdle();
    expect(told).toEqual([]);
    expect(() => b.send("", "setCoefficient", { side: R, index: 0, coefficient: 7 })).toThrow();
    for (let i = 0; i < 8; i++) b.input("", "step", { side: R, index: 1, by: 1 });
    b.runUntilIdle();
    expect(read().reactants[1]?.coefficient).toBe(6);
  });

  it("start again puts every coefficient back to 1", () => {
    const { b, read } = board();
    b.input("", "step", { side: P, index: 0, by: 1 });
    b.runUntilIdle();
    b.input("", "startAgain", {});
    expect(read().products[0]?.coefficient).toBe(1);
    expect(read().isBalanced).toBe(false);
  });
});

describe("atoms are neither made nor lost", () => {
  const cases = [WATER, IRON_AND_STEAM, METHANE];

  it.each(cases)("at the solution, every element balances ($products.0.formula)", (sides) => {
    const { b, read } = board(sides);
    const solution = read().solution;
    expect(solution).not.toBeNull();
    for (const side of [R, P])
      solution?.[side].forEach((c, index) => {
        if (c !== 1) b.send("", "setCoefficient", { side, index, coefficient: c });
      });
    b.runUntilIdle();
    expect(read().isBalanced).toBe(true);
    expect(read().tally.every((row) => row.left === row.right)).toBe(true);
  });

  it("over every coefficient up to 3, balanced exactly when each element's atoms match", () => {
    for (let a = 1; a <= 3; a++)
      for (let b = 1; b <= 3; b++)
        for (let c = 1; c <= 3; c++) {
          const sides = {
            reactants: [
              { formula: "H2", coefficient: a },
              { formula: "O2", coefficient: b },
            ],
            products: [{ formula: "H2O", coefficient: c }],
          };
          const isMatched = 2 * a === 2 * c && 2 * b === c;
          expect(tallyRows(sides).every((r) => r.left === r.right)).toBe(isMatched);
        }
  });

  it("refuses an equation where an element is only on one side", () => {
    expect(() => board({ reactants: one("H2"), products: one("H2O") })).toThrow(/both sides/);
  });

  it.each(cases)(
    "regrouped, each atom on the left goes to one of its kind on the right",
    (sides) => {
      const { b, read } = board(sides);
      const solution = read().solution;
      for (const side of [R, P])
        solution?.[side].forEach((c, index) => {
          if (c !== 1) b.send("", "setCoefficient", { side, index, coefficient: c });
        });
      b.runUntilIdle();
      const p = pictureOf(read(), 360);
      const pairs = pairsOf(p);
      const left = sideAtoms(p, R);
      const right = sideAtoms(p, P);
      expect(pairs).toHaveLength(left.length);
      expect(left).toHaveLength(right.length);
      expect(pairs.every((pair) => pair.from.element === pair.to.element)).toBe(true);
      // Every atom on the right is arrived at exactly once.
      const spot = (a: { x: number; y: number }) => `${a.x.toFixed(3)},${a.y.toFixed(3)}`;
      expect(new Set(pairs.map((pair) => spot(pair.to)))).toEqual(new Set(right.map(spot)));
      expect(new Set(pairs.map((pair) => spot(pair.to))).size).toBe(right.length);
      // At the start each flies from its own place; at the end it is where it goes.
      const n = pairs.length;
      pairs.forEach((pair, j) => {
        expect(flightAt(pair, j, n, 0, 40)).toMatchObject({ x: pair.from.x, y: pair.from.y });
        expect(flightAt(pair, j, n, 1, 40)).toMatchObject({ x: pair.to.x, y: pair.to.y });
      });
    },
  );
});

describe("regrouping the atoms", () => {
  it("is refused until it balances; then the atoms fly across and back, telling each end", () => {
    const { b, told, read } = board();
    b.input("", "regroup", {});
    b.runUntilIdle();
    expect(read().regrouped).toBe(0);
    b.send("", "setCoefficient", { side: R, index: 0, coefficient: 2 });
    b.send("", "setCoefficient", { side: P, index: 0, coefficient: 2 });
    b.runUntilIdle();
    const at = b.now;
    b.send("", "regroup", {});
    b.advanceTo(at + SECONDS_TO_REGROUP / 2);
    expect(read().regrouped).toBeCloseTo(0.5, 5);
    b.runUntilIdle();
    expect(read().regrouped).toBe(1);
    expect(told.at(-1)?.signal).toBe("regrouped");
    b.send("", "ungroup", {});
    b.runUntilIdle();
    expect(read().regrouped).toBe(0);
    expect(told.at(-1)?.signal).toBe("ungrouped");
  });

  it("a coefficient changed puts the atoms back in their own molecules", () => {
    const { b, read } = board({
      reactants: [
        { formula: "H2", coefficient: 2 },
        { formula: "O2", coefficient: 1 },
      ],
      products: [{ formula: "H2O", coefficient: 2 }],
    });
    b.send("", "regroup", {});
    b.runUntilIdle();
    b.input("", "step", { side: P, index: 0, by: 1 });
    expect(read().regrouped).toBe(0);
    expect(read().isBalanced).toBe(false);
  });
});

describe("molecules, drawn from their formulae", () => {
  it("water is bent, carbon dioxide a line, methane a cross, Fe₃O₄ a cluster", () => {
    const water = shapeOf("H2O").atoms;
    expect(water.map((a) => a.element)).toEqual(["O", "H", "H"]);
    // Both hydrogens below the oxygen, one each side.
    expect(water[1]?.y).toBeGreaterThan(water[0]?.y ?? 0);
    expect(Math.sign(water[1]?.x ?? 0)).toBe(-Math.sign(water[2]?.x ?? 0));
    const co2 = shapeOf("CO2").atoms;
    expect(co2.every((a) => Math.abs(a.y) < 1e-9)).toBe(true);
    expect(shapeOf("CH4").atoms).toHaveLength(5);
    expect(
      shapeOf("Fe3O4")
        .atoms.map((a) => a.element)
        .sort(),
    ).toEqual(["Fe", "Fe", "Fe", "O", "O", "O", "O"].sort());
  });

  it("a coefficient of n draws n copies, every copy all its atoms", () => {
    const p = pictureOf(
      { reactants: [{ formula: "H2", coefficient: 3 }, ...one("O2")], products: one("H2O") },
      360,
    );
    expect(p.columns[0]?.copies).toHaveLength(3);
    expect(sideAtoms(p, R)).toHaveLength(3 * 2 + 2);
  });
});

describe("what the student sees", () => {
  const seen = (given: Readonly<Record<string, unknown>>) => {
    const b = new Board(equationBalance, given as never);
    b.runUntilIdle();
    return describeView(equationBalanceProp, b.read() as unknown as PropView);
  };

  it("the equation, the verdict, each molecule, each element's tally, and the + and −", () => {
    const d = seen(WATER);
    const at = (id: string) => d.elements.find((e) => e.id === id);
    expect(at("equation")?.value).toBe("H₂ + O₂ → H₂O");
    expect(at("verdict")).toMatchObject({ value: false, words: "Not balanced" });
    expect(at("products:0")?.value).toEqual({ formula: "H2O", coefficient: 1 });
    expect(at("tally:O")?.value).toEqual({ left: 2, right: 1 });
    expect(at("step:reactants0-more")?.does).toBe("step");
    expect(at("step:reactants0-less")?.isOff).toBe(true);
    expect(at("regroup")?.isOff).toBe(true);
    expect(d.summary).toBe("H₂ + O₂ → H₂O: not balanced (O 2 vs 1)");
  });

  it("every input says what it does, and every student action has one", () => {
    expect(checkProp(equationBalanceProp, [WATER, METHANE])).toEqual([]);
  });
});

describe("a row's colour, its sign and its numbers are one reading", () => {
  /** Each tally row as drawn: its class, its sign, its two numbers; and the chip. */
  const drawn = (b: Board) => {
    const html = renderToString(
      h(EquationBalanceView, {
        view: b.read() as never,
        width: 360,
        locale: "en",
        call: () => undefined,
        signal: () => undefined,
      }),
    );
    const rows = [
      ...html.matchAll(
        /class="eb-row (is-equal|is-off)"[\s\S]*?<b>(\d+)<\/b>[\s\S]*?eb-sign">([=≠])<[\s\S]*?<b>(\d+)<\/b>/g,
      ),
    ].map((m) => ({
      isGreen: m[1] === "is-equal",
      sign: m[3],
      left: Number(m[2]),
      right: Number(m[4]),
    }));
    const isChipGreen = /class="eb-verdict is-balanced"/.test(html);
    return { rows, isChipGreen };
  };
  const agrees = (b: Board) => {
    const { rows, isChipGreen } = drawn(b);
    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.isGreen).toBe(row.left === row.right);
      expect(row.sign).toBe(row.left === row.right ? "=" : "≠");
    }
    expect(isChipGreen).toBe(rows.every((row) => row.isGreen));
  };

  it("at every moment of both pops of the water story", () => {
    const { b } = board();
    for (const [side, coefficient] of [
      [P, 2],
      [R, 2],
    ] as const) {
      const at = b.now;
      b.send("", "setCoefficient", { side, index: 0, coefficient });
      for (const dt of [0, 0.01, 0.05, 0.2, 0.4, 0.54, 0.6]) {
        b.advanceTo(at + dt);
        agrees(b);
      }
    }
    expect(drawn(b).isChipGreen).toBe(true);
  });
});
