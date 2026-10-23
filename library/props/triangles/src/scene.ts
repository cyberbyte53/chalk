import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the triangles chapter: "Lights on the water tank". For Republic Day the colony
 * wants a string of lights from the top of its water tank down to the gate pillar, and a big photo
 * of the colony on the notice board. Nobody may climb the tank, so Riya and Kabir measure it with
 * shadows and similar triangles, and work out the wire with Pythagoras.
 */

export const TrianglesSceneKind = {
  NoticeBoard: "noticeBoard",
  WaterTank: "waterTank",
  PhotoShop: "photoShop",
  StickShadow: "stickShadow",
  StreetLamp: "streetLamp",
  LadderPillar: "ladderPillar",
  WireToTank: "wireToTank",
  RepublicNight: "republicNight",
} as const;
export type TrianglesSceneKind = (typeof TrianglesSceneKind)[keyof typeof TrianglesSceneKind];

export const TrianglesScenePart = { Picture: "picture" } as const;

export const TRIANGLES_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(TrianglesSceneKind) }).strict();
export type TrianglesSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<TrianglesSceneKind, string> = {
  [TrianglesSceneKind.NoticeBoard]:
    "The colony gate: a notice board says the colony will light up the water tank for Republic Day, with a string of lights from the top of the tank to the gate pillar, and asks for volunteers. Riya and Kabir read it; the tall water tank stands behind them.",
  [TrianglesSceneKind.WaterTank]:
    "The foot of the colony's water tank: a tall tank on four legs, its ladder locked. Kabir cranes his neck to see the top; Grandpa shakes his head: nobody climbs it.",
  [TrianglesSceneKind.PhotoShop]:
    "A photo shop counter: three prints of the same colony photo in different sizes, the same shape, and one print stretched sideways so the tank looks fat. Riya holds up the stretched one, frowning.",
  [TrianglesSceneKind.StickShadow]:
    "A sunny afternoon by the tank: Riya holds a stick upright on the ground and marks the end of its shadow; Kabir stretches a measuring tape along the tank's long shadow.",
  [TrianglesSceneKind.StreetLamp]:
    "Evening in the colony lane: Kabir walks away from a street lamp, his shadow stretching out in front of him along the road; Riya walks beside him with a notebook.",
  [TrianglesSceneKind.LadderPillar]:
    "The gate pillar with a lamp on top: Grandpa's ladder leans against it, its foot some way out from the pillar; Kabir steadies the ladder while Grandpa looks up.",
  [TrianglesSceneKind.WireToTank]:
    "A plan of the job: a string of lights runs straight from the top of the water tank (15 m) down to the top of the gate pillar (3 m), 16 m away along the ground. The difference in height and the distance make a right triangle with the wire as its hypotenuse.",
  [TrianglesSceneKind.RepublicNight]:
    "Republic Day night: the water tank glows with a string of lights running down to the gate pillar, the flag flies, and the family and neighbours cheer below.",
};

export function describeTrianglesScene(s: TrianglesSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const trianglesScene = defineProp({
  type: "trianglesScene",
  describe:
    "An illustrated story panel for the triangles chapter, \"Lights on the water tank\": the colony's notice asking for lights from the top of the water tank to the gate pillar on Republic Day, the tank nobody may climb, photo prints of different sizes, measuring the tank with a stick and its shadow, a person's shadow under a street lamp, Grandpa's ladder against the gate pillar, a plan of the wire from the tank to the pillar, and the lit tank on Republic Day night.",
  state: sceneState,
  defaults: { scene: TrianglesSceneKind.NoticeBoard },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeTrianglesScene(s),
    elements: [{ id: TrianglesScenePart.Picture, value: describeTrianglesScene(s) }],
  }),
  parts: () => [TrianglesScenePart.Picture],
});
