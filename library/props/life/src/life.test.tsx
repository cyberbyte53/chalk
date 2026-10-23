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
  BreathingAction,
  BreathingMode,
  Chamber,
  DiffusionAction,
  DigestionAction,
  DigestionMode,
  type DigestionState,
  Drink,
  FILTERED,
  FeedingAction,
  FeedingKind,
  type FeedingState,
  GasSource,
  HEART_STEPS,
  HeartAction,
  HeartMode,
  LeafAction,
  LeafMode,
  type LeafState,
  LifeScene,
  MAX_BUBBLES,
  NephronAction,
  NephronMode,
  RespirationAction,
  RespirationMode,
  RespirationSignal,
  type RespirationState,
  Route,
  STAGES,
  Season,
  Stage,
  Substance,
  TransportAction,
  TransportMode,
  URINE,
  URINE_LITRES,
  breathingDef,
  cellFeedingDef,
  countsOf,
  diffusionReachDef,
  digestiveTractDef,
  heartDef,
  inTubeAt,
  leafLabDef,
  lifeProps,
  lifeSceneDef,
  nephronDef,
  plantTransportDef,
  reabsorbedPercentOf,
  respirationPathsDef,
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

describe("diffusion is not enough for a big body", () => {
  it("a single cell is fully fed; a body 3 cells deep starves its 9 inner cells", () => {
    expect(countsOf({ layers: 1, hasTransport: false })).toEqual({ cells: 1, fed: 1 });
    expect(countsOf({ layers: 3, hasTransport: false })).toEqual({ cells: 25, fed: 16 });
    expect(countsOf({ layers: 5, hasTransport: false })).toEqual({ cells: 81, fed: 32 });
  });
  it("the fed fraction shrinks as the body grows, until a transport system feeds every cell", () => {
    let last = 2;
    for (let layers = 1; layers <= 5; layers++) {
      const v = view(diffusionReachDef, { ...diffusionReachDef.defaults, layers });
      expect(v.fedFraction as number).toBeLessThanOrEqual(last);
      last = v.fedFraction as number;
      const t = view(diffusionReachDef, {
        ...diffusionReachDef.defaults,
        layers,
        hasTransport: true,
      });
      expect(t.starving).toBe(0);
    }
  });
  it("actions change size and transport and announce the counts", () => {
    const run = runner(diffusionReachDef);
    const a = run({ ...diffusionReachDef.defaults }, DiffusionAction.SetLayers, { layers: 1 });
    expect(a.state.layers).toBe(1);
    expect(a.signals).toEqual(["changed"]);
    const b = run(a.state, DiffusionAction.SetTransport, { on: true });
    expect(b.state.hasTransport).toBe(true);
  });
});

describe("leaf lab", () => {
  const run = runner(leafLabDef);
  it("the variegated leaf shows starch only at the last step, and only where it was green", () => {
    let s = { ...leafLabDef.defaults };
    for (let i = 0; i < 4; i++) {
      expect(view(leafLabDef, s).starchIn).toBeNull();
      s = run(s, LeafAction.Next).state;
    }
    s = run(s, LeafAction.Next).state;
    expect(s.step).toBe(5);
    expect(view(leafLabDef, s).starchIn).toBe("greenPartsOnly");
    expect(run(s, LeafAction.Next).state.step).toBe(5);
  });
  it("in the bell-jar experiment only the plant without potassium hydroxide makes starch", () => {
    let s: LeafState = { ...leafLabDef.defaults, mode: LeafMode.BellJar };
    s = run(run(s, LeafAction.Next).state, LeafAction.Next).state;
    expect(s.step).toBe(2);
    expect(view(leafLabDef, s).starchIn).toBe("plantWithoutKoh");
    expect(run(s, LeafAction.Next).state.step).toBe(2);
  });
  it("refuses a bell-jar step past its last", () => {
    const def = asAnyProp(leafLabDef) as AnyPropDef;
    const next = applyPatch(def, { ...leafLabDef.defaults, mode: LeafMode.BellJar }, { step: 4 });
    expect(next.isOk).toBe(false);
  });
  it("open stomata let carbon dioxide in and oxygen and water vapour out; closed, nothing", () => {
    const open = view(leafLabDef, { ...leafLabDef.defaults, mode: LeafMode.Stomata, isOpen: true });
    expect(open.gasesIn).toEqual(["carbonDioxide"]);
    expect(open.gasesOut).toEqual(["oxygen", "waterVapour"]);
    const closed = view(leafLabDef, {
      ...leafLabDef.defaults,
      mode: LeafMode.Stomata,
      isOpen: false,
    });
    expect(closed.gasesIn).toEqual([]);
  });
  it("by day a plant gives out oxygen; at night carbon dioxide", () => {
    const day = view(leafLabDef, { ...leafLabDef.defaults, mode: LeafMode.DayNight, isDay: true });
    const night = view(leafLabDef, {
      ...leafLabDef.defaults,
      mode: LeafMode.DayNight,
      isDay: false,
    });
    expect(day.gasesOut).toEqual(["oxygen"]);
    expect(night.gasesOut).toEqual(["carbonDioxide"]);
  });
});

describe("cell feeding", () => {
  it("Amoeba has 4 steps, Paramoecium 2, and steps stop at the last", () => {
    const run = runner(cellFeedingDef);
    let s = { ...cellFeedingDef.defaults };
    for (let i = 0; i < 6; i++) s = run(s, FeedingAction.Next).state;
    expect(s.step).toBe(3);
    let p: FeedingState = { ...cellFeedingDef.defaults, kind: FeedingKind.Paramoecium };
    for (let i = 0; i < 6; i++) p = run(p, FeedingAction.Next).state;
    expect(p.step).toBe(1);
    expect(view(cellFeedingDef, p).isDone).toBe(true);
  });
});

describe("digestion", () => {
  const forms = (stage: Stage) => {
    const v = view(digestiveTractDef, {
      ...digestiveTractDef.defaults,
      step: STAGES.indexOf(stage),
    });
    return [v.starch, v.protein, v.fat];
  };
  it("starch starts in the mouth, protein in the stomach, fat only in the small intestine", () => {
    expect(forms(Stage.Mouth)).toEqual(["begun", "whole", "whole"]);
    expect(forms(Stage.Stomach)).toEqual(["begun", "begun", "whole"]);
    expect(forms(Stage.SmallIntestine)).toEqual(["simple", "simple", "simple"]);
    expect(forms(Stage.Villi)).toEqual(["absorbed", "absorbed", "absorbed"]);
  });
  it("the stomach's juices are acid, pepsin and mucus; bile and pancreatic juice come in the small intestine", () => {
    const st = view(digestiveTractDef, { ...digestiveTractDef.defaults, step: 2 });
    expect((st.juices as string[]).join(" ")).toMatch(/hydrochloric acid.*pepsin.*mucus/);
    const si = view(digestiveTractDef, { ...digestiveTractDef.defaults, step: 3 });
    expect((si.juices as string[]).join(" ")).toMatch(/bile.*pancreatic/);
  });
  it("moving on, back and jumping to a part", () => {
    const run = runner(digestiveTractDef);
    let s = { ...digestiveTractDef.defaults };
    for (let i = 0; i < 10; i++) s = run(s, DigestionAction.Next).state;
    expect(s.step).toBe(STAGES.length - 1);
    s = run(s, DigestionAction.Back).state;
    expect(s.step).toBe(STAGES.length - 2);
    expect(run(s, DigestionAction.GoTo, { stage: Stage.Stomach }).state.step).toBe(2);
  });
  it("in the saliva test only tube B keeps its starch", () => {
    const run = runner(digestiveTractDef);
    let s: DigestionState = { ...digestiveTractDef.defaults, mode: DigestionMode.SalivaTest };
    expect(view(digestiveTractDef, s).starchLeftIn).toBeNull();
    s = run(run(s, DigestionAction.Next).state, DigestionAction.Next).state;
    expect(view(digestiveTractDef, s).starchLeftIn).toBe("B");
    expect(run(s, DigestionAction.Next).state.step).toBe(2);
  });
});

describe("respiration", () => {
  const run = runner(respirationPathsDef);
  it("aerobic respiration happens in the mitochondria, needs oxygen and gives the most energy", () => {
    const a = view(respirationPathsDef, { ...respirationPathsDef.defaults, route: Route.Aerobic });
    expect(a.place).toBe("mitochondria");
    expect(a.needsOxygen).toBe(true);
    expect(a.energy).toBe("a lot");
    expect(a.products).toEqual(["carbon dioxide", "water", "energy"]);
  });
  it("yeast makes ethanol and carbon dioxide; tired muscle makes lactic acid; both in the cytoplasm", () => {
    const y = view(respirationPathsDef, { ...respirationPathsDef.defaults, route: Route.Yeast });
    expect(y.products).toContain("ethanol");
    expect(y.place).toBe("cytoplasm");
    const m = view(respirationPathsDef, { ...respirationPathsDef.defaults, route: Route.Muscle });
    expect(m.products).toContain("lactic acid");
    expect(m.energy).toBe("a little");
  });
  it("breathed-out air turns lime water milky in 3 rounds; pichkari air not even in 8", () => {
    let s: RespirationState = {
      ...respirationPathsDef.defaults,
      mode: RespirationMode.LimeWater,
      source: GasSource.Breath,
    };
    const signals: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = run(s, RespirationAction.Bubble);
      s = r.state;
      signals.push(...r.signals);
    }
    expect(view(respirationPathsDef, s).isMilky).toBe(true);
    expect(signals.filter((x) => x === RespirationSignal.TurnedMilky)).toHaveLength(1);
    let p: RespirationState = { ...s, source: GasSource.Pichkari, bubbles: 0 };
    for (let i = 0; i < MAX_BUBBLES + 2; i++) p = run(p, RespirationAction.Bubble).state;
    expect(p.bubbles).toBe(MAX_BUBBLES);
    expect(view(respirationPathsDef, p).isMilky).toBe(false);
  });
  it("changing the gas source starts with fresh lime water", () => {
    const s = { ...respirationPathsDef.defaults, mode: RespirationMode.LimeWater, bubbles: 4 };
    expect(run(s, RespirationAction.SetSource, { source: GasSource.Yeast }).state.bubbles).toBe(0);
  });
});

describe("breathing", () => {
  it("breathing in: ribs lifted, diaphragm flat, chest larger, air in", () => {
    const run = runner(breathingDef);
    const r = run({ ...breathingDef.defaults }, BreathingAction.SetPhase, { in: true });
    const v = view(breathingDef, r.state);
    expect([v.ribs, v.diaphragm, v.chest, v.airFlow]).toEqual(["lifted", "flat", "larger", "in"]);
    const out = view(breathingDef, run(r.state, BreathingAction.SetPhase, { in: false }).state);
    expect([out.ribs, out.diaphragm, out.chest, out.airFlow]).toEqual([
      "lowered",
      "domed",
      "smaller",
      "out",
    ]);
  });
});

describe("heart", () => {
  it("follows NCERT's six steps: the left side first, ventricles pumping to body and lungs", () => {
    expect(HEART_STEPS.map((x) => x.to)).toEqual([
      "leftAtrium",
      "leftVentricle",
      "body",
      "rightAtrium",
      "rightVentricle",
      "lungs",
    ]);
    expect(HEART_STEPS.find((x) => x.to === "body")?.contracts).toBe(Chamber.LeftVentricle);
    expect(HEART_STEPS.find((x) => x.to === "lungs")?.contracts).toBe(Chamber.RightVentricle);
  });
  it("blood in the first three steps is oxygen-rich; Next wraps round", () => {
    const run = runner(heartDef);
    let s = { ...heartDef.defaults };
    const rich: unknown[] = [];
    for (let i = 0; i < 6; i++) {
      rich.push(view(heartDef, s).isOxygenRich);
      s = run(s, HeartAction.Next).state;
    }
    expect(rich).toEqual([true, true, true, false, false, false]);
    expect(s.step).toBe(0);
  });
});

describe("plant transport", () => {
  it("transpiration pull by day, root pressure at night; phloem down in summer, up in spring", () => {
    const run = runner(plantTransportDef);
    const night = run({ ...plantTransportDef.defaults }, TransportAction.SetDay, {
      day: false,
    }).state;
    expect(view(plantTransportDef, night).mainForce).toBe("rootPressure");
    expect(view(plantTransportDef, { ...night, isDay: true }).mainForce).toBe("transpirationPull");
    const spring = run(
      { ...plantTransportDef.defaults, mode: TransportMode.Food },
      TransportAction.SetSeason,
      { season: Season.Spring },
    ).state;
    expect(view(plantTransportDef, spring).direction).toBe("up");
  });
  it("only the plant's cover mists over", () => {
    const run = runner(plantTransportDef);
    const s = { ...plantTransportDef.defaults, mode: TransportMode.Bag };
    expect(view(plantTransportDef, s).dropletsOn).toBeNull();
    expect(view(plantTransportDef, run(s, TransportAction.Next).state).dropletsOn).toBe("plant");
  });
});

describe("nephron", () => {
  it("cells and proteins are never filtered; urine is urea in water", () => {
    expect(FILTERED).not.toContain(Substance.Cells);
    expect(FILTERED).not.toContain(Substance.Proteins);
    expect(FILTERED).toContain(Substance.Glucose);
    expect(URINE).toEqual([Substance.Urea, Substance.Water]);
    expect(inTubeAt(0)).toEqual([]);
    expect(inTubeAt(3)).not.toContain(Substance.Glucose);
  });
  it("more water drunk, more urine; nearly all of the 180 L of filtrate is taken back", () => {
    expect(URINE_LITRES.little).toBeLessThan(URINE_LITRES.normal);
    expect(URINE_LITRES.normal).toBeLessThan(URINE_LITRES.lots);
    for (const d of Object.values(Drink)) expect(reabsorbedPercentOf(d)).toBeGreaterThan(98);
    const run = runner(nephronDef);
    const s = run({ ...nephronDef.defaults, mode: NephronMode.Water }, NephronAction.SetDrink, {
      drink: Drink.Lots,
    });
    expect(view(nephronDef, s.state).urineLitres).toBe(URINE_LITRES.lots);
    expect(s.signals).toEqual(["drinkChanged"]);
  });
});

const CASES: [string, Record<string, unknown>][] = [
  ["diffusionReach", { ...diffusionReachDef.defaults }],
  ["diffusionReach", { ...diffusionReachDef.defaults, layers: 5, hasTransport: true }],
  ["diffusionReach", { ...diffusionReachDef.defaults, layers: 1 }],
  ...[0, 1, 2, 3, 4, 5].map((step): [string, Record<string, unknown>] => [
    "leafLab",
    { ...leafLabDef.defaults, step },
  ]),
  ["leafLab", { ...leafLabDef.defaults, mode: LeafMode.Stomata }],
  ["leafLab", { ...leafLabDef.defaults, mode: LeafMode.Stomata, isOpen: false }],
  ["leafLab", { ...leafLabDef.defaults, mode: LeafMode.BellJar, step: 2 }],
  ["leafLab", { ...leafLabDef.defaults, mode: LeafMode.DayNight, isDay: false }],
  ...[0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
    "cellFeeding",
    { ...cellFeedingDef.defaults, step },
  ]),
  ["cellFeeding", { ...cellFeedingDef.defaults, kind: FeedingKind.Paramoecium, step: 1 }],
  ...STAGES.map((_, step): [string, Record<string, unknown>] => [
    "digestiveTract",
    { ...digestiveTractDef.defaults, step },
  ]),
  ["digestiveTract", { ...digestiveTractDef.defaults, mode: DigestionMode.SalivaTest, step: 2 }],
  ...[0, 1, 2].map((step): [string, Record<string, unknown>] => [
    "respirationPaths",
    { ...respirationPathsDef.defaults, step },
  ]),
  ["respirationPaths", { ...respirationPathsDef.defaults, step: 2, route: Route.Yeast }],
  ["respirationPaths", { ...respirationPathsDef.defaults, step: 2, route: Route.Muscle }],
  [
    "respirationPaths",
    { ...respirationPathsDef.defaults, mode: RespirationMode.LimeWater, bubbles: 3 },
  ],
  [
    "respirationPaths",
    {
      ...respirationPathsDef.defaults,
      mode: RespirationMode.LimeWater,
      source: GasSource.Yeast,
      bubbles: 1,
    },
  ],
  [
    "respirationPaths",
    {
      ...respirationPathsDef.defaults,
      mode: RespirationMode.LimeWater,
      source: GasSource.Pichkari,
    },
  ],
  ["breathing", { ...breathingDef.defaults, isIn: true }],
  ["breathing", { ...breathingDef.defaults }],
  ["breathing", { ...breathingDef.defaults, mode: BreathingMode.Alveolus }],
  ["breathing", { ...breathingDef.defaults, mode: BreathingMode.Fish }],
  ...[0, 1, 2, 3, 4, 5].map((step): [string, Record<string, unknown>] => [
    "heart",
    { ...heartDef.defaults, step },
  ]),
  ["heart", { ...heartDef.defaults, mode: HeartMode.Circulation }],
  ["heart", { ...heartDef.defaults, mode: HeartMode.Fish }],
  ["heart", { ...heartDef.defaults, mode: HeartMode.Vessels }],
  ["plantTransport", { ...plantTransportDef.defaults }],
  ["plantTransport", { ...plantTransportDef.defaults, isDay: false }],
  ["plantTransport", { ...plantTransportDef.defaults, mode: TransportMode.Food }],
  [
    "plantTransport",
    { ...plantTransportDef.defaults, mode: TransportMode.Food, season: Season.Spring },
  ],
  ["plantTransport", { ...plantTransportDef.defaults, mode: TransportMode.Bag, step: 1 }],
  ...[0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
    "nephron",
    { ...nephronDef.defaults, step },
  ]),
  ["nephron", { ...nephronDef.defaults, mode: NephronMode.System }],
  ["nephron", { ...nephronDef.defaults, mode: NephronMode.Water, drink: Drink.Little }],
  ["nephron", { ...nephronDef.defaults, mode: NephronMode.Dialysis }],
  ...Object.values(LifeScene).map((scene): [string, Record<string, unknown>] => [
    "lifeScene",
    { scene },
  ]),
];

describe("every view draws", () => {
  const byType = new Map(lifeProps.map((m) => [m.def.type, m]));
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
        if (locale === "hi" && type !== "lifeScene") expect(html).toMatch(/[ऀ-ॿ]/);
      }
    expect(observationOf(m.def, s).summary.length).toBeGreaterThan(20);
  });

  it("ten props, the scene prop has one picture per scene", () => {
    expect(lifeProps).toHaveLength(10);
    expect(lifeSceneDef.type).toBe("lifeScene");
    expect(Object.keys(LifeScene)).toHaveLength(11);
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
