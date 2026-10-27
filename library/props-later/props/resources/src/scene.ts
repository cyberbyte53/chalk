import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the Natural Resources chapter's mission, "The Village Audit": the eco-club's
 * last project of the year sends Riya and Kabir with Grandpa to his home village for a resource
 * audit of water, forest, river, fuel and their own habits. A fixed 320 × 180 picture, scaled;
 * nothing to tap.
 */

export const ResScene = {
  AuditNotice: "auditNotice",
  VillageReturn: "villageReturn",
  DryWell: "dryWell",
  CutGrove: "cutGrove",
  Khejri: "khejri",
  Chipko: "chipko",
  TailEnd: "tailEnd",
  CheckDam: "checkDam",
  DirtyGhat: "dirtyGhat",
  ScooterQueue: "scooterQueue",
  GramSabha: "gramSabha",
} as const;
export type ResScene = (typeof ResScene)[keyof typeof ResScene];

export const ResScenePart = { Picture: "picture" } as const;
export const RES_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(ResScene) }).strict();
export type ResSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<ResScene, string>> = {
  auditNotice:
    "The school notice board: the eco-club's final project of the year, a resource audit of one real place. Riya holds a clipboard with an audit sheet: water, forest, river, fuel, our habits.",
  villageReturn:
    "Grandpa steps off a bus into his home village after twenty years. A new concrete road and new brick houses stand where fields used to be; Kabir and Riya look around.",
  dryWell:
    "The village's old stone well in March, nearly dry: a bucket on a long rope hits a few centimetres of muddy water. A woman waits with empty pots.",
  cutGrove:
    "The grove behind the village temple, half of it cut: a row of stumps next to the remaining big trees. Grandpa stands among the stumps.",
  khejri:
    "A khejri tree in a dry Rajasthan landscape, with a small memorial stone beneath it. Grandpa tells Riya and Kabir a story.",
  chipko:
    "A picture in Grandpa's old book: village women holding on to tree trunks in a Himalayan forest while workers with axes stand back.",
  tailEnd:
    "A canal from the big dam: lush green sugarcane near the canal's head, and dry cracked fields at its far end where a farmer looks at an empty channel.",
  checkDam:
    "Villagers and the kids building a low stone-and-earth check dam across a dry gully, with the old well visible downhill.",
  dirtyGhat:
    "The river ghat below the village: a drain pouring dark water into the river, garbage on the steps, clothes being washed. Riya tests a water sample in a test tube.",
  scooterQueue:
    "A line of scooters at the village fuel pump. Kabir points to the market sign: 2 km. Grandpa wheels out an old bicycle.",
  gramSabha:
    "The gram sabha under a big tree: Riya and Kabir present their audit chart (water, forest, river, fuel, habits) to the villagers. A model check dam sits on the table; everyone is nodding.",
};

export const describeResScene = (s: ResSceneState): string => WORDS[s.scene];

export const resourcesScene = defineProp({
  type: "resourcesScene",
  describe:
    "A story panel for the Natural Resources chapter (the Village Audit: Riya, Kabir and Grandpa in his home village): the audit notice, the village after twenty years, the dry well, the half-cut grove, a khejri tree, a Chipko picture, the canal's dry tail end, building a check dam, the dirty ghat, scooters at the fuel pump, and the gram sabha. Nothing to tap.",
  state: sceneState,
  defaults: { scene: ResScene.AuditNotice },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeResScene(s),
    elements: [{ id: ResScenePart.Picture, value: describeResScene(s) }],
  }),
  parts: () => [ResScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === ResScenePart.Picture
      ? { x: 0, y: 0, width, height: Math.round((RES_PICTURE.height * width) / RES_PICTURE.width) }
      : undefined,
});
