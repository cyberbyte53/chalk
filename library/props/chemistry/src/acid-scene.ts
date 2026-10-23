import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the acids, bases and salts chapter: Kabir's birthday party, where Riya puts
 * on a kitchen-chemistry magic show and every act (and every mishap) is a piece of the chapter.
 */

export const AcidSceneKind = {
  PartyPlan: "partyPlan",
  CurryStain: "curryStain",
  MagicPotions: "magicPotions",
  GrandpaAcidity: "grandpaAcidity",
  CakeRise: "cakeRise",
  BeeSting: "beeSting",
  SweetTeeth: "sweetTeeth",
  Extinguisher: "extinguisher",
  Handprint: "handprint",
  PartyNight: "partyNight",
} as const;
export type AcidSceneKind = (typeof AcidSceneKind)[keyof typeof AcidSceneKind];

export const AcidScenePart = { Picture: "picture" } as const;
export const ACID_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(AcidSceneKind) }).strict();
export type AcidSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<AcidSceneKind, string> = {
  [AcidSceneKind.PartyPlan]:
    "The living room, a week before Kabir's birthday: balloons, and a hand-drawn poster on the wall, 'Riya's Magic Show', with colourful flasks on it. Riya points at the poster; Kabir jumps with excitement.",
  [AcidSceneKind.CurryStain]:
    "Kabir holds up his white party shirt: a yellow curry stain on it, and where Mom has scrubbed it with soap the stain has turned reddish brown. A bar of soap and a bucket of water beside them.",
  [AcidSceneKind.MagicPotions]:
    "The magic show: Riya in a cape pours purple red-cabbage juice from a jug into a row of glasses, and the glasses turn red, pink, purple, blue and green. Kabir and a friend watch, amazed.",
  [AcidSceneKind.GrandpaAcidity]:
    "After the cake: Grandpa on the sofa, hand on his stomach, an empty cake plate beside him. On the table: a lemon, a bottle of vinegar and a box of baking soda. Mom stands with a glass of water, wondering which to give him.",
  [AcidSceneKind.CakeRise]:
    "The kitchen counter: two cakes side by side. One is flat and dense; the other, made with baking powder, has risen tall and spongy, full of little holes. A tin of baking powder stands between them.",
  [AcidSceneKind.BeeSting]:
    "The garden during the party: a bee flies off from Kabir's arm, which has a red sting mark. Mom dabs a white paste of baking soda on it. Flowers around.",
  [AcidSceneKind.SweetTeeth]:
    "Kabir with a plate full of sweets, grinning; beside him a big drawing of a tooth with a dark spot of decay, and a toothbrush with toothpaste.",
  [AcidSceneKind.Extinguisher]:
    "The magic show's finale: Riya tilts a bottle and a spray shoots out of its nozzle onto a burning candle, putting it out. Kabir and the guests cheer.",
  [AcidSceneKind.Handprint]:
    "Riya stirs white plaster of Paris and water in a bowl; Kabir presses his hand into a smooth slab of it. A finished, hard handprint lies drying beside it.",
  [AcidSceneKind.PartyNight]:
    "Party night: streamers and balloons, a birthday cake with lit candles, a row of colourful potion glasses, the whole family laughing together, Kabir in a party hat.",
};

export function describeAcidScene(s: AcidSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const acidsScene = defineProp({
  type: "acidsScene",
  describe:
    "An illustrated story panel for the acids, bases and salts chapter: Kabir's birthday party with Riya's kitchen-chemistry magic show (the plan, the curry stain, colour-changing potions, Grandpa's acidity, the risen cake, a bee sting, sweets and teeth, the fire-extinguisher finale, a plaster-of-Paris handprint, party night).",
  state: sceneState,
  defaults: { scene: AcidSceneKind.PartyPlan },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeAcidScene(s),
    elements: [{ id: AcidScenePart.Picture, value: describeAcidScene(s) }],
  }),
  parts: () => [AcidScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === AcidScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((ACID_PICTURE.height * width) / ACID_PICTURE.width),
        }
      : undefined,
});
