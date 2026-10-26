import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Biological magnification (NCERT 15.1.1): pesticides sprayed on crops wash into the soil and water.
 * Plants take them up with water and minerals; the chemicals are not degradable, so every animal
 * that eats many of the level below keeps all of their pesticide. The amount in each body grows at
 * every trophic level, and humans, at the top, carry the most. Drawn as dots of pesticide per body.
 * NCERT gives no numbers; the prop multiplies by MAGNIFY per level only to make "more" visible.
 */

export const MagSetting = { Field: "field", Pond: "pond" } as const;
export type MagSetting = (typeof MagSetting)[keyof typeof MagSetting];

/** From the soil or water up to us. */
export const MAG_CHAINS: Readonly<Record<MagSetting, readonly string[]>> = {
  field: ["soilAndWater", "wheat", "goat", "human"],
  pond: ["pondWater", "waterPlants", "fish", "human"],
};

/** How many times more pesticide each level holds than the one below (illustrative only). */
export const MAGNIFY = 4;

/** Dots of pesticide per body at each step of the chain (0 = the soil or water itself). */
export const doseAt = (step: number, isSprayed: boolean): number =>
  isSprayed ? MAGNIFY ** step : 0;

export const MagAction = {
  Spray: "spray",
  Next: "next",
  Reset: "reset",
  SetSetting: "setSetting",
} as const;
export const MagSignal = {
  Sprayed: "sprayed",
  Stepped: "stepped",
  ReachedTop: "reachedTop",
} as const;
export const MagDerived = {
  Chain: "chain",
  Doses: "doses",
  Highest: "highest",
  IsAtTop: "isAtTop",
} as const;
export const MagPart = { Picture: "picture", Spray: "spray", Next: "next" } as const;

const magState = z
  .object({
    setting: z.nativeEnum(MagSetting),
    isSprayed: z.boolean(),
    /** How far up the chain is showing: 0 = the soil or water, 3 = humans. */
    step: z.number().int().min(0).max(3),
    /** "×1, ×4, ×16 …" beside the dots (illustrative). */
    showNumbers: z.boolean(),
    canSpray: z.boolean(),
    canStep: z.boolean(),
    canSetSetting: z.boolean(),
  })
  .strict();
export type MagState = z.infer<typeof magState>;

const NAMES: Readonly<Record<string, string>> = {
  soilAndWater: "the soil and water",
  wheat: "wheat",
  goat: "a goat",
  human: "a human",
  pondWater: "the pond water",
  waterPlants: "water plants",
  fish: "a fish",
};

export function describeMagnification(s: MagState): string {
  const chain = MAG_CHAINS[s.setting];
  const shown = chain.slice(0, s.step + 1);
  if (!s.isSprayed) {
    return `A ${s.setting} food chain from ${NAMES[chain[0] as string]} up to humans (${chain.map((c) => NAMES[c]).join(" → ")}). No pesticide has been sprayed yet.`;
  }
  return `Pesticide sprayed on the crops has washed into ${NAMES[chain[0] as string]}. Going up the chain, ${shown
    .map((c, i) => `${NAMES[c]} holds ${i === 0 ? "a little" : `${MAGNIFY ** i} times as much`}`)
    .join(
      ", ",
    )}. The chemical is not degradable, so it builds up at every trophic level${s.step === 3 ? "; humans, at the top, carry the most" : ""}.`;
}

const act = actionsFor<MagState>();

export const bioMagnification = defineProp({
  type: "bioMagnification",
  describe:
    "Biological magnification: pesticide sprayed on crops washes into the soil or a pond, is taken up by plants and passes up a food chain (field: soil → wheat → goat → human; pond: water → water plants → fish → human). It is not degradable, so the dots of pesticide per body multiply at every level and humans at the top hold the most. Spray, then step up the chain.",
  state: magState,
  defaults: {
    setting: MagSetting.Field,
    isSprayed: false,
    step: 0,
    showNumbers: false,
    canSpray: true,
    canStep: true,
    canSetSetting: false,
  },
  inputs: ["setting", "showNumbers", "canSpray", "canStep", "canSetSetting"],
  derived: {
    [MagDerived.Chain]: {
      describe: "The chain from the soil or water up to humans",
      compute: (s) => [...MAG_CHAINS[s.setting]],
    },
    [MagDerived.Doses]: {
      describe: "Dots of pesticide per body at each step shown so far (illustrative)",
      compute: (s) => Array.from({ length: s.step + 1 }, (_, i) => doseAt(i, s.isSprayed)),
    },
    [MagDerived.Highest]: {
      describe: "Which shown step holds the most pesticide",
      compute: (s) => (s.isSprayed ? (MAG_CHAINS[s.setting][s.step] ?? null) : null),
    },
    [MagDerived.IsAtTop]: {
      describe: "Whether the chain is showing all the way up to humans",
      compute: (s) => s.step === 3,
    },
  },
  actions: {
    [MagAction.Spray]: act({
      describe: "Spray pesticide on the crops (or stop)",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (_s, a) =>
        set({ isSprayed: a.on }, { signal: MagSignal.Sprayed, payload: { on: a.on } }),
    }),
    [MagAction.Next]: act({
      describe: "Go one level up the food chain",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, 3);
        const emit: Emit[] = [{ signal: MagSignal.Stepped, payload: { step } }];
        if (step === 3 && s.step < 3)
          emit.push({ signal: MagSignal.ReachedTop, payload: { step } });
        return set({ step }, ...emit);
      },
    }),
    [MagAction.Reset]: act({
      describe: "Back to the soil or water, unsprayed",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0, isSprayed: false }),
    }),
    [MagAction.SetSetting]: act({
      describe: "Switch between the field chain and the pond chain",
      byLearner: true,
      args: z.object({ setting: z.nativeEnum(MagSetting) }).strict(),
      run: (_s, a) => set({ setting: a.setting, step: 0 }),
    }),
  },
  signals: {
    [MagSignal.Sprayed]: { describe: "The crops were sprayed (or the spraying stopped)" },
    [MagSignal.Stepped]: { describe: "Moved one level up; `step` is the new level" },
    [MagSignal.ReachedTop]: {
      describe: "The chain now shows humans at the top, holding the most",
    },
  },
  observe: (s) => ({
    summary: describeMagnification(s),
    elements: [{ id: MagPart.Picture, value: describeMagnification(s) }],
  }),
  parts: () => [MagPart.Picture, MagPart.Spray, MagPart.Next],
});
