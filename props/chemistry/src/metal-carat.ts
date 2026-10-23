import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * Gold as an alloy (NCERT 3.5.1, "Do You Know?"): pure gold is 24 carat and very soft. Jewellery
 * gold is alloyed with copper or silver to make it harder: 22 carat is 22 parts gold to 2 parts of
 * the other metal, out of 24.
 */

export const CARATS = [24, 22, 18, 14] as const;
export type Carat = (typeof CARATS)[number];

export const AlloyMetal = { Copper: "copper", Silver: "silver" } as const;
export type AlloyMetal = (typeof AlloyMetal)[keyof typeof AlloyMetal];

export const ALLOY_WORDS: Record<AlloyMetal, Words> = {
  copper: { en: "copper", hi: "ताँबा" },
  silver: { en: "silver", hi: "चाँदी" },
};

export const CaratAction = { SetCarat: "setCarat", SetMetal: "setMetal" } as const;
export const CaratSignal = { Changed: "changed" } as const;
export const CaratDerived = {
  GoldParts: "goldParts",
  OtherParts: "otherParts",
  GoldPercent: "goldPercent",
  Hardness: "hardness",
} as const;
export const CaratPart = {
  Grid: "grid",
  Hardness: "hardness",
  Carats: "carats",
  Metals: "metals",
} as const;

const caratState = z
  .object({
    carat: z.union([z.literal(24), z.literal(22), z.literal(18), z.literal(14)]),
    other: z.nativeEnum(AlloyMetal),
    canChoose: z.boolean(),
  })
  .strict();
export type CaratState = z.infer<typeof caratState>;

export const goldPercent = (carat: number): number => Math.round((carat / 24) * 1000) / 10;
/** Hardness on a 0–1 scale: pure gold soft, harder as more of the other metal is mixed in. */
export const hardnessOf = (carat: number): number => Math.min(1, 0.15 + ((24 - carat) / 10) * 0.85);

export function describeCarat(s: CaratState): string {
  const other = 24 - s.carat;
  return s.carat === 24
    ? "24 carat: pure gold, all 24 parts gold; very soft, too soft for jewellery."
    : `${s.carat} carat: ${s.carat} parts gold and ${other} parts ${s.other}, out of 24 (${goldPercent(s.carat)}% gold); harder than pure gold.`;
}

const act = actionsFor<CaratState>();

export const goldCarat = defineProp({
  type: "goldCarat",
  describe:
    "Gold carats as parts of 24 (NCERT 3.5.1): 24 carat is pure gold, very soft; 22 carat is 22 parts gold and 2 parts copper or silver, harder and used for jewellery in India; 18 and 14 carat have more of the other metal. A grid of 24 squares shows the parts, with a hardness bar.",
  state: caratState,
  defaults: { carat: 22, other: AlloyMetal.Copper, canChoose: true },
  inputs: ["canChoose"],
  derived: {
    [CaratDerived.GoldParts]: { describe: "Parts of gold out of 24", compute: (s) => s.carat },
    [CaratDerived.OtherParts]: {
      describe: "Parts of copper or silver out of 24",
      compute: (s) => 24 - s.carat,
    },
    [CaratDerived.GoldPercent]: {
      describe: "The share of gold, per cent",
      compute: (s) => goldPercent(s.carat),
    },
    [CaratDerived.Hardness]: {
      describe: "How hard it is, 0 (soft) to 1 (hard)",
      compute: (s) => hardnessOf(s.carat),
    },
  },
  actions: {
    [CaratAction.SetCarat]: act({
      describe: "Pick 24, 22, 18 or 14 carat",
      byLearner: true,
      args: z
        .object({ carat: z.union([z.literal(24), z.literal(22), z.literal(18), z.literal(14)]) })
        .strict(),
      run: (s, a) =>
        set(
          { carat: a.carat },
          { signal: CaratSignal.Changed, payload: { carat: a.carat, other: s.other } },
        ),
    }),
    [CaratAction.SetMetal]: act({
      describe: "Mix in copper or silver",
      byLearner: true,
      args: z.object({ other: z.nativeEnum(AlloyMetal) }).strict(),
      run: (s, a) =>
        set(
          { other: a.other },
          { signal: CaratSignal.Changed, payload: { carat: s.carat, other: a.other } },
        ),
    }),
  },
  signals: {
    [CaratSignal.Changed]: { describe: "The carat or the other metal changed" },
  },
  observe: (s) => {
    const elements: Element[] = [
      { id: CaratPart.Grid, value: describeCarat(s) },
      { id: CaratPart.Hardness, value: `hardness ${Math.round(hardnessOf(s.carat) * 10)}/10` },
    ];
    return { summary: describeCarat(s), elements };
  },
  parts: (s) => [
    CaratPart.Grid,
    CaratPart.Hardness,
    ...(s.canChoose ? [CaratPart.Carats, CaratPart.Metals] : []),
  ],
});
