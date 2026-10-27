import type { PropViewProps } from "@chalk/player";
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
  ExtractMetal,
  FlowAction,
  type FlowState,
  Method,
  OreKind,
  extractionFlow,
  methodOf,
  pathOf,
} from "./extraction-flow";
import { ExtractionFlowView } from "./extraction-flow-view";
import { anodeLeft, cathodeGained, refiningCell } from "./extraction-refining";
import { RefiningCellView } from "./extraction-refining-view";
import { thermitWeld } from "./extraction-thermit";
import { ThermitWeldView } from "./extraction-thermit-view";
import {
  BOND_STEPS,
  BondAction,
  type BondState,
  COMPOUNDS,
  IonicCompound,
  chargeOf,
  ionShellsOf,
  ionText,
  ionicBond,
  isChargeBalanced,
  shellsOf,
} from "./ionic-bond";
import { IonicBondView } from "./ionic-bond-view";
import {
  SALT_FORMS,
  SaltForm,
  TesterAction,
  type TesterState,
  dissolves,
  ionicTester,
  ionsFree,
} from "./ionic-tester";
import { IonicTesterView } from "./ionic-tester-view";
import { goldCarat, goldPercent, hardnessOf } from "./metal-carat";
import { GoldCaratView } from "./metal-carat-view";
import { MetalElement, REACTIVITY_SERIES, isAboveHydrogen, isMoreReactive } from "./metal-data";
import {
  Mark,
  PropertyAction,
  PropertySample,
  PropertySignal,
  type PropertyState,
  PropertyTest,
  SAMPLES,
  SAMPLE_ORDER,
  TEST_ORDER,
  outcomeOf,
  propertyTester,
  tableOf,
} from "./metal-properties";
import { PropertyTesterView } from "./metal-properties-view";
import {
  Intensity,
  LAB_METALS,
  type LabMetal,
  REAGENTS,
  ReactivityAction,
  ReactivitySignal,
  type ReactivityState,
  Reagent,
  SALTS,
  reactionOf,
  reactivityLab,
} from "./metal-reactivity";
import { ReactivityLabView } from "./metal-reactivity-view";
import {
  Coating,
  RustAction,
  RustMode,
  type RustState,
  RustTube,
  RustWhere,
  rustAmount,
  rustLab,
  rustWhere,
  tubeRusts,
} from "./metal-rust";
import { RustLabView } from "./metal-rust-view";
import { MetalSceneKind, metalScene } from "./metal-scene";
import { MetalSceneView } from "./metal-scene-view";

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

const defaults = <S,>(def: { defaults: unknown }) => def.defaults as S;

describe("the reactivity series (Table 3.2)", () => {
  it("runs K, Na, Ca, Mg, Al, Zn, Fe, Pb, then Cu, Hg, Ag, Au, with hydrogen between Pb and Cu", () => {
    expect(REACTIVITY_SERIES.join(" ")).toBe("K Na Ca Mg Al Zn Fe Pb Cu Hg Ag Au");
    expect(isAboveHydrogen(MetalElement.Lead)).toBe(true);
    expect(isAboveHydrogen(MetalElement.Copper)).toBe(false);
    expect(isMoreReactive(MetalElement.Zinc, MetalElement.Iron)).toBe(true);
    expect(isMoreReactive(MetalElement.Copper, MetalElement.Iron)).toBe(false);
  });
});

describe("reactions of metals", () => {
  it("in water: K and Na catch fire, Ca floats, Mg needs hot water, Al, Zn, Fe only steam, the rest nothing", () => {
    for (const m of ["K", "Na"] as LabMetal[]) {
      const o = reactionOf(m, Reagent.ColdWater);
      expect(o.isOnFire).toBe(true);
      expect(o.givesHydrogen).toBe(true);
    }
    expect(reactionOf("Ca", Reagent.ColdWater).floats).toBe(true);
    expect(reactionOf("Ca", Reagent.ColdWater).isOnFire).toBe(false);
    expect(reactionOf("Mg", Reagent.ColdWater).intensity).toBe(Intensity.None);
    expect(reactionOf("Mg", Reagent.HotWater).givesHydrogen).toBe(true);
    expect(reactionOf("Mg", Reagent.HotWater).floats).toBe(true);
    for (const m of ["Al", "Zn", "Fe"] as LabMetal[]) {
      expect(reactionOf(m, Reagent.ColdWater).intensity).toBe(Intensity.None);
      expect(reactionOf(m, Reagent.HotWater).intensity).toBe(Intensity.None);
      expect(reactionOf(m, Reagent.Steam).givesHydrogen).toBe(true);
    }
    for (const m of ["Pb", "Cu", "Ag", "Au"] as LabMetal[])
      for (const r of [Reagent.ColdWater, Reagent.HotWater, Reagent.Steam])
        expect(reactionOf(m, r).intensity).toBe(Intensity.None);
  });

  it("with dilute acid: Mg ≥ Al > Zn > Fe, copper and below nothing; hydrogen comes off exactly above hydrogen", () => {
    const i = (m: LabMetal) => reactionOf(m, Reagent.DiluteAcid).intensity ?? -1;
    expect(i("Mg")).toBeGreaterThanOrEqual(i("Al"));
    expect(i("Al")).toBeGreaterThan(i("Zn"));
    expect(i("Zn")).toBeGreaterThan(i("Fe"));
    expect(i("Fe")).toBeGreaterThan(0);
    for (const m of ["Cu", "Ag", "Au"] as LabMetal[]) expect(i(m)).toBe(0);
    for (const m of LAB_METALS) {
      const o = reactionOf(m, Reagent.DiluteAcid);
      if (o.intensity === null) continue;
      expect(o.givesHydrogen).toBe(isAboveHydrogen(m));
    }
    expect(reactionOf("Na", Reagent.DiluteAcid).intensity).toBeNull();
    expect(reactionOf("K", Reagent.DiluteAcid).intensity).toBeNull();
  });

  it("in air: silver and gold don't change, copper goes black, magnesium burns", () => {
    expect(reactionOf("Ag", Reagent.Air).intensity).toBe(Intensity.None);
    expect(reactionOf("Au", Reagent.Air).intensity).toBe(Intensity.None);
    expect(reactionOf("Cu", Reagent.Air).coat).toBe("black");
    expect(reactionOf("Mg", Reagent.Air).isOnFire).toBe(true);
  });

  it("in salt solutions: a metal displaces exactly the less reactive ones", () => {
    for (const m of LAB_METALS)
      for (const r of REAGENTS) {
        if (!(r in SALTS)) continue;
        const o = reactionOf(m, r);
        if (o.intensity === null) continue;
        const b = SALTS[r as keyof typeof SALTS].metal;
        expect(o.displaces).toBe(m !== b && isMoreReactive(m, b));
        if (o.displaces) expect(o.deposit).toBe(b);
      }
  });

  it("NCERT Activity 3.12 and Exercise 1", () => {
    expect(reactionOf("Fe", Reagent.CopperSulphate).displaces).toBe(true);
    expect(reactionOf("Cu", Reagent.IronSulphate).displaces).toBe(false);
    expect(reactionOf("Cu", Reagent.SodiumChloride).displaces).toBe(false);
    expect(reactionOf("Al", Reagent.MagnesiumChloride).displaces).toBe(false);
    expect(reactionOf("Ag", Reagent.IronSulphate).displaces).toBe(false);
    expect(reactionOf("Cu", Reagent.SilverNitrate).displaces).toBe(true);
    expect(reactionOf("Zn", Reagent.IronSulphate).displaces).toBe(true);
  });

  it("colours: iron in copper sulphate turns the blue solution pale green", () => {
    const o = reactionOf("Fe", Reagent.CopperSulphate);
    expect(o.colourBefore).toBe("blue");
    expect(o.colourAfter).toBe("paleGreen");
  });

  it("the lab's Start reports what happened, from run", () => {
    const s: ReactivityState = {
      ...defaults<ReactivityState>(reactivityLab),
      metal: "Zn",
      reagent: Reagent.IronSulphate,
    };
    const { state, emit } = run(asAnyProp(reactivityLab), s, ReactivityAction.Start, {});
    expect(state.isStarted).toBe(true);
    expect(emit[0]?.signal).toBe(ReactivitySignal.Started);
    expect(emit[0]?.payload).toMatchObject({ displaces: true });
    const back = run(asAnyProp(reactivityLab), state, ReactivityAction.ChooseMetal, {
      metal: "Cu",
    });
    expect(back.state.isStarted).toBe(false);
  });
});

describe("physical properties", () => {
  it("every metal conducts electricity; of the non-metals only graphite does", () => {
    for (const sample of SAMPLE_ORDER) {
      const glows = outcomeOf(sample, PropertyTest.Electricity).mark === Mark.Yes;
      expect(glows).toBe(SAMPLES[sample].isMetal || sample === PropertySample.Graphite);
    }
  });

  it("the exceptions NCERT lists come out", () => {
    expect(outcomeOf(PropertySample.Sodium, PropertyTest.Hardness).mark).toBe(Mark.No);
    expect(outcomeOf(PropertySample.Iodine, PropertyTest.Lustre).mark).toBe(Mark.Yes);
    expect(outcomeOf(PropertySample.Diamond, PropertyTest.Hardness).mark).toBe(Mark.Yes);
    expect(outcomeOf(PropertySample.Lead, PropertyTest.Heat).mark).toBe(Mark.Partly);
    for (const s of ["coal", "sulphur", "iodine"] as PropertySample[]) {
      expect(outcomeOf(s, PropertyTest.Malleability).mark).toBe(Mark.No);
      expect(outcomeOf(s, PropertyTest.Ductility).mark).toBe(Mark.No);
    }
  });

  it("every sample has an outcome for every test, in both languages", () => {
    for (const s of SAMPLE_ORDER)
      for (const t of TEST_ORDER) {
        const o = outcomeOf(s, t);
        expect(o.seen.en.length).toBeGreaterThan(3);
        expect(o.seen.hi.length).toBeGreaterThan(3);
      }
  });

  it("Try fills the table and says so", () => {
    const def = asAnyProp(propertyTester);
    let s = defaults<PropertyState>(propertyTester);
    s = run(def, s, PropertyAction.ChooseSample, { sample: PropertySample.Copper }).state;
    s = run(def, s, PropertyAction.ChooseTest, { test: PropertyTest.Electricity }).state;
    const tried = run(def, s, PropertyAction.Try, {});
    expect(tried.emit[0]?.signal).toBe(PropertySignal.Tried);
    expect(tried.emit[0]?.payload).toMatchObject({ mark: Mark.Yes, isMetal: true });
    const rows = tableOf(tried.state);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.marks[TEST_ORDER.indexOf(PropertyTest.Electricity)]).toBe(Mark.Yes);
    // Trying again doesn't duplicate the entry.
    expect(run(def, tried.state, PropertyAction.Try, {}).state.tried).toHaveLength(1);
  });

  it("refuses a sample that isn't offered", () => {
    const s = { ...defaults<PropertyState>(propertyTester), samples: [PropertySample.Iron] };
    expect(prepareAction(asAnyProp(propertyTester), s, PropertyAction.Try, {}).isOk).toBe(true);
    const r = run(asAnyProp(propertyTester), s, PropertyAction.ChooseSample, {
      sample: PropertySample.Gold,
    });
    expect(r.state.sample).toBe(PropertySample.Iron);
  });
});

describe("ionic bonds", () => {
  it("shells follow 2, 8, 8 (Table 3.3)", () => {
    expect(shellsOf(11)).toEqual([2, 8, 1]);
    expect(shellsOf(12)).toEqual([2, 8, 2]);
    expect(shellsOf(17)).toEqual([2, 8, 7]);
    expect(shellsOf(8)).toEqual([2, 6]);
    expect(shellsOf(19)).toEqual([2, 8, 8, 1]);
    expect(shellsOf(20)).toEqual([2, 8, 8, 2]);
    expect(shellsOf(10)).toEqual([2, 8]);
  });

  it("ions have full outer shells and the right charges", () => {
    expect(ionShellsOf("Na")).toEqual([2, 8]);
    expect(ionShellsOf("Cl")).toEqual([2, 8, 8]);
    expect(ionShellsOf("Mg")).toEqual([2, 8]);
    expect(ionShellsOf("O")).toEqual([2, 8]);
    expect(ionText("Na")).toBe("Na⁺");
    expect(ionText("Mg")).toBe("Mg²⁺");
    expect(ionText("Cl")).toBe("Cl⁻");
    expect(ionText("O")).toBe("O²⁻");
    expect(chargeOf("Ca")).toBe(2);
  });

  it("every compound's charges balance: electrons given = electrons taken", () => {
    for (const c of Object.values(IonicCompound)) expect(isChargeBalanced(c)).toBe(true);
    expect(COMPOUNDS.MgCl2.nonMetals).toBe(2);
    expect(COMPOUNDS.Na2O.metals).toBe(2);
  });

  it("steps through four pictures and back", () => {
    const def = asAnyProp(ionicBond);
    let s = defaults<BondState>(ionicBond);
    for (let i = 1; i <= BOND_STEPS; i++) {
      const r = run(def, s, BondAction.Next, {});
      expect(r.state.step).toBe(i % BOND_STEPS);
      expect(r.emit[0]?.payload).toEqual({ step: i % BOND_STEPS });
      s = r.state;
    }
  });
});

describe("ionic compounds' properties (Activity 3.13)", () => {
  it("conduct only dissolved in water or molten; dissolve in water, not kerosene", () => {
    expect(SALT_FORMS.filter(ionsFree)).toEqual([SaltForm.Water, SaltForm.Molten]);
    expect(dissolves(SaltForm.Water)).toBe(true);
    expect(dissolves(SaltForm.Kerosene)).toBe(false);
    const def = asAnyProp(ionicTester);
    const s = { ...defaults<TesterState>(ionicTester), form: SaltForm.Solid };
    const on = run(def, s, TesterAction.Switch, { on: true });
    expect(on.emit[0]?.payload).toMatchObject({ glows: false });
    const wet = run(def, { ...on.state, form: SaltForm.Water }, TesterAction.Switch, { on: true });
    expect(wet.emit[0]?.payload).toMatchObject({ glows: true });
  });
});

describe("extraction", () => {
  it("the method follows the series (Fig 3.9 and section 3.4)", () => {
    expect(methodOf(ExtractMetal.Sodium)).toBe(Method.Electrolysis);
    expect(methodOf(ExtractMetal.Aluminium)).toBe(Method.Electrolysis);
    expect(methodOf(ExtractMetal.Zinc)).toBe(Method.Carbon);
    expect(methodOf(ExtractMetal.Mercury)).toBe(Method.HeatAlone);
    expect(methodOf(ExtractMetal.Copper)).toBe(Method.HeatAlone);
    expect(methodOf(ExtractMetal.Gold)).toBe(Method.Native);
  });

  it("every path ends with refining; zinc's sulphide is roasted, its carbonate calcined", () => {
    for (const m of Object.values(ExtractMetal))
      for (const ore of Object.values(OreKind)) {
        const path = pathOf(m, ore);
        expect(path.at(-1)?.name.en).toBe("Refine it");
      }
    const roast = pathOf(ExtractMetal.Zinc, OreKind.Sulphide).map((p) => p.name.en);
    const calcine = pathOf(ExtractMetal.Zinc, OreKind.Carbonate).map((p) => p.name.en);
    expect(roast).toContain("Roasting");
    expect(calcine).toContain("Calcination");
    expect(pathOf(ExtractMetal.Zinc, OreKind.Sulphide).flatMap((p) => p.equations)).toContain(
      "ZnO + C → Zn + CO",
    );
  });

  it("Next walks the path and wraps round", () => {
    const def = asAnyProp(extractionFlow);
    let s = defaults<FlowState>(extractionFlow);
    const n = pathOf(s.metal, s.ore).length;
    for (let i = 0; i < n; i++) s = run(def, s, FlowAction.Next, {}).state;
    expect(s.step).toBe(0);
  });

  it("refining: the cathode gains exactly what the anode loses", () => {
    for (const progress of [0, 0.25, 0.5, 1])
      expect(cathodeGained({ progress }) + anodeLeft({ progress })).toBeCloseTo(1);
  });
});

describe("rusting", () => {
  it("only tube A (air and water) rusts", () => {
    expect(Object.values(RustTube).filter(tubeRusts)).toEqual([RustTube.A]);
    expect(rustAmount(0)).toBe(0);
    expect(rustAmount(7)).toBe(1);
  });

  it("a scratched coat rusts at the scratch, except zinc; stainless never rusts", () => {
    expect(rustWhere(Coating.None, false)).toBe(RustWhere.All);
    expect(rustWhere(Coating.Paint, false)).toBe(RustWhere.None);
    expect(rustWhere(Coating.Paint, true)).toBe(RustWhere.Scratch);
    expect(rustWhere(Coating.Tin, true)).toBe(RustWhere.Scratch);
    expect(rustWhere(Coating.Zinc, true)).toBe(RustWhere.None);
    expect(rustWhere(Coating.Stainless, true)).toBe(RustWhere.None);
  });

  it("waiting counts the days", () => {
    const def = asAnyProp(rustLab);
    const s = { ...defaults<RustState>(rustLab), mode: RustMode.Protect, coatings: [Coating.Zinc] };
    const r = run(def, s, RustAction.Wait, {});
    expect(r.state.days).toBe(1);
    expect(r.emit[0]?.payload).toEqual({ days: 1 });
  });
});

describe("gold carats", () => {
  it("22 carat is 22 parts in 24 and harder than 24 carat", () => {
    expect(goldPercent(22)).toBeCloseTo(91.7, 1);
    expect(goldPercent(24)).toBe(100);
    expect(hardnessOf(22)).toBeGreaterThan(hardnessOf(24));
  });
});

describe("views", () => {
  const cases: [
    string,
    ReturnType<typeof asAnyProp>,
    (p: PropViewProps) => JSX.Element,
    Record<string, unknown>[],
  ][] = [
    [
      "propertyTester",
      asAnyProp(propertyTester),
      PropertyTesterView,
      TEST_ORDER.map((test) => ({
        ...defaults<PropertyState>(propertyTester),
        test,
        sample: PropertySample.Sulphur,
        isTried: true,
        tried: [`sulphur:${test}`, "iron:lustre"],
      })),
    ],
    [
      "reactivityLab",
      asAnyProp(reactivityLab),
      ReactivityLabView,
      REAGENTS.map((reagent) => ({
        ...defaults<ReactivityState>(reactivityLab),
        metal: "Na",
        reagent,
        isStarted: true,
        showSeries: true,
        showThermometer: true,
      })),
    ],
    [
      "ionicBond",
      asAnyProp(ionicBond),
      IonicBondView,
      Object.values(IonicCompound).flatMap((compound) =>
        [0, 1, 2, 3].map((step) => ({
          ...defaults<BondState>(ionicBond),
          compound,
          step,
          showAllShells: step % 2 === 0,
          compounds: [IonicCompound.SodiumChloride, IonicCompound.MagnesiumChloride],
        })),
      ),
    ],
    [
      "ionicTester",
      asAnyProp(ionicTester),
      IonicTesterView,
      SALT_FORMS.map((form) => ({ ...defaults<TesterState>(ionicTester), form, isOn: true })),
    ],
    [
      "extractionFlow",
      asAnyProp(extractionFlow),
      ExtractionFlowView,
      Object.values(ExtractMetal).map((metal) => ({
        ...defaults<FlowState>(extractionFlow),
        metal,
        step: 1,
        metals: [ExtractMetal.Zinc, ExtractMetal.Gold],
      })),
    ],
    [
      "thermitWeld",
      asAnyProp(thermitWeld),
      ThermitWeldView,
      [false, true].map((isIgnited) => ({ isIgnited, showEquation: true, canIgnite: true })),
    ],
    [
      "refiningCell",
      asAnyProp(refiningCell),
      RefiningCellView,
      [0, 0.5, 1].map((progress) => ({
        isOn: progress < 1,
        progress,
        showLabels: true,
        canSwitch: true,
      })),
    ],
    [
      "rustLab",
      asAnyProp(rustLab),
      RustLabView,
      [
        { ...defaults<RustState>(rustLab), days: 5 },
        ...Object.values(Coating).map((coating) => ({
          ...defaults<RustState>(rustLab),
          mode: RustMode.Protect,
          coating,
          isScratched: true,
          days: 4,
          coatings: [Coating.Paint, Coating.Zinc],
        })),
      ],
    ],
    [
      "goldCarat",
      asAnyProp(goldCarat),
      GoldCaratView,
      [24, 22, 18, 14].map((carat) => ({ carat, other: "silver", canChoose: true })),
    ],
    [
      "metalScene",
      asAnyProp(metalScene),
      MetalSceneView,
      Object.values(MetalSceneKind).map((scene) => ({ scene })),
    ],
  ];

  it.each(cases)(
    "%s renders in English and Hindi at phone widths, every case",
    (_n, def, View, states) => {
      for (const state of states)
        for (const locale of ["en", "hi"] as const)
          for (const width of [300, 340, 420]) {
            const view = observationOf(def, state);
            expect(view.summary.length).toBeGreaterThan(10);
            const html = renderToString(
              <View
                view={viewOf(def, state)}
                width={width}
                locale={locale}
                call={() => undefined}
                signal={() => undefined}
              />,
            );
            expect(html).not.toMatch(/NaN|undefined/);
          }
    },
  );
});
