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
  Bin,
  BurialAction,
  ChainAction,
  ChainMode,
  type ChainState,
  Cup,
  CupQuestion,
  EcoAction,
  EcoProblem,
  type EcoState,
  EcoThing,
  Effect,
  EnvScene,
  Habitat,
  MagAction,
  OzoneAction,
  OzoneMode,
  SortAction,
  type SortState,
  WasteItem,
  bioMagnificationDef,
  chainsInWeb,
  cupChoiceDef,
  cupProblemsOf,
  eatenBy,
  eats,
  ecoProblemsOf,
  ecosystemDef,
  effectsOf,
  energyAt,
  environmentProps,
  environmentSceneDef,
  foodChainDef,
  isBiodegradable,
  leftAfter,
  ozoneLayerDef,
  uvThroughOf,
  wasteBurialDef,
  wasteSorterDef,
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

const view = (raw: unknown, s: Record<string, unknown>) =>
  viewOf(asAnyProp(raw as never) as AnyPropDef, s) as Record<string, unknown>;

describe("ecosystem jar", () => {
  const run = runner(ecosystemDef);
  it("the default jar (4 fish, no plants, no decomposers) can't keep itself going", () => {
    expect(ecoProblemsOf(ecosystemDef.defaults)).toEqual([
      EcoProblem.NoProducers,
      EcoProblem.NoDecomposers,
      EcoProblem.TooManyFish,
    ]);
    expect(view(ecosystemDef, { ...ecosystemDef.defaults }).isSelfSustaining).toBe(false);
  });
  it("producers, consumers, decomposers, light and at most 3 fish make it self-sustaining, once", () => {
    let s: EcoState = { ...ecosystemDef.defaults };
    s = run(s, EcoAction.Toggle, { thing: EcoThing.Plants, on: true }).state;
    s = run(s, EcoAction.Toggle, { thing: EcoThing.Decomposers, on: true }).state;
    const r = run(s, EcoAction.SetFish, { n: 3 });
    expect(r.signals).toEqual(["changed", "sustained"]);
    expect(view(ecosystemDef, r.state).isSelfSustaining).toBe(true);
    expect(run(r.state, EcoAction.SetSnails, { n: 2 }).signals).toEqual(["changed"]);
  });
  it("in the dark the plants can't help; a pump doesn't fix a missing part", () => {
    const ok = { ...ecosystemDef.defaults, hasPlants: true, hasDecomposers: true, fish: 2 };
    expect(ecoProblemsOf({ ...ok, isSunny: false })).toEqual([EcoProblem.NoLight]);
    expect(ecoProblemsOf({ ...ok, hasDecomposers: false, hasPump: true })).toEqual([
      EcoProblem.NoDecomposers,
    ]);
    const v = view(ecosystemDef, ok);
    expect(v.biotic).toEqual(["waterPlants", "fish", "bacteriaAndFungi"]);
    expect(v.abiotic).toEqual(["water", "minerals", "sunlight"]);
  });
});

describe("food chains and energy", () => {
  const run = runner(foodChainDef);
  it("plants keep 1% of sunlight and about 10% passes up each level", () => {
    expect([1, 2, 3, 4].map(energyAt)).toEqual([10000, 1000, 100, 10]);
  });
  it("NCERT's chains: forest 3 levels, grassland and pond 4", () => {
    const len = (habitat: Habitat) =>
      (view(foodChainDef, { ...foodChainDef.defaults, habitat }).organisms as string[]).length;
    expect([len(Habitat.Forest), len(Habitat.Grassland), len(Habitat.Pond)]).toEqual([3, 4, 4]);
  });
  it("reveal stops at the top, and a forest chain can't show a 4th level", () => {
    let s: ChainState = { ...foodChainDef.defaults, habitat: Habitat.Forest };
    for (let i = 0; i < 5; i++) s = run(s, ChainAction.Reveal).state;
    expect(s.shown).toBe(3);
    const bad = applyPatch(asAnyProp(foodChainDef) as AnyPropDef, s, { shown: 4 });
    expect(bad.isOk).toBe(false);
  });
  it("wiping out a level starves the one above, the rest above decline, the one below grows", () => {
    expect(effectsOf(4, 2)).toEqual([Effect.Grows, Effect.Gone, Effect.Starves, Effect.Declines]);
    expect(effectsOf(4, 1)).toEqual([
      Effect.Gone,
      Effect.Starves,
      Effect.Declines,
      Effect.Declines,
    ]);
    const r = run({ ...foodChainDef.defaults, shown: 4, canRemove: true }, ChainAction.Remove, {
      level: 3,
    });
    expect(r.signals).toEqual(["removed"]);
    expect(view(foodChainDef, r.state).effects).toEqual([
      Effect.Unchanged,
      Effect.Grows,
      Effect.Gone,
      Effect.Starves,
    ]);
  });
  it("the web: grass feeds three animals, the hawk is eaten by none, and several chains run through", () => {
    expect([...eatenBy("grass")].sort()).toEqual(["grasshopper", "mouse", "rabbit"]);
    expect(eatenBy("hawk")).toEqual([]);
    expect(eats("snake").sort()).toEqual(["frog", "mouse"]);
    expect(chainsInWeb().length).toBe(5);
    const r = run({ ...foodChainDef.defaults, mode: ChainMode.Web }, ChainAction.Tap, {
      node: "mouse",
    });
    expect(view(foodChainDef, r.state).eatenBy).toEqual(["snake", "hawk"]);
  });
});

describe("biological magnification", () => {
  const run = runner(bioMagnificationDef);
  it("the pesticide per body grows at every level and humans hold the most", () => {
    let s = run({ ...bioMagnificationDef.defaults }, MagAction.Spray, { on: true }).state;
    const signals: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = run(s, MagAction.Next);
      s = r.state;
      signals.push(...r.signals);
    }
    const doses = view(bioMagnificationDef, s).doses as number[];
    for (let i = 1; i < doses.length; i++) expect(doses[i]).toBeGreaterThan(doses[i - 1] as number);
    expect(view(bioMagnificationDef, s).highest).toBe("human");
    expect(signals).toContain("reachedTop");
  });
  it("nothing sprayed, nothing in any body", () => {
    const s = { ...bioMagnificationDef.defaults, step: 3 };
    expect(view(bioMagnificationDef, s).doses).toEqual([0, 0, 0, 0]);
  });
});

describe("ozone", () => {
  const run = runner(ozoneLayerDef);
  it("UV splits O₂, then O + O₂ makes O₃; 'formed' once at the last step", () => {
    let s = { ...ozoneLayerDef.defaults };
    expect(run(s, OzoneAction.Next).signals).toEqual(["stepped"]);
    s = run(s, OzoneAction.Next).state;
    const last = run(s, OzoneAction.Next);
    expect(last.signals).toEqual(["stepped", "formed"]);
    expect(view(ozoneLayerDef, last.state).isFormed).toBe(true);
    expect(run(last.state, OzoneAction.Next).signals).toEqual(["stepped"]);
  });
  it("more CFC, thinner layer, more UV through; none through with no CFC", () => {
    expect(uvThroughOf(0)).toBe(0);
    for (let c = 1; c <= 3; c++) expect(uvThroughOf(c)).toBeGreaterThan(uvThroughOf(c - 1));
    const s = run({ ...ozoneLayerDef.defaults, mode: OzoneMode.Shield }, OzoneAction.SetCfc, {
      level: 2,
    }).state;
    expect(view(ozoneLayerDef, s).ozoneShare).toBe(0.5);
    expect(view(ozoneLayerDef, s).isShielded).toBe(false);
  });
});

describe("burial pit (Activity 15.5)", () => {
  const run = runner(wasteBurialDef);
  it("peels and tea leaves are gone by day 15; cloth lasts longest; plastics never change", () => {
    let s = run({ ...wasteBurialDef.defaults }, BurialAction.Wait).state;
    expect(view(wasteBurialDef, s).gone).toEqual([WasteItem.Peels, WasteItem.TeaLeaves]);
    expect(view(wasteBurialDef, s).fastest).toEqual([WasteItem.Peels, WasteItem.TeaLeaves]);
    const signals: string[] = [];
    for (let i = 0; i < 4; i++) {
      const r = run(s, BurialAction.Wait);
      s = r.state;
      signals.push(...r.signals);
    }
    expect(s.days).toBe(60);
    expect(signals.filter((x) => x === "finished")).toHaveLength(1);
    const v = view(wasteBurialDef, s);
    expect(v.unchanged).toEqual([
      WasteItem.MilkPacket,
      WasteItem.MedicineStrip,
      WasteItem.GlassBottle,
      WasteItem.Slipper,
    ]);
    expect(leftAfter(WasteItem.Cloth, 45)).toBeGreaterThan(0);
    expect(leftAfter(WasteItem.Cloth, 60)).toBe(0);
  });
  it("food, leaves, paper and cotton are biodegradable; plastic, foil, glass, rubber, batteries not", () => {
    expect(
      [
        WasteItem.Peels,
        WasteItem.SpoiltFood,
        WasteItem.Leaves,
        WasteItem.Paper,
        WasteItem.Cloth,
      ].every(isBiodegradable),
    ).toBe(true);
    expect(
      [
        WasteItem.MilkPacket,
        WasteItem.Wrapper,
        WasteItem.MedicineStrip,
        WasteItem.GlassBottle,
        WasteItem.Battery,
      ].some(isBiodegradable),
    ).toBe(false);
  });
});

describe("waste sorter", () => {
  const run = runner(wasteSorterDef);
  it("sorts one at a time, marks right and wrong, and says when everything is sorted", () => {
    let s: SortState = {
      ...wasteSorterDef.defaults,
      items: [WasteItem.Peels, WasteItem.MilkPacket, WasteItem.Paper],
    };
    s = run(s, SortAction.Put, { bin: Bin.Bio }).state;
    s = run(s, SortAction.Put, { bin: Bin.Bio }).state;
    const last = run(s, SortAction.Put, { bin: Bin.Bio });
    expect(last.signals).toEqual(["put", "sorted"]);
    const v = view(wasteSorterDef, last.state);
    expect([v.right, v.wrong, v.isDone, v.allRight]).toEqual([2, 1, true, false]);
    expect(run(last.state, SortAction.Reset).state.placed).toEqual([]);
  });
});

describe("train cups", () => {
  it("plastic piles up, kulhads cost topsoil, the returned glass wasn't hygienic", () => {
    expect(cupProblemsOf(Cup.DisposablePlastic)).toEqual([CupQuestion.Reused, CupQuestion.PilesUp]);
    expect(cupProblemsOf(Cup.Kulhad)).toEqual([CupQuestion.Reused, CupQuestion.CostsTopsoil]);
    expect(cupProblemsOf(Cup.Returnable)).toEqual([CupQuestion.Hygienic]);
    expect(cupProblemsOf(Cup.Paper)).toEqual([CupQuestion.Reused]);
    const v = view(cupChoiceDef, { ...cupChoiceDef.defaults, selected: Cup.Kulhad });
    expect(v.problems).toEqual(["reused", "costsTopsoil"]);
  });
});

describe("the package", () => {
  it("defs lists exactly the props its module registers", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(environmentProps.map((m) => m.def.type).sort());
  });
  const states: [PropModule, Record<string, unknown>][] = [];
  const add = (m: PropModule, s: Record<string, unknown>) =>
    states.push([m, { ...m.def.defaults, ...s }]);
  const byType = (t: string) => environmentProps.find((m) => m.def.type === t) as PropModule;
  add(byType("ecosystem"), {});
  add(byType("ecosystem"), {
    hasPlants: true,
    hasDecomposers: true,
    hasPump: true,
    fish: 3,
    snails: 4,
    isSunny: false,
  });
  for (const mode of Object.values(ChainMode))
    for (const habitat of Object.values(Habitat))
      add(byType("foodChain"), {
        mode,
        habitat,
        shown: habitat === Habitat.Forest ? 3 : 4,
        removed: 2,
        selected: mode === ChainMode.Web ? "snake" : null,
        canRemove: true,
        canSetHabitat: true,
      });
  add(byType("bioMagnification"), {
    isSprayed: true,
    step: 3,
    showNumbers: true,
    canSetSetting: true,
  });
  add(byType("bioMagnification"), { setting: "pond", isSprayed: true, step: 2 });
  for (const step of [0, 1, 2]) add(byType("ozoneLayer"), { step });
  for (const cfc of [0, 1, 2, 3]) add(byType("ozoneLayer"), { mode: OzoneMode.Shield, cfc });
  for (const days of [0, 30, 60]) add(byType("wasteBurial"), { days, showKinds: true });
  add(byType("wasteSorter"), {
    placed: [
      { item: WasteItem.Peels, bin: "bio" },
      { item: WasteItem.MilkPacket, bin: "bio" },
    ],
  });
  add(byType("cupChoice"), { selected: Cup.Kulhad });
  add(byType("cupChoice"), { showAll: true });
  for (const scene of Object.values(EnvScene)) add(byType("environmentScene"), { scene });
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
    for (const scene of Object.values(EnvScene))
      expect(
        observationOf(asAnyProp(environmentSceneDef) as AnyPropDef, { scene }).summary.length,
      ).toBeGreaterThan(40);
  });
});
