import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the surface areas and volumes chapter, "The Weekend Stall": Riya and Kabir run a
 * stall at the Sunday market with Grandpa's wooden toys and Mom's sweets. Paint for the toys is
 * surface area; wood, syrup and ice cream are volume; filling kulfi cones from a can is converting
 * one solid into another; the bucket and the jaggery moulds are frusta.
 */

export const SolidsSceneKind = {
  Stall: "stall",
  Workshop: "workshop",
  RocketPaint: "rocketPaint",
  Kitchen: "kitchen",
  KulfiCan: "kulfiCan",
  JuiceGlasses: "juiceGlasses",
  Jaggery: "jaggery",
  StallDay: "stallDay",
} as const;
export type SolidsSceneKind = (typeof SolidsSceneKind)[keyof typeof SolidsSceneKind];

export const SolidsScenePart = { Picture: "picture" } as const;

export const SOLIDS_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(SolidsSceneKind) }).strict();
export type SolidsSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<SolidsSceneKind, string> = {
  [SolidsSceneKind.Stall]:
    "The Sunday market: an empty stall with a striped awning and a bare table. Riya holds a notebook and Kabir points at the table, planning what to sell; Grandpa and Mom stand behind them.",
  [SolidsSceneKind.Workshop]:
    "Grandpa's workshop: on the bench a row of wooden lattus, each a cone on a hemisphere, and a wooden block with a dome on top. Grandpa smooths a lattu while Kabir holds a paint brush and a small pot.",
  [SolidsSceneKind.RocketPaint]:
    "The verandah: a toy rocket stands on newspaper, a cone on top of a cylinder; Kabir paints the cone orange and the cylinder yellow from two paint pots.",
  [SolidsSceneKind.Kitchen]:
    "Mom's kitchen: gulab jamuns, each shaped like a cylinder with rounded ends, float in a big bowl of syrup; Mom stirs and Riya counts them.",
  [SolidsSceneKind.KulfiCan]:
    "The courtyard: a tall cylindrical can of kulfi beside a stand of ice-cream cones, each topped with a round scoop; Kabir fills a cone while Riya keeps count on her fingers.",
  [SolidsSceneKind.JuiceGlasses]:
    "The stall table: a row of juice glasses, each with a raised dome in its thick bottom so it holds less than it looks; Riya pours juice from a jug.",
  [SolidsSceneKind.Jaggery]:
    "The village yard: a pan of bubbling sugarcane juice, a metal bucket wider at the top than the bottom, and a row of jaggery moulds, each a cone with its tip cut off; Grandpa pours molasses and Mom helps.",
  [SolidsSceneKind.StallDay]:
    "Market day: the stall is busy, the table full of painted lattus, toy rockets, kulfi cones and glasses of juice; customers crowd round as Riya hands over a kulfi and Kabir a rocket, Grandpa and Mom smiling behind them.",
};

export function describeSolidsScene(s: SolidsSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const solidsScene = defineProp({
  type: "solidsScene",
  describe:
    "An illustrated story panel for the surface areas and volumes chapter, the weekend market stall: the empty stall, Grandpa's workshop with wooden lattus, Kabir painting a toy rocket, Mom's gulab jamuns in syrup, filling kulfi cones from a can, juice glasses with raised bottoms, jaggery moulds and a bucket shaped as frusta, and the busy stall on market day.",
  state: sceneState,
  defaults: { scene: SolidsSceneKind.Stall },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeSolidsScene(s),
    elements: [{ id: SolidsScenePart.Picture, value: describeSolidsScene(s) }],
  }),
  parts: () => [SolidsScenePart.Picture],
});
