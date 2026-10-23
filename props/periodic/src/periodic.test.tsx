import { readFileSync } from "node:fs";
import {
  type AnyPropDef,
  EffectKind,
  applyPatch,
  asAnyProp,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { defs } from "./defs";
import {
  Anomaly,
  ELEMENTS,
  Gap,
  Kind,
  Layout,
  MendeleevAction,
  MendeleevMode,
  MendeleevSignal,
  ModernAction,
  ModernSignal,
  OctaveAction,
  OctaveSignal,
  PERIOD_LENGTHS,
  PeriodicScene,
  RADII,
  Trend,
  TriadAction,
  TriadSet,
  TriadSignal,
  averageOf,
  breakCount,
  bySymbol,
  columnOf,
  configOf,
  hydrideOf,
  isPastCalcium,
  isTriad,
  mendeleevGroupOf,
  mendeleevTableDef,
  octaveTableDef,
  oxideOf,
  periodicProps,
  periodicSceneDef,
  periodicTableDef,
  shellCapacity,
  trendOf,
  triadCheckerDef,
  valenceOf,
  valencyOf,
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

const g = (sym: string) => bySymbol(sym).group;
const p = (sym: string) => bySymbol(sym).period;

describe("the elements", () => {
  it("has all 118, numbered in order", () => {
    expect(ELEMENTS).toHaveLength(118);
    ELEMENTS.forEach((e, i) => expect(e.z).toBe(i + 1));
    expect(new Set(ELEMENTS.map((e) => e.symbol)).size).toBe(118);
  });
  it("places elements in the right group and period", () => {
    expect([g("H"), g("He"), g("Li"), g("Be"), g("B"), g("Ne")]).toEqual([1, 18, 1, 2, 13, 18]);
    expect([g("Na"), g("Cl"), g("Ar"), g("K"), g("Ca"), g("Sc"), g("Zn"), g("Ga")]).toEqual([
      1, 17, 18, 1, 2, 3, 12, 13,
    ]);
    expect([g("Cs"), g("Ba"), g("La"), g("Hf"), g("Au"), g("Rn")]).toEqual([1, 2, null, 4, 11, 18]);
    expect([g("Fr"), g("Ra"), g("U"), g("Rf"), g("Og")]).toEqual([1, 2, null, 4, 18]);
    expect([p("H"), p("Ne"), p("Ar"), p("Kr"), p("Xe"), p("Rn"), p("Og")]).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });
  it("gives each period the number of elements NCERT lists (2, 8, 8, 18, 18, 32, 32)", () => {
    const counts = [1, 2, 3, 4, 5, 6, 7].map((n) => ELEMENTS.filter((e) => e.period === n).length);
    expect(counts).toEqual([...PERIOD_LENGTHS]);
    expect([1, 2].map(shellCapacity)).toEqual([2, 8]);
  });
  it("fills shells 2, 8, 8 for the first 20, as the chapter does", () => {
    expect(configOf(12)).toBe("2, 8, 2");
    expect(configOf(17)).toBe("2, 8, 7");
    expect(configOf(19)).toBe("2, 8, 8, 1");
    expect(configOf(20)).toBe("2, 8, 8, 2");
    expect(configOf(21)).toBeNull();
  });
  it("answers Exercise 3 from the configurations", () => {
    const first20 = ELEMENTS.filter((e) => e.z <= 20);
    const find = (test: (c: number[]) => boolean) =>
      first20
        .filter((e) => test((configOf(e.z) ?? "").split(", ").map(Number)))
        .map((e) => e.symbol);
    expect(find((c) => c.length === 2 && c[0] === 2 && c[1] === 8)).toEqual(["Ne"]); // (a)
    expect(find((c) => c.join() === "2,8,2")).toEqual(["Mg"]); // (b)
    expect(find((c) => c.length === 3 && c[2] === 4)).toEqual(["Si"]); // (c)
    expect(find((c) => c.length === 2 && c[1] === 3)).toEqual(["B"]); // (d)
    expect(find((c) => c.length >= 2 && c[1] === 2 * (c[0] as number))).toEqual(["C"]); // (e)
  });
  it("works out valency from the outer electrons (Activity 5.6)", () => {
    expect(valencyOf(12)).toBe(2); // Mg
    expect(valencyOf(16)).toBe(2); // S
    expect(valenceOf(9)).toBe(7);
    const period3 = [11, 12, 13, 14, 15, 16, 17, 18].map((z) => valencyOf(z));
    expect(period3).toEqual([1, 2, 3, 4, 3, 2, 1, 0]);
    expect([3, 11, 19].map((z) => valencyOf(z))).toEqual([1, 1, 1]); // same down a group
    expect(valencyOf(2)).toBe(0);
    expect(valencyOf(1)).toBe(1);
  });
  it("puts the right elements on the zig-zag line, metals left and non-metals right", () => {
    const metalloids = ELEMENTS.filter((e) => e.kind === Kind.Metalloid).map((e) => e.symbol);
    expect(metalloids).toEqual(["B", "Si", "Ge", "As", "Sb", "Te", "Po"]);
    expect(bySymbol("Na").kind).toBe(Kind.Metal);
    expect(bySymbol("S").kind).toBe(Kind.NonMetal);
    // Intext Q5: the metals among the first ten
    expect(ELEMENTS.filter((e) => e.z <= 10 && e.kind === Kind.Metal).map((e) => e.symbol)).toEqual(
      ["Li", "Be"],
    );
  });
  it("draws the trends the chapter states", () => {
    const m = (sym: string) => trendOf(bySymbol(sym).z, "metallic") as number;
    const en = (sym: string) => trendOf(bySymbol(sym).z, "electronegativity") as number;
    expect(m("Li")).toBeLessThan(m("Na"));
    expect(m("Na")).toBeLessThan(m("K"));
    expect(m("Na")).toBeGreaterThan(m("Cl"));
    expect(en("F")).toBeGreaterThan(en("Cl"));
    expect(en("N")).toBeGreaterThan(en("P")); // Exercise 7
    expect(m("Ga")).toBeGreaterThan(m("Se")); // across period 4
    expect(trendOf(bySymbol("Ne").z, "size")).toBeNull();
  });
  it("keeps NCERT's radii in the orders Activities 5.7 and 5.8 ask for", () => {
    const period2 = ["Li", "Be", "B", "C", "N", "O"].map((x) => RADII[x] as number);
    expect([...period2].sort((a, b) => b - a)).toEqual(period2);
    const group1 = ["Li", "Na", "K", "Rb", "Cs"].map((x) => RADII[x] as number);
    expect([...group1].sort((a, b) => a - b)).toEqual(group1);
    expect(RADII.H).toBe(37);
  });
});

describe("Döbereiner's triads", () => {
  it("finds groups B and C of Table 5.1 are triads and group A is not", () => {
    expect(isTriad(TriadSet.CaSrBa)).toBe(true);
    expect(isTriad(TriadSet.ClBrI)).toBe(true);
    expect(isTriad(TriadSet.NPAs)).toBe(false);
    expect(isTriad(TriadSet.LiNaK)).toBe(true);
    expect(averageOf(TriadSet.LiNaK)).toBe(22.95);
  });
  it("steps cards → average → verdict, and only switches to offered groups", () => {
    const run = runner(triadCheckerDef);
    let s = { ...triadCheckerDef.defaults, choices: [TriadSet.LiNaK, TriadSet.NPAs] as TriadSet[] };
    const a = run(s, TriadAction.Next);
    expect(a.signals).toEqual([TriadSignal.Stepped]);
    const b = run(a.state, TriadAction.Next);
    expect(b.signals).toEqual([TriadSignal.Judged]);
    expect(run(b.state, TriadAction.Next).state.step).toBe(2);
    s = run(b.state, TriadAction.Pick, { set: TriadSet.NPAs }).state;
    expect(s).toMatchObject({ set: TriadSet.NPAs, step: 0 });
    expect(run(s, TriadAction.Pick, { set: TriadSet.ClBrI }).state.set).toBe(TriadSet.NPAs);
    expect(view(triadCheckerDef, s).isTriad).toBe(false);
  });
});

describe("Newlands' octaves", () => {
  it("puts every eighth element under the same note", () => {
    expect(columnOf(1).slice(0, 3)).toEqual(["Li", "Na", "K"]);
    expect(columnOf(2).slice(0, 3)).toEqual(["Be", "Mg", "Ca"]);
    expect(columnOf(0)).toEqual(["H", "F", "Cl", "Co/Ni", "Br"]);
  });
  it("works up to calcium only", () => {
    expect(isPastCalcium(2, 2)).toBe(false); // Ca
    expect(isPastCalcium(2, 3)).toBe(true); // Cr
    expect(isPastCalcium(3, 0)).toBe(true);
    expect(breakCount()).toBeGreaterThan(10);
  });
  it("lights a note and shows the breaks", () => {
    const run = runner(octaveTableDef);
    const a = run(octaveTableDef.defaults, OctaveAction.PickNote, { note: 1 });
    expect(a.signals).toEqual([OctaveSignal.Picked]);
    expect(view(octaveTableDef, a.state).column).toEqual(columnOf(1));
    const b = run(a.state, OctaveAction.ShowBreaks, { isOn: true });
    expect(b.signals).toEqual([OctaveSignal.Broke]);
    expect(run(b.state, OctaveAction.ShowBreaks, { isOn: false }).signals).toEqual([]);
  });
});

describe("Mendeléev's table", () => {
  it("predicts the oxides of intext Q1 (K, C, Al, Si, Ba)", () => {
    expect(["K", "C", "Al", "Si", "Ba"].map(oxideOf)).toEqual([
      "K2O",
      "CO2",
      "Al2O3",
      "SiO2",
      "BaO",
    ]);
    expect(hydrideOf("C")).toBe("CH4");
    expect(mendeleevGroupOf("Cl")).toBe(6);
  });
  it("puts cobalt before nickel although nickel is lighter", () => {
    expect(mendeleevGroupOf("Co")).toBe(7);
    expect(mendeleevGroupOf("Ni")).toBe(7);
  });
  it("reveals gaps once, and taps only real cards", () => {
    const run = runner(mendeleevTableDef);
    const s0 = mendeleevTableDef.defaults;
    const a = run(s0, MendeleevAction.Reveal, { gap: Gap.EkaAluminium });
    expect(a.signals).toEqual([MendeleevSignal.Revealed]);
    expect(run(a.state, MendeleevAction.Reveal, { gap: Gap.EkaAluminium }).signals).toEqual([]);
    const t = run(s0, MendeleevAction.Tap, { symbol: "Al" });
    expect(view(mendeleevTableDef, t.state).oxide).toBe("Al2O3");
    expect(run(s0, MendeleevAction.Tap, { symbol: "Xx" }).state.selected).toBeNull();
    expect(run(s0, MendeleevAction.SetMode, { mode: MendeleevMode.Predict }).state.mode).toBe(
      MendeleevMode.Table,
    ); // not allowed by default
    expect(run(s0, MendeleevAction.PickAnomaly, { anomaly: Anomaly.Hydrogen }).state.anomaly).toBe(
      Anomaly.Hydrogen,
    );
  });
});

describe("the modern table", () => {
  it("taps only elements the layout shows", () => {
    const run = runner(periodicTableDef);
    const s0 = periodicTableDef.defaults;
    const a = run(s0, ModernAction.Tap, { z: 12 });
    expect(a.signals).toEqual([ModernSignal.Tapped]);
    expect(view(periodicTableDef, a.state)).toMatchObject({
      symbol: "Mg",
      group: 2,
      period: 3,
      config: "2, 8, 2",
      valency: 2,
    });
    expect(run(s0, ModernAction.Tap, { z: 30 }).state.selected).toBeNull();
    const full = { ...s0, layout: Layout.Full };
    expect(run(full, ModernAction.Tap, { z: 30 }).state.selected).toBe(30);
  });
  it("lists a group's members (calcium's neighbours, Exercise 9)", () => {
    const run = runner(periodicTableDef);
    const s = run({ ...periodicTableDef.defaults, layout: Layout.Full }, ModernAction.Tap, {
      z: 20,
    }).state;
    expect(view(periodicTableDef, s).sameGroup).toEqual(["Be", "Mg", "Ca", "Sr", "Ba", "Ra"]);
  });
  it("only switches to offered trends", () => {
    const run = runner(periodicTableDef);
    const s = { ...periodicTableDef.defaults, trends: [Trend.Size] as Trend[] };
    expect(run(s, ModernAction.SetTrend, { trend: Trend.Size }).state.trend).toBe(Trend.Size);
    expect(run(s, ModernAction.SetTrend, { trend: Trend.Metallic }).state.trend).toBe(Trend.None);
  });
});

describe("every prop", () => {
  it("defs.ts lists exactly the props the module registers", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(periodicProps.map((m) => m.def.type).sort());
  });
  it("renders in both languages at phone widths", () => {
    const byType = new Map(periodicProps.map((m) => [m.def.type, m]));
    const cases: [string, Record<string, unknown>][] = [
      ["triadChecker", {}],
      ["triadChecker", { set: TriadSet.NPAs, step: 2, choices: [TriadSet.NPAs, TriadSet.ClBrI] }],
      ["octaveTable", {}],
      ["octaveTable", { note: 0, showBreaks: true }],
      ["mendeleevTable", { selected: "Al", revealed: [Gap.EkaBoron], showNoble: true }],
      ["mendeleevTable", { mode: MendeleevMode.Predict, revealed: [Gap.EkaAluminium] }],
      [
        "mendeleevTable",
        { mode: MendeleevMode.Anomalies, anomaly: Anomaly.CoNi, canSetMode: true },
      ],
      ["mendeleevTable", { mode: MendeleevMode.Anomalies, anomaly: Anomaly.Hydrogen }],
      ["mendeleevTable", { mode: MendeleevMode.Anomalies, anomaly: Anomaly.Isotopes }],
      ["periodicTable", { selected: 17, trend: Trend.Valency, trends: [Trend.Valency] }],
      ["periodicTable", { selected: 3, trend: Trend.Size, highlightGroup: 1 }],
      [
        "periodicTable",
        { layout: Layout.Full, selected: 79, trend: Trend.Metallic, highlightPeriod: 6 },
      ],
      ["periodicTable", { layout: Layout.Full, trend: Trend.Kind, canSetLayout: true }],
      ["periodicTable", { layout: Layout.Full, selected: 92, trend: Trend.Electronegativity }],
      ...Object.values(PeriodicScene).map((scene): [string, Record<string, unknown>] => [
        "periodicScene",
        { scene },
      ]),
    ];
    for (const [type, s] of cases)
      for (const locale of ["en", "hi"] as const)
        for (const width of [300, 340, 420]) {
          const m = byType.get(type);
          if (!m) throw new Error(type);
          const def = m.def;
          const patched = applyPatch(def, { ...def.defaults }, s);
          expect(patched.isOk, `${type} ${JSON.stringify(s)}`).toBe(true);
          if (!patched.isOk) continue;
          const html = renderToString(
            <m.View
              view={viewOf(def, patched.state)}
              locale={locale}
              width={width}
              call={() => undefined}
              signal={() => undefined}
            />,
          );
          expect(html, `${type} ${locale}`).not.toMatch(/NaN|undefined/);
        }
    expect(periodicSceneDef.defaults.scene).toBe(PeriodicScene.CardHeap);
  });
  it("its styles draw only with the look's tokens", () => {
    const css = ["draw.css", "periodic.css"]
      .map((f) => readFileSync(new URL(f, import.meta.url), "utf8"))
      .join("\n");
    expect(
      css.split("\n").filter((l) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(l)),
    ).toEqual([]);
  });
});
