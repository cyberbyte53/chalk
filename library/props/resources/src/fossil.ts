import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * NCERT 16.4: coal and petroleum.
 * - Last mode: at the present rate, known petroleum lasts about 40 years and coal about 200
 *   (NCERT's estimates). Using less stretches them: years = years now ÷ (1 − cut).
 * - Burn mode: fossil fuels hold carbon, hydrogen, nitrogen and sulphur, so burning gives carbon
 *   dioxide, water, oxides of nitrogen and oxides of sulphur; in too little air, carbon monoxide
 *   instead of carbon dioxide.
 * - Choices mode: NCERT's four everyday choices, each with the option that uses less fuel.
 */

export const FossilMode = { Last: "last", Burn: "burn", Choices: "choices" } as const;
export type FossilMode = (typeof FossilMode)[keyof typeof FossilMode];

export const PETROLEUM_YEARS = 40;
export const COAL_YEARS = 200;
export const MAX_CUT = 50;
export const CUT_STEP = 10;

export const Air = { Enough: "enough", Little: "little" } as const;
export type Air = (typeof Air)[keyof typeof Air];

export const Product = {
  CarbonDioxide: "carbonDioxide",
  CarbonMonoxide: "carbonMonoxide",
  Water: "water",
  NitrogenOxides: "nitrogenOxides",
  SulphurOxides: "sulphurOxides",
} as const;
export type Product = (typeof Product)[keyof typeof Product];

export const Choice = {
  Travel: "travel",
  Light: "light",
  Floors: "floors",
  Cold: "cold",
} as const;
export type Choice = (typeof Choice)[keyof typeof Choice];
export const CHOICES: readonly Choice[] = Object.values(Choice);

/** Each choice's options, the one using the least fuel first in `best`. */
export const CHOICE_OPTIONS: Readonly<
  Record<Choice, { options: readonly string[]; best: string }>
> = {
  travel: { options: ["walkCycle", "bus", "ownVehicle"], best: "walkCycle" },
  light: { options: ["led", "tube"], best: "led" },
  floors: { options: ["stairs", "lift"], best: "stairs" },
  cold: { options: ["sweater", "heater"], best: "sweater" },
};

export const FossilAction = {
  SetCut: "setCut",
  SetAir: "setAir",
  Pick: "pick",
  Reset: "reset",
} as const;
export const FossilSignal = {
  Changed: "changed",
  Picked: "picked",
  AllPicked: "allPicked",
} as const;
export const FossilDerived = {
  PetroleumYears: "petroleumYears",
  CoalYears: "coalYears",
  Products: "products",
  Poisonous: "poisonous",
  Saved: "saved",
} as const;
export const FossilPart = { Bars: "bars", Flame: "flame", Choices: "choices" } as const;

const fossilState = z
  .object({
    mode: z.nativeEnum(FossilMode),
    /** Last mode: how much less we use, in percent. */
    cut: z.number().int().min(0).max(MAX_CUT),
    air: z.nativeEnum(Air),
    /** Choices mode: what the learner picked for each choice so far. */
    picks: z.array(z.object({ choice: z.nativeEnum(Choice), option: z.string() }).strict()),
    choices: z.array(z.nativeEnum(Choice)).min(1).max(4),
    showNames: z.boolean(),
    canSetCut: z.boolean(),
    canSetAir: z.boolean(),
    canPick: z.boolean(),
  })
  .strict();
export type FossilState = z.infer<typeof fossilState>;

export const yearsOf = (base: number, cut: number): number => Math.round(base / (1 - cut / 100));
export function productsOf(air: Air): Product[] {
  return [
    air === Air.Enough ? Product.CarbonDioxide : Product.CarbonMonoxide,
    Product.Water,
    Product.NitrogenOxides,
    Product.SulphurOxides,
  ];
}
/** Poisonous at high concentrations (NCERT): CO and the oxides of nitrogen and sulphur. */
export const poisonousOf = (air: Air): Product[] =>
  productsOf(air).filter((p) => p !== Product.CarbonDioxide && p !== Product.Water);
export const savedOf = (s: Pick<FossilState, "picks">): number =>
  s.picks.filter((p) => CHOICE_OPTIONS[p.choice].best === p.option).length;

export function describeFossil(s: FossilState): string {
  if (s.mode === FossilMode.Last)
    return `At the present rate, petroleum lasts about ${PETROLEUM_YEARS} years and coal about ${COAL_YEARS} years. Using ${s.cut}% less: petroleum about ${yearsOf(PETROLEUM_YEARS, s.cut)} years, coal about ${yearsOf(COAL_YEARS, s.cut)} years.`;
  if (s.mode === FossilMode.Burn)
    return `Burning coal or petroleum (carbon, hydrogen, nitrogen, sulphur) in ${s.air === Air.Enough ? "enough air" : "too little air"} gives: ${productsOf(s.air).join(", ")}.`;
  const picked = s.picks.map((p) => `${p.choice}: ${p.option}`).join("; ");
  return `Everyday choices: ${s.choices.join(", ")}. Picked: ${picked === "" ? "none yet" : picked}. ${savedOf(s)} pick(s) use less fuel.`;
}

const act = actionsFor<FossilState>();

export const fossilClock = defineProp({
  type: "fossilClock",
  describe:
    "NCERT 16.4, coal and petroleum. Last mode: years they last at the present rate (petroleum about 40, coal about 200) and how a cut in use stretches them. Burn mode: carbon, hydrogen, nitrogen and sulphur in the fuel give carbon dioxide, water, oxides of nitrogen and oxides of sulphur; in too little air carbon monoxide forms instead of carbon dioxide. Choices mode: NCERT's everyday choices (travel, lights, lift or stairs, sweater or heater).",
  state: fossilState,
  defaults: {
    mode: FossilMode.Last,
    cut: 0,
    air: Air.Enough,
    picks: [],
    choices: [...CHOICES],
    showNames: true,
    canSetCut: true,
    canSetAir: true,
    canPick: true,
  },
  inputs: ["mode", "choices", "showNames", "canSetCut", "canSetAir", "canPick"],
  invariant: (s) => {
    if (s.cut % CUT_STEP !== 0) return `cut goes in steps of ${CUT_STEP}`;
    if (s.picks.some((p) => !s.choices.includes(p.choice))) return "picked a choice not offered";
    if (s.picks.some((p) => !CHOICE_OPTIONS[p.choice].options.includes(p.option)))
      return "picked an option the choice doesn't have";
    if (new Set(s.picks.map((p) => p.choice)).size !== s.picks.length)
      return "a choice was picked twice";
    return undefined;
  },
  derived: {
    [FossilDerived.PetroleumYears]: {
      describe: "Years petroleum lasts at the chosen cut",
      compute: (s) => yearsOf(PETROLEUM_YEARS, s.cut),
    },
    [FossilDerived.CoalYears]: {
      describe: "Years coal lasts at the chosen cut",
      compute: (s) => yearsOf(COAL_YEARS, s.cut),
    },
    [FossilDerived.Products]: { describe: "What burning gives", compute: (s) => productsOf(s.air) },
    [FossilDerived.Poisonous]: {
      describe: "The products that are poisonous at high concentrations",
      compute: (s) => poisonousOf(s.air),
    },
    [FossilDerived.Saved]: { describe: "How many picks use less fuel", compute: savedOf },
  },
  actions: {
    [FossilAction.SetCut]: act({
      describe: "Use this much less coal and petroleum (percent)",
      byLearner: true,
      args: z.object({ cut: z.number().int().min(0).max(MAX_CUT) }).strict(),
      run: (_s, a) => {
        const cut = Math.round(a.cut / CUT_STEP) * CUT_STEP;
        return set(
          { cut },
          {
            signal: FossilSignal.Changed,
            payload: {
              cut,
              petroleum: yearsOf(PETROLEUM_YEARS, cut),
              coal: yearsOf(COAL_YEARS, cut),
            },
          },
        );
      },
    }),
    [FossilAction.SetAir]: act({
      describe: "Burn in enough air or too little air",
      byLearner: true,
      args: z.object({ air: z.nativeEnum(Air) }).strict(),
      run: (_s, a) =>
        set(
          { air: a.air },
          { signal: FossilSignal.Changed, payload: { products: productsOf(a.air) } },
        ),
    }),
    [FossilAction.Pick]: act({
      describe: "Pick an option for one everyday choice",
      byLearner: true,
      args: z.object({ choice: z.nativeEnum(Choice), option: z.string() }).strict(),
      run: (s, a) => {
        if (!s.choices.includes(a.choice) || !CHOICE_OPTIONS[a.choice].options.includes(a.option))
          return set({});
        const picks = [
          ...s.picks.filter((p) => p.choice !== a.choice),
          { choice: a.choice, option: a.option },
        ];
        const emit: Emit[] = [
          {
            signal: FossilSignal.Picked,
            payload: { ...a, usesLess: CHOICE_OPTIONS[a.choice].best === a.option },
          },
        ];
        if (picks.length === s.choices.length)
          emit.push({ signal: FossilSignal.AllPicked, payload: { saved: savedOf({ picks }) } });
        return set({ picks }, ...emit);
      },
    }),
    [FossilAction.Reset]: act({
      describe: "Clear the picks and the cut",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ picks: [], cut: 0 }),
    }),
  },
  signals: {
    [FossilSignal.Changed]: { describe: "The cut or the air changed" },
    [FossilSignal.Picked]: {
      describe: "An option was picked; the payload says if it uses less fuel",
    },
    [FossilSignal.AllPicked]: {
      describe: "Every choice is picked; the payload has how many use less fuel",
      isCommit: true,
    },
  },
  observe: (s) => ({
    summary: describeFossil(s),
    elements:
      s.mode === FossilMode.Last
        ? [
            {
              id: FossilPart.Bars,
              value: {
                petroleum: yearsOf(PETROLEUM_YEARS, s.cut),
                coal: yearsOf(COAL_YEARS, s.cut),
              },
            },
          ]
        : s.mode === FossilMode.Burn
          ? [{ id: FossilPart.Flame, value: productsOf(s.air) }]
          : [{ id: FossilPart.Choices, value: s.picks }],
  }),
  parts: (s) =>
    s.mode === FossilMode.Last
      ? [FossilPart.Bars]
      : s.mode === FossilMode.Burn
        ? [FossilPart.Flame]
        : [FossilPart.Choices],
});
