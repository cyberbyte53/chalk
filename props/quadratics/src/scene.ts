import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the quadratic equations chapter: Riya plans her class's stall at the school
 * mela, Kabir builds a water rocket for the opening, and Grandpa shows the old way of solving.
 */

export const QuadraticSceneKind = {
  MelaNotice: "melaNotice",
  StallPlot: "stallPlot",
  ToyStall: "toyStall",
  GrandpaSlate: "grandpaSlate",
  MarketRide: "marketRide",
  RocketLaunch: "rocketLaunch",
  MelaDay: "melaDay",
} as const;
export type QuadraticSceneKind = (typeof QuadraticSceneKind)[keyof typeof QuadraticSceneKind];

export const QuadraticScenePart = { Picture: "picture" } as const;

export const QUADRATIC_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(QuadraticSceneKind) }).strict();
export type QuadraticSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<QuadraticSceneKind, string> = {
  [QuadraticSceneKind.MelaNotice]:
    "The school corridor: a notice board with a bright poster for the annual school mela, a stall for each class. Riya reads it holding a notebook; Kabir points at a little rocket drawn in the corner.",
  [QuadraticSceneKind.StallPlot]:
    "The school ground: a rectangle chalked on the grass for the stall, its breadth marked x and its length 2x + 1; Kabir holds one end of a measuring tape, Riya the other, with her notebook open.",
  [QuadraticSceneKind.ToyStall]:
    "A stall table with rows of small handmade toys and a price tag with a question mark; Riya does sums in her notebook while Mom counts out rupee notes.",
  [QuadraticSceneKind.GrandpaSlate]:
    "Grandpa on the verandah with an old slate: on it a square, a strip cut in half and laid along two sides, and a small dashed corner square; Riya and Kabir lean in.",
  [QuadraticSceneKind.MarketRide]:
    "Riya cycling along a road towards the wholesale market, a box of supplies tied on the carrier; a milestone shows the distance in km.",
  [QuadraticSceneKind.RocketLaunch]:
    "The school ground: Kabir's water-bottle rocket on its launcher, a dashed curved path rising and falling across the sky with a height marked at 15 m; Riya holds a stopwatch.",
  [QuadraticSceneKind.MelaDay]:
    "Mela day: the class stall with a banner and a crowd, strings of flags, toys on the table, and Kabir's rocket high in the sky; the family cheering.",
};

export function describeQuadraticScene(s: QuadraticSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const quadraticScene = defineProp({
  type: "quadraticScene",
  describe:
    "An illustrated story panel for the quadratic equations chapter: Riya plans her class's stall at the school mela (the notice, chalking out the plot, pricing the toys, the ride to the market), Grandpa's slate with completing the square, Kabir's water rocket rising and falling, and mela day.",
  state: sceneState,
  defaults: { scene: QuadraticSceneKind.MelaNotice },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeQuadraticScene(s),
    elements: [{ id: QuadraticScenePart.Picture, value: describeQuadraticScene(s) }],
  }),
  parts: () => [QuadraticScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === QuadraticScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((QUADRATIC_PICTURE.height * width) / QUADRATIC_PICTURE.width),
        }
      : undefined,
});
