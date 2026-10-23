import type { PropViewProps } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { ComponentType } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  Colour,
  Experiment,
  cardIds,
  dieIds,
  draw,
  isFaceCard,
  probabilityOf,
  twoDiceIds,
} from "./chance";
import { MANY, RunAction, RunDerived, RunSignal, type RunState, chanceRun } from "./chance-run";
import { ChanceRunView } from "./chance-run-view";
import { ScaleAction, ScaleSignal, type ScaleState, chanceScale } from "./chance-scale";
import { ChanceScaleView } from "./chance-scale-view";
import { defs } from "./defs";
import { dataProps } from "./index";
import {
  MeanAction,
  MeanDerived,
  MeanSignal,
  type MeanState,
  lastStepOf,
  meanTable,
} from "./mean-table";
import { MeanTableView } from "./mean-table-view";
import {
  CfKind,
  Given,
  MEDIAN_STEPS,
  MedianAction,
  MedianDerived,
  MedianSignal,
  type MedianState,
  medianTable,
} from "./median-table";
import { MedianTableView } from "./median-table-view";
import {
  MODE_STEPS,
  ModeAction,
  ModeDerived,
  ModeSignal,
  type ModeState,
  modeChart,
} from "./mode-chart";
import { ModeChartView } from "./mode-chart-view";
import { fracText } from "./numbers";
import { OgiveAction, OgiveDerived, OgiveShow, OgiveSignal, type OgiveState, ogive } from "./ogive";
import { OgiveView } from "./ogive-view";
import {
  SpaceAction,
  SpaceDerived,
  SpaceSignal,
  type SpaceState,
  outcomeSpace,
} from "./outcome-space";
import { OutcomeSpaceView } from "./outcome-space-view";
import {
  RegionAction,
  RegionDerived,
  RegionMode,
  type RegionState,
  regionChance,
} from "./region-chance";
import { RegionChanceView } from "./region-chance-view";
import { DataSceneKind, dataScene } from "./scene";
import { DataSceneView } from "./scene-view";
import {
  Method,
  type Row,
  frequenciesFrom,
  meanOf,
  medianOf,
  modeOf,
  ncert,
  ogiveCrossing,
  row,
} from "./stats";

const mean = asAnyProp(meanTable);
const mode = asAnyProp(modeChart);
const median = asAnyProp(medianTable);
const og = asAnyProp(ogive);
const runDef = asAnyProp(chanceRun);
const space = asAnyProp(outcomeSpace);
const scale = asAnyProp(chanceScale);
const region = asAnyProp(regionChance);
const scene = asAnyProp(dataScene);

function run<S extends StoredState>(
  def: AnyPropDef,
  state: S,
  action: string,
  args: Record<string, unknown> = {},
) {
  const result = prepareAction(def, state, action, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  const effect = result.effect;
  if (effect.kind !== EffectKind.Set) throw new Error(`${action} should be instant`);
  const next = applyPatch(def, state, effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: effect.emit };
}
const look = (def: AnyPropDef, s: StoredState) => viewOf(def, s) as Record<string, unknown>;
const signals = (emit: readonly { signal: string }[]) => emit.map((e) => e.signal);

const classes = (lo: number, h: number, fs: number[]): Row[] =>
  fs.map((f, i) => row(lo + i * h, lo + (i + 1) * h, f));

// NCERT Chapter 14's data.
const EX1 = classes(10, 15, [2, 3, 7, 6, 6, 6]);
const EX2 = classes(15, 10, [6, 11, 7, 4, 4, 2, 1]);
const EX3 = [
  row(20, 60, 7),
  row(60, 100, 5),
  row(100, 150, 16),
  row(150, 250, 12),
  row(250, 350, 2),
  row(350, 450, 3),
];
const EX5 = classes(1, 2, [7, 8, 2, 2, 1]);
const T1412 = classes(0, 10, [5, 3, 4, 3, 3, 4, 7, 9, 7, 8]);
const EX7 = frequenciesFrom([4, 11, 29, 40, 46, 51]).map((f, i) =>
  row(135 + i * 5, 140 + i * 5, f),
);
const EX8 = classes(0, 100, [2, 5, 9, 12, 17, 20, 15, 9, 7, 4]);
const EX9 = classes(5, 5, [2, 12, 2, 4, 3, 4, 3]);

describe("the maths of grouped data", () => {
  it("finds the mean, the same by every method (Examples 1–3)", () => {
    expect(meanOf(EX1)).toBe(62);
    expect(ncert(meanOf(EX2))).toBe(39.71);
    expect(ncert(meanOf(EX3))).toBe(152.89);
    for (const method of Object.values(Method)) {
      const s: MeanState = {
        ...(meanTable.defaults as MeanState),
        rows: EX2,
        method,
        a: 50,
        h: 10,
      };
      expect(ncert(look(mean, s)[MeanDerived.Mean] as number)).toBe(39.71);
    }
  });

  it("finds the mode (Examples 5 and 6)", () => {
    expect(ncert(modeOf(EX5))).toBe(3.29);
    expect(ncert(modeOf(EX1))).toBe(52);
  });

  it("finds the median and agrees with the ogives (Table 14.12, Examples 7–9)", () => {
    expect(ncert(medianOf(T1412))).toBe(66.43);
    expect(frequenciesFrom([4, 11, 29, 40, 46, 51])).toEqual([4, 7, 18, 11, 6, 5]);
    expect(ncert(medianOf(EX7))).toBe(149.03);
    expect(medianOf(EX8)).toBe(525);
    expect(medianOf(EX9)).toBe(17.5);
    const cross = ogiveCrossing(T1412);
    expect(cross?.[1]).toBe(26.5);
    expect(ncert(cross?.[0] ?? 0)).toBe(66.43);
  });
});

describe("the statistics props", () => {
  it("steps the mean table to the answer and signals done", () => {
    let s = { ...(meanTable.defaults as MeanState) };
    const all: string[] = [];
    for (let i = 0; i < 8; i++) {
      const r = run(mean, s, MeanAction.Next);
      s = r.state;
      all.push(...signals(r.emit));
    }
    expect(all).toContain(MeanSignal.Done);
    expect(look(mean, s)[MeanDerived.Mean]).toBe(62);
  });

  it("refuses an assumed mean that isn't a class mark", () => {
    expect(applyPatch(mean, meanTable.defaults as MeanState, { a: 50 }).isOk).toBe(false);
  });

  it("lets the learner pick the modal class and steps to the mode", () => {
    let s: ModeState = { ...(modeChart.defaults as ModeState), canPick: true };
    const picked = run(mode, s, ModeAction.Pick, { index: 1 });
    expect(signals(picked.emit)).toContain(ModeSignal.Picked);
    s = picked.state;
    for (let i = 0; i < MODE_STEPS; i++) s = run(mode, s, ModeAction.Next).state;
    expect(ncert(look(mode, s)[ModeDerived.Mode] as number)).toBe(3.29);
  });

  it("builds cf from frequencies and reads the median (Table 14.12)", () => {
    let s: MedianState = { ...(medianTable.defaults as MedianState) };
    for (let i = 0; i < MEDIAN_STEPS; i++) s = run(median, s, MedianAction.Next).state;
    expect(ncert(look(median, s)[MedianDerived.Median] as number)).toBe(66.43);
    expect(look(median, s)[MedianDerived.Cumulative]).toEqual([
      5, 8, 12, 15, 18, 22, 29, 38, 45, 53,
    ]);
  });

  it("blocks Next at the median class until the right row is picked", () => {
    let s: MedianState = { ...(medianTable.defaults as MedianState), canPick: true };
    s = run(median, s, MedianAction.Next).state;
    expect(run(median, s, MedianAction.Next).state.step).toBe(1);
    const wrong = run(median, s, MedianAction.Pick, { index: 2 });
    expect(wrong.state.picked).toBe(2);
    const right = run(median, wrong.state, MedianAction.Pick, { index: 6 });
    expect(signals(right.emit)).toContain(MedianSignal.Picked);
    expect(right.state.step).toBe(2);
  });

  it("works from a more-than cf table (Example 9)", () => {
    const s: MedianState = {
      ...(medianTable.defaults as MedianState),
      rows: EX9,
      given: Given.Cumulative,
      cfKind: CfKind.MoreThan,
    };
    expect(look(median, s)[MedianDerived.Median]).toBe(17.5);
  });

  it("plots an ogive point by point and reads the median", () => {
    let s: OgiveState = { ...(ogive.defaults as OgiveState) };
    const first = run(og, s, OgiveAction.PlotNext);
    expect(signals(first.emit)).toEqual([OgiveSignal.Plotted]);
    expect(run(og, first.state, OgiveAction.ShowMedian).state.isMedianShown).toBe(false);
    s = run(og, first.state, OgiveAction.PlotAll).state;
    const read = run(og, s, OgiveAction.ShowMedian);
    expect(read.emit).toEqual([{ signal: OgiveSignal.Read, payload: { median: 66.43 } }]);
    const both: OgiveState = { ...s, show: OgiveShow.Both, plotted: 20 };
    expect(look(og, both)[OgiveDerived.Median]).toBe(66.43);
  });
});

describe("probability", () => {
  const setup = (kind: Experiment, extra: Partial<RunState> = {}) => ({
    kind,
    faces: [1, 2, 3, 4, 5, 6],
    marbles: [],
    sectors: [],
    ...extra,
  });

  it("counts favourable ÷ all in lowest terms (NCERT 15.2)", () => {
    expect(
      fracText(
        probabilityOf(
          setup(Experiment.TwoDice),
          twoDiceIds((a, b) => a + b === 8),
        ),
      ),
    ).toBe("5/36");
    expect(
      fracText(
        probabilityOf(
          setup(Experiment.Cards),
          cardIds((r) => r === "A"),
        ),
      ),
    ).toBe("1/13");
    expect(
      fracText(
        probabilityOf(
          setup(Experiment.Cards),
          cardIds((r) => isFaceCard(r)),
        ),
      ),
    ).toBe("3/13");
    expect(fracText(probabilityOf(setup(Experiment.TwoCoins), ["HH", "HT", "TH"]))).toBe("3/4");
    expect(
      fracText(
        probabilityOf(
          setup(Experiment.Die),
          dieIds((v) => v > 4),
        ),
      ),
    ).toBe("1/3");
    const bag = setup(Experiment.Bag, {
      marbles: [
        { colour: Colour.Blue, count: 3 },
        { colour: Colour.White, count: 2 },
        { colour: Colour.Red, count: 4 },
      ],
    });
    expect(fracText(probabilityOf(bag, [Colour.White]))).toBe("2/9");
    expect(fracText(probabilityOf(bag, [Colour.Blue, Colour.Red]))).toBe("7/9");
    expect(
      fracText(
        probabilityOf(
          setup(Experiment.TwoDice),
          twoDiceIds((a, b) => a === b),
        ),
      ),
    ).toBe("1/6");
    expect(
      fracText(
        probabilityOf(
          setup(Experiment.TwoDice),
          twoDiceIds((a, b) => a + b === 13),
        ),
      ),
    ).toBe("0");
  });

  it("draws the same sequence from the same seed", () => {
    const seq = (start: number) => {
      let seed = start;
      const out: string[] = [];
      for (let i = 0; i < 20; i++) {
        const r = draw(setup(Experiment.Die), seed);
        out.push(r.id);
        seed = r.seed;
      }
      return out.join("");
    };
    expect(seq(7)).toBe(seq(7));
    expect(seq(7)).not.toBe(seq(8));
  });

  it("settles near the theoretical probability over many trials", () => {
    let s: RunState = { ...(chanceRun.defaults as RunState) };
    const all: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = run(runDef, s, RunAction.Run, { times: 1000 });
      s = r.state;
      all.push(...signals(r.emit));
    }
    expect(s.trials).toBe(3000);
    expect(all.filter((x) => x === RunSignal.Many)).toHaveLength(1);
    expect(Math.abs((look(runDef, s)[RunDerived.Empirical] as number) - 0.5)).toBeLessThan(0.04);
    const dice: RunState = {
      ...(chanceRun.defaults as RunState),
      kind: Experiment.TwoDice,
      favourable: twoDiceIds((a, b) => a + b === 8),
    };
    let many = dice;
    for (let i = 0; i < 10; i++) many = run(runDef, many, RunAction.Run, { times: 1000 }).state;
    expect(Math.abs((look(runDef, many)[RunDerived.Empirical] as number) - 5 / 36)).toBeLessThan(
      0.02,
    );
    expect(look(runDef, many)[RunDerived.TheoreticalText]).toBe("5/36");
    expect(MANY).toBe(1000);
  });

  it("only runs the offered batch sizes and rejects a bad event", () => {
    const s = { ...(chanceRun.defaults as RunState) };
    expect(run(runDef, s, RunAction.Run, { times: 7 }).state.trials).toBe(0);
    expect(applyPatch(runDef, s, { favourable: ["X"] }).isOk).toBe(false);
  });

  it("matches when the learner taps exactly the event, and shows the complement", () => {
    let s: SpaceState = {
      ...(outcomeSpace.defaults as SpaceState),
      canPick: true,
      isEventShown: false,
    };
    const ids = s.favourable;
    const all: string[] = [];
    for (const id of ids) {
      const r = run(space, s, SpaceAction.Toggle, { id });
      s = r.state;
      all.push(...signals(r.emit));
    }
    expect(all.filter((x) => x === SpaceSignal.Matched)).toHaveLength(1);
    expect(look(space, s)[SpaceDerived.Probability]).toBe("5/36");
    expect(look(space, s)[SpaceDerived.Complement]).toBe("31/36");
    const cards: SpaceState = {
      ...(outcomeSpace.defaults as SpaceState),
      kind: Experiment.Cards,
      favourable: cardIds((r) => r === "A"),
    };
    expect(look(space, cards)[SpaceDerived.Complement]).toBe("12/13");
  });

  it("places events on the 0–1 line", () => {
    let s: ScaleState = { ...(chanceScale.defaults as ScaleState) };
    const all: string[] = [];
    for (let i = 0; i < s.items.length; i++) {
      const r = run(scale, s, ScaleAction.Next);
      s = r.state;
      all.push(...signals(r.emit));
    }
    expect(all.at(-1)).toBe(ScaleSignal.Done);
    expect(
      applyPatch(scale, s, { items: [{ label: { en: "x", hi: "x" }, num: 7, den: 6 }] }).isOk,
    ).toBe(false);
  });

  it("finds probability by length and by area (Examples 10* and 11*)", () => {
    const line = { ...(regionChance.defaults as RegionState) };
    expect(look(region, line)[RegionDerived.RatioText]).toBe("1/4");
    const lake: RegionState = {
      ...line,
      mode: RegionMode.Rect,
      width: 9,
      height: 4.5,
      x0: 2.5,
      x1: 5.5,
      y0: 0,
      y1: 4.5,
    };
    expect(look(region, lake)[RegionDerived.RatioText]).toBe("1/3");
    const dropped = run(region, lake, RegionAction.Drop, { times: 1000 }).state;
    expect(
      Math.abs((look(region, dropped)[RegionDerived.Empirical] as number) - 1 / 3),
    ).toBeLessThan(0.05);
  });
});

describe("views", () => {
  type View = ComponentType<PropViewProps>;
  const runDice: RunState = {
    ...(chanceRun.defaults as RunState),
    kind: Experiment.TwoDice,
    favourable: twoDiceIds((a, b) => a + b === 8),
    eventLabel: { en: "sum 8", hi: "योग 8" },
  };
  const ran = (s: RunState) =>
    run(runDef, run(runDef, s, RunAction.Run, { times: 10 }).state, RunAction.Run, { times: 100 })
      .state;
  const cases: [string, AnyPropDef, View, StoredState][] = [
    [
      "mean direct",
      mean,
      MeanTableView,
      { ...(meanTable.defaults as MeanState), step: lastStepOf(meanTable.defaults as MeanState) },
    ],
    [
      "mean step-deviation",
      mean,
      MeanTableView,
      {
        ...(meanTable.defaults as MeanState),
        rows: EX2,
        method: Method.Step,
        a: 50,
        h: 10,
        step: 5,
        canSetMethod: true,
        canSetA: true,
      },
    ],
    [
      "mean unequal",
      mean,
      MeanTableView,
      {
        ...(meanTable.defaults as MeanState),
        rows: EX3,
        method: Method.Step,
        a: 200,
        h: 20,
        step: 5,
      },
    ],
    [
      "mode",
      mode,
      ModeChartView,
      { ...(modeChart.defaults as ModeState), step: MODE_STEPS, showMean: true },
    ],
    [
      "mode picking",
      mode,
      ModeChartView,
      { ...(modeChart.defaults as ModeState), canPick: true, picked: 0 },
    ],
    [
      "median",
      median,
      MedianTableView,
      { ...(medianTable.defaults as MedianState), step: MEDIAN_STEPS },
    ],
    [
      "median picking",
      median,
      MedianTableView,
      { ...(medianTable.defaults as MedianState), step: 1, canPick: true, picked: 3 },
    ],
    [
      "median more-than",
      median,
      MedianTableView,
      {
        ...(medianTable.defaults as MedianState),
        rows: EX9,
        given: Given.Cumulative,
        cfKind: CfKind.MoreThan,
        step: 1,
      },
    ],
    [
      "ogive less",
      og,
      OgiveView,
      { ...(ogive.defaults as OgiveState), plotted: 10, isMedianShown: true },
    ],
    [
      "ogive both",
      og,
      OgiveView,
      { ...(ogive.defaults as OgiveState), show: OgiveShow.Both, plotted: 20, isMedianShown: true },
    ],
    ["ogive half", og, OgiveView, { ...(ogive.defaults as OgiveState), plotted: 4 }],
    ["run coin empty", runDef, ChanceRunView, { ...(chanceRun.defaults as RunState) }],
    ["run coin", runDef, ChanceRunView, ran({ ...(chanceRun.defaults as RunState) })],
    ["run two dice", runDef, ChanceRunView, ran(runDice)],
    [
      "run die",
      runDef,
      ChanceRunView,
      ran({ ...runDice, kind: Experiment.Die, favourable: ["2", "4", "6"] }),
    ],
    [
      "run two coins",
      runDef,
      ChanceRunView,
      ran({ ...runDice, kind: Experiment.TwoCoins, favourable: ["HH"] }),
    ],
    [
      "run bag",
      runDef,
      ChanceRunView,
      ran({
        ...runDice,
        kind: Experiment.Bag,
        marbles: [
          { colour: Colour.Red, count: 3 },
          { colour: Colour.White, count: 5 },
        ],
        favourable: [Colour.Red],
      }),
    ],
    [
      "run spinner",
      runDef,
      ChanceRunView,
      ran({
        ...runDice,
        kind: Experiment.Spinner,
        sectors: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ en: String(n), hi: String(n) })),
        favourable: ["7"],
      }),
    ],
    [
      "space dice",
      space,
      OutcomeSpaceView,
      { ...(outcomeSpace.defaults as SpaceState), isComplementShown: true },
    ],
    [
      "space cards",
      space,
      OutcomeSpaceView,
      {
        ...(outcomeSpace.defaults as SpaceState),
        kind: Experiment.Cards,
        favourable: cardIds((r) => isFaceCard(r)),
      },
    ],
    [
      "space coins picking",
      space,
      OutcomeSpaceView,
      {
        ...(outcomeSpace.defaults as SpaceState),
        kind: Experiment.TwoCoins,
        favourable: ["HH", "HT", "TH"],
        canPick: true,
        isEventShown: false,
        picked: ["HH"],
      },
    ],
    [
      "space die",
      space,
      OutcomeSpaceView,
      { ...(outcomeSpace.defaults as SpaceState), kind: Experiment.Die, favourable: ["1", "2"] },
    ],
    [
      "scale",
      scale,
      ChanceScaleView,
      { ...(chanceScale.defaults as ScaleState), shown: 4, focus: 1, isComplementShown: true },
    ],
    [
      "region line",
      region,
      RegionChanceView,
      run(region, regionChance.defaults as RegionState, RegionAction.Drop, { times: 100 }).state,
    ],
    [
      "region lake",
      region,
      RegionChanceView,
      {
        ...(regionChance.defaults as RegionState),
        mode: RegionMode.Rect,
        width: 9,
        height: 4.5,
        x0: 2.5,
        x1: 5.5,
        y0: 0,
        y1: 4.5,
        trials: 300,
        hits: 100,
        isAnswerShown: true,
        partLabel: { en: "lake", hi: "झील" },
      },
    ],
    ...Object.values(DataSceneKind).map((kind): [string, AnyPropDef, View, StoredState] => [
      `scene ${kind}`,
      scene,
      DataSceneView,
      { scene: kind },
    ]),
  ];
  for (const [name, def, View, s] of cases) {
    it(`draws ${name} in both languages at phone widths`, () => {
      expect(applyPatch(def, def.defaults as StoredState, s).isOk).toBe(true);
      for (const locale of ["en", "hi"] as const)
        for (const width of [300, 340, 420]) {
          const html = renderToString(
            <View
              view={viewOf(def, s)}
              locale={locale}
              width={width}
              call={() => undefined}
              signal={() => undefined}
            />,
          );
          expect(html).not.toMatch(/NaN|undefined|Infinity|\[object/);
        }
      expect(observationOf(def, s).summary.length).toBeGreaterThan(10);
    });
  }

  it("lists every prop in defs and in the modules", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(dataProps.map((m) => m.def.type).sort());
    for (const d of defs) expect(d.describe.length).toBeGreaterThan(80);
  });
});
