import { readFileSync, readdirSync } from "node:fs";
import type { PropModule } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { defs } from "./defs";
import {
  Air,
  CASE_STEPS,
  CHOICES,
  CHOICE_OPTIONS,
  Choice,
  Coliform,
  DEEDS,
  Deed,
  FOREST_CASES,
  Fish,
  FiveRAction,
  type FiveRsState,
  ForestCase,
  FossilAction,
  FossilMode,
  type FossilState,
  Product,
  R,
  RS,
  R_OF,
  ResScene,
  RiverAction,
  RiverMode,
  type RiverState,
  SCHEME_FACTS,
  SCHEME_POINTS,
  STAKE_FACTS,
  Sample,
  Scheme,
  Source,
  StakeAction,
  StakeMode,
  type StakeState,
  Stakeholder,
  WaterAction,
  WaterMode,
  type WaterState,
  coliformOf,
  fishOf,
  fiveRsDef,
  fossilClockDef,
  isSafeOf,
  phBand,
  poisonousOf,
  productsOf,
  resourcesProps,
  resourcesSceneDef,
  riverHealthDef,
  schemeProblemsOf,
  stakeholdersDef,
  waterHarvestDef,
  wateredOf,
  wellLevelOf,
  yearsOf,
} from "./index";

type Result<S> = { state: S; signals: string[] };

function runner<S extends Record<string, unknown>>(raw: { defaults: S }) {
  const def = asAnyProp(raw as never) as AnyPropDef;
  return (state: S, name: string, args: Record<string, unknown> = {}): Result<S> => {
    const result = prepareAction(def, state, name, args);
    if (!result.isOk) throw new Error(result.errors.join("; "));
    if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
    const next = applyPatch(def, state, result.effect.set);
    if (!next.isOk) throw new Error(next.errors.join("; "));
    return { state: next.state as S, signals: result.effect.emit.map((e) => e.signal) };
  };
}

describe("five R's", () => {
  const run = runner<FiveRsState>(fiveRsDef as never);
  it("every action has exactly one R, and every R has an example", () => {
    for (const r of RS)
      expect(
        DEEDS.some((d) => R_OF[d] === r),
        r,
      ).toBe(true);
  });
  it("NCERT's own examples land in the right R", () => {
    expect(R_OF[Deed.NoPlasticBag]).toBe(R.Refuse);
    expect(R_OF[Deed.FixLeakyTap]).toBe(R.Reduce);
    expect(R_OF[Deed.EnvelopeAgain]).toBe(R.Reuse);
    expect(R_OF[Deed.CrackedCupPlanter]).toBe(R.Repurpose);
    expect(R_OF[Deed.SegregatePaper]).toBe(R.Recycle);
  });
  it("sorts one at a time, marks right and wrong, and says 'sorted' once at the end", () => {
    let s = fiveRsDef.defaults;
    let r = run(s, FiveRAction.Put, { r: R.Refuse });
    expect(r.signals).toEqual(["put"]);
    s = r.state;
    for (const pick of [R.Reduce, R.Recycle, R.Repurpose])
      s = run(s, FiveRAction.Put, { r: pick }).state;
    r = run(s, FiveRAction.Put, { r: R.Recycle });
    expect(r.signals).toEqual(["put", "sorted"]);
    expect(r.state.placed).toHaveLength(5);
    const right = r.state.placed.filter((p) => R_OF[p.deed] === p.r).length;
    expect(right).toBe(4); // the envelope went into Recycle
  });
  it("rejects a set of actions whose R isn't offered as a bin", () => {
    const def = asAnyProp(fiveRsDef) as AnyPropDef;
    expect(applyPatch(def, fiveRsDef.defaults, { bins: [R.Refuse, R.Reduce] }).isOk).toBe(false);
  });
});

describe("river health", () => {
  const run = runner<RiverState>(riverHealthDef as never);
  const all = riverHealthDef.defaults;
  it("all five sources: very high coliform, toxic, fish dying, unsafe", () => {
    expect(coliformOf(all)).toBe(Coliform.VeryHigh);
    expect(fishOf(all)).toBe(Fish.Dying);
    expect(isSafeOf(all)).toBe(false);
  });
  it("treating sewage and stopping effluents brings fish back but bathing and garbage keep it unsafe", () => {
    const s = { ...all, isTreated: true, sources: [Source.Sewage, Source.Garbage, Source.Bathing] };
    expect(coliformOf(s)).toBe(Coliform.High);
    expect(fishOf(s)).toBe(Fish.Thriving);
    expect(isSafeOf(s)).toBe(false);
  });
  it("nothing in, or only treated sewage: low coliform and safe", () => {
    expect(isSafeOf({ sources: [], isTreated: false })).toBe(true);
    expect(isSafeOf({ sources: [Source.Sewage], isTreated: true })).toBe(true);
  });
  it("switching a source off and the plant on emit 'changed'", () => {
    const r = run(all, RiverAction.SetSource, { source: Source.Industry, on: false });
    expect(r.signals).toEqual(["changed"]);
    expect(r.state.sources).not.toContain(Source.Industry);
    expect(run(r.state, RiverAction.SetTreatment, { on: true }).state.isTreated).toBe(true);
  });
  it("pH bands and testing a sample", () => {
    expect(phBand(7)).toBe("neutral");
    expect(phBand(5.5)).toBe("weakAcid");
    expect(phBand(8.5)).toBe("weakBase");
    const s = { ...all, mode: RiverMode.Ph };
    const r = run(s, RiverAction.Test, { sample: Sample.Pond });
    expect(r.signals).toEqual(["tested"]);
    expect(r.state.tested).toEqual([Sample.Pond]);
  });
});

describe("forest stakeholders", () => {
  const run = runner<StakeState>(stakeholdersDef as never);
  it("local people depend most and need the forest to last; industry doesn't depend on one forest", () => {
    expect(STAKE_FACTS[Stakeholder.Local].dependence).toBe("high");
    expect(STAKE_FACTS[Stakeholder.Local].longStake).toBe(true);
    expect(STAKE_FACTS[Stakeholder.Industry].dependence).toBe("none");
    expect(STAKE_FACTS[Stakeholder.Industry].longStake).toBe(false);
  });
  it("NCERT's numbers are in the stories", () => {
    const text = (c: ForestCase) => CASE_STEPS[c].map((w) => w.en).join(" ");
    expect(text(ForestCase.Bishnoi)).toMatch(/1731/);
    expect(text(ForestCase.Bishnoi)).toMatch(/363/);
    expect(text(ForestCase.Arabari)).toMatch(/1,272/);
    expect(text(ForestCase.Arabari)).toMatch(/25%/);
    expect(text(ForestCase.Arabari)).toMatch(/12\.5 crores/);
    expect(text(ForestCase.Chipko)).toMatch(/Reni/);
    for (const c of FOREST_CASES)
      for (const w of CASE_STEPS[c]) expect(w.hi.length).toBeGreaterThan(10);
  });
  it("a story steps to its end and says 'caseDone' once", () => {
    let s: StakeState = {
      ...stakeholdersDef.defaults,
      mode: StakeMode.Cases,
      case: ForestCase.Arabari,
    };
    const seen: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = run(s, StakeAction.Next);
      seen.push(...r.signals);
      s = r.state;
    }
    expect(s.step).toBe(3);
    expect(seen.filter((x) => x === "caseDone")).toHaveLength(1);
    expect(run(s, StakeAction.SetCase, { case: ForestCase.Chipko }).state.step).toBe(0);
  });
  it("picking a stakeholder reports their stake", () => {
    const r = run(stakeholdersDef.defaults, StakeAction.Pick, { who: Stakeholder.Department });
    expect(r.state.selected).toBe(Stakeholder.Department);
    expect(r.signals).toEqual(["picked"]);
  });
});

describe("water harvesting", () => {
  const run = runner<WaterState>(waterHarvestDef as never);
  it("kulh: the farthest village gets water first, the nearest last", () => {
    const at = (step: number) => wateredOf({ mode: WaterMode.Kulh, step });
    expect(at(0)).toEqual([]);
    expect(at(1)).toEqual([4]);
    expect(at(2)).toEqual([3, 4]);
    expect(at(4)).toEqual([1, 2, 3, 4]);
  });
  it("khadin: the well rises only once the water soaks in", () => {
    const lv = (step: number) => wellLevelOf({ mode: WaterMode.Khadin, step });
    expect([lv(0), lv(1), lv(2), lv(3)]).toEqual([0, 1, 2, 2]);
  });
  it("the big dam has NCERT's three problems; check dams have none", () => {
    expect(schemeProblemsOf(Scheme.BigDam)).toEqual(
      expect.arrayContaining(["displaces", "cost", "forest"]),
    );
    expect(schemeProblemsOf(Scheme.CheckDam)).toEqual([]);
    for (const p of SCHEME_POINTS)
      expect(SCHEME_FACTS[Scheme.CheckDam][p].w.hi.length).toBeGreaterThan(3);
  });
  it("steps stop at the end, with 'done' once; pick emits 'picked'", () => {
    let s: WaterState = { ...waterHarvestDef.defaults, mode: WaterMode.Khadin };
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      const r = run(s, WaterAction.Next);
      seen.push(...r.signals);
      s = r.state;
    }
    expect(s.step).toBe(3);
    expect(seen.filter((x) => x === "done")).toHaveLength(1);
    expect(run(s, WaterAction.Pick, { scheme: Scheme.BigDam }).signals).toEqual(["picked"]);
  });
});

describe("coal and petroleum", () => {
  const run = runner<FossilState>(fossilClockDef as never);
  it("NCERT's estimates, stretched by using less", () => {
    expect(yearsOf(40, 0)).toBe(40);
    expect(yearsOf(200, 0)).toBe(200);
    expect(yearsOf(40, 50)).toBe(80);
    expect(yearsOf(200, 20)).toBe(250);
  });
  it("enough air gives CO₂; too little gives CO; N and S always give their oxides", () => {
    expect(productsOf(Air.Enough)).toContain(Product.CarbonDioxide);
    expect(productsOf(Air.Little)).toContain(Product.CarbonMonoxide);
    expect(productsOf(Air.Little)).not.toContain(Product.CarbonDioxide);
    expect(poisonousOf(Air.Enough)).toEqual([Product.NitrogenOxides, Product.SulphurOxides]);
    expect(poisonousOf(Air.Little)).toContain(Product.CarbonMonoxide);
  });
  it("the cut snaps to steps of 10", () => {
    expect(run(fossilClockDef.defaults, FossilAction.SetCut, { cut: 23 }).state.cut).toBe(20);
  });
  it("every choice has a lower-fuel option; picking them all says 'allPicked' once", () => {
    let s: FossilState = { ...fossilClockDef.defaults, mode: FossilMode.Choices };
    const seen: string[] = [];
    for (const c of CHOICES) {
      expect(CHOICE_OPTIONS[c].options).toContain(CHOICE_OPTIONS[c].best);
      const r = run(s, FossilAction.Pick, { choice: c, option: CHOICE_OPTIONS[c].best });
      seen.push(...r.signals);
      s = r.state;
    }
    expect(seen.filter((x) => x === "allPicked")).toHaveLength(1);
    expect(s.picks).toHaveLength(4);
    const again = run(s, FossilAction.Pick, { choice: Choice.Cold, option: "heater" });
    expect(again.state.picks).toHaveLength(4);
  });
});

describe("the package", () => {
  it("defs lists exactly the props its module registers", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(resourcesProps.map((m) => m.def.type).sort());
  });
  const states: [PropModule, Record<string, unknown>][] = [];
  const add = (m: PropModule, s: Record<string, unknown>) =>
    states.push([m, { ...m.def.defaults, ...s }]);
  const byType = (t: string) => resourcesProps.find((m) => m.def.type === t) as PropModule;
  add(byType("fiveRs"), {});
  add(byType("fiveRs"), {
    placed: [
      { deed: Deed.NoPlasticBag, r: R.Refuse },
      { deed: Deed.SwitchOffFan, r: R.Recycle },
    ],
    showMeaning: false,
  });
  add(byType("fiveRs"), {
    deeds: [Deed.PickleJar, Deed.TyreSwing],
    placed: [
      { deed: Deed.PickleJar, r: R.Reuse },
      { deed: Deed.TyreSwing, r: R.Repurpose },
    ],
  });
  add(byType("riverHealth"), {});
  add(byType("riverHealth"), { sources: [], isTreated: true, showNames: false });
  add(byType("riverHealth"), { sources: [Source.Sewage, Source.Bathing], isTreated: false });
  add(byType("riverHealth"), {
    mode: RiverMode.Ph,
    samples: [
      { sample: Sample.Tap, ph: 7 },
      { sample: Sample.Pond, ph: 6 },
      { sample: Sample.Drain, ph: 9 },
      { sample: Sample.Rain, ph: 5.6 },
    ],
    tested: [Sample.Tap, Sample.Drain],
  });
  for (const who of [null, ...Object.values(Stakeholder)])
    add(byType("forestStakeholders"), { selected: who });
  for (const c of FOREST_CASES)
    for (let step = 0; step < CASE_STEPS[c].length; step++)
      add(byType("forestStakeholders"), { mode: StakeMode.Cases, case: c, step });
  for (let step = 0; step <= 4; step++) add(byType("waterHarvest"), { mode: WaterMode.Kulh, step });
  for (let step = 0; step <= 3; step++)
    add(byType("waterHarvest"), { mode: WaterMode.Khadin, step });
  for (const choice of [null, Scheme.BigDam, Scheme.CheckDam])
    add(byType("waterHarvest"), { mode: WaterMode.Compare, choice });
  for (const cut of [0, 30, 50]) add(byType("fossilClock"), { cut });
  for (const air of Object.values(Air)) add(byType("fossilClock"), { mode: FossilMode.Burn, air });
  add(byType("fossilClock"), {
    mode: FossilMode.Choices,
    picks: [
      { choice: Choice.Travel, option: "ownVehicle" },
      { choice: Choice.Light, option: "led" },
    ],
  });
  for (const scene of Object.values(ResScene)) add(byType("resourcesScene"), { scene });
  it("every view renders in English and Hindi at phone widths, with no NaN or undefined", () => {
    for (const [m, s] of states) {
      const def = m.def as AnyPropDef;
      expect(applyPatch(def, def.defaults, s).isOk, `${def.type} ${JSON.stringify(s)}`).toBe(true);
      const v = viewOf(def, s);
      for (const locale of ["en", "hi"])
        for (const width of [300, 340, 420]) {
          const html = renderToString(
            <m.View
              view={v}
              width={width}
              call={() => undefined}
              signal={() => undefined}
              locale={locale as "en"}
            />,
          );
          expect(html).not.toMatch(/NaN|undefined/);
        }
      expect(observationOf(def, s).summary.length).toBeGreaterThan(20);
    }
  });
  it("styles use the look's tokens only", () => {
    const dir = new URL(".", import.meta.url).pathname;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".css"))) {
      expect(readFileSync(`${dir}${f}`, "utf8"), f).not.toMatch(/#[0-9a-f]{3,6}\b|rgb\(/i);
    }
  });
  it("the scene prop has a description for every scene", () => {
    for (const scene of Object.values(ResScene))
      expect(
        observationOf(asAnyProp(resourcesSceneDef) as AnyPropDef, { scene }).summary.length,
      ).toBeGreaterThan(40);
  });
});
