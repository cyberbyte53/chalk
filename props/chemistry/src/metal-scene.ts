import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the metals and non-metals chapter: the case of the shrinking bangles. A man
 * at the door "polishes" Mom's gold bangles in a liquid; they sparkle but weigh less; Riya and
 * Kabir work out what happened, one clue per lesson.
 */

export const MetalSceneKind = {
  GoldsmithAtDoor: "goldsmithAtDoor",
  LighterBangles: "lighterBangles",
  CaseFile: "caseFile",
  KitchenPans: "kitchenPans",
  IronPillar: "ironPillar",
  RailwayWeld: "railwayWeld",
  Jeweller: "jeweller",
  CaseClosed: "caseClosed",
} as const;
export type MetalSceneKind = (typeof MetalSceneKind)[keyof typeof MetalSceneKind];

export const MetalScenePart = { Picture: "picture" } as const;
export const METAL_PICTURE = { width: 320, height: 180 } as const;

const metalSceneState = z.object({ scene: z.nativeEnum(MetalSceneKind) }).strict();
export type MetalSceneState = z.infer<typeof metalSceneState>;

const DESCRIPTIONS: Record<MetalSceneKind, string> = {
  [MetalSceneKind.GoldsmithAtDoor]:
    "At the front door: a smiling stranger with a bag and a small bowl of fuming liquid holds up a pair of sparkling gold bangles; Mom stands in the doorway, Kabir peeks from behind her.",
  [MetalSceneKind.LighterBangles]:
    "The kitchen counter: Mom's gold bangles on a digital kitchen scale that reads 41 g; beside it an old receipt showing 48 g. Riya frowns at the numbers.",
  [MetalSceneKind.CaseFile]:
    "Riya and Kabir at the study desk under a lamp: an open notebook headed with a big question mark, a magnifying glass, the bangles, and a list of clues with ticks and empty boxes.",
  [MetalSceneKind.KitchenPans]:
    "Mom cooking: an iron tawa, an aluminium kadhai and a copper-bottomed pot on the stove; Kabir taps a steel plate and it rings.",
  [MetalSceneKind.IronPillar]:
    "A school trip: the tall dark iron pillar near the Qutub Minar, smooth and without rust, with the tower faint behind it; Riya and Kabir look up at it.",
  [MetalSceneKind.RailwayWeld]:
    "Beside a railway line: a crucible glowing white-hot over the gap between two rails, sparks flying, molten iron running into the gap; Grandpa and Kabir watch from behind a fence.",
  [MetalSceneKind.Jeweller]:
    "An honest jeweller's counter: a small balance, a magnifying loupe, a 22 carat bangle with a hallmark stamp marked 916, and Mom and Riya listening.",
  [MetalSceneKind.CaseClosed]:
    "Evening at home: the family on the sofa, Kabir holding up the case notebook with a big tick on it, Mom wearing her bangles, Grandpa laughing.",
};

export const describeMetalScene = (s: MetalSceneState): string => DESCRIPTIONS[s.scene];

export const metalScene = defineProp({
  type: "metalScene",
  describe:
    "An illustrated story panel for the metals and non-metals chapter, the case of the shrinking bangles: the fake goldsmith at the door, the lighter bangles on the kitchen scale, the case file, the kitchen pans, the iron pillar, a railway track being welded, an honest jeweller with hallmarked gold, the case closed.",
  state: metalSceneState,
  defaults: { scene: MetalSceneKind.GoldsmithAtDoor },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeMetalScene(s),
    elements: [{ id: MetalScenePart.Picture, value: describeMetalScene(s) }],
  }),
  parts: () => [MetalScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === MetalScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((METAL_PICTURE.height * width) / METAL_PICTURE.width),
        }
      : undefined,
});
