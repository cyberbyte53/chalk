import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { amps as ampsText, num, ohms as ohmsText, sig } from "./words";

/**
 * What a wire's resistance depends on (NCERT 12.5, Activity 12.3): a uniform wire of some length
 * l, area of cross-section A and material, R = ρl/A, with ρ the material's resistivity
 * (Table 12.2). One 1.5 V cell drives a current through it, I = V/R. A reference wire, marked
 * (1), can be kept to compare against: twice the length, twice the resistance, half the current.
 */

export const WireAction = {
  SetMaterial: "setMaterial",
  SetLength: "setLength",
  SetArea: "setArea",
  MarkReference: "markReference",
} as const;
export const WireSignal = { Changed: "changed" } as const;
export const WireDerived = {
  Resistance: "resistance",
  Current: "current",
  Resistivity: "resistivity",
  RatioToReference: "ratioToReference",
  CurrentRatio: "currentRatio",
} as const;
export const WirePart = {
  Wire: "wire",
  Reference: "reference",
  Readout: "readout",
  Table: "table",
  Controls: "controls",
} as const;

/** Table 12.2's conductors and alloys, with resistivity at 20 °C (Ω m). */
export const Material = {
  Silver: "silver",
  Copper: "copper",
  Aluminium: "aluminium",
  Tungsten: "tungsten",
  Nickel: "nickel",
  Iron: "iron",
  Chromium: "chromium",
  Mercury: "mercury",
  Manganese: "manganese",
  Constantan: "constantan",
  Manganin: "manganin",
  Nichrome: "nichrome",
} as const;
export type Material = (typeof Material)[keyof typeof Material];

export const RESISTIVITY: Readonly<Record<Material, number>> = {
  silver: 1.6e-8,
  copper: 1.62e-8,
  aluminium: 2.63e-8,
  tungsten: 5.2e-8,
  nickel: 6.84e-8,
  iron: 10.0e-8,
  chromium: 12.9e-8,
  mercury: 94.0e-8,
  manganese: 1.84e-6,
  constantan: 49e-6,
  manganin: 44e-6,
  nichrome: 100e-6,
};
export const MATERIAL_ORDER = Object.values(Material) as readonly Material[];
export const ALLOYS: readonly Material[] = [
  Material.Constantan,
  Material.Manganin,
  Material.Nichrome,
];

/** The wire marked (1): length l = 1 m, diameter 0.2 mm. */
export const BASE_LENGTH_M = 1;
export const BASE_DIAMETER_MM = 0.2;
export const BASE_AREA_M2 = Math.PI * (BASE_DIAMETER_MM / 1000 / 2) ** 2;
export const CELL_VOLTS = 1.5;

/** Lengths and areas are counted in l and A: 0.5 (half) to 4 times, in halves. */
const multiple = z
  .number()
  .min(0.5)
  .max(4)
  .refine((v) => Number.isInteger(v * 2), "a whole number of halves");

const wireSpec = z
  .object({ material: z.nativeEnum(Material), length: multiple, area: multiple })
  .strict();
export type WireSpec = z.infer<typeof wireSpec>;

const wireState = z
  .object({
    material: z.nativeEnum(Material),
    /** The length in units of l (= 1 m). */
    length: multiple,
    /** The area of cross-section in units of A (a wire 0.2 mm across). */
    area: multiple,
    /** The wire kept to compare with, or null. */
    reference: wireSpec.nullable(),
    /** Show R = ρl/A worked out. */
    showFormula: z.boolean(),
    /** Show the current from one 1.5 V cell. */
    showCurrent: z.boolean(),
    /** Show Table 12.2 underneath. */
    showTable: z.boolean(),
    canSetMaterial: z.boolean(),
    canSetLength: z.boolean(),
    canSetArea: z.boolean(),
  })
  .strict();
export type WireState = z.infer<typeof wireState>;

export const resistanceOf = (w: WireSpec): number =>
  (RESISTIVITY[w.material] * BASE_LENGTH_M * w.length) / (BASE_AREA_M2 * w.area);
export const currentOf = (w: WireSpec): number => CELL_VOLTS / resistanceOf(w);

const MATERIAL_EN: Readonly<Record<Material, string>> = {
  silver: "silver",
  copper: "copper",
  aluminium: "aluminium",
  tungsten: "tungsten",
  nickel: "nickel",
  iron: "iron",
  chromium: "chromium",
  mercury: "mercury",
  manganese: "manganese",
  constantan: "constantan",
  manganin: "manganin",
  nichrome: "nichrome",
};
const times = (m: number, unit: string) =>
  m === 1 ? unit : m === 0.5 ? `${unit}/2` : `${num(m)}${unit}`;

export function describeWire(s: WireState): string {
  const w = { material: s.material, length: s.length, area: s.area };
  const ref =
    s.reference === null
      ? ""
      : ` Compared with wire (1) (${MATERIAL_EN[s.reference.material]}, length ${times(s.reference.length, "l")}, area ${times(s.reference.area, "A")}): its resistance is ${sig(resistanceOf(w) / resistanceOf(s.reference))} times as much and the current ${sig(currentOf(w) / currentOf(s.reference))} times as much.`;
  return `A ${MATERIAL_EN[s.material]} wire of length ${times(s.length, "l")} (${num(s.length * BASE_LENGTH_M)} m) and area of cross-section ${times(s.area, "A")}, across one 1.5 V cell. R = ρl/A = ${ohmsText(resistanceOf(w))}${s.showCurrent ? `; the current I = V/R = ${ampsText(currentOf(w))}` : ""}.${ref}`;
}

const act = actionsFor<WireState>();
const changed = (s: WireState) => {
  const w = { material: s.material, length: s.length, area: s.area };
  return {
    signal: WireSignal.Changed,
    payload: { ...w, resistance: resistanceOf(w), current: currentOf(w) },
  };
};

export const wireResistance = defineProp({
  type: "wireResistance",
  describe:
    "What a wire's resistance depends on (NCERT 12.5, Activity 12.3): a wire of length l, area of cross-section A and material, drawn to scale, across one 1.5 V cell. R = ρl/A with ρ the resistivity from Table 12.2 (silver to nichrome); the current is I = V/R. The learner changes the length (l/2 to 4l), the thickness (A/2 to 4A) or the material, and compares with a reference wire (1): double the length doubles R and halves I; double the area halves R.",
  state: wireState,
  defaults: {
    material: Material.Nichrome,
    length: 1,
    area: 1,
    reference: { material: Material.Nichrome, length: 1, area: 1 },
    showFormula: true,
    showCurrent: true,
    showTable: false,
    canSetMaterial: true,
    canSetLength: true,
    canSetArea: true,
  },
  inputs: [
    "showFormula",
    "showCurrent",
    "showTable",
    "canSetMaterial",
    "canSetLength",
    "canSetArea",
  ],
  derived: {
    [WireDerived.Resistance]: {
      describe: "The wire's resistance R = ρl/A, Ω",
      compute: (s) => resistanceOf(s),
    },
    [WireDerived.Current]: {
      describe: "The current from one 1.5 V cell, I = V/R, A",
      compute: (s) => currentOf(s),
    },
    [WireDerived.Resistivity]: {
      describe: "The material's resistivity ρ, Ω m (Table 12.2)",
      compute: (s) => RESISTIVITY[s.material],
    },
    [WireDerived.RatioToReference]: {
      describe: "R ÷ the reference wire's R (null with no reference)",
      compute: (s) =>
        s.reference === null
          ? null
          : Math.round((resistanceOf(s) / resistanceOf(s.reference)) * 1e4) / 1e4,
    },
    [WireDerived.CurrentRatio]: {
      describe: "I ÷ the reference wire's I (null with no reference)",
      compute: (s) =>
        s.reference === null
          ? null
          : Math.round((currentOf(s) / currentOf(s.reference)) * 1e4) / 1e4,
    },
  },
  actions: {
    [WireAction.SetMaterial]: act({
      describe: "Change the wire's material (Table 12.2)",
      byLearner: true,
      args: z.object({ material: z.nativeEnum(Material) }).strict(),
      run: (s, a) => set({ material: a.material }, changed({ ...s, material: a.material })),
    }),
    [WireAction.SetLength]: act({
      describe: "Change the length, in units of l: 0.5 to 4",
      byLearner: true,
      args: z.object({ length: multiple }).strict(),
      run: (s, a) => set({ length: a.length }, changed({ ...s, length: a.length })),
    }),
    [WireAction.SetArea]: act({
      describe: "Change the area of cross-section (thickness), in units of A: 0.5 to 4",
      byLearner: true,
      args: z.object({ area: multiple }).strict(),
      run: (s, a) => set({ area: a.area }, changed({ ...s, area: a.area })),
    }),
    [WireAction.MarkReference]: act({
      describe: "Keep the present wire as the reference wire (1) to compare with",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ reference: { material: s.material, length: s.length, area: s.area } }),
    }),
  },
  signals: {
    [WireSignal.Changed]: {
      describe: "The wire changed; the payload has material, length, area, resistance, current",
      isCommit: true,
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: WirePart.Wire,
        value: `${MATERIAL_EN[s.material]}, ${times(s.length, "l")}, ${times(s.area, "A")}`,
      },
      {
        id: WirePart.Readout,
        value: `R = ${ohmsText(resistanceOf(s))}${s.showCurrent ? `, I = ${ampsText(currentOf(s))}` : ""}`,
      },
    ];
    if (s.reference !== null)
      elements.push({
        id: WirePart.Reference,
        value: `wire (1): ${MATERIAL_EN[s.reference.material]}, ${times(s.reference.length, "l")}, ${times(s.reference.area, "A")}`,
      });
    if (s.showTable) elements.push({ id: WirePart.Table, value: "Table 12.2" });
    return { summary: describeWire(s), elements };
  },
  parts: (s) => [
    WirePart.Wire,
    ...(s.reference !== null ? [WirePart.Reference] : []),
    WirePart.Readout,
    ...(s.showTable ? [WirePart.Table] : []),
    ...(s.canSetMaterial || s.canSetLength || s.canSetArea ? [WirePart.Controls] : []),
  ],
});
