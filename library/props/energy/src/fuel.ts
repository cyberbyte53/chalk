import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * Choosing a fuel (NCERT 14.1, Activity 14.2). Each fuel has a heat value (kJ for every gram burnt,
 * the values NCERT gives in Class 8), how much smoke it makes, and whether it is easy to get where
 * you live, easy to store and carry, and cheap. A good source of energy passes four checks: a lot
 * of heat per gram (here 30 kJ/g or more), easy to get, easy to store and carry, and cheap.
 * Where you live changes the answer: what is easy to get in a village is not in a city.
 */

export const Fuel = {
  CowDung: "cowDung",
  Wood: "wood",
  Charcoal: "charcoal",
  Coal: "coal",
  Kerosene: "kerosene",
  Petrol: "petrol",
  Lpg: "lpg",
  Cng: "cng",
  Biogas: "biogas",
  Hydrogen: "hydrogen",
} as const;
export type Fuel = (typeof Fuel)[keyof typeof Fuel];
export const FUELS = Object.values(Fuel);

export const Place = { Village: "village", City: "city" } as const;
export type Place = (typeof Place)[keyof typeof Place];

export const Smoke = { Lots: "lots", Some: "some", Little: "little", None: "none" } as const;
export type Smoke = (typeof Smoke)[keyof typeof Smoke];

export type FuelFacts = {
  readonly name: Words;
  /** kJ released by burning 1 g. */
  readonly heat: number;
  readonly smoke: Smoke;
  /** Easy to get, by where you live. */
  readonly isEasyToGet: Readonly<Record<Place, boolean>>;
  readonly isEasyToStore: boolean;
  readonly isCheap: boolean;
};

/** Heat values (kJ/g) from NCERT Class 8 Table 6.3; charcoal's is a typical value. */
export const FUEL_FACTS: Readonly<Record<Fuel, FuelFacts>> = {
  cowDung: {
    name: { en: "Cow-dung cake", hi: "उपला" },
    heat: 7,
    smoke: Smoke.Lots,
    isEasyToGet: { village: true, city: false },
    isEasyToStore: true,
    isCheap: true,
  },
  wood: {
    name: { en: "Wood", hi: "लकड़ी" },
    heat: 18,
    smoke: Smoke.Lots,
    isEasyToGet: { village: true, city: false },
    isEasyToStore: true,
    isCheap: true,
  },
  charcoal: {
    name: { en: "Charcoal", hi: "काठ-कोयला" },
    heat: 33,
    smoke: Smoke.Little,
    isEasyToGet: { village: true, city: false },
    isEasyToStore: true,
    isCheap: true,
  },
  coal: {
    name: { en: "Coal", hi: "कोयला" },
    heat: 30,
    smoke: Smoke.Lots,
    isEasyToGet: { village: false, city: false },
    isEasyToStore: true,
    isCheap: true,
  },
  kerosene: {
    name: { en: "Kerosene", hi: "मिट्टी का तेल" },
    heat: 45,
    smoke: Smoke.Some,
    isEasyToGet: { village: true, city: true },
    isEasyToStore: true,
    isCheap: false,
  },
  petrol: {
    name: { en: "Petrol", hi: "पेट्रोल" },
    heat: 45,
    smoke: Smoke.Some,
    isEasyToGet: { village: false, city: true },
    isEasyToStore: true,
    isCheap: false,
  },
  lpg: {
    name: { en: "LPG", hi: "एलपीजी" },
    heat: 55,
    smoke: Smoke.Little,
    isEasyToGet: { village: false, city: true },
    isEasyToStore: true,
    isCheap: false,
  },
  cng: {
    name: { en: "CNG", hi: "सीएनजी" },
    heat: 50,
    smoke: Smoke.Little,
    isEasyToGet: { village: false, city: true },
    isEasyToStore: false,
    isCheap: true,
  },
  biogas: {
    name: { en: "Biogas", hi: "बायोगैस" },
    heat: 37,
    smoke: Smoke.None,
    isEasyToGet: { village: true, city: false },
    isEasyToStore: false,
    isCheap: true,
  },
  hydrogen: {
    name: { en: "Hydrogen", hi: "हाइड्रोजन" },
    heat: 150,
    smoke: Smoke.None,
    isEasyToGet: { village: false, city: false },
    isEasyToStore: false,
    isCheap: false,
  },
};

/** "A large amount of work per unit mass": 30 kJ/g or more counts as a lot. */
export const HIGH_HEAT = 30;

export const Check = {
  Heat: "heat",
  Get: "get",
  Store: "store",
  Cheap: "cheap",
} as const;
export type Check = (typeof Check)[keyof typeof Check];
export const CHECKS = Object.values(Check);

/** Which of the four good-source checks a fuel passes where you live. */
export function checksOf(fuel: Fuel, place: Place): Record<Check, boolean> {
  const f = FUEL_FACTS[fuel];
  return {
    heat: f.heat >= HIGH_HEAT,
    get: f.isEasyToGet[place],
    store: f.isEasyToStore,
    cheap: f.isCheap,
  };
}

export const passedOf = (fuel: Fuel, place: Place): number =>
  Object.values(checksOf(fuel, place)).filter(Boolean).length;

export const FuelAction = { Pick: "pick", SetPlace: "setPlace" } as const;
export const FuelSignal = { Picked: "picked" } as const;
export const FuelDerived = {
  Heat: "heat",
  Smoke: "smoke",
  Passed: "passed",
  Checks: "checks",
  Hottest: "hottest",
} as const;
export const FuelPart = { Chart: "chart", Card: "card", Controls: "controls" } as const;

const fuelState = z
  .object({
    /** The fuels on the chart, in order. */
    fuels: z.array(z.nativeEnum(Fuel)).min(1).max(FUELS.length),
    picked: z.nativeEnum(Fuel).nullable(),
    place: z.nativeEnum(Place),
    showChecks: z.boolean(),
    showSmoke: z.boolean(),
    canPick: z.boolean(),
    canSetPlace: z.boolean(),
  })
  .strict();
export type FuelState = z.infer<typeof fuelState>;

export const hottestOf = (fuels: readonly Fuel[]): Fuel =>
  fuels.reduce((a, b) => (FUEL_FACTS[b].heat > FUEL_FACTS[a].heat ? b : a));

export function describeFuels(s: FuelState): string {
  const list = s.fuels.map((f) => `${FUEL_FACTS[f].name.en} ${FUEL_FACTS[f].heat} kJ/g`).join(", ");
  const head = `Fuels compared for someone living in a ${s.place}, by the heat each gives per gram: ${list}.`;
  if (s.picked === null) return `${head} No fuel is picked.`;
  const f = FUEL_FACTS[s.picked];
  const c = checksOf(s.picked, s.place);
  return `${head} Picked: ${f.name.en}, ${f.heat} kJ/g, ${f.smoke} smoke; ${c.get ? "easy" : "hard"} to get here, ${c.store ? "easy" : "hard"} to store and carry, ${c.cheap ? "cheap" : "costly"}; it passes ${passedOf(s.picked, s.place)} of the 4 checks.`;
}

const act = actionsFor<FuelState>();

export const fuelCompare = defineProp({
  type: "fuelCompare",
  describe:
    "Choosing a good fuel (NCERT 14.1, Activity 14.2): a bar chart of the heat each fuel gives per gram, with smoke, and a card for the fuel tapped showing the four checks of a good source of energy (lots of heat per gram, easy to get where you live, easy to store and carry, cheap). Switching between village and city changes which fuels are easy to get.",
  state: fuelState,
  defaults: {
    fuels: [Fuel.CowDung, Fuel.Wood, Fuel.Charcoal, Fuel.Kerosene, Fuel.Lpg, Fuel.Biogas],
    picked: null,
    place: Place.Village,
    showChecks: true,
    showSmoke: true,
    canPick: true,
    canSetPlace: false,
  },
  inputs: ["fuels", "showChecks", "showSmoke", "canPick", "canSetPlace"],
  invariant: (s) =>
    s.picked !== null && !s.fuels.includes(s.picked)
      ? "the picked fuel is not on the chart"
      : undefined,
  derived: {
    [FuelDerived.Heat]: {
      describe: "The picked fuel's heat in kJ per gram, or null",
      compute: (s) => (s.picked === null ? null : FUEL_FACTS[s.picked].heat),
    },
    [FuelDerived.Smoke]: {
      describe:
        "How much smoke the picked fuel gives: lots, some, little or none (null if none picked)",
      compute: (s) => (s.picked === null ? null : FUEL_FACTS[s.picked].smoke),
    },
    [FuelDerived.Passed]: {
      describe:
        "How many of the 4 good-source checks the picked fuel passes where you live (null if none)",
      compute: (s) => (s.picked === null ? null : passedOf(s.picked, s.place)),
    },
    [FuelDerived.Checks]: {
      describe: "The picked fuel's four checks: heat, get, store, cheap (true = passes), or null",
      compute: (s) => (s.picked === null ? null : checksOf(s.picked, s.place)),
    },
    [FuelDerived.Hottest]: {
      describe: "The fuel on the chart that gives the most heat per gram",
      compute: (s) => hottestOf(s.fuels),
    },
  },
  actions: {
    [FuelAction.Pick]: act({
      describe: "Tap a fuel to see its card",
      byLearner: true,
      args: z.object({ fuel: z.nativeEnum(Fuel) }).strict(),
      run: (s, a) =>
        s.fuels.includes(a.fuel)
          ? set(
              { picked: a.fuel },
              {
                signal: FuelSignal.Picked,
                payload: { fuel: a.fuel, passed: passedOf(a.fuel, s.place) },
              },
            )
          : set({}),
    }),
    [FuelAction.SetPlace]: act({
      describe: "Where you live: a village or a city",
      byLearner: true,
      args: z.object({ place: z.nativeEnum(Place) }).strict(),
      run: (_s, a) => set({ place: a.place }),
    }),
  },
  signals: {
    [FuelSignal.Picked]: {
      describe: "The learner tapped a fuel; the payload has the fuel and how many checks it passes",
    },
  },
  observe: (s) => ({
    summary: describeFuels(s),
    elements: [
      { id: FuelPart.Chart, value: s.fuels.join(", ") },
      ...(s.picked === null ? [] : [{ id: FuelPart.Card, value: s.picked }]),
    ],
  }),
  parts: (s) => [
    FuelPart.Chart,
    ...(s.picked === null ? [] : [FuelPart.Card]),
    ...(s.canSetPlace ? [FuelPart.Controls] : []),
  ],
});
