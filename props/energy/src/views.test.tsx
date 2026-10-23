import { readFileSync } from "node:fs";
import { viewOf } from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Fuel, Place } from "./fuel";
import { energyProps } from "./index";
import { Level, OceanKind } from "./ocean";
import { PlantKind } from "./plant";
import { EnergyScene } from "./scene";
import { Sky, SolarMode } from "./solar";
import { Bin, SortBy, Source } from "./sorter";

/** Extra states per prop, beyond its defaults, so every mode and scene is drawn. */
const EXTRAS: Record<string, Record<string, unknown>[]> = {
  fuelCompare: [
    { picked: Fuel.Wood },
    { picked: Fuel.Lpg, place: Place.City, canSetPlace: true },
    { fuels: Object.values(Fuel), picked: Fuel.Hydrogen },
  ],
  powerPlant: [
    { kind: PlantKind.Model, step: 5, isOn: true },
    { kind: PlantKind.Thermal, step: 3, isOn: true },
    { kind: PlantKind.Hydro, step: 2, isOn: true, level: 2, canSetLevel: true },
    { kind: PlantKind.Hydro, isOn: true, level: 0, canSetLevel: true },
    { kind: PlantKind.Geothermal, step: 5, isOn: true },
    { kind: PlantKind.Nuclear, step: 4, isOn: true },
  ],
  biogasPlant: [{ step: 2 }, { step: 4 }, { step: 5 }, { step: 3, hasLeak: true, canLeak: true }],
  windFarm: [
    { speed: 10, mills: 1, hasBattery: true, canSetBattery: true },
    { speed: 30, mills: 6, canSetMills: true },
    { speed: 40, mills: 12, canSetMills: true },
  ],
  solarLab: [
    { mode: SolarMode.Flasks, minutes: 60 },
    { mode: SolarMode.Cooker, minutes: 120, canSetParts: true, canSetSky: true },
    { mode: SolarMode.Cooker, minutes: 45, hasGlass: false, hasMirror: false, sky: Sky.Cloudy },
    { mode: SolarMode.Panel, cells: 36, canSetCells: true },
    { mode: SolarMode.Panel, cells: 1, sky: Sky.Night },
  ],
  oceanEnergy: [
    { kind: OceanKind.Tidal, sea: Level.High, basin: Level.High, isFlowing: true },
    { kind: OceanKind.Tidal, sea: Level.Low, basin: Level.High },
    { kind: OceanKind.Wave, wave: 3 },
    { kind: OceanKind.Wave, wave: 0 },
    { kind: OceanKind.Thermal, surface: 28, deep: 4 },
    { kind: OceanKind.Thermal, surface: 20, deep: 10 },
  ],
  fission: [
    { generation: 1 },
    { generation: 3 },
    { generation: 3, isControlled: true, showCalculator: true, canSetMass: true },
  ],
  energySorter: [
    {
      selected: Source.Coal,
      placed: [
        { source: Source.Wind, bin: Bin.Yes },
        { source: Source.Nuclear, bin: Bin.Yes },
      ],
    },
    {
      by: SortBy.Sun,
      sources: [Source.Tidal, Source.Geothermal, Source.Hydro],
      placed: [
        { source: Source.Tidal, bin: Bin.No },
        { source: Source.Geothermal, bin: Bin.No },
        { source: Source.Hydro, bin: Bin.Yes },
      ],
    },
  ],
  energyScene: Object.values(EnergyScene).map((scene) => ({ scene })),
};

describe("every view draws", () => {
  for (const m of energyProps) {
    const states = [
      m.def.defaults,
      ...(EXTRAS[m.def.type] ?? []).map((e) => ({ ...m.def.defaults, ...e })),
    ];
    states.forEach((state, n) => {
      for (const locale of ["en", "hi"] as const) {
        for (const width of [300, 340, 420]) {
          it(`${m.def.type} #${n} (${locale}, ${width}px)`, () => {
            const html = renderToString(
              <m.View
                view={viewOf(m.def, state)}
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
    });
  }
});

describe("styles", () => {
  it("draw only with the look's tokens: no raw colours", () => {
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/);
  });
});
