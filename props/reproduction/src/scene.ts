import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the reproduction chapter's "Green Sunday" arc: Grandpa promises fifty plants for
 * the housing society's plant sale without buying one, and Riya and Kabir find out how living
 * things make more of themselves. One neutral panel (a school health class) frames the lessons on
 * human reproduction. A fixed 320 × 180 picture, scaled; nothing to tap.
 */

export const ReproductionScene = {
  GreenSunday: "greenSunday",
  YeastTube: "yeastTube",
  PondJar: "pondJar",
  MouldyBread: "mouldyBread",
  PotatoTray: "potatoTray",
  MoneyPlantJars: "moneyPlantJars",
  RoseGraft: "roseGraft",
  BeeOnPeas: "beeOnPeas",
  ChanaSprouts: "chanaSprouts",
  HealthClass: "healthClass",
  PlantSale: "plantSale",
  SavingSeeds: "savingSeeds",
} as const;
export type ReproductionScene = (typeof ReproductionScene)[keyof typeof ReproductionScene];

export const ReproductionScenePart = { Picture: "picture" } as const;
export const REPRODUCTION_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(ReproductionScene) }).strict();
export type ReproductionSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<ReproductionScene, string>> = {
  greenSunday:
    "The housing society's notice board: a Green Sunday plant-sale poster with a drawing of a potted plant. Grandpa points at it, smiling; Riya and Kabir look worried.",
  yeastTube:
    "The kitchen table: Riya holds up a test tube of sugar water with a cotton plug and a pinch of yeast in it; a bowl of sugar beside it.",
  pondJar:
    "By a pond with dark green water: Kabir holds up a glass jar of green water with thread-like strands floating in it.",
  mouldyBread:
    "A slice of bread on a plate, covered with fuzzy grey-green patches of mould; Riya looks at it through a magnifying glass.",
  potatoTray:
    "Grandpa's terrace: a tray of wet cotton with potato pieces on it; Grandpa kneels beside it and Kabir watches.",
  moneyPlantJars:
    "A sunny windowsill with three glass jars of water, each holding a money-plant cutting; Kabir points at one with new roots.",
  roseGraft:
    "Grandpa ties a cut rose shoot onto a rooted stem in a pot with tape; Riya holds the pot steady.",
  beeOnPeas:
    "Grandpa's pea plants climbing a frame, with small white-and-violet flowers; a bee hovers at one flower and Kabir watches it.",
  chanaSprouts:
    "The kitchen: a plate of soaked chana under a wet cloth; Mom lifts the cloth and Kabir peers at tiny white sprouts.",
  healthClass:
    "A school classroom: a teacher stands at the blackboard pointing to a simple diagram; students sit at desks, seen from behind.",
  plantSale:
    "Green Sunday: a long table covered with potted plants (money plants, Bryophyllum, potato plants, a rose); neighbours browse while Grandpa, Riya and Kabir stand proudly behind it.",
  savingSeeds:
    "Evening on the terrace: Grandpa shells dry pea pods into a glass jar of seeds, picking them from his tallest plants; Kabir holds the jar.",
};

export const describeReproductionScene = (s: ReproductionSceneState): string => WORDS[s.scene];

export const reproductionScene = defineProp({
  type: "reproductionScene",
  describe:
    "A story panel for the reproduction chapter (Green Sunday: Grandpa promises fifty plants without buying one): the notice, Riya's yeast tube, Kabir's pond jar, mouldy bread, potato pieces on wet cotton, money-plant cuttings, grafting a rose, a bee on pea flowers, chana sprouts, a neutral school health class, the plant sale, and saving pea seeds. Nothing to tap.",
  state: sceneState,
  defaults: { scene: ReproductionScene.GreenSunday },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeReproductionScene(s),
    elements: [{ id: ReproductionScenePart.Picture, value: describeReproductionScene(s) }],
  }),
  parts: () => [ReproductionScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === ReproductionScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((REPRODUCTION_PICTURE.height * width) / REPRODUCTION_PICTURE.width),
        }
      : undefined,
});
