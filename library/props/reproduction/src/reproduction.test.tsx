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
  Agent,
  AsexualAction,
  AsexualMode,
  BACTERIA,
  BODY_CHROMOSOMES,
  CONTRACEPTIVE_METHODS,
  CYCLE_STEPS,
  ContraceptionAction,
  ContraceptionMethod,
  CycleAction,
  DnaAction,
  DnaMode,
  FEMALE_ORGANS,
  FLOWER_ORGAN,
  FlowerAction,
  FlowerMode,
  FlowerPart,
  FlowerType,
  GENERATIONS,
  GERMINATION_STEPS,
  GermAction,
  GermMode,
  GerminationAction,
  HumanAction,
  HumanMode,
  JOURNEY_STEPS,
  MALE_ORGANS,
  ORGANISMS,
  ORGAN_JOBS,
  Organ,
  Organism,
  Pollination,
  PropagationAction,
  PropagationMethod,
  RESISTANT,
  ReproductionScene,
  SEGMENTS,
  asexualModesDef,
  asexualStepsOf,
  cellsAt,
  chromosomesAt,
  contraceptionChartDef,
  dnaCopyDef,
  flowerDef,
  germCellsDef,
  grewOf,
  humanSystemsDef,
  menstrualCycleDef,
  plantPropagationDef,
  reproductionProps,
  reproductionSceneDef,
  seedGerminationDef,
  stepsOfMethod,
  survivorsAt,
  systemOf,
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

describe("DNA copying makes similar, not identical, copies", () => {
  it("cells double each generation, and changes are inherited from the parent cell", () => {
    expect([0, 1, 2, 3].map(cellsAt)).toEqual([1, 2, 4, 8]);
    for (let g = 1; g < GENERATIONS.length; g++) {
      const row = GENERATIONS[g] ?? [];
      expect(row).toHaveLength(2 ** g);
      row.forEach((cell, i) => {
        const parent = GENERATIONS[g - 1]?.[Math.floor(i / 2)];
        for (const seg of parent?.changed ?? []) expect(cell.changed).toContain(seg);
        for (const seg of cell.changed) expect(seg).toBeLessThan(SEGMENTS);
      });
    }
  });
  it("only the last generation has a dead cell: the one with a drastic change", () => {
    const dead = GENERATIONS.flat().filter((c) => c.isDead);
    expect(dead).toHaveLength(1);
    expect(dead[0]?.changed.length).toBeGreaterThan(3);
    const v = view(dnaCopyDef, { ...dnaCopyDef.defaults, mode: DnaMode.Generations, step: 3 });
    expect(v.cells).toBe(8);
    expect(v.alive).toBe(7);
  });
  it("in a warming niche only the heat-resistant variants survive, then they multiply", () => {
    expect(survivorsAt(0)).toBe(BACTERIA);
    expect(survivorsAt(2)).toBe(RESISTANT.length);
    expect(survivorsAt(3)).toBeGreaterThan(RESISTANT.length);
    const run = runner(dnaCopyDef);
    let s: typeof dnaCopyDef.defaults = { ...dnaCopyDef.defaults, mode: DnaMode.Niche };
    for (let i = 0; i < 5; i++) s = run(s, DnaAction.Next).state;
    expect(s.step).toBe(3);
    expect(run(s, DnaAction.Reset).state.step).toBe(0);
  });
});

describe("asexual modes", () => {
  const run = runner(asexualModesDef);
  it("each organism has its NCERT mode", () => {
    expect(ORGANISMS.amoeba.mode).toBe(AsexualMode.BinaryFission);
    expect(ORGANISMS.leishmania.mode).toBe(AsexualMode.BinaryFission);
    expect(ORGANISMS.plasmodium.mode).toBe(AsexualMode.MultipleFission);
    expect(ORGANISMS.yeast.mode).toBe(AsexualMode.Budding);
    expect(ORGANISMS.hydra.mode).toBe(AsexualMode.Budding);
    expect(ORGANISMS.spirogyra.mode).toBe(AsexualMode.Fragmentation);
    expect(ORGANISMS.planaria.mode).toBe(AsexualMode.Regeneration);
    expect(ORGANISMS.rhizopus.mode).toBe(AsexualMode.Spores);
    expect(ORGANISMS.plasmodium.makes).toBeGreaterThan(2);
  });
  it("stepping stops at each organism's last step; choosing resets the step", () => {
    for (const o of Object.values(Organism)) {
      let s: typeof asexualModesDef.defaults = { ...asexualModesDef.defaults, organism: o };
      for (let i = 0; i < 6; i++) s = run(s, AsexualAction.Next).state;
      expect(s.step).toBe(asexualStepsOf(o) - 1);
    }
    const r = run({ ...asexualModesDef.defaults, step: 3 }, AsexualAction.Choose, {
      organism: Organism.Hydra,
    });
    expect(r.state).toMatchObject({ organism: Organism.Hydra, step: 0 });
    expect(r.signals).toEqual(["chosen"]);
  });
  it("refuses a step past the organism's last", () => {
    const def = asAnyProp(asexualModesDef) as AnyPropDef;
    const bad = applyPatch(
      def,
      { ...asexualModesDef.defaults, organism: Organism.Yeast },
      { step: 3 },
    );
    expect(bad.isOk).toBe(false);
  });
});

describe("vegetative propagation experiments", () => {
  const run = runner(plantPropagationDef);
  it("only pieces with a bud (potato) or a leaf (money plant) grow, and only at the end", () => {
    expect(grewOf({ method: PropagationMethod.Potato, step: 1 })).toBeNull();
    expect(grewOf({ method: PropagationMethod.Potato, step: 2 })).toBe("piecesWithBuds");
    expect(grewOf({ method: PropagationMethod.MoneyPlant, step: 2 })).toBe("pieceWithLeaf");
    expect(grewOf({ method: PropagationMethod.Grafting, step: 2 })).toBeNull();
  });
  it("tissue culture has four steps; every method's steps are reachable", () => {
    expect(stepsOfMethod(PropagationMethod.TissueCulture)).toBe(4);
    for (const m of Object.values(PropagationMethod)) {
      let s: typeof plantPropagationDef.defaults = { ...plantPropagationDef.defaults, method: m };
      for (let i = 0; i < 6; i++) s = run(s, PropagationAction.Next).state;
      expect(s.step).toBe(stepsOfMethod(m) - 1);
    }
  });
});

describe("germ cells keep the DNA amount constant", () => {
  it("combining full sets doubles every generation; halving restores the number", () => {
    expect([0, 1, 2].map((step) => chromosomesAt({ mode: GermMode.Doubling, step }))).toEqual([
      4, 8, 16,
    ]);
    expect([0, 1, 2].map((step) => chromosomesAt({ mode: GermMode.Halving, step }))).toEqual([
      BODY_CHROMOSOMES,
      BODY_CHROMOSOMES / 2,
      BODY_CHROMOSOMES,
    ]);
    expect(chromosomesAt({ mode: GermMode.Gametes, step: 1 })).toBeNull();
  });
  it("gametes mode has two steps and stops there", () => {
    const run = runner(germCellsDef);
    let s: typeof germCellsDef.defaults = { ...germCellsDef.defaults, mode: GermMode.Gametes };
    for (let i = 0; i < 4; i++) s = run(s, GermAction.Next).state;
    expect(s.step).toBe(1);
  });
});

describe("flower", () => {
  const run = runner(flowerDef);
  it("stamens are male parts, the pistil female; sepals and petals neither", () => {
    expect(FLOWER_ORGAN.anther).toBe("stamen");
    expect(FLOWER_ORGAN.filament).toBe("stamen");
    for (const p of ["stigma", "style", "ovary", "ovule"] as const)
      expect(FLOWER_ORGAN[p]).toBe("pistil");
    expect(FLOWER_ORGAN.sepal).toBeNull();
    expect(FLOWER_ORGAN.petal).toBeNull();
  });
  it("tapping a part reports its organ and job", () => {
    const r = run({ ...flowerDef.defaults }, FlowerAction.Tap, { part: FlowerPart.Anther });
    expect(r.signals).toEqual(["tapped"]);
    const v = view(flowerDef, r.state);
    expect(v.organ).toBe("stamen");
    expect(String(v.job)).toMatch(/pollen/);
  });
  it("fertilisation has four steps, fruit three", () => {
    let s: typeof flowerDef.defaults = { ...flowerDef.defaults, mode: FlowerMode.Fertilisation };
    for (let i = 0; i < 6; i++) s = run(s, FlowerAction.Next).state;
    expect(s.step).toBe(3);
    s = { ...flowerDef.defaults, mode: FlowerMode.Fruit };
    for (let i = 0; i < 6; i++) s = run(s, FlowerAction.Next).state;
    expect(s.step).toBe(2);
  });
  it("pollination, agent and flower type can be switched", () => {
    let s: typeof flowerDef.defaults = { ...flowerDef.defaults, mode: FlowerMode.Pollination };
    s = run(s, FlowerAction.SetPollination, { pollination: Pollination.Self }).state;
    s = run(s, FlowerAction.SetAgent, { agent: Agent.Wind }).state;
    s = run(s, FlowerAction.SetType, { flowerType: FlowerType.Unisexual }).state;
    expect(s).toMatchObject({
      pollination: Pollination.Self,
      agent: Agent.Wind,
      flowerType: FlowerType.Unisexual,
    });
  });
});

describe("seed germination", () => {
  it("steps to the cut-open seed and stops", () => {
    const run = runner(seedGerminationDef);
    let s: typeof seedGerminationDef.defaults = { ...seedGerminationDef.defaults };
    for (let i = 0; i < 6; i++) s = run(s, GerminationAction.Next).state;
    expect(s.step).toBe(GERMINATION_STEPS - 1);
    expect(view(seedGerminationDef, s).isDone).toBe(true);
  });
});

describe("human reproductive systems", () => {
  const run = runner(humanSystemsDef);
  it("the male and female organ lists match NCERT's summary", () => {
    expect(MALE_ORGANS).toEqual(
      expect.arrayContaining(["testis", "vasDeferens", "seminalVesicle", "prostate", "urethra"]),
    );
    expect(FEMALE_ORGANS).toEqual(["ovary", "oviduct", "uterus", "cervix", "vagina"]);
    expect(systemOf(Organ.VasDeferens)).toBe("male");
    expect(systemOf(Organ.Oviduct)).toBe("female");
    for (const o of Object.values(Organ)) expect(ORGAN_JOBS[o].length).toBeGreaterThan(20);
  });
  it("fertilisation takes place in the oviduct; the scrotum is about temperature", () => {
    expect(ORGAN_JOBS.oviduct).toMatch(/Fertilisation/);
    expect(ORGAN_JOBS.scrotum).toMatch(/temperature/);
    expect(ORGAN_JOBS.urethra).toMatch(/both sperms and urine/);
  });
  it("tapping an organ reports its system; the journey has five steps", () => {
    const r = run({ ...humanSystemsDef.defaults }, HumanAction.Tap, { organ: Organ.Uterus });
    expect(view(humanSystemsDef, r.state).system).toBe("female");
    let s: typeof humanSystemsDef.defaults = {
      ...humanSystemsDef.defaults,
      mode: HumanMode.Journey,
    };
    for (let i = 0; i < 8; i++) s = run(s, HumanAction.Next).state;
    expect(s.step).toBe(JOURNEY_STEPS - 1);
  });
});

describe("menstrual cycle", () => {
  it("the lining is thick until it breaks down at the last step", () => {
    const run = runner(menstrualCycleDef);
    let s: typeof menstrualCycleDef.defaults = { ...menstrualCycleDef.defaults };
    expect(view(menstrualCycleDef, s).lining).toBe("thick");
    for (let i = 0; i < 6; i++) s = run(s, CycleAction.Next).state;
    expect(s.step).toBe(CYCLE_STEPS - 1);
    expect(view(menstrualCycleDef, s).lining).toBe("breaking");
  });
});

describe("contraception", () => {
  it("four categories, and only the condom helps against STDs (NCERT in-text Q5)", () => {
    expect(new Set(Object.values(CONTRACEPTIVE_METHODS).map((m) => m.category)).size).toBe(4);
    const run = runner(contraceptionChartDef);
    for (const m of Object.values(ContraceptionMethod)) {
      const r = run({ ...contraceptionChartDef.defaults }, ContraceptionAction.Tap, { method: m });
      expect(view(contraceptionChartDef, r.state).protectsStd).toBe(m === "condom");
    }
    const copperT = run({ ...contraceptionChartDef.defaults }, ContraceptionAction.Tap, {
      method: ContraceptionMethod.CopperT,
    });
    expect(view(contraceptionChartDef, copperT.state).category).toBe("device");
  });
});

const CASES: [string, Record<string, unknown>][] = [
  ...Object.values(DnaMode).flatMap((mode) =>
    [0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
      "dnaCopy",
      { ...dnaCopyDef.defaults, mode, step },
    ]),
  ),
  ...Object.values(Organism).flatMap((organism) =>
    Array.from(
      { length: asexualStepsOf(organism) },
      (_, step): [string, Record<string, unknown>] => [
        "asexualModes",
        { ...asexualModesDef.defaults, organism, step, choices: [Organism.Amoeba, Organism.Hydra] },
      ],
    ),
  ),
  ...Object.values(PropagationMethod).flatMap((method) =>
    Array.from({ length: stepsOfMethod(method) }, (_, step): [string, Record<string, unknown>] => [
      "plantPropagation",
      { ...plantPropagationDef.defaults, method, step },
    ]),
  ),
  ...Object.values(GermMode).flatMap((mode) =>
    [0, 1, 2]
      .filter((step) => !(mode === GermMode.Gametes && step === 2))
      .map((step): [string, Record<string, unknown>] => [
        "germCells",
        { ...germCellsDef.defaults, mode, step },
      ]),
  ),
  ["flower", { ...flowerDef.defaults }],
  ["flower", { ...flowerDef.defaults, selected: FlowerPart.Ovule }],
  ["flower", { ...flowerDef.defaults, mode: FlowerMode.Types }],
  ["flower", { ...flowerDef.defaults, mode: FlowerMode.Types, flowerType: FlowerType.Unisexual }],
  ["flower", { ...flowerDef.defaults, mode: FlowerMode.Pollination }],
  [
    "flower",
    { ...flowerDef.defaults, mode: FlowerMode.Pollination, pollination: Pollination.Self },
  ],
  ["flower", { ...flowerDef.defaults, mode: FlowerMode.Pollination, agent: Agent.Wind }],
  ["flower", { ...flowerDef.defaults, mode: FlowerMode.Pollination, agent: Agent.Water }],
  ...[0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
    "flower",
    { ...flowerDef.defaults, mode: FlowerMode.Fertilisation, step },
  ]),
  ...[0, 1, 2].map((step): [string, Record<string, unknown>] => [
    "flower",
    { ...flowerDef.defaults, mode: FlowerMode.Fruit, step },
  ]),
  ...[0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
    "seedGermination",
    { ...seedGerminationDef.defaults, step },
  ]),
  ["humanSystems", { ...humanSystemsDef.defaults }],
  ["humanSystems", { ...humanSystemsDef.defaults, selected: Organ.Oviduct }],
  ["humanSystems", { ...humanSystemsDef.defaults, mode: HumanMode.Male }],
  ["humanSystems", { ...humanSystemsDef.defaults, mode: HumanMode.Male, selected: Organ.Prostate }],
  ...[0, 1, 2, 3, 4].map((step): [string, Record<string, unknown>] => [
    "humanSystems",
    { ...humanSystemsDef.defaults, mode: HumanMode.Journey, step },
  ]),
  ["humanSystems", { ...humanSystemsDef.defaults, mode: HumanMode.Placenta }],
  ...[0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
    "menstrualCycle",
    { ...menstrualCycleDef.defaults, step },
  ]),
  ["contraceptionChart", { ...contraceptionChartDef.defaults }],
  ["contraceptionChart", { ...contraceptionChartDef.defaults, selected: "condom" }],
  ["contraceptionChart", { ...contraceptionChartDef.defaults, selected: "surgical" }],
  ...Object.values(ReproductionScene).map((scene): [string, Record<string, unknown>] => [
    "reproductionScene",
    { scene },
  ]),
];

describe("every view draws", () => {
  const byType = new Map(reproductionProps.map((m) => [m.def.type, m]));
  it.each(CASES.map(([type, s], i) => [i, type, s] as const))("%i %s", (_i, type, s) => {
    const m = byType.get(type) as PropModule;
    expect(m).toBeDefined();
    for (const width of [300, 340, 420])
      for (const locale of ["en", "hi"] as const) {
        const View = m.View;
        const html = renderToString(
          <View
            view={viewOf(m.def, s)}
            locale={locale}
            width={width}
            call={() => undefined}
            signal={() => undefined}
          />,
        );
        expect(html).not.toContain("NaN");
        expect(html).not.toContain("undefined");
        if (locale === "hi" && type !== "reproductionScene") expect(html).toMatch(/[ऀ-ॿ]/);
      }
    expect(observationOf(m.def, s).summary.length).toBeGreaterThan(20);
  });

  it("ten props; defs.ts lists exactly the registered definitions", () => {
    expect(reproductionProps).toHaveLength(10);
    expect(defs.map((d) => d.type).sort()).toEqual(reproductionProps.map((m) => m.def.type).sort());
    expect(reproductionSceneDef.type).toBe("reproductionScene");
    expect(Object.keys(ReproductionScene)).toHaveLength(12);
  });
});

describe("look", () => {
  it("draws only with the look's tokens: no raw colours in any stylesheet", () => {
    const dir = new URL("./", import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".css"))) {
      const css = readFileSync(new URL(f, dir), "utf8");
      expect(
        css.split("\n").filter((line) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(line)),
        f,
      ).toEqual([]);
    }
  });
});
