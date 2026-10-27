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
  BURN_AT,
  Body,
  BrainAction,
  BrainRegion,
  type BrainState,
  BrainTask,
  ControlScene,
  DIVISION_OF,
  Direction,
  Division,
  Effect,
  EndocrineAction,
  type EndocrineState,
  GLANDS,
  Gland,
  HormoneAction,
  type HormoneState,
  LAST_NEURON_STEP,
  MAX_INSULIN,
  NeuronAction,
  type NeuronState,
  NeuronTarget,
  PLANT_HORMONES,
  PlantAction,
  PlantHormone,
  PlantKind,
  type PlantState,
  ReflexAction,
  ReflexPath,
  type ReflexState,
  ResponseAction,
  ResponseMode,
  type ResponseState,
  SUGAR,
  SUGAR_HISTORY,
  Side,
  SignalForm,
  TUBE_DAYS,
  brainMapDef,
  controlProps,
  controlSceneDef,
  endocrineMapDef,
  formAt,
  glandsOf,
  hormoneResponseDef,
  isBurnt,
  isSugarNormal,
  neuronSignalDef,
  plantHormonesDef,
  plantMovementDef,
  reflexArcDef,
  rootGoes,
  shootGoes,
  ticksAt,
  totalTicks,
} from "./index";

type Emitted = { signal: string; payload?: Readonly<Record<string, unknown>> }[];

/** Runs one action and returns the new state and what it emitted. */
function runner<S extends Record<string, unknown>>(def: AnyPropDef) {
  return (state: S, name: string, args: Record<string, unknown> = {}): [S, Emitted] => {
    const result = prepareAction(def, state, name, args);
    if (!result.isOk) throw new Error(result.errors.join("; "));
    if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
    const emitted = [...result.effect.emit];
    const next = applyPatch(def, state, result.effect.set);
    if (!next.isOk) throw new Error(next.errors.join("; "));
    return [next.state as S, emitted];
  };
}
const derivedOf = (def: AnyPropDef, s: Record<string, unknown>) =>
  viewOf(def, s) as Record<string, unknown>;

describe("neuronSignal", () => {
  const def = asAnyProp(neuronSignalDef);
  const run = runner<NeuronState>(def);
  const start: NeuronState = { ...neuronSignalDef.defaults };

  it("is electrical along the neuron, chemical only across the synapse", () => {
    expect(formAt(0)).toBe(SignalForm.None);
    expect([1, 2, 3, 4].map(formAt)).toEqual(Array(4).fill(SignalForm.Electrical));
    expect(formAt(5)).toBe(SignalForm.Chemical);
    expect(formAt(6)).toBe(SignalForm.Electrical);
  });

  it("steps dendrite → cell body → axon → nerve ending → synapse → next cell, then back to rest", () => {
    let s = start;
    const at: unknown[] = [];
    let last: Emitted = [];
    for (let i = 0; i < LAST_NEURON_STEP; i++) {
      [s, last] = run(s, NeuronAction.Next);
      at.push(derivedOf(def, s).at);
    }
    expect(at).toEqual(["dendrite", "cellBody", "axon", "nerveEnding", "synapse", "next"]);
    expect(last[0]?.signal).toBe("arrived");
    expect(derivedOf(def, s).hasArrived).toBe(true);
    [s] = run(s, NeuronAction.Next);
    expect(s.step).toBe(0);
  });

  it("switching to a muscle starts again", () => {
    const [s] = run({ ...start, step: 4 }, NeuronAction.SetTarget, { target: NeuronTarget.Muscle });
    expect(s).toMatchObject({ step: 0, target: NeuronTarget.Muscle });
  });
});

describe("reflexArc", () => {
  const def = asAnyProp(reflexArcDef);
  const run = runner<ReflexState>(def);
  const start: ReflexState = { ...reflexArcDef.defaults };

  it("the reflex path is quicker than the think-first path, and only the slow one burns", () => {
    expect(totalTicks(ReflexPath.Reflex)).toBeLessThanOrEqual(BURN_AT);
    expect(totalTicks(ReflexPath.Brain)).toBeGreaterThan(BURN_AT);
    expect(totalTicks(ReflexPath.Reflex)).toBeLessThan(totalTicks(ReflexPath.Brain));
  });

  it("time only goes up as the message travels", () => {
    for (const path of [ReflexPath.Reflex, ReflexPath.Brain])
      for (let step = 1; step < 5; step++)
        expect(ticksAt(path, step)).toBeGreaterThanOrEqual(ticksAt(path, step - 1));
  });

  it("stepping to the end raises done, burnt only on the think-first path", () => {
    for (const path of [ReflexPath.Reflex, ReflexPath.Brain]) {
      let [s] = run(start, ReflexAction.Choose, { path });
      let done: Emitted = [];
      while (!derivedOf(def, s).isDone) [s, done] = run(s, ReflexAction.Next);
      expect(done[0]?.signal).toBe("done");
      expect(done[0]?.payload?.isBurnt).toBe(path === ReflexPath.Brain);
      expect(isBurnt(s)).toBe(path === ReflexPath.Brain);
    }
  });

  it("refuses a step beyond the chosen path", () => {
    const result = applyPatch(def, start, { path: ReflexPath.Reflex, step: 7 });
    expect(result.isOk).toBe(false);
  });
});

describe("brainMap", () => {
  const def = asAnyProp(brainMapDef);
  const run = runner<BrainState>(def);
  const start: BrainState = { ...brainMapDef.defaults };

  it("groups the parts as NCERT does", () => {
    expect(DIVISION_OF[BrainRegion.Cerebrum]).toBe(Division.Fore);
    expect(DIVISION_OF[BrainRegion.Cerebellum]).toBe(Division.Hind);
    expect(DIVISION_OF[BrainRegion.Medulla]).toBe(Division.Hind);
    expect(DIVISION_OF[BrainRegion.MidBrain]).toBe(Division.Mid);
  });

  it("ask mode judges the tap: balance is the cerebellum, mouth watering the medulla", () => {
    const [asked] = run(start, BrainAction.Ask, { task: BrainTask.RideBicycle });
    const [wrong, w] = run(asked, BrainAction.Tap, { region: BrainRegion.Medulla });
    expect(w[0]?.payload?.isRight).toBe(false);
    expect(derivedOf(def, wrong).isRight).toBe(false);
    const [right] = run(asked, BrainAction.Tap, { region: BrainRegion.Cerebellum });
    expect(derivedOf(def, right).isRight).toBe(true);
    const [, m] = run({ ...start, ask: BrainTask.MouthWaters }, BrainAction.Tap, {
      region: BrainRegion.Medulla,
    });
    expect(m[0]?.payload?.isRight).toBe(true);
    const [, r] = run({ ...start, ask: BrainTask.PullFromFlame }, BrainAction.Tap, {
      region: BrainRegion.SpinalCord,
    });
    expect(r[0]?.payload?.isRight).toBe(true);
  });

  it("explore mode just picks", () => {
    const [s, e] = run(start, BrainAction.Tap, { region: BrainRegion.Pons });
    expect(e[0]?.signal).toBe("picked");
    expect(derivedOf(def, s).division).toBe(Division.Hind);
  });
});

describe("plantMovement", () => {
  const def = asAnyProp(plantMovementDef);
  const run = runner<PlantState>(def);
  const photo: PlantState = { ...plantMovementDef.defaults, kind: PlantKind.Phototropism };

  it("phototropism: the shoot grows towards the light and the root away from it", () => {
    for (const side of [Side.Left, Side.Right]) {
      let [s] = run(photo, PlantAction.SetSide, { side });
      [s] = run(s, PlantAction.Grow);
      [s] = run(s, PlantAction.Grow);
      expect(shootGoes(s)).toBe(side === Side.Left ? Direction.Left : Direction.Right);
      expect(rootGoes(s)).toBe(side === Side.Left ? Direction.Right : Direction.Left);
    }
  });

  it("moving the light changes only the new growth (Activity 7.2)", () => {
    let [s] = run(photo, PlantAction.Grow);
    [s] = run(s, PlantAction.Grow);
    const before = [...s.shoot];
    [s] = run(s, PlantAction.SetSide, { side: Side.Left });
    [s] = run(s, PlantAction.Grow);
    expect(s.shoot.slice(0, before.length)).toEqual(before);
    expect(shootGoes(s)).toBe(Direction.Left);
  });

  it("geotropism: laid on its side, old growth turns with the pot but new root grows down, new shoot up", () => {
    const geo: PlantState = { ...plantMovementDef.defaults, kind: PlantKind.Geotropism };
    let [s] = run(geo, PlantAction.Grow);
    [s] = run(s, PlantAction.Turn);
    expect(shootGoes(s)).toBe(Direction.Right);
    [s] = run(s, PlantAction.Grow);
    expect(shootGoes(s)).toBe(Direction.Up);
    expect(rootGoes(s)).toBe(Direction.Down);
  });

  it("hydrotropism: the root grows towards the water, the shoot up", () => {
    const hydro: PlantState = {
      ...plantMovementDef.defaults,
      kind: PlantKind.Hydrotropism,
      side: Side.Left,
    };
    const [s] = run(hydro, PlantAction.Grow);
    expect(rootGoes(s)).toBe(Direction.Left);
    expect(shootGoes(s)).toBe(Direction.Up);
  });

  it("the touch-me-not folds at once, with no growth", () => {
    const touch: PlantState = { ...plantMovementDef.defaults, kind: PlantKind.TouchMeNot };
    const [s, e] = run(touch, PlantAction.Touch);
    expect(s.isFolded).toBe(true);
    expect(s.days).toBe(0);
    expect(e[0]?.signal).toBe("touched");
    expect(run(s, PlantAction.Recover)[0].isFolded).toBe(false);
  });

  it("the pollen tube reaches the ovule after its days of growth; the tendril coils day by day", () => {
    let s: PlantState = { ...plantMovementDef.defaults, kind: PlantKind.PollenTube };
    for (let d = 0; d < TUBE_DAYS; d++) {
      expect(derivedOf(def, s).hasReachedOvule).toBe(false);
      [s] = run(s, PlantAction.Grow);
    }
    expect(derivedOf(def, s).hasReachedOvule).toBe(true);
    let t: PlantState = { ...plantMovementDef.defaults, kind: PlantKind.Tendril };
    [t] = run(t, PlantAction.Grow);
    [t] = run(t, PlantAction.Grow);
    expect(derivedOf(def, t).coils).toBe(2);
  });
});

describe("plantHormones", () => {
  const def = asAnyProp(plantHormonesDef);
  const run = runner<HormoneState>(def);
  it("auxin, gibberellins and cytokinins promote growth; abscisic acid stops it", () => {
    expect(PLANT_HORMONES[PlantHormone.Auxin].effect).toBe(Effect.Promotes);
    expect(PLANT_HORMONES[PlantHormone.Gibberellin].effect).toBe(Effect.Promotes);
    expect(PLANT_HORMONES[PlantHormone.Cytokinin].effect).toBe(Effect.Promotes);
    expect(PLANT_HORMONES[PlantHormone.AbscisicAcid].effect).toBe(Effect.Inhibits);
    const [s, e] = run({ ...plantHormonesDef.defaults }, HormoneAction.Pick, {
      hormone: PlantHormone.AbscisicAcid,
    });
    expect(derivedOf(def, s).effect).toBe(Effect.Inhibits);
    expect(e[0]?.payload?.effect).toBe(Effect.Inhibits);
  });
});

describe("endocrineMap", () => {
  const def = asAnyProp(endocrineMapDef);
  const run = runner<EndocrineState>(def);
  const start: EndocrineState = { ...endocrineMapDef.defaults };

  it("matches Table 7.1", () => {
    expect(GLANDS[Gland.Pituitary].hormone.en).toBe("Growth hormone");
    expect(GLANDS[Gland.Thyroid].hormone.en).toBe("Thyroxin");
    expect(GLANDS[Gland.Pancreas].hormone.en).toBe("Insulin");
    expect(GLANDS[Gland.Testes].hormone.en).toBe("Testosterone");
    expect(GLANDS[Gland.Ovaries].hormone.en).toBe("Oestrogen");
    expect(GLANDS[Gland.Adrenal].hormone.en).toBe("Adrenaline");
  });

  it("each body has its own sex glands; switching drops a gland the new body lacks", () => {
    expect(glandsOf(Body.Male)).not.toContain(Gland.Ovaries);
    expect(glandsOf(Body.Female)).not.toContain(Gland.Testes);
    let [s] = run(start, EndocrineAction.Tap, { gland: Gland.Testes });
    [s] = run(s, EndocrineAction.SetBody, { body: Body.Female });
    expect(s.selected).toBeNull();
    [s] = run(s, EndocrineAction.Tap, { gland: Gland.Testes });
    expect(s.selected).toBeNull();
    [s] = run(s, EndocrineAction.Tap, { gland: Gland.Thyroid });
    [s] = run(s, EndocrineAction.SetBody, { body: Body.Male });
    expect(s.selected).toBe(Gland.Thyroid);
  });
});

describe("hormoneResponse", () => {
  const def = asAnyProp(hormoneResponseDef);
  const run = runner<ResponseState>(def);
  const sugar: ResponseState = { ...hormoneResponseDef.defaults, mode: ResponseMode.BloodSugar };

  it("adrenaline: a scare speeds the heart and sends blood to the muscles; calm undoes it", () => {
    const start: ResponseState = { ...hormoneResponseDef.defaults };
    const [scared] = run(start, ResponseAction.Scare);
    expect(derivedOf(def, scared)).toMatchObject({ heartRate: "fast", bloodToMuscles: "more" });
    const [calm] = run(scared, ResponseAction.Calm);
    expect(derivedOf(def, calm).heartRate).toBe("normal");
  });

  it("feedback: after a meal insulin rises, the sugar returns to normal, then insulin falls", () => {
    let [s] = run(sugar, ResponseAction.Eat);
    expect(isSugarNormal(s.sugar)).toBe(false);
    const insulin: number[] = [];
    for (let i = 0; i < 6; i++) {
      [s] = run(s, ResponseAction.Wait);
      insulin.push(s.insulin);
    }
    expect(isSugarNormal(s.sugar)).toBe(true);
    expect(Math.max(...insulin)).toBeGreaterThan(0);
    expect(Math.max(...insulin)).toBeLessThanOrEqual(MAX_INSULIN);
    expect(insulin[insulin.length - 1]).toBe(0);
  });

  it("without insulin (diabetes) the sugar stays high", () => {
    let [s] = run({ ...sugar, hasInsulin: false }, ResponseAction.Eat);
    for (let i = 0; i < 6; i++) [s] = run(s, ResponseAction.Wait);
    expect(s.sugar).toBeGreaterThan(SUGAR.high);
    expect(s.insulin).toBe(0);
  });

  it("keeps only the last readings", () => {
    let s = sugar;
    for (let i = 0; i < 20; i++)
      [s] = run(s, i % 2 === 0 ? ResponseAction.Eat : ResponseAction.Wait);
    expect(s.history.length).toBe(SUGAR_HISTORY);
  });
});

describe("every view draws", () => {
  const byType = new Map(controlProps.map((m) => [m.def.type, m]));
  const d = (t: string) => (byType.get(t)?.def.defaults ?? {}) as Record<string, unknown>;
  const cases: [string, Record<string, unknown>][] = [
    ...[0, 3, 5, 6].map((step): [string, Record<string, unknown>] => [
      "neuronSignal",
      { ...d("neuronSignal"), step },
    ]),
    ["neuronSignal", { ...d("neuronSignal"), step: 6, target: "muscle", canSetTarget: true }],
    ...[0, 2, 4].map((step): [string, Record<string, unknown>] => [
      "reflexArc",
      { ...d("reflexArc"), step },
    ]),
    ["reflexArc", { ...d("reflexArc"), path: "brain", step: 7 }],
    ["brainMap", { ...d("brainMap") }],
    ["brainMap", { ...d("brainMap"), ask: "rideBicycle", selected: "medulla" }],
    ...Object.values(PlantKind).map((kind): [string, Record<string, unknown>] => [
      "plantMovement",
      { ...d("plantMovement"), kind },
    ]),
    [
      "plantMovement",
      {
        ...d("plantMovement"),
        days: 3,
        shoot: [0, 40, 40, 40],
        root: [180, 210, 210, 210],
        showAuxin: true,
      },
    ],
    ["plantMovement", { ...d("plantMovement"), kind: "touchMeNot", isFolded: true }],
    ["plantMovement", { ...d("plantMovement"), kind: "pollenTube", days: 3 }],
    ["plantHormones", { ...d("plantHormones") }],
    ["plantHormones", { ...d("plantHormones"), selected: "auxin", showEffects: true }],
    ["endocrineMap", { ...d("endocrineMap") }],
    ["endocrineMap", { ...d("endocrineMap"), body: "female", selected: "ovaries" }],
    ["hormoneResponse", { ...d("hormoneResponse") }],
    ["hormoneResponse", { ...d("hormoneResponse"), isScared: true }],
    [
      "hormoneResponse",
      { ...d("hormoneResponse"), mode: "bloodSugar", sugar: 9, insulin: 1, history: [5, 9] },
    ],
    ...Object.values(ControlScene).map((scene): [string, Record<string, unknown>] => [
      "controlScene",
      { scene },
    ]),
  ];
  it.each(cases.map(([t, s], i) => [i, t, s] as const))("%i %s", (_i, type, s) => {
    const m = byType.get(type) as PropModule;
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
        if (locale === "hi" && type !== "controlScene") expect(html).toMatch(/[ऀ-ॿ]/);
      }
    expect(observationOf(m.def, s).summary.length).toBeGreaterThan(20);
  });

  it("has one of each prop, and the story panel has eight scenes", () => {
    expect(controlProps.map((m) => m.def.type).sort()).toEqual(
      [
        "brainMap",
        "controlScene",
        "endocrineMap",
        "hormoneResponse",
        "neuronSignal",
        "plantHormones",
        "plantMovement",
        "reflexArc",
      ].sort(),
    );
    expect(Object.keys(ControlScene).length).toBe(8);
    expect(controlSceneDef.type).toBe("controlScene");
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
