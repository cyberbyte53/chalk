import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story and idea panels for the heredity chapter's "Grandpa's terrace garden" arc: Grandpa grows
 * peas on the roof, Riya and Kabir work out why some came up short, and the garden's beetles show
 * evolution at work. Drawn in a fixed 320 × 180 picture, scaled; nothing to tap.
 */

export const HeredityScene = {
  TerraceGarden: "terraceGarden",
  ShortSurprise: "shortSurprise",
  EarlobesFamily: "earlobesFamily",
  FamilyAlbum: "familyAlbum",
  BeetleBush: "beetleBush",
  WildCabbage: "wildCabbage",
  TreeNotLadder: "treeNotLadder",
  OutOfAfrica: "outOfAfrica",
} as const;
export type HeredityScene = (typeof HeredityScene)[keyof typeof HeredityScene];

export const HeredityScenePart = { Picture: "picture" } as const;
export const SCENE_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(HeredityScene) }).strict();
export type HereditySceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<HeredityScene, string>> = {
  terraceGarden:
    "Grandpa's terrace garden on a sunny morning: a row of tall pea plants with violet flowers in a long bed along the roof's wall. Grandpa waters them; Riya and Kabir watch.",
  shortSurprise:
    "The new pea plants Grandpa grew from seeds of his tall plants: most are tall, but a few are short. Grandpa scratches his head; Kabir points at a short one.",
  earlobesFamily:
    "Four ears, close up: Grandpa's and Riya's earlobes hang free below the ear; Mom's and Kabir's are attached straight to the side of the head.",
  familyAlbum:
    "An open family photo album: Grandpa as a boy, Mom as a girl, Riya and Kabir now. They share a likeness (the same curl of hair, the same smile) but no two look exactly alike.",
  beetleBush:
    "A green bush in the garden with red beetles on its leaves, easy to see; a crow swoops in. One green beetle sits almost invisible on a leaf.",
  wildCabbage:
    "One wild cabbage plant in the middle, with arrows to five vegetables people bred from it by choosing which plants to grow: cabbage (leaves packed close), broccoli (flower buds held back), cauliflower (flowers that never open), kohlrabi (a swollen stem) and kale (bigger leaves).",
  treeNotLadder:
    "Two pictures of evolution. Left, crossed out: a ladder with bacteria at the bottom and humans at the top, as if each step were better. Right, ticked: a branching tree, bacteria, spiders, fish, chimpanzees and humans all at the tips of their own branches, joined by common ancestors further down.",
  outOfAfrica:
    "A simple world map: arrows lead out of Africa, where the first humans lived, to West Asia, then Europe, South Asia, East Asia, down to Australia, and across a land bridge to the Americas.",
};

export function describeHeredityScene(s: HeredityScene): string {
  return WORDS[s];
}

export const heredityScene = defineProp({
  type: "heredityScene",
  describe:
    "An illustrated panel for the heredity and evolution chapter: story scenes (Grandpa's terrace pea garden, the surprise short plants, the family's earlobes, the family album, the beetle bush with a crow) and idea scenes (vegetables bred from wild cabbage, evolution as a tree not a ladder, humans spreading out of Africa).",
  state: sceneState,
  defaults: { scene: HeredityScene.TerraceGarden },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeHeredityScene(s.scene),
    elements: [{ id: HeredityScenePart.Picture, value: describeHeredityScene(s.scene) }],
  }),
  parts: () => [HeredityScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === HeredityScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((SCENE_PICTURE.height * width) / SCENE_PICTURE.width),
        }
      : undefined,
});
