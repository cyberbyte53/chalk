import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the carbon chapter's "Soap Project" arc: Riya and Kabir make handmade soap for
 * the school's Green Fair, with Mom's kitchen and Grandpa's village hand-pump along the way. A
 * fixed 320 × 180 picture, scaled; nothing to tap.
 */

export const CarbonScene = {
  GreenFair: "greenFair",
  SupplyList: "supplyList",
  NosePinPencil: "nosePinPencil",
  GasCylinder: "gasCylinder",
  BottleLabels: "bottleLabels",
  BlackPan: "blackPan",
  Vanaspati: "vanaspati",
  FruitySoap: "fruitySoap",
  HandPump: "handPump",
  FairDay: "fairDay",
} as const;
export type CarbonScene = (typeof CarbonScene)[keyof typeof CarbonScene];

export const CarbonScenePart = { Picture: "picture" } as const;
export const CARBON_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(CarbonScene) }).strict();
export type CarbonSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<CarbonScene, string>> = {
  greenFair:
    "The school notice board: a poster for the Green Fair in three weeks. Riya points at it; Kabir holds a bar of soap and grins.",
  supplyList:
    "Kabir at the table with a long list of things he used since morning (toothpaste, comb, pencil, tiffin, notebook…); Riya reads over his shoulder.",
  nosePinPencil:
    "Close-up: Mom's sparkling diamond nose-pin next to Kabir's grey pencil lead. Same element, carbon.",
  gasCylinder:
    "The kitchen: a red LPG cylinder under the counter, a hose to the gas stove with its blue flame; Mom cooks.",
  bottleLabels:
    "Three bottles on a shelf: hand sanitizer (ethanol), a bottle of vinegar, and a bottle marked with a red danger sign: methanol, poison.",
  blackPan:
    "A pan lifted off the stove: its bottom is black with soot; underneath, a yellow flame instead of a blue one. Mom frowns.",
  vanaspati:
    "A tin of vanaspati ghee, solid, beside a bottle of clear vegetable oil; Riya reads the label.",
  fruitySoap:
    "Riya holds a test tube and sniffs: a sweet, fruity smell; Kabir sniffs too and smiles.",
  handPump:
    "Grandpa's village: Kabir washes his hands under a hand-pump; the soap won't lather, and a white scum floats on the water.",
  fairDay:
    "Fair day: the Soap Project stall with neat bars of handmade soap; Riya, Kabir, Mom and Grandpa behind the table.",
};

export const describeCarbonScene = (s: CarbonSceneState): string => WORDS[s.scene];

export const carbonScene = defineProp({
  type: "carbonScene",
  describe:
    "A story panel for the carbon chapter (Riya and Kabir make handmade soap for the school's Green Fair): the fair poster, Kabir's supply list, the diamond nose-pin beside a pencil, the LPG cylinder, bottle labels (sanitizer, vinegar, methanol poison), a pan blackened by a sooty flame, vanaspati vs oil, a fruity-smelling test tube, scum at Grandpa's hand-pump, and fair day. Nothing to tap.",
  state: sceneState,
  defaults: { scene: CarbonScene.GreenFair },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeCarbonScene(s),
    elements: [{ id: CarbonScenePart.Picture, value: describeCarbonScene(s) }],
  }),
  parts: () => [CarbonScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === CarbonScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((CARBON_PICTURE.height * width) / CARBON_PICTURE.width),
        }
      : undefined,
});
