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
  BalancerAction,
  BalancerDerived,
  BalancerSignal,
  type BalancerState,
  EquationSide,
  equationBalancer,
  equationState,
  equationText,
  isEquationBalanced,
} from "./balancer";
import { BalancerView } from "./balancer-view";
import {
  BENCH,
  BenchAction,
  BenchDerived,
  BenchKind,
  type BenchState,
  ReactionSign,
  Temperature,
  reactionBench,
} from "./bench";
import { BenchView } from "./bench-view";
import {
  ElectrolysisAction,
  type ElectrolysisState,
  Tube,
  candleResult,
  electrolysisCell,
  hydrogenMl,
  oxygenMl,
} from "./electrolysis";
import { ElectrolysisView } from "./electrolysis-view";
import { EQUATIONS, EQUATION_NAMES, type EquationName } from "./equations";
import {
  MAX_COEFFICIENT,
  atomsOf,
  balancingCoefficients,
  isBalanced,
  prettyFormula,
  tallyOf,
} from "./formula";
import { SWAPS, SwapAction, SwapKind, type SwapState, particleSwap } from "./particles";
import { ParticlesView } from "./particles-view";
import { ChemistrySceneKind, chemistryScene } from "./scene";
import { ChemistrySceneView } from "./scene-view";

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

describe("formulae", () => {
  it("count atoms, brackets and all", () => {
    expect(atomsOf("H2O")).toEqual({ H: 2, O: 1 });
    expect(atomsOf("Fe3O4")).toEqual({ Fe: 3, O: 4 });
    expect(atomsOf("Ca(OH)2")).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(atomsOf("Pb(NO3)2")).toEqual({ Pb: 1, N: 2, O: 6 });
    expect(atomsOf("Al2(SO4)3")).toEqual({ Al: 2, S: 3, O: 12 });
    expect(atomsOf("C6H12O6")).toEqual({ C: 6, H: 12, O: 6 });
    expect(atomsOf("CH3OH")).toEqual({ C: 1, H: 4, O: 1 });
  });
  it("refuse what isn't a formula", () => {
    for (const bad of ["", "h2o", "H2O)", "(H2O", "2H2O", "H1", "H2 O"])
      expect(() => atomsOf(bad)).toThrow();
  });
  it("write subscripts", () => {
    expect(prettyFormula("H2SO4")).toBe("H₂SO₄");
  });
  it("tally a side with its coefficients", () => {
    expect(tallyOf([{ formula: "H2O", coefficient: 4 }])).toEqual({ H: 8, O: 4 });
  });
});

/** The coefficients the book writes for each equation, left then right. */
const BOOK: Partial<Record<EquationName, number[]>> = {
  magnesiumBurns: [2, 1, 2],
  zincSulphuricAcid: [1, 1, 1, 1],
  ironSteam: [3, 4, 1, 4],
  hydrogenChlorine: [1, 1, 2],
  bariumChlorideAluminiumSulphate: [3, 1, 3, 2],
  sodiumWater: [2, 2, 2, 1],
  bariumChlorideSodiumSulphate: [1, 1, 1, 2],
  sodiumHydroxideHydrochloricAcid: [1, 1, 1, 1],
  quickLimeWater: [1, 1, 1],
  whitewashSets: [1, 1, 1, 1],
  coalBurns: [1, 1, 1],
  waterFormation: [2, 1, 2],
  methaneBurns: [1, 2, 1, 2],
  respiration: [1, 6, 6, 6],
  ferrousSulphateHeat: [2, 1, 1, 1],
  limestoneHeat: [1, 1, 1],
  leadNitrateHeat: [2, 2, 4, 1],
  electrolysisOfWater: [2, 2, 1],
  silverChlorideLight: [2, 2, 1],
  silverBromideLight: [2, 2, 1],
  ironCopperSulphate: [1, 1, 1, 1],
  zincCopperSulphate: [1, 1, 1, 1],
  leadCopperChloride: [1, 1, 1, 1],
  sodiumSulphateBariumChloride: [1, 1, 1, 2],
  leadNitratePotassiumIodide: [1, 2, 1, 2],
  copperHeated: [2, 1, 2],
  copperOxideHydrogen: [1, 1, 1, 1],
  zincOxideCarbon: [1, 1, 1, 1],
  manganeseDioxideHydrochloricAcid: [1, 4, 1, 2, 1],
  sodiumBurns: [4, 1, 2],
  leadOxideCarbon: [2, 1, 2, 1],
  thermite: [1, 2, 1, 2],
  ironHydrochloricAcid: [1, 2, 1, 1],
  ammonia: [3, 1, 2],
  hydrogenSulphideBurns: [2, 3, 2, 2],
  potassiumWater: [2, 2, 2, 1],
  nitricAcidSlakedLime: [2, 1, 1, 2],
  sodiumHydroxideSulphuricAcid: [2, 1, 1, 2],
  sodiumChlorideSilverNitrate: [1, 1, 1, 1],
  bariumChlorideSulphuricAcid: [1, 1, 1, 2],
  zincSilverNitrate: [1, 2, 1, 2],
  aluminiumCopperChloride: [2, 3, 2, 3],
  bariumChloridePotassiumSulphate: [1, 1, 1, 2],
  potassiumBromideBariumIodide: [2, 1, 2, 1],
  zincCarbonateHeat: [1, 1, 1],
  magnesiumHydrochloricAcid: [1, 2, 1, 1],
  copperSilverNitrate: [1, 2, 1, 2],
  methanol: [1, 2, 1],
};

describe("the chapter's equations", () => {
  it.each(EQUATION_NAMES)("%s: the book's coefficients balance it", (name) => {
    const eq = EQUATIONS[name];
    const book = BOOK[name];
    if (book === undefined) return; // photosynthesis keeps water on both sides
    const left = eq.left.map((sp, i) => ({ formula: sp.formula, coefficient: book[i] as number }));
    const right = eq.right.map((sp, i) => ({
      formula: sp.formula,
      coefficient: book[eq.left.length + i] as number,
    }));
    expect(isBalanced(left, right)).toBe(true);
  });
  it.each(EQUATION_NAMES)("%s: the solver finds the smallest balancing coefficients", (name) => {
    const eq = EQUATIONS[name];
    const found = balancingCoefficients(
      eq.left.map((sp) => sp.formula),
      eq.right.map((sp) => sp.formula),
    );
    expect(found).not.toBeNull();
    const book = BOOK[name];
    if (book !== undefined) expect(found).toEqual(book);
  });
  it("every skeletal equation that isn't already balanced starts unbalanced", () => {
    expect(isEquationBalanced(equationState("ironSteam"))).toBe(false);
    expect(isEquationBalanced(equationState("zincSulphuricAcid"))).toBe(true);
    expect(isEquationBalanced(equationState("ironSteam", { balanced: true }))).toBe(true);
  });
});

describe("equation balancer", () => {
  const def = asAnyProp(equationBalancer);
  const start = equationState("ironSteam");
  const derived = (s: BalancerState) => viewOf(def, s) as Record<string, unknown>;

  it("counts atoms on both sides", () => {
    expect(derived(start)[BalancerDerived.Tally]).toEqual([
      { element: "Fe", left: 1, right: 3 },
      { element: "H", left: 2, right: 2 },
      { element: "O", left: 1, right: 4 },
    ]);
    expect(derived(start)[BalancerDerived.Solution]).toEqual({ left: [3, 4], right: [1, 4] });
  });

  it("balances step by step as NCERT does, announcing it once balanced", () => {
    let s = start;
    s = run(def, s, BalancerAction.SetCoefficient, {
      side: EquationSide.Left,
      index: 1,
      value: 4,
    }).state;
    s = run(def, s, BalancerAction.SetCoefficient, {
      side: EquationSide.Right,
      index: 1,
      value: 4,
    }).state;
    expect(derived(s)[BalancerDerived.IsBalanced]).toBe(false);
    const last = run(def, s, BalancerAction.SetCoefficient, {
      side: EquationSide.Left,
      index: 0,
      value: 3,
    });
    expect(derived(last.state)[BalancerDerived.IsBalanced]).toBe(true);
    expect(last.emit.map((e) => e.signal)).toContain(BalancerSignal.Balanced);
    expect(equationText(last.state)).toBe("3Fe + 4H₂O → Fe₃O₄ + 4H₂");
  });

  it("steps stay between 1 and MAX_COEFFICIENT", () => {
    const down = run(def, start, BalancerAction.Step, {
      side: EquationSide.Left,
      index: 0,
      by: -1,
    });
    expect(down.state.leftCoefficients[0]).toBe(1);
    let s = start;
    for (let i = 0; i < 20; i++)
      s = run(def, s, BalancerAction.Step, { side: EquationSide.Right, index: 0, by: 1 }).state;
    expect(s.rightCoefficients[0]).toBe(MAX_COEFFICIENT);
  });

  it("refuses a formula it can't read and a missing coefficient", () => {
    expect(def.state.safeParse({ ...start, left: [{ formula: "water" }] }).success).toBe(false);
    expect(def.invariant?.({ ...start, leftCoefficients: [1] })).toBeDefined();
  });

  it("draws in both languages without overflowing", () => {
    const s = {
      ...equationState("manganeseDioxideHydrochloricAcid"),
      showMolecules: true,
      showStates: true,
    };
    for (const locale of ["en", "hi"] as const) {
      const html = renderToString(
        <BalancerView
          view={viewOf(def, s)}
          width={300}
          locale={locale}
          call={() => undefined}
          signal={() => undefined}
        />,
      );
      expect(html).toContain("MnO");
      expect(html).toContain(locale === "hi" ? "तत्व" : "Element");
    }
    expect(observationOf(def, start).summary).toContain("not balanced");
  });
});

describe("reaction bench", () => {
  const def = asAnyProp(reactionBench);
  const start: BenchState = { ...reactionBench.defaults, showThermometer: true };
  it.each(Object.values(BenchKind))("%s plays and shows its signs", (kind) => {
    const s = { ...start, kind };
    expect((viewOf(def, s) as Record<string, unknown>)[BenchDerived.Signs]).toEqual([]);
    const played = run(def, s, BenchAction.Start, {}).state;
    const signs = (viewOf(def, played) as Record<string, unknown>)[BenchDerived.Signs] as string[];
    expect(signs.length).toBeGreaterThan(0);
    const t = BENCH[kind].temperature;
    expect(signs.includes(ReactionSign.ChangeInTemperature)).toBe(t !== Temperature.Same);
    for (const locale of ["en", "hi"] as const) {
      const html = renderToString(
        <BenchView
          view={viewOf(def, played)}
          width={320}
          locale={locale}
          call={() => undefined}
          signal={() => undefined}
        />,
      );
      expect(html).toContain("is-started");
    }
    expect(run(def, played, BenchAction.Reset, {}).state.isStarted).toBe(false);
  });
  it("knows quick lime gets hot and barium hydroxide gets cold", () => {
    expect(BENCH[BenchKind.QuickLime].temperature).toBe(Temperature.Rises);
    expect(BENCH[BenchKind.BariumHydroxideCold].temperature).toBe(Temperature.Falls);
  });
});

describe("electrolysis", () => {
  const def = asAnyProp(electrolysisCell);
  const full: ElectrolysisState = { ...electrolysisCell.defaults, progress: 1 };
  it("collects twice as much gas at the cathode", () => {
    for (const progress of [0, 0.25, 0.5, 1]) {
      const s = { ...full, progress };
      expect(hydrogenMl(s)).toBeCloseTo(2 * oxygenMl(s), 5);
    }
  });
  it("switching on runs until the tube is full", () => {
    const result = prepareAction(def, electrolysisCell.defaults, ElectrolysisAction.Switch, {
      on: true,
    });
    expect(result.isOk && result.effect.kind).toBe(EffectKind.Seq);
  });
  it("the candle pops at hydrogen and burns brighter in oxygen", () => {
    expect(candleResult(full, Tube.Cathode)).toBe("pop");
    expect(candleResult(full, Tube.Anode)).toBe("brighter");
    expect(candleResult({ progress: 0 }, Tube.Anode)).toBe("nothing");
    const tested = run(def, full, ElectrolysisAction.TestGas, { tube: Tube.Cathode }).state;
    expect(tested.tested).toBe(Tube.Cathode);
    const html = renderToString(
      <ElectrolysisView
        view={viewOf(def, { ...tested, showGasNames: true })}
        width={320}
        locale="hi"
        call={() => undefined}
        signal={() => undefined}
      />,
    );
    expect(html).toContain("हाइड्रोजन");
  });
});

describe("particle swap", () => {
  const def = asAnyProp(particleSwap);
  it.each(Object.values(SwapKind))("%s keeps every atom and steps round", (kind) => {
    const info = SWAPS[kind];
    for (const particle of info.particles) expect(particle.at).toHaveLength(3);
    let s: SwapState = { ...particleSwap.defaults, kind };
    const steps: number[] = [];
    for (let i = 0; i < 3; i++) {
      s = run(def, s, SwapAction.Next, {}).state;
      steps.push(s.step);
    }
    expect(steps).toEqual([1, 2, 0]);
    const html = renderToString(
      <ParticlesView
        view={viewOf(def, { ...s, step: 2 })}
        width={320}
        locale="en"
        call={() => undefined}
        signal={() => undefined}
      />,
    );
    expect(html).toContain("ps-particle");
  });
  it("its particles match the equation's atoms", () => {
    // Fe + CuSO4: one Fe, one Cu, one sulphate on both sides.
    expect(SWAPS[SwapKind.Displacement].particles.map((p) => p.label).sort()).toEqual([
      "Cu",
      "Fe",
      "SO₄",
    ]);
    // 2H2 + O2 → 2H2O: 4 H and 2 O.
    const water = SWAPS[SwapKind.WaterFormation].particles.map((p) => p.label);
    expect(water.filter((l) => l === "H")).toHaveLength(4);
    expect(water.filter((l) => l === "O")).toHaveLength(2);
  });
});

describe("chemistry scenes", () => {
  const def = asAnyProp(chemistryScene);
  it.each(Object.values(ChemistrySceneKind))("%s draws and describes itself", (scene) => {
    const html = renderToString(
      <ChemistrySceneView
        view={viewOf(def, { scene })}
        width={320}
        locale="en"
        call={() => undefined}
        signal={() => undefined}
      />,
    );
    expect(html).toContain("cs-svg");
    expect(observationOf(def, { scene }).summary.length).toBeGreaterThan(40);
  });
});
