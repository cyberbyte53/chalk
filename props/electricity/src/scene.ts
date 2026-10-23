import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the electricity chapter's "the winter the bill doubled" arc: Mom's shock at
 * the bill and her deal with Riya and Kabir, Kabir's dead torch, the overhead water tank, the
 * tangle behind the switchboard, the fan regulator, the wedding fairy lights, the blown fuse,
 * the meter box and the smaller bill at the end. A fixed 320 × 180 picture, scaled; nothing to tap.
 */

export const ElectricityScene = {
  BillShock: "billShock",
  TorchDead: "torchDead",
  RoofTank: "roofTank",
  MessyWiring: "messyWiring",
  FanRegulator: "fanRegulator",
  FairyLights: "fairyLights",
  FuseBlown: "fuseBlown",
  MeterBox: "meterBox",
  BillHalved: "billHalved",
} as const;
export type ElectricityScene = (typeof ElectricityScene)[keyof typeof ElectricityScene];

export const ElectricityScenePart = { Picture: "picture" } as const;
export const SCENE_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(ElectricityScene) }).strict();
export type ElectricitySceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<ElectricityScene, string>> = {
  billShock:
    "The kitchen table on a January evening: Mom holds up the electricity bill, ₹3,240 in big red figures, twice last winter's. Riya and Kabir lean in; Grandpa, wrapped in a shawl, sits by his room heater.",
  torchDead:
    "Kabir in a dark corridor, shaking a torch that won't light. Its two cells lie on the floor beside it, and the switch is pushed on.",
  roofTank:
    "The family's house with a black water tank on the roof. A pipe runs from the tank down the wall to a tap in the courtyard, where water pours into a bucket.",
  messyWiring:
    "The switchboard in the hall opened up: a tangle of red, black and green wires behind it. Kabir tries to copy it onto paper and his drawing is a scribble; Riya holds a neat little diagram made of symbols.",
  fanRegulator:
    "A ceiling fan turning slowly, and on the wall the round knob of its regulator. Riya turns the knob up and the fan's blades blur faster.",
  fairyLights:
    "The wedding house next door at night, strung with a long chain of tiny fairy-light bulbs. The whole chain has gone dark; Grandpa, up a ladder, checks one bulb after another while Kabir points out the one with a broken filament.",
  fuseBlown:
    "The house in darkness on a cold morning: the room heater, the iron and the geyser were all on. Grandpa holds up a fuse carrier with its thin wire melted through.",
  meterBox:
    "The electricity meter in its box by the front door, digits showing the units used, and a small light blinking faster when more is switched on. Riya writes the reading in a notebook.",
  billHalved:
    "The next month at the kitchen table: Mom smiles at a much smaller bill, ₹1,650. Riya shows LED bulbs and a timer on the geyser; Kabir holds up a new cricket bat.",
};

export function describeElectricityScene(s: ElectricityScene): string {
  return WORDS[s];
}

export const electricityScene = defineProp({
  type: "electricityScene",
  describe:
    "An illustrated story panel for the electricity chapter: the doubled bill and Mom's deal, Kabir's dead torch, the roof water tank, the tangle behind the switchboard, the fan regulator, the wedding fairy lights that all went dark, the blown fuse, the meter box, and the smaller bill at the end.",
  state: sceneState,
  defaults: { scene: ElectricityScene.BillShock },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeElectricityScene(s.scene),
    elements: [{ id: ElectricityScenePart.Picture, value: describeElectricityScene(s.scene) }],
  }),
  parts: () => [ElectricityScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === ElectricityScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((SCENE_PICTURE.height * width) / SCENE_PICTURE.width),
        }
      : undefined,
  isExplainer: false,
});
