import {
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { JSX } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  ACID_BENCH,
  AcidBenchAction,
  AcidBenchDerived,
  AcidBenchKind,
  AcidBenchSignal,
  type AcidBenchState,
  acidBench,
  stepsOf,
} from "./acid-bench";
import { AcidBenchView } from "./acid-bench-view";
import {
  CONDUCT_SOLUTIONS,
  ConductAction,
  type ConductState,
  brightnessOf,
  conductivityTester,
  hasIons,
} from "./acid-conduct";
import { ConductivityView } from "./acid-conduct-view";
import {
  IndicatorId,
  Nature,
  SUBSTANCES,
  SubstanceId,
  natureOf,
  natureOfPh,
  responseOf,
  strengthOfPh,
  subscripted,
} from "./acid-data";
import {
  IndicatorAction,
  IndicatorDerived,
  IndicatorSignal,
  type IndicatorState,
  acidIndicator,
  latestTest,
} from "./acid-indicator";
import { AcidIndicatorView } from "./acid-indicator-view";
import {
  NeutraliseAction,
  NeutraliseSignal,
  type NeutraliseState,
  colourOf,
  isNeutral,
  neutraliser,
  phOf,
} from "./acid-neutralise";
import { NeutraliserView } from "./acid-neutralise-view";
import { AcidSceneKind, acidsScene } from "./acid-scene";
import { AcidSceneView } from "./acid-scene-view";
import { LifeBand, PhAction, PhDerived, type PhState, hydrogenVsWater, phScale } from "./ph-scale";
import { PhScaleView } from "./ph-scale-view";
import {
  PRODUCTS,
  Product,
  Route,
  SaltFactoryAction,
  type SaltFactoryState,
  saltFactory,
  shownProducts,
} from "./salt-factory";
import { SaltFactoryView } from "./salt-factory-view";
import {
  Cation,
  SaltFamilyAction,
  type SaltFamilyState,
  SaltId,
  familyOf,
  saltFamily,
  saltNature,
} from "./salt-family";
import { SaltFamilyView } from "./salt-family-view";
import { range } from "./words";

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
  return { state: next.state as S, emit: result.effect.emit.map((e) => e.signal) };
}

type View = (props: {
  view: Record<string, unknown>;
  width: number;
  locale: "en" | "hi";
  call: () => undefined;
  signal: () => undefined;
}) => JSX.Element;

/** Draws a view at phone widths in both languages and checks nothing is missing or broken. */
function drawsCleanly(
  View: View,
  def: ReturnType<typeof asAnyProp>,
  state: Record<string, unknown>,
  hasWords = true,
) {
  for (const width of [300, 340, 420])
    for (const locale of ["en", "hi"] as const) {
      const html = renderToString(
        <View
          view={viewOf(def, state) as Record<string, unknown>}
          width={width}
          locale={locale}
          call={() => undefined}
          signal={() => undefined}
        />,
      );
      expect(html).not.toMatch(/\bNaN\b|undefined|\[object Object\]/);
      if (hasWords && locale === "hi") expect(html).toMatch(/[ऀ-ॿ]/);
    }
}

describe("acids and bases: the substances and indicators", () => {
  it("knows which of Table 2.1's solutions are acids and which are bases", () => {
    for (const acid of [
      SubstanceId.HydrochloricAcid,
      SubstanceId.SulphuricAcid,
      SubstanceId.NitricAcid,
      SubstanceId.AceticAcid,
    ])
      expect(natureOf(acid)).toBe(Nature.Acidic);
    for (const base of [
      SubstanceId.SodiumHydroxide,
      SubstanceId.CalciumHydroxide,
      SubstanceId.PotassiumHydroxide,
      SubstanceId.MagnesiumHydroxide,
      SubstanceId.AmmoniumHydroxide,
    ])
      expect(natureOf(base)).toBe(Nature.Basic);
    expect(natureOf(SubstanceId.DistilledWater)).toBe(Nature.Neutral);
  });

  it("litmus: acids turn blue litmus red, bases turn red litmus blue, water changes neither", () => {
    const hcl = SUBSTANCES.hydrochloricAcid.pH;
    const naoh = SUBSTANCES.sodiumHydroxide.pH;
    const water = SUBSTANCES.distilledWater.pH;
    expect(responseOf(IndicatorId.BlueLitmus, hcl)).toEqual({
      kind: "colour",
      hue: "red",
      changed: true,
    });
    expect(responseOf(IndicatorId.RedLitmus, hcl)).toEqual({
      kind: "colour",
      hue: "red",
      changed: false,
    });
    expect(responseOf(IndicatorId.RedLitmus, naoh)).toEqual({
      kind: "colour",
      hue: "blue",
      changed: true,
    });
    expect(responseOf(IndicatorId.BlueLitmus, naoh)).toEqual({
      kind: "colour",
      hue: "blue",
      changed: false,
    });
    expect(responseOf(IndicatorId.RedLitmus, water)).toMatchObject({ changed: false });
    expect(responseOf(IndicatorId.BlueLitmus, water)).toMatchObject({ changed: false });
    expect(responseOf(IndicatorId.LitmusSolution, water)).toMatchObject({ hue: "purple" });
  });

  it("phenolphthalein is pink only in a base; methyl orange is red in acid and yellow in base", () => {
    expect(responseOf(IndicatorId.Phenolphthalein, 13)).toMatchObject({ hue: "pink" });
    expect(responseOf(IndicatorId.Phenolphthalein, 1)).toMatchObject({ hue: "colourless" });
    expect(responseOf(IndicatorId.Phenolphthalein, 7)).toMatchObject({ hue: "colourless" });
    expect(responseOf(IndicatorId.MethylOrange, 1)).toMatchObject({ hue: "red" });
    expect(responseOf(IndicatorId.MethylOrange, 13)).toMatchObject({ hue: "yellow" });
  });

  it("turmeric goes reddish brown with soap (the curry stain) and the smell indicators lose their smell in a base", () => {
    expect(responseOf(IndicatorId.Turmeric, SUBSTANCES.soapSolution.pH)).toMatchObject({
      hue: "reddishBrown",
    });
    expect(responseOf(IndicatorId.Turmeric, SUBSTANCES.lemonJuice.pH)).toMatchObject({
      hue: "yellow",
    });
    for (const nose of [IndicatorId.Onion, IndicatorId.Vanilla, IndicatorId.Clove]) {
      expect(responseOf(nose, 13)).toEqual({ kind: "smell", isSmelt: false });
      expect(responseOf(nose, 1)).toEqual({ kind: "smell", isSmelt: true });
    }
  });

  it("names strength the way Fig 2.6 does, and writes subscripts", () => {
    expect(strengthOfPh(1).en).toBe("strongly acidic");
    expect(strengthOfPh(5).en).toBe("weakly acidic");
    expect(strengthOfPh(7).en).toBe("neutral");
    expect(strengthOfPh(9).en).toBe("weakly basic");
    expect(strengthOfPh(13).en).toBe("strongly basic");
    expect(subscripted("H2SO4")).toBe("H₂SO₄");
    expect(subscripted("2NaOH")).toBe("2NaOH");
    expect(subscripted("Na2CO3.10H2O")).toBe("Na₂CO₃.10H₂O");
    expect(subscripted("Ca(OH)2")).toBe("Ca(OH)₂");
  });
});

describe("acidIndicator", () => {
  const def = asAnyProp(acidIndicator);
  const start = {
    ...acidIndicator.defaults,
    samples: [SubstanceId.HydrochloricAcid, SubstanceId.SodiumHydroxide],
    indicators: [IndicatorId.RedLitmus, IndicatorId.BlueLitmus],
  } as IndicatorState;

  it("remembers each test, and says so when every indicator has met every sample", () => {
    let s = start;
    const signals: string[] = [];
    for (const indicator of [IndicatorId.RedLitmus, IndicatorId.BlueLitmus]) {
      s = run(def, s, IndicatorAction.Choose, { indicator }).state;
      for (const sample of s.samples) {
        const r = run(def, s, IndicatorAction.Test, { sample });
        s = r.state;
        signals.push(...r.emit);
      }
    }
    expect(s.tests).toHaveLength(4);
    expect(signals.filter((x) => x === IndicatorSignal.Tested)).toHaveLength(4);
    expect(signals.filter((x) => x === IndicatorSignal.AllTested)).toHaveLength(1);
    expect((viewOf(def, s) as Record<string, unknown>)[IndicatorDerived.IsTableFull]).toBe(true);
    expect(latestTest(s, SubstanceId.HydrochloricAcid)).toBe(IndicatorId.BlueLitmus);
  });

  it("testing the same pair again doesn't add a row", () => {
    let s = run(def, start, IndicatorAction.Test, { sample: SubstanceId.HydrochloricAcid }).state;
    s = run(def, s, IndicatorAction.Test, { sample: SubstanceId.HydrochloricAcid }).state;
    expect(s.tests).toHaveLength(1);
  });

  it("refuses an indicator that isn't on offer and a sample that isn't on the bench", () => {
    expect(
      run(def, start, IndicatorAction.Choose, { indicator: IndicatorId.Turmeric }).state.chosen,
    ).toBe(IndicatorId.RedLitmus);
    expect(
      run(def, start, IndicatorAction.Test, { sample: SubstanceId.Coffee }).state.tests,
    ).toHaveLength(0);
  });

  it("draws every indicator on every kind of sample, with its table", () => {
    const all = Object.values(IndicatorId);
    let s = {
      ...start,
      samples: [
        SubstanceId.HydrochloricAcid,
        SubstanceId.MagnesiumHydroxide,
        SubstanceId.DistilledWater,
        SubstanceId.SoapSolution,
        SubstanceId.LemonJuice,
        SubstanceId.AmmoniumHydroxide,
      ],
      indicators: all.slice(0, 8),
      chosen: all[0] ?? IndicatorId.RedLitmus,
      showTable: true,
      showNature: true,
    } as IndicatorState;
    drawsCleanly(AcidIndicatorView as unknown as View, def, s);
    for (const indicator of all.slice(0, 8)) {
      s = run(def, s, IndicatorAction.Choose, { indicator }).state;
      for (const sample of s.samples) s = run(def, s, IndicatorAction.Test, { sample }).state;
      drawsCleanly(AcidIndicatorView as unknown as View, def, s);
    }
    const smells = {
      ...s,
      indicators: [IndicatorId.Onion, IndicatorId.Vanilla, IndicatorId.Clove],
      chosen: IndicatorId.Onion,
      tests: [],
    };
    let t = smells as IndicatorState;
    for (const sample of t.samples) t = run(def, t, IndicatorAction.Test, { sample }).state;
    drawsCleanly(AcidIndicatorView as unknown as View, def, t);
    expect(observationOf(def, t).summary).toContain("smell");
  });
});

describe("phScale", () => {
  const def = asAnyProp(phScale);
  const start = { ...phScale.defaults } as PhState;

  it("reads a picked substance, or the probe", () => {
    const picked = run(def, start, PhAction.Pick, { substance: SubstanceId.LemonJuice }).state;
    expect((viewOf(def, picked) as Record<string, unknown>)[PhDerived.PH]).toBe(2.2);
    expect((viewOf(def, picked) as Record<string, unknown>)[PhDerived.Nature]).toBe(Nature.Acidic);
    const probed = run(def, { ...picked, canProbe: true }, PhAction.Probe, { pH: 11.04 }).state;
    expect(probed.picked).toBeNull();
    expect((viewOf(def, probed) as Record<string, unknown>)[PhDerived.PH]).toBe(11);
  });

  it("each step down the scale is ten times more hydrogen ions (in-text Q1: pH 6 has more than pH 8)", () => {
    expect(hydrogenVsWater(7)).toBe(1);
    expect(hydrogenVsWater(6)).toBeCloseTo(10);
    expect(hydrogenVsWater(8)).toBeCloseTo(0.1);
    expect(hydrogenVsWater(6) / hydrogenVsWater(8)).toBeCloseTo(100);
  });

  it("Exercise 9: orders A–E by hydrogen ions", () => {
    const pHs = { A: 4, B: 1, C: 11, D: 7, E: 9 };
    const order = Object.entries(pHs)
      .sort((a, b) => hydrogenVsWater(a[1]) - hydrogenVsWater(b[1]))
      .map(([k]) => k)
      .join("");
    expect(order).toBe("CEDAB");
    expect(natureOfPh(pHs.D)).toBe(Nature.Neutral);
  });

  it("only picks what is on offer", () => {
    expect(
      run(def, start, PhAction.Pick, { substance: SubstanceId.Coffee }).state.picked,
    ).toBeNull();
  });

  it("draws with ions, every life band, a probe and every Table 2.2 substance", () => {
    const table22 = [
      SubstanceId.SalivaBeforeMeal,
      SubstanceId.SalivaAfterMeal,
      SubstanceId.LemonJuice,
      SubstanceId.AeratedDrink,
      SubstanceId.CarrotJuice,
      SubstanceId.Coffee,
      SubstanceId.TomatoJuice,
      SubstanceId.TapWater,
      SubstanceId.SodiumHydroxide,
      SubstanceId.HydrochloricAcid,
    ];
    for (const band of [null, ...Object.values(LifeBand)])
      for (const substance of table22) {
        const s = run(
          def,
          { ...start, substances: table22, band, showIons: true, canProbe: true },
          PhAction.Pick,
          {
            substance,
          },
        ).state;
        drawsCleanly(PhScaleView as unknown as View, def, s);
      }
    drawsCleanly(PhScaleView as unknown as View, def, { ...start, probe: 0, showIons: true });
    drawsCleanly(PhScaleView as unknown as View, def, { ...start, probe: 14, showRegions: false });
  });
});

describe("neutraliser", () => {
  const def = asAnyProp(neutraliser);
  const start = { ...neutraliser.defaults } as NeutraliseState;
  const addAcid = (s: NeutraliseState, times: number) => {
    let x = s;
    const signals: string[] = [];
    for (const _ of range(times)) {
      const r = run(def, x, NeutraliseAction.AddAcid, {});
      x = r.state;
      signals.push(...r.emit);
    }
    return { state: x, signals };
  };

  it("is pink with phenolphthalein in the base, and neutral exactly when the acid matches the base", () => {
    expect(colourOf(start).en).toBe("pink");
    expect(phOf(start)).toBeGreaterThan(12);
    const nine = addAcid(start, 9).state;
    expect(colourOf(nine).en).toBe("pink");
    const ten = addAcid(start, 10);
    expect(isNeutral(ten.state)).toBe(true);
    expect(phOf(ten.state)).toBe(7);
    expect(colourOf(ten.state).en).toBe("colourless");
    expect(ten.signals).toContain(NeutraliseSignal.Neutralised);
    expect(ten.signals).toContain(NeutraliseSignal.ColourChanged);
    expect(phOf(addAcid(start, 11).state)).toBeLessThan(3);
  });

  it("goes pink again when base is added back (Activity 2.6)", () => {
    const neutral = addAcid(start, 10).state;
    const back = run(def, neutral, NeutraliseAction.AddBase, {});
    expect(colourOf(back.state).en).toBe("pink");
    expect(back.emit).toContain(NeutraliseSignal.ColourChanged);
  });

  it("Exercise 3: 10 mL of base needs 8 mL of this acid, so 20 mL needs 16 mL", () => {
    const ten = { ...start, acidPerBaseMl: 0.8, baseMl: 10, startBaseMl: 10 };
    expect(isNeutral(addAcid(ten, 8).state)).toBe(true);
    const twenty = { ...ten, baseMl: 20, startBaseMl: 20 };
    expect(isNeutral(addAcid(twenty, 8).state)).toBe(false);
    expect(isNeutral(addAcid(twenty, 16).state)).toBe(true);
  });

  it("starts again", () => {
    const s = run(def, addAcid(start, 4).state, NeutraliseAction.Reset, {}).state;
    expect(s.acidMl).toBe(0);
    expect(s.baseMl).toBe(10);
  });

  it("draws with every flask indicator, before, at and after the end point", () => {
    for (const indicator of [
      "phenolphthalein",
      "litmusSolution",
      "methylOrange",
      "redCabbage",
      "universal",
    ])
      for (const acidMl of [0, 9, 10, 14])
        drawsCleanly(NeutraliserView as unknown as View, def, {
          ...start,
          indicator,
          acidMl,
          showIons: true,
        });
  });
});

describe("acidBench", () => {
  const def = asAnyProp(acidBench);

  it.each(Object.values(AcidBenchKind))(
    "%s plays its steps, says what is seen and draws",
    (kind) => {
      let s = { ...acidBench.defaults, kind, showEquation: true } as AcidBenchState;
      drawsCleanly(AcidBenchView as unknown as View, def, s);
      const n = stepsOf(kind);
      expect(n).toBeGreaterThanOrEqual(1);
      let signals: string[] = [];
      for (const _ of range(n)) {
        const r = run(def, s, AcidBenchAction.Next, {});
        s = r.state;
        signals = signals.concat(r.emit);
        drawsCleanly(AcidBenchView as unknown as View, def, s);
      }
      expect(signals.filter((x) => x === AcidBenchSignal.Stepped)).toHaveLength(n);
      expect(signals).toContain(AcidBenchSignal.Done);
      expect((viewOf(def, s) as Record<string, unknown>)[AcidBenchDerived.IsDone]).toBe(true);
      expect(run(def, s, AcidBenchAction.Next, {}).state.step).toBe(n);
      expect(observationOf(def, s).summary).toContain(ACID_BENCH[kind].steps[n - 1]?.what ?? "?");
      expect(run(def, s, AcidBenchAction.Reset, {}).state.step).toBe(0);
    },
  );

  it("refuses a step the experiment doesn't have", () => {
    const result = applyPatch(
      def,
      { ...acidBench.defaults, kind: AcidBenchKind.CopperOxideAcid },
      { step: 2 },
    );
    expect(result.isOk).toBe(false);
  });
});

describe("conductivityTester", () => {
  const def = asAnyProp(conductivityTester);
  const start = {
    ...conductivityTester.defaults,
    solutions: [...CONDUCT_SOLUTIONS].slice(0, 8),
  } as ConductState;

  it("glows for acids and alkalis, not for glucose, alcohol or distilled water (Activity 2.8, Exercise 7)", () => {
    const on = (solution: ConductState["solution"]) => brightnessOf({ solution, isOn: true });
    expect(on(SubstanceId.HydrochloricAcid)).toBe(2);
    expect(on(SubstanceId.SulphuricAcid)).toBe(2);
    expect(on(SubstanceId.SodiumHydroxide)).toBe(2);
    expect(on(SubstanceId.AceticAcid)).toBe(1);
    expect(on(SubstanceId.GlucoseSolution)).toBe(0);
    expect(on(SubstanceId.Alcohol)).toBe(0);
    expect(on(SubstanceId.DistilledWater)).toBe(0);
    expect(on(SubstanceId.RainWater)).toBeGreaterThan(0);
    expect(brightnessOf({ solution: SubstanceId.HydrochloricAcid, isOn: false })).toBe(0);
    for (const x of CONDUCT_SOLUTIONS) expect(hasIons(x)).toBe(SUBSTANCES[x].conducts > 0);
  });

  it("switches and pours, and draws every solution with its close-up", () => {
    const on = run(def, start, ConductAction.Switch, { on: true }).state;
    expect(on.isOn).toBe(true);
    for (const solution of start.solutions) {
      const s = run(def, { ...on, showIons: true }, ConductAction.Choose, { solution }).state;
      drawsCleanly(ConductivityView as unknown as View, def, s);
    }
  });
});

describe("saltFamily", () => {
  const def = asAnyProp(saltFamily);

  it("says whether a salt is neutral, acidic or basic as Section 2.4.2 does", () => {
    expect(saltNature(SaltId.SodiumChloride)).toBe(Nature.Neutral);
    expect(saltNature(SaltId.PotassiumNitrate)).toBe(Nature.Neutral);
    expect(saltNature(SaltId.AluminiumChloride)).toBe(Nature.Acidic);
    expect(saltNature(SaltId.ZincSulphate)).toBe(Nature.Acidic);
    expect(saltNature(SaltId.CopperSulphate)).toBe(Nature.Acidic);
    expect(saltNature(SaltId.AmmoniumChloride)).toBe(Nature.Acidic);
    expect(saltNature(SaltId.SodiumAcetate)).toBe(Nature.Basic);
    expect(saltNature(SaltId.SodiumCarbonate)).toBe(Nature.Basic);
    expect(saltNature(SaltId.SodiumHydrogencarbonate)).toBe(Nature.Basic);
  });

  it("lights up a family and picks a salt", () => {
    const start = {
      ...saltFamily.defaults,
      salts: [SaltId.SodiumChloride, SaltId.SodiumSulphate, SaltId.PotassiumChloride],
    } as SaltFamilyState;
    expect(familyOf(start.salts, Cation.Sodium)).toEqual([
      SaltId.SodiumChloride,
      SaltId.SodiumSulphate,
    ]);
    const lit = run(def, start, SaltFamilyAction.Highlight, { ion: "chloride" });
    expect(lit.state.highlight).toBe("chloride");
    expect(
      run(def, lit.state, SaltFamilyAction.Highlight, { ion: "chloride" }).state.highlight,
    ).toBeNull();
    const picked = run(def, start, SaltFamilyAction.Pick, { salt: SaltId.SodiumChloride });
    expect(picked.state.picked).toBe(SaltId.SodiumChloride);
    expect(
      run(def, start, SaltFamilyAction.Pick, { salt: SaltId.ZincSulphate }).state.picked,
    ).toBeNull();
  });

  it("draws Activities 2.13 and 2.14's salts, with every card", () => {
    const all = Object.values(SaltId);
    for (const salt of all)
      drawsCleanly(SaltFamilyView as unknown as View, def, {
        ...saltFamily.defaults,
        salts: all,
        picked: salt,
        highlight: "sodium",
        showNature: true,
      });
  });
});

describe("saltFactory", () => {
  const def = asAnyProp(saltFactory);
  const start = { ...saltFactory.defaults } as SaltFactoryState;

  it("shows only the routes the lesson has reached", () => {
    expect(shownProducts({ routes: [Route.ChlorAlkali] })).toEqual([
      Product.SodiumHydroxide,
      Product.Chlorine,
      Product.Hydrogen,
    ]);
    const only = { ...start, routes: [Route.BakingSoda] };
    expect(
      run(def, only, SaltFactoryAction.Pick, { product: Product.Chlorine }).state.picked,
    ).toBeNull();
    expect(
      run(def, only, SaltFactoryAction.Pick, { product: Product.BakingSoda }).state.picked,
    ).toBe(Product.BakingSoda);
  });

  it("gives the chlor-alkali equation for all three of its products", () => {
    for (const p of [Product.SodiumHydroxide, Product.Chlorine, Product.Hydrogen])
      expect(PRODUCTS[p].equation).toBe("2NaCl + 2H2O → 2NaOH + Cl2 + H2");
  });

  it("draws every product's card", () => {
    drawsCleanly(SaltFactoryView as unknown as View, def, start);
    for (const product of Object.values(Product))
      drawsCleanly(SaltFactoryView as unknown as View, def, { ...start, picked: product });
    drawsCleanly(SaltFactoryView as unknown as View, def, {
      ...start,
      routes: [Route.ChlorAlkali],
    });
  });
});

describe("acidsScene", () => {
  const def = asAnyProp(acidsScene);
  it.each(Object.values(AcidSceneKind))("%s draws and describes itself", (scene) => {
    drawsCleanly(AcidSceneView as unknown as View, def, { scene }, false);
    expect(observationOf(def, { scene }).summary.length).toBeGreaterThan(40);
  });
});
