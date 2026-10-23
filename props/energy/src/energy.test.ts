import { EffectKind, applyPatch, asAnyProp, prepareAction } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { BiogasAction, type BiogasState, biogasPlant, gasOf } from "./biogas";
import {
  FissionAction,
  type FissionState,
  fission,
  fissionsIn,
  mevOf,
  neutronsOut,
  totalFissions,
} from "./fission";
import {
  FUELS,
  FUEL_FACTS,
  Fuel,
  FuelAction,
  type FuelState,
  Place,
  checksOf,
  fuelCompare,
  hottestOf,
  passedOf,
} from "./fuel";
import {
  Flow,
  Level,
  OceanAction,
  OceanKind,
  type OceanState,
  flowOf,
  oceanEnergy,
  worksOf,
} from "./ocean";
import {
  PlantAction,
  PlantKind,
  type PlantState,
  RENEWABLE,
  STAGES,
  outputOf,
  powerPlant,
} from "./plant";
import {
  COOKS_AT,
  CookerPart,
  Sky,
  SolarAction,
  SolarMode,
  type SolarState,
  cookerTempOf,
  flaskTemps,
  solarLab,
  voltsOf,
  wattsOf,
} from "./solar";
import {
  Bin,
  RIGHT_BIN,
  SOURCES,
  SortBy,
  SorterAction,
  type SorterState,
  Source,
  energySorter,
  isAllRightOf,
} from "./sorter";
import {
  WindAction,
  type WindState,
  isTurningAt,
  landOf,
  perMillOf,
  supplyOf,
  windFarm,
  outputOf as windOutputOf,
} from "./wind";

function run<S extends Record<string, unknown>>(
  def: ReturnType<typeof asAnyProp>,
  state: S,
  name: string,
  args: Record<string, unknown> = {},
) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: result.effect.emit };
}

describe("good fuels (14.1)", () => {
  it("heat values follow NCERT's table: LPG above kerosene above coal above wood above dung", () => {
    const h = (f: Fuel) => FUEL_FACTS[f].heat;
    expect(h(Fuel.Lpg)).toBeGreaterThan(h(Fuel.Kerosene));
    expect(h(Fuel.Kerosene)).toBeGreaterThan(h(Fuel.Coal));
    expect(h(Fuel.Coal)).toBeGreaterThan(h(Fuel.Wood));
    expect(h(Fuel.Wood)).toBeGreaterThan(h(Fuel.CowDung));
    expect(hottestOf(FUELS)).toBe(Fuel.Hydrogen);
  });
  it("where you live changes what is easy to get", () => {
    expect(checksOf(Fuel.Lpg, Place.City).get).toBe(true);
    expect(checksOf(Fuel.Lpg, Place.Village).get).toBe(false);
    expect(checksOf(Fuel.Wood, Place.Village).get).toBe(true);
  });
  it("charcoal beats wood on heat and smoke (14.2.4)", () => {
    expect(FUEL_FACTS[Fuel.Charcoal].heat).toBeGreaterThan(FUEL_FACTS[Fuel.Wood].heat);
    expect(FUEL_FACTS[Fuel.Wood].smoke).toBe("lots");
    expect(FUEL_FACTS[Fuel.Charcoal].smoke).toBe("little");
    expect(passedOf(Fuel.Charcoal, Place.Village)).toBe(4);
  });
  it("picking reports how many checks pass; picking a fuel not on the chart does nothing", () => {
    const s = fuelCompare.defaults as FuelState;
    const r = run(asAnyProp(fuelCompare), s, FuelAction.Pick, { fuel: Fuel.Biogas });
    expect(r.state.picked).toBe(Fuel.Biogas);
    expect(r.emit[0]?.payload).toEqual({
      fuel: Fuel.Biogas,
      passed: passedOf(Fuel.Biogas, Place.Village),
    });
    const r2 = run(asAnyProp(fuelCompare), s, FuelAction.Pick, { fuel: Fuel.Hydrogen });
    expect(r2.state.picked).toBeNull();
  });
});

describe("power plants (14.2–14.3)", () => {
  it("every station but the model ends in a turbine and a generator making electricity", () => {
    for (const kind of Object.values(PlantKind)) {
      const chain = STAGES[kind];
      const last = chain[chain.length - 1];
      if (kind === PlantKind.Model) expect(last?.form.en).toBe("light");
      else expect(last?.form.en).toBe("electrical energy");
    }
  });
  it("hydro: river kinetic → potential behind the dam → kinetic falling", () => {
    expect(STAGES.hydro.slice(0, 3).map((s) => s.form.en)).toEqual([
      "kinetic energy",
      "potential energy",
      "kinetic energy",
    ]);
  });
  it("hydro output grows with the water level; off gives nothing", () => {
    const base = { kind: PlantKind.Hydro, isOn: true } as const;
    expect(outputOf({ ...base, level: 0 })).toBe(0);
    expect(outputOf({ ...base, level: 1 })).toBeLessThan(outputOf({ ...base, level: 3 }));
    expect(outputOf({ ...base, isOn: false, level: 3 })).toBe(0);
  });
  it("thermal and nuclear are non-renewable; hydro and geothermal renewable", () => {
    expect(RENEWABLE.thermal).toBe(false);
    expect(RENEWABLE.nuclear).toBe(false);
    expect(RENEWABLE.hydro).toBe(true);
    expect(RENEWABLE.geothermal).toBe(true);
  });
  it("stepping stops at the end of the chain", () => {
    let s = powerPlant.defaults as PlantState;
    for (let i = 0; i < 8; i++) s = run(asAnyProp(powerPlant), s, PlantAction.Next).state;
    expect(s.step).toBe(STAGES.thermal.length);
  });
});

describe("biogas (Fig 14.4)", () => {
  it("gas fills only after the slurry is in the digester, and not with an air leak", () => {
    expect(gasOf({ step: 1, hasLeak: false })).toBe(0);
    expect(gasOf({ step: 3, hasLeak: false })).toBe(1);
    expect(gasOf({ step: 3, hasLeak: true })).toBe(0);
  });
  it("Next walks to manure and stops", () => {
    let s = biogasPlant.defaults as BiogasState;
    for (let i = 0; i < 9; i++) s = run(asAnyProp(biogasPlant), s, BiogasAction.Next).state;
    expect(s.step).toBe(5);
  });
});

describe("wind (14.2.4)", () => {
  it("the blades turn only above 15 km/h", () => {
    expect(isTurningAt(15)).toBe(false);
    expect(isTurningAt(20)).toBe(true);
    expect(perMillOf(10)).toBe(0);
    expect(perMillOf(30)).toBe(1);
    expect(perMillOf(40)).toBe(1);
  });
  it("a farm adds its mills; land is 2 hectares per MW", () => {
    expect(windOutputOf({ speed: 30, mills: 5 })).toBe(5);
    expect(landOf(5)).toBe(10);
  });
  it("with no wind only a back-up keeps the lights on", () => {
    expect(supplyOf({ speed: 10, hasBattery: false })).toBe("none");
    expect(supplyOf({ speed: 10, hasBattery: true })).toBe("battery");
    expect(supplyOf({ speed: 25, hasBattery: false })).toBe("wind");
  });
  it("speed must be a multiple of 5", () => {
    const r = prepareAction(
      asAnyProp(windFarm),
      windFarm.defaults as WindState,
      WindAction.SetSpeed,
      {
        speed: 17,
      },
    );
    expect(r.isOk).toBe(false);
  });
});

describe("solar (14.3.1)", () => {
  it("the black flask warms more than the white (Activity 14.5)", () => {
    const t = flaskTemps(Sky.Sunny, 60);
    expect(t.black).toBeGreaterThan(t.white);
    expect(flaskTemps(Sky.Sunny, 0).black).toBe(flaskTemps(Sky.Sunny, 0).white);
  });
  it("the full cooker cooks in sunshine within two hours; not on a cloudy day or at night", () => {
    const s = { ...(solarLab.defaults as SolarState), mode: SolarMode.Cooker, minutes: 120 };
    expect(cookerTempOf(s)).toBeGreaterThanOrEqual(COOKS_AT);
    expect(cookerTempOf({ ...s, sky: Sky.Cloudy })).toBeLessThan(COOKS_AT);
    expect(cookerTempOf({ ...s, sky: Sky.Night })).toBe(30);
  });
  it("each part raises the cooker's temperature; without the glass lid it never cooks", () => {
    const s = { ...(solarLab.defaults as SolarState), mode: SolarMode.Cooker, minutes: 120 };
    expect(cookerTempOf({ ...s, hasGlass: false })).toBeLessThan(cookerTempOf(s));
    expect(cookerTempOf({ ...s, hasGlass: false })).toBeLessThan(COOKS_AT);
    expect(cookerTempOf({ ...s, hasMirror: false })).toBeLessThan(cookerTempOf(s));
  });
  it("cells in a row: 0.5 V and 0.7 W each in sunshine; none at night", () => {
    expect(voltsOf({ cells: 4, sky: Sky.Sunny })).toBe(2);
    expect(wattsOf({ cells: 10, sky: Sky.Sunny })).toBeCloseTo(7);
    expect(wattsOf({ cells: 10, sky: Sky.Night })).toBe(0);
    expect(wattsOf({ cells: 10, sky: Sky.Cloudy })).toBeLessThan(
      wattsOf({ cells: 10, sky: Sky.Sunny }),
    );
  });
  it("Wait says Cooked once, when the cooker first reaches 100 °C", () => {
    let s = { ...(solarLab.defaults as SolarState), mode: SolarMode.Cooker };
    const cooked: number[] = [];
    for (let i = 0; i < 8; i++) {
      const r = run(asAnyProp(solarLab), s, SolarAction.Wait);
      s = r.state;
      if (r.emit.some((e) => e.signal === "cooked")) cooked.push(s.minutes);
    }
    expect(cooked).toHaveLength(1);
  });
  it("SetPart toggles one part", () => {
    const s = solarLab.defaults as SolarState;
    const r = run(asAnyProp(solarLab), s, SolarAction.SetPart, {
      part: CookerPart.Glass,
      has: false,
    });
    expect(r.state.hasGlass).toBe(false);
    expect(r.state.hasMirror).toBe(true);
  });
});

describe("the sea (14.3.2)", () => {
  it("tidal: water rushes in at high tide, out at low, and nothing when levels match", () => {
    expect(flowOf({ sea: Level.High, basin: Level.Low })).toBe(Flow.In);
    expect(flowOf({ sea: Level.Low, basin: Level.High })).toBe(Flow.Out);
    expect(flowOf({ sea: Level.Low, basin: Level.Low })).toBe(Flow.None);
  });
  it("opening the gate turns the turbine once, then the levels match", () => {
    const s = oceanEnergy.defaults as OceanState;
    const r = run(asAnyProp(oceanEnergy), s, OceanAction.OpenGate);
    expect(r.state.isFlowing).toBe(true);
    expect(r.state.basin).toBe(Level.High);
    const again = run(asAnyProp(oceanEnergy), r.state, OceanAction.OpenGate);
    expect(again.state.isFlowing).toBe(false);
    const turned = run(asAnyProp(oceanEnergy), again.state, OceanAction.NextTide);
    expect(flowOf(turned.state)).toBe(Flow.Out);
  });
  it("ocean thermal needs 20 °C or more between surface and deep water", () => {
    const s = { ...(oceanEnergy.defaults as OceanState), kind: OceanKind.Thermal };
    expect(worksOf({ ...s, surface: 25, deep: 5 })).toBe(true);
    expect(worksOf({ ...s, surface: 24, deep: 5 })).toBe(false);
  });
  it("only strong waves are worth it", () => {
    const s = { ...(oceanEnergy.defaults as OceanState), kind: OceanKind.Wave };
    expect(worksOf({ ...s, wave: 1 })).toBe(false);
    expect(worksOf({ ...s, wave: 2 })).toBe(true);
  });
});

describe("fission (14.3.4)", () => {
  it("uncontrolled, the splits multiply by 3 each generation", () => {
    expect([1, 2, 3].map((g) => fissionsIn(g, false))).toEqual([1, 3, 9]);
    expect(totalFissions(3, false)).toBe(13);
    expect(neutronsOut(3, false)).toBe(27);
  });
  it("controlled, one split leads to exactly one more", () => {
    expect([1, 2, 3].map((g) => fissionsIn(g, true))).toEqual([1, 1, 1]);
    expect(neutronsOut(2, true)).toBe(1);
  });
  it("1 u of mass is about 931 MeV", () => {
    expect(mevOf(1)).toBe(931);
    expect(mevOf(0.2)).toBeCloseTo(186.2);
  });
  it("switching control starts again", () => {
    let s = fission.defaults as FissionState;
    s = run(asAnyProp(fission), s, FissionAction.Next).state;
    s = run(asAnyProp(fission), s, FissionAction.SetControl, { isControlled: true }).state;
    expect(s.generation).toBe(0);
  });
});

describe("sorting sources (14.5, Activity 14.7)", () => {
  it("fossil fuels and nuclear are non-renewable; the rest renewable", () => {
    const no = SOURCES.filter((src) => RIGHT_BIN.renewable[src] === Bin.No);
    expect(new Set(no)).toEqual(
      new Set([Source.Coal, Source.Petroleum, Source.NaturalGas, Source.Nuclear]),
    );
  });
  it("Exercise 3: geothermal and nuclear (and tides) don't come from the Sun", () => {
    const no = SOURCES.filter((src) => RIGHT_BIN.sun[src] === Bin.No);
    expect(new Set(no)).toEqual(new Set([Source.Geothermal, Source.Nuclear, Source.Tidal]));
    expect(RIGHT_BIN.sun.hydro).toBe(Bin.Yes);
    expect(RIGHT_BIN.sun.wave).toBe(Bin.Yes);
  });
  it("tap a source then a bin; AllRight fires once every source is right", () => {
    let s: SorterState = {
      ...(energySorter.defaults as SorterState),
      sources: [Source.Coal, Source.Wind],
      by: SortBy.Renewable,
    };
    s = run(asAnyProp(energySorter), s, SorterAction.Select, { source: Source.Coal }).state;
    let r = run(asAnyProp(energySorter), s, SorterAction.Place, { bin: Bin.No });
    expect(r.emit[0]?.payload).toEqual({ source: Source.Coal, bin: Bin.No, isRight: true });
    s = run(asAnyProp(energySorter), r.state, SorterAction.Select, { source: Source.Wind }).state;
    r = run(asAnyProp(energySorter), s, SorterAction.Place, { bin: Bin.Yes });
    expect(r.emit.map((e) => e.signal)).toContain("allRight");
    expect(isAllRightOf(r.state)).toBe(true);
  });
  it("moving a placed source replaces it, never duplicates it", () => {
    let s: SorterState = { ...(energySorter.defaults as SorterState), sources: [Source.Coal] };
    s = run(asAnyProp(energySorter), s, SorterAction.Select, { source: Source.Coal }).state;
    s = run(asAnyProp(energySorter), s, SorterAction.Place, { bin: Bin.Yes }).state;
    s = run(asAnyProp(energySorter), s, SorterAction.Select, { source: Source.Coal }).state;
    s = run(asAnyProp(energySorter), s, SorterAction.Place, { bin: Bin.No }).state;
    expect(s.placed).toEqual([{ source: Source.Coal, bin: Bin.No }]);
  });
  it("placing with nothing picked up does nothing", () => {
    const s = energySorter.defaults as SorterState;
    expect(
      run(asAnyProp(energySorter), s, SorterAction.Place, { bin: Bin.Yes }).state.placed,
    ).toEqual([]);
  });
});
