import { EffectKind, applyPatch, asAnyProp, checkStored, prepareAction, viewOf } from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Appliance } from "./appliances";
import { BillAction, type BillState, costOf, electricityBill, monthUnitsOf, rupees } from "./bill";
import { ChargeAction, type ChargeState, chargeFlow, coulombsOf, electronsOf } from "./charge";
import {
  ComboAction,
  ComboMode,
  type ComboState,
  MAIN,
  PartKind,
  ammeterReadingOf,
  glowOf,
  resistorCombo,
  solve,
  voltmeterReadingOf,
} from "./combo";
import {
  CORD_AMPS,
  HeatAction,
  HeatMode,
  type HeatState,
  cordWatts,
  elementWatts,
  heatOf,
  jouleHeating,
  lineCurrentOf,
} from "./heating";
import { electricityProps } from "./index";
import {
  GapItem,
  OhmAction,
  OhmMode,
  type OhmState,
  ampsOf,
  gapAmpsOf,
  isStraightOf,
  ohmLab,
  slopeOf,
  voltsOf,
} from "./ohm";
import { SymbolsAction, SymbolsMode, type SymbolsState, circuitSymbols } from "./symbols";
import { Pipe, flowOf, ampsOf as tankAmps } from "./tank";
import { BASE_AREA_M2, Material, RESISTIVITY, currentOf, resistanceOf } from "./wire";

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

const close = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol);

describe("current is charge per second (12.1)", () => {
  it("Example 12.1: 0.5 A for 10 minutes is 300 C", () => {
    expect(coulombsOf({ amps: 0.5, seconds: 600 })).toBe(300);
  });
  it("one coulomb is about 6 × 10¹⁸ electrons", () => {
    const n = electronsOf(1);
    expect(n).toBeGreaterThan(6e18);
    expect(n).toBeLessThan(6.3e18);
  });
  it("setting the current starts the count again", () => {
    const def = asAnyProp(chargeFlow);
    const start: ChargeState = { ...chargeFlow.defaults, seconds: 4 };
    const { state } = run(def, start, ChargeAction.SetCurrent, { amps: 2 });
    expect(state.amps).toBe(2);
    expect(state.seconds).toBe(0);
  });
});

describe("the water tank and its twin (12.2)", () => {
  it("no difference in level, no flow", () => {
    expect(flowOf({ level: 0, isOpen: true, pipe: Pipe.Wide })).toBe(0);
  });
  it("a higher tank gives more flow; a narrow pipe less", () => {
    const one = flowOf({ level: 1, isOpen: true, pipe: Pipe.Wide });
    expect(flowOf({ level: 2, isOpen: true, pipe: Pipe.Wide })).toBe(2 * one);
    expect(flowOf({ level: 2, isOpen: true, pipe: Pipe.Narrow })).toBe(one);
  });
  it("the twin obeys I = V/R and the shut tap is an open key", () => {
    close(tankAmps({ level: 2, isOpen: true, pipe: Pipe.Wide }), 3 / 3);
    expect(tankAmps({ level: 3, isOpen: false, pipe: Pipe.Wide })).toBe(0);
  });
});

describe("Ohm's law bench (12.4)", () => {
  const def = asAnyProp(ohmLab);
  const base = { ...ohmLab.defaults } as OhmState;
  it("V/I is the same for 1 to 4 cells: the wire's resistance", () => {
    for (let cells = 1; cells <= 4; cells++) {
      const s = { ...base, cells, isKeyClosed: true };
      close(voltsOf(s) / ampsOf(s), base.wireOhms, 1e-2);
    }
  });
  it("no plug, no current", () => {
    expect(ampsOf({ ...base, isKeyClosed: false })).toBe(0);
  });
  it("recording four readings gives a straight line through the origin, slope R", () => {
    let s = { ...base, isKeyClosed: true };
    for (let cells = 1; cells <= 4; cells++) {
      s = run(def, s, OhmAction.SetCells, { cells }).state;
      s = run(def, s, OhmAction.Record, {}).state;
    }
    expect(s.rows).toHaveLength(4);
    expect(isStraightOf(s.rows)).toBe(true);
    close(slopeOf(s.rows) ?? 0, base.wireOhms, 1e-2);
  });
  it("recording the same number of cells again replaces the row", () => {
    let s = { ...base, isKeyClosed: true, cells: 2 };
    s = run(def, s, OhmAction.Record, {}).state;
    s = run(def, s, OhmAction.Record, {}).state;
    expect(s.rows).toHaveLength(1);
  });
  it("Exercise 7: the given readings lie close to a line of slope about 3.4 Ω", () => {
    const rows = [
      [0.5, 1.6],
      [1, 3.4],
      [2, 6.7],
      [3, 10.2],
      [4, 13.2],
    ].map(([amps, volts]) => ({ cells: 0, amps: amps as number, volts: volts as number }));
    const k = slopeOf(rows) ?? 0;
    expect(k).toBeGreaterThan(3.25);
    expect(k).toBeLessThan(3.45);
    expect(isStraightOf(rows)).toBe(true);
  });
  it("Activity 12.2: different things in the gap let different currents through", () => {
    const g = (inGap: GapItem) => gapAmpsOf({ inGap, isKeyClosed: true });
    expect(g(GapItem.Rubber)).toBe(0);
    expect(g(GapItem.Glass)).toBe(0);
    expect(g(GapItem.Empty)).toBe(0);
    expect(g(GapItem.Copper)).toBeGreaterThan(5);
    expect(g(GapItem.Nichrome)).toBeGreaterThan(g(GapItem.TorchBulb));
    expect(g(GapItem.TorchBulb)).toBeGreaterThan(g(GapItem.Bulb10W));
    expect(g(GapItem.Bulb10W)).toBeLessThan(0.002);
  });
  it("putting something in the gap signals its current", () => {
    const s = { ...base, mode: OhmMode.Gap, isKeyClosed: true };
    const { emit } = run(def, s, OhmAction.PutInGap, { item: GapItem.Nichrome });
    expect(emit[0]?.payload).toMatchObject({ item: GapItem.Nichrome });
  });
});

describe("what resistance depends on (12.5)", () => {
  const w = { material: Material.Nichrome, length: 1, area: 1 };
  it("twice the length: twice the resistance, half the current", () => {
    close(resistanceOf({ ...w, length: 2 }) / resistanceOf(w), 2);
    close(currentOf({ ...w, length: 2 }) / currentOf(w), 0.5);
  });
  it("twice the area: half the resistance", () => {
    close(resistanceOf({ ...w, area: 2 }) / resistanceOf(w), 0.5);
  });
  it("Example 12.6: l/2 and 2A give a quarter of the resistance", () => {
    close(resistanceOf({ ...w, length: 0.5, area: 2 }) / resistanceOf(w), 0.25);
  });
  it("R = ρl/A with the table's resistivity", () => {
    close(resistanceOf(w), (100e-6 * 1) / BASE_AREA_M2, 1e-6);
  });
  it("copper conducts far better than nichrome of the same size", () => {
    expect(resistanceOf({ ...w, material: Material.Copper })).toBeLessThan(resistanceOf(w) / 1000);
  });
  it("Example 12.5: 1 m of manganese 0.3 mm across is about 26 Ω", () => {
    const area = Math.PI * (0.3e-3 / 2) ** 2;
    close((RESISTIVITY.manganese * 1) / area, 26, 0.1);
  });
});

describe("resistors in series, parallel and mixed (12.6)", () => {
  const def = asAnyProp(resistorCombo);
  const r = (ohms: number, kind: PartKind = PartKind.Resistor) => ({ ohms, kind, isBroken: false });
  const series = (parts: ReturnType<typeof r>[], volts: number): ComboState => ({
    ...(resistorCombo.defaults as ComboState),
    mode: ComboMode.Series,
    parts,
    volts,
  });
  it("Example 12.7: 20 Ω and 4 Ω on 6 V: 24 Ω, 0.25 A, 5 V and 1 V", () => {
    const sol = solve(series([r(20), r(4)], 6));
    close(sol.equivalent, 24);
    close(sol.total, 0.25);
    close(sol.voltages[0] ?? 0, 5);
    close(sol.voltages[1] ?? 0, 1);
  });
  it("in series the ammeter reads the same anywhere, and the voltages add up", () => {
    const s = series([r(1), r(2), r(3)], 6);
    const readings = [MAIN, 0, 1, 2].map((at) => ammeterReadingOf({ ...s, ammeterAt: at }));
    for (const x of readings) close(x, 1);
    const parts = [0, 1, 2].map((i) => voltmeterReadingOf({ ...s, voltmeterAcross: i }) ?? 0);
    close(
      parts.reduce((a, b) => a + b, 0),
      voltmeterReadingOf({ ...s, voltmeterAcross: MAIN }) ?? 0,
    );
  });
  it("Example 12.8: 5, 10 and 30 Ω in parallel on 12 V", () => {
    const s = { ...series([r(5), r(10), r(30)], 12), mode: ComboMode.Parallel };
    const sol = solve(s);
    close(sol.currents[0] ?? 0, 2.4);
    close(sol.currents[1] ?? 0, 1.2);
    close(sol.currents[2] ?? 0, 0.4);
    close(sol.total, 4);
    close(sol.equivalent, 3);
  });
  it("Example 12.9: (10 ∥ 40) + (30 ∥ 20 ∥ 60) = 18 Ω, 0.67 A on 12 V", () => {
    const s = { ...series([r(10), r(40), r(30), r(20), r(60)], 12), mode: ComboMode.Mixed };
    const sol = solve(s);
    close(sol.equivalent, 18);
    close(sol.total, 12 / 18);
  });
  it("a broken bulb in series puts every bulb out; in parallel the others stay lit", () => {
    const bulbs = [r(10, PartKind.Bulb), r(10, PartKind.Bulb), r(10, PartKind.Bulb)];
    const s = series(bulbs, 6);
    const broken = run(def, { ...s, canBreak: true }, ComboAction.ToggleBreak, { index: 1 }).state;
    expect(glowOf(broken).every((g) => g === 0)).toBe(true);
    expect(solve(broken).voltages[1]).toBe(6);
    const p = { ...s, mode: ComboMode.Parallel };
    const brokenP = run(def, p, ComboAction.ToggleBreak, { index: 1 }).state;
    expect(glowOf(brokenP).filter((g) => g > 0)).toHaveLength(2);
  });
  it("equal bulbs are brighter in parallel than in series", () => {
    const bulbs = [r(10, PartKind.Bulb), r(10, PartKind.Bulb)];
    const inSeries = glowOf(series(bulbs, 6))[0] ?? 0;
    const inParallel = glowOf({ ...series(bulbs, 6), mode: ComboMode.Parallel })[0] ?? 0;
    expect(inParallel).toBeGreaterThan(inSeries);
  });
  it("Exercise 11: three 6 Ω make 9 Ω as 6 + (6 ∥ 6)", () => {
    const parallel = solve({ ...series([r(6), r(6)], 6), mode: ComboMode.Parallel }).equivalent;
    close(6 + parallel, 9);
  });
  it("a mixed combination needs exactly five parts", () => {
    const bad = { ...series([r(1), r(2), r(3)], 6), mode: ComboMode.Mixed };
    expect(checkStored(def, bad).isOk).toBe(false);
  });
});

describe("heating effect (12.7)", () => {
  const def = asAnyProp(jouleHeating);
  const base = jouleHeating.defaults as HeatState;
  it("H = I²Rt, and doubling the current gives four times the heat", () => {
    expect(heatOf({ amps: 5, ohms: 20, seconds: 30 })).toBe(15000);
    expect(heatOf({ amps: 10, ohms: 20, seconds: 30 })).toBe(4 * 15000);
  });
  it("Example 12.11: 100 J each second in 4 Ω is 5 A", () => {
    expect(heatOf({ amps: 5, ohms: 4, seconds: 1 })).toBe(100);
  });
  it("the cord and element share one current, and the element makes about 480 times the heat", () => {
    close(CORD_AMPS, 220 / 24.05);
    expect(elementWatts() / cordWatts()).toBeCloseTo(480, 0);
    expect(elementWatts()).toBeGreaterThan(1990);
    expect(elementWatts()).toBeLessThan(2020);
  });
  it("a 1 kW iron draws about 4.5 A: a 5 A fuse holds, a 3 A fuse melts", () => {
    close(lineCurrentOf([Appliance.Iron]), 1000 / 220);
    const s5 = run(def, { ...base, mode: HeatMode.Fuse, rating: 5 }, HeatAction.Toggle, {
      appliance: Appliance.Iron,
    });
    expect(s5.state.isBlown).toBe(false);
    const s3 = run(def, { ...base, mode: HeatMode.Fuse, rating: 3 }, HeatAction.Toggle, {
      appliance: Appliance.Iron,
    });
    expect(s3.state.isBlown).toBe(true);
    expect(s3.emit.map((e) => e.signal)).toContain("blown");
  });
  it("heater, iron and geyser together melt a 10 A fuse; a new fuse switches everything off", () => {
    let s: HeatState = { ...base, mode: HeatMode.Fuse, rating: 10 };
    for (const a of [Appliance.Heater, Appliance.Iron, Appliance.Geyser])
      s = run(def, s, HeatAction.Toggle, { appliance: a }).state;
    expect(s.isBlown).toBe(true);
    s = run(def, s, HeatAction.ReplaceFuse, {}).state;
    expect(s.isBlown).toBe(false);
    expect(s.on).toEqual([]);
  });
});

describe("power and the bill (12.8)", () => {
  const def = asAnyProp(electricityBill);
  it("Example 12.13: a 400 W fridge, 8 h a day for 30 days, at ₹3 a unit is 96 units, ₹288", () => {
    const s: BillState = {
      ...(electricityBill.defaults as BillState),
      rows: [{ appliance: Appliance.Fridge, count: 1, hours: 8 }],
      rate: 3,
      days: 30,
    };
    close(monthUnitsOf(s), 96);
    close(costOf(s), 288);
  });
  it("swapping 100 W bulbs for 9 W LEDs cuts their units by 91%", () => {
    const s: BillState = {
      ...(electricityBill.defaults as BillState),
      rows: [{ appliance: Appliance.Bulb, count: 4, hours: 6 }],
    };
    const after = run(def, s, BillAction.Swap, { index: 0 }).state;
    close(monthUnitsOf(after) / monthUnitsOf(s), 0.09);
  });
  it("writes rupees the Indian way", () => {
    expect(rupees(3240)).toBe("₹3,240");
    expect(rupees(123456)).toBe("₹1,23,456");
    expect(rupees(288)).toBe("₹288");
  });
  it("each appliance has one row", () => {
    const bad = {
      ...electricityBill.defaults,
      rows: [
        { appliance: Appliance.Fan, count: 1, hours: 1 },
        { appliance: Appliance.Fan, count: 2, hours: 1 },
      ],
    };
    expect(checkStored(def, bad).isOk).toBe(false);
  });
});

describe("circuit symbols", () => {
  it("a quiz reveals names one tap at a time", () => {
    const def = asAnyProp(circuitSymbols);
    const s = { ...circuitSymbols.defaults, mode: SymbolsMode.Quiz } as SymbolsState;
    const next = run(def, s, SymbolsAction.Reveal, { symbol: "ammeter" }).state;
    expect(next.revealed).toEqual(["ammeter"]);
  });
});

describe("every view draws", () => {
  for (const m of electricityProps) {
    for (const locale of ["en", "hi"] as const) {
      for (const width of [300, 340, 420]) {
        it(`${m.def.type} (${locale}, ${width}px)`, () => {
          const html = renderToString(
            <m.View
              view={viewOf(m.def, m.def.defaults)}
              locale={locale}
              width={width}
              call={() => undefined}
              signal={() => undefined}
            />,
          );
          expect(html.length).toBeGreaterThan(100);
          expect(html).not.toMatch(/NaN|undefined|Infinity/);
        });
      }
    }
  }
});
