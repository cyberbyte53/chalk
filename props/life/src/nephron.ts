import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Excretion in human beings (NCERT 6.5.1). System mode: the kidneys, ureters, urinary bladder and
 * urethra. Filter mode, a nephron step by step: blood reaches a cluster of thin capillaries; small
 * substances (water, glucose, amino acids, salts, urea) are filtered into the cup of Bowman's
 * capsule, while cells and proteins stay in the blood; along the coiled tube, glucose, amino acids,
 * salts and most of the water are taken back into the blood; what is left, urea in water, is urine.
 * Water mode: how much water is taken back depends on how much there is to spare; about 180 L is
 * filtered a day but only a litre or two leaves as urine. Dialysis mode: an artificial kidney, where
 * waste diffuses out of the blood into the dialysing fluid, with no reabsorption.
 */

export const NephronMode = {
  System: "system",
  Filter: "filter",
  Water: "water",
  Dialysis: "dialysis",
} as const;
export type NephronMode = (typeof NephronMode)[keyof typeof NephronMode];

export const Drink = { Little: "little", Normal: "normal", Lots: "lots" } as const;
export type Drink = (typeof Drink)[keyof typeof Drink];

export const FILTER_STEPS = 4;
/** Filtrate made by both kidneys in a day (litres). */
export const FILTRATE_LITRES = 180;
/** Urine passed in a day (litres), by how much water was drunk. */
export const URINE_LITRES: Readonly<Record<Drink, number>> = {
  little: 0.8,
  normal: 1.5,
  lots: 2.5,
};

export const Substance = {
  Cells: "cells",
  Proteins: "proteins",
  Glucose: "glucose",
  AminoAcids: "aminoAcids",
  Salts: "salts",
  Water: "water",
  Urea: "urea",
} as const;
export type Substance = (typeof Substance)[keyof typeof Substance];
export const SUBSTANCES: readonly Substance[] = Object.values(Substance);

export const NephronAction = { Next: "next", Reset: "reset", SetDrink: "setDrink" } as const;
export const NephronSignal = { Stepped: "stepped", DrinkChanged: "drinkChanged" } as const;
export const NephronDerived = {
  InFiltrate: "inFiltrate",
  InUrine: "inUrine",
  UrineLitres: "urineLitres",
  ReabsorbedPercent: "reabsorbedPercent",
} as const;
export const NephronPart = { Picture: "picture", Next: "next", Drink: "drink" } as const;

const nephronState = z
  .object({
    mode: z.nativeEnum(NephronMode),
    step: z
      .number()
      .int()
      .min(0)
      .max(FILTER_STEPS - 1),
    drink: z.nativeEnum(Drink),
    showNames: z.boolean(),
    canStep: z.boolean(),
    canSetDrink: z.boolean(),
  })
  .strict();
export type NephronState = z.infer<typeof nephronState>;

/** What gets through the filter into Bowman's capsule: everything but cells and proteins. */
export const FILTERED: readonly Substance[] = SUBSTANCES.filter(
  (x) => x !== Substance.Cells && x !== Substance.Proteins,
);
/** What is left in the tube as urine: urea and some water. */
export const URINE: readonly Substance[] = [Substance.Urea, Substance.Water];

/** What is in the tube at each step (nothing before filtering). */
export function inTubeAt(step: number): readonly Substance[] {
  if (step === 0) return [];
  if (step === 1) return FILTERED;
  return URINE;
}

export const reabsorbedPercentOf = (drink: Drink): number =>
  Math.round(1000 * (1 - URINE_LITRES[drink] / FILTRATE_LITRES)) / 10;

const STEP_WORDS = [
  "Blood arrives at a cluster of very thin-walled capillaries in the kidney. It carries blood cells, proteins, glucose, amino acids, salts, water and the waste urea.",
  "Small substances are filtered out of the capillaries into the cup-shaped Bowman's capsule: water, glucose, amino acids, salts and urea. Blood cells and proteins are too big and stay in the blood.",
  "As the filtrate flows along the coiled tube, glucose, amino acids, salts and most of the water are taken back into the blood around it (selective re-absorption).",
  "What is left in the tube is urine: urea dissolved in water. It flows on to the ureter and the bladder.",
] as const;

export function describeNephron(s: NephronState): string {
  if (s.mode === NephronMode.System)
    return "The human excretory system: two kidneys in the abdomen, one on each side of the backbone; a ureter from each to the urinary bladder, which stores urine; and the urethra, through which it is passed out. The bladder is muscular and under nervous control.";
  if (s.mode === NephronMode.Dialysis)
    return "An artificial kidney: the patient's blood flows through tubes with a semi-permeable lining in a tank of dialysing fluid, which has no nitrogenous waste. Urea diffuses out of the blood into the fluid, and the cleaned blood goes back to the patient. Unlike a kidney, nothing is re-absorbed.";
  if (s.mode === NephronMode.Water) {
    const l = URINE_LITRES[s.drink];
    return `About ${FILTRATE_LITRES} L of filtrate is made a day, but only about ${l} L leaves as urine: ${reabsorbedPercentOf(s.drink)}% is taken back. Drinking ${s.drink === Drink.Lots ? "a lot of water" : s.drink === Drink.Little ? "little water" : "a normal amount"} means ${s.drink === Drink.Lots ? "more, paler urine" : s.drink === Drink.Little ? "less, darker urine" : "a litre or two of urine"}.`;
  }
  return STEP_WORDS[s.step] ?? STEP_WORDS[0];
}

const act = actionsFor<NephronState>();

export const nephron = defineProp({
  type: "nephron",
  describe:
    "Excretion. System mode: kidneys, ureters, bladder, urethra. Filter mode, a nephron in 4 steps: blood at the capillary cluster; water, glucose, amino acids, salts and urea filtered into Bowman's capsule (cells and proteins stay); glucose, amino acids, salts and most water re-absorbed along the tube; urine = urea in water. Water mode: drink little / normal / lots and see the litres of urine against 180 L of filtrate. Dialysis mode: an artificial kidney.",
  state: nephronState,
  defaults: {
    mode: NephronMode.Filter,
    step: 0,
    drink: Drink.Normal,
    showNames: true,
    canStep: true,
    canSetDrink: true,
  },
  inputs: ["mode", "showNames", "canStep", "canSetDrink"],
  derived: {
    [NephronDerived.InFiltrate]: {
      describe: "What passes the filter into Bowman's capsule",
      compute: () => FILTERED,
    },
    [NephronDerived.InUrine]: {
      describe: "Filter mode: what is in the tube at this step",
      compute: (s) => inTubeAt(s.step),
    },
    [NephronDerived.UrineLitres]: {
      describe: "Water mode: litres of urine a day for this much drinking",
      compute: (s) => URINE_LITRES[s.drink],
    },
    [NephronDerived.ReabsorbedPercent]: {
      describe: "Water mode: the percentage of the 180 L of filtrate taken back into the blood",
      compute: (s) => reabsorbedPercentOf(s.drink),
    },
  },
  actions: {
    [NephronAction.Next]: act({
      describe: "Filter mode: the next step along the nephron",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, FILTER_STEPS - 1);
        return set({ step }, { signal: NephronSignal.Stepped, payload: { step } });
      },
    }),
    [NephronAction.Reset]: act({
      describe: "Filter mode: back to the start",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }, { signal: NephronSignal.Stepped, payload: { step: 0 } }),
    }),
    [NephronAction.SetDrink]: act({
      describe: "Water mode: how much water was drunk today",
      byLearner: true,
      args: z.object({ drink: z.nativeEnum(Drink) }).strict(),
      run: (_s, a) =>
        set(
          { drink: a.drink },
          {
            signal: NephronSignal.DrinkChanged,
            payload: { drink: a.drink, urineLitres: URINE_LITRES[a.drink] },
          },
        ),
    }),
  },
  signals: {
    [NephronSignal.Stepped]: { describe: "The nephron moved to `step`" },
    [NephronSignal.DrinkChanged]: { describe: "The day's drinking changed; `urineLitres` follows" },
  },
  observe: (s) => ({
    summary: describeNephron(s),
    elements: [{ id: NephronPart.Picture, value: describeNephron(s) }],
  }),
  parts: () => [NephronPart.Picture, NephronPart.Next, NephronPart.Drink],
});
