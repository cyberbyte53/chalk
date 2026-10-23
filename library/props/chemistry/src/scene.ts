import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the chemical reactions chapter: Riya, Kabir, Mom and Grandpa getting the
 * house ready for Diwali, each errand a reaction.
 */

export const ChemistrySceneKind = {
  DiwaliList: "diwaliList",
  Whitewash: "whitewash",
  RustyGate: "rustyGate",
  TarnishedSilver: "tarnishedSilver",
  NamkeenStale: "namkeenStale",
  Sparkler: "sparkler",
  DiwaliNight: "diwaliNight",
} as const;
export type ChemistrySceneKind = (typeof ChemistrySceneKind)[keyof typeof ChemistrySceneKind];

export const ChemistryScenePart = { Picture: "picture" } as const;

export const CHEMISTRY_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(ChemistrySceneKind) }).strict();
export type ChemistrySceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<ChemistrySceneKind, string> = {
  [ChemistrySceneKind.DiwaliList]:
    "The kitchen a week before Diwali: Riya and Kabir in front of the fridge, where Mom has stuck a long to-do list (whitewash the walls, fix the gate, polish the silver and the diyas, buy namkeen, sparklers). Kabir points at it.",
  [ChemistrySceneKind.Whitewash]:
    "Whitewashing: a bucket of quick lime and water fizzing and steaming, Kabir stepping back from the heat; behind, a wall half painted white with a brush and Riya on a stool.",
  [ChemistrySceneKind.RustyGate]:
    "The front gate: its iron bars are coated with reddish-brown rust, flaking off; Grandpa holds a tin of paint and a brush.",
  [ChemistrySceneKind.TarnishedSilver]:
    "On a cloth on the table: Mom's silver anklets, gone black in places, and copper diyas with a green coating; Mom looks at them, frowning.",
  [ChemistrySceneKind.NamkeenStale]:
    "Two snacks side by side: an old open jar of namkeen that smells off (rancid), and a sealed chips packet puffed up with gas, still fresh.",
  [ChemistrySceneKind.Sparkler]:
    "Night on the terrace: Riya holds a lit sparkler at arm's length; it burns with a dazzling white light and throws sparks.",
  [ChemistrySceneKind.DiwaliNight]:
    "Diwali night: the house with shiny white walls, a freshly painted gate, rows of bright diyas and a rangoli; the family on the steps, Kabir with a sparkler.",
};

export function describeChemistryScene(s: ChemistrySceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const chemistryScene = defineProp({
  type: "chemistryScene",
  describe:
    "An illustrated story panel for the chemical reactions chapter: the family gets the house ready for Diwali (the to-do list, whitewashing with lime, the rusty gate, black silver and green copper, stale namkeen and a nitrogen-filled chips packet, a sparkler, Diwali night).",
  state: sceneState,
  defaults: { scene: ChemistrySceneKind.DiwaliList },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeChemistryScene(s),
    elements: [{ id: ChemistryScenePart.Picture, value: describeChemistryScene(s) }],
  }),
  parts: () => [ChemistryScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === ChemistryScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((CHEMISTRY_PICTURE.height * width) / CHEMISTRY_PICTURE.width),
        }
      : undefined,
});
