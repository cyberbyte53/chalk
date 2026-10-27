import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the chapter's "lights for Grandpa's village" arc: the family arriving in the
 * dim village, a smoky chulha, the high-tension line, the dam upstream, the neighbour's cow shed,
 * the windy ridge, the school's sunny roof, a hot spring, Grandpa's radio, the panchayat meeting,
 * and the school's first evening class under solar lights. A fixed 320 × 180 picture, scaled;
 * nothing to tap.
 */

export const EnergyScene = {
  VillageArrival: "villageArrival",
  SmokyChulha: "smokyChulha",
  PowerLine: "powerLine",
  DamTrip: "damTrip",
  CowShed: "cowShed",
  WindyRidge: "windyRidge",
  SchoolRoof: "schoolRoof",
  HotSpring: "hotSpring",
  RadioNews: "radioNews",
  Panchayat: "panchayat",
  SchoolLit: "schoolLit",
} as const;
export type EnergyScene = (typeof EnergyScene)[keyof typeof EnergyScene];

export const EnergyScenePart = { Picture: "picture" } as const;
export const SCENE_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(EnergyScene) }).strict();
export type EnergySceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<EnergyScene, string>> = {
  villageArrival:
    "Dusk in a hill village: the family walks up a path with their bags, past houses where only one or two windows are lit. Grandpa points to his old house; Riya and Kabir look around at the dark.",
  smokyChulha:
    "A village kitchen: a clay chulha burning wood and cow-dung cakes, thick smoke rising and filling the room. Mom coughs and waves the smoke away; a stack of dung cakes dries on the wall.",
  powerLine:
    "A hillside with a tall steel tower carrying high-tension wires across the valley. Far away on the plain, the chimneys of a power station smoke. Kabir follows the wires with his finger.",
  damTrip:
    "A big concrete dam holding back a wide reservoir between hills; water gushes from pipes at its foot. In the reservoir only the top of an old temple shows above the water. Grandpa and Riya look on from the road.",
  cowShed:
    "The neighbour's cow shed: cows in a row, a heap of fresh dung, and a wall covered in drying dung cakes. Kabir holds his nose; Riya writes in her notebook.",
  windyRidge:
    "A bare ridge above the village where the wind bends the grass and a flag streams out. An old windmill with a water pump stands near a well. Kabir holds his cap on.",
  schoolRoof:
    "The village school's flat roof in bright midday sun. Riya and Kabir stand on it, shading their eyes; below, a classroom with a kerosene lamp on the teacher's table.",
  hotSpring:
    "A hot spring at the foot of a hill: steam rises from a rocky pool and people sit around it. Kabir dips a hand in and pulls it back fast.",
  radioNews:
    "Evening on Grandpa's veranda: an old radio on the table speaks about a nuclear power station. Grandpa listens closely; Riya and Kabir lean in.",
  panchayat:
    "The panchayat meeting under a big tree: villagers sit on durries, the sarpanch in the middle. Riya stands and holds up a chart of the plan, Kabir beside her; Grandpa and Mom watch proudly.",
  schoolLit:
    "Night at the village school: a solar panel on the roof, and the classroom window glowing bright. Children read inside; the family watches from outside, smiling.",
};

export function describeEnergyScene(s: EnergyScene): string {
  return WORDS[s];
}

export const energyScene = defineProp({
  type: "energyScene",
  describe:
    "An illustrated story panel for the sources of energy chapter: arriving in Grandpa's dim village, a smoky wood chulha, a power line from a distant power station, a dam upstream, a cow shed, a windy ridge, the school's sunny roof, a hot spring, a radio report on nuclear power, the panchayat meeting, and the school lit by solar power.",
  state: sceneState,
  defaults: { scene: EnergyScene.VillageArrival },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeEnergyScene(s.scene),
    elements: [{ id: EnergyScenePart.Picture, value: describeEnergyScene(s.scene) }],
  }),
  parts: () => [EnergyScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === EnergyScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((SCENE_PICTURE.height * width) / SCENE_PICTURE.width),
        }
      : undefined,
  isExplainer: false,
});
