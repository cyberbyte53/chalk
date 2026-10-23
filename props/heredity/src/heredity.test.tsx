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
import {
  APART,
  BeetleAction,
  BeetleColour,
  BeetleMode,
  type BeetleState,
  CAPACITY,
  CrossAction,
  CrossDerived,
  type CrossState,
  Food,
  FossilAction,
  FossilDerived,
  FossilMode,
  type FossilState,
  GrowMode,
  HeredityScene,
  Limb,
  LimbAction,
  type LimbState,
  Parent,
  Relation,
  SURVIVORS,
  ShuffleAction,
  ShuffleDerived,
  ShuffleMode,
  type ShuffleState,
  Sperm,
  Trait,
  beetlePopulationDef,
  chromosomeShuffleDef,
  crossSimulatorDef,
  fossilLayersDef,
  fractionsOf,
  genotypesOfCross,
  heredityProps,
  heredityStoryDef,
  limbBonesDef,
  looksOfCross,
  ratioOf,
  relationOf,
  trample,
} from "./index";

function runner<S extends Record<string, unknown>>(def: AnyPropDef) {
  return (state: S, name: string, args: Record<string, unknown> = {}): S => {
    const result = prepareAction(def, state, name, args);
    if (!result.isOk) throw new Error(result.errors.join("; "));
    if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
    const next = applyPatch(def, state, result.effect.set);
    if (!next.isOk) throw new Error(next.errors.join("; "));
    return next.state as S;
  };
}

const crossDef = asAnyProp(crossSimulatorDef);
const cross = runner<CrossState>(crossDef);
const crossStart: CrossState = { ...crossSimulatorDef.defaults };
const crossView = (s: CrossState) => viewOf(crossDef, s) as Record<string, unknown>;

describe("Mendel's rules", () => {
  it("a pure tall × pure short cross gives all tall F1 (Tt), with no in-between plants", () => {
    const shares = looksOfCross([Trait.Height], "TT", "tt");
    expect(shares).toEqual([{ key: "tall", count: 4, fraction: 1 }]);
    expect(genotypesOfCross("TT", "tt", [Trait.Height]).map((x) => x.key)).toEqual(["Tt"]);
  });

  it("F1 × F1 (Tt × Tt) gives 3 tall : 1 short by look and 1 TT : 2 Tt : 1 tt by genotype", () => {
    const looks = looksOfCross([Trait.Height], "Tt", "Tt");
    expect(looks.map((x) => [x.key, x.count])).toEqual([
      ["tall", 3],
      ["short", 1],
    ]);
    expect(ratioOf(looks.map((x) => x.count))).toBe("3:1");
    const genotypes = genotypesOfCross("Tt", "Tt", [Trait.Height]);
    expect(genotypes.map((x) => [x.key, x.count])).toEqual([
      ["TT", 1],
      ["Tt", 2],
      ["tt", 1],
    ]);
  });

  it("a hybrid × short (Tt × tt) gives 1 tall : 1 short", () => {
    expect(ratioOf(looksOfCross([Trait.Height], "Tt", "tt").map((x) => x.count))).toBe("1:1");
  });

  it("two traits: RRyy × rrYY gives all round yellow RrYy; F1 × F1 gives 9:3:3:1 in NCERT's order", () => {
    const traits = [Trait.SeedShape, Trait.SeedColour];
    expect(looksOfCross(traits, "RRyy", "rrYY").map((x) => x.key)).toEqual(["round yellow"]);
    const f2 = looksOfCross(traits, "RrYy", "RrYy");
    expect(f2.map((x) => [x.key, x.count])).toEqual([
      ["round yellow", 9],
      ["round green", 3],
      ["wrinkled yellow", 3],
      ["wrinkled green", 1],
    ]);
  });
});

describe("cross simulator", () => {
  it("crosses, then self-pollinates F1 to give a 3:1 F2", () => {
    const crossed = cross(crossStart, CrossAction.Cross);
    expect(crossed.isCrossed).toBe(true);
    expect(crossView(crossed)[CrossDerived.LookRatio]).toBe("1");
    expect(crossView(crossed)[CrossDerived.IsUniform]).toBe(true);
    const f1 = cross(crossed, CrossAction.SelfF1);
    expect([f1.parentA, f1.parentB, f1.generation]).toEqual(["Tt", "Tt", 1]);
    expect(crossView(f1)[CrossDerived.Offspring]).toBe("F2");
    expect(crossView(f1)[CrossDerived.LookRatio]).toBe("3:1");
    expect(crossView(f1)[CrossDerived.GenotypeRatio]).toBe("1:2:1");
  });

  it("grows plants by chance close to the expected 3:1, and the same seed gives the same field", () => {
    const f1 = { ...crossStart, parentA: "Tt", parentB: "Tt", growCount: 2000 };
    const a = cross(f1, CrossAction.Grow);
    const b = cross(f1, CrossAction.Grow);
    expect(a.grown).toEqual(b.grown);
    const tall = a.grown?.counts.tall ?? 0;
    expect(tall + (a.grown?.counts.short ?? 0)).toBe(2000);
    expect(Math.abs(tall / 2000 - 0.75)).toBeLessThan(0.03);
  });

  it("grows exactly the expected shares in expected mode (556 seeds, like NCERT)", () => {
    const s: CrossState = {
      ...crossStart,
      traits: [Trait.SeedShape, Trait.SeedColour],
      parentA: "RrYy",
      parentB: "RrYy",
      growMode: GrowMode.Expected,
      growCount: 556,
    };
    const grown = cross(s, CrossAction.Grow).grown;
    expect(grown?.counts).toEqual({
      "round yellow": 313,
      "round green": 104,
      "wrinkled yellow": 104,
      "wrinkled green": 35,
    });
  });

  it("ignores a genotype that doesn't fit the traits, and refuses one in the state", () => {
    expect(
      cross(crossStart, CrossAction.SetParent, { which: Parent.A, genotype: "Rr" }).parentA,
    ).toBe("TT");
    expect(
      cross(crossStart, CrossAction.SetParent, { which: Parent.A, genotype: "tT" }).parentA,
    ).toBe("Tt");
    expect(applyPatch(crossDef, crossStart, { parentA: "TX" }).isOk).toBe(false);
  });

  it("observes the cross in words and hides the ratio until it is made", () => {
    const o = observationOf(crossDef, crossStart);
    expect(o.summary).toContain("not crossed yet");
    expect(o.hidden).toBeDefined();
    expect(observationOf(crossDef, cross(crossStart, CrossAction.Cross)).hidden).toBeUndefined();
  });
});

const shuffleDef = asAnyProp(chromosomeShuffleDef);
const shuffle = runner<ShuffleState>(shuffleDef);
const shuffleStart: ShuffleState = { ...chromosomeShuffleDef.defaults };
const shuffleView = (s: ShuffleState) => viewOf(shuffleDef, s) as Record<string, unknown>;

describe("chromosome shuffle", () => {
  it("germ cells have one of each pair, and the new cell has pairs again", () => {
    expect(shuffleView(shuffleStart)[ShuffleDerived.GermCellCount]).toBe(3);
    expect(shuffleView(shuffleStart)[ShuffleDerived.ZygoteCount]).toBe(6);
    let s = shuffleStart;
    for (let i = 0; i < 4; i++) s = shuffle(s, ShuffleAction.Next);
    expect(s.step).toBe(0);
  });

  it("sex mode: an X sperm makes a girl, a Y sperm a boy", () => {
    const s = { ...shuffleStart, mode: ShuffleMode.Sex, step: 1 };
    expect(
      shuffleView(shuffle(s, ShuffleAction.PickSperm, { sperm: Sperm.X }))[ShuffleDerived.ChildSex],
    ).toBe("girl");
    expect(
      shuffleView(shuffle(s, ShuffleAction.PickSperm, { sperm: Sperm.Y }))[ShuffleDerived.ChildSex],
    ).toBe("boy");
    const fused = shuffle(s, ShuffleAction.Next);
    expect(fused.sperm).not.toBeNull();
  });

  it("sex mode: many babies come out about half girls, half boys", () => {
    const s = shuffle(
      { ...shuffleStart, mode: ShuffleMode.Sex, growCount: 2000 },
      ShuffleAction.Grow,
    );
    const f = shuffleView(s)[ShuffleDerived.GirlsFraction] as number;
    expect(Math.abs(f - 0.5)).toBeLessThan(0.04);
  });
});

const beetleDef = asAnyProp(beetlePopulationDef);
const beetles = runner<BeetleState>(beetleDef);
const beetleStart: BeetleState = { ...beetlePopulationDef.defaults };

function generations(s: BeetleState, n: number): BeetleState {
  let x = s;
  for (let i = 0; i < n; i++) x = beetles(x, BeetleAction.NextGeneration);
  return x;
}

describe("beetles: natural selection, drift and acquired traits", () => {
  it("with crows, one green beetle's line takes over the bush", () => {
    const one = beetles(beetleStart, BeetleAction.Mutate, { colour: BeetleColour.Green });
    const later = generations(one, 10);
    expect(fractionsOf(later.beetles).green).toBeGreaterThan(0.8);
    expect(later.beetles.red + later.beetles.green + later.beetles.blue).toBeLessThanOrEqual(
      CAPACITY,
    );
  });

  it("without crows, the shares stay as they were: no colour is picked out", () => {
    const s = { ...beetleStart, hasCrows: false, beetles: { red: 9, green: 3, blue: 0 } };
    const later = generations(s, 6);
    expect(Math.abs(fractionsOf(later.beetles).green - 0.25)).toBeLessThan(0.05);
  });

  it("blue gives no advantage with crows around; an elephant leaves a few survivors by chance", () => {
    const counts = { red: 30, green: 0, blue: 6 };
    const outcomes = Array.from({ length: 60 }, (_, i) => trample(counts, i + 1).counts);
    for (const c of outcomes) expect(c.red + c.green + c.blue).toBe(SURVIVORS);
    // Sometimes, by pure luck, the rare blue beetles end up as common as red: genetic drift.
    expect(outcomes.some((c) => c.blue >= c.red)).toBe(true);
    expect(outcomes.some((c) => c.blue === 0)).toBe(true);
  });

  it("small beetles from a food shortage have normal-sized young once food is back: not inherited", () => {
    const base = beetles(beetleStart, BeetleAction.Mutate, { colour: BeetleColour.Green });
    const starved = beetles(base, BeetleAction.SetFood, { food: Food.Scarce });
    expect((viewOf(beetleDef, starved) as Record<string, unknown>).size).toBe("small");
    const after = generations(
      beetles(generations(starved, 2), BeetleAction.SetFood, { food: Food.Plenty }),
      1,
    );
    expect((viewOf(beetleDef, after) as Record<string, unknown>).size).toBe("normal");
    // The colours went exactly as they would have without the shortage.
    expect(after.beetles).toEqual(generations(base, 3).beetles);
  });

  it("speciation: split by a river for long enough, the two hills can no longer interbreed", () => {
    const s = {
      ...beetleStart,
      mode: BeetleMode.Speciation,
      beetles: { red: 18, green: 2, blue: 0 },
    };
    const split = beetles(s, BeetleAction.SetRiver, { on: true });
    const later = generations(split, APART);
    const v = viewOf(beetleDef, later) as Record<string, unknown>;
    expect(v.canInterbreed).toBe(false);
    expect(v.greenRight as number).toBeGreaterThan(v.greenLeft as number);
    expect(
      (viewOf(beetleDef, generations(split, APART - 1)) as Record<string, unknown>).canInterbreed,
    ).toBe(true);
  });
});

const limbDef = asAnyProp(limbBonesDef);
const limbs = runner<LimbState>(limbDef);

describe("limb bones", () => {
  it("knows homologous, analogous and the bird–bat case", () => {
    expect(relationOf(Limb.Human, Limb.Whale)).toBe(Relation.Homologous);
    expect(relationOf(Limb.Dog, Limb.Bat)).toBe(Relation.Homologous);
    expect(relationOf(Limb.Bird, Limb.Butterfly)).toBe(Relation.Analogous);
    expect(relationOf(Limb.Bat, Limb.Bird)).toBe(Relation.Both);
    expect(relationOf(Limb.Human, Limb.Butterfly)).toBe(Relation.Unrelated);
    expect(relationOf(Limb.Human, Limb.Human)).toBeNull();
  });

  it("a new choice replaces the older of the two", () => {
    const s = limbs({ ...limbBonesDef.defaults }, LimbAction.Choose, { limb: Limb.Butterfly });
    expect([s.first, s.second]).toEqual([Limb.Bat, Limb.Butterfly]);
    expect((viewOf(limbDef, s) as Record<string, unknown>).relation).toBe(Relation.Analogous);
  });
});

const fossilDef = asAnyProp(fossilLayersDef);
const fossils = runner<FossilState>(fossilDef);

describe("fossil layers", () => {
  it("digging deeper finds older fossils, and stops at the bottom", () => {
    let s: FossilState = { ...fossilLayersDef.defaults };
    const ages: unknown[] = [];
    for (let i = 0; i < 4; i++) {
      s = fossils(s, FossilAction.Dig);
      ages.push((viewOf(fossilDef, s) as Record<string, unknown>)[FossilDerived.OldestAge]);
    }
    expect(ages).toEqual([10, 70, 100, 100]);
  });
});

/** Every prop's states worth drawing. */
const CASES: [PropModule, Record<string, unknown>][] = [
  ...heredityProps.flatMap((m): [PropModule, Record<string, unknown>][] => {
    const d = m.def.defaults as Record<string, unknown>;
    return [[m, d]];
  }),
];

function more(): [string, Record<string, unknown>][] {
  const c = crossSimulatorDef.defaults;
  const sh = chromosomeShuffleDef.defaults;
  const b = beetlePopulationDef.defaults;
  return [
    ["crossSimulator", { ...c, isCrossed: true, canSetParents: true }],
    [
      "crossSimulator",
      {
        ...c,
        traits: [Trait.SeedShape, Trait.SeedColour],
        parentA: "RrYy",
        parentB: "RrYy",
        isCrossed: true,
        grown: {
          counts: {
            "round yellow": 315,
            "round green": 108,
            "wrinkled yellow": 101,
            "wrinkled green": 32,
          },
          total: 556,
        },
      },
    ],
    [
      "crossSimulator",
      {
        ...c,
        traits: [Trait.Height, Trait.FlowerColour],
        parentA: "TtWw",
        parentB: "ttww",
        isCrossed: true,
      },
    ],
    ["chromosomeShuffle", { ...sh, step: 3 }],
    [
      "chromosomeShuffle",
      {
        ...sh,
        mode: ShuffleMode.Sex,
        step: 3,
        sperm: Sperm.Y,
        babies: { girls: 51, boys: 49 },
        canGrow: true,
      },
    ],
    [
      "beetlePopulation",
      {
        ...b,
        beetles: { red: 10, green: 20, blue: 2 },
        food: Food.Scarce,
        canFood: true,
        canElephant: true,
      },
    ],
    [
      "beetlePopulation",
      { ...b, mode: BeetleMode.Speciation, isSplit: true, generationsApart: APART },
    ],
    ["limbBones", { ...limbBonesDef.defaults, first: Limb.Bird, second: Limb.Whale }],
    ["fossilLayers", { ...fossilLayersDef.defaults, dug: 3 }],
    ["fossilLayers", { ...fossilLayersDef.defaults, mode: FossilMode.Form, step: 3 }],
    ...Object.values(HeredityScene).map((scene): [string, Record<string, unknown>] => [
      "heredityScene",
      { scene },
    ]),
  ];
}

describe("every view draws", () => {
  const byType = new Map(heredityProps.map((m) => [m.def.type, m]));
  const all: [PropModule, Record<string, unknown>][] = [
    ...CASES,
    ...more().map(([type, s]): [PropModule, Record<string, unknown>] => [
      byType.get(type) as PropModule,
      s,
    ]),
  ];
  it.each(all.map(([m, s], i) => [i, m.def.type, m, s] as const))("%i %s", (_i, _type, m, s) => {
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
        if (locale === "hi" && m.def.type !== "heredityScene") expect(html).toMatch(/[ऀ-ॿ]/);
      }
    expect(observationOf(m.def, s).summary.length).toBeGreaterThan(20);
  });

  it("the story panel is one of each scene", () => {
    expect(Object.keys(HeredityScene).length).toBe(8);
    expect(heredityStoryDef.type).toBe("heredityScene");
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
