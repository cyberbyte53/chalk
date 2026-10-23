import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the "Our Environment" chapter's mission, "The Bottle Pond": the school eco-club
 * challenges Riya and Kabir to keep a sealed jar of pond life alive for 30 days and to halve their
 * family's garbage for a week. Grandpa's terrace tub-pond and garden. A fixed 320 × 180 picture,
 * scaled; nothing to tap.
 */

export const EnvScene = {
  EcoClubNotice: "ecoClubNotice",
  TubPond: "tubPond",
  CloudyJar: "cloudyJar",
  Sprayer: "sprayer",
  OldFridge: "oldFridge",
  GarbageHeap: "garbageHeap",
  BuryPit: "buryPit",
  TrainChai: "trainChai",
  ClothBag: "clothBag",
  EnvironmentDay: "environmentDay",
} as const;
export type EnvScene = (typeof EnvScene)[keyof typeof EnvScene];

export const EnvScenePart = { Picture: "picture" } as const;
export const ENV_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(EnvScene) }).strict();
export type EnvSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<EnvScene, string>> = {
  ecoClubNotice:
    "The school notice board: the eco-club's Environment Week challenge. Keep a sealed jar of pond life alive for 30 days, and halve your family's garbage for a week. Riya points at it; Kabir grins.",
  tubPond:
    "Grandpa's terrace tub-pond with water weeds, snails and tiny fish. Kabir scoops pond water into a big glass jar while Grandpa watches.",
  cloudyJar:
    "Day 3: Kabir's first jar on a dark shelf, crowded with fish and no plants, the water cloudy and green-brown. Riya holds her nose.",
  sprayer:
    "A neighbour's field beyond the terrace: someone spraying pesticide over the crops. Grandpa shakes his head beside his own unsprayed vegetables.",
  oldFridge:
    "An old refrigerator being wheeled out for scrap, labelled 'CFC'. Mom points at the new one's 'CFC-free' sticker.",
  garbageHeap:
    "The family's garbage for one day spilling out of a single bin: peels, milk packets, wrappers, paper, a broken slipper. Kabir looks shocked.",
  buryPit:
    "Grandpa and Kabir digging a pit in the garden and burying the day's waste under 15 cm of soil, a stick marking the spot.",
  trainChai:
    "On a train, a tea vendor holds kulhads, plastic cups and paper cups. Grandpa tells Riya how tea used to come in glasses you gave back.",
  clothBag:
    "Mom and Riya at the vegetable stall with a cloth bag instead of plastic bags; Kabir walks beside them instead of taking the scooter.",
  environmentDay:
    "Environment Day at school: the sealed jar, clear and green on day 30, on a table with a banner. The family stands proudly beside two half-full bins, one for biodegradable and one for non-biodegradable waste.",
};

export const describeEnvScene = (s: EnvSceneState): string => WORDS[s.scene];

export const environmentScene = defineProp({
  type: "environmentScene",
  describe:
    "A story panel for the Our Environment chapter (the eco-club's Bottle Pond challenge; Grandpa's terrace pond and garden): the challenge notice, Grandpa's tub-pond, a cloudy first jar, a field being sprayed, an old CFC fridge, a day's garbage, the burial pit, tea cups on a train, shopping with a cloth bag, and Environment Day. Nothing to tap.",
  state: sceneState,
  defaults: { scene: EnvScene.EcoClubNotice },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeEnvScene(s),
    elements: [{ id: EnvScenePart.Picture, value: describeEnvScene(s) }],
  }),
  parts: () => [EnvScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === EnvScenePart.Picture
      ? { x: 0, y: 0, width, height: Math.round((ENV_PICTURE.height * width) / ENV_PICTURE.width) }
      : undefined,
});
